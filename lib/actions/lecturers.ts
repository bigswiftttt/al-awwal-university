"use server";

import { requireRole } from "@/lib/actions/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function createLecturer(formData: FormData) {
    await requireRole("admin");

    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const staffId = formData.get("staff_id") as string;
    const departmentId = formData.get("department_id") as string;
    const title = formData.get("title") as string;

    const admin = createAdminClient();

    const { data: userData, error: userError } =
        await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: "lecturer" },
        });

    if (userError || !userData.user) {
        throw new Error(userError?.message ?? "Failed to create user account");
    }

    const { error: lecturerError } = await admin.from("lecturers").insert({
        profile_id: userData.user.id,
        staff_id: staffId,
        department_id: departmentId,
        title,
    });

    if (lecturerError) {
        await admin.auth.admin.deleteUser(userData.user.id);
        throw new Error(lecturerError.message);
    }

    redirect("/admin/lecturers");
}

export async function updateLecturer(lecturerId: string, formData: FormData) {
    await requireRole("admin");

    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const staffId = formData.get("staff_id") as string;
    const departmentId = formData.get("department_id") as string;
    const title = formData.get("title") as string;
    const profileId = formData.get("profile_id") as string;

    const admin = createAdminClient();

    const { error: authError } = await admin.auth.admin.updateUserById(
        profileId,
        { email }
    );
    if (authError) {
        throw new Error(`Failed to update login email: ${authError.message}`);
    }

    const { error: profileError } = await admin
        .from("profiles")
        .update({
            full_name: fullName,
            email,
            phone: phone || null,
            date_of_birth: dateOfBirth || null,
        })
        .eq("id", profileId);
    if (profileError) {
        throw new Error(profileError.message);
    }

    const { error: lecturerError } = await admin
        .from("lecturers")
        .update({
            staff_id: staffId,
            department_id: departmentId,
            title,
        })
        .eq("id", lecturerId);
    if (lecturerError) {
        throw new Error(lecturerError.message);
    }

    redirect(`/admin/lecturers/${lecturerId}`);
}