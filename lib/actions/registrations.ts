"use server";

import { requireRole, getCurrentUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRegistration(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const studentId = formData.get("student_id") as string;
    const courseId = formData.get("course_id") as string;
    const semesterId = formData.get("semester_id") as string;

    const { error } = await supabase.from("course_registrations").insert({
        student_id: studentId,
        course_id: courseId,
        semester_id: semesterId,
        status: "pending",
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/registrations");
}

export async function removeRegistration(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("course_registrations")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/registrations");
}

export async function approveRegistration(id: string) {
    const profile = await getCurrentUser();
    if (!profile) throw new Error("Not authenticated");

    const supabase = await createClient();
    const { error } = await supabase
        .from("course_registrations")
        .update({
            status: "approved",
            approved_by: profile.id,
            approved_at: new Date().toISOString(),
        })
        .eq("id", id);
    // RLS (can_approve_registration) enforces that only the right
    // HOD/Adviser can actually perform this update — a permission
    // failure surfaces here as a Postgres error.
    if (error) throw new Error(error.message);

    revalidatePath("/lecturer/approvals");
}

export async function rejectRegistration(id: string, formData: FormData) {
    const profile = await getCurrentUser();
    if (!profile) throw new Error("Not authenticated");

    const reason = formData.get("rejection_reason") as string;
    const supabase = await createClient();
    const { error } = await supabase
        .from("course_registrations")
        .update({
            status: "rejected",
            approved_by: profile.id,
            approved_at: new Date().toISOString(),
            rejection_reason: reason,
        })
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/lecturer/approvals");
}