import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function LecturersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; department?: string; page?: string }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();
    const page = Math.max(1, Number(params.page) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from("lecturers")
        .select(
            `id, staff_id, title,
       profiles!inner(full_name, email),
       departments!inner(id, name, faculties!inner(name))`,
            { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

    if (params.q) {
        const { data: matchingProfiles } = await supabase
            .from("profiles")
            .select("id")
            .ilike("full_name", `%${params.q}%`);
        const profileIds = matchingProfiles?.map((p) => p.id) ?? [];
        const idList =
            profileIds.length > 0
                ? profileIds.join(",")
                : "00000000-0000-0000-0000-000000000000";
        query = query.or(
            `staff_id.ilike.%${params.q}%,profile_id.in.(${idList})`
        );
    }
    if (params.department) {
        query = query.eq("department_id", params.department);
    }

    const [{ data: lecturers, count, error: lecturersError }, { data: departments }] =
        await Promise.all([
            query,
            supabase.from("departments").select("id, name").order("name"),
        ]);

    if (lecturersError) {
        console.error("Lecturers query failed:", lecturersError);
    }

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    function buildUrl(overrides: Record<string, string | undefined>) {
        const next = new URLSearchParams();
        const merged = { ...params, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) next.set(k, v);
        });
        return `/admin/lecturers?${next.toString()}`;
    }

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                        Lecturer Management
                    </h1>
                    <p className="font-body-sm text-body-sm text-secondary">
                        Manage and view all lecturers across departments.
                    </p>
                </div>
                <Link
                    href="/admin/lecturers/new"
                    className="bg-primary text-on-primary px-6 py-3 rounded flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="font-label-md text-label-md">Add Lecturer</span>
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
                        placeholder="Search by Staff ID or Name"
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
                    <button
                        type="submit"
                        className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md whitespace-nowrap"
                    >
                        Apply
                    </button>
                </div>
            </form>

            {lecturersError && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading lecturers: {lecturersError.message}
                </div>
            )}

            <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant">
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Staff ID
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Department
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                            {lecturers && lecturers.length > 0 ? (
                                lecturers.map((l) => {
                                    const profile = l.profiles as {
                                        full_name?: string;
                                        email?: string;
                                    } | null;
                                    const department = l.departments as {
                                        name?: string;
                                        faculties?: { name?: string };
                                    } | null;
                                    const initials =
                                        profile?.full_name?.slice(0, 2).toUpperCase() ?? "?";

                                    return (
                                        <tr
                                            key={l.id}
                                            className="hover:bg-surface-container-low h-12 transition-colors"
                                        >
                                            <td className="px-4 py-2 tabular-nums font-medium">
                                                <Link
                                                    href={`/admin/lecturers/${l.id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {l.staff_id}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                                                        {initials}
                                                    </div>
                                                    <span className="font-medium">
                                                        {profile?.full_name ?? "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">{l.title}</td>
                                            <td className="px-4 py-2">
                                                {department?.name ?? "—"}
                                                {department?.faculties?.name
                                                    ? ` — ${department.faculties.name}`
                                                    : ""}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                    >
                                        No lecturers match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-secondary">
                        Showing {lecturers?.length ? from + 1 : 0} to{" "}
                        {from + (lecturers?.length ?? 0)} of {count ?? 0} entries
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