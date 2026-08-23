import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function LecturerProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: lecturer } = await supabase
        .from("lecturers")
        .select(
            `id, staff_id, title,
       profiles(full_name, email, phone, date_of_birth),
       departments(name, faculties(name))`
        )
        .eq("id", id)
        .single();

    if (!lecturer) notFound();

    const profile = lecturer.profiles as {
        full_name?: string;
        email?: string;
        phone?: string | null;
        date_of_birth?: string | null;
    } | null;
    const department = lecturer.departments as {
        name?: string;
        faculties?: { name?: string };
    } | null;

    const initials = profile?.full_name?.slice(0, 2).toUpperCase() ?? "?";

    return (
        <>
            <Link
                href="/admin/lecturers"
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Lecturers
            </Link>

            <section className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border border-outline-variant flex-shrink-0 shadow-sm bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-3xl">
                    {initials}
                </div>
                <div className="flex-1 space-y-2">
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                        {lecturer.title} {profile?.full_name ?? "Unknown Lecturer"}
                    </h1>
                    <p className="font-body-lg text-body-lg text-secondary">
                        {department?.name ?? "No department"}
                        {department?.faculties?.name
                            ? ` — ${department.faculties.name}`
                            : ""}
                    </p>
                    <p className="font-body-sm text-body-sm text-outline">
                        {lecturer.staff_id}
                    </p>
                </div>
                <div className="flex gap-3 self-stretch md:self-center mt-4 md:mt-0">
                    <Link
                        href={`/admin/lecturers/${lecturer.id}/edit`}
                        className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary/90 transition-colors text-center"
                    >
                        Edit Profile
                    </Link>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-surface border border-outline-variant p-6 rounded-xl space-y-4">
                        <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-label-sm text-label-sm text-outline">
                                    Email
                                </p>
                                <p className="font-body-md text-body-md text-on-surface break-all">
                                    {profile?.email ?? "—"}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-label-sm text-label-sm text-outline">
                                        Phone
                                    </p>
                                    <p className="font-body-md text-body-md text-on-surface">
                                        {profile?.phone ?? "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-label-sm text-label-sm text-outline">
                                        Date of Birth
                                    </p>
                                    <p className="font-body-md text-body-md text-on-surface">
                                        {profile?.date_of_birth
                                            ? new Date(profile.date_of_birth).toLocaleDateString(
                                                "en-US",
                                                { year: "numeric", month: "long", day: "numeric" }
                                            )
                                            : "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            Assigned Courses
                        </h3>
                        <div className="bg-surface border border-outline-variant rounded-xl p-6">
                            <p className="font-body-sm text-body-sm text-secondary">
                                Coming in Phase 3 — Course assignment module.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-surface border border-outline-variant p-6 rounded-xl">
                        <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-2">
                            Result Submissions
                        </h3>
                        <p className="font-body-sm text-body-sm text-secondary">
                            Coming in Phase 4 — Results module.
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}