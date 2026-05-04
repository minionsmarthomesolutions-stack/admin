"use client";

import { useState, useEffect } from "react";
import { 
  Camera, 
  Home, 
  ChevronRight, 
  Bold, 
  Italic, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Undo,
  Redo, 
  Underline,
  Link as LinkIcon,
  Table,
  CheckSquare,
  Gift,
  Copy,
  X,
  Scissors,
  Save,
  Palette
} from "lucide-react";

// Types for our dynamic form
interface Feature {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface ServicePackage {
  priceInfo: string;
  pricePopup: string;
  included: Feature[];
  notIncluded: Feature[];
  complimentary: Feature[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const defaultFeature = (): Feature => ({ id: generateId(), title: "", description: "" });
const defaultPackage = (): ServicePackage => ({
  priceInfo: "",
  pricePopup: "",
  included: [defaultFeature()],
  notIncluded: [defaultFeature()],
  complimentary: [defaultFeature()]
});

// UI Components
const ImageUploadBox = ({ label, size, className = "" }: { label: string, size: string, className?: string }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <label className={`border-2 ${preview ? 'border-solid p-0' : 'border-dashed p-4'} border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition relative overflow-hidden ${className}`}>
      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      {preview ? (
        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
      ) : (
        <>
          <Camera className="text-gray-700 w-6 h-6 mb-2" />
          <span className="text-sm font-bold text-gray-800 text-center">{label}</span>
          <span className="text-xs text-yellow-500 font-medium mt-1">{size}</span>
        </>
      )}
    </label>
  );
};

const FeatureItem = ({ 
  item, 
  isExclusion = false, 
  isComplimentary = false,
  onChange, 
  onDelete, 
  onReplicate 
}: { 
  item: Feature;
  isExclusion?: boolean;
  isComplimentary?: boolean;
  onChange: (field: string, val: string) => void;
  onDelete: () => void;
  onReplicate: () => void;
}) => (
  <div className={`flex gap-4 items-start border p-3 rounded-lg bg-gray-50/50 mb-3 relative ${isComplimentary ? 'border-yellow-400' : 'border-gray-100'}`}>
    <div className="flex-1 flex flex-col gap-2">
      <input 
        type="text" 
        value={item.title}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder={isComplimentary ? "Complimentary work title" : isExclusion ? "Exclusion title" : "Feature title"} 
        className={`border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 bg-white outline-none ${isComplimentary ? 'focus:border-yellow-400' : 'focus:border-blue-400'}`} 
      />
      <textarea 
        value={item.description}
        onChange={(e) => onChange('description', e.target.value)}
        placeholder={isComplimentary ? "Complimentary work description" : isExclusion ? "Exclusion description" : "Feature description"} 
        rows={isComplimentary ? 3 : 2} 
        className={`border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 bg-white outline-none resize-none ${isComplimentary ? 'focus:border-yellow-400' : 'focus:border-blue-400'}`}
      ></textarea>
    </div>
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`w-20 h-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs text-gray-400 text-center p-1 relative overflow-hidden ${isComplimentary ? 'w-24 h-24' : ''}`}>
        {item.image ? (
          <img src={item.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          isComplimentary ? "Complimentary" : isExclusion ? "Not Included" : "Feature"
        )}
      </div>
      <label className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 px-3 rounded w-full transition text-center cursor-pointer block">
        Upload Image
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange('image', URL.createObjectURL(file));
          }} 
        />
      </label>
    </div>
    <div className="flex flex-col gap-2">
      <button onClick={onReplicate} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 px-2 rounded flex items-center gap-1 transition">
        <Copy size={12} /> Replicate
      </button>
      <button onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white text-xs p-1.5 flex items-center justify-center transition mx-auto w-8 h-8 rounded-full">
        <X size={14} />
      </button>
    </div>
  </div>
);

