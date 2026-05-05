"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, BarChart2, Podcast } from "lucide-react";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(b => 
    b.title?.toLowerCase().includes(search.toLowerCase()) || 
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = { 
    total: blogs.length, 
    active: blogs.filter(b => b.status === 'published' || b.status === 'active' || b.isActive).length, 
    groups: new Set(blogs.map(b => b.category).filter(Boolean)).size 
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 mt-1">Manage and organise your blog posts</p>
        </div>
        <Link
          href="/dashboard/blog/add"
          className="bg-[#ffc800] text-white px-5 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} />
          Add New Blog
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Blogs", value: stats.total, color: "text-[#ffc800]" },
          { label: "Active Blogs", value: stats.active, color: "text-emerald-500" },
          { label: "Categories", value: stats.groups, color: "text-blue-500" },
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

      {/* ── Blogs Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Blogs</h2>
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition w-full sm:w-64 bg-gray-50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <Podcast className="text-gray-200 w-12 h-12" />
              <p className="text-gray-400 font-medium">Loading blogs…</p>
            </div>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="border border-gray-200 rounded-xl p-4 flex flex-col">
                {blog.imageUrl || blog.primaryImage ? (
                  <img src={blog.imageUrl || blog.primaryImage} alt={blog.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-400">
                    No Image
                  </div>
                )}
                <h3 className="font-semibold text-lg text-gray-800 mb-1">{blog.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-500 mb-3">{blog.category || 'Uncategorized'}</p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    blog.status === 'published' || blog.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {blog.status || (blog.isActive ? 'active' : 'draft')}
                  </span>
                  <Link href={`/dashboard/blog/${blog.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-yellow-50 text-[#ffc800] rounded-full flex items-center justify-center mb-4">
              <Podcast size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Blogs Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Start by writing your first blog post.
            </p>
            <Link
              href="/dashboard/blog/add"
              className="bg-yellow-50 text-[#ffc800] border border-yellow-200 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-100 transition"
            >
              Add First Blog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
