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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    design_only: { label: "Design Only", color: "bg-grub-bg2 text-grub-fg4" },
    in_progress: { label: "In Progress", color: "bg-grub-blue/20 text-grub-blue" },
    completed: { label: "Completed", color: "bg-grub-green/20 text-grub-green" },
    approved: { label: "Approved", color: "bg-grub-aqua/20 text-grub-aqua" },
};

function ProjectCard({ project }: { project: ProfileProject }) {
    const image = project.pictures?.[0];
    const status = project.status
        ? (STATUS_LABELS[project.status] ?? {
              label: project.status,
              color: "bg-grub-bg2 text-grub-fg4",
          })
        : null;

    return (
        <div className="bg-grub-bg1 rounded-xl border border-grub-bg2 overflow-hidden flex flex-col">
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
                {status && (
                    <span
                        className={`inline-block self-start text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}
                    >
                        {status.label}
                    </span>
                )}

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
                        className="text-sm font-medium text-grub-blue hover:underline"
                    >
                        View Code →
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

            <div className="max-w-md">
                <p className="text-xs font-medium text-grub-fg4 uppercase tracking-wide mb-1">
                    Bio
                </p>
                <EditableBio initialBio={bio} />
            </div>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-grub-fg0">
                    Projects
                </h2>
                {projects.length === 0 ? (
                    <div className="text-center py-16 text-grub-fg4">
                        <p className="text-lg">No projects yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
