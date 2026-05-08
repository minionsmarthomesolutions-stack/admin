"use client";

import Link from "next/link";
import { Copy, Pencil, Trash2, Tag, Package } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const stockBadgeStyles: Record<string, string> = {
  in_stock: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  out_of_stock: "bg-red-50 text-red-600 border border-red-200",
  limited_stock: "bg-amber-50 text-amber-700 border border-amber-200",
};

const stockLabel: Record<string, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
  limited_stock: "Limited Stock",
};

export default function ProductCard({ product, onDelete, onDuplicate }: ProductCardProps) {
  const image = product.primaryImageUrl || product.imageUrl;
  const baseName = product.name.split("|")[0].trim();
  const priceUnitText = (product.priceUnit || "per-piece").replace("-", " ");
  const stockClass = stockBadgeStyles[product.stockStatus] || "bg-gray-100 text-gray-600";
  const stockText = stockLabel[product.stockStatus] || product.stockStatus;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={baseName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-gray-200" />
          </div>
        )}
        {/* Active/Inactive/Draft badge */}
        <div className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          product.status === 'draft' ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
          product.isActive ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"
        }`}>
          {product.status === 'draft' ? (
            <div className="flex items-center gap-1"><Tag size={10} /> Draft</div>
          ) : product.isActive ? "Active" : "Inactive"}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {baseName}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[#ffc800]">
            ₹{product.currentPrice.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && product.originalPrice > product.currentPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="text-[10px] text-gray-400">{priceUnitText}</span>
        </div>

        {/* Category */}
        {(product.mainCategory || product.category) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Tag size={11} />
            <span className="truncate">
              {product.mainCategory && product.category
                ? `${product.mainCategory} › ${product.category}`
                : product.category || product.mainCategory}
            </span>
          </div>
        )}

        {/* Stock badge */}
        <span className={`self-start mt-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${stockClass}`}>
          {stockText}
        </span>

        {/* Group ID */}
        {product.productGroupId && (
          <p className="text-[10px] text-gray-400 truncate">
            Group: <code className="font-mono">{product.productGroupId}</code>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/dashboard/products/${product.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          <Pencil size={13} />
          Edit
        </Link>
        <button
          onClick={() => onDuplicate(product.id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
        >
          <Copy size={13} />
          Copy
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}
