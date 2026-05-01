"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Package, Search, BarChart2, X } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import DeleteProductModal from "@/components/products/DeleteProductModal";

interface Product {
  id: string;
  name: string;
  productGroupId?: string | null;
  currentPrice: number;
  originalPrice?: number | null;
  priceUnit: string;
  stockStatus: string;
  mainCategory?: string | null;
  category?: string | null;
  primaryImageUrl?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  status: string;
  colorVariant?: string | null;
}

interface Stats {
  total: number;
  active: number;
  groups: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, groups: 0 });

  const fetchProducts = useCallback(async (q = "", gid = "") => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (gid) params.set("groupId", gid);
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);
        // Compute stats
        const active = data.filter((p) => p.isActive).length;
        const groups = new Set(
          data.filter((p) => p.productGroupId && !p.productGroupId.startsWith("__solo_")).map((p) => p.productGroupId)
        ).size;
        setStats({ total: data.length, active, groups });
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (val: string) => {
    setSearch(val);
    fetchProducts(val, selectedGroupId || "");
  };

  const clearGroup = () => {
    setSelectedGroupId(null);
    fetchProducts(search, "");
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicate this product? A copy (without categories) will be created.")) return;
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        fetchProducts(search, selectedGroupId || "");
      } else {
        alert("Failed to duplicate product.");
      }
    } catch {
      alert("Error duplicating product.");
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
        setStats((s) => ({ ...s, total: s.total - 1 }));
      } else {
        alert("Failed to delete product.");
      }
    } catch {
      alert("Error deleting product.");
    }
    setIsDeleting(false);
    setProductToDelete(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 mt-1">Manage and organise your product catalogue</p>
        </div>
        <Link
          href="/dashboard/products/add"
          className="bg-[#ffc800] text-white px-5 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} />
          Add New Product
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Products", value: stats.total, color: "text-[#ffc800]" },
          { label: "Active Products", value: stats.active, color: "text-emerald-500" },
          { label: "Total Groups", value: stats.groups, color: "text-blue-500" },
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

      {/* ── Products Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Products</h2>
          <div className="flex items-center gap-3">
            {/* Active group filter badge */}
            {selectedGroupId && (
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-full font-medium">
                <span className="truncate max-w-[120px]">Group: {selectedGroupId}</span>
                <button onClick={clearGroup} className="hover:text-red-500 transition">
                  <X size={13} />
                </button>
              </div>
            )}
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search name, category, group…"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition w-64 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <Package className="text-gray-200 w-12 h-12" />
              <p className="text-gray-400 font-medium">Loading products…</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-yellow-50 text-[#ffc800] rounded-full flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {search ? "No products match your search. Try a different keyword." : "Start by adding your first product."}
            </p>
            {!search && (
              <Link
                href="/dashboard/products/add"
                className="bg-yellow-50 text-[#ffc800] border border-yellow-200 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-100 transition"
              >
                Add First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={setProductToDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {productToDelete && (
        <DeleteProductModal
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
