import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-shell relative flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <main className="hidden md:flex flex-1 min-h-0">
                <Sidebar />
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}