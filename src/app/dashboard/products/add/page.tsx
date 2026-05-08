"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import RichEditor, { RichEditorHandle } from "@/components/ui/RichEditor";

/* ─────────────────────────── types ─────────────────────────── */
interface Spec  { name: string; value: string }
interface Detail { name: string; value: string }
interface ColorVariant {
  id: number;
  variantName: string;
  originalPrice: string;
  discountPrice: string;
  priceUnit: string;
  seoTags: string;
  primaryImage: string;
  thumbnails: string[];
  details: Detail[];
}
interface MaterialVariant {
  id: number;
  materialName: string;
  originalPrice: string;
  discountPrice: string;
  priceUnit: string;
  seoTags: string;
  primaryImage: string;
  thumbnails: string[];
}


/* ─────────────────────── main component ─────────────────────── */
export default function AddProductPage() {
  const router = useRouter();

  /* description editor ref */
  const descRef = useRef<RichEditorHandle>(null);

  /* category state */
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [openCats, setOpenCats]     = useState<string[]>([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedCat, setSelectedCat]   = useState("");
  const [selectedSub, setSelectedSub]   = useState("");

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCategoriesData(data);
    }).catch(console.error);
  }, []);

  /* Draft hooks moved down below state declarations */

  /* global basics */
  const [productName, setProductName]   = useState("");
  const [gstRate, setGstRate]           = useState("18");
  const [hsnCode, setHsnCode]           = useState("");
  const [vendor, setVendor]             = useState("");
  const [brandName, setBrandName]       = useState("");
  const [stockStatus, setStockStatus]   = useState("in-stock");
  const [quantity, setQuantity]         = useState("1");
  const [estDelivery, setEstDelivery]   = useState("");
  const [freeShipping, setFreeShipping] = useState("");

  /* specs */
  const [specs, setSpecs] = useState<Spec[]>([{ name: "", value: "" }]);

  /* color variants */
  const [variants, setVariants] = useState<ColorVariant[]>([{
    id: 0, variantName: "", originalPrice: "", discountPrice: "",
    priceUnit: "per-piece", seoTags: "", primaryImage: "", thumbnails: [],
    details: [{ name: "", value: "" }],
  }]);

  /* materials */
  const [materials, setMaterials] = useState<MaterialVariant[]>([{
    id: 0, materialName: "Material 1", originalPrice: "", discountPrice: "",
    priceUnit: "per-piece", seoTags: "", primaryImage: "", thumbnails: [],
  }]);

  /* combinations */
  const [combinations, setCombinations]   = useState<{title:string;products:string[]}[]>([]);
  const [showCombInput, setShowCombInput] = useState(false);

  /* seo & badge */
  const [seoTags, setSeoTags] = useState("");
  const [badge, setBadge]     = useState("");

  const [isSaving, setIsSaving] = useState(false);

  /* Draft auto-save */
  const DRAFT_KEY = 'minion-add-product-draft-tsx-v1';
  
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'unsaved'>('idle');
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const getDraftPayload = useCallback(() => ({
    productName, gstRate, hsnCode, vendor, brandName, stockStatus, quantity, estDelivery, freeShipping,
    specs, variants, materials, combinations, seoTags, badge, selectedMain, selectedCat, selectedSub,
    description: descRef.current?.getHTML() ?? null
  }), [productName, gstRate, hsnCode, vendor, brandName, stockStatus, quantity, estDelivery, freeShipping, specs, variants, materials, combinations, seoTags, badge, selectedMain, selectedCat, selectedSub]);

  const saveDraftToStorage = useCallback((payload: ReturnType<typeof getDraftPayload>) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ payload, savedAt: new Date().toISOString() }));
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDraftTime(t);
      setDraftStatus('saved');
    } catch {
      setDraftStatus('unsaved');
    }
  }, []);

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftStatus('idle');
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const { payload } = JSON.parse(raw);
      if (payload.productName !== undefined) setProductName(payload.productName);
      if (payload.gstRate !== undefined) setGstRate(payload.gstRate);
      if (payload.hsnCode !== undefined) setHsnCode(payload.hsnCode);
      if (payload.vendor !== undefined) setVendor(payload.vendor);
      if (payload.brandName !== undefined) setBrandName(payload.brandName);
      if (payload.stockStatus !== undefined) setStockStatus(payload.stockStatus);
      if (payload.quantity !== undefined) setQuantity(payload.quantity);
      if (payload.estDelivery !== undefined) setEstDelivery(payload.estDelivery);
      if (payload.freeShipping !== undefined) setFreeShipping(payload.freeShipping);
      if (payload.specs !== undefined) setSpecs(payload.specs);
      if (payload.variants !== undefined) setVariants(payload.variants);
      if (payload.materials !== undefined) setMaterials(payload.materials);
      if (payload.combinations !== undefined) setCombinations(payload.combinations);
      if (payload.seoTags !== undefined) setSeoTags(payload.seoTags);
      if (payload.badge !== undefined) setBadge(payload.badge);
      if (payload.selectedMain !== undefined) setSelectedMain(payload.selectedMain);
      if (payload.selectedCat !== undefined) setSelectedCat(payload.selectedCat);
      if (payload.selectedSub !== undefined) setSelectedSub(payload.selectedSub);
      if (payload.description !== undefined && descRef.current) {
        setTimeout(() => descRef.current?.setHTML(payload.description), 500);
      }
      setHasDraft(false);
      setDraftStatus('saved');
    } catch {
      setHasDraft(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const { savedAt } = JSON.parse(raw);
        const t = new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftTime(t);
        setHasDraft(true);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setDraftStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const payload = getDraftPayload();
    autoSaveTimerRef.current = setTimeout(() => saveDraftToStorage(payload), 5000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [productName, gstRate, hsnCode, vendor, brandName, stockStatus, quantity, estDelivery, freeShipping, specs, variants, materials, combinations, seoTags, badge, selectedMain, selectedCat, selectedSub, getDraftPayload, saveDraftToStorage]);

  /* ── category helpers ── */
  const toggleCat = (name: string) =>
    setOpenCats(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);

  /* ── spec helpers ── */
  const addSpec = () => setSpecs(p => [...p, { name: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(p => p.filter((_, j) => j !== i));
  const updateSpec = (i: number, k: keyof Spec, v: string) =>
    setSpecs(p => p.map((s, j) => j === i ? { ...s, [k]: v } : s));

  /* ── variant helpers ── */
  const addVariant = () => {
    const base = variants[0];
    setVariants(p => [...p, {
      id: Date.now(), variantName: "", originalPrice: base.originalPrice,
      discountPrice: base.discountPrice, priceUnit: base.priceUnit, seoTags: base.seoTags,
      primaryImage: "", thumbnails: [], details: [{ name: "", value: "" }],
    }]);
  };
  const removeVariant = (id: number) => setVariants(p => p.filter(v => v.id !== id));
  const updateVariant = (id: number, k: keyof ColorVariant, v: any) =>
    setVariants(p => p.map(v2 => v2.id === id ? { ...v2, [k]: v } : v2));

  const handlePrimaryImg = (id: number, e: React.ChangeEvent<HTMLInputElement> | File) => {
    const file = e && 'target' in e ? e.target.files?.[0] : e as File;
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateVariant(id, "primaryImage", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleThumbImg = (id: number, e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    const files = e && 'target' in e ? Array.from(e.target.files || []) : e as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariants(p => p.map(v2 => v2.id === id ? { ...v2, thumbnails: [...v2.thumbnails, reader.result as string] } : v2));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeThumb = (vid: number, ti: number) =>
    updateVariant(vid, "thumbnails", variants.find(v => v.id === vid)!.thumbnails.filter((_, i) => i !== ti));

  /* variant detail helpers */
  const addDetail = (vid: number) =>
    updateVariant(vid, "details", [...(variants.find(v => v.id === vid)?.details ?? []), { name: "", value: "" }]);
  const removeDetail = (vid: number, di: number) =>
    updateVariant(vid, "details", variants.find(v => v.id === vid)!.details.filter((_, i) => i !== di));
  const updateDetail = (vid: number, di: number, k: keyof Detail, val: string) =>
    updateVariant(vid, "details", variants.find(v => v.id === vid)!.details.map((d, i) => i === di ? { ...d, [k]: val } : d));

  /* ── material helpers ── */
  const addMaterial = () => {
    const base = materials[0];
    setMaterials(p => [...p, {
      id: Date.now(), materialName: `Material ${p.length + 1}`, originalPrice: base?.originalPrice || "",
      discountPrice: base?.discountPrice || "", priceUnit: base?.priceUnit || "per-piece",
      seoTags: base?.seoTags || "", primaryImage: "", thumbnails: [],
    }]);
  };
  const removeMaterial = (id: number) => setMaterials(p => p.filter(m => m.id !== id));
  const updateMaterial = (id: number, k: keyof MaterialVariant, v: any) =>
    setMaterials(p => p.map(m => m.id === id ? { ...m, [k]: v } : m));

  /* ── submit ── */
  const handleSubmit = async (submitStatus: 'draft' | 'active' = 'active') => {
    if (!productName.trim()) { alert("Product name is required"); return; }
    if (!variants[0]?.discountPrice) { alert("Discount price is required for the first variant"); return; }
    setIsSaving(true);
    try {
      const firstVariant = variants[0];
      const body = {
        name: productName,
        productGroupId: null,
        status: submitStatus,
        stockStatus: stockStatus.replace("-","_"),
        quantity: Number(quantity) || 0,
        currentPrice: Number(firstVariant.discountPrice),
        originalPrice: Number(firstVariant.originalPrice) || null,
        priceUnit: firstVariant.priceUnit,
        mainCategory: selectedMain,
        category: selectedCat,
        subcategory: selectedSub,
        brand: brandName,
        hsnCode,
        gstRate,
        badge: badge || null,
        estimatedDelivery: estDelivery,
        freeShipping: !!freeShipping,
        primaryImageUrl: firstVariant.primaryImage,
        imageUrl: firstVariant.primaryImage,
        thumbnailUrls: firstVariant.thumbnails,
        colorVariant: firstVariant.variantName,
        materials: materials.map(m => JSON.stringify(m)),
        services: [],
        features: firstVariant.seoTags.split(",").map(t => t.trim()).filter(Boolean),
        specifications: specs.filter(s => s.name || s.value),
        warranty: null,
        isActive: submitStatus === 'active',
        description: descRef.current?.getHTML() ?? null,
      };
      const res = await fetch("/api/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);
        alert(`Product ${submitStatus === 'draft' ? 'saved as draft' : 'published'} successfully!`);
        router.push("/dashboard/products"); router.refresh();
      } else {
        alert("Failed to save product.");
      }
    } catch { alert("An error occurred."); }
    setIsSaving(false);
  };

  /* ─────────────── shared field/input styles ────────────────── */
  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid #d1d5db", borderRadius: 4,
    padding: "8px 10px", fontSize: 14, outline: "none", background: "#fff",
    color: "#111",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600, color: "#111",
    marginBottom: 6,
  };
  const fgStyle: React.CSSProperties = { marginBottom: 14 };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 14, color: "#111", background: "#fff", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid #ddd", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/products" style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <span style={{ color: "#ccc" }}>|</span>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>Add Product</h1>
      </header>

      {/* ── Main content wrapper: use padding + max-width + responsive padding ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 120px" }}>

        {/* ── Draft Restore Bar ── */}
        {hasDraft && (
          <div className="mb-4 flex items-center justify-between gap-4 bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-3 shadow-sm flex-wrap">
            <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium flex-1">
              Unsaved draft found from {draftTime}. Restore it to continue where you left off.
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={restoreDraft}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                Restore Draft
              </button>
              <button type="button" onClick={discardDraft}
                className="bg-transparent border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 text-sm px-4 py-1.5 rounded-lg transition">
                Discard
              </button>
            </div>
          </div>
        )}

        {/* ── Category Selection – 3-step column picker ─────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-800">Category Selection *</label>
            {/* breadcrumb pill */}
            {selectedMain && (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-2.5 py-1 rounded-full">{selectedMain}</span>
                {selectedCat && <><span className="text-gray-400">›</span><span className="bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-full">{selectedCat}</span></>}
                {selectedSub && <><span className="text-gray-400">›</span><span className="bg-green-100 text-green-800 border border-green-300 px-2.5 py-1 rounded-full">{selectedSub}</span></>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            {/* ── Step 1: Main Categories ── */}
            <div className="border-r border-gray-200">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Main Category</span>
              </div>
              <div className="overflow-y-auto max-h-64">
                {categoriesData.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400 text-center animate-pulse">Loading…</div>
                ) : categoriesData.map((catObj) => {
                  const main = catObj.id;
                  const isSelected = selectedMain === main;
                  return (
                    <button
                      key={main} type="button"
                      onClick={() => { toggleCat(main); setSelectedMain(main); setSelectedCat(""); setSelectedSub(""); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all border-b border-gray-100 last:border-0
                        ${isSelected ? 'bg-yellow-50 text-yellow-900 border-l-4 border-l-yellow-400' : 'text-gray-700 hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                    >
                      <Home size={14} className={isSelected ? "text-yellow-500" : "text-gray-400"} />
                      <span className="flex-1 leading-tight">{main}</span>
                      {isSelected && <ChevronRight size={14} className="text-yellow-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Step 2: Subcategories ── */}
            <div className="border-r border-gray-200">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${selectedMain ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subcategory</span>
              </div>
              <div className="overflow-y-auto max-h-64 p-3">
                {!selectedMain ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 py-10 text-center">← Pick a main<br/>category first</div>
                ) : (() => {
                  const catObj = categoriesData.find(c => c.id === selectedMain);
                  const subcategoriesObj = catObj?.document?.subcategories || {};
                  const subs = Object.keys(subcategoriesObj);
                  return subs.length === 0 ? (
                    <div className="text-xs text-gray-400 py-10 text-center">No subcategories</div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {subs.map(sub => {
                        const isSelected = selectedCat === sub;
                        return (
                          <button
                            key={sub} type="button"
                            onClick={() => { setSelectedCat(sub); setSelectedSub(""); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${isSelected ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Step 3: Items / Custom ── */}
            <div>
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${selectedCat ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400'}`}>3</span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Item / Tag</span>
              </div>
              <div className="overflow-y-auto max-h-64 p-3">
                {!selectedCat ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 py-10 text-center">← Pick a<br/>subcategory first</div>
                ) : (() => {
                  const catObj = categoriesData.find(c => c.id === selectedMain);
                  const subcategoriesObj = catObj?.document?.subcategories || {};
                  const items: string[] = subcategoriesObj[selectedCat]?.items || [];
                  return (
                    <div className="flex flex-col gap-2">
                      {items.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {items.map(item => (
                            <button
                              key={item} type="button"
                              onClick={() => setSelectedSub(item)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all
                                ${selectedSub === item ? 'bg-green-500 text-white border-green-500 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50'}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-gray-100 pt-2">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1.5">Or type custom</p>
                        <input
                          type="text"
                          placeholder="Custom item / tag…"
                          value={selectedSub}
                          onChange={e => setSelectedSub(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition bg-white text-gray-800"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Product Basics + Right Panel ── */}
        <div style={{ display: "flex", gap: 30, marginBottom: 20, flexWrap: "wrap" }}>
          {/* Left – Name + Description */}
          <div style={{ flex: "2 1 280px", minWidth: 0 }}>
            <div style={fgStyle}>
              <label style={labelStyle} htmlFor="global-product-name">Product Name *</label>
              <input
                id="global-product-name" type="text" placeholder="Product Name"
                value={productName} onChange={e => setProductName(e.target.value)}
                style={inputStyle} required
              />
            </div>
            <div style={fgStyle}>
              <label style={labelStyle}>Product Description *</label>
              <RichEditor
                ref={descRef}
                placeholder="Enter detailed product description with advanced formatting..."
                minHeight={180}
              />
            </div>
          </div>

          {/* Right – GST, HSN, Vendor, Brand, Stock, Qty, Delivery, Shipping */}
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <div style={fgStyle}>
              <label style={labelStyle} htmlFor="global-gst-rate">GST Rate (%) *</label>
              <select id="global-gst-rate" value={gstRate} onChange={e => setGstRate(e.target.value)} style={inputStyle}>
                <option value="">Select GST Rate</option>
                <option value="0">0% - Essential Items</option>
                <option value="5">5% - Basic Necessities</option>
                <option value="12">12% - Standard Items</option>
                <option value="18">18% - Most Goods</option>
                <option value="28">28% - Luxury Items</option>
              </select>
            </div>
            <div style={fgStyle}>
              <label style={labelStyle} htmlFor="global-hsn-code">HSN Code *</label>
              <input id="global-hsn-code" type="text" placeholder="e.g., 8544, 9405, 6815"
                value={hsnCode} onChange={e => setHsnCode(e.target.value)} style={inputStyle} maxLength={8} />
            </div>
            <div style={{ display: "flex", gap: 14, ...fgStyle }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Vendor/Supplier *</label>
                <input type="text" placeholder="e.g., ABC Suppliers"
                  value={vendor} onChange={e => setVendor(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Brand Name (Optional)</label>
                <input type="text" placeholder="e.g.,LG"
                  value={brandName} onChange={e => setBrandName(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, ...fgStyle }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle} htmlFor="product-stock-status">Stock Status *</label>
                <select id="product-stock-status" value={stockStatus} onChange={e => setStockStatus(e.target.value)} style={inputStyle}>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="limited-stock">Limited Stock</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" min={0} placeholder="e.g., 1 piece"
                  value={quantity} onChange={e => setQuantity(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, ...fgStyle }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle} htmlFor="estimated-delivery">Estimated Delivery *</label>
                <input id="estimated-delivery" type="text" placeholder="e.g., 3-5 business days"
                  value={estDelivery} onChange={e => setEstDelivery(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Free Shipping Threshold (₹)</label>
                <input type="number" placeholder="e.g., 5500" min={0} step={100}
                  value={freeShipping} onChange={e => setFreeShipping(e.target.value)} style={inputStyle} />
                <small style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4, display: "block", fontStyle: "italic" }}>
                  Enter amount above which free shipping applies (leave empty if no threshold)
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Specifications ── */}
        <div style={fgStyle}>
          <label style={labelStyle}>Global Product Specifications *</label>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#ffc000" }}>
                  <th style={{ width: 30, padding: "8px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 12 }} />
                  <th style={{ padding: "8px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 12 }}>Specification Name *</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 12 }}>Value *</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 12 }}>Source *</th>
                  <th style={{ width: 40, padding: "8px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody id="global-specifications-tbody">
                {specs.map((spec, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#9ca3af", fontSize: 16, cursor: "grab" }}>⋮⋮</td>
                    <td style={{ padding: "6px 8px" }}>
                      <input type="text" placeholder="Specification name (e.g., Power,Warranty)" className="spec-name"
                        value={spec.name} onChange={e => updateSpec(i, "name", e.target.value)}
                        style={{ ...inputStyle, padding: "5px 8px", fontSize: 13 }} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <input type="text" placeholder="Specification value (e.g., 100W, 220V, 2 Years)" className="spec-value"
                        value={spec.value} onChange={e => updateSpec(i, "value", e.target.value)}
                        style={{ ...inputStyle, padding: "5px 8px", fontSize: 13 }} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>Manual</span>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <button type="button" onClick={() => removeSpec(i)}
                        style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addSpec}
            style={{ marginTop: 8, background: "#ffc000", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>+</span> Add Specification
          </button>
        </div>

        {/* ── Color Variant Cards ── */}
        <div style={fgStyle} className="color-items-list" id="color-items-list">
          {variants.map((v, idx) => (
            <ColorVariantCard
              key={v.id}
              variant={v}
              index={idx}
              onRemove={() => removeVariant(v.id)}
              onUpdate={(k, val) => updateVariant(v.id, k, val)}
              onPrimaryImg={(e) => handlePrimaryImg(v.id, e)}
              onThumbImg={(e) => handleThumbImg(v.id, e)}
              onRemoveThumb={(ti) => removeThumb(v.id, ti)}
              onMoveThumb={(ti, dir) => {
                const newThumbs = [...v.thumbnails];
                const target = ti + dir;
                if (target >= 0 && target < newThumbs.length) {
                  [newThumbs[ti], newThumbs[target]] = [newThumbs[target], newThumbs[ti]];
                  updateVariant(v.id, "thumbnails", newThumbs);
                }
              }}
              onAddDetail={() => addDetail(v.id)}
              onRemoveDetail={(di) => removeDetail(v.id, di)}
              onUpdateDetail={(di, k, val) => updateDetail(v.id, di, k, val)}
              showRemove={variants.length > 1}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
            />
          ))}
        </div>

        {/* Add Color Variant button */}
        <button type="button" onClick={addVariant} className="add-color-btn"
          style={{ background: "#ffc000", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span>+</span> Add Color Variant (Auto-Copy)
        </button>
        {/* Counter */}
        <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280", marginBottom: 20 }} className="color-count-display">
          <span id="color-count">{variants.length}</span> color variant(s) ×{" "}
          <span id="material-count">{materials.length}</span> material(s) will create{" "}
          <span id="product-count">{Math.max(1, variants.length)}</span> product(s)
        </div>

        {/* ── Global Materials ── */}
        <div style={fgStyle}>
          <label style={labelStyle}>Global Materials *</label>
          <div className="materials-items-list" style={{ marginTop: 12 }}>
            {materials.map((m, idx) => (
              <MaterialCard
                key={m.id}
                material={m}
                index={idx}
                onRemove={() => removeMaterial(m.id)}
                onUpdate={(k, val) => updateMaterial(m.id, k, val)}
                onPrimaryImg={(e) => {
                  const file = e && 'target' in e ? (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0] : e as File;
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => updateMaterial(m.id, "primaryImage", reader.result as string);
                  reader.readAsDataURL(file);
                }}
                onThumbImg={(e) => {
                  const files = e && 'target' in e ? Array.from((e as React.ChangeEvent<HTMLInputElement>).target.files || []) : e as File[];
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setMaterials(p => p.map(m2 => m2.id === m.id ? { ...m2, thumbnails: [...m2.thumbnails, reader.result as string] } : m2));
                    };
                    reader.readAsDataURL(file);
                  });
                }}
                onRemoveThumb={(ti) => updateMaterial(m.id, "thumbnails", m.thumbnails.filter((_, i) => i !== ti))}
                showRemove={materials.length > 1}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            ))}
          </div>
          <button type="button" onClick={addMaterial}
            style={{ background: "#ffc000", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>+</span> Add Material
          </button>
        </div>

        {/* ── Combinations ── */}
        <div style={{ ...fgStyle, border: "1px solid #e5e7eb", borderRadius: 6, padding: 16, background: "#f9fafb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, color: "#374151" }}>Create New Combination *</h4>
            <button type="button"
              onClick={() => setShowCombInput(true)}
              style={{ background: "#ffc000", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              + New Combination
            </button>
          </div>
          {showCombInput && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <input type="text" placeholder="Combination name (e.g., Bundle A)"
                id="new-comb-input"
                style={{ ...inputStyle, width: 260, padding: "6px 10px" }}
              />
              <button type="button"
                onClick={() => {
                  const inp = (document.getElementById("new-comb-input") as HTMLInputElement);
                  if (inp.value.trim()) { setCombinations(p => [...p, { title: inp.value.trim(), products: [] }]); inp.value = ""; }
                  setShowCombInput(false);
                }}
                style={{ background: "#ffc000", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Add</button>
              <button type="button" onClick={() => setShowCombInput(false)}
                style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "6px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          )}
          <div className="all-combinations" id="all-combinations" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {combinations.map((c, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ background: "#555", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ font: "600 13px/1 sans-serif", color: "#fff" }}>{c.title}</span>
                  <button type="button" onClick={() => setCombinations(p => p.filter((_, j) => j !== i))}
                    style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 12, cursor: "pointer" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO Tags ── */}
        <div style={fgStyle}>
          <label style={labelStyle} htmlFor="seo-tags">Global SEO Tags *</label>
          <input id="seo-tags" type="text"
            placeholder="Enter tags separated by commas (e.g., smart home, automation)"
            value={seoTags} onChange={e => setSeoTags(e.target.value)}
            style={{ ...inputStyle, border: "1px solid #ffc000", outline: "none" }}
          />
        </div>

        {/* ── Badge ── */}
        <div style={fgStyle}>
          <label style={labelStyle} htmlFor="product-badge">Product Badge (Optional)</label>
          <select id="product-badge" value={badge} onChange={e => setBadge(e.target.value)} style={inputStyle}>
            <option value="">No Badge</option>
            <option value="Best Seller">Best Seller</option>
            <option value="New">New</option>
            <option value="Popular">Popular</option>
            <option value="Limited Edition">Limited Edition</option>
            <option value="Sale">Sale</option>
          </select>
        </div>
      </main>

      {/* ── Sticky Submit Bar ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, zIndex: 50, boxShadow: "0 -4px 16px rgba(0,0,0,.06)", flexWrap: "wrap" }}>
        
        {/* Draft status badge */}
        <div className={`flex items-center gap-2 text-xs font-medium ${
          draftStatus === 'saving'  ? 'text-amber-500' :
          draftStatus === 'saved'   ? 'text-emerald-600' :
          draftStatus === 'unsaved' ? 'text-red-500' : 'text-gray-400'
        }`}>
          <span className={`w-2 h-2 rounded-full inline-block ${
            draftStatus === 'saving'  ? 'bg-amber-400 animate-pulse' :
            draftStatus === 'saved'   ? 'bg-emerald-500' :
            draftStatus === 'unsaved' ? 'bg-red-400' : 'bg-gray-300'
          }`} />
          {draftStatus === 'saving'  ? 'Auto-saving…' :
           draftStatus === 'saved'   ? `Draft saved${draftTime ? ' at ' + draftTime : ''}` :
           draftStatus === 'unsaved' ? 'Failed to save draft' :
           'No changes'}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard/products"
            style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, color: "#374151", textDecoration: "none", display: "flex", alignItems: "center" }}>
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSaving}
            style={{ background: "#fff", color: "#374151", border: "1px solid #ffc000", padding: "8px 24px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: isSaving ? 0.7 : 1 }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('active')}
            disabled={isSaving}
            style={{ background: "#ffc000", color: "#fff", border: "none", padding: "8px 24px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? "Saving…" : <>+ Publish Product</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── ColorVariantCard sub-component ─────────────── */
interface CVCProps {
  variant: ColorVariant;
  index: number;
  onRemove: () => void;
  onUpdate: (k: keyof ColorVariant, v: any) => void;
  onPrimaryImg: (e: React.ChangeEvent<HTMLInputElement> | File) => void;
  onThumbImg: (e: React.ChangeEvent<HTMLInputElement> | File[]) => void;
  onRemoveThumb: (ti: number) => void;
  onMoveThumb: (ti: number, dir: number) => void;
  onAddDetail: () => void;
  onRemoveDetail: (di: number) => void;
  onUpdateDetail: (di: number, k: keyof Detail, v: string) => void;
  showRemove: boolean;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

function ColorVariantCard({
  variant, index, onRemove, onUpdate, onPrimaryImg, onThumbImg,
  onRemoveThumb, onMoveThumb, onAddDetail, onRemoveDetail, onUpdateDetail,
  showRemove, inputStyle, labelStyle,
}: CVCProps) {
  const primaryRef = useRef<HTMLInputElement>(null);
  const thumbRef   = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc]       = useState("");
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredThumb, setHoveredThumb]   = useState<number | null>(null);
  const [dragOverPrimary, setDragOverPrimary] = useState(false);
  const [dragOverThumbs, setDragOverThumbs] = useState(false);

  const handlePrimaryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPrimary(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onPrimaryImg(file);
  };

  const handleThumbsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverThumbs(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) onThumbImg(files);
  };

  /* icon button shared style */
  const iconBtn = (bg: string): React.CSSProperties => ({
    background: bg, color: "#fff", border: "none", borderRadius: 4,
    width: 28, height: 28, fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,.3)",
  });

  return (
    <>
      {/* ── Fullscreen Preview Lightbox ── */}
      {previewSrc && (
        <div
          onClick={() => setPreviewSrc("")}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
            <img
              src={previewSrc} alt="Preview"
              style={{
                maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain",
                borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,.6)",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={() => setPreviewSrc("")}
              style={{
                position: "absolute", top: -14, right: -14,
                background: "#fff", border: "none", borderRadius: "50%",
                width: 32, height: 32, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,.4)", fontWeight: 700, color: "#333",
              }}
            >×</button>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,.6)", fontSize: 12, marginTop: 10 }}>
              Click anywhere outside to close
            </p>
          </div>
        </div>
      )}

      <div className="color-item-enhanced" data-color-index={index}
        style={{ border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 16, background: "#fff", position: "relative" }}>
        {/* × remove button */}
        {showRemove && (
          <button type="button" onClick={onRemove}
            style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            ×
          </button>
        )}

        <div style={{ display: "flex", gap: 20, padding: 16 }}>
          {/* Left – images */}
          <div className="color-photo-section" style={{ minWidth: 200 }}>
            <label style={labelStyle}>Primary Product Image *</label>
            <input type="file" accept="image/*" multiple ref={primaryRef}
              onChange={onPrimaryImg} style={{ marginBottom: 8, fontSize: 13 }} className="color-photo-input" />

            {/* ── Primary image box with preview overlay ── */}
            <div
              onMouseEnter={() => setHoveredPrimary(true)}
              onMouseLeave={() => setHoveredPrimary(false)}
              onDragOver={(e) => { e.preventDefault(); setDragOverPrimary(true); }}
              onDragLeave={() => setDragOverPrimary(false)}
              onDrop={handlePrimaryDrop}
              onClick={() => !variant.primaryImage && primaryRef.current?.click()}
              style={{
                border: dragOverPrimary ? "2px dashed #3b82f6" : "2px dashed #ffc000", borderRadius: 6,
                width: 180, height: 180, display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: variant.primaryImage ? "default" : "pointer",
                background: dragOverPrimary ? "#eff6ff" : "#fffdf0", overflow: "hidden",
                position: "relative", marginBottom: 12,
                transition: "all 0.2s ease"
              }}
              className="color-photo-preview primary-image-preview"
            >
              {variant.primaryImage ? (
                <img src={variant.primaryImage} alt="Primary"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: 8 }}>
                  Click to add primary image
                </span>
              )}

              {/* Hover overlay – preview button */}
              {variant.primaryImage && hoveredPrimary && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.42)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, zIndex: 5,
                }}>
                  <button
                    type="button"
                    title="Preview image"
                    onClick={e => { e.stopPropagation(); setPreviewSrc(variant.primaryImage); }}
                    style={iconBtn("#ffc000")}
                  >👁</button>
                  <button
                    type="button"
                    title="Replace image"
                    onClick={e => { e.stopPropagation(); primaryRef.current?.click(); }}
                    style={iconBtn("#6b7280")}
                  >✏️</button>
                </div>
              )}
            </div>

            {/* ── Thumbnails with preview + swap ── */}
            <div className="color-thumbnails-section">
              <label style={labelStyle}>Additional Product Images *</label>
              <div id={`thumbnails-grid-${index}`} className="thumbnails-grid"
                onDragOver={(e) => { e.preventDefault(); setDragOverThumbs(true); }}
                onDragLeave={() => setDragOverThumbs(false)}
                onDrop={handleThumbsDrop}
                style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, padding: dragOverThumbs ? 4 : 0, background: dragOverThumbs ? "#eff6ff" : "transparent", border: dragOverThumbs ? "1px dashed #3b82f6" : "none", borderRadius: 6, transition: "all 0.2s ease" }}>
                {variant.thumbnails.map((src, ti) => (
                  <div
                    key={ti}
                    onMouseEnter={() => setHoveredThumb(ti)}
                    onMouseLeave={() => setHoveredThumb(null)}
                    style={{
                      width: 72, height: 72, position: "relative",
                      border: hoveredThumb === ti ? "2px solid #ffc000" : "1px solid #e5e7eb",
                      borderRadius: 6, overflow: "hidden", transition: "border .15s",
                      flexShrink: 0,
                    }}
                  >
                    <img src={src} alt={`Thumb ${ti + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                    {/* Hover overlay – preview + move */}
                    {hoveredThumb === ti && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.52)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 4, zIndex: 5,
                      }}>
                        <button
                          type="button"
                          title="Preview"
                          onClick={e => { e.stopPropagation(); setPreviewSrc(src); }}
                          style={{ ...iconBtn("rgba(255,255,255,.25)"), width: 22, height: 22, fontSize: 11 }}
                        >👁</button>
                        <div style={{ display: "flex", gap: 4 }}>
                          {ti > 0 && (
                            <button
                              type="button"
                              title="Move left"
                              onClick={e => { e.stopPropagation(); onMoveThumb(ti, -1); }}
                              style={{ ...iconBtn("#ffc000"), width: 22, height: 22, fontSize: 12 }}
                            >←</button>
                          )}
                          {ti < variant.thumbnails.length - 1 && (
                            <button
                              type="button"
                              title="Move right"
                              onClick={e => { e.stopPropagation(); onMoveThumb(ti, 1); }}
                              style={{ ...iconBtn("#ffc000"), width: 22, height: 22, fontSize: 12 }}
                            >→</button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* × remove */}
                    <button type="button" onClick={() => onRemoveThumb(ti)}
                      style={{
                        position: "absolute", top: 2, right: 2,
                        background: "#ef4444", color: "#fff", border: "none",
                        borderRadius: 3, width: 16, height: 16, fontSize: 10,
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        zIndex: 6,
                      }}>×</button>
                  </div>
                ))}

                {/* + add slot */}
                <div onClick={() => thumbRef.current?.click()}
                  style={{
                    width: 72, height: 72, border: "2px dashed #d1d5db",
                    borderRadius: 6, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
                    background: "#f9fafb", fontSize: 26, color: "#9ca3af",
                    flexShrink: 0,
                  }}>+</div>
              </div>

              <input ref={thumbRef} type="file" accept="image/*" multiple
                style={{ display: "none" }} onChange={onThumbImg} />
              <button type="button" onClick={() => thumbRef.current?.click()} className="add-thumbnail-btn"
                style={{ background: "#ffc000", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span>+</span> Add Image
              </button>

              {/* Legend */}
              {variant.thumbnails.length > 0 && (
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                  Hover a thumbnail to <strong>👁 preview</strong> or <strong>← → move</strong>
                </p>
              )}
            </div>
          </div>

          {/* Right – details */}
          <div className="color-details-section" style={{ flex: 1 }}>
            <label style={labelStyle}>Color Name *</label>
            <input type="text" placeholder="Variant Name (e.g., Warm White) *"
              value={variant.variantName} onChange={e => onUpdate("variantName", e.target.value)}
              style={{ ...inputStyle, marginBottom: 10 }} className="color-variant-name" />

            <input type="number" placeholder="Original Price (₹) *"
              value={variant.originalPrice} onChange={e => onUpdate("originalPrice", e.target.value)}
              style={{ ...inputStyle, marginBottom: 8 }} className="color-original-price" />
            <input type="number" placeholder="Discount Price (₹) *"
              value={variant.discountPrice} onChange={e => onUpdate("discountPrice", e.target.value)}
              style={{ ...inputStyle, marginBottom: 8 }} className="color-current-price" />
            <input type="text" placeholder="Price Unit *"
              value={variant.priceUnit} onChange={e => onUpdate("priceUnit", e.target.value)}
              style={{ ...inputStyle, marginBottom: 8 }} className="color-price-unit" />
            <input type="text" placeholder="SEO Tags (comma separated) *"
              value={variant.seoTags} onChange={e => onUpdate("seoTags", e.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }} className="color-seo-tags" />

            {/* Product Details table */}
            <div style={{ marginTop: 4 }}>
              <label style={{ ...labelStyle, marginBottom: 8 }}>Product Details</label>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ background: "#ffc000", color: "#fff", padding: 8, textAlign: "left", fontWeight: 600, fontSize: 12, width: 30 }} />
                      <th style={{ background: "#ffc000", color: "#fff", padding: 8, textAlign: "left", fontWeight: 600, fontSize: 12 }}>Detail Name *</th>
                      <th style={{ background: "#ffc000", color: "#fff", padding: 8, textAlign: "left", fontWeight: 600, fontSize: 12 }}>Detail Value *</th>
                      <th style={{ background: "#ffc000", color: "#fff", padding: 8, textAlign: "left", fontWeight: 600, fontSize: 12, width: 40 }} />
                    </tr>
                  </thead>
                  <tbody className="variant-product-details-tbody">
                    {variant.details.map((d, di) => (
                      <tr key={di} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "6px 8px", textAlign: "center", color: "#9ca3af", fontSize: 16, cursor: "grab" }}>⋮⋮</td>
                        <td style={{ padding: "6px 8px" }}>
                          <input type="text" placeholder="Detail name (e.g., Warranty,Size)" className="detail-name"
                            value={d.name} onChange={e => onUpdateDetail(di, "name", e.target.value)}
                            style={{ width: "100%", padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, outline: "none" }} />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input type="text" placeholder="Detail value (e.g., 2 Years, Metal)" className="detail-value"
                            value={d.value} onChange={e => onUpdateDetail(di, "value", e.target.value)}
                            style={{ width: "100%", padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, outline: "none" }} />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <button type="button" onClick={() => onRemoveDetail(di)} className="remove-detail-btn"
                            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={onAddDetail} className="add-detail-btn"
                style={{ background: "#ffc000", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span>+</span> Add Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────── MaterialCard sub-component ─────────────── */
interface MCProps {
  material: MaterialVariant;
  index: number;
  onRemove: () => void;
  onUpdate: (k: keyof MaterialVariant, v: any) => void;
  onPrimaryImg: (e: React.ChangeEvent<HTMLInputElement> | File) => void;
  onThumbImg: (e: React.ChangeEvent<HTMLInputElement> | File[]) => void;
  onRemoveThumb: (ti: number) => void;
  showRemove: boolean;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

function MaterialCard({
  material, index, onRemove, onUpdate, onPrimaryImg, onThumbImg,
  onRemoveThumb, showRemove, inputStyle, labelStyle,
}: MCProps) {
  const primaryRef = useRef<HTMLInputElement>(null);
  const thumbRef   = useRef<HTMLInputElement>(null);
  const [dragOverPrimary, setDragOverPrimary] = useState(false);
  const [dragOverThumbs, setDragOverThumbs] = useState(false);

  const handlePrimaryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPrimary(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onPrimaryImg(file);
  };

  const handleThumbsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverThumbs(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) onThumbImg(files);
  };

  return (
    <div className="material-item-enhanced"
      style={{ border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 16, background: "#fff", position: "relative" }}>
      
      <div style={{ display: "flex", gap: 30, padding: 16 }}>
        {/* Left – images */}
        <div className="material-photo-section" style={{ minWidth: 260 }}>
          <label style={labelStyle}>Material Primary Image *</label>
          <div style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 12px", marginBottom: 12 }}>
            <input type="file" accept="image/*" ref={primaryRef}
              onChange={onPrimaryImg} style={{ fontSize: 13 }} />
          </div>

          {/* preview box */}
          <div
            onClick={() => !material.primaryImage && primaryRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOverPrimary(true); }}
            onDragLeave={() => setDragOverPrimary(false)}
            onDrop={handlePrimaryDrop}
            style={{
              border: dragOverPrimary ? "2px dashed #3b82f6" : `2px dashed ${material.primaryImage ? "#ffc000" : "#ffc000"}`,
              borderRadius: 6, width: "100%", height: 180, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: material.primaryImage ? "default" : "pointer",
              background: dragOverPrimary ? "#eff6ff" : "#fffdf0", overflow: "hidden", position: "relative", marginBottom: 16,
              transition: "all 0.2s ease"
            }}
          >
            {material.primaryImage
              ? <img src={material.primaryImage} alt="Primary" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <span style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>Click to add primary image</span>
            }
          </div>

          {/* thumbnails */}
          <label style={labelStyle}>Material Additional Images *</label>
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOverThumbs(true); }}
            onDragLeave={() => setDragOverThumbs(false)}
            onDrop={handleThumbsDrop}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, padding: dragOverThumbs ? 4 : 0, background: dragOverThumbs ? "#eff6ff" : "transparent", border: dragOverThumbs ? "1px dashed #3b82f6" : "none", borderRadius: 6, transition: "all 0.2s ease" }}
          >
            {material.thumbnails.map((src, ti) => (
              <div key={ti} style={{ width: 64, height: 64, position: "relative", border: "1px solid #e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                <img src={src} alt={`Thumb ${ti+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={() => onRemoveThumb(ti)}
                  style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", border: "none", borderRadius: 3, width: 16, height: 16, fontSize: 10, cursor: "pointer" }}>×</button>
              </div>
            ))}
            {/* + slot */}
            <div onClick={() => thumbRef.current?.click()}
              style={{ width: 64, height: 64, border: "1px dashed #d1d5db", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fafafa", fontSize: 18, color: "#9ca3af" }}>+</div>
          </div>
          <input ref={thumbRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onThumbImg} />
          <button type="button" onClick={() => thumbRef.current?.click()}
            style={{ background: "#ffc000", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add Image</button>
        </div>

        {/* Right – details */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#374151" }}>Material {index + 1}</h4>
            {showRemove && (
              <button type="button" onClick={onRemove}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, width: 28, height: 28, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            )}
          </div>
          
          <input type="text" placeholder={`Material ${index + 1}`}
            value={material.materialName} onChange={e => onUpdate("materialName", e.target.value)}
            style={{ ...inputStyle, marginBottom: 12, padding: "10px 12px" }} />

          <input type="number" placeholder="Original Price (₹) *"
            value={material.originalPrice} onChange={e => onUpdate("originalPrice", e.target.value)}
            style={{ ...inputStyle, marginBottom: 12, padding: "10px 12px" }} />
            
          <input type="number" placeholder="Discount Price (₹) *"
            value={material.discountPrice} onChange={e => onUpdate("discountPrice", e.target.value)}
            style={{ ...inputStyle, marginBottom: 12, padding: "10px 12px" }} />
            
          <input type="text" placeholder="Price Unit *"
            value={material.priceUnit} onChange={e => onUpdate("priceUnit", e.target.value)}
            style={{ ...inputStyle, marginBottom: 12, padding: "10px 12px" }} />
            
          <input type="text" placeholder="SEO Tags (comma separated) *"
            value={material.seoTags} onChange={e => onUpdate("seoTags", e.target.value)}
            style={{ ...inputStyle, padding: "10px 12px" }} />
        </div>
      </div>
    </div>
  );
}
