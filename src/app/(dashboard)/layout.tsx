import { requireAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Enforce session check on the server
  const user = await requireAuth();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
        {/* Dynamic Sidebar Component */}
        <Sidebar user={user} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header Component */}
          <Header user={user} />

          {/* Children Dashboard Pages */}
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
