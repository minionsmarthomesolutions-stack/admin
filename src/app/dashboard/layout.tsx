import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Dynamic Sidebar */}
      <Sidebar />
      
      {/* Main Content Content */}
      <main className="flex-1 flex flex-col w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 hidden">
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
