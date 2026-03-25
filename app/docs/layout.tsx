import Link from "next/link";

const PAGES = [
    { href: "/docs/", label: "Overview" },
    // { href: "/docs/submitting", label: "Submitting" },
    { href: "/docs/rewards", label: "Rewards" },
    { href: "/docs/faq", label: "FAQ" },
];

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-6 md:gap-10">
            <nav className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-none">
                {PAGES.map((page) => (
                    <Link
                        key={page.href}
                        href={page.href}
                        className="whitespace-nowrap text-sm py-1.5 px-3 rounded text-grub-fg4 hover:text-grub-fg bg-grub-bg1 border border-grub-bg2 transition-colors"
                    >
                        {page.label}
                    </Link>
                ))}
            </nav>
            <aside className="hidden md:block w-52 shrink-0">
                <nav className="sticky top-20 space-y-0.5 bg-grub-bg1 border border-grub-bg2 rounded-md p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-grub-fg4 mb-3">
                        Documentation
                    </p>
                    {PAGES.map((page) => (
                        <Link
                            key={page.href}
                            href={page.href}
                            className="block text-sm py-2 px-3 rounded text-grub-fg4 hover:text-grub-fg0 hover:bg-grub-bg2 transition-colors"
                        >
                            {page.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <article className="prose prose-gruvbox min-w-0 flex-1 pb-16">
                {children}
            </article>
        </div>
    );
}
