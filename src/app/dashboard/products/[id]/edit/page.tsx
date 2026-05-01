"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, PlusCircle, Trash2, Package, Upload, X, ChevronDown, Info } from "lucide-react";

const STOCK_OPTIONS = [
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "limited_stock", label: "Limited Stock" },
];
const PRICE_UNITS = ["per-piece","per-set","per-pair","per-kg","per-litre","per-box","per-pack","per-metre","per-sqft"];
const GST_RATES = ["0","5","12","18","28"];

interface Spec { name: string; value: string }

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([""]);
  const [services, setServices] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [specifications, setSpecifications] = useState<Spec[]>([{ name: "", value: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setImagePreview(data.primaryImageUrl || data.imageUrl || "");
        setThumbnails(data.thumbnailUrls || []);
        setMaterials(data.materials?.length ? data.materials : [""]);
        setServices(data.services?.length ? data.services : [""]);
        setFeatures(data.features?.length ? data.features : [""]);
        setSpecifications(
          Array.isArray(data.specifications) && data.specifications.length
            ? data.specifications
            : [{ name: "", value: "" }]
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [params.id]);

  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { const src = reader.result as string; setImagePreview(src); set("primaryImageUrl", src); };
    reader.readAsDataURL(file);
  };

  const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnails((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => { const src = reader.result as string; setImagePreview(src); set("primaryImageUrl", src); };
    reader.readAsDataURL(file);
  };

  const updateArr = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, val: T) =>
    setter((prev) => prev.map((x, i) => (i === idx ? val : x)));
  const addArr = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, blank: T) =>
    setter((prev) => [...prev, blank]);
  const removeArr = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form) return;
    setIsSaving(true);
    try {
      const body = {
        ...form,
        currentPrice: Number(form.currentPrice),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        quantity: form.quantity ? Number(form.quantity) : 0,
        thumbnailUrls: thumbnails,
        materials: materials.filter(Boolean),
        services: services.filter(Boolean),
        features: features.filter(Boolean),
        specifications: specifications.filter((s) => s.name || s.value),
      };
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { router.push("/dashboard/products"); router.refresh(); }
      else alert("Failed to update product.");
    } catch { alert("An error occurred."); }
    setIsSaving(false);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition bg-gray-50";
  const label = "block text-xs font-semibold text-gray-700 mb-1.5";
  const card = "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6";
  const sectionTitle = "text-base font-bold text-gray-900 mb-5 flex items-center gap-2";

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Package className="text-gray-200 w-12 h-12" />
        <p className="text-gray-400 font-medium">Loading product…</p>
      </div>
    </div>
  );

  if (!form) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Product not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-[#ffc800]" /> Edit Product
          </h1>
        </div>
        <Link href="/dashboard/products" className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition">Cancel</Link>
      </header>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 pt-8">

        {/* Basic Information */}
        <div className={card}>
          <p className={sectionTitle}><Info size={16} className="text-[#ffc800]" />Basic Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={label}>Product Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g., Smart LED Bulb" className={inp} />
            </div>
            <div>
              <label className={label}>Colour / Variant Name</label>
              <input type="text" value={form.colorVariant || ""} onChange={(e) => set("colorVariant", e.target.value)} placeholder="e.g., Warm White 9W" className={inp} />
            </div>
            <div>
              <label className={label}>Product Group ID</label>
              <input type="text" value={form.productGroupId || ""} onChange={(e) => set("productGroupId", e.target.value)} placeholder="Group identifier" className={inp} />
            </div>
            <div>
              <label className={label}>Brand</label>
              <input type="text" value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} placeholder="e.g., Philips" className={inp} />
            </div>
            <div>
              <label className={label}>Badge / Label</label>
              <input type="text" value={form.badge || ""} onChange={(e) => set("badge", e.target.value)} placeholder="e.g., Best Seller" className={inp} />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className={card}>
          <p className={sectionTitle}><span className="text-[#ffc800] font-bold text-lg">₹</span>Pricing &amp; Stock</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className={label}>Selling Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" value={form.currentPrice || ""} onChange={(e) => set("currentPrice", e.target.value)} placeholder="0.00" className={inp} />
            </div>
            <div>
              <label className={label}>Original / MRP (₹)</label>
              <input type="number" min="0" step="0.01" value={form.originalPrice || ""} onChange={(e) => set("originalPrice", e.target.value)} placeholder="0.00" className={inp} />
            </div>
            <div>
              <label className={label}>Price Unit</label>
              <select value={form.priceUnit || "per-piece"} onChange={(e) => set("priceUnit", e.target.value)} className={inp}>
                {PRICE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Stock Status</label>
              <select value={form.stockStatus || "in_stock"} onChange={(e) => set("stockStatus", e.target.value)} className={inp}>
                {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Quantity</label>
              <input type="number" min="0" value={form.quantity || ""} onChange={(e) => set("quantity", e.target.value)} placeholder="0" className={inp} />
            </div>
            <div>
              <label className={label}>GST Rate (%)</label>
              <select value={form.gstRate || "18"} onChange={(e) => set("gstRate", e.target.value)} className={inp}>
                {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className={label}>HSN Code</label>
              <input type="text" value={form.hsnCode || ""} onChange={(e) => set("hsnCode", e.target.value)} placeholder="e.g., 853931" className={inp} />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className={card}>
          <p className={sectionTitle}><ChevronDown size={16} className="text-[#ffc800]" />Category</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={label}>Main Category</label>
              <input type="text" value={form.mainCategory || ""} onChange={(e) => set("mainCategory", e.target.value)} placeholder="e.g., Lighting" className={inp} />
            </div>
            <div>
              <label className={label}>Category</label>
              <input type="text" value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g., LED Bulbs" className={inp} />
            </div>
            <div>
              <label className={label}>Subcategory</label>
              <input type="text" value={form.subcategory || ""} onChange={(e) => set("subcategory", e.target.value)} placeholder="e.g., Smart Bulbs" className={inp} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className={card}>
          <p className={sectionTitle}><Upload size={16} className="text-[#ffc800]" />Product Images</p>
          <div className="mb-5">
            <label className={label}>Primary / Cover Image</label>
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => primaryInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-200 rounded-2xl h-52 flex items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/30 transition bg-gray-50">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Primary Preview" className="h-full w-full object-contain rounded-xl p-2" />
                  <button type="button" onClick={(ev) => { ev.stopPropagation(); setImagePreview(""); set("primaryImageUrl", ""); }}
                    className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-red-50 transition">
                    <X size={14} className="text-red-500" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <Upload size={28} className="text-gray-300" />
                  <p className="text-sm text-gray-400"><span className="text-[#ffc800] font-semibold">Click to upload</span> or drag &amp; drop</p>
                </div>
              )}
            </div>
            <input ref={primaryInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <div>
            <label className={label}>Additional Thumbnails</label>
            <div className="flex flex-wrap gap-3">
              {thumbnails.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                  <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeArr(setThumbnails, i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow border border-gray-100 hover:bg-red-50 transition">
                    <X size={11} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => thumbInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-yellow-400 hover:text-yellow-500 transition">
                <PlusCircle size={22} />
              </button>
            </div>
            <input ref={thumbInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleThumbUpload} />
          </div>
        </div>

        {/* Description */}
        <div className={card}>
          <p className={sectionTitle}><Info size={16} className="text-[#ffc800]" />Description</p>
          <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the product…" rows={5} className={`${inp} resize-y`} />
        </div>

        {/* Specifications */}
        <div className={card}>
          <p className={sectionTitle}><Info size={16} className="text-[#ffc800]" />Specifications</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left font-semibold py-2 pr-4 w-1/2">Name</th>
                <th className="text-left font-semibold py-2 pr-4 w-1/2">Value</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 pr-3">
                    <input type="text" value={spec.name} onChange={(e) => updateArr(setSpecifications, i, { ...spec, name: e.target.value })} placeholder="e.g., Power" className={inp} />
                  </td>
                  <td className="py-2 pr-3">
                    <input type="text" value={spec.value} onChange={(e) => updateArr(setSpecifications, i, { ...spec, value: e.target.value })} placeholder="e.g., 9W" className={inp} />
                  </td>
                  <td className="py-2">
                    <button type="button" onClick={() => removeArr(setSpecifications, i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => addArr(setSpecifications, { name: "", value: "" })}
            className="mt-3 flex items-center gap-2 text-sm text-[#ffc800] hover:text-yellow-600 font-semibold transition">
            <PlusCircle size={16} /> Add Specification
          </button>
        </div>

        {/* Materials / Services / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {(
            [
              { title: "Materials", items: materials, setter: setMaterials as React.Dispatch<React.SetStateAction<string[]>>, placeholder: "e.g., Polycarbonate" },
              { title: "Services Included", items: services, setter: setServices as React.Dispatch<React.SetStateAction<string[]>>, placeholder: "e.g., Free Installation" },
              { title: "Key Features", items: features, setter: setFeatures as React.Dispatch<React.SetStateAction<string[]>>, placeholder: "e.g., Energy Saving" },
            ] as Array<{ title: string; items: string[]; setter: React.Dispatch<React.SetStateAction<string[]>>; placeholder: string }>
          ).map(({ title, items, setter, placeholder }) => (
            <div key={title} className={`${card} mb-0`}>
              <p className={sectionTitle}>{title}</p>
              <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={item} onChange={(e) => updateArr(setter, i, e.target.value)} placeholder={placeholder} className={`${inp} flex-1`} />
                    <button type="button" onClick={() => removeArr(setter, i)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => addArr(setter, "")}
                className="mt-3 flex items-center gap-1.5 text-sm text-[#ffc800] hover:text-yellow-600 font-semibold transition">
                <PlusCircle size={15} /> Add
              </button>
            </div>
          ))}
        </div>

        {/* Shipping & Warranty */}
        <div className={card}>
          <p className={sectionTitle}><Info size={16} className="text-[#ffc800]" />Shipping &amp; Warranty</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={label}>Estimated Delivery</label>
              <input type="text" value={form.estimatedDelivery || ""} onChange={(e) => set("estimatedDelivery", e.target.value)} placeholder="e.g., 3–5 business days" className={inp} />
            </div>
            <div>
              <label className={label}>Warranty</label>
              <input type="text" value={form.warranty || ""} onChange={(e) => set("warranty", e.target.value)} placeholder="e.g., 1 Year Manufacturer" className={inp} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <div onClick={() => set("freeShipping", !form.freeShipping)}
                className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${form.freeShipping ? "bg-[#ffc800]" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.freeShipping ? "left-5" : "left-0.5"}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">Free Shipping &amp; Returns</span>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className={card}>
          <p className={sectionTitle}>Visibility &amp; Status</p>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={label}>Product Status</label>
              <select value={form.status || "active"} onChange={(e) => set("status", e.target.value)} className={inp}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <div onClick={() => set("isActive", !form.isActive)}
                className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${form.isActive ? "bg-[#ffc800]" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">Visible on Store</span>
            </div>
          </div>
        </div>
      </form>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-6 py-4 flex justify-end gap-3 z-50">
        <Link href="/dashboard/products" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</Link>
        <button onClick={() => handleSubmit()} disabled={isSaving}
          className="px-8 py-2.5 rounded-xl bg-[#ffc800] text-white text-sm font-bold hover:bg-yellow-500 transition shadow-sm disabled:opacity-60 flex items-center gap-2">
          {isSaving ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>) : (<><Save size={16} />Update Product</>)}
        </button>
      </div>
    </div>
  );
}
