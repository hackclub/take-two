export const SEASON = {
    number: 1,
    end: new Date("2026-04-07T23:59:59"),
};

export function formatCountdown(end: Date): string | null {
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
