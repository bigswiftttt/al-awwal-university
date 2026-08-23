import { requireRole } from "@/lib/actions/auth";
import Link from "next/link";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/students", label: "Students", icon: "school" },
    { href: "/admin/lecturers", label: "Lecturers", icon: "source" },
    { href: "/admin/faculties", label: "Faculties", icon: "account_balance" },
    { href: "/admin/courses", label: "Courses", icon: "menu_book" },
    { href: "/admin/fees", label: "Fees", icon: "payments" },
    { href: "/admin/sessions", label: "Sessions", icon: "calendar_month" },
    { href: "/admin/assignments", label: "Assignments", icon: "assignment_ind" },
    { href: "/admin/advisers", label: "HODs & Advisers", icon: "verified_user" },
    { href: "/admin/registrations", label: "Registrations", icon: "how_to_reg" },

];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await requireRole("admin");

    return (
        <div className="bg-background text-on-background antialiased flex h-screen overflow-hidden">
            {/* Sidebar (Desktop) */}
            <nav className="hidden md:flex flex-col bg-surface w-[260px] h-full fixed left-0 top-0 border-r border-outline-variant z-50">
                <div className="p-6 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold">
                            A
                        </div>
                        <div>
                            <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                                AAU Admin
                            </h2>
                            <p className="font-label-md text-label-md text-secondary">
                                {profile.full_name}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col h-full py-6 gap-3 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-4 py-sm text-secondary hover:bg-surface-container-high transition-all duration-200 ease-in-out mx-2 rounded-r-full data-[active=true]:bg-primary-container data-[active=true]:text-on-primary-container data-[active=true]:border-l-4 data-[active=true]:border-primary"
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-label-md text-label-md">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 flex flex-col md:ml-[260px] h-screen overflow-hidden">
                <header className="bg-surface/80 backdrop-blur-md top-0 sticky z-40 border-b border-outline-variant flex justify-between items-center px-10 py-4">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-secondary hover:text-on-surface cursor-pointer active:opacity-70 transition-colors">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                            Al Awwal University
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-secondary hover:text-primary transition-colors cursor-pointer active:opacity-70 flex items-center gap-2">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="font-label-md text-label-md hidden sm:inline">
                                Notifications
                            </span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-background">
                    <div className="max-w-[1440px] mx-auto space-y-lg pb-20 md:pb-0">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom nav (Mobile) */}
            <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface border-t border-outline-variant shadow-lg flex justify-around items-center h-16 px-3">
                {NAV_ITEMS.slice(0, 4).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center text-secondary scale-95 transition-transform w-16 rounded-xl py-1"
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-label-sm text-label-sm mt-1">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}