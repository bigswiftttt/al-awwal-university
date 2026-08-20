import { createClient } from "@/lib/supabase/server";
import { updateLecturer } from "@/lib/actions/lecturers";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditLecturerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: lecturer }, { data: departments }] = await Promise.all([
        supabase
            .from("lecturers")
            .select(
                `id, staff_id, title, profile_id,
         profiles(full_name, email, phone, date_of_birth),
         departments(id)`
            )
            .eq("id", id)
            .single(),
        supabase
            .from("departments")
            .select("id, name, faculties(name)")
            .order("name"),
    ]);

    if (!lecturer) notFound();

    const profile = lecturer.profiles as {
        full_name?: string;
        email?: string;
        phone?: string | null;
        date_of_birth?: string | null;
    } | null;
    const currentDepartment = lecturer.departments as { id?: string } | null;

    const updateLecturerWithId = updateLecturer.bind(null, lecturer.id);

    return (
        <div className="max-w-2xl">
            <Link
                href={`/admin/lecturers/${id}`}
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Profile
            </Link>

            <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                Edit Lecturer
            </h1>
            <p className="font-body-sm text-body-sm text-secondary mb-6">
                Changing the email updates this lecturer&apos;s login credential.
            </p>

            <form
                action={updateLecturerWithId}
                className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col gap-4"
            >
                <input type="hidden" name="profile_id" value={lecturer.profile_id} />

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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-1">
                            Staff ID
                        </label>
                        <input
                            name="staff_id"
                            type="text"
                            required
                            defaultValue={lecturer.staff_id}
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
                            defaultValue={lecturer.title ?? ""}
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
                        defaultValue={currentDepartment?.id}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
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
                    Save Changes
                </button>
            </form>
        </div>
    );
}