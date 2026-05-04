"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";

export default function AddBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    primaryImage: "",
    status: "draft"
  });

  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/blog" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl font-bold text-[#1E293B]">Add New Blog</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-6 px-4 flex flex-col gap-6">
        <div className="bg-white rounded border border-gray-100 shadow-sm p-6">
          <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">General Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Blog Title</label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="Enter blog title"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer hover:border-gray-300"
              >
                <option value="">Select Category...</option>
                {categoriesData.map(cat => (
                  <optgroup key={cat.id} label={cat.id}>
                    <option value={cat.id}>{cat.id}</option>
                    {Object.keys(cat.document?.subcategories || {}).map(sub => (
                      <option key={sub} value={`${cat.id} > ${sub}`}>-- {sub}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer hover:border-gray-300"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
              {formData.primaryImage && (
                <img src={formData.primaryImage} alt="Preview" className="mt-2 h-32 object-cover rounded border" />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Content</label>
              <textarea
                name="content" value={formData.content} onChange={handleChange} required
                placeholder="Write your blog post here..."
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[200px] resize-y transition"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Link href="/dashboard/blog" className="px-6 py-2 bg-white text-gray-600 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 shadow-sm">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-2">
            {isSaving ? "Saving..." : <><Save size={16} /> Save Blog</>}
          </button>
        </div>
      </form>
    </div>
  );
}
