"use server";

import { requireRole, getCurrentUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
    await requireRole("admin");
    const profile = await getCurrentUser();
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const targetRole = formData.get("target_role") as string;
    const targetFacultyId = formData.get("target_faculty_id") as string;

    const { error } = await supabase.from("announcements").insert({
        title,
        body,
        target_role: targetRole,
        target_faculty_id: targetFacultyId || null,
        created_by: profile?.id,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/announcements");
}