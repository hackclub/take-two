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
        <div className="max-w-5xl mx-auto px-6 py-8 flex gap-10">
            <aside className="hidden md:block w-48 shrink-0">
                <nav className="sticky top-20 space-y-1">
                    {PAGES.map((page) => (
                        <Link
                            key={page.href}
                            href={page.href}
                            className="block text-sm py-1.5 px-3 rounded-lg text-grub-fg4 hover:text-grub-fg hover:bg-grub-bg1 transition-colors"
                        >
                            {page.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <article className="prose prose-gruvbox min-w-0 flex-1">
                {children}
            </article>
        </div>
    );
}
