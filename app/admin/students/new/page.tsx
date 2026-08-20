import { createClient } from "@/lib/supabase/server";
import { createStudent } from "@/lib/actions/students";
import Link from "next/link";

async function createStudentAction(formData: FormData) {
    "use server";

    await createStudent(formData);
}

export default async function NewStudentPage() {
    const supabase = await createClient();

    const { data: programmes } = await supabase
        .from("programmes")
        .select("id, name, departments(name, faculties(name))")
        .order("name");

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/students"
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Students
            </Link>

            <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                Add New Student
            </h1>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Creates a login account and student record. The student can log in
                immediately with the email and password you set below.
            </p>

            <form
                action={createStudentAction}
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

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Matric Number
                    </label>
                    <input
                        name="matric_number"
                        type="text"
                        required
                        placeholder="AAU/ST/26/001"
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Programme
                    </label>
                    <select
                        name="programme_id"
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select a programme</option>
                        {programmes?.map((p) => {
                            const dept = p.departments as {
                                name?: string;
                                faculties?: { name?: string };
                            } | null;
                            return (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                    {dept?.faculties?.name ? ` — ${dept.faculties.name}` : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Admission Year
                        </label>
                        <input
                            name="admission_year"
                            type="number"
                            required
                            defaultValue={new Date().getFullYear()}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary text-on-primary rounded-lg py-3 font-label-md text-label-md hover:opacity-90 transition-opacity"
                >
                    Create Student Account
                </button>
            </form>
        </div>
    );
}