"use client";

import { useState } from "react";

const STATUS_OPTIONS = [
    { value: "built_verified", label: "Built - Verified" },
    { value: "built_needs_revision", label: "Built - Being Revised" },
    { value: "design_only", label: "Design Only" },
] as const;

interface EditableProjectCardProps {
    projectId: string;
    initialName: string;
    initialDescription: string;
    initialDemoUrl: string;
    initialBlogUrl: string;
    initialStatus: string;
    initialImageUrl: string;
}

export function EditableProjectCard({
    projectId,
    initialName,
    initialDescription,
    initialDemoUrl,
    initialBlogUrl,
    initialStatus,
    initialImageUrl,
}: EditableProjectCardProps) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [demoUrl, setDemoUrl] = useState(initialDemoUrl);
    const [blogUrl, setBlogUrl] = useState(initialBlogUrl);
    const [status, setStatus] = useState(initialStatus);
    const [imageUrl, setImageUrl] = useState(initialImageUrl);

    const [savedName, setSavedName] = useState(initialName);
    const [savedDescription, setSavedDescription] =
        useState(initialDescription);
    const [savedDemoUrl, setSavedDemoUrl] = useState(initialDemoUrl);
    const [savedBlogUrl, setSavedBlogUrl] = useState(initialBlogUrl);
    const [savedStatus, setSavedStatus] = useState(initialStatus);
    const [savedImageUrl, setSavedImageUrl] = useState(initialImageUrl);

    const [saving, setSaving] = useState(false);

    async function saveField(field: string, value: string) {
        const res = await fetch("/api/project", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, field, value: value.trim() }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Save failed");
        }
    }

    async function handleSave() {
        const trimmedName = name.trim();
        const trimmedDesc = description.trim();
        const trimmedDemo = demoUrl.trim();
        const trimmedBlog = blogUrl.trim();
        const trimmedImage = imageUrl.trim();

        const unchanged =
            trimmedName === savedName &&
            trimmedDesc === savedDescription &&
            trimmedDemo === savedDemoUrl &&
            trimmedBlog === savedBlogUrl &&
            status === savedStatus &&
            trimmedImage === savedImageUrl;

        if (unchanged) {
            setEditing(false);
            return;
        }

        setSaving(true);
        try {
            const promises: Promise<void>[] = [];
            if (trimmedName !== savedName)
                promises.push(saveField("project name", trimmedName));
            if (trimmedDesc !== savedDescription)
                promises.push(saveField("description", trimmedDesc));
            if (trimmedDemo !== savedDemoUrl)
                promises.push(saveField("demo_url", trimmedDemo));
            if (trimmedBlog !== savedBlogUrl)
                promises.push(saveField("blog_url", trimmedBlog));
            if (status !== savedStatus)
                promises.push(saveField("status", status));
            if (trimmedImage !== savedImageUrl)
                promises.push(saveField("pictures", trimmedImage));
            await Promise.all(promises);
            setSavedName(trimmedName);
            setSavedDescription(trimmedDesc);
            setSavedDemoUrl(trimmedDemo);
            setSavedBlogUrl(trimmedBlog);
            setSavedStatus(status);
            setSavedImageUrl(trimmedImage);
            setName(trimmedName);
            setDescription(trimmedDesc);
            setDemoUrl(trimmedDemo);
            setBlogUrl(trimmedBlog);
            setImageUrl(trimmedImage);
            setEditing(false);
        } catch {
            // keep editing on failure
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setName(savedName);
        setDescription(savedDescription);
        setDemoUrl(savedDemoUrl);
        setBlogUrl(savedBlogUrl);
        setStatus(savedStatus);
        setImageUrl(savedImageUrl);
        setEditing(false);
    }

    if (!editing) {
        return (
            <>
                {savedName && (
                    <h3 className="font-semibold text-grub-fg0">{savedName}</h3>
                )}
                {savedDescription && (
                    <p className="text-sm text-grub-fg3 line-clamp-3 flex-1">
                        {savedDescription}
                    </p>
                )}
                {!savedName && !savedDescription && (
                    <p className="text-sm text-grub-fg4 italic flex-1">
                        No name or description
                    </p>
                )}
                <button
                    onClick={() => setEditing(true)}
                    className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-fg4/20 text-grub-fg4 hover:bg-grub-fg4/30 transition-colors relative z-10"
                >
                    Edit
                </button>
            </>
        );
    }

    return (
        <div
            className="space-y-2 relative z-20"
            onClick={(e) => e.stopPropagation()}
        >
            <div>
                <label className="text-xs text-grub-fg4 mb-0.5 block">
                    Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 200))}
                    maxLength={200}
                    autoFocus
                    placeholder="Project name..."
                    className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent placeholder-grub-fg4"
                />
            </div>
            <div>
                <label className="text-xs text-grub-fg4 mb-0.5 block">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value.slice(0, 1000))
                    }
                    maxLength={1000}
                    rows={3}
                    placeholder="Project description..."
                    className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent resize-none placeholder-grub-fg4"
                />
                <span className="text-xs text-grub-fg4">
                    {description.length}/1000
                </span>
            </div>
            <div>
                <label className="text-xs text-grub-fg4 mb-0.5 block">
                    Demo URL
                </label>
                <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value.slice(0, 500))}
                    maxLength={500}
                    placeholder="https://..."
                    className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent placeholder-grub-fg4"
                />
            </div>
            <div>
                <label className="text-xs text-grub-fg4 mb-0.5 block">
                    Blog URL
                </label>
                <input
                    type="url"
                    value={blogUrl}
                    onChange={(e) => setBlogUrl(e.target.value.slice(0, 500))}
                    maxLength={500}
                    placeholder="https://..."
                    className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent placeholder-grub-fg4"
                />
            </div>
            <div>
                <label className="text-xs text-grub-fg4 mb-0.5 block">
                    Image URL
                </label>
                <label className="text-xs text-grub-bg4 mb-0.5 block">
                    Should be a URL! You can use #cdn for this.
                </label>
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value.slice(0, 500))}
                    maxLength={500}
                    placeholder="https://cdn.example.com/image.png"
                    className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent placeholder-grub-fg4"
                />
            </div>
            {/* Status editing disabled for now */}
            <div className="flex gap-2 justify-end">
                <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="text-xs text-grub-fg4 hover:text-grub-fg px-2 py-1"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-xs font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 rounded px-3 py-1 disabled:opacity-50 transition-colors"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}
