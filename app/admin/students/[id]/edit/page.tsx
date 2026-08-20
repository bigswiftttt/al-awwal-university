import { createClient } from "@/lib/supabase/server";
import { updateStudent } from "@/lib/actions/students";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditStudentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: student }, { data: programmes }] = await Promise.all([
        supabase
            .from("students")
            .select(
                `id, matric_number, level, status, profile_id,
         profiles(full_name, email, phone, date_of_birth),
         programmes(id)`
            )
            .eq("id", id)
            .single(),
        supabase
            .from("programmes")
            .select("id, name, departments(name, faculties(name))")
            .order("name"),
    ]);

    if (!student) notFound();

    const profile = student.profiles as {
        full_name?: string;
        email?: string;
        phone?: string | null;
        date_of_birth?: string | null;
    } | null;
    const currentProgramme = student.programmes as { id?: string } | null;

    const updateStudentWithId = updateStudent.bind(null, student.id);

    return (
        <div className="max-w-2xl">
            <Link
                href={`/admin/students/${id}`}
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Profile
            </Link>

            <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                Edit Student
            </h1>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Changing the email updates this student&apos;s login credential.
            </p>

            <form
                action={updateStudentWithId}
                className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col gap-4"
            >
                <input type="hidden" name="profile_id" value={student.profile_id} />

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Full Name
                    </label>
                    <input
                        name="full_name"
                        type="text"
                        required
                        defaultValue={profile?.full_name}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Email (login credential)
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            defaultValue={profile?.email}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Phone
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            defaultValue={profile?.phone ?? ""}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Date of Birth
                    </label>
                    <input
                        name="date_of_birth"
                        type="date"
                        defaultValue={profile?.date_of_birth ?? ""}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                        Matric Number
                    </label>
                    <input
                        name="matric_number"
                        type="text"
                        required
                        defaultValue={student.matric_number}
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
                        defaultValue={currentProgramme?.id}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
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
                            defaultValue={student.level}
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
                            Status
                        </label>
                        <select
                            name="status"
                            required
                            defaultValue={student.status}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="active">Active</option>
                            <option value="probation">Probation</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary text-on-primary rounded-lg py-3 font-label-md text-label-md hover:opacity-90 transition-opacity"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}