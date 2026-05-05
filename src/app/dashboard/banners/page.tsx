"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  BarChart2,
  Image as ImageIcon,
  Eye,
  Edit,
  Trash2,
  Layers,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      const res = await fetch(`/api/banners/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, isActive: newStatus } : b))
        );
      }
    } catch (e) {
      console.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete banner");
    }
    setIsDeleting(false);
    setBannerToDelete(null);
  };

  const filtered = banners.filter((b) => {
    const s = search.toLowerCase();
    return (
      !s ||
      b.title?.toLowerCase().includes(s) ||
      b.categoryId?.toLowerCase().includes(s)
    );
  });

  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.isActive).length;
  const singleBanners = banners.filter((b) => b.type === "single").length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-500 mt-1">Manage and organise your homepage banners</p>
        </div>
        <Link
          href="/dashboard/banners/add"
          className="bg-[#ffc800] text-white px-5 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} />
          Add New Banner
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Banners", value: totalBanners, color: "text-[#ffc800]" },
          { label: "Active Banners", value: activeBanners, color: "text-emerald-500" },
          { label: "Single Layout", value: singleBanners, color: "text-blue-500" },
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

      {/* ── Banners Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Banners</h2>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banners..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition w-64 bg-gray-50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <Layers className="text-gray-200 w-12 h-12" />
              <p className="text-gray-400 font-medium">Loading banners…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-yellow-50 text-[#ffc800] rounded-full flex items-center justify-center mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Banners Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {search ? "No banners match your search." : "Start by adding your first banner."}
            </p>
            {!search && (
              <Link
                href="/dashboard/banners/add"
                className="bg-yellow-50 text-[#ffc800] border border-yellow-200 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-100 transition"
              >
                Add First Banner
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((banner) => {
              const imageUrl =
                banner.banners?.a?.image ||
                banner.imageA ||
                null;

              return (
                <div
                  key={banner.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  {/* Image Area */}
                  <div className="relative h-44 bg-gray-50 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={banner.title || "Banner"}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <ImageIcon size={36} className="mb-2" />
                        <span className="text-sm text-gray-400">No Image</span>
                      </div>
                    )}

                    {/* Type badge */}
                    <span
                      className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        banner.type === "double"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {banner.type || "single"}
                    </span>

                    {/* Active badge */}
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        banner.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Draft"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-1 truncate">
                      {banner.title || "Untitled Banner"}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 truncate">
                      Category: {banner.categoryId || "—"}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleStatus(banner.id, !banner.isActive)}
                        title={banner.isActive ? "Set to Draft" : "Publish"}
                        className="text-gray-400 hover:text-[#ffc800] transition"
                      >
                        {banner.isActive ? (
                          <ToggleRight size={26} className="text-emerald-500" />
                        ) : (
                          <ToggleLeft size={26} />
                        )}
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/dashboard/banners/${banner.id}/edit`)}
                          className="text-gray-400 hover:text-blue-500 transition"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          disabled={isDeleting}
                          className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
