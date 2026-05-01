"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function AddBannerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    productName: "",
    type: "single",
    altText: "",
    ctaText: "",
    linkDestination: "Specific Category",
    imageA: null as string | null,
    imageB: null as string | null,
  });

  const [zoomA, setZoomA] = useState(1);
  const [zoomB, setZoomB] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageA' | 'imageB') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Banner successfully saved!");
        router.push("/dashboard/banners");
        router.refresh();
      } else {
        alert("Failed to save banner.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving banner.");
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-gray-800">
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-wrap gap-4">
        <h1 className="text-xl font-bold text-[#1E293B]">Admin Banner/Ads Manager</h1>
        <Link href="/dashboard/banners" className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded drop-shadow-sm font-medium hover:bg-gray-50 transition text-sm">
          Back to Dashboard
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto mt-6 px-4 flex flex-col gap-6 relative">
        
        {/* Live Preview Section */}
        <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
            <h2 className="text-lg font-bold text-[#1e3a8a]">Live Preview</h2>
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-gray-500 cursor-pointer" />
              <button type="button" className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">Reset View</button>
            </div>
          </div>
          
          <div className="p-6 overflow-hidden">
            <div className="flex gap-4 w-full">
              {/* Banner A Preview Box */}
              <div className="relative border border-dashed border-blue-400 flex-1 h-[300px] flex items-center justify-center bg-white rounded overflow-hidden">
                {formData.imageA ? (
                  <img 
                    src={formData.imageA} 
                    alt="Live Preview A" 
                    className="max-w-full max-h-full transition-transform duration-200 object-contain origin-center"
                    style={{ transform: `scale(${zoomA})` }}
                    draggable={true}
                  />
                ) : (
                  <span className="text-[#94A3B8] font-medium text-lg">Banner A Preview</span>
                )}
                <div className="absolute bottom-2 right-2 bg-gray-500 text-white text-[10px] px-2 py-1 rounded opacity-80">
                  Scale: {zoomA.toFixed(1)}
                </div>
              </div>

              {/* Banner B Preview Box (Conditionally Rendered) */}
              {formData.type === 'double' && (
                <div className="relative border border-dashed border-blue-400 flex-1 h-[300px] flex items-center justify-center bg-white rounded overflow-hidden">
                  {formData.imageB ? (
                    <img 
                      src={formData.imageB} 
                      alt="Live Preview B" 
                      className="max-w-full max-h-full transition-transform duration-200 object-contain origin-center"
                      style={{ transform: `scale(${zoomB})` }}
                      draggable={true}
                    />
                  ) : (
                    <span className="text-[#94A3B8] font-medium text-lg">Banner B Preview</span>
                  )}
                  <div className="absolute bottom-2 right-2 bg-gray-500 text-white text-[10px] px-2 py-1 rounded opacity-80">
                    Scale: {zoomB.toFixed(1)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-4 w-full">
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex-1">
                <div className="text-xs text-gray-700 font-medium mb-3">Zoom / Scale (Banner A)</div>
                <input type="range" min="0.5" max="2" step="0.1" value={zoomA} onChange={(e) => setZoomA(Number(e.target.value))} className="w-full mb-3 accent-blue-600" />
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Lightbulb size={14} className="text-yellow-500" /> 
                  Drag image to move. Scroll to zoom.
                </div>
              </div>

              {formData.type === 'double' && (
                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex-1">
                  <div className="text-xs text-gray-700 font-medium mb-3">Zoom / Scale (Banner B)</div>
                  <input type="range" min="0.5" max="2" step="0.1" value={zoomB} onChange={(e) => setZoomB(Number(e.target.value))} className="w-full mb-3 accent-blue-600" />
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Lightbulb size={14} className="text-yellow-500" /> 
                    Drag image to move. Scroll to zoom.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* General Information */}
        <div className="bg-white rounded border border-gray-100 shadow-sm p-6">
          <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">General Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Title (SEO)</label>
              <input 
                type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="e.g., Summer Sale 2025" 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description (SEO)</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange}
                placeholder="Brief description for search engines..." 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y transition"
              />
            </div>
          </div>
        </div>

        {/* Category Mapping */}
        <div className="bg-white rounded border border-gray-100 shadow-sm p-6">
          <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">Category Mapping</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Main Category</label>
            <select className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer hover:border-gray-300">
              <option>Select Category...</option>
            </select>
          </div>
        </div>

        {/* Product Linking */}
        <div className="bg-white rounded border border-gray-100 shadow-sm p-6">
          <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">Product Linking (Optional)</h3>
          <input 
             type="text" 
             placeholder="Search for a product by name..." 
             className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-[#F8FAFC]" 
          />
        </div>

        {/* Banner Configuration */}
        <div className="bg-white rounded border border-gray-100 shadow-sm p-6">
          <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">Banner Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, type: 'single'})}
              className={`p-6 rounded flex flex-col items-center justify-center border-2 transition ${formData.type === 'single' ? 'border-blue-500 bg-[#F0F5FF]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <span className="font-bold text-[#1E293B] text-sm">Single Banner</span>
              <span className="text-gray-500 text-xs mt-1">One large hero image</span>
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, type: 'double'})}
              className={`p-6 rounded flex flex-col items-center justify-center border-2 transition ${formData.type === 'double' ? 'border-blue-500 bg-[#F0F5FF]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <span className="font-bold text-[#1E293B] text-sm">Double Banner</span>
              <span className="text-gray-500 text-xs mt-1">Two side-by-side images</span>
            </button>
          </div>
        </div>

        {/* Banner A Primary */}
        <div className="bg-white rounded border border-gray-100 shadow-sm p-6 mb-20">
          <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">Banner A Primary</h3>
          
          <div 
             onClick={() => fileInputRef.current?.click()} 
             className="border border-dashed border-gray-300 rounded p-12 flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition cursor-pointer mb-6 relative overflow-hidden"
          >
            {formData.imageA ? (
              <div className="flex flex-col items-center">
                 <img src={formData.imageA} alt="Thumbnail preview" className="max-h-[120px] object-contain mb-3 rounded" />
                 <span className="text-blue-600 text-xs font-medium">Click to change image</span>
              </div>
            ) : (
              <span className="text-blue-600 text-sm font-medium">Click to Upload Image</span>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'imageA')} 
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Alt Text</label>
              <input type="text" placeholder="Image description" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">CTA Text</label>
              <input type="text" placeholder="e.g., Shop Now" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-700 mb-1">Link Destination</label>
             <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus-within:border-blue-500 flex items-center bg-white cursor-text">
               <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs mr-2">Specific Category</span>
               <select className="flex-1 bg-transparent border-none outline-none text-gray-500 appearance-none cursor-pointer">
                 <option></option>
               </select>
               <span className="text-gray-400 text-xs">▼</span>
             </div>
          </div>
        </div>

        {/* Banner B Secondary (Conditionally Rendered) */}
        {formData.type === 'double' && (
          <div className="bg-white rounded border border-gray-100 shadow-sm p-6 mb-20 animate-in fade-in zoom-in duration-300">
            <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">Banner B Secondary</h3>
            
            <div 
               onClick={() => fileInputRefB.current?.click()} 
               className="border border-dashed border-gray-300 rounded p-12 flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition cursor-pointer mb-6 relative overflow-hidden"
            >
              {formData.imageB ? (
                <div className="flex flex-col items-center">
                   <img src={formData.imageB} alt="Thumbnail preview B" className="max-h-[120px] object-contain mb-3 rounded" />
                   <span className="text-blue-600 text-xs font-medium">Click to change image</span>
                </div>
              ) : (
                <span className="text-blue-600 text-sm font-medium">Click to Upload Image</span>
              )}
              <input 
                type="file" 
                ref={fileInputRefB} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'imageB')} 
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alt Text</label>
                <input type="text" placeholder="Image description" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">CTA Text</label>
                <input type="text" placeholder="e.g., Learn More" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-gray-700 mb-1">Link Destination</label>
               <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus-within:border-blue-500 flex items-center bg-white cursor-text">
                 <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs mr-2">Specific Category</span>
                 <select className="flex-1 bg-transparent border-none outline-none text-gray-500 appearance-none cursor-pointer">
                   <option></option>
                 </select>
                 <span className="text-gray-400 text-xs">▼</span>
               </div>
            </div>
          </div>
        )}

        {/* Fixed Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-50">
          <button type="button" className="px-6 py-2 bg-white text-gray-600 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 shadow-sm">
            Reset
          </button>
          <button type="submit" className="px-6 py-2 bg-[#2563EB] text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
            Save Banner
          </button>
        </div>
      </form>
    </div>
  );
}
