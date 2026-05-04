"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Lightbulb, Save } from "lucide-react";
import Link from "next/link";

interface LinkData {
  main: string;
  sub: string;
  subSub: string;
  url: string;
  productId: string;
  productName: string;
}

interface BannerSlot {
  image: string | null;
  alt: string;
  cta: string;
  linkType: string;
  linkData: LinkData;
  transform: { scale: number; x: number; y: number };
}

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    type: "single",
    productId: "",
    productName: "",
    banners: {
      a: {
        image: null,
        alt: "",
        cta: "",
        linkType: "category",
        linkData: { main: "", sub: "", subSub: "", url: "", productId: "", productName: "" },
        transform: { scale: 1, x: 0, y: 0 }
      } as BannerSlot,
      b: {
        image: null,
        alt: "",
        cta: "",
        linkType: "category",
        linkData: { main: "", sub: "", subSub: "", url: "", productId: "", productName: "" },
        transform: { scale: 1, x: 0, y: 0 }
      } as BannerSlot
    }
  });

  const [activeSlot, setActiveSlot] = useState<'a' | 'b'>('a');
  const [isMobileView, setIsMobileView] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState<any>({});
  
  // product search states
  const [searchQueryA, setSearchQueryA] = useState("");
  const [searchResultsA, setSearchResultsA] = useState<any[]>([]);
  const [searchQueryB, setSearchQueryB] = useState("");
  const [searchResultsB, setSearchResultsB] = useState<any[]>([]);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map: any = {};
          data.forEach(cat => {
            map[cat.id] = cat.document;
          });
          setCategoriesMap(map);
        }
      })
      .catch(console.error);

    // Fetch existing banner
    fetch(`/api/banners/${resolvedParams.id}`)
      .then(r => r.json())
      .then(data => {
        setFormData(data.document || data);
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, [resolvedParams.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'a' | 'b') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          banners: {
            ...prev.banners,
            [slot]: {
              ...prev.banners[slot],
              image: reader.result as string,
              transform: { scale: 1, x: 0, y: 0 }
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransformChange = (slot: 'a' | 'b', field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      banners: {
        ...prev.banners,
        [slot]: {
          ...prev.banners[slot],
          transform: {
            ...prev.banners[slot].transform,
            [field]: value
          }
        }
      }
    }));
  };

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  const handlePointerDown = (e: React.PointerEvent, slot: 'a' | 'b') => {
    setActiveSlot(slot);
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - formData.banners[slot].transform.x,
      startY: e.clientY - formData.banners[slot].transform.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent, slot: 'a' | 'b') => {
    if (!dragRef.current.isDragging) return;
    const newX = e.clientX - dragRef.current.startX;
    const newY = e.clientY - dragRef.current.startY;
    handleTransformChange(slot, 'x', newX);
    handleTransformChange(slot, 'y', newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent, slot: 'a' | 'b') => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    let newScale = formData.banners[slot].transform.scale + delta;
    if (newScale < 0.1) newScale = 0.1;
    if (newScale > 3) newScale = 3;
    handleTransformChange(slot, 'scale', newScale);
  };

  const searchProducts = async (term: string, setResults: any) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    // Search the Supabase endpoint locally
    try {
      const res = await fetch(`/api/products`);
      const all = await res.json();
      const filtered = all.filter((p: any) => p.name?.toLowerCase().includes(term.toLowerCase()));
      setResults(filtered.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const selectProduct = (slot: 'a' | 'b', prod: any) => {
    setFormData(prev => ({
      ...prev,
      banners: {
        ...prev.banners,
        [slot]: {
          ...prev.banners[slot],
          linkData: {
            ...prev.banners[slot].linkData,
            productId: prod.id,
            productName: prod.name
          }
        }
      }
    }));
    if(slot === 'a') setSearchResultsA([]);
    if(slot === 'b') setSearchResultsB([]);
  };

  const generateCroppedBlob = async (slot: 'a' | 'b', containerId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const imgState = formData.banners[slot];
      if (!imgState.image) return resolve(null);

      const img = new Image();
      img.src = imgState.image;
      img.onload = () => {
        const container = document.getElementById(containerId);
        if (!container) return resolve(imgState.image);

        const canvas = document.createElement('canvas');
        const isDouble = formData.type === 'double';
        canvas.width = isDouble ? 600 : 1200;
        canvas.height = 300; 
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imgState.image);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const previewW = container.offsetWidth;
        const scaleRatio = canvas.width / previewW;
        const transform = imgState.transform;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.translate(transform.x * scaleRatio, transform.y * scaleRatio);
        const effectiveScale = transform.scale * scaleRatio;
        ctx.scale(effectiveScale, effectiveScale);

        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL('image/webp', 0.9));
      };
      img.onerror = () => resolve(imgState.image);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const croppedA = await generateCroppedBlob('a', 'preview-container-a');
      let croppedB = null;
      if (formData.type === 'double') {
        croppedB = await generateCroppedBlob('b', 'preview-container-b');
      }

      const payload = {
        ...formData,
        banners: {
          a: { ...formData.banners.a, image: croppedA },
          b: formData.type === 'double' ? { ...formData.banners.b, image: croppedB } : null
        }
      };

      const res = await fetch(`/api/banners/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const mainCategories = Object.keys(categoriesMap);
  const getSubcategories = (main: string) => {
    if (!main || !categoriesMap[main]) return [];
    const subs = categoriesMap[main].subcategories || categoriesMap[main];
    return Object.keys(subs).filter(k => k !== 'id' && k !== 'code' && k !== 'logo');
  };
  const getSubSubcategories = (main: string, sub: string) => {
    if (!main || !sub || !categoriesMap[main]) return [];
    const subs = categoriesMap[main].subcategories || categoriesMap[main];
    const subData = subs[sub];
    if (!subData) return [];
    if (subData.items) return Array.isArray(subData.items) ? subData.items : Object.keys(subData.items);
    if (Array.isArray(subData)) return subData;
    return Object.keys(subData).filter(k => k !== 'logo' && k !== 'itemLogos' && k !== 'items');
  };

  const renderSlotConfig = (slot: 'a' | 'b') => {
    const slotData = formData.banners[slot];
    const updateSlot = (updates: any) => {
      setFormData(prev => ({
        ...prev,
        banners: { ...prev.banners, [slot]: { ...prev.banners[slot], ...updates } }
      }));
    };
    const updateLink = (updates: any) => {
      updateSlot({ linkData: { ...slotData.linkData, ...updates } });
    };

    return (
      <div className="bg-white rounded border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-[16px] font-bold text-[#1E293B] mb-5">Banner {slot.toUpperCase()} Config</h3>

        <div
          onClick={() => slot === 'a' ? fileInputRefA.current?.click() : fileInputRefB.current?.click()}
          className="border border-dashed border-gray-300 rounded p-12 flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition cursor-pointer mb-6"
        >
          <span className="text-blue-600 text-sm font-medium">Click to Upload Image</span>
          <input
            type="file"
            ref={slot === 'a' ? fileInputRefA : fileInputRefB}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, slot)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Alt Text</label>
            <input type="text" value={slotData.alt} onChange={e => updateSlot({ alt: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">CTA Text</label>
            <input type="text" value={slotData.cta} onChange={e => updateSlot({ cta: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Link Destination</label>
          <select value={slotData.linkType} onChange={e => updateSlot({ linkType: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none">
            <option value="category">Category</option>
            <option value="product">Product</option>
            <option value="custom">Custom URL</option>
          </select>
        </div>

        {slotData.linkType === 'category' && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
            <select value={slotData.linkData.main} onChange={e => updateLink({ main: e.target.value, sub: "", subSub: "" })} className="border rounded px-2 py-1 text-sm outline-none">
              <option value="">Main Category...</option>
              {mainCategories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={slotData.linkData.sub} onChange={e => updateLink({ sub: e.target.value, subSub: "" })} disabled={!slotData.linkData.main} className="border rounded px-2 py-1 text-sm outline-none">
              <option value="">Sub Category...</option>
              {getSubcategories(slotData.linkData.main).map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={slotData.linkData.subSub} onChange={e => updateLink({ subSub: e.target.value })} disabled={!slotData.linkData.sub} className="border rounded px-2 py-1 text-sm outline-none">
              <option value="">Child Category...</option>
              {getSubSubcategories(slotData.linkData.main, slotData.linkData.sub).map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {slotData.linkType === 'product' && (
          <div className="p-4 bg-gray-50 rounded relative">
            <input 
              type="text" 
              placeholder="Search product..." 
              value={slot === 'a' ? searchQueryA : searchQueryB}
              onChange={e => {
                const val = e.target.value;
                if(slot === 'a') { setSearchQueryA(val); searchProducts(val, setSearchResultsA); }
                else { setSearchQueryB(val); searchProducts(val, setSearchResultsB); }
              }}
              className="w-full border rounded px-3 py-2 text-sm outline-none" 
            />
            {slotData.linkData.productName && <div className="mt-2 text-sm text-blue-600 font-medium">Selected: {slotData.linkData.productName}</div>}
            
            {((slot === 'a' ? searchResultsA : searchResultsB).length > 0) && (
              <div className="absolute top-full left-0 right-0 bg-white border shadow-lg z-10 max-h-48 overflow-y-auto mt-1 rounded">
                {(slot === 'a' ? searchResultsA : searchResultsB).map((p: any) => (
                  <div key={p.id} onClick={() => selectProduct(slot, p)} className="p-2 border-b cursor-pointer hover:bg-gray-50 text-sm">
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {slotData.linkType === 'custom' && (
          <div className="p-4 bg-gray-50 rounded">
            <input type="text" placeholder="https://..." value={slotData.linkData.url} onChange={e => updateLink({ url: e.target.value })} className="w-full border rounded px-3 py-2 text-sm outline-none" />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading banner data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-[#1E293B]">Edit Banner</h1>
        <Link href="/dashboard/banners" className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Back</Link>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto mt-6 px-4 flex flex-col gap-6">
        
        {/* Preview Section */}
        <div className="bg-white rounded border shadow-sm">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-[#F8F9FA]">
            <h2 className="text-lg font-bold">Live Preview</h2>
            <button type="button" onClick={() => setIsMobileView(!isMobileView)} className={`p-2 rounded ${isMobileView ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
              <Smartphone size={18} />
            </button>
          </div>
          <div className="p-6">
            <div className={`flex gap-4 ${isMobileView ? 'flex-col max-w-[375px] mx-auto' : 'w-full'}`}>
              
              {/* Box A */}
              <div 
                id="preview-container-a"
                className={`relative bg-gray-100 overflow-hidden rounded border-2 border-dashed ${activeSlot === 'a' ? 'border-blue-500' : 'border-gray-300'} flex-1`}
                style={{ aspectRatio: formData.type === 'single' ? '4/1' : '2/1', cursor: 'grab' }}
                onPointerDown={(e) => handlePointerDown(e, 'a')}
                onPointerMove={(e) => handlePointerMove(e, 'a')}
                onPointerUp={handlePointerUp}
                onWheel={(e) => handleWheel(e, 'a')}
              >
                {formData.banners.a.image && (
                  <img 
                    src={formData.banners.a.image} 
                    className="absolute left-1/2 top-1/2 pointer-events-none origin-center"
                    style={{
                      transform: `translate(calc(-50% + ${formData.banners.a.transform.x}px), calc(-50% + ${formData.banners.a.transform.y}px)) scale(${formData.banners.a.transform.scale})`
                    }}
                  />
                )}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">A: {formData.banners.a.transform.scale.toFixed(1)}x</div>
              </div>

              {/* Box B */}
              {formData.type === 'double' && (
                <div 
                  id="preview-container-b"
                  className={`relative bg-gray-100 overflow-hidden rounded border-2 border-dashed ${activeSlot === 'b' ? 'border-blue-500' : 'border-gray-300'} flex-1`}
                  style={{ aspectRatio: '2/1', cursor: 'grab' }}
                  onPointerDown={(e) => handlePointerDown(e, 'b')}
                  onPointerMove={(e) => handlePointerMove(e, 'b')}
                  onPointerUp={handlePointerUp}
                  onWheel={(e) => handleWheel(e, 'b')}
                >
                  {formData.banners.b.image && (
                    <img 
                      src={formData.banners.b.image} 
                      className="absolute left-1/2 top-1/2 pointer-events-none origin-center"
                      style={{
                        transform: `translate(calc(-50% + ${formData.banners.b.transform.x}px), calc(-50% + ${formData.banners.b.transform.y}px)) scale(${formData.banners.b.transform.scale})`
                      }}
                    />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">B: {formData.banners.b.transform.scale.toFixed(1)}x</div>
                </div>
              )}
            </div>

            <div className="mt-6 max-w-md mx-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zoom / Scale ({activeSlot === 'a' ? 'Banner A' : 'Banner B'})
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.05" 
                value={formData.banners[activeSlot].transform.scale}
                onChange={(e) => handleTransformChange(activeSlot, 'scale', parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 justify-center">
              <Lightbulb size={14} className="text-yellow-500" /> Drag to pan. Scroll to zoom. Click box to select active.
            </div>
          </div>
        </div>

        <div className="bg-white rounded border shadow-sm p-6">
          <h3 className="font-bold mb-4">General Settings</h3>
          <input type="text" placeholder="Title" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded p-2 mb-4 outline-none focus:border-blue-500" />
          <textarea placeholder="Description" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded p-2 mb-4 outline-none focus:border-blue-500" rows={3}></textarea>
          
          <div className="flex items-center gap-3 mt-2">
            <label className="text-sm font-semibold text-gray-700">Status:</label>
            <select 
              value={(formData as any).isActive ? "active" : "draft"} 
              onChange={e => setFormData({ ...formData, isActive: e.target.value === "active" } as any)} 
              className="border rounded p-1.5 text-sm outline-none focus:border-blue-500 bg-gray-50"
            >
              <option value="active">Active (Published)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded border shadow-sm p-6">
          <h3 className="font-bold mb-4">Category Mapping</h3>
          <p className="text-sm text-gray-500 mb-3">Select the page/category where this banner should appear.</p>
          <select 
            value={formData.categoryId} 
            onChange={e => setFormData({ ...formData, categoryId: e.target.value })} 
            className="w-full border rounded p-2 outline-none focus:border-blue-500"
            required
          >
            <option value="">Select Category...</option>
            <option value="home">Home Page (All Categories)</option>
            {mainCategories.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="bg-white rounded border shadow-sm p-6">
          <h3 className="font-bold mb-4">Banner Layout</h3>
          <div className="flex gap-4">
            <label className={`flex-1 p-4 border rounded cursor-pointer ${formData.type === 'single' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <input type="radio" name="btype" checked={formData.type === 'single'} onChange={() => setFormData({ ...formData, type: 'single' })} className="hidden" />
              <div className="font-bold text-center">Single Banner</div>
            </label>
            <label className={`flex-1 p-4 border rounded cursor-pointer ${formData.type === 'double' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <input type="radio" name="btype" checked={formData.type === 'double'} onChange={() => setFormData({ ...formData, type: 'double' })} className="hidden" />
              <div className="font-bold text-center">Double Banner</div>
            </label>
          </div>
        </div>

        {renderSlotConfig('a')}
        {formData.type === 'double' && renderSlotConfig('b')}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end z-50">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
            <Save size={16} /> Save Banner
          </button>
        </div>

      </form>
    </div>
  );
}
