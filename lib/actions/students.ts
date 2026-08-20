"use server";

import { requireRole } from "@/lib/actions/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function updateStudent(studentId: string, formData: FormData) {
    await requireRole("admin");

    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const matricNumber = formData.get("matric_number") as string;
    const programmeId = formData.get("programme_id") as string;
    const level = Number(formData.get("level"));
    const status = formData.get("status") as string;
    const profileId = formData.get("profile_id") as string;

    const admin = createAdminClient();

    // 1. Update auth email if changed (this is the login credential)
    const { error: authError } = await admin.auth.admin.updateUserById(
        profileId,
        { email }
    );
    if (authError) {
        throw new Error(`Failed to update login email: ${authError.message}`);
    }

    // 2. Update profile (email kept in sync manually — the trigger only
    //    fires on insert, not on auth email changes)
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

    // 3. Update student record
    const { error: studentError } = await admin
        .from("students")
        .update({
            matric_number: matricNumber,
            programme_id: programmeId,
            level,
            status,
        })
        .eq("id", studentId);
    if (studentError) {
        throw new Error(studentError.message);
    }

    redirect(`/admin/students/${studentId}`);
}

export async function createStudent(formData: FormData) {
    // Verify the CALLER is an admin using their real session first.
    // The admin client below bypasses RLS, so this check is the only gate.
    await requireRole("admin");

    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const matricNumber = formData.get("matric_number") as string;
    const programmeId = formData.get("programme_id") as string;
    const level = Number(formData.get("level"));
    const admissionYear = Number(formData.get("admission_year"));

    const admin = createAdminClient();

    // 1. Create the real auth user (triggers handle_new_user -> profiles row)
    const { data: userData, error: userError } =
        await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: "student" },
        });

    if (userError || !userData.user) {
        throw new Error(userError?.message ?? "Failed to create user account");
    }

    // 2. Create the student record linked to that profile
    const { error: studentError } = await admin.from("students").insert({
        profile_id: userData.user.id,
        matric_number: matricNumber,
        programme_id: programmeId,
        level,
        admission_year: admissionYear,
        status: "active",
    });

    if (studentError) {
        // Roll back the orphaned auth user if the student insert failed
        await admin.auth.admin.deleteUser(userData.user.id);
        throw new Error(studentError.message);
    }

    redirect("/admin/students");
}