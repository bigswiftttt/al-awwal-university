import { createClient } from "@/lib/supabase/server";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/announcements";

export default async function AnnouncementsPage() {
    const supabase = await createClient();

    const [{ data: announcements, error }, { data: faculties }] =
        await Promise.all([
            supabase
                .from("announcements")
                .select("id, title, body, target_role, target_faculty_id, created_at, faculties(name)")
                .order("created_at", { ascending: false }),
            supabase.from("faculties").select("id, name").order("name"),
        ]);

    function facultyName(id: string | null) {
        if (!id) return null;
        return faculties?.find((f) => f.id === id)?.name;
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    Announcements
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Post announcements targeted to everyone, students, lecturers, or a
                    specific faculty.
                </p>
            </div>

            <form
                action={createAnnouncement}
                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col gap-3 mb-6"
            >
                <input
                    name="title"
                    required
                    placeholder="Announcement title"
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                    name="body"
                    required
                    rows={3}
                    placeholder="Announcement body"
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Audience
                        </label>
                        <select
                            name="target_role"
                            defaultValue="all"
                            className="h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Everyone</option>
                            <option value="student">Students only</option>
                            <option value="lecturer">Lecturers only</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Faculty (optional)
                        </label>
                        <select
                            name="target_faculty_id"
                            defaultValue=""
                            className="h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All faculties</option>
                            {faculties?.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md"
                    >
                        Post Announcement
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading announcements: {error.message}
                </div>
            )}

            {!announcements || announcements.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    No announcements posted yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((a) => {
                        const faculty = a.faculties as { name?: string } | null;
                        return (
                            <div
                                key={a.id}
                                className="bg-surface border border-outline-variant rounded-lg p-4 flex items-start justify-between gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-label-md text-label-md text-on-surface font-medium">
                                            {a.title}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-highest text-secondary capitalize">
                                            {a.target_role === "all" ? "Everyone" : a.target_role}
                                            {faculty?.name ? ` — ${faculty.name}` : ""}
                                        </span>
                                    </div>
                                    <p className="font-body-sm text-body-sm text-secondary">
                                        {a.body}
                                    </p>
                                    <p className="font-label-sm text-label-sm text-outline mt-2">
                                        {a.created_at
                                            ? new Date(a.created_at).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                              })
                                            : "Unknown date"}
                                    </p>
                                </div>
                                <form action={deleteAnnouncement.bind(null, a.id)}>
                                    <button
                                        type="submit"
                                        className="text-secondary hover:text-error transition-colors p-1"
                                        title="Delete announcement"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            delete
                                        </span>
                                    </button>
                                </form>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}