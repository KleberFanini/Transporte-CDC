import Sidebar from "@/components/Sidebar/sidebar";
import Topbar from "@/components/Topbar/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#F5F3EF]">
            <Sidebar />
            <div className="flex-1 flex flex-col  min-w-0">
                <Topbar />
                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}