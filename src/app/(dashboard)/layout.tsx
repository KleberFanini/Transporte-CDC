import Sidebar from "@/components/Sidebar/sidebar";
import Topbar from "@/components/Topbar/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}