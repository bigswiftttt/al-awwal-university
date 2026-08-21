"use server";

import { requireRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const code = formData.get("code") as string;
    const title = formData.get("title") as string;
    const credits = Number(formData.get("credits"));
    const level = Number(formData.get("level"));
    const departmentId = formData.get("department_id") as string;

    const { error } = await supabase.from("courses").insert({
        code,
        title,
        credits,
        level,
        department_id: departmentId,
    });
    if (error) throw new Error(error.message);

    redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
    await requireRole("admin");
    const supabase = await createClient();

    const code = formData.get("code") as string;
    const title = formData.get("title") as string;
    const credits = Number(formData.get("credits"));
    const level = Number(formData.get("level"));
    const departmentId = formData.get("department_id") as string;

    const { error } = await supabase
        .from("courses")
        .update({
            code,
            title,
            credits,
            level,
            department_id: departmentId,
        })
        .eq("id", courseId);
    if (error) throw new Error(error.message);

    redirect("/admin/courses");
}

export async function deleteCourse(courseId: string) {
    await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
    if (error) throw new Error(error.message);

    redirect("/admin/courses");
}