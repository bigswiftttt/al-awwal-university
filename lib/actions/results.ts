"use server";

import { getCurrentUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { calculateGrade } from "@/lib/utils/grades";
import { revalidatePath } from "next/cache";

export async function submitResult(formData: FormData) {
    const profile = await getCurrentUser();
    if (!profile) throw new Error("Not authenticated");

    const registrationId = formData.get("registration_id") as string;
    const score = Number(formData.get("score"));

    if (score < 0 || score > 100) {
        throw new Error("Score must be between 0 and 100");
    }

    const { grade, gradePoint } = calculateGrade(score);
    const supabase = await createClient();

    // Upsert: RLS insert policy covers first submission, update policy
    // (status = 'pending' only) covers edits before approval.
    const { error } = await supabase.from("results").upsert(
        {
            registration_id: registrationId,
            score,
            grade,
            grade_point: gradePoint,
            status: "pending",
            submitted_by: profile.id,
            submitted_at: new Date().toISOString(),
        },
        { onConflict: "registration_id" }
    );
    if (error) throw new Error(error.message);

    revalidatePath("/lecturer/results");
}

export async function approveResult(id: string) {
    const profile = await getCurrentUser();
    if (!profile) throw new Error("Not authenticated");

    const supabase = await createClient();
    const { error } = await supabase
        .from("results")
        .update({
            status: "approved",
            approved_by: profile.id,
            approved_at: new Date().toISOString(),
        })
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/lecturer/approvals");
}

export async function rejectResult(id: string, formData: FormData) {
    const profile = await getCurrentUser();
    if (!profile) throw new Error("Not authenticated");

    const reason = formData.get("rejection_reason") as string;
    const supabase = await createClient();
    const { error } = await supabase
        .from("results")
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