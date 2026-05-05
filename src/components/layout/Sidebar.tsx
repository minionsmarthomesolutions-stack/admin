"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Podcast,
  Settings,
  PlusCircle,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/dashboard/blog", label: "Add-Blog", icon: <Podcast size={18} strokeWidth={2.5} /> },
    { href: "/dashboard/products", label: "Add-Product", icon: <ShoppingBag size={18} strokeWidth={1} /> },
    { href: "/dashboard/services", label: "Add-Service", icon: <Settings size={18} strokeWidth={2.5} /> },
    { href: "/dashboard/categories/add", label: "Add-Category", icon: <PlusCircle size={18} strokeWidth={1.5} /> },
    { href: "/dashboard/banners", label: "Manage-Banner", icon: <Layers size={18} strokeWidth={1} /> },
    { href: "/dashboard/banners/add", label: "Add-Banner", icon: <ImageIcon size={18} strokeWidth={2} /> },
  ];

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* ── Mobile overlay backdrop ── */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar panel ── */}
      {/* Desktop: always visible, collapsible width */}
      {/* Mobile: slide-in overlay */}
      <aside
        className={[
          "bg-white border-r border-gray-200 flex flex-col h-full shadow-sm transition-all duration-300 ease-in-out",
          // Desktop behaviour
          "hidden md:flex",
          isSidebarOpen ? "md:w-[260px]" : "md:w-[80px]",
        ].join(" ")}
      >
        <SidebarContent
          isActive={isActive}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navLinks={navLinks}
          onLinkClick={() => {}}
        />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={[
          "md:hidden fixed top-0 left-0 h-full z-50 bg-white border-r border-gray-200 flex flex-col shadow-xl transition-transform duration-300 ease-in-out w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} className="text-gray-600" />
        </button>
        <SidebarContent
          isActive={isActive}
          isSidebarOpen={true}
          setSidebarOpen={() => {}}
          navLinks={navLinks}
          onLinkClick={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}

/* ── Inner content extracted so both desktop + mobile share it ── */
function SidebarContent({
  isActive,
  isSidebarOpen,
  setSidebarOpen,
  navLinks,
  onLinkClick,
}: {
  isActive: (p: string) => boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  navLinks: { href: string; label: string; icon: React.ReactNode }[];
  onLinkClick: () => void;
}) {
  return (
    <div className="mt-4 overflow-y-auto overflow-x-hidden flex flex-col flex-1">
      {/* Toggle Header */}
      <div
        className={`flex items-center py-4 bg-white cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${
          isSidebarOpen ? "px-6" : "justify-center px-0"
        }`}
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        title="Toggle Navigation"
      >
        <div className="flex items-center">
          <Archive className="text-gray-700 min-w-[20px]" size={22} fill="#334155" strokeWidth={1} />
          <div
            className={`flex flex-col text-[#0f172a] font-medium text-[15px] leading-[1.2] transition-opacity duration-300 overflow-hidden ${
              isSidebarOpen ? "opacity-100 ml-4 w-auto" : "opacity-0 w-0 ml-0"
            }`}
          >
            <span className="whitespace-nowrap">Content</span>
            <span className="whitespace-nowrap">Management</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-[#f8f9fa] flex flex-col pt-3 pb-4">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={`flex items-center gap-4 py-3 text-[15px] transition ${
              isSidebarOpen ? "px-10" : "justify-center px-0"
            } ${
              isActive(href)
                ? "text-[#f59e0b]"
                : "text-[#1e293b] hover:bg-gray-100"
            }`}
          >
            <span
              className={`min-w-[18px] ${
                isActive(href) ? "text-[#f59e0b]" : "text-[#334155]"
              }`}
            >
              {icon}
            </span>
            <span
              className={`transition-opacity duration-300 whitespace-nowrap ${
                isSidebarOpen ? "opacity-100" : "opacity-0 hidden w-0"
              }`}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Profile Footer */}
      <div className="border-b border-gray-100 p-4 shrink-0 bg-white mt-auto">
        <div
          className={`flex items-center gap-3 rounded-lg transition ${
            isSidebarOpen ? "p-2" : "justify-center p-0"
          }`}
        >
          <div className="min-w-[40px] h-[40px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-lg shadow">
            N
          </div>
          <div
            className={`flex flex-col flex-1 truncate transition-opacity duration-300 overflow-hidden ${
              isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 hidden w-0"
            }`}
          >
            <span className="text-sm font-bold text-[#1e293b] whitespace-nowrap">Admin User</span>
          </div>
        </div>
      </div>
    </div>
  );
}
