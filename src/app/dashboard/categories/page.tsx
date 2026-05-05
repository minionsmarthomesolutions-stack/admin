"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlusCircle, ChevronRight, ChevronDown, Pencil, Trash2,
  Image as ImageIcon, Tag, Search, BarChart2, Layers
} from "lucide-react";

/* ─── Types ─── */
interface SubSubItem { name: string; logo?: string; }
interface SubCategory { logo?: string; items?: string[]; itemLogos?: Record<string, string>; }
interface MainCategory { code: string; logo?: string; subcategories?: Record<string, SubCategory>; }
interface CategoryRow { id: string; document: MainCategory; }

type ModalType = "main" | "sub" | "subsub";
interface ModalState {
  open: boolean;
  mode: "add" | "edit";
  type: ModalType;
  parentMain?: string;
  parentSub?: string;
  editOldName?: string;
  // pre-filled values
  initName?: string;
  initPrefix?: string;
  initLogo?: string;
}

const EMPTY_MODAL: ModalState = { open: false, mode: "add", type: "main" };

/* ─── Helpers ─── */
function toastMsg(set: (m: string) => void, msg: string) {
  set(msg); setTimeout(() => set(""), 3000);
}

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<ModalState>(EMPTY_MODAL);

  /* form state */
  const [formName, setFormName] = useState("");
  const [formPrefix, setFormPrefix] = useState("");
  const [formLogo, setFormLogo] = useState<string>("");
  const [formParentMain, setFormParentMain] = useState("");
  const [formParentSub, setFormParentSub] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setRows(await res.json());
    } catch (e) { console.error(e); }
    setIsLoading(false);
  }

  /* stats */
  const totalMain = rows.length;
  const totalSub = rows.reduce((acc, r) => acc + Object.keys(r.document?.subcategories || {}).length, 0);
  const totalSubSub = rows.reduce((acc, r) => {
    Object.values(r.document?.subcategories || {}).forEach(s => { acc += (s.items || []).length; });
    return acc;
  }, 0);

  /* filter */
  const filtered = rows.filter(r =>
    !search || r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.document?.code?.toLowerCase().includes(search.toLowerCase())
  );

  function openModal(m: ModalState) {
    setModal(m);
    setFormName(m.initName || "");
    setFormPrefix(m.initPrefix || "");
    setFormLogo(m.initLogo || "");
    setFormParentMain(m.parentMain || "");
    setFormParentSub(m.parentSub || "");
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!formName.trim()) { alert("Name is required"); return; }
    if (modal.type === "main" && !formPrefix.trim() && modal.mode === "add") {
      alert("Prefix is required for main category"); return;
    }
    setIsSaving(true);
    try {
      let res: Response;
      if (modal.mode === "add") {
        const body: any = { type: modal.type, name: formName.trim(), logo: formLogo };
        if (modal.type === "main") body.prefix = formPrefix.trim();
        if (modal.type === "sub") body.parentMain = formParentMain; body.subName = formName.trim();
        if (modal.type === "subsub") { body.parentMain = formParentMain; body.parentSub = formParentSub; body.subSubName = formName.trim(); }
        res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        const body: any = { type: modal.type, oldName: modal.editOldName, newName: formName.trim(), logo: formLogo };
        if (modal.type === "sub") body.parentMain = modal.parentMain;
        if (modal.type === "subsub") { body.parentMain = modal.parentMain; body.parentSub = modal.parentSub; }
        res = await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      if (res.ok) {
        setModal(EMPTY_MODAL);
        await fetchCategories();
        toastMsg(setToast, modal.mode === "add" ? "Category added!" : "Category updated!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch (e) { alert("Error saving"); }
    setIsSaving(false);
  }

  async function handleDelete(type: string, id: string, sub?: string, subsub?: string) {
    const name = subsub || sub || id;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const params = new URLSearchParams({ id, type });
    if (sub) params.set("sub", sub);
    if (subsub) params.set("subsub", subsub);
    const res = await fetch(`/api/categories?${params}`, { method: "DELETE" });
    if (res.ok) { await fetchCategories(); toastMsg(setToast, "Deleted!"); }
    else alert("Failed to delete");
  }

  function toggleMain(id: string) { setExpanded(p => ({ ...p, [id]: !p[id] })); }
  function toggleSub(key: string) { setExpandedSub(p => ({ ...p, [key]: !p[key] })); }

  const subCatsOf = (mainId: string) =>
    Object.keys(rows.find(r => r.id === mainId)?.document?.subcategories || {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#ffc800] text-black font-semibold px-5 py-3 rounded-xl shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 mt-1">Three-level hierarchy: Main → Sub → Sub-Sub</p>
        </div>
        <button
          onClick={() => openModal({ open: true, mode: "add", type: "main" })}
          className="bg-[#ffc800] text-white px-5 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} /> Add New Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Main Categories", value: totalMain, color: "text-[#ffc800]" },
          { label: "Sub-Categories", value: totalSub, color: "text-emerald-500" },
          { label: "Sub-Sub-Categories", value: totalSubSub, color: "text-blue-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
            <BarChart2 size={20} className={`${s.color} mb-2`} />
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Category Structure</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 w-64 bg-gray-50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <Layers className="text-gray-200 w-12 h-12" />
              <p className="text-gray-400">Loading categories…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-50 text-[#ffc800] rounded-full flex items-center justify-center mb-4">
              <Tag size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Categories Found</h3>
            <p className="text-gray-500 mb-6">{search ? "No match found." : "Add your first category."}</p>
            {!search && (
              <button onClick={() => openModal({ open: true, mode: "add", type: "main" })}
                className="bg-yellow-50 text-[#ffc800] border border-yellow-200 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-100 transition">
                Add First Category
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(row => {
              const mainDoc = row.document || {} as MainCategory;
              const isOpen = expanded[row.id];
              return (
                <div key={row.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Main Category Header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-[#1e293b] text-white cursor-pointer select-none"
                    onClick={() => toggleMain(row.id)}
                  >
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {mainDoc.logo ? (
                      <img src={mainDoc.logo} alt="" className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs">🏠</div>
                    )}
                    <span className="font-bold flex-1">{row.id}</span>
                    <span className="text-[10px] bg-[#ffc800] text-black px-2 py-0.5 rounded-full font-bold">{mainDoc.code}</span>
                    <div className="flex gap-2 ml-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openModal({
                          open: true, mode: "add", type: "sub", parentMain: row.id,
                        })}
                        className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                        title="Add Sub-Category"
                      >+ Sub</button>
                      <button
                        onClick={() => openModal({
                          open: true, mode: "edit", type: "main", editOldName: row.id,
                          initName: row.id, initPrefix: mainDoc.code?.split(/\d/)[0] || "", initLogo: mainDoc.logo,
                        })}
                        className="text-xs bg-blue-500/30 hover:bg-blue-500/50 px-2 py-1 rounded"
                        title="Edit"
                      ><Pencil size={12} /></button>
                      <button
                        onClick={() => handleDelete("main", row.id)}
                        className="text-xs bg-red-500/30 hover:bg-red-500/50 px-2 py-1 rounded"
                        title="Delete"
                      ><Trash2 size={12} /></button>
                    </div>
                  </div>

                  {/* Sub-categories */}
                  {isOpen && (
                    <div className="p-3 bg-gray-50 space-y-2">
                      {Object.keys(mainDoc.subcategories || {}).length === 0 && (
                        <p className="text-xs text-gray-400 pl-2 italic">No sub-categories yet.</p>
                      )}
                      {Object.entries(mainDoc.subcategories || {}).map(([subName, subData]) => {
                        const subKey = `${row.id}::${subName}`;
                        const isSubOpen = expandedSub[subKey];
                        return (
                          <div key={subName} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div
                              className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 cursor-pointer select-none"
                              onClick={() => toggleSub(subKey)}
                            >
                              {isSubOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              {subData.logo ? (
                                <img src={subData.logo} alt="" className="w-5 h-5 rounded object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs">🔧</div>
                              )}
                              <span className="font-medium text-sm flex-1">{subName}</span>
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                Parent: {mainDoc.code?.split(/\d/)[0]}
                              </span>
                              <div className="flex gap-1.5 ml-2" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => openModal({
                                    open: true, mode: "add", type: "subsub",
                                    parentMain: row.id, parentSub: subName,
                                  })}
                                  className="text-xs bg-gray-200 hover:bg-gray-300 px-1.5 py-0.5 rounded text-gray-600"
                                >+ Item</button>
                                <button
                                  onClick={() => openModal({
                                    open: true, mode: "edit", type: "sub",
                                    parentMain: row.id, editOldName: subName,
                                    initName: subName, initLogo: subData.logo,
                                  })}
                                  className="text-xs text-blue-500 hover:text-blue-700"
                                ><Pencil size={12} /></button>
                                <button
                                  onClick={() => handleDelete("sub", row.id, subName)}
                                  className="text-xs text-red-400 hover:text-red-600"
                                ><Trash2 size={12} /></button>
                              </div>
                            </div>

                            {/* Sub-Sub items */}
                            {isSubOpen && (
                              <div className="px-4 py-2 space-y-1">
                                {(subData.items || []).length === 0 && (
                                  <p className="text-xs text-gray-400 italic">No items yet.</p>
                                )}
                                {(subData.items || []).map(item => (
                                  <div key={item} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                    {subData.itemLogos?.[item] ? (
                                      <img src={subData.itemLogos[item]} alt="" className="w-5 h-5 rounded object-cover" />
                                    ) : (
                                      <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs">📦</div>
                                    )}
                                    <span className="text-sm flex-1">{item}</span>
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => openModal({
                                          open: true, mode: "edit", type: "subsub",
                                          parentMain: row.id, parentSub: subName,
                                          editOldName: item, initName: item,
                                          initLogo: subData.itemLogos?.[item],
                                        })}
                                        className="text-blue-400 hover:text-blue-600"
                                      ><Pencil size={12} /></button>
                                      <button
                                        onClick={() => handleDelete("subsub", row.id, subName, item)}
                                        className="text-red-400 hover:text-red-600"
                                      ><Trash2 size={12} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal ─── */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(EMPTY_MODAL)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {modal.mode === "add" ? "Add" : "Edit"}{" "}
                {modal.type === "main" ? "Main Category" : modal.type === "sub" ? "Sub-Category" : "Sub-Sub-Category"}
              </h2>
              <button onClick={() => setModal(EMPTY_MODAL)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              {/* Type selector (only for Add) */}
              {modal.mode === "add" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
                  <div className="flex gap-2">
                    {(["main", "sub", "subsub"] as ModalType[]).map(t => (
                      <button key={t} type="button"
                        onClick={() => {
                          setModal(p => ({ ...p, type: t }));
                          setFormParentMain(""); setFormParentSub("");
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                          modal.type === t
                            ? "bg-[#ffc800] border-[#ffc800] text-black"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {t === "main" ? "Main" : t === "sub" ? "Sub" : "Sub-Sub"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main prefix (only for main type in add mode) */}
              {modal.type === "main" && modal.mode === "add" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Prefix *</label>
                  <input
                    value={formPrefix} onChange={e => setFormPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g., SM (max 5 chars)"
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffc800]"
                  />
                  <p className="text-xs text-gray-400 mt-1">Code will be auto-generated: SM00001{new Date().getFullYear().toString().slice(-2)}{(new Date().getFullYear()+1).toString().slice(-2)}</p>
                </div>
              )}

              {/* Parent Main selector for sub/subsub */}
              {(modal.type === "sub" || modal.type === "subsub") && modal.mode === "add" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Category *</label>
                  <select
                    value={formParentMain} onChange={e => { setFormParentMain(e.target.value); setFormParentSub(""); }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#ffc800]"
                  >
                    <option value="">Select main category...</option>
                    {rows.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
                  </select>
                </div>
              )}

              {/* Parent Sub selector for subsub */}
              {modal.type === "subsub" && modal.mode === "add" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category *</label>
                  <select
                    value={formParentSub} onChange={e => setFormParentSub(e.target.value)}
                    disabled={!formParentMain}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#ffc800] disabled:opacity-50"
                  >
                    <option value="">Select sub-category...</option>
                    {subCatsOf(formParentMain).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modal.type === "main" ? "Category Name" : modal.type === "sub" ? "Sub-Category Name" : "Item Name"} *
                </label>
                <input
                  value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder={modal.type === "main" ? "e.g., Automation Solutions" : modal.type === "sub" ? "e.g., Lighting Automation" : "e.g., Smart Bulbs"}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffc800]"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Optional)</label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-[#ffc800] hover:bg-yellow-50 transition"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {formLogo ? (
                    <img src={formLogo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600">{formLogo ? "Change logo" : "Upload logo"}</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setModal(EMPTY_MODAL)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-[#ffc800] rounded-xl text-sm font-bold text-black hover:bg-yellow-500 transition disabled:opacity-50">
                {isSaving ? "Saving…" : modal.mode === "add" ? "Add Category" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
