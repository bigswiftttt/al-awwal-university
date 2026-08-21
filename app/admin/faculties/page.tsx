import { createClient } from "@/lib/supabase/server";
import { FacultiesTree } from "./faculties-tree";

export default async function FacultiesPage() {
    const supabase = await createClient();

    const { data: faculties, error } = await supabase
        .from("faculties")
        .select(
            `id, name, code,
       departments (
         id, name, code,
         programmes ( id, name, code, duration_years )
       )`
        )
        .order("name");

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                        Faculties, Departments &amp; Programmes
                    </h1>
                    <p className="font-body-sm text-body-sm text-secondary">
                        Manage the academic structure of the university.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading academic structure: {error.message}
                </div>
            )}

            <FacultiesTree faculties={faculties ?? []} />
        </>
    );
}