import { createClient } from "@/lib/supabase/server";
import { deleteCourse } from "@/lib/actions/courses";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string;
        department?: string;
        level?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();
    const page = Math.max(1, Number(params.page) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from("courses")
        .select(
            `id, code, title, credits, level,
       departments!inner(id, name, faculties!inner(name))`,
            { count: "exact" }
        )
        .order("code")
        .range(from, to);

    if (params.q) {
        query = query.or(`code.ilike.%${params.q}%,title.ilike.%${params.q}%`);
    }
    if (params.department) {
        query = query.eq("department_id", params.department);
    }
    if (params.level) {
        query = query.eq("level", Number(params.level));
    }

    const [{ data: courses, count, error: coursesError }, { data: departments }] =
        await Promise.all([
            query,
            supabase.from("departments").select("id, name").order("name"),
        ]);

    if (coursesError) {
        console.error("Courses query failed:", coursesError);
    }

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    function buildUrl(overrides: Record<string, string | undefined>) {
        const next = new URLSearchParams();
        const merged = { ...params, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) next.set(k, v);
        });
        return `/admin/courses?${next.toString()}`;
    }

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                        Course Catalog
                    </h1>
                    <p className="font-body-sm text-body-sm text-secondary">
                        Manage all courses offered across departments.
                    </p>
                </div>
                <Link
                    href="/admin/courses/new"
                    className="bg-primary text-on-primary px-6 py-3 rounded flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="font-label-md text-label-md">Add Course</span>
                </Link>
            </div>

            <form className="bg-surface rounded-lg border border-outline-variant p-3 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        search
                    </span>
                    <input
                        type="text"
                        name="q"
                        defaultValue={params.q}
                        placeholder="Search by Code or Title"
                        className="w-full h-10 pl-10 pr-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none font-body-sm text-body-sm placeholder:text-outline transition-shadow"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        name="department"
                        defaultValue={params.department ?? ""}
                        className="h-10 bg-surface-container-lowest border border-outline-variant rounded px-3 font-label-md text-label-md text-on-surface focus:border-primary focus:outline-none"
                    >
                        <option value="">All Departments</option>
                        {departments?.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="level"
                        defaultValue={params.level ?? ""}
                        className="h-10 bg-surface-container-lowest border border-outline-variant rounded px-3 font-label-md text-label-md text-on-surface focus:border-primary focus:outline-none"
                    >
                        <option value="">All Levels</option>
                        {[100, 200, 300, 400, 500].map((l) => (
                            <option key={l} value={l}>
                                {l} Level
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md whitespace-nowrap"
                    >
                        Apply
                    </button>
                </div>
            </form>

            {coursesError && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading courses: {coursesError.message}
                </div>
            )}

            <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant">
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Credits
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Level
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                            {courses && courses.length > 0 ? (
                                courses.map((c) => {
                                    const department = c.departments as {
                                        name?: string;
                                        faculties?: { name?: string };
                                    } | null;
                                    return (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-surface-container-low h-12 transition-colors"
                                        >
                                            <td className="px-4 py-2 tabular-nums text-primary font-medium">
                                                {c.code}
                                            </td>
                                            <td className="px-4 py-2">{c.title}</td>
                                            <td className="px-4 py-2 tabular-nums">{c.credits}</td>
                                            <td className="px-4 py-2 tabular-nums">{c.level}</td>
                                            <td className="px-4 py-2">
                                                {department?.name ?? "—"}
                                                {department?.faculties?.name
                                                    ? ` — ${department.faculties.name}`
                                                    : ""}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/courses/${c.id}/edit`}
                                                        className="text-secondary hover:text-primary transition-colors p-1"
                                                        title="Edit course"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            edit
                                                        </span>
                                                    </Link>
                                                    <form
                                                        action={deleteCourse.bind(null, c.id)}
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-secondary hover:text-error transition-colors p-1"
                                                            title="Delete course"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                    >
                                        No courses match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-secondary">
                        Showing {courses?.length ? from + 1 : 0} to{" "}
                        {from + (courses?.length ?? 0)} of {count ?? 0} entries
                    </span>
                    <div className="flex items-center gap-2">
                        <Link
                            href={buildUrl({ page: String(Math.max(1, page - 1)) })}
                            aria-disabled={page <= 1}
                            className={`w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container-high ${page <= 1 ? "pointer-events-none opacity-50" : ""
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                chevron_left
                            </span>
                        </Link>
                        <span className="font-label-md text-label-md text-on-surface px-2">
                            Page {page} of {totalPages}
                        </span>
                        <Link
                            href={buildUrl({
                                page: String(Math.min(totalPages, page + 1)),
                            })}
                            aria-disabled={page >= totalPages}
                            className={`w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container-high ${page >= totalPages ? "pointer-events-none opacity-50" : ""
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                chevron_right
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}