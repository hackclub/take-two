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
import { EditableEmails } from "@/app/components/EditableEmails";
import { EditableProjectCard } from "@/app/components/EditableProjectCard";
import { safeHref } from "@/lib/sanitize";
import { proxyImageUrl } from "@/lib/image";
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

    const codeUrl = safeHref(project.codeUrl);
    const demoUrl = safeHref(project.demoUrl);
    const blogUrl = safeHref(project.blogUrl);
    const cardUrl = codeUrl || demoUrl;

    return (
        <div
            className={`relative bg-grub-bg1 rounded-md border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${isVerified ? "border-grub-green/50 shadow-lg shadow-grub-green/20 ring-1 ring-grub-green/20 hover:border-grub-green hover:shadow-xl hover:shadow-grub-green/30" : "border-grub-bg2 hover:border-grub-bg4 hover:shadow-lg hover:shadow-grub-bg/50"}`}
        >
            {cardUrl && (
                <a
                    href={cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-0"
                />
            )}
            {image && (
                <div className="aspect-video bg-grub-bg2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={proxyImageUrl(image.url)}
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

                <p className="text-xs text-grub-fg4/50 font-mono relative z-10 select-all">
                    {project.id}
                </p>

                <EditableProjectCard
                    projectId={project.id}
                    initialName={project.name ?? ""}
                    initialDescription={project.description ?? ""}
                    initialDemoUrl={project.demoUrl ?? ""}
                    initialBlogUrl={project.blogUrl ?? ""}
                    initialStatus={project.status ?? "design_only"}
                    initialImageUrl={project.pictures?.[0]?.url ?? ""}
                />

                <div className="flex flex-wrap gap-2 relative z-10">
                    {codeUrl && (
                        <a
                            href={codeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-blue/20 text-grub-blue hover:bg-grub-blue/30 transition-colors"
                        >
                            View Repo
                        </a>
                    )}
                    {demoUrl && (
                        <a
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-purple/20 text-grub-purple hover:bg-grub-purple/30 transition-colors"
                        >
                            Demo
                        </a>
                    )}
                    {blogUrl && (
                        <a
                            href={blogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-yellow/20 text-grub-yellow hover:bg-grub-yellow/30 transition-colors"
                        >
                            Blog
                        </a>
                    )}
                </div>
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
    const emails = profile?.emails ?? "";

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="text-3xl font-semibold text-grub-fg0 -pb-8 -mb-6">
                <h1>Dashboard</h1>
            </div>
            <div>
                <p className="text-md text-grub-fg4 pb-4 italic">
                    Here's what's poppin!
                </p>
                <p className="text-md text-grub-fg4">
                    If it's your first time, you probably want to check out{" "}
                    <a
                        href="/docs"
                        className="text-grub-blue hover:underline font-semibold"
                    >
                        the info page.
                    </a>
                </p>
            </div>
            <header className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    {slackProfile?.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={proxyImageUrl(slackProfile.avatarUrl)}
                            alt={slackProfile.displayName}
                            className="w-14 h-14 rounded-full border border-grub-bg3"
                        />
                    )}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-grub-fg0">
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
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
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

            <div className="max-w-full space-y-4 flex flex-row justify-between">
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
                <div>
                    <p className="text-xs font-medium text-grub-fg4 uppercase tracking-wide mb-1">
                        Additional Emails
                    </p>
                    <EditableEmails initialEmails={emails} />
                </div>
            </div>

            <section className="space-y-6">
                <h2 className="text-lg font-semibold text-grub-fg0">
                    Projects
                </h2>
                {projects.length === 0 ? (
                    <div className="text-center py-16 text-grub-fg4">
                        <p className="text-lg">
                            You don't have any hardware projects!
                        </p>
                    </div>
                ) : (
                    groupByStatus(projects).map((group) => (
                        <div key={group.key} className="space-y-3">
                            <h3 className="text-sm font-medium text-grub-fg4 uppercase tracking-wide">
                                {group.label}
                                <span className="ml-2 text-grub-fg4/60">
                                    {group.projects.length}
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}
