import { createClient } from "@/lib/supabase/server";
import {
    createTimetableEntry,
    deleteTimetableEntry,
} from "@/lib/actions/timetable";

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(t: string) {
    const [h, m] = t.split(":");
    const hour = Number(h);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${m} ${period}`;
}

export default async function TimetablePage({
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

    const [{ data: assignments }, { data: venues }] = await Promise.all([
        activeSemesterId
            ? supabase
                .from("course_assignments")
                .select(
                    `id, courses(code, title),
             lecturers(staff_id, title, profiles(full_name)),
             timetable_entries(id, day_of_week, start_time, end_time, venues(name))`
                )
                .eq("semester_id", activeSemesterId)
                .order("id")
            : Promise.resolve({ data: [] }),
        supabase.from("venues").select("id, name").order("name"),
    ]);

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    Timetable
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Schedule each assigned course to a day, time, and venue. Conflicts
                    with the same lecturer or venue are blocked automatically.
                </p>
            </div>

            <form className="bg-surface border border-outline-variant rounded-lg p-3 mb-6 flex items-center gap-3">
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

            {!assignments || assignments.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    No course assignments for this semester yet — assign lecturers to
                    courses first under Assignments.
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((a) => {
                        const course = a.courses as { code?: string; title?: string } | null;
                        const lecturer = a.lecturers as {
                            staff_id?: string;
                            title?: string;
                            profiles?: { full_name?: string };
                        } | null;
                        const entries = Array.isArray(a.timetable_entries)
                            ? a.timetable_entries
                            : a.timetable_entries
                                ? [a.timetable_entries]
                                : [];

                        return (
                            <div
                                key={a.id}
                                className="bg-surface border border-outline-variant rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-label-md text-label-md text-on-surface font-medium">
                                            {course?.code} — {course?.title}
                                        </p>
                                        <p className="font-body-sm text-body-sm text-secondary">
                                            {lecturer?.title} {lecturer?.profiles?.full_name ?? lecturer?.staff_id}
                                        </p>
                                    </div>
                                </div>

                                {entries.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {entries.map((e) => {
                                            const venue = e.venues as { name?: string } | null;
                                            return (
                                                <div
                                                    key={e.id}
                                                    className="flex items-center justify-between bg-surface-container-low rounded px-3 py-2"
                                                >
                                                    <span className="font-body-sm text-body-sm text-on-surface">
                                                        {DAY_NAMES[e.day_of_week]} •{" "}
                                                        {formatTime(e.start_time)} –{" "}
                                                        {formatTime(e.end_time)} • {venue?.name ?? "—"}
                                                    </span>
                                                    <form
                                                        action={deleteTimetableEntry.bind(null, e.id)}
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-secondary hover:text-error transition-colors p-1"
                                                            title="Remove slot"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </form>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <form
                                    action={createTimetableEntry}
                                    className="flex flex-wrap gap-2 items-end"
                                >
                                    <input
                                        type="hidden"
                                        name="course_assignment_id"
                                        value={a.id}
                                    />
                                    <div>
                                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                            Day
                                        </label>
                                        <select
                                            name="day_of_week"
                                            required
                                            className="h-9 rounded border border-outline-variant bg-surface-container-lowest px-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {DAY_NAMES.slice(1).map((d, idx) => (
                                                <option key={d} value={idx + 1}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                            Start
                                        </label>
                                        <input
                                            name="start_time"
                                            type="time"
                                            required
                                            className="h-9 rounded border border-outline-variant bg-surface-container-lowest px-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                            End
                                        </label>
                                        <input
                                            name="end_time"
                                            type="time"
                                            required
                                            className="h-9 rounded border border-outline-variant bg-surface-container-lowest px-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                            Venue
                                        </label>
                                        <select
                                            name="venue_id"
                                            required
                                            className="w-full h-9 rounded border border-outline-variant bg-surface-container-lowest px-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {venues?.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="h-9 px-3 bg-primary text-on-primary rounded font-label-sm text-label-sm"
                                    >
                                        Add Slot
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