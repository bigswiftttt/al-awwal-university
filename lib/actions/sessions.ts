"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSession(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const startDate = formData.get("start_date") as string;
    const endDate = formData.get("end_date") as string;

    const { error } = await supabase.from("academic_sessions").insert({
        name,
        start_date: startDate,
        end_date: endDate,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/sessions");
}

export async function deleteSession(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("academic_sessions")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/sessions");
}

export async function setCurrentSession(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    // Unset any existing current session, then set the new one.
    // Two statements since Postgres has no direct "only one true" constraint here.
    await supabase
        .from("academic_sessions")
        .update({ is_current: false })
        .neq("id", id);

    const { error } = await supabase
        .from("academic_sessions")
        .update({ is_current: true })
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/sessions");
}

export async function createSemester(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const startDate = formData.get("start_date") as string;
    const endDate = formData.get("end_date") as string;
    const sessionId = formData.get("session_id") as string;

    const { error } = await supabase.from("semesters").insert({
        name,
        start_date: startDate,
        end_date: endDate,
        session_id: sessionId,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/sessions");
}

export async function deleteSemester(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase.from("semesters").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/sessions");
}

export async function setCurrentSemester(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    await supabase
        .from("semesters")
        .update({ is_current: false })
        .neq("id", id);

    const { error } = await supabase
        .from("semesters")
        .update({ is_current: true })
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/sessions");
}