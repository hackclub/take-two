import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionData, sessionOptions } from "@/lib/session";
import {
    getUserProfileBySlackId,
    getSlackProfile,
    ProfileProject,
} from "@/lib/airtable";
import { SyncButton } from "@/app/components/SyncButton";
import { EditableBio } from "@/app/components/EditableBio";
import { EditableUsername } from "@/app/components/EditableUsername";
import { RankBadges } from "@/app/components/RankBadge";
import { ShareButton } from "@/app/components/ShareButton";
import { EditableGithub } from "@/app/components/EditableGithub";
import { EditableWebsite } from "@/app/components/EditableWebsite";
import { STATUS_LABELS, groupByStatus } from "@/lib/status";

function ProjectCard({ project }: { project: ProfileProject }) {
    const image = project.pictures?.[0];
    const status = project.status
        ? (STATUS_LABELS[project.status] ?? {
              label: project.status,
              color: "bg-grub-bg2 text-grub-fg4",
          })
        : null;

    const isVerified = project.status === "built_verified";

    return (
        <div className={`bg-grub-bg1 rounded-xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${isVerified ? "border-grub-green/50 shadow-lg shadow-grub-green/20 ring-1 ring-grub-green/20 hover:border-grub-green hover:shadow-xl hover:shadow-grub-green/30" : "border-grub-bg2 hover:border-grub-bg4 hover:shadow-lg hover:shadow-grub-bg/50"}`}>
            {image && (
                <div className="aspect-video bg-grub-bg2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="p-5 space-y-3 flex flex-col flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {status && (
                        <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}
                        >
                            {status.label}
                        </span>
                    )}
                    {project.ysws && (
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-grub-purple/20 text-grub-purple">
                            {project.ysws}
                        </span>
                    )}
                </div>

                {project.name && (
                    <h3 className="font-semibold text-grub-fg0">
                        {project.name}
                    </h3>
                )}

                {project.description && (
                    <p className="text-sm text-grub-fg3 line-clamp-3 flex-1">
                        {project.description}
                    </p>
                )}

                {project.codeUrl && (
                    <a
                        href={project.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block self-start text-xs font-medium px-3 py-1 rounded-full bg-grub-blue/20 text-grub-blue hover:bg-grub-blue/30 transition-colors"
                    >
                        View Repo
                    </a>
                )}
            </div>
        </div>
    );
}

export default async function Dashboard() {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );
    if (!session.email) redirect("/");

    const [profile, slackProfile] = await Promise.all([
        session.slackId ? getUserProfileBySlackId(session.slackId) : null,
        session.slackId ? getSlackProfile(session.slackId) : null,
    ]);

    const projects = profile?.projects ?? [];
    const bio = profile?.bio ?? "";
    const githubUrl = profile?.githubUrl ?? "";
    const websiteUrl = profile?.websiteUrl ?? "";

    return (
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
            <div className="text-3xl font-bold text-grub-fg0">
                <h1>Dashboard</h1>
            </div>
            <header className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    {slackProfile?.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={slackProfile.avatarUrl}
                            alt={slackProfile.displayName}
                            className="w-14 h-14 rounded-full border border-grub-bg3"
                        />
                    )}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-grub-fg0">
                            {slackProfile?.displayName ?? session.name}
                        </h1>
                        {profile?.ranks && <RankBadges ranks={profile.ranks} />}
                        {profile?.username && (
                            <EditableUsername
                                initialUsername={profile.username}
                            />
                        )}
                        <p className="text-sm text-grub-fg4">{session.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {profile?.username && (
                        <ShareButton username={profile.username} />
                    )}
                    <SyncButton />
                    {process.env.NODE_ENV !== "production" && (
                        <a
                            href="/admin/impersonate"
                            className="text-xs font-medium px-2 py-1 bg-grub-yellow/20 text-grub-yellow rounded-full hover:bg-grub-yellow/30 transition-colors"
                        >
                            Impersonate
                        </a>
                    )}
                    <a
                        href="/api/auth/logout"
                        className="text-sm text-grub-fg4 hover:text-grub-fg underline"
                    >
                        Sign out
                    </a>
                </div>
            </header>

            <div className="max-w-md space-y-4">
                <div>
                    <p className="text-xs font-medium text-grub-fg4 uppercase tracking-wide mb-1">
                        Bio
                    </p>
                    <EditableBio initialBio={bio} />
                </div>
                <div>
                    <p className="text-xs font-medium text-grub-fg4 uppercase tracking-wide mb-1">
                        GitHub
                    </p>
                    <EditableGithub initialUrl={githubUrl} />
                </div>
                <div>
                    <p className="text-xs font-medium text-grub-fg4 uppercase tracking-wide mb-1">
                        Website
                    </p>
                    <EditableWebsite initialUrl={websiteUrl} />
                </div>
            </div>

            <section className="space-y-6">
                <h2 className="text-lg font-semibold text-grub-fg0">
                    Projects
                </h2>
                {projects.length === 0 ? (
                    <div className="text-center py-16 text-grub-fg4">
                        <p className="text-lg">No projects yet</p>
                    </div>
                ) : (
                    groupByStatus(projects).map((group) => (
                        <div key={group.key} className="space-y-3">
                            <h3 className="text-sm font-medium text-grub-fg4 uppercase tracking-wide">
                                {group.label}
                                <span className="ml-2 text-grub-fg4/60">{group.projects.length}</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.projects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}
