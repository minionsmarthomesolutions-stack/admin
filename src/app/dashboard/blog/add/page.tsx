"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import CategorySelector from "@/components/ui/CategorySelector";
import RichEditor, { RichEditorHandle } from "@/components/ui/RichEditor";

export default function AddBlogPage() {
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
    metaDescription: ""
  });

  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<RichEditorHandle>(null);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCategoriesData(data);
    }).catch(console.error);
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, primaryImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePrimaryImage = () => {
    setFormData(prev => ({ ...prev, primaryImage: "" }));
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Ensure we have the latest content from the editor
    const finalContent = editorRef.current?.getHTML() ?? "";
    const submitData = {
      ...formData,
      content: finalContent,
      mainCategory: selectedMain,
      category: selectedCat || formData.category,
      subcategory: selectedSub,
    };

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        alert("Blog successfully saved!");
        router.push("/dashboard/blog");
        router.refresh();
      } else {
        alert("Failed to save blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving blog.");
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 font-sans text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/blog" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl font-bold bg-gradient-to-br from-[#ffd700] to-[#ffc000] bg-clip-text text-transparent">Add New Blog</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="text-center mb-10 bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-br from-[#ffd700] to-[#ffc000] bg-clip-text text-transparent">Add Blog Post</h1>
          <p className="text-lg text-gray-500">Create a new post for your blog</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Basic Information Card */}
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 transition"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Excerpt *</label>
                <textarea
                  name="excerpt" value={formData.excerpt} onChange={handleChange} required
                  placeholder="Brief description that will appear in blog previews"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 transition min-h-[100px]"
                  maxLength={300}
                />
              </div>


              {/* Category + Author row */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Category *</label>
                  <CategorySelector
                    categoriesData={categoriesData}
                    selectedMain={selectedMain}
                    selectedCat={selectedCat}
                    selectedSub={selectedSub}
                    onSelect={(main, cat, sub) => {
                      setSelectedMain(main);
                      setSelectedCat(cat);
                      setSelectedSub(sub);
                      setFormData(p => ({ ...p, category: cat || main }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Author *</label>
                  <input
                    type="text" name="author" value={formData.author} onChange={handleChange} required
                    placeholder="Author name"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 transition"
                    maxLength={50}
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tags</label>
                <input
                  type="text" name="tags" value={formData.tags} onChange={handleChange}
                  placeholder="smart home, automation, IoT, technology (comma separated)"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 transition"
                  maxLength={200}
                />
                <small className="text-xs text-gray-500 mt-1 block">Tags help readers find related content</small>
              </div>
            </div>
          </div>

          {/* Primary Image Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Primary Image *</h2>
              <p className="text-sm text-gray-500">Upload a main image that will represent your blog post</p>
            </div>
            <div className="p-6">
              {!formData.primaryImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center bg-gray-50 hover:bg-[#ffd700]/5 hover:border-[#ffd700] transition cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required 
                  />
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <div className="text-lg text-gray-600 mb-2"><strong>Click to upload primary image</strong> or drag and drop</div>
                  <div className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB (Required)</div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-md p-4 text-center bg-white">
                  <img src={formData.primaryImage} alt="Preview" className="max-w-full max-h-[300px] mx-auto rounded-md mb-4" />
                  <div className="flex justify-center gap-4">
                    <label className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffc000] text-black rounded cursor-pointer text-sm font-medium transition">
                      Change Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <button type="button" onClick={removePrimaryImage} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer text-sm font-medium transition">
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Card (Rich Text Editor) */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Content</h2>
              <p className="text-sm text-gray-500">Write your blog post content with comprehensive formatting tools</p>
            </div>
            <div className="p-6">
              <RichEditor
                ref={editorRef}
                placeholder="Write your blog post content here…"
                minHeight={420}
                onChange={html => setFormData(p => ({ ...p, content: html }))}
              />
            </div>
          </div>

          {/* Publishing Options Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Publishing Options</h2>
              <p className="text-sm text-gray-500">Configure how your blog post will be published</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 bg-white cursor-pointer"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Now</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Reading Time (minutes)</label>
                  <input
                    type="number" name="readingTime" value={formData.readingTime} onChange={handleChange} min="1" max="60"
                    placeholder="Estimated reading time"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Meta Description (SEO)</label>
                <textarea
                  name="metaDescription" value={formData.metaDescription} onChange={handleChange}
                  placeholder="Brief description for search engines (max 160 characters)"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#ffd700] focus:ring-3 focus:ring-[#ffd700]/10 transition min-h-[80px]"
                  maxLength={160}
                />
                <small className="text-xs text-gray-500 mt-1 block">
                  <span className={formData.metaDescription.length > 150 ? "text-red-500" : ""}>{formData.metaDescription.length}</span>/160 characters - This helps with search engine optimization
                </small>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-2 mb-10">
            <Link href="/dashboard/blog" className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-md text-base font-medium hover:bg-gray-50 transition">
              Cancel
            </Link>
            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-gradient-to-r from-[#ffd700] to-[#ffc000] text-black rounded-md text-base font-medium hover:shadow-md transition disabled:opacity-50 flex items-center gap-2">
              {isSaving ? "Publishing..." : <><Save size={18} /> Publish Blog Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

