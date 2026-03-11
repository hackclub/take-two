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

// --- Ranks ---

export interface Rank {
  name: string
  colorHex: string
}

/** Fetch all ranks from the Ranks table, keyed by record ID. */
async function getAllRanks(): Promise<Map<string, Rank>> {
  const table = process.env.RANKS_AIRTABLE_TABLE_ID
  const data = await airtableFetch(
    `${table}?fields[]=Name&fields[]=color_hex`,
    { revalidate: 300, tags: ['ranks'] }
  )
  const map = new Map<string, Rank>()
  for (const rec of data.records) {
    if (rec.fields['Name']) {
      map.set(rec.id, {
        name: rec.fields['Name'],
        colorHex: rec.fields['color_hex'] || '#888888',
      })
    }
  }
  return map
}

/** Resolve rank record IDs to Rank objects. */
async function resolveRanks(rankIds: string[]): Promise<Rank[]> {
  if (rankIds.length === 0) return []
  const allRanks = await getAllRanks()
  return rankIds
    .map((id) => allRanks.get(id))
    .filter((r): r is Rank => r != null)
}

// --- Profile data ---

export interface ProfileProject {
  id: string
  name?: string
  description?: string
  pictures?: { url: string; filename: string }[]
  codeUrl?: string
  approvedAt?: string
  status?: string
  ysws?: string
}

export interface UserProfile {
  slackId: string
  username: string
  bio?: string
  githubUrl?: string
  websiteUrl?: string
  ranks: Rank[]
  projects: ProfileProject[]
  leaderboardPosition?: number
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
      approvedAt: f['Approved At (from HARDWARE_ALL)']?.[0] || undefined,
      status: f['status'] || undefined,
      ysws: f['YSWS Name'] || undefined,
    })
  }
  return projects
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildUserProfile(userRecord: any, projects: ProfileProject[]): Promise<UserProfile> {
  const rankIds: string[] = userRecord.fields['Ranks'] ?? []
  const ranks = await resolveRanks(rankIds)
  const leaderboardPosition = await computeLeaderboardPosition(userRecord.fields['username'])
  return {
    slackId: userRecord.fields['Slack ID'],
    username: userRecord.fields['username'],
    bio: userRecord.fields['Bio'],
    githubUrl: userRecord.fields['github_url'] || undefined,
    websiteUrl: userRecord.fields['website_url'] || undefined,
    ranks,
    projects,
    leaderboardPosition,
  }
}

async function computeLeaderboardPosition(username: string): Promise<number | undefined> {
  const users = await getAllUsers()
  const sorted = [...users].sort(compareUsers)
  const index = sorted.findIndex((u) => u.username === username)
  return index >= 0 ? index + 1 : undefined
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
  return await buildUserProfile(user, projects)
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

export async function updateUsername(slackId: string, username: string): Promise<void> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Slack ID}="${escapeFormulaValue(slackId)}"`)
  const data = await airtableFetch(`${table}?filterByFormula=${formula}&maxRecords=1`)
  if (data.records.length === 0) throw new Error('User not found')
  const recordId = data.records[0].id
  await airtableFetch(`${table}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: { username } }),
  })
  revalidateTag('user-profile')
  revalidateTag('all-users')
}

export async function updateGithubUrl(slackId: string, githubUrl: string): Promise<void> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Slack ID}="${escapeFormulaValue(slackId)}"`)
  const data = await airtableFetch(`${table}?filterByFormula=${formula}&maxRecords=1`)
  if (data.records.length === 0) throw new Error('User not found')
  const recordId = data.records[0].id
  await airtableFetch(`${table}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: { github_url: githubUrl } }),
  })
  revalidateTag('user-profile')
}

export async function updateWebsiteUrl(slackId: string, websiteUrl: string): Promise<void> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Slack ID}="${escapeFormulaValue(slackId)}"`)
  const data = await airtableFetch(`${table}?filterByFormula=${formula}&maxRecords=1`)
  if (data.records.length === 0) throw new Error('User not found')
  const recordId = data.records[0].id
  await airtableFetch(`${table}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: { website_url: websiteUrl } }),
  })
  revalidateTag('user-profile')
}

// --- Browse all users ---

export interface UserSummary {
  username: string
  slackId: string
  projectCount: number
  statusCounts: { built_verified: number; built_needs_revision: number; design_only: number }
  ranks: Rank[]
}

export function compareUsers(a: UserSummary, b: UserSummary): number {
  if (b.statusCounts.built_verified !== a.statusCounts.built_verified)
    return b.statusCounts.built_verified - a.statusCounts.built_verified
  if (b.statusCounts.built_needs_revision !== a.statusCounts.built_needs_revision)
    return b.statusCounts.built_needs_revision - a.statusCounts.built_needs_revision
  return b.statusCounts.design_only - a.statusCounts.design_only
}

