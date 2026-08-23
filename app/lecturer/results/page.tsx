import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { submitResult } from "@/lib/actions/results";

export default async function LecturerResultsPage({
    searchParams,
}: {
    searchParams: Promise<{ assignment?: string }>;
}) {
    const params = await searchParams;
    const profile = await getCurrentUser();
    const supabase = await createClient();

    const { data: lecturer } = await supabase
        .from("lecturers")
        .select("id")
        .eq("profile_id", profile!.id)
        .single();

    const { data: assignments } = await supabase
        .from("course_assignments")
        .select(
            `id, course_id, semester_id,
       courses(code, title),
       semesters(name, is_current, academic_sessions(name))`
        )
        .eq("lecturer_id", lecturer?.id ?? "")
        .order("id");

    const activeAssignment =
        assignments?.find((a) => a.id === params.assignment) ??
        assignments?.find((a) => {
            const semester = a.semesters as { is_current?: boolean } | null;
            return semester?.is_current;
        }) ??
        assignments?.[0];

    const { data: registrations } = activeAssignment
        ? await supabase
            .from("course_registrations")
            .select(
                `id, students(matric_number, profiles(full_name)),
           results(id, score, grade, status, rejection_reason)`
            )
            .eq("course_id", activeAssignment.course_id)
            .eq("semester_id", activeAssignment.semester_id)
            .eq("status", "approved")
        : { data: [] };

    return (
        <>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
                Submit Results
            </h2>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Enter scores for students registered in your assigned courses.
            </p>

            {!assignments || assignments.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    You have no assigned courses yet.
                </div>
            ) : (
                <>
                    <form className="bg-surface border border-outline-variant rounded-lg p-3 mb-4 flex items-center gap-3">
                        <label className="font-label-md text-label-md text-on-surface">
                            Course:
                        </label>
                        <select
                            name="assignment"
                            defaultValue={activeAssignment?.id}
                            className="h-10 bg-surface-container-lowest border border-outline-variant rounded px-3 font-label-md text-label-md text-on-surface focus:border-primary focus:outline-none"
                        >
                            {assignments.map((a) => {
                                const course = a.courses as {
                                    code?: string;
                                    title?: string;
                                } | null;
                                const semester = a.semesters as {
                                    name?: string;
                                    is_current?: boolean;
                                    academic_sessions?: { name?: string };
                                } | null;
                                return (
                                    <option key={a.id} value={a.id}>
                                        {course?.code} — {course?.title} ({semester?.name}
                                        {semester?.is_current ? ", Current" : ""})
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

                    <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-high border-b border-outline-variant">
                                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                        Status
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
                                            No approved registrations for this course yet.
                                        </td>
                                    </tr>
                                ) : (
                                    registrations.map((r) => {
                                        const student = r.students as {
                                            matric_number?: string;
                                            profiles?: { full_name?: string };
                                        } | null;
                                        const result = (
                                            Array.isArray(r.results) ? r.results[0] : r.results
                                        ) as {
                                            id?: string;
                                            score?: number;
                                            grade?: string;
                                            status?: string;
                                            rejection_reason?: string;
                                        } | null;

                                        return (
                                            <tr key={r.id} className="h-14">
                                                <td className="px-4 py-2">
                                                    {student?.matric_number} —{" "}
                                                    {student?.profiles?.full_name ?? "Unknown"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <form
                                                        action={submitResult}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="registration_id"
                                                            value={r.id}
                                                        />
                                                        <input
                                                            name="score"
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step="0.01"
                                                            defaultValue={result?.score ?? ""}
                                                            disabled={result?.status === "approved"}
                                                            required
                                                            className="w-20 h-9 rounded border border-outline-variant bg-surface-container-lowest px-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                                        />
                                                        {result?.status !== "approved" && (
                                                            <button
                                                                type="submit"
                                                                className="h-9 px-3 bg-primary text-on-primary rounded font-label-sm text-label-sm"
                                                            >
                                                                Save
                                                            </button>
                                                        )}
                                                    </form>
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {result?.grade ?? "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {result?.status ? (
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${result.status === "approved"
                                                                ? "bg-success-container text-on-success-container"
                                                                : result.status === "rejected"
                                                                    ? "bg-error-container text-on-error-container"
                                                                    : "bg-surface-container-highest text-secondary"
                                                                }`}
                                                        >
                                                            {result.status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-outline">Not submitted</span>
                                                    )}
                                                    {result?.status === "rejected" &&
                                                        result.rejection_reason && (
                                                            <p className="text-outline text-xs mt-1">
                                                                {result.rejection_reason}
                                                            </p>
                                                        )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}