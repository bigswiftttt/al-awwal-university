"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignLecturer(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const courseId = formData.get("course_id") as string;
    const lecturerId = formData.get("lecturer_id") as string;
    const semesterId = formData.get("semester_id") as string;

    const { error } = await supabase.from("course_assignments").upsert(
        { course_id: courseId, lecturer_id: lecturerId, semester_id: semesterId },
        { onConflict: "course_id,semester_id" }
    );
    if (error) throw new Error(error.message);

    revalidatePath("/admin/assignments");
}

export async function removeAssignment(assignmentId: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("course_assignments")
        .delete()
        .eq("id", assignmentId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/assignments");
}