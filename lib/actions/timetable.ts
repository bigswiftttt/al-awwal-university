"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTimetableEntry(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const courseAssignmentId = formData.get("course_assignment_id") as string;
    const venueId = formData.get("venue_id") as string;
    const dayOfWeek = Number(formData.get("day_of_week"));
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;

    if (startTime >= endTime) {
        throw new Error("End time must be after start time.");
    }

    // Server-side conflict check before inserting.
    const { data: conflictMessage, error: rpcError } = await supabase.rpc(
        "check_timetable_conflict",
        {
            p_course_assignment_id: courseAssignmentId,
            p_venue_id: venueId,
            p_day_of_week: dayOfWeek,
            p_start_time: startTime,
            p_end_time: endTime,
        }
    );
    if (rpcError) throw new Error(rpcError.message);
    if (conflictMessage) throw new Error(conflictMessage);

    const { error } = await supabase.from("timetable_entries").insert({
        course_assignment_id: courseAssignmentId,
        venue_id: venueId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/timetable");
}

export async function deleteTimetableEntry(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("timetable_entries")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/timetable");
}