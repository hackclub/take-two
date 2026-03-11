export const STATUS_LABELS: Record<
    string,
    { label: string; short: string; color: string }
> = {
    built_verified: {
        label: "Built - Verified",
        short: "Finished builds",
        color: "bg-grub-green/20 text-grub-green",
    },
    built_needs_revision: {
        label: "Built - being revised",
        short: "Being revised",
        color: "bg-grub-yellow/20 text-grub-yellow",
    },
    design_only: {
        label: "Design Only",
        short: "Designs",
        color: "bg-grub-bg2 text-grub-fg4",
    },
};

export const STATUS_ORDER = [
    "built_verified",
    "built_needs_revision",
    "design_only",
] as const;

export function groupByStatus<T extends { status?: string }>(projects: T[]) {
    const groups: { key: string; label: string; projects: T[] }[] =
        STATUS_ORDER.map((key) => ({
            key,
            label: STATUS_LABELS[key].label,
            projects: [],
        }));
    const unknown: T[] = [];
    for (const p of projects) {
        const idx = STATUS_ORDER.indexOf(
            (p.status ?? "design_only") as (typeof STATUS_ORDER)[number],
        );
        if (idx >= 0) groups[idx].projects.push(p);
        else unknown.push(p);
    }
    if (unknown.length > 0) groups[groups.length - 1].projects.push(...unknown);
    return groups.filter((g) => g.projects.length > 0);
}
