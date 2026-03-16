import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import Link from "next/link";
import { SessionData, sessionOptions } from "@/lib/session";
import { SEASON, formatCountdown } from "@/lib/config";
import { Logo } from "./Logo";

export async function Nav() {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );
    const signedIn = !!session.email;

    return (
        <nav className="sticky top-0 z-50 bg-grub-bg/80 backdrop-blur-sm border-b border-grub-bg2">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://assets.hackclub.com/flag-orpheus-top.svg"
                        alt="Hack Club"
                        className="h-14 -mt-[1px] self-start"
                    />
                    <Logo />
                </div>
                <div className="flex items-center gap-6">
                    {formatCountdown(SEASON.end) && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-grub-red/20 text-grub-red">
                            S{SEASON.number} ends in {formatCountdown(SEASON.end)}
                        </span>
                    )}
                    <Link
                        href="/gallery"
                        className="text-sm font-medium text-grub-fg4 hover:text-grub-fg transition-colors"
                    >
                        Gallery
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="text-sm font-medium text-grub-fg4 hover:text-grub-fg transition-colors"
                    >
                        Leaderboard
                    </Link>
                    <Link
                        href="/docs"
                        className="text-sm font-medium text-grub-bg bg-grub-green hover:bg-grub-green/80 px-4 py-1.5 rounded-lg transition-colors"
                    >
                        Docs
                    </Link>
                    {signedIn ? (
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-4 py-1.5 rounded-lg transition-colors"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <a
                            href="/api/auth/login"
                            className="text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-4 py-1.5 rounded-lg transition-colors"
                        >
                            Sign in
                        </a>
                    )}
                </div>
            </div>
        </nav>
    );
}
