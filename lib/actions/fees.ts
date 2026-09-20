"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFeeStructure(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const programmeId = formData.get("programme_id") as string;
    const level = Number(formData.get("level"));
    const sessionId = formData.get("session_id") as string;
    const amount = Number(formData.get("amount"));

    const { error } = await supabase.from("fee_structures").upsert(
        {
            programme_id: programmeId,
            level,
            session_id: sessionId,
            amount,
        },
        { onConflict: "programme_id,level,session_id" }
    );
    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
}

export async function deleteFeeStructure(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("fee_structures")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
}