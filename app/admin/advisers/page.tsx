import { createClient } from "@/lib/supabase/server";
import { AdvisersManager } from "./advisers-manager";

export default async function AdvisersPage() {
    const supabase = await createClient();

    const [{ data: lecturers }, { data: departments }, { data: advisers }] =
        await Promise.all([
            supabase
                .from("lecturers")
                .select("id, staff_id, title, is_hod, department_id, profiles(full_name)")
                .order("staff_id"),
            supabase.from("departments").select("id, name").order("name"),
            supabase
                .from("level_advisers")
                .select(
                    "id, department_id, level, lecturer_id, lecturers(staff_id, title, profiles(full_name))"
                )
                .order("level"),
        ]);

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    HODs &amp; Level Advisers
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Assign who can approve course registrations — HOD per department,
                    or a Level Adviser per department + level.
                </p>
            </div>

            <AdvisersManager
                lecturers={lecturers ?? []}
                departments={departments ?? []}
                advisers={
                    (advisers ?? []).map((adviser) => ({
                        ...adviser,
                        lecturers: {
                            ...adviser.lecturers,
                            title: adviser.lecturers.title ?? undefined,
                        },
                    }))
                }
            />
        </>
    );
}