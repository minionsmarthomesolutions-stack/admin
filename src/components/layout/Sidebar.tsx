"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Archive, 
  Podcast,
  PackageOpen,
  Settings,
  PlusCircle,
  Layers,
  Image as ImageIcon,
  ShoppingBag
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Helper to check if a path is active
  const isActive = (path: string) => pathname === path;

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col h-full shadow-sm transition-all duration-300 ease-in-out relative ${isSidebarOpen ? 'w-[260px]' : 'w-[80px]'}`}>
      <div className="mt-4 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Toggle Header (Horizontal Collapse) */}
        <div 
          className={`flex items-center py-4 bg-white cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${isSidebarOpen ? 'px-6' : 'justify-center px-0'}`}
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          title="Toggle Navigation"
        >
          <div className="flex items-center">
            <Archive className="text-gray-700 min-w-[20px]" size={22} fill="#334155" strokeWidth={1} />
            <div className={`flex flex-col text-[#0f172a] font-medium text-[15px] leading-[1.2] transition-opacity duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100 ml-4 w-auto' : 'opacity-0 w-0 ml-0'}`}>
              <span className="whitespace-nowrap">Content</span>
              <span className="whitespace-nowrap">Management</span>
            </div>
          </div>
        </div>

        {/* Navigation Content (Always Vertically Open) */}
        <div className="bg-[#f8f9fa] flex flex-col pt-3 pb-4">
          <Link 
            href="/dashboard/blog/add" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/blog/add') ? 'text-[#f59e0b]' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <Podcast size={18} strokeWidth={2.5} className={`min-w-[18px] ${isActive('/dashboard/blog/add') ? 'text-[#f59e0b]' : 'text-[#334155]'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Add-Blog</span>
          </Link>

          <Link 
            href="/dashboard/products" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/products') ? 'text-[#f59e0b]' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <ShoppingBag size={18} fill={isActive('/dashboard/products') ? '#f59e0b' : '#334155'} strokeWidth={1} className={`min-w-[18px] ${isActive('/dashboard/products') ? 'text-[#f59e0b]' : 'text-[#334155]'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Manage-Products</span>
          </Link>

          <Link 
            href="/dashboard/products/add" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/products/add') ? 'text-[#f59e0b]' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <PackageOpen size={18} fill={isActive('/dashboard/products/add') ? '#f59e0b' : '#334155'} strokeWidth={1} className={`min-w-[18px] ${isActive('/dashboard/products/add') ? 'text-[#f59e0b]' : 'text-[#334155]'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Add-Product</span>
          </Link>

          <Link 
            href="/dashboard/services/add" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/services/add') ? 'text-[#f59e0b]' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <Settings size={18} strokeWidth={2.5} className={`min-w-[18px] ${isActive('/dashboard/services/add') ? 'text-[#f59e0b]' : 'text-[#334155]'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Add-Service</span>
          </Link>

          <Link 
            href="/dashboard/categories/add" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/categories/add') ? 'text-[#f59e0b]' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <PlusCircle size={18} fill={isActive('/dashboard/categories/add') ? '#f59e0b' : '#334155'} strokeWidth={1.5} className={`min-w-[18px] ${isActive('/dashboard/categories/add') ? 'text-[#f59e0b]' : 'text-white'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Add-Category</span>
          </Link>

          <Link 
            href="/dashboard/banners" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/banners') ? 'text-[#f59e0b]' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <Layers size={18} fill={isActive('/dashboard/banners') ? '#f59e0b' : '#334155'} strokeWidth={1} className={`min-w-[18px] ${isActive('/dashboard/banners') ? 'text-[#f59e0b]' : 'text-white'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Manage-Banner</span>
          </Link>

          <Link 
            href="/dashboard/banners/add" 
            className={`flex items-center gap-4 py-3 text-[15px] transition ${isSidebarOpen ? 'px-10' : 'justify-center px-0'} ${isActive('/dashboard/banners/add') ? 'text-[#fbbf24] font-medium' : 'text-[#1e293b] hover:bg-gray-100'}`}
          >
            <ImageIcon size={18} fill={isActive('/dashboard/banners/add') ? '#fbbf24' : 'transparent'} strokeWidth={2} className={`min-w-[18px] ${isActive('/dashboard/banners/add') ? 'text-[#fbbf24]' : 'text-[#334155]'}`} />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>Add-Banner</span>
          </Link>
        </div>
        
        {/* Profile Footer */}
        <div className="border-b border-gray-100 p-4 shrink-0 bg-white">
          <div className={`flex items-center gap-3 rounded-lg transition ${isSidebarOpen ? 'p-2' : 'justify-center p-0'}`}>
            <div className="min-w-[40px] h-[40px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-lg shadow">
              N
            </div>
            <div className={`flex flex-col flex-1 truncate transition-opacity duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 hidden w-0'}`}>
              <span className="text-sm font-bold text-[#1e293b] whitespace-nowrap">Admin User</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
