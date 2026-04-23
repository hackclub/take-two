import Link from "next/link";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

const programs = [
    {
        name: "Hackpad",
        domain: "hackpad.hackclub.com",
        href: "https://hackpad.hackclub.com/",
        cardClass: "bg-[#f3ebe0] border-[#155e75]/40 hover:border-[#155e75]",
        nameClass: "font-mono font-bold text-[#155e75]",
        domainClass: "font-mono text-[#155e75]/70",
    },
    {
        name: "Stasis",
        domain: "stasis.hackclub.com",
        href: "https://stasis.hackclub.com/",
        cardClass: "bg-[#F5F3EF] border-[#E86A3A]/40 hover:border-[#E86A3A]",
        nameClass: "font-semibold text-[#3B3026] tracking-tight",
        domainClass: "font-mono text-[#E86A3A]",
    },
    {
        name: "Fallout",
        domain: "fallout.hackclub.com",
        href: "https://fallout.hackclub.com/",
        cardClass: "bg-[#edd1b0] border-[#ff7d70]/50 hover:border-[#ff7d70]",
        nameClass: "font-bold text-[#61453a]",
        domainClass: "text-[#ff7d70]",
    },
];

export default async function Home() {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );
    const signedIn = !!session.email;

    return (
        <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-semibold text-grub-fg0 tracking-tight">
                    Hardware
                </h1>
            </header>

            <div className="flex flex-col items-center gap-4 mb-12">
                {signedIn ? (
                    <Link
                        href="/dashboard"
                        className="text-base sm:text-lg font-semibold text-grub-bg bg-grub-red hover:bg-grub-red/80 px-6 sm:px-8 py-3 rounded transition-colors"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <a
                        href="/api/auth/login"
                        className="text-base sm:text-lg font-semibold text-grub-bg bg-grub-red hover:bg-grub-red/80 px-6 sm:px-8 py-3 rounded transition-colors"
                    >
                        Sign in
                    </a>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                    <Link
                        href="/docs"
                        className="text-sm font-medium text-grub-fg4 bg-grub-bg1 hover:bg-grub-bg2 px-5 py-2 rounded border border-grub-bg2 transition-colors"
                    >
                        Docs
                    </Link>
                    <Link
                        href="/gallery"
                        className="text-sm font-medium text-grub-fg4 bg-grub-bg1 hover:bg-grub-bg2 px-5 py-2 rounded border border-grub-bg2 transition-colors"
                    >
                        Gallery
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="text-sm font-medium text-grub-fg4 bg-grub-bg1 hover:bg-grub-bg2 px-5 py-2 rounded border border-grub-bg2 transition-colors"
                    >
                        Leaderboard
                    </Link>
                </div>
            </div>

            <section className="flex flex-col gap-3 w-full">
                {programs.map((p) => (
                    <a
                        key={p.name}
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center justify-between border rounded-lg px-6 py-5 transition-all hover:-translate-y-0.5 ${p.cardClass}`}
                    >
                        <div className={`text-2xl ${p.nameClass}`}>
                            {p.name}
                        </div>
                        <div
                            className={`text-xs ${p.domainClass} opacity-80 group-hover:opacity-100 transition-opacity`}
                        >
                            {p.domain} →
                        </div>
                    </a>
                ))}
            </section>
        </main>
    );
}
