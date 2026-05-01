"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, BarChart2, Briefcase } from "lucide-react";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // This is currently a mockup since the database doesn't have a Services table yet!
  const stats = { total: 0, active: 0, groups: 0 };

  useEffect(() => {
    // Simulate loading to match the exact requested UI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-500 mt-1">Manage and organise your services</p>
        </div>
        <Link
          href="/dashboard/services/add"
          className="bg-[#ffc800] text-white px-5 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} />
          Add New Service
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Services", value: stats.total, color: "text-[#ffc800]" },
          { label: "Active Services", value: stats.active, color: "text-emerald-500" },
          { label: "Categories", value: stats.groups, color: "text-blue-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center"
          >
            <BarChart2 size={20} className={`${s.color} mb-2`} />
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Services Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Services</h2>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition w-64 bg-gray-50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <Briefcase className="text-gray-200 w-12 h-12" />
              <p className="text-gray-400 font-medium">Loading services…</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-yellow-50 text-[#ffc800] rounded-full flex items-center justify-center mb-4">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Services Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Start by adding your first service to your catalogue.
            </p>
            <Link
              href="/dashboard/services/add"
              className="bg-yellow-50 text-[#ffc800] border border-yellow-200 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-100 transition"
            >
              Add First Service
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
