"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Search, BarChart2, Briefcase, Pencil, Trash2, RefreshCw, Tag, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Service {
  id: string;
  name: string;
  slug?: string;
  serviceCode?: string;
  mainCategory?: string;
  category?: string;
  subcategory?: string;
  status?: "active" | "draft" | "inactive";
  galleryImages?: string[];
  createdAt?: string;
}

const StatusBadge = ({ status }: { status?: string }) => {
  if (status === "active")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Active</span>;
  if (status === "draft")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full"><Clock size={11} /> Draft</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full"><AlertCircle size={11} /> {status || "Unknown"}</span>;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/services");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setServices(prev => prev.filter(s => s.id !== id));
    } catch {
      alert("Failed to delete service. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = services.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.serviceCode?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase()) ||
    s.mainCategory?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: services.length,
    active: services.filter(s => s.status === "active").length,
    categories: [...new Set(services.map(s => s.mainCategory).filter(Boolean))].length,
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-500 mt-1">Manage and organise your services</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchServices}
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/dashboard/services/add"
            className="bg-[#ffc800] text-black px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
          >
            <PlusCircle size={20} />
            Add New Service
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Services",  value: stats.total,      color: "text-[#ffc800]",   icon: <BarChart2 size={20} /> },
          { label: "Active Services", value: stats.active,     color: "text-emerald-500", icon: <CheckCircle size={20} /> },
          { label: "Categories",      value: stats.categories, color: "text-blue-500",    icon: <Tag size={20} /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
            <span className={`${s.color} mb-2`}>{s.icon}</span>
            <div className={`text-3xl font-bold ${s.color}`}>{isLoading ? "—" : s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Services Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Services</h2>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition w-full bg-gray-50"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <Briefcase className="text-gray-200 w-12 h-12" />
              <p className="text-gray-400 font-medium">Loading services…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="text-red-400 w-10 h-10" />
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchServices} className="text-sm text-gray-500 underline hover:text-gray-700">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-yellow-50 text-[#ffc800] rounded-full flex items-center justify-center mb-4">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {search ? "No matching services" : "No Services Found"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {search ? `No services match "${search}".` : "Start by adding your first service to your catalogue."}
            </p>
            {!search && (
              <Link href="/dashboard/services/add" className="bg-yellow-50 text-[#ffc800] border border-yellow-200 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-100 transition">
                Add First Service
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 pl-2">Service</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((svc, idx) => (
                  <tr key={svc.id ?? `svc-${idx}`} className="hover:bg-gray-50/60 transition group">
                    {/* Name + thumbnail */}
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        {svc.galleryImages?.[0] ? (
                          <img src={svc.galleryImages[0]} alt={svc.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                            <Briefcase size={18} className="text-yellow-400" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 line-clamp-1">{svc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500 font-mono text-xs">{svc.serviceCode || "—"}</td>
                    <td className="py-3">
                      <span className="text-gray-600 text-xs">
                        {[svc.mainCategory, svc.category, svc.subcategory].filter(Boolean).join(" › ") || "—"}
                      </span>
                    </td>
                    <td className="py-3"><StatusBadge status={svc.status} /></td>
                    <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                      {svc.createdAt ? new Date(svc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={svc.id ? `/dashboard/services/${svc.id}/edit` : '#'}
                          className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition ${!svc.id ? 'opacity-30 pointer-events-none' : ''}`}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => svc.id && handleDelete(svc.id, svc.name)}
                          disabled={!svc.id || deletingId === svc.id}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition disabled:opacity-40"
                          title="Delete"
                        >
                          {deletingId === svc.id
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-4 text-right">
              Showing {filtered.length} of {services.length} service{services.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
