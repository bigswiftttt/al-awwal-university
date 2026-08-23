import { createClient } from "@/lib/supabase/server";
import {
    approveRegistration,
    rejectRegistration,
} from "@/lib/actions/registrations";
import { approveResult, rejectResult } from "@/lib/actions/results";

export default async function ApprovalsPage() {
    const supabase = await createClient();

    // RLS (lecturers view approvable registrations/results) already scopes
    // these to only what this lecturer, as HOD or Level Adviser, can see.
    const [{ data: registrations, error: regError }, { data: results, error: resError }] =
        await Promise.all([
            supabase
                .from("course_registrations")
                .select(
                    `id, status, registered_at,
           students(matric_number, level, profiles(full_name)),
           courses(code, title)`
                )
                .eq("status", "pending")
                .order("registered_at", { ascending: false }),
            supabase
                .from("results")
                .select(
                    `id, score, grade, submitted_at,
           course_registrations(
             students(matric_number, level, profiles(full_name)),
             courses(code, title)
           )`
                )
                .eq("status", "pending")
                .order("submitted_at", { ascending: false }),
        ]);

    return (
        <>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
                Pending Course Registrations
            </h2>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Registrations awaiting your approval as HOD or Level Adviser.
            </p>

            {regError && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading approvals: {regError.message}
                </div>
            )}

            {!registrations || registrations.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    Nothing pending your approval right now.
                </div>
            ) : (
                <div className="space-y-3">
                    {registrations.map((r) => {
                        const student = r.students as {
                            matric_number?: string;
                            level?: number;
                            profiles?: { full_name?: string };
                        } | null;
                        const course = r.courses as {
                            code?: string;
                            title?: string;
                        } | null;

                        return (
                            <div
                                key={r.id}
                                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                                <div>
                                    <p className="font-body-md text-body-md text-on-surface font-medium">
                                        {student?.profiles?.full_name ?? "Unknown"}{" "}
                                        <span className="text-secondary font-normal">
                                            ({student?.matric_number}, Level {student?.level})
                                        </span>
                                    </p>
                                    <p className="font-body-sm text-body-sm text-secondary">
                                        {course?.code} — {course?.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={approveRegistration.bind(null, r.id)}>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 transition-opacity"
                                        >
                                            Approve
                                        </button>
                                    </form>
                                    <details className="relative">
                                        <summary className="px-4 py-2 border border-outline-variant text-on-surface rounded font-label-md text-label-md cursor-pointer list-none hover:bg-surface-container-low">
                                            Reject
                                        </summary>
                                        <form
                                            action={rejectRegistration.bind(null, r.id)}
                                            className="absolute right-0 mt-2 bg-surface border border-outline-variant rounded-lg p-3 shadow-lg z-10 w-64 flex flex-col gap-2"
                                        >
                                            <textarea
                                                name="rejection_reason"
                                                required
                                                placeholder="Reason for rejection"
                                                rows={3}
                                                className="w-full rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                type="submit"
                                                className="px-3 py-2 bg-error text-on-error rounded font-label-sm text-label-sm"
                                            >
                                                Confirm Reject
                                            </button>
                                        </form>
                                    </details>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <h2 className="font-headline-md text-headline-md text-on-surface mb-1 mt-10">
                Pending Result Submissions
            </h2>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Scores awaiting your approval as HOD or Level Adviser.
            </p>

            {resError && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading results: {resError.message}
                </div>
            )}

            {!results || results.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    Nothing pending your approval right now.
                </div>
            ) : (
                <div className="space-y-3">
                    {results.map((res) => {
                        const registration = res.course_registrations as {
                            students?: {
                                matric_number?: string;
                                level?: number;
                                profiles?: { full_name?: string };
                            };
                            courses?: { code?: string; title?: string };
                        } | null;
                        const student = registration?.students;
                        const course = registration?.courses;

                        return (
                            <div
                                key={res.id}
                                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                                <div>
                                    <p className="font-body-md text-body-md text-on-surface font-medium">
                                        {student?.profiles?.full_name ?? "Unknown"}{" "}
                                        <span className="text-secondary font-normal">
                                            ({student?.matric_number}, Level {student?.level})
                                        </span>
                                    </p>
                                    <p className="font-body-sm text-body-sm text-secondary">
                                        {course?.code} — {course?.title} • Score: {res.score} •
                                        Grade: {res.grade}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={approveResult.bind(null, res.id)}>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 transition-opacity"
                                        >
                                            Approve
                                        </button>
                                    </form>
                                    <details className="relative">
                                        <summary className="px-4 py-2 border border-outline-variant text-on-surface rounded font-label-md text-label-md cursor-pointer list-none hover:bg-surface-container-low">
                                            Reject
                                        </summary>
                                        <form
                                            action={rejectResult.bind(null, res.id)}
                                            className="absolute right-0 mt-2 bg-surface border border-outline-variant rounded-lg p-3 shadow-lg z-10 w-64 flex flex-col gap-2"
                                        >
                                            <textarea
                                                name="rejection_reason"
                                                required
                                                placeholder="Reason for rejection"
                                                rows={3}
                                                className="w-full rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                type="submit"
                                                className="px-3 py-2 bg-error text-on-error rounded font-label-sm text-label-sm"
                                            >
                                                Confirm Reject
                                            </button>
                                        </form>
                                    </details>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}