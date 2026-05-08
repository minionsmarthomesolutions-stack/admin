"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Image as ImageIcon, AlertTriangle, Trash2, Home, ChevronRight } from "lucide-react";
import RichEditor, { RichEditorHandle } from "@/components/ui/RichEditor";

const BLOG_EDIT_DRAFT_KEY = (id: string) => `blog_edit_draft_${id}`;

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    author: "",
    tags: "",
    primaryImage: "",
    content: "",
    status: "draft",
    readingTime: 5,
    metaDescription: "",
  });
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openCats, setOpenCats] = useState<string[]>([]);
  const editorRef = useRef<RichEditorHandle>(null);

  const toggleCat = (name: string) =>
    setOpenCats((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  // ── Draft states ──────────────────────────────────────────────────────────
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "unsaved">("idle");
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const DRAFT_KEY = BLOG_EDIT_DRAFT_KEY(id);

  // ── Draft helpers ─────────────────────────────────────────────────────────
  const getDraftPayload = useCallback(
    () => ({ formData, selectedMain, selectedCat, selectedSub }),
    [formData, selectedMain, selectedCat, selectedSub]
  );

  const saveDraftToStorage = useCallback((payload: ReturnType<typeof getDraftPayload>) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ payload, savedAt: new Date().toISOString() }));
      setDraftTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDraftStatus("saved");
    } catch {
      setDraftStatus("unsaved");
    }
  }, [DRAFT_KEY]);

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftStatus("idle");
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const { payload } = JSON.parse(raw);
      if (payload.formData) {
        setFormData(payload.formData);
        if (payload.formData.content) {
          setTimeout(() => editorRef.current?.setHTML(payload.formData.content), 0);
        }
      }
      if (payload.selectedMain !== undefined) setSelectedMain(payload.selectedMain);
      if (payload.selectedCat !== undefined) setSelectedCat(payload.selectedCat);
      if (payload.selectedSub !== undefined) setSelectedSub(payload.selectedSub);
      setHasDraft(false);
      setDraftStatus("saved");
    } catch {
      setHasDraft(false);
    }
  };

  // Check for existing draft on mount
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const { savedAt } = JSON.parse(raw);
        setDraftTime(new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        setHasDraft(true);
      } catch { /* ignore */ }
    }
  }, [DRAFT_KEY]);

  // Auto-save 5s after changes
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setDraftStatus("saving");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const payload = getDraftPayload();
    autoSaveTimerRef.current = setTimeout(() => saveDraftToStorage(payload), 5000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [getDraftPayload, saveDraftToStorage]);

  // Load categories + existing blog
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategoriesData(data); })
      .catch(console.error);

    fetch(`/api/blogs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const loaded = {
          title: data.title || "",
          excerpt: data.excerpt || "",
          category: data.category || "",
          author: data.author || "",
          tags: data.tags || "",
          primaryImage: data.primaryImage || data.imageUrl || "",
          content: data.content || "",
          status: data.status || (data.isActive ? "active" : "draft"),
          readingTime: data.readingTime || 5,
          metaDescription: data.metaDescription || "",
        };
        setFormData(loaded);
        setSelectedMain(data.mainCategory || "");
        setSelectedCat(data.category || "");
        setSelectedSub(data.subcategory || "");
        if (data.content) {
          setTimeout(() => editorRef.current?.setHTML(data.content), 0);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, primaryImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSaving(true);
    const finalContent = editorRef.current?.getHTML() ?? "";
    const submitData = {
      ...formData,
      content: finalContent,
      mainCategory: selectedMain,
      category: selectedCat || formData.category,
      subcategory: selectedSub,
      status,
    };
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      if (res.ok) {
        if (status === "published") localStorage.removeItem(DRAFT_KEY);
        alert(status === "published" ? "Blog updated & published!" : "Draft saved!");
        if (status === "published") { router.push("/dashboard/blog"); router.refresh(); }
      } else {
        alert("Failed to update blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating blog.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);
        alert("Blog deleted.");
        router.push("/dashboard/blog");
        router.refresh();
      } else {
        alert("Failed to delete blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting blog.");
    }
    setIsSaving(false);
  };

  const draftStatusLabel =
    draftStatus === "saving"  ? "Auto-saving…" :
    draftStatus === "saved"   ? `Draft saved${draftTime ? " at " + draftTime : ""}` :
    draftStatus === "unsaved" ? "Failed to save draft" :
    "No changes";

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading blog…</div>;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard/blog" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-xl font-bold bg-gradient-to-br from-[#ffd700] to-[#ffc000] bg-clip-text text-transparent">
          Edit Blog
        </h1>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="text-center mb-10 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-br from-[#ffd700] to-[#ffc000] bg-clip-text text-transparent">
            Edit Blog Post
          </h2>
          <p className="text-lg text-gray-500">Update your existing blog post</p>
        </div>

        {/* Draft Restore Bar */}
        {hasDraft && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-3 shadow-sm flex-wrap">
            <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium flex-1">
              <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
              Unsaved local draft found{draftTime ? ` from ${draftTime}` : ""}. Restore it to continue where you left off.
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={restoreDraft}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                Restore Draft
              </button>
              <button type="button" onClick={discardDraft}
                className="border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 text-sm px-4 py-1.5 rounded-lg transition">
                Discard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit("published"); }} className="flex flex-col gap-8">

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500">Essential details about your blog post</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Blog Title *</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange} required
                  placeholder="Enter an engaging blog title"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/10 transition"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Excerpt</label>
                <textarea
                  name="excerpt" value={formData.excerpt} onChange={handleChange}
                  placeholder="Brief description that will appear in blog previews"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/10 transition min-h-[100px]"
                  maxLength={300}
                />
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">Category</label>
                    {selectedMain && (
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-2.5 py-1 rounded-full">{selectedMain}</span>
                        {selectedCat && <><span className="text-gray-400">›</span><span className="bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-full">{selectedCat}</span></>}
                        {selectedSub && <><span className="text-gray-400">›</span><span className="bg-green-100 text-green-800 border border-green-300 px-2.5 py-1 rounded-full">{selectedSub}</span></>}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Step 1: Main Category */}
                    <div className="border-r border-gray-200">
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-yellow-400 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Main Category</span>
                      </div>
                      <div className="overflow-y-auto max-h-56">
                        {categoriesData.length === 0 ? (
                          <div className="p-4 text-sm text-gray-400 text-center animate-pulse">Loading…</div>
                        ) : categoriesData.map((catObj) => {
                          const main = catObj.id;
                          const isSelected = selectedMain === main;
                          return (
                            <button key={main} type="button"
                              onClick={() => { toggleCat(main); setSelectedMain(main); setSelectedCat(""); setSelectedSub(""); setFormData((p) => ({ ...p, category: main })); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all border-b border-gray-100 last:border-0 ${
                                isSelected ? 'bg-yellow-50 text-yellow-900 border-l-4 border-l-yellow-400' : 'text-gray-700 hover:bg-gray-50 border-l-4 border-l-transparent'
                              }`}>
                              <Home size={14} className={isSelected ? "text-yellow-500" : "text-gray-400"} />
                              <span className="flex-1 leading-tight">{main}</span>
                              {isSelected && <ChevronRight size={14} className="text-yellow-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Step 2: Subcategory */}
                    <div className="border-r border-gray-200">
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${selectedMain ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subcategory</span>
                      </div>
                      <div className="overflow-y-auto max-h-56 p-3">
                        {!selectedMain ? (
                          <div className="h-full flex items-center justify-center text-xs text-gray-400 py-10 text-center">← Pick a main<br/>category first</div>
                        ) : (() => {
                          const catObj = categoriesData.find((c) => c.id === selectedMain);
                          const subs = Object.keys(catObj?.document?.subcategories || {});
                          return subs.length === 0 ? (
                            <div className="text-xs text-gray-400 py-10 text-center">No subcategories</div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {subs.map((sub) => (
                                <button key={sub} type="button"
                                  onClick={() => { setSelectedCat(sub); setSelectedSub(""); setFormData((p) => ({ ...p, category: sub })); }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedCat === sub ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                  }`}>
                                  {sub}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Step 3: Item / Tag */}
                    <div>
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${selectedCat ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400'}`}>3</span>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Item / Tag</span>
                      </div>
                      <div className="overflow-y-auto max-h-56 p-3">
                        {!selectedCat ? (
                          <div className="h-full flex items-center justify-center text-xs text-gray-400 py-10 text-center">← Pick a<br/>subcategory first</div>
                        ) : (() => {
                          const catObj = categoriesData.find((c) => c.id === selectedMain);
                          const items: string[] = catObj?.document?.subcategories?.[selectedCat]?.items || [];
                          return (
                            <div className="flex flex-col gap-2">
                              {items.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {items.map((item) => (
                                    <button key={item} type="button" onClick={() => setSelectedSub(item)}
                                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                                        selectedSub === item ? 'bg-green-500 text-white border-green-500 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50'
                                      }`}>{item}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <div className="border-t border-gray-100 pt-2">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1.5">Or type custom</p>
                                <input type="text" placeholder="Custom item / tag…" value={selectedSub}
                                  onChange={(e) => setSelectedSub(e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition bg-white text-gray-800" />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Author</label>
                  <input
                    type="text" name="author" value={formData.author} onChange={handleChange}
                    placeholder="Author name"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/10 transition"
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tags</label>
                <input
                  type="text" name="tags" value={formData.tags} onChange={handleChange}
                  placeholder="smart home, automation, IoT (comma separated)"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/10 transition"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] bg-white cursor-pointer">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary Image */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Primary Image</h2>
              <p className="text-sm text-gray-500">Upload the main image for your blog post</p>
            </div>
            <div className="p-6">
              {!formData.primaryImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center bg-gray-50 hover:bg-[#ffd700]/5 hover:border-[#ffd700] transition cursor-pointer relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <div className="text-lg text-gray-600 mb-2"><strong>Click to upload image</strong> or drag and drop</div>
                  <div className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-md p-4 text-center bg-white">
                  <img src={formData.primaryImage} alt="Preview" className="max-w-full max-h-[300px] mx-auto rounded-md mb-4" />
                  <div className="flex justify-center gap-4">
                    <label className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffc000] text-black rounded cursor-pointer text-sm font-medium transition">
                      Change Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, primaryImage: "" }))}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition">
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Content</h2>
              <p className="text-sm text-gray-500">Edit your blog post content</p>
            </div>
            <div className="p-6">
              <RichEditor
                ref={editorRef}
                placeholder="Write your blog post content here…"
                minHeight={420}
                onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
              />
            </div>
          </div>

          {/* SEO Options */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">SEO & Settings</h2>
              <p className="text-sm text-gray-500">Search engine and reading settings</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Reading Time (minutes)</label>
                <input
                  type="number" name="readingTime" value={formData.readingTime} onChange={handleChange} min="1" max="60"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Meta Description (SEO)</label>
                <textarea
                  name="metaDescription" value={formData.metaDescription} onChange={handleChange}
                  placeholder="Brief description for search engines (max 160 characters)"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/10 transition min-h-[80px]"
                  maxLength={160}
                />
                <small className="text-xs text-gray-500 mt-1 block">
                  <span className={formData.metaDescription.length > 150 ? "text-red-500" : ""}>
                    {formData.metaDescription.length}
                  </span>/160 characters
                </small>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </form>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <div className={`w-2 h-2 rounded-full ${
            draftStatus === "saving"  ? "bg-yellow-400 animate-pulse" :
            draftStatus === "saved"   ? "bg-green-500" :
            draftStatus === "unsaved" ? "bg-red-500" :
            "bg-gray-300"
          }`} />
          {draftStatusLabel}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleDelete} disabled={isSaving}
            className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition shadow-sm disabled:opacity-50 flex items-center gap-2">
            <Trash2 size={15} /> Delete
          </button>
          <Link href="/dashboard/blog"
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition shadow-sm">
            Cancel
          </Link>
          <button type="button" onClick={() => handleSubmit("draft")} disabled={isSaving}
            className="px-5 py-2.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-sm font-semibold hover:bg-yellow-200 transition shadow-sm disabled:opacity-50 flex items-center gap-2">
            <Save size={15} /> Save Draft
          </button>
          <button type="button" onClick={() => handleSubmit("published")} disabled={isSaving}
            className="px-7 py-2.5 bg-gradient-to-r from-[#ffd700] to-[#ffc000] text-black rounded-lg text-sm font-bold hover:shadow-md transition disabled:opacity-50 flex items-center gap-2">
            {isSaving ? "Saving…" : "Update Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
