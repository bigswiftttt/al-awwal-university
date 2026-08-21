"use client";

import { assignLecturer, removeAssignment } from "@/lib/actions/assignments";

type Course = { id: string; code: string; title: string };
type Lecturer = {
    id: string;
    staff_id: string;
    title: string;
    profiles: { full_name?: string } | null;
};
type Assignment = { id: string; course_id: string; lecturer_id: string };

export function AssignmentsTable({
    courses,
    lecturers,
    assignments,
    semesterId,
}: {
    courses: Course[];
    lecturers: Lecturer[];
    assignments: Assignment[];
    semesterId: string;
}) {
    function findAssignment(courseId: string) {
        return assignments.find((a) => a.course_id === courseId);
    }

    return (
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
                                Assigned Lecturer
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                        {courses.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                >
                                    No courses in the catalog yet.
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => {
                                const assignment = findAssignment(course.id);
                                return (
                                    <tr key={course.id} className="h-14">
                                        <td className="px-4 py-2 tabular-nums text-primary font-medium">
                                            {course.code}
                                        </td>
                                        <td className="px-4 py-2">{course.title}</td>
                                        <td className="px-4 py-2">
                                            <form
                                                action={async (fd) => {
                                                    fd.set("course_id", course.id);
                                                    fd.set("semester_id", semesterId);
                                                    await assignLecturer(fd);
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <select
                                                    name="lecturer_id"
                                                    defaultValue={assignment?.lecturer_id ?? ""}
                                                    className="h-9 bg-surface-container-lowest border border-outline-variant rounded px-2 font-body-sm text-body-sm focus:border-primary focus:outline-none min-w-[200px]"
                                                >
                                                    <option value="">Unassigned</option>
                                                    {lecturers.map((l) => (
                                                        <option key={l.id} value={l.id}>
                                                            {l.title} {l.profiles?.full_name ?? l.staff_id}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="submit"
                                                    className="h-9 px-3 bg-primary text-on-primary rounded font-label-sm text-label-sm whitespace-nowrap"
                                                >
                                                    Save
                                                </button>
                                            </form>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {assignment && (
                                                <button
                                                    onClick={() => removeAssignment(assignment.id)}
                                                    className="text-secondary hover:text-error transition-colors p-1"
                                                    title="Remove assignment"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        delete
                                                    </span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}