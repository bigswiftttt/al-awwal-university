import { createClient } from "@/lib/supabase/server";
import { SessionsTree } from "./sessions-tree";

export default async function SessionsPage() {
    const supabase = await createClient();

    const { data: sessions, error } = await supabase
        .from("academic_sessions")
        .select(
            `id, name, start_date, end_date, is_current,
       semesters ( id, name, start_date, end_date, is_current )`
        )
        .order("start_date", { ascending: false });

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                        Academic Sessions &amp; Semesters
                    </h1>
                    <p className="font-body-sm text-body-sm text-secondary">
                        Manage academic sessions and mark the current session/semester.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading sessions: {error.message}
                </div>
            )}

            <SessionsTree sessions={sessions ?? []} />
        </>
    );
}