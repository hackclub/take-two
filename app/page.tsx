import Link from "next/link";
import Landing from "./content/landing.mdx";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

export default async function Home() {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );
    const signedIn = !!session.email;

    return (
        <main className="max-w-4xl w-full mx-auto px-6 py-16 flex flex-col items-center">
            <article className="prose prose-gruvbox">
                <Landing />
            </article>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
                {signedIn ? (
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-5 py-2 rounded-lg transition-colors"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <a
                        href="/api/auth/login"
                        className="text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-5 py-2 rounded-lg transition-colors"
                    >
                        Sign in
                    </a>
                )}
                <Link
                    href="/docs"
                    className="text-sm font-medium text-grub-fg4 bg-grub-bg1 hover:bg-grub-bg2 px-5 py-2 rounded-lg border border-grub-bg2 transition-colors"
                >
                    Docs
                </Link>
                <Link
                    href="/gallery"
                    className="text-sm font-medium text-grub-fg4 bg-grub-bg1 hover:bg-grub-bg2 px-5 py-2 rounded-lg border border-grub-bg2 transition-colors"
                >
                    Gallery
                </Link>
                <Link
                    href="/leaderboard"
                    className="text-sm font-medium text-grub-fg4 bg-grub-bg1 hover:bg-grub-bg2 px-5 py-2 rounded-lg border border-grub-bg2 transition-colors"
                >
                    Leaderboard
                </Link>
            </div>
        </main>
    );
}
