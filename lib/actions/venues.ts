"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createVenue(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const capacity = formData.get("capacity")
        ? Number(formData.get("capacity"))
        : null;

    const { error } = await supabase
        .from("venues")
        .insert({ name, capacity });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/venues");
}

export async function deleteVenue(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/venues");
}