async function getProjectStatusByUser(): Promise<Map<string, { built_verified: number; built_needs_revision: number; design_only: number }>> {
  const patchTable = process.env.PATCH_AIRTABLE_TABLE_ID
  const counts = new Map<string, { built_verified: number; built_needs_revision: number; design_only: number }>()
  let offset: string | undefined

  do {
    const data = await airtableFetch(
      `${patchTable}?fields[]=status&fields[]=Users${offset ? `&offset=${offset}` : ''}`,
      { revalidate: 120, tags: ['all-projects'] }
    )
    for (const rec of data.records) {
      const userIds: string[] = rec.fields['Users'] ?? []
      const status = rec.fields['status'] || 'design_only'
      for (const userId of userIds) {
        if (!counts.has(userId)) counts.set(userId, { built_verified: 0, built_needs_revision: 0, design_only: 0 })
        const c = counts.get(userId)!
        if (status === 'built_verified') c.built_verified++
        else if (status === 'built_needs_revision') c.built_needs_revision++
        else c.design_only++
      }
    }
    offset = data.offset
  } while (offset)

  return counts
}

export async function getAllUsers(): Promise<UserSummary[]> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const [allRanks, statusByUser] = await Promise.all([getAllRanks(), getProjectStatusByUser()])
  const results: UserSummary[] = []
  let offset: string | undefined

  do {
    const data = await airtableFetch(
      `${table}?fields[]=username&fields[]=Slack+ID&fields[]=Projects&fields[]=Ranks${offset ? `&offset=${offset}` : ''}`,
      { revalidate: 120, tags: ['all-users'] }
    )
    for (const rec of data.records) {
      if (rec.fields['username']) {
        const rankIds: string[] = rec.fields['Ranks'] ?? []
        const sc = statusByUser.get(rec.id) ?? { built_verified: 0, built_needs_revision: 0, design_only: 0 }
        results.push({
          username: rec.fields['username'],
          slackId: rec.fields['Slack ID'],
          projectCount: sc.built_verified + sc.built_needs_revision + sc.design_only,
          statusCounts: sc,
          ranks: rankIds
            .map((id) => allRanks.get(id))
            .filter((r): r is Rank => r != null),
        })
      }
    }
    offset = data.offset
  } while (offset)

  return results
}

// --- Gallery: all projects (patch-first, fallback to HARDWARE_ALL) ---

export interface GalleryProject extends ProfileProject {
  ownerUsername?: string
  ownerSlackId?: string
}

export async function getAllProjects(): Promise<GalleryProject[]> {
  const patchTable = process.env.PATCH_AIRTABLE_TABLE_ID
  const results: GalleryProject[] = []
  let offset: string | undefined

  do {
    const data = await airtableFetch(
      `${patchTable}?${offset ? `offset=${offset}` : ''}`,
      { revalidate: 120, tags: ['all-projects'] }
    )
    for (const rec of data.records) {
      const f = rec.fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pictures = f['pictures']?.map((a: any) => ({ url: a.url, filename: a.filename }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?? f['Screenshot (from HARDWARE_ALL)']?.map((a: any) => ({ url: a.url, filename: a.filename }))

      results.push({
        id: rec.id,
        name: f['project name'] || undefined,
        description: f['description'] || f['Description (from HARDWARE_ALL)']?.[0] || undefined,
        pictures,
        codeUrl: f['Code URL (from HARDWARE_ALL)']?.[0] || undefined,
        approvedAt: f['Approved At (from HARDWARE_ALL)']?.[0] || undefined,
        status: f['status'] || undefined,
        ysws: f['YSWS Name'] || undefined,
        ownerUsername: f['username (from Users)']?.[0] || undefined,
        ownerSlackId: f['Slack ID (from Users)']?.[0] || undefined,
      })
    }
    offset = data.offset
  } while (offset)

  return results
}

// --- User & Project sync ---

async function getUserBySlackId(slackId: string): Promise<{ id: string; projectIds: string[]; emails: string } | null> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const formula = encodeURIComponent(`{Slack ID}="${escapeFormulaValue(slackId)}"`)
  const data = await airtableFetch(`${table}?filterByFormula=${formula}&maxRecords=1`)

  if (data.records.length === 0) return null
  const rec = data.records[0]
  return { id: rec.id, projectIds: rec.fields['Projects'] ?? [], emails: rec.fields['emails'] ?? '' }
}

async function createUser(slackId: string, username: string, email: string): Promise<string> {
  const table = process.env.USER_AIRTABLE_TABLE_ID
  const data = await airtableFetch(table!, {
    method: 'POST',
    body: JSON.stringify({
      fields: { 'Slack ID': slackId, username, emails: email },
    }),
  })
  revalidateTag('all-users')
  return data.id
}

/** Ensure the login email is present in the user's emails field. */
async function ensureEmailInList(userRecordId: string, currentEmails: string, email: string): Promise<string> {
  const emailList = currentEmails.split('\n').map((e) => e.trim()).filter(Boolean)
  if (emailList.includes(email)) return currentEmails
  emailList.push(email)
  const updated = emailList.join('\n')
  const table = process.env.USER_AIRTABLE_TABLE_ID
  await airtableFetch(`${table}/${userRecordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: { emails: updated } }),
  })
  return updated
}

/** Parse emails field into a list of emails. */
function parseEmails(emails: string): string[] {
  return emails.split('\n').map((e) => e.trim()).filter(Boolean)
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

/** Try to extract project title from the first heading in README.md of a GitHub repo. */
async function extractTitleFromRepo(codeUrl: string): Promise<string | undefined> {
  try {
    // Only match direct repo URLs: github.com/owner/repo (not /pull/, /issues/, /tree/, etc.)
    const match = codeUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/)
    if (!match) return undefined
    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '')

    for (const branch of ['main', 'master']) {
      for (const filename of ['README.md', 'readme.md', 'Readme.md']) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${cleanRepo}/${branch}/${filename}`
        const res = await fetch(rawUrl, { cache: 'no-store' })
        if (!res.ok) continue

        const text = await res.text()

        // Try markdown heading first: # Title
        const mdMatch = text.match(/^#\s+(.+)$/m)
        if (mdMatch) return mdMatch[1].trim().slice(0, 200)

        // Try HTML heading: <h1>Title</h1> or <h2>Title</h2>
        const htmlMatch = text.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i)
        if (htmlMatch) return htmlMatch[1].trim().slice(0, 200)

        // Found a README but no heading
        return undefined
      }
    }
  } catch {
    // Silently fail — leave title blank
  }
  return undefined
}

