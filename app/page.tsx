import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const profile = await getCurrentUser();

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "lecturer") redirect("/lecturer");
  redirect("/student");
}