import { createClient } from "@/lib/supabase/server";
import { createRegistration, removeRegistration } from "@/lib/actions/registrations";
import Link from "next/link";

export default async function RegistrationsPage({
    searchParams,
}: {
    searchParams: Promise<{ semester?: string }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();

    const { data: allSemesters } = await supabase
        .from("semesters")
        .select("id, name, is_current, academic_sessions(name)")
        .order("start_date", { ascending: false });

    const currentSemester = allSemesters?.find((s) => s.is_current);
    const activeSemesterId =
        params.semester ?? currentSemester?.id ?? allSemesters?.[0]?.id;

    const [{ data: students }, { data: courses }, { data: registrations }] =
        await Promise.all([
            supabase
                .from("students")
                .select("id, matric_number, profiles(full_name)")
                .order("matric_number"),
            supabase.from("courses").select("id, code, title").order("code"),
            activeSemesterId
                ? supabase
                    .from("course_registrations")
                    .select(
                        `id, status, rejection_reason,
               students(matric_number, profiles(full_name)),
               courses(code, title)`
                    )
                    .eq("semester_id", activeSemesterId)
                    .order("registered_at", { ascending: false })
                : Promise.resolve({ data: [] }),
        ]);

    const statusStyles: Record<string, string> = {
        pending: "bg-surface-container-highest text-secondary",
        approved: "bg-success-container text-on-success-container",
        rejected: "bg-error-container text-on-error-container",
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    Course Registration
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Register a student for a course this semester. Registrations start
                    as pending until a HOD or Level Adviser approves them.
                </p>
            </div>

            <form className="bg-surface rounded-lg border border-outline-variant p-3 mb-4 flex items-center gap-3">
                <label className="font-label-md text-label-md text-on-surface">
                    Semester:
                </label>
                <select
                    name="semester"
                    defaultValue={activeSemesterId}
                    className="h-10 bg-surface-container-lowest border border-outline-variant rounded px-3 font-label-md text-label-md text-on-surface focus:border-primary focus:outline-none"
                >
                    {allSemesters?.map((s) => {
                        const session = s.academic_sessions as { name?: string } | null;
                        return (
                            <option key={s.id} value={s.id}>
                                {s.name} — {session?.name}
                                {s.is_current ? " (Current)" : ""}
                            </option>
                        );
                    })}
                </select>
                <button
                    type="submit"
                    className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md"
                >
                    View
                </button>
            </form>

            {activeSemesterId && (
                <form
                    action={createRegistration}
                    className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-wrap gap-3 items-end mb-4"
                >
                    <input type="hidden" name="semester_id" value={activeSemesterId} />
                    <div className="flex-1 min-w-[220px]">
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Student
                        </label>
                        <select
                            name="student_id"
                            required
                            className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {students?.map((s) => {
                                const profile = s.profiles as { full_name?: string } | null;
                                return (
                                    <option key={s.id} value={s.id}>
                                        {s.matric_number} — {profile?.full_name ?? "Unknown"}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[220px]">
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Course
                        </label>
                        <select
                            name="course_id"
                            required
                            className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {courses?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.code} — {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md"
                    >
                        Register
                    </button>
                </form>
            )}

            <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-high border-b border-outline-variant">
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Student
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Course
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                        {!registrations || registrations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                >
                                    No registrations yet for this semester.
                                </td>
                            </tr>
                        ) : (
                            registrations.map((r) => {
                                const student = r.students as {
                                    matric_number?: string;
                                    profiles?: { full_name?: string };
                                } | null;
                                const course = r.courses as {
                                    code?: string;
                                    title?: string;
                                } | null;
                                return (
                                    <tr key={r.id} className="h-12">
                                        <td className="px-4 py-2">
                                            {student?.matric_number} —{" "}
                                            {student?.profiles?.full_name ?? "Unknown"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {course?.code} — {course?.title}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[r.status] ?? statusStyles.pending
                                                    }`}
                                            >
                                                {r.status}
                                            </span>
                                            {r.status === "rejected" && r.rejection_reason && (
                                                <p className="text-outline text-xs mt-1">
                                                    {r.rejection_reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <form action={removeRegistration.bind(null, r.id)}>
                                                <button
                                                    type="submit"
                                                    className="text-secondary hover:text-error transition-colors p-1"
                                                    title="Remove registration"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}