async function backfillPatchTitles(patchIds: string[], hwProjects: HardwareProject[]): Promise<void> {
  if (patchIds.length === 0) return

  const patchTable = process.env.PATCH_AIRTABLE_TABLE_ID
  const hwByRecordId = new Map(hwProjects.map((p) => [p.id, p]))

  // Fetch existing patches that have no project name
  const toBackfill: { patchId: string; codeUrl: string }[] = []

  for (let i = 0; i < patchIds.length; i += 100) {
    const batch = patchIds.slice(i, i + 100)
    const orClauses = batch.map((id) => `RECORD_ID()="${id}"`).join(',')
    const formula = encodeURIComponent(`AND(OR(${orClauses}),{project name}="")`)
    const data = await airtableFetch(
      `${patchTable}?filterByFormula=${formula}&fields[]=unified_db_record_id&fields[]=project+name`
    )
    for (const rec of data.records) {
      const hwId = rec.fields['unified_db_record_id']
      const hw = hwByRecordId.get(hwId)
      if (hw?.codeUrl) {
        toBackfill.push({ patchId: rec.id, codeUrl: hw.codeUrl })
      }
    }
  }

  if (toBackfill.length === 0) return

  // Extract titles in parallel
  const titles = await Promise.all(
    toBackfill.map((p) => extractTitleFromRepo(p.codeUrl))
  )

  // Batch update patches that got a title
  const updates = toBackfill
    .map((p, i) => titles[i] ? { id: p.patchId, fields: { 'project name': titles[i] } } : null)
    .filter(Boolean)

  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10)
    await airtableFetch(patchTable!, {
      method: 'PATCH',
      body: JSON.stringify({ records: batch }),
    })
  }
}

export async function syncUserProjects(
  slackId: string,
  email: string,
  username: string
): Promise<string> {
  let user = await getUserBySlackId(slackId)
  let userRecordId: string
  let emails: string

  if (!user) {
    userRecordId = await createUser(slackId, username, email)
    emails = email
  } else {
    userRecordId = user.id
    emails = await ensureEmailInList(user.id, user.emails, email)
  }

  // Fetch projects for all emails in the list
  const emailList = parseEmails(emails)
  const projectsByEmail = await Promise.all(emailList.map((e) => getProjectsByEmail(e)))
  const allHwProjects = projectsByEmail.flat()

  // Deduplicate by record ID
  const seen = new Set<string>()
  const hwProjects = allHwProjects.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  if (hwProjects.length === 0) return userRecordId

  if (!user) {
    user = await getUserBySlackId(slackId)
  }
  const existingPatchIds = await getLinkedPatchIds(user?.projectIds ?? [])

  // Backfill titles for existing patches that have no project name
  await backfillPatchTitles(user?.projectIds ?? [], hwProjects)

  const unpatched = hwProjects.filter((p) => !existingPatchIds.has(p.id))
  if (unpatched.length === 0) return userRecordId

  // Try to extract titles from README.md for each project
  const titles = await Promise.all(
    unpatched.map((p) =>
      p.codeUrl ? extractTitleFromRepo(p.codeUrl) : Promise.resolve(undefined)
    )
  )

  const table = process.env.PATCH_AIRTABLE_TABLE_ID
  for (let i = 0; i < unpatched.length; i += 10) {
    const batch = unpatched.slice(i, i + 10)
    await airtableFetch(table!, {
      method: 'POST',
      body: JSON.stringify({
        records: batch.map((p, j) => ({
          fields: {
            unified_db_record_id: p.id,
            status: 'design_only',
            HARDWARE_ALL: [p.id],
            Users: [userRecordId],
            ...(titles[i + j] ? { 'project name': titles[i + j] } : {}),
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
