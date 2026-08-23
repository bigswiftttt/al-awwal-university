"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleHod(lecturerId: string, currentValue: boolean) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("lecturers")
        .update({ is_hod: !currentValue })
        .eq("id", lecturerId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/lecturers");
    revalidatePath(`/admin/lecturers/${lecturerId}`);
}

export async function assignLevelAdviser(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const lecturerId = formData.get("lecturer_id") as string;
    const departmentId = formData.get("department_id") as string;
    const level = Number(formData.get("level"));

    const { error } = await supabase.from("level_advisers").upsert(
        { lecturer_id: lecturerId, department_id: departmentId, level },
        { onConflict: "department_id,level" }
    );
    if (error) throw new Error(error.message);

    revalidatePath("/admin/advisers");
}

export async function removeLevelAdviser(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("level_advisers")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/advisers");
}