import { revalidateTag } from 'next/cache'

// --- Helpers ---

/** Escape a value for use inside an Airtable filterByFormula string literal. */
function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

interface AirtableFetchOptions extends RequestInit {
  /** Next.js revalidation in seconds. Omit for no-store (writes, sync). */
  revalidate?: number
  /** Next.js cache tags for targeted revalidation. */
  tags?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function airtableFetch(tablePath: string, options?: AirtableFetchOptions): Promise<any> {
  const { revalidate, tags, ...fetchOptions } = options ?? {}

  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${tablePath}`,
    {
      ...fetchOptions,
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...(revalidate != null
        ? { next: { revalidate, tags } }
        : { cache: 'no-store' as const }),
    }
  )
  if (!res.ok) {
    throw new Error(`Airtable error: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

// --- HARDWARE_ALL ---

export interface HardwareProject {
  id: string
  recordId: string
  codeUrl?: string
  description?: string
  hoursSpent?: number
  approvedAt?: string
  screenshots?: { url: string; filename: string }[]
}

export async function getProjectsByEmail(email: string): Promise<HardwareProject[]> {
  const table = process.env.AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Email}="${escapeFormulaValue(email)}"`)

  const results: HardwareProject[] = []
  let offset: string | undefined

  do {
    const data = await airtableFetch(
      `${table}?filterByFormula=${formula}${offset ? `&offset=${offset}` : ''}`,
      { revalidate: 300, tags: ['hw-projects'] }
    )
    for (const record of data.records) {
      results.push({
        id: record.id,
        recordId: record.fields['Record ID'],
        codeUrl: record.fields['Code URL'],
        description: record.fields['Description'],
        hoursSpent: record.fields['Hours Spent'],
        approvedAt: record.fields['Approved At'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        screenshots: record.fields['Screenshot']?.map((a: any) => ({
          url: a.url,
          filename: a.filename,
        })),
      })
    }
    offset = data.offset
  } while (offset)

  return results
}

// --- Slack profile ---

export interface SlackProfile {
  displayName: string
  avatarUrl: string
}

export async function getSlackProfile(slackId: string): Promise<SlackProfile | null> {
  const res = await fetch(`https://slack.com/api/users.info?user=${encodeURIComponent(slackId)}`, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_SECRET}` },
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  if (!data.ok) return null
  return {
    displayName: data.user?.profile?.display_name || data.user?.profile?.real_name || data.user?.name || slackId,
    avatarUrl: data.user?.profile?.image_192 || data.user?.profile?.image_72 || '',
  }
}

// --- Profile data ---

export interface ProfileProject {
  id: string
  name?: string
  description?: string
  pictures?: { url: string; filename: string }[]
  codeUrl?: string
  hoursSpent?: number
  approvedAt?: string
  status?: string
}

export interface UserProfile {
  slackId: string
  username: string
  bio?: string
  projects: ProfileProject[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProjectRecords(records: any[]): ProfileProject[] {
  const projects: ProfileProject[] = []
  for (const rec of records) {
    const f = rec.fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pictures = f['pictures']?.map((a: any) => ({ url: a.url, filename: a.filename }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? f['Screenshot (from HARDWARE_ALL)']?.map((a: any) => ({ url: a.url, filename: a.filename }))

    projects.push({
      id: rec.id,
      name: f['project name'] || undefined,
      description: f['description'] || f['Description (from HARDWARE_ALL)']?.[0] || undefined,
      pictures,
      codeUrl: f['Code URL (from HARDWARE_ALL)']?.[0] || undefined,
      hoursSpent: f['Hours Spent (from HARDWARE_ALL)']?.[0] ?? undefined,
      approvedAt: f['Approved At (from HARDWARE_ALL)']?.[0] || undefined,
      status: f['status'] || undefined,
    })
  }
  return projects
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUserProfile(userRecord: any, projects: ProfileProject[]): UserProfile {
  return {
    slackId: userRecord.fields['Slack ID'],
    username: userRecord.fields['username'],
    bio: userRecord.fields['Bio'],
    projects,
  }
}

async function fetchUserProjects(projectIds: string[]): Promise<ProfileProject[]> {
  if (projectIds.length === 0) return []

  const patchTable = process.env.PATCH_AIRTABLE_TABLE_ID
  const projects: ProfileProject[] = []

  for (let i = 0; i < projectIds.length; i += 100) {
    const batch = projectIds.slice(i, i + 100)
    const orClauses = batch.map((id) => `RECORD_ID()="${id}"`).join(',')
    const formula = encodeURIComponent(`OR(${orClauses})`)
    const data = await airtableFetch(
      `${patchTable}?filterByFormula=${formula}`,
      { revalidate: 120, tags: ['user-projects'] }
    )
    projects.push(...parseProjectRecords(data.records))
  }

  return projects
}

async function getUserProfile(filterField: string, filterValue: string): Promise<UserProfile | null> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{${filterField}}="${escapeFormulaValue(filterValue)}"`)
  const data = await airtableFetch(
    `${table}?filterByFormula=${formula}&maxRecords=1`,
    { revalidate: 120, tags: ['user-profile'] }
  )

  if (data.records.length === 0) return null
  const user = data.records[0]
  const projectIds: string[] = user.fields['Projects'] ?? []
  const projects = await fetchUserProjects(projectIds)
  return buildUserProfile(user, projects)
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  return getUserProfile('username', username)
}

export async function getUserProfileBySlackId(slackId: string): Promise<UserProfile | null> {
  return getUserProfile('Slack ID', slackId)
}

export async function updateUserBio(slackId: string, bio: string): Promise<void> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Slack ID}="${escapeFormulaValue(slackId)}"`)
  const data = await airtableFetch(`${table}?filterByFormula=${formula}&maxRecords=1`)
  if (data.records.length === 0) throw new Error('User not found')
  const recordId = data.records[0].id
  await airtableFetch(`${table}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: { Bio: bio } }),
  })
  revalidateTag('user-profile')
}

// --- Browse all users ---

export interface UserSummary {
  username: string
  slackId: string
  projectCount: number
}

export async function getAllUsers(): Promise<UserSummary[]> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const results: UserSummary[] = []
  let offset: string | undefined

  do {
    const data = await airtableFetch(
      `${table}?fields[]=username&fields[]=Slack+ID&fields[]=Projects${offset ? `&offset=${offset}` : ''}`,
      { revalidate: 120, tags: ['all-users'] }
    )
    for (const rec of data.records) {
      if (rec.fields['username']) {
        results.push({
          username: rec.fields['username'],
          slackId: rec.fields['Slack ID'],
          projectCount: (rec.fields['Projects'] ?? []).length,
        })
      }
    }
    offset = data.offset
  } while (offset)

  return results
}

// --- User & Project sync ---

async function getUserBySlackId(slackId: string): Promise<{ id: string; projectIds: string[] } | null> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Slack ID}="${escapeFormulaValue(slackId)}"`)
  const data = await airtableFetch(`${table}?filterByFormula=${formula}&maxRecords=1`)

  if (data.records.length === 0) return null
  const rec = data.records[0]
  return { id: rec.id, projectIds: rec.fields['Projects'] ?? [] }
}

async function createUser(slackId: string, username: string): Promise<string> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const data = await airtableFetch(table!, {
    method: 'POST',
    body: JSON.stringify({
      fields: { 'Slack ID': slackId, username },
    }),
  })
  revalidateTag('all-users')
  return data.id
}

async function getLinkedPatchIds(projectRecordIds: string[]): Promise<Set<string>> {
  if (projectRecordIds.length === 0) return new Set()

  const table = process.env.PATCH_AIRTABLE_TABLE_ID
  const ids = new Set<string>()

  for (let i = 0; i < projectRecordIds.length; i += 100) {
    const batch = projectRecordIds.slice(i, i + 100)
    const orClauses = batch.map((id) => `RECORD_ID()="${id}"`).join(',')
    const formula = encodeURIComponent(`OR(${orClauses})`)
    const data = await airtableFetch(
      `${table}?filterByFormula=${formula}&fields[]=unified_db_record_id`
    )
    for (const rec of data.records) {
      if (rec.fields['unified_db_record_id']) {
        ids.add(rec.fields['unified_db_record_id'])
      }
    }
  }

  return ids
}

export async function syncUserProjects(
  slackId: string,
  email: string,
  username: string
): Promise<string> {
  let user = await getUserBySlackId(slackId)
  let userRecordId: string

  if (!user) {
    userRecordId = await createUser(slackId, username)
  } else {
    userRecordId = user.id
  }

  const hwProjects = await getProjectsByEmail(email)
  if (hwProjects.length === 0) return userRecordId

  if (!user) {
    user = await getUserBySlackId(slackId)
  }
  const existingPatchIds = await getLinkedPatchIds(user?.projectIds ?? [])

  const unpatched = hwProjects.filter((p) => !existingPatchIds.has(p.id))
  if (unpatched.length === 0) return userRecordId

  const table = process.env.PATCH_AIRTABLE_TABLE_ID
  for (let i = 0; i < unpatched.length; i += 10) {
    const batch = unpatched.slice(i, i + 10)
    await airtableFetch(table!, {
      method: 'POST',
      body: JSON.stringify({
        records: batch.map((p) => ({
          fields: {
            unified_db_record_id: p.id,
            status: 'design_only',
            HARDWARE_ALL: [p.id],
            Users: [userRecordId],
          },
        })),
      }),
    })
  }

  revalidateTag('user-projects')
  revalidateTag('user-profile')
  revalidateTag('all-users')

  return userRecordId
}
