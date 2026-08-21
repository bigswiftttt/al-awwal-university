"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFaculty(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    const { error } = await supabase.from("faculties").insert({ name, code });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/faculties");
}

export async function deleteFaculty(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase.from("faculties").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/faculties");
}

export async function createDepartment(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const facultyId = formData.get("faculty_id") as string;

    const { error } = await supabase
        .from("departments")
        .insert({ name, code, faculty_id: facultyId });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/faculties");
}

export async function deleteDepartment(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/faculties");
}

export async function createProgramme(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const durationYears = Number(formData.get("duration_years"));
    const departmentId = formData.get("department_id") as string;

    const { error } = await supabase.from("programmes").insert({
        name,
        code,
        duration_years: durationYears,
        department_id: departmentId,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/faculties");
}

export async function deleteProgramme(id: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase.from("programmes").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/faculties");
}