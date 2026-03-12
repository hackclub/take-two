import { getAllUsers, getSlackProfile, compareUsers } from "@/lib/airtable";
import { LeaderboardList } from "@/app/components/LeaderboardList";

export const revalidate = 300; // 5 minutes

// ← Set the season end date here
const SEASON_END = new Date("2026-03-31T23:59:59");

function formatCountdown(end: Date): string | null {
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    if (weeks > 0 && rem > 0)
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ${rem} ${rem === 1 ? "day" : "days"}`;
    if (weeks > 0) return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    return `${days} ${days === 1 ? "day" : "days"}`;
}

const PER_PAGE = 10;

export default async function LeaderboardPage() {
    const users = await getAllUsers();
    const sorted = [...users].sort(compareUsers);

    // Only resolve Slack profiles for the first page
    const firstPageUsers = sorted.slice(0, PER_PAGE);
    const profiles = await Promise.all(
        firstPageUsers.map(async (user) => {
            const slack = await getSlackProfile(user.slackId);
            return {
                username: user.username,
                statusCounts: user.statusCounts,
                ranks: user.ranks,
                avatarUrl: slack?.avatarUrl,
                displayName: slack?.displayName,
            };
        }),
    );

    const initialData = {
        users: profiles,
        page: 1,
        totalPages: Math.max(1, Math.ceil(sorted.length / PER_PAGE)),
        total: sorted.length,
    };

    return (
        <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-grub-fg0">
                    Leaderboard
                </h1>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-grub-fg4">
                        {sorted.length}{" "}
                        {sorted.length === 1 ? "hacker" : "hackers"}
                    </p>
                    {formatCountdown(SEASON_END) && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-grub-red/20 text-grub-red">
                            Season ends in {formatCountdown(SEASON_END)}
                        </span>
                    )}
                </div>
            </div>

            {sorted.length === 0 ? (
                <div className="text-center py-16 text-grub-fg4">
                    <p className="text-lg">No members yet</p>
                </div>
            ) : (
                <LeaderboardList initialData={initialData} />
            )}
        </main>
    );
}
