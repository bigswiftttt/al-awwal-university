import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const [
        { count: studentCount },
        { count: lecturerCount },
        { count: facultyCount },
        { count: programmeCount },
        { data: recentStudents },
    ] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("lecturers").select("*", { count: "exact", head: true }),
        supabase.from("faculties").select("*", { count: "exact", head: true }),
        supabase.from("programmes").select("*", { count: "exact", head: true }),
        supabase
            .from("students")
            .select("id, matric_number, status, profiles(full_name), programmes(name)")
            .order("created_at", { ascending: false })
            .limit(4),
    ]);

    const metrics = [
        { label: "Total Students", value: studentCount ?? 0, icon: "school" },
        { label: "Lecturers", value: lecturerCount ?? 0, icon: "source" },
        { label: "Faculties", value: facultyCount ?? 0, icon: "account_balance" },
        { label: "Programmes", value: programmeCount ?? 0, icon: "menu_book" },
    ];

    return (
        <>
            {/* Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div
                        key={m.label}
                        className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col justify-between h-[160px] hover:bg-surface-container-low transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                                {m.label}
                            </span>
                            <span className="material-symbols-outlined text-primary">
                                {m.icon}
                            </span>
                        </div>
                        <p className="font-display-lg text-display-lg text-on-surface">
                            {m.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent registrations */}
                <div className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            Recent Registrations
                        </h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-container-low border-b border-outline-variant">
                                <tr>
                                    <th className="py-3 px-4 font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="py-3 px-4 font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                                        Matric No.
                                    </th>
                                    <th className="py-3 px-4 font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                                        Programme
                                    </th>
                                    <th className="py-3 px-4 font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentStudents && recentStudents.length > 0 ? (
                                    recentStudents.map((s) => (
                                        <tr
                                            key={s.id}
                                            className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors h-[48px] last:border-b-0"
                                        >
                                            <td className="py-3 px-4 font-body-md text-body-md text-on-surface flex items-center gap-sm">
                                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">
                                                    {s.profiles?.full_name?.slice(0, 2).toUpperCase() ?? "?"}
                                                </div>
                                                {s.profiles?.full_name ?? "Unknown"}
                                            </td>
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-secondary tabular-nums">
                                                {s.matric_number}
                                            </td>
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-secondary">
                                                {s.programmes?.name ?? "—"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-container text-on-primary-container capitalize">
                                                    {s.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                        >
                                            No students registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Placeholder widgets — need fees/results tables (Phase 4 & 5) */}
                <div className="flex flex-col gap-6">
                    <div className="bg-surface rounded-xl border border-outline-variant p-6">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">
                            Fee Collection
                        </h3>
                        <p className="font-body-sm text-body-sm text-secondary">
                            Coming in Phase 5 — Fees module.
                        </p>
                    </div>
                    <div className="bg-surface rounded-xl border border-outline-variant p-6">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">
                            Result Submissions
                        </h3>
                        <p className="font-body-sm text-body-sm text-secondary">
                            Coming in Phase 4 — Results module.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}