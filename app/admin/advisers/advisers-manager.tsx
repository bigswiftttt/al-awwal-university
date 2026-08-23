"use client";

import { useState } from "react";
import {
    toggleHod,
    assignLevelAdviser,
    removeLevelAdviser,
} from "@/lib/actions/advisers";

type Lecturer = {
    id: string;
    staff_id: string;
    title: string | null;
    is_hod: boolean;
    department_id: string | null;
    profiles: { full_name?: string } | null;
};
type Department = { id: string; name: string };
type Adviser = {
    id: string;
    department_id: string;
    level: number;
    lecturer_id: string;
    lecturers: {
        staff_id?: string;
        title?: string;
        profiles?: { full_name?: string };
    } | null;
};

export function AdvisersManager({
    lecturers,
    departments,
    advisers,
}: {
    lecturers: Lecturer[];
    departments: Department[];
    advisers: Adviser[];
}) {
    const [showAddAdviser, setShowAddAdviser] = useState(false);

    return (
        <div className="space-y-8">
            {/* HODs section */}
            <section>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                    Heads of Department (HOD)
                </h3>
                <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant">
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Lecturer
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                    HOD Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                            {lecturers.map((l) => {
                                const dept = departments.find(
                                    (d) => d.id === l.department_id
                                );
                                return (
                                    <tr key={l.id} className="h-12">
                                        <td className="px-4 py-2">
                                            {l.title} {l.profiles?.full_name ?? l.staff_id}
                                        </td>
                                        <td className="px-4 py-2">{dept?.name ?? "—"}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => toggleHod(l.id, l.is_hod)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${l.is_hod
                                                    ? "bg-success-container text-on-success-container"
                                                    : "bg-surface-container-highest text-secondary"
                                                    }`}
                                            >
                                                {l.is_hod ? "HOD" : "Not HOD"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Level Advisers section */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Level Advisers
                    </h3>
                    <button
                        onClick={() => setShowAddAdviser((v) => !v)}
                        className="bg-primary text-on-primary px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            add
                        </span>
                        <span className="font-label-md text-label-md">Assign Adviser</span>
                    </button>
                </div>

                {showAddAdviser && (
                    <form
                        action={async (fd) => {
                            await assignLevelAdviser(fd);
                            setShowAddAdviser(false);
                        }}
                        className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-wrap gap-3 items-end mb-3"
                    >
                        <div className="flex-1 min-w-[180px]">
                            <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                Department
                            </label>
                            <select
                                name="department_id"
                                required
                                className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                Level
                            </label>
                            <select
                                name="level"
                                required
                                className="h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {[100, 200, 300, 400, 500].map((lvl) => (
                                    <option key={lvl} value={lvl}>
                                        {lvl} Level
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="font-label-sm text-label-sm text-secondary block mb-1">
                                Lecturer
                            </label>
                            <select
                                name="lecturer_id"
                                required
                                className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {lecturers.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.title} {l.profiles?.full_name ?? l.staff_id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md"
                        >
                            Save
                        </button>
                    </form>
                )}

                <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant">
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Level
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                    Adviser
                                </th>
                                <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                            {advisers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                    >
                                        No level advisers assigned yet.
                                    </td>
                                </tr>
                            ) : (
                                advisers.map((a) => {
                                    const dept = departments.find(
                                        (d) => d.id === a.department_id
                                    );
                                    return (
                                        <tr key={a.id} className="h-12">
                                            <td className="px-4 py-2">{dept?.name ?? "—"}</td>
                                            <td className="px-4 py-2 tabular-nums">{a.level}</td>
                                            <td className="px-4 py-2">
                                                {a.lecturers?.title}{" "}
                                                {a.lecturers?.profiles?.full_name ??
                                                    a.lecturers?.staff_id}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    onClick={() => removeLevelAdviser(a.id)}
                                                    className="text-secondary hover:text-error transition-colors p-1"
                                                    title="Remove adviser"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}