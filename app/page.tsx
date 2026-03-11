import Landing from "./content/landing.mdx";

export default function Home() {
    return (
        <main className="max-w-4xl w-full mx-auto px-6 py-16 flex justify-center">
            <article className="prose prose-gruvbox">
                <Landing />
            </article>
        </main>
    );
}
