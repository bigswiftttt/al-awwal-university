import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/lib/actions/courses";
import Link from "next/link";

export default async function NewCoursePage() {
    const supabase = await createClient();

    const { data: departments } = await supabase
        .from("departments")
        .select("id, name, faculties(name)")
        .order("name");

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/courses"
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Courses
            </Link>

            <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                Add New Course
            </h1>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Adds a course to the catalog for a specific department.
            </p>

            <form
                action={createCourse}
                className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col gap-4"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Course Code
                        </label>
                        <input
                            name="code"
                            type="text"
                            required
                            placeholder="CSC301"
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Credits
                        </label>
                        <input
                            name="credits"
                            type="number"
                            required
                            defaultValue={3}
                            min={1}
                            max={6}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Course Title
                    </label>
                    <input
                        name="title"
                        type="text"
                        required
                        placeholder="Data Structures and Algorithms"
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Department
                    </label>
                    <select
                        name="department_id"
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select a department</option>
                        {departments?.map((d) => {
                            const faculty = d.faculties as { name?: string } | null;
                            return (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                    {faculty?.name ? ` — ${faculty.name}` : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Level
                    </label>
                    <select
                        name="level"
                        required
                        defaultValue={100}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {[100, 200, 300, 400, 500].map((l) => (
                            <option key={l} value={l}>
                                {l} Level
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary text-on-primary rounded-lg py-3 font-label-md text-label-md hover:opacity-90 transition-opacity"
                >
                    Create Course
                </button>
            </form>
        </div>
    );
}