"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Podcast,
  ShoppingBag,
  Settings,
  Tag,
  Layers,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/blog",            label: "Blog",        Icon: Podcast,      fill: true  },
  { href: "/dashboard/products",        label: "Products",    Icon: ShoppingBag,  fill: true  },
  { href: "/dashboard/services",        label: "Services",    Icon: Settings,     fill: false },
  { href: "/dashboard/categories",     label: "Categories",  Icon: Tag,          fill: false },
  { href: "/dashboard/banners",         label: "Banners",     Icon: Layers,       fill: true  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  // Highlight if current path starts with the nav item's href
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col h-full shadow-sm transition-all duration-300 ease-in-out ${
        open ? "w-[240px]" : "w-[68px]"
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">

        {/* Brand / toggle */}
        <div
          onClick={() => setOpen(!open)}
          className={`flex items-center py-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
            open ? "px-6" : "justify-center px-0"
          }`}
          title="Toggle Navigation"
        >
          <Archive size={22} className="text-gray-700 min-w-[22px]" fill="#334155" strokeWidth={1} />
          <div
            className={`flex flex-col text-[#0f172a] font-semibold text-[14px] leading-[1.2] transition-all duration-300 overflow-hidden ${
              open ? "opacity-100 ml-4 w-auto" : "opacity-0 w-0 ml-0"
            }`}
          >
            <span className="whitespace-nowrap">Content</span>
            <span className="whitespace-nowrap text-[#ffc800]">Management</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="bg-[#f8f9fa] flex flex-col pt-2 pb-4 flex-1">
          {navItems.map(({ href, label, Icon, fill }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 py-3 text-[14px] font-medium transition-colors ${
                  open ? "px-8" : "justify-center px-0"
                } ${
                  active
                    ? "text-[#f59e0b] bg-amber-50"
                    : "text-[#1e293b] hover:bg-gray-100"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={fill ? 1 : 2}
                  fill={fill ? (active ? "#f59e0b" : "#334155") : "none"}
                  className={`min-w-[19px] ${active ? "text-[#f59e0b]" : "text-[#334155]"}`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div
            className={`flex items-center gap-3 rounded-lg ${
              open ? "p-2" : "justify-center p-0"
            }`}
          >
            <div className="min-w-[40px] h-[40px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-lg shadow">
              N
            </div>
            <div
              className={`flex flex-col flex-1 truncate transition-all duration-300 overflow-hidden ${
                open ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              <span className="text-sm font-bold text-[#1e293b] whitespace-nowrap">Admin User</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">Administrator</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
