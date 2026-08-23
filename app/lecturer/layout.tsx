import { requireRole } from "@/lib/actions/auth";

export default async function LecturerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await requireRole("lecturer");

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-surface border-b border-outline-variant px-6 py-4 flex items-center justify-between">
                <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                    Al Awwal University — Lecturer
                </h1>
                <span className="font-label-md text-label-md text-secondary">
                    {profile.full_name}
                </span>
            </header>
            <main className="p-6 max-w-5xl mx-auto">{children}</main>
        </div>
    );
}