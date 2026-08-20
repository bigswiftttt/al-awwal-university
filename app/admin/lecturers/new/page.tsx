import { createClient } from "@/lib/supabase/server";
import { createLecturer } from "@/lib/actions/lecturers";
import Link from "next/link";

export default async function NewLecturerPage() {
    const supabase = await createClient();

    const { data: departments } = await supabase
        .from("departments")
        .select("id, name, faculties(name)")
        .order("name");

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/lecturers"
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Lecturers
            </Link>

            <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                Add New Lecturer
            </h1>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Creates a login account and lecturer record. The lecturer can log in
                immediately with the email and password you set below.
            </p>

            <form
                action={createLecturer}
                className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col gap-4"
            >
                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Full Name
                    </label>
                    <input
                        name="full_name"
                        type="text"
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Temporary Password
                        </label>
                        <input
                            name="password"
                            type="text"
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="At least 6 characters"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Staff ID
                        </label>
                        <input
                            name="staff_id"
                            type="text"
                            required
                            placeholder="AAU/LC/26/001"
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Title
                        </label>
                        <select
                            name="title"
                            required
                            defaultValue="Dr."
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Prof.">Prof.</option>
                            <option value="Engr.">Engr.</option>
                        </select>
                    </div>
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

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary text-on-primary rounded-lg py-3 font-label-md text-label-md hover:opacity-90 transition-opacity"
                >
                    Create Lecturer Account
                </button>
            </form>
        </div>
    );
}