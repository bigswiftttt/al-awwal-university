"use client";

import { useState } from "react";
import {
    createSession,
    deleteSession,
    setCurrentSession,
    createSemester,
    deleteSemester,
    setCurrentSemester,
} from "@/lib/actions/sessions";

type Semester = {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
};
type Session = {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    semesters: Semester[];
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function SessionsTree({ sessions }: { sessions: Session[] }) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [showAddSession, setShowAddSession] = useState(false);
    const [showAddSemester, setShowAddSemester] = useState<string | null>(null);

    function toggle(id: string) {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowAddSession((v) => !v)}
                className="bg-primary text-on-primary px-6 py-3 rounded flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-label-md text-label-md">Add Session</span>
            </button>

            {showAddSession && (
                <form
                    action={async (fd) => {
                        await createSession(fd);
                        setShowAddSession(false);
                    }}
                    className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-wrap gap-3 items-end"
                >
                    <div className="flex-1 min-w-[160px]">
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Session Name
                        </label>
                        <input
                            name="name"
                            required
                            placeholder="2025/2026"
                            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            Start Date
                        </label>
                        <input
                            name="start_date"
                            type="date"
                            required
                            className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                            End Date
                        </label>
                        <input
                            name="end_date"
                            type="date"
                            required
                            className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

            {sessions.length === 0 ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-8 text-center font-body-sm text-body-sm text-secondary">
                    No academic sessions yet.
                </div>
            ) : (
                <div className="bg-surface border border-outline-variant rounded-lg divide-y divide-outline-variant">
                    {sessions.map((session) => {
                        const isOpen = expanded.has(session.id);
                        return (
                            <div key={session.id}>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <button
                                        onClick={() => toggle(session.id)}
                                        className="flex items-center gap-2 flex-1 text-left"
                                    >
                                        <span className="material-symbols-outlined text-secondary">
                                            {isOpen ? "expand_more" : "chevron_right"}
                                        </span>
                                        <span className="font-label-md text-label-md text-on-surface font-medium">
                                            {session.name}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-outline">
                                            {formatDate(session.start_date)} –{" "}
                                            {formatDate(session.end_date)}
                                        </span>
                                        {session.is_current && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-container text-on-success-container">
                                                Current
                                            </span>
                                        )}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {!session.is_current && (
                                            <button
                                                onClick={() => setCurrentSession(session.id)}
                                                className="text-primary font-label-sm text-label-sm hover:underline whitespace-nowrap"
                                            >
                                                Set Current
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteSession(session.id)}
                                            className="text-secondary hover:text-error transition-colors p-1"
                                            title="Delete session"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="pl-8 pb-3 pr-4 space-y-2">
                                        <button
                                            onClick={() =>
                                                setShowAddSemester(
                                                    showAddSemester === session.id ? null : session.id
                                                )
                                            }
                                            className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">
                                                add
                                            </span>
                                            Add Semester
                                        </button>

                                        {showAddSemester === session.id && (
                                            <form
                                                action={async (fd) => {
                                                    await createSemester(fd);
                                                    setShowAddSemester(null);
                                                }}
                                                className="bg-surface-container-low rounded p-3 flex flex-wrap gap-3 items-end"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="session_id"
                                                    value={session.id}
                                                />
                                                <div className="flex-1 min-w-[140px]">
                                                    <input
                                                        name="name"
                                                        required
                                                        placeholder="First Semester"
                                                        className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <input
                                                    name="start_date"
                                                    type="date"
                                                    required
                                                    className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <input
                                                    name="end_date"
                                                    type="date"
                                                    required
                                                    className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <button
                                                    type="submit"
                                                    className="h-10 px-3 bg-primary text-on-primary rounded font-label-sm text-label-sm"
                                                >
                                                    Save
                                                </button>
                                            </form>
                                        )}

                                        {session.semesters.length === 0 ? (
                                            <p className="font-body-sm text-body-sm text-secondary px-1">
                                                No semesters yet.
                                            </p>
                                        ) : (
                                            session.semesters.map((semester) => (
                                                <div
                                                    key={semester.id}
                                                    className="flex items-center justify-between bg-surface-container-low rounded px-3 py-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-body-sm text-body-sm text-on-surface font-medium">
                                                            {semester.name}
                                                        </span>
                                                        <span className="font-label-sm text-label-sm text-outline">
                                                            {formatDate(semester.start_date)} –{" "}
                                                            {formatDate(semester.end_date)}
                                                        </span>
                                                        {semester.is_current && (
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-container text-on-success-container">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!semester.is_current && (
                                                            <button
                                                                onClick={() =>
                                                                    setCurrentSemester(semester.id)
                                                                }
                                                                className="text-primary font-label-sm text-label-sm hover:underline whitespace-nowrap"
                                                            >
                                                                Set Current
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteSemester(semester.id)}
                                                            className="text-secondary hover:text-error transition-colors p-1"
                                                            title="Delete semester"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
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