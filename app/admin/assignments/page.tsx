import { createClient } from "@/lib/supabase/server";
import { AssignmentsTable } from "./assignments-table";

export default async function AssignmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ semester?: string }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();

    // Determine which semester to show: URL param, or the current one, or the first available.
    const { data: allSemesters } = await supabase
        .from("semesters")
        .select("id, name, is_current, academic_sessions(name)")
        .order("start_date", { ascending: false });

    const currentSemester = allSemesters?.find((s) => s.is_current);
    const activeSemesterId =
        params.semester ?? currentSemester?.id ?? allSemesters?.[0]?.id;

    const [{ data: courses }, { data: lecturers }, { data: assignments }] =
        await Promise.all([
            supabase.from("courses").select("id, code, title").order("code"),
            supabase
                .from("lecturers")
                .select("id, staff_id, title, profiles(full_name)")
                .order("staff_id"),
            activeSemesterId
                ? supabase
                    .from("course_assignments")
                    .select("id, course_id, lecturer_id")
                    .eq("semester_id", activeSemesterId)
                : Promise.resolve({ data: [] }),
        ]);

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    Course Assignments
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Assign a lecturer to teach each course for the selected semester.
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

            {!activeSemesterId ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    No semesters exist yet — create one under Sessions first.
                </div>
            ) : (
                <AssignmentsTable
                    courses={courses ?? []}
                    lecturers={
                        lecturers?.map((lecturer) => ({
                            ...lecturer,
                            title: lecturer.title ?? "",
                        })) ?? []
                    }
                    assignments={assignments ?? []}
                    semesterId={activeSemesterId}
                />
            )}
        </>
    );
}