const PackageSection = ({ 
  title, 
  iconColor, 
  borderColor, 
  isPremium = false,
  pkgData,
  updatePkg
}: { 
  title: string; 
  iconColor: string; 
  borderColor: string; 
  isPremium?: boolean;
  pkgData: ServicePackage;
  updatePkg: (data: ServicePackage) => void;
}) => {
  const addFeature = (type: 'included' | 'notIncluded' | 'complimentary') => {
    updatePkg({ ...pkgData, [type]: [...pkgData[type], defaultFeature()] });
  };
  
  const updateFeature = (type: 'included' | 'notIncluded' | 'complimentary', id: string, field: string, val: string) => {
    updatePkg({
      ...pkgData,
      [type]: pkgData[type].map(f => f.id === id ? { ...f, [field]: val } : f)
    });
  };

  const removeFeature = (type: 'included' | 'notIncluded' | 'complimentary', id: string) => {
    updatePkg({
      ...pkgData,
      [type]: pkgData[type].filter(f => f.id !== id)
    });
  };
  
  const replicateFeature = (type: 'included' | 'notIncluded' | 'complimentary', id: string) => {
    const item = pkgData[type].find(f => f.id === id);
    if (item) {
      updatePkg({
        ...pkgData,
        [type]: [...pkgData[type], { ...item, id: generateId() }]
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-6 shadow-sm">
      <div className={`border-b-[3px] p-4 flex items-center gap-3 ${borderColor}`}>
        <div className={`w-6 h-6 ${iconColor} border-2 border-[#8b4513] rounded shadow-sm`}></div>
        <h4 className="text-xl font-bold text-gray-800">{title}</h4>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-800 mb-2">Price Information</label>
          <input 
            type="text" 
            value={pkgData.priceInfo}
            onChange={(e) => updatePkg({...pkgData, priceInfo: e.target.value})}
            placeholder="e.g., Starting from ₹1999 or Custom pricing available" 
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-900 bg-white outline-none focus:border-yellow-400 transition" 
          />
        </div>
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-800 mb-2">Price for popup (₹)</label>
          <input 
            type="text" 
            value={pkgData.pricePopup}
            onChange={(e) => updatePkg({...pkgData, pricePopup: e.target.value})}
            placeholder="Enter price in INR" 
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-900 bg-white outline-none focus:border-yellow-400 transition" 
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* What's Included */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-yellow-400 pb-2">
              <div className="bg-green-500 rounded p-0.5"><CheckSquare size={16} className="text-white" /></div>
              <h5 className="font-bold text-gray-800 text-lg">What's Included</h5>
            </div>
            
            {pkgData.included.map((item) => (
              <FeatureItem 
                key={item.id} 
                item={item} 
                onChange={(f, v) => updateFeature('included', item.id, f, v)}
                onDelete={() => removeFeature('included', item.id)}
                onReplicate={() => replicateFeature('included', item.id)}
              />
            ))}
            
            <button onClick={() => addFeature('included')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md text-sm mx-auto block transition shadow-sm mt-4">
              + Add Feature
            </button>
          </div>

          {/* What's Not Included */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-yellow-400 pb-2">
              <X size={20} className="text-red-500 stroke-[3]" />
              <h5 className="font-bold text-gray-800 text-lg">What's Not Included</h5>
            </div>
            
            {pkgData.notIncluded.map((item) => (
              <FeatureItem 
                key={item.id} 
                item={item} 
                isExclusion 
                onChange={(f, v) => updateFeature('notIncluded', item.id, f, v)}
                onDelete={() => removeFeature('notIncluded', item.id)}
                onReplicate={() => replicateFeature('notIncluded', item.id)}
              />
            ))}

            <button onClick={() => addFeature('notIncluded')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md text-sm mx-auto block transition shadow-sm mt-4">
              + Add Exclusion
            </button>
          </div>
        </div>

        {/* Complimentary Works */}
        <div className="mb-8">
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-yellow-400 pb-2">
              <Gift size={20} className="text-yellow-500 fill-yellow-500" />
              <h5 className="font-bold text-gray-800 text-lg">Complimentary Works</h5>
            </div>
            
            {pkgData.complimentary.map((item) => (
              <FeatureItem 
                key={item.id} 
                item={item} 
                isComplimentary 
                onChange={(f, v) => updateFeature('complimentary', item.id, f, v)}
                onDelete={() => removeFeature('complimentary', item.id)}
                onReplicate={() => replicateFeature('complimentary', item.id)}
              />
            ))}

            <button onClick={() => addFeature('complimentary')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md text-sm mx-auto block transition shadow-sm mt-4">
              + Add Complimentary Work
            </button>
          </div>
        </div>

        {/* Package Gallery Images */}
        <div>
          <h5 className="font-bold text-gray-800 mb-1 text-sm">{title} Gallery Images - Click to upload</h5>
          <p className="text-sm text-gray-500 mb-4">Click directly on the gallery positions below to upload images. Each position shows exactly how your image will appear.</p>
          
          <div className="flex flex-col gap-4 max-w-4xl">
            <div className="flex gap-4">
              <ImageUploadBox label="Click to upload Main Image" size="270x270px" className="w-[350px] h-[300px]" />
              <div className="flex flex-col gap-4">
                <ImageUploadBox label="Click to upload" size="170x110px" className="w-[220px] h-[140px]" />
                <ImageUploadBox label="Click to upload" size="240x180px" className="w-[280px] h-[145px]" />
              </div>
            </div>
            <div className="flex gap-4">
              <ImageUploadBox label="Click to upload" size="200x270px" className="w-[250px] h-[320px]" />
              <div className="flex-1 relative">
                <ImageUploadBox 
                  label="Click to upload" 
                  size="450x350px" 
                  className={`w-full h-[320px] ${isPremium ? '!border-yellow-400 !border-dashed !border-2' : ''}`} 
                />
                {isPremium && (
                  <div className="absolute top-2 right-2 bg-gray-700 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition shadow-md">
                    <Scissors size={14} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AddServicePage() {
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [openCats, setOpenCats] = useState<string[]>([]);
  
  // Dynamic State
  const [serviceName, setServiceName] = useState("");
  const [serviceCode] = useState("SE45"); // Auto-generated mockup
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [content, setContent] = useState("");
  const [seoTags, setSeoTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCategoriesData(data);
    }).catch(console.error);
  }, []);

  const [packages, setPackages] = useState({
    basic: defaultPackage(),
    premium: defaultPackage(),
    elite: defaultPackage()
  });

  const updatePackage = (pkgKey: 'basic'|'premium'|'elite', data: ServicePackage) => {
    setPackages(prev => ({ ...prev, [pkgKey]: data }));
  };

  const toggleCat = (name: string) => {
    setOpenCats(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
  };

  const handleSave = async (status: 'draft' | 'active') => {
    try {
      if (!serviceName) {
        alert('Please enter a service name.');
        return;
      }

      setIsSubmitting(true);
      
      const payload = {
        name: serviceName,
        serviceCode: serviceCode || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        description: content,
        mainCategory: selectedMain || '',
        category: selectedCat || '',
        subcategory: selectedSub || '',
        galleryImages: [], 
        packages: packages,
        seoTags: seoTags ? seoTags.split(',').map(tag => tag.trim()) : [],
        status: status
      };

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      alert(`Service ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
    } catch (error: any) {
      alert('Error saving service: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans pb-24">
      {/* Basic Info */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">Service Name</label>
        <input 
          type="text" 
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="Enter service name" 
          className="w-full border-2 border-yellow-400 rounded-lg px-4 py-3 text-gray-900 bg-white outline-none" 
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">Service Code</label>
        <input type="text" value={serviceCode} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none text-gray-800 bg-white cursor-not-allowed" />
        <p className="text-xs text-gray-400 mt-1 italic">Service code is automatically generated</p>
      </div>

      {/* Category Selection */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-800 mb-2">Category Selection *</label>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          {categoriesData.length === 0 ? <div className="text-sm text-gray-500">Loading categories...</div> : categoriesData.map((catObj) => {
            const main = catObj.id;
            const subcategoriesObj = catObj.document?.subcategories || {};
            const subs = Object.keys(subcategoriesObj);
            
            return (
              <div key={main} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleCat(main)}
                  className={`p-3 flex items-center gap-3 cursor-pointer font-bold ${selectedMain === main ? 'bg-[#ffc800] text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <ChevronRight size={16} className={`transition-transform ${openCats.includes(main) ? "rotate-90" : ""}`} />
                  <div className="bg-white p-1 rounded">
                    <Home size={14} className={selectedMain === main ? "text-gray-700" : "text-gray-400"} />
                  </div>
                  <span className="flex-1">{main}</span>
                </div>
                {openCats.includes(main) && (
                  <div className="p-3 bg-gray-50 flex flex-col gap-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {subs.map(sub => (
                        <button
                          key={sub} type="button"
                          onClick={() => { setSelectedMain(main); setSelectedCat(sub); setSelectedSub(""); }}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium border ${selectedCat === sub && selectedMain === main ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-200 bg-white text-gray-600'}`}
                        >{sub}</button>
                      ))}
                    </div>
                    {selectedMain === main && selectedCat && subcategoriesObj[selectedCat]?.items && (
                      <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Select Item / Subcategory:</label>
                        <div className="flex flex-wrap gap-2">
                          {subcategoriesObj[selectedCat].items.map((item: string) => (
                            <button
                              key={item} type="button"
                              onClick={() => setSelectedSub(item)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium border ${selectedSub === item ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                            >{item}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <input
                        type="text" placeholder="Other (type custom subcategory)"
                        value={selectedMain === main ? selectedSub : ""}
                        onChange={e => { setSelectedMain(main); setSelectedSub(e.target.value); }}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selectedMain && (
          <p className="mt-3 text-sm text-green-600 font-medium">
            ✓ Selected: <strong>{selectedMain}</strong> {selectedCat && `› ${selectedCat}`} {selectedSub ? `› ${selectedSub}` : ""}
          </p>
        )}
      </div>

      {/* Content Editor Toolbar */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Content</h2>
        <p className="text-sm text-gray-600 mb-3">Write your service description with comprehensive formatting tools</p>
        <div className="border-2 border-yellow-400 rounded-lg bg-white overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-col gap-2">
            {/* Top Row */}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('undo')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><Undo size={16} /></button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800 font-serif italic"><Italic size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('strikeThrough')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800 font-serif line-through"><Strikethrough size={16} /></button>
              <select onChange={(e) => document.execCommand('fontName', false, e.target.value)} className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white min-w-[120px] font-bold outline-none text-gray-800">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier</option>
              </select>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <label className="flex items-center gap-1 border border-gray-200 bg-white rounded p-1 cursor-pointer hover:bg-gray-50">
                 <div className="w-6 h-4 border-2 border-gray-400 bg-white"></div>
                 <Palette size={14} className="text-yellow-500" />
                 <input type="color" className="hidden" onChange={(e) => document.execCommand('hiliteColor', false, e.target.value)} />
              </label>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyLeft')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><AlignLeft size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyCenter')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><AlignCenter size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><List size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('outdent')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 flex flex-col gap-[3px] items-end justify-center w-8 h-8">
                <div className="w-3.5 h-[2px] bg-gray-800"></div><div className="w-2.5 h-[2px] bg-gray-800"></div><div className="w-3.5 h-[2px] bg-gray-800"></div>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <label className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800 cursor-pointer">
                <ImageIcon size={16} />
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
            
            {/* Bottom Row */}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('redo')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><Redo size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800 font-serif font-bold"><Bold size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800 font-serif underline"><Underline size={16} /></button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <select onChange={(e) => document.execCommand('fontSize', false, e.target.value)} className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white min-w-[120px] font-bold outline-none text-gray-800">
                <option value="3">12pt</option>
                <option value="4">14pt</option>
                <option value="5">18pt</option>
                <option value="6">24pt</option>
              </select>
              <label className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 border border-gray-200 bg-white rounded p-1 w-8 h-8 justify-center">
                 <div className="flex flex-col items-center justify-center">
                    <div className="w-5 h-2 bg-black border border-gray-400 mb-0.5"></div>
                    <span className="text-[9px] font-bold leading-none text-gray-800">A</span>
                 </div>
                 <input type="color" className="hidden" onChange={(e) => document.execCommand('foreColor', false, e.target.value)} />
              </label>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyRight')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><AlignRight size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyFull')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><AlignJustify size={16} /></button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertOrderedList')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><ListOrdered size={16} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('indent')} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 flex flex-col gap-[3px] items-start justify-center w-8 h-8">
                <div className="w-3.5 h-[2px] bg-gray-800"></div><div className="w-2.5 h-[2px] bg-gray-800"></div><div className="w-3.5 h-[2px] bg-gray-800"></div>
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { const url = prompt('Enter link URL:'); if(url) document.execCommand('createLink', false, url); }} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><LinkIcon size={16} /></button>
              <button type="button" className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-800"><Table size={16} /></button>
            </div>
          </div>
          <div 
            className="w-full h-64 p-4 text-gray-900 bg-white outline-none overflow-y-auto prose max-w-none" 
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />
        </div>
      </div>

      {/* Service Gallery Images */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-gray-800 mb-1">Service Gallery Images - Click on positions to upload</h3>
        <p className="text-sm text-gray-500 mb-4">Click directly on the gallery positions below to upload images. Each position shows exactly how your image will appear.</p>
        
        <div className="flex flex-wrap gap-4 max-w-4xl">
          <div className="flex gap-4">
            <ImageUploadBox label="Click to upload Main Image" size="230x300px" className="w-[380px] h-[300px]" />
            <div className="w-[150px] h-[300px] border border-gray-200 flex items-center justify-center bg-white rounded-md">
              <span className="transform -rotate-90 text-gray-800 font-bold whitespace-nowrap text-lg">2024 Service Catalogue</span>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-[60px] h-[250px] bg-black text-gray-600 flex flex-col justify-end p-2 text-xs font-semibold rounded-md">
              Smart<br/>Solutions
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <ImageUploadBox label="Click to upload" size="320x170px" className="w-[320px] h-[170px]" />
                <ImageUploadBox label="Click to upload" size="195x195px" className="w-[195px] h-[195px]" />
              </div>
              <div className="flex gap-4">
                <ImageUploadBox label="Click to upload" size="195x195px" className="w-[195px] h-[195px]" />
                <ImageUploadBox label="Click to upload" size="328x195px" className="w-[328px] h-[195px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Packages */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Service Packages</h3>
        
        <PackageSection 
          title="Basic Package" 
          iconColor="bg-[#d2b48c]" 
          borderColor="border-[#ebd500]" 
          pkgData={packages.basic}
          updatePkg={(data) => updatePackage('basic', data)}
        />
        
        <PackageSection 
          title="Premium Package" 
          iconColor="bg-gray-300" 
          borderColor="border-[#ebd500]" 
          isPremium={true}
          pkgData={packages.premium}
          updatePkg={(data) => updatePackage('premium', data)}
        />
        
        <PackageSection 
          title="Elite Package" 
          iconColor="bg-[#e49b6b]" 
          borderColor="border-[#ebd500]" 
          pkgData={packages.elite}
          updatePkg={(data) => updatePackage('elite', data)}
        />
      </div>
      
      {/* SEO Tags */}
      <div className="mb-10">
        <label className="block text-sm font-bold text-gray-800 mb-2">SEO Tags (comma separated)</label>
        <input 
          type="text" 
          value={seoTags}
          onChange={(e) => setSeoTags(e.target.value)}
          placeholder="smart home, installation, maintenance, automation" 
          className="w-full border-2 border-yellow-400 rounded-lg px-4 py-3 text-gray-900 bg-white outline-none" 
        />
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
        <button className="border border-yellow-400 text-gray-800 font-semibold py-2.5 px-6 rounded-lg hover:bg-yellow-50 transition">
          Cancel
        </button>
        <button 
          onClick={() => handleSave('draft')}
          disabled={isSubmitting}
          className="border border-yellow-400 text-gray-800 font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2 hover:bg-yellow-50 transition disabled:opacity-50"
        >
          <Save size={18} />
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </button>
        <button 
          onClick={() => handleSave('active')}
          disabled={isSubmitting}
          className="bg-[#ffc800] hover:bg-yellow-500 text-gray-900 font-bold py-2.5 px-6 rounded-lg shadow-sm transition disabled:opacity-50"
        >
          {isSubmitting ? 'Publishing...' : 'Publish Service'}
        </button>
      </div>
    </div>
  );
}
