import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import Link from "next/link";
import { SessionData, sessionOptions } from "@/lib/session";
import { SEASON, formatCountdown } from "@/lib/config";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export async function Nav() {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );
    const signedIn = !!session.email;
    const countdown = formatCountdown(SEASON.end);
    const seasonBadge = countdown
        ? `S${SEASON.number} ends in ${countdown}`
        : null;

    return (
        <nav className="sticky top-0 z-50 bg-grub-bg/80 backdrop-blur-sm border-b border-grub-bg2">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://assets.hackclub.com/flag-orpheus-top.svg"
                        alt="Hack Club"
                        className="h-14 -mt-[1px] self-start"
                    />
                    <Logo />
                </div>
                <div className="hidden md:flex items-center gap-4">
                    {seasonBadge && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-grub-red/20 text-grub-red">
                            {seasonBadge}
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
                        className="text-sm font-medium text-grub-bg bg-grub-green hover:bg-grub-green/80 px-4 -mx-1 py-1.5 rounded transition-colors"
                    >
                        Info
                    </Link>
                    {signedIn ? (
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-4 -mx-1 py-1.5 rounded transition-colors"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <a
                            href="/api/auth/login"
                            className="text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-4 py-1.5 rounded transition-colors"
                        >
                            Sign in
                        </a>
                    )}
                    <Link
                        href="/settings"
                        className="text-grub-fg4 hover:text-grub-fg transition-colors"
                        title="Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </Link>
                </div>
                <MobileMenu signedIn={signedIn} seasonBadge={seasonBadge} />
            </div>
        </nav>
    );
}
