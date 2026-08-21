"use client";

import { useState } from "react";
import {
    createFaculty,
    deleteFaculty,
    createDepartment,
    deleteDepartment,
    createProgramme,
    deleteProgramme,
} from "@/lib/actions/academic-structure";

type Programme = {
    id: string;
    name: string;
    code: string;
    duration_years: number;
};
type Department = { id: string; name: string; code: string; programmes: Programme[] };
type Faculty = { id: string; name: string; code: string; departments: Department[] };

export function FacultiesTree({ faculties }: { faculties: Faculty[] }) {
    const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(
        new Set()
    );
    const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
        new Set()
    );
    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const [showAddDepartment, setShowAddDepartment] = useState<string | null>(
        null
    );
    const [showAddProgramme, setShowAddProgramme] = useState<string | null>(
        null
    );

    function toggleFaculty(id: string) {
        setExpandedFaculties((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleDepartment(id: string) {
        setExpandedDepartments((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowAddFaculty((v) => !v)}
                className="bg-primary text-on-primary px-6 py-3 rounded flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-label-md text-label-md">Add Faculty</span>
            </button>

            {showAddFaculty && (
                <form
                    action={async (fd) => {
                        await createFaculty(fd);
                        setShowAddFaculty(false);
                    }}
                    className="bg-surface border border-outline-variant rounded-lg p-4 flex gap-3 items-end"
                >
                    <div className="flex-1">
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Faculty Name
                        </label>
                        <input
                            name="name"
                            required
                            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="w-32">
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Code
                        </label>
                        <input
                            name="code"
                            required
                            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md"
                    >
                        Save
                    </button>
                </form>
            )}

            {faculties.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    No faculties yet.
                </div>
            ) : (
                <div className="bg-surface border border-outline-variant rounded-lg divide-y divide-outline-variant">
                    {faculties.map((faculty) => {
                        const isFacultyOpen = expandedFaculties.has(faculty.id);
                        return (
                            <div key={faculty.id}>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <button
                                        onClick={() => toggleFaculty(faculty.id)}
                                        className="flex items-center gap-2 flex-1 text-left"
                                    >
                                        <span className="material-symbols-outlined text-secondary">
                                            {isFacultyOpen ? "expand_more" : "chevron_right"}
                                        </span>
                                        <span className="font-label-md text-label-md text-on-surface font-medium">
                                            {faculty.name}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-outline">
                                            {faculty.code}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-secondary">
                                            ({faculty.departments.length} departments)
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => deleteFaculty(faculty.id)}
                                        className="text-secondary hover:text-error transition-colors p-1"
                                        title="Delete faculty"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            delete
                                        </span>
                                    </button>
                                </div>

                                {isFacultyOpen && (
                                    <div className="pl-8 pb-3 pr-4 space-y-2">
                                        <button
                                            onClick={() =>
                                                setShowAddDepartment(
                                                    showAddDepartment === faculty.id ? null : faculty.id
                                                )
                                            }
                                            className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">
                                                add
                                            </span>
                                            Add Department
                                        </button>

                                        {showAddDepartment === faculty.id && (
                                            <form
                                                action={async (fd) => {
                                                    await createDepartment(fd);
                                                    setShowAddDepartment(null);
                                                }}
                                                className="bg-surface-container-low rounded p-3 flex gap-3 items-end"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="faculty_id"
                                                    value={faculty.id}
                                                />
                                                <div className="flex-1">
                                                    <input
                                                        name="name"
                                                        required
                                                        placeholder="Department name"
                                                        className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <input
                                                        name="code"
                                                        required
                                                        placeholder="Code"
                                                        className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="h-10 px-3 bg-primary text-on-primary rounded font-label-sm text-label-sm"
                                                >
                                                    Save
                                                </button>
                                            </form>
                                        )}

                                        {faculty.departments.map((department) => {
                                            const isDeptOpen = expandedDepartments.has(
                                                department.id
                                            );
                                            return (
                                                <div
                                                    key={department.id}
                                                    className="bg-surface-container-low rounded"
                                                >
                                                    <div className="flex items-center justify-between px-3 py-2">
                                                        <button
                                                            onClick={() => toggleDepartment(department.id)}
                                                            className="flex items-center gap-2 flex-1 text-left"
                                                        >
                                                            <span className="material-symbols-outlined text-secondary text-[18px]">
                                                                {isDeptOpen
                                                                    ? "expand_more"
                                                                    : "chevron_right"}
                                                            </span>
                                                            <span className="font-body-sm text-body-sm text-on-surface font-medium">
                                                                {department.name}
                                                            </span>
                                                            <span className="font-label-sm text-label-sm text-outline">
                                                                {department.code}
                                                            </span>
                                                            <span className="font-label-sm text-label-sm text-secondary">
                                                                ({department.programmes.length} programmes)
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteDepartment(department.id)}
                                                            className="text-secondary hover:text-error transition-colors p-1"
                                                            title="Delete department"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </div>

                                                    {isDeptOpen && (
                                                        <div className="pl-8 pb-3 pr-3 space-y-2">
                                                            <button
                                                                onClick={() =>
                                                                    setShowAddProgramme(
                                                                        showAddProgramme === department.id
                                                                            ? null
                                                                            : department.id
                                                                    )
                                                                }
                                                                className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">
                                                                    add
                                                                </span>
                                                                Add Programme
                                                            </button>

                                                            {showAddProgramme === department.id && (
                                                                <form
                                                                    action={async (fd) => {
                                                                        await createProgramme(fd);
                                                                        setShowAddProgramme(null);
                                                                    }}
                                                                    className="bg-surface rounded p-3 flex gap-2 items-end flex-wrap"
                                                                >
                                                                    <input
                                                                        type="hidden"
                                                                        name="department_id"
                                                                        value={department.id}
                                                                    />
                                                                    <div className="flex-1 min-w-[160px]">
                                                                        <input
                                                                            name="name"
                                                                            required
                                                                            placeholder="Programme name"
                                                                            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                    <div className="w-24">
                                                                        <input
                                                                            name="code"
                                                                            required
                                                                            placeholder="Code"
                                                                            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                    <div className="w-20">
                                                                        <input
                                                                            name="duration_years"
                                                                            type="number"
                                                                            required
                                                                            defaultValue={4}
                                                                            placeholder="Yrs"
                                                                            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="submit"
                                                                        className="h-10 px-3 bg-primary text-on-primary rounded font-label-sm text-label-sm"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </form>
                                                            )}

                                                            {department.programmes.map((programme) => (
                                                                <div
                                                                    key={programme.id}
                                                                    className="flex items-center justify-between px-3 py-2 bg-surface rounded"
                                                                >
                                                                    <span className="font-body-sm text-body-sm text-on-surface">
                                                                        {programme.name}{" "}
                                                                        <span className="text-outline font-label-sm text-label-sm">
                                                                            {programme.code} •{" "}
                                                                            {programme.duration_years} yrs
                                                                        </span>
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteProgramme(programme.id)
                                                                        }
                                                                        className="text-secondary hover:text-error transition-colors p-1"
                                                                        title="Delete programme"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">
                                                                            delete
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}