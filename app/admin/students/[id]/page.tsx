import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function StudentProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: student } = await supabase
        .from("students")
        .select(
            `id, matric_number, level, admission_year, status,
       profiles(full_name, email, phone, date_of_birth),
       programmes(name, duration_years,
         departments(name, faculties(name)))`
        )
        .eq("id", id)
        .single();

    if (!student) notFound();

    const profile = student.profiles as {
        full_name?: string;
        email?: string;
        phone?: string | null;
        date_of_birth?: string | null;
    } | null;
    const programme = student.programmes as {
        name?: string;
        departments?: { name?: string; faculties?: { name?: string } };
    } | null;

    const initials = profile?.full_name?.slice(0, 2).toUpperCase() ?? "?";
    const isActive = student.status === "active";

    return (
        <>
            <Link
                href="/admin/students"
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mb-4"
            >
                <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                </span>
                Back to Students
            </Link>

            <section className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border border-outline-variant flex-shrink-0 shadow-sm bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-3xl">
                    {initials}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                            {profile?.full_name ?? "Unknown Student"}
                        </h1>
                        <span
                            className={`px-3 py-1 font-label-sm text-label-sm rounded-full uppercase tracking-wider capitalize ${isActive
                                    ? "bg-success-container text-on-success-container"
                                    : "bg-error-container text-on-error-container"
                                }`}
                        >
                            {student.status}
                        </span>
                    </div>
                    <p className="font-body-lg text-body-lg text-secondary">
                        {programme?.name ?? "No programme"} - Level {student.level}
                    </p>
                    <p className="font-body-sm text-body-sm text-outline">
                        {student.matric_number}
                    </p>
                </div>
                <div className="flex gap-3 self-stretch md:self-center mt-4 md:mt-0">
                    <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary/90 transition-colors text-center"
                    >
                        Edit Profile
                    </Link>
                    <button
                        disabled
                        title="Coming in Phase 4 - Transcripts"
                        className="px-4 py-2 bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md rounded opacity-50 cursor-not-allowed"
                    >
                        Download Transcript
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface border border-outline-variant p-6 rounded-xl space-y-4">
                            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                                Personal Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="font-label-sm text-label-sm text-outline">
                                        Email
                                    </p>
                                    <p className="font-body-md text-body-md text-on-surface">
                                        {profile?.email ?? "-"}
                                    </p>
                                </div>
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

                        <div className="bg-surface border border-outline-variant p-6 rounded-xl">
                            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-2">
                                Academic Summary
                            </h3>
                            <p className="font-body-sm text-body-sm text-secondary">
                                Coming in Phase 4 - Results module (GPA, standing).
                            </p>
                            <div className="mt-4 pt-4 border-t border-outline-variant space-y-1 font-body-sm text-body-sm text-on-surface">
                                <p>
                                    <span className="text-secondary">Faculty:</span>{" "}
                                    {programme?.departments?.faculties?.name ?? "-"}
                                </p>
                                <p>
                                    <span className="text-secondary">Department:</span>{" "}
                                    {programme?.departments?.name ?? "-"}
                                </p>
                                <p>
                                    <span className="text-secondary">Admission Year:</span>{" "}
                                    {student.admission_year}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            Current Semester Courses
                        </h3>
                        <div className="bg-surface border border-outline-variant rounded-xl p-6">
                            <p className="font-body-sm text-body-sm text-secondary">
                                Coming in Phase 3 - Course Registration module.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-surface border border-outline-variant p-6 rounded-xl">
                        <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-2">
                            Fee Status
                        </h3>
                        <p className="font-body-sm text-body-sm text-secondary">
                            Coming in Phase 5 - Fees module.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            Recent Activity
                        </h3>
                        <div className="bg-surface border border-outline-variant rounded-xl p-6">
                            <p className="font-body-sm text-body-sm text-secondary">
                                Activity tracking not yet part of the current build plan -
                                revisit if needed in Phase 8 (Polish).
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
