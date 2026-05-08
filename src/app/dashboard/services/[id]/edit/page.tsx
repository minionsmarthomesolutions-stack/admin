"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
  galleryImages?: (string | null)[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const defaultFeature = (): Feature => ({ id: generateId(), title: "", description: "" });
const defaultPackage = (): ServicePackage => ({
  priceInfo: "",
  pricePopup: "",
  included: [defaultFeature()],
  notIncluded: [defaultFeature()],
  complimentary: [defaultFeature()],
  galleryImages: [null, null, null, null, null]
});

// ── Service Gallery Component ─────────────────────────────────────────────
// Ports the HTML's multi-select + drag-to-swap + file-drop + remove logic to React.

interface GallerySlotDef {
  label: string;
  size: string;
  className: string;
}

const GALLERY_SLOTS: GallerySlotDef[] = [
  { label: "Click to upload\nMain Image", size: "230×300px", className: "w-[380px] h-[300px]" },
  { label: "Click to upload",             size: "320×170px", className: "w-[320px] h-[170px]" },
  { label: "Click to upload",             size: "195×195px", className: "w-[195px] h-[195px]" },
  { label: "Click to upload",             size: "195×195px", className: "w-[195px] h-[195px]" },
  { label: "Click to upload",             size: "328×195px", className: "w-[328px] h-[195px]" },
];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

const ServiceGallery = ({
  images,
  onChange,
}: {
  images: (string | null)[];
  onChange: (images: (string | null)[]) => void;
}) => {
  // Which slot index is being dragged (for swap)
  const dragSlot = useRef<number | null>(null);

  // Fill slots from a FileList starting at `startIndex`
  const fillSlots = useCallback(
    async (files: FileList, startIndex: number) => {
      const next = [...images];
      for (let i = 0; i < files.length && startIndex + i < GALLERY_SLOTS.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          next[startIndex + i] = await readFileAsBase64(file);
        }
      }
      onChange(next);
    },
    [images, onChange]
  );

  const handleSlotClick = (slotIndex: number) => {
    // Create a hidden multi-select file input and click it
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) await fillSlots(files, slotIndex);
    };
    input.click();
  };

  const handleRemove = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...images];
    next[slotIndex] = null;
    onChange(next);
  };

  // ── Drag-to-swap handlers ────────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, slotIndex: number) => {
    if (!images[slotIndex]) { e.preventDefault(); return; }
    dragSlot.current = slotIndex;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    // File drop from OS
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await fillSlots(e.dataTransfer.files, targetIndex);
      dragSlot.current = null;
      return;
    }
    // Slot-to-slot swap
    const srcIndex = dragSlot.current;
    if (srcIndex === null || srcIndex === targetIndex) { dragSlot.current = null; return; }
    const next = [...images];
    [next[srcIndex], next[targetIndex]] = [next[targetIndex], next[srcIndex]];
    onChange(next);
    dragSlot.current = null;
  };

  const onDragEnd = () => { dragSlot.current = null; };

  // ── Render ───────────────────────────────────────────────────────────────
  const renderSlot = (slotIndex: number) => {
    const slot = GALLERY_SLOTS[slotIndex];
    const img = images[slotIndex];
    
  return (
      <div
        key={slotIndex}
        className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all
          ${img ? 'border-solid border-gray-300' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'}
          ${slot.className}`}
        draggable={!!img}
        onDragStart={(e) => onDragStart(e, slotIndex)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, slotIndex)}
        onDragEnd={onDragEnd}
        onClick={() => handleSlotClick(slotIndex)}
        title={img ? 'Drag to swap • Click to replace' : 'Click or drop image'}
      >
        {img ? (
          <>
            <img src={img} alt={`Gallery slot ${slotIndex + 1}`} className="w-full h-full object-cover" />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Camera className="text-white w-6 h-6" />
              <span className="text-white text-xs font-semibold">Replace</span>
            </div>
            {/* Badge */}
            <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              Slot {slotIndex + 1}
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => handleRemove(slotIndex, e)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Remove"
            >
              ×
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <Camera className="text-gray-400 w-6 h-6 mb-1" />
            <span className="text-xs font-semibold text-gray-700 text-center whitespace-pre-line">{slot.label}</span>
            <span className="text-[10px] text-yellow-500 font-medium mt-1">{slot.size}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-4 max-w-4xl">
      {/* Row 1: Main slot + text panel */}
      <div className="flex gap-4">
        {renderSlot(0)}
        <div className="w-[150px] h-[300px] border border-gray-200 flex items-center justify-center bg-white rounded-md shrink-0">
          <span className="transform -rotate-90 text-gray-800 font-bold whitespace-nowrap text-lg">2024 Service Catalogue</span>
        </div>
      </div>
      {/* Row 2: Sidebar + 2×2 grid */}
      <div className="flex gap-4 items-start">
        <div className="w-[60px] h-[250px] bg-black text-gray-600 flex flex-col justify-end p-2 text-xs font-semibold rounded-md shrink-0">
          Smart<br />Solutions
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            {renderSlot(1)}
            {renderSlot(2)}
          </div>
          <div className="flex gap-4">
            {renderSlot(3)}
            {renderSlot(4)}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="w-full flex items-center gap-3 text-xs text-gray-500 mt-1">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-dashed border-gray-300 rounded"></span> Click or drop to upload</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-400 rounded"></span> Drag filled slots to swap</span>
      </div>
    </div>
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
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => onChange('image', reader.result as string);
            reader.readAsDataURL(file);
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


// ── Package Gallery Component ────────────────────────────────────────────
// Same interactions as ServiceGallery: multi-select, drag-to-swap, file-drop, remove.

const PKG_GALLERY_SLOTS = [
  { label: "Click to upload\nMain Image", size: "270×270px", className: "w-[350px] h-[300px]" },
  { label: "Click to upload",             size: "170×110px", className: "w-[220px] h-[140px]" },
  { label: "Click to upload",             size: "240×180px", className: "w-[280px] h-[145px]" },
  { label: "Click to upload",             size: "200×270px", className: "w-[250px] h-[320px]" },
  { label: "Click to upload",             size: "450×350px", className: "h-[320px]" },          // flex-1
];

const PackageGallery = ({
  images,
  onChange,
  isPremium = false,
}: {
  images: (string | null)[];
  onChange: (images: (string | null)[]) => void;
  isPremium?: boolean;
}) => {
  const dragSlot = useRef<number | null>(null);

  const fillSlots = useCallback(
    async (files: FileList, startIndex: number) => {
      const next = [...images];
      for (let i = 0; i < files.length && startIndex + i < PKG_GALLERY_SLOTS.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          next[startIndex + i] = await readFileAsBase64(file);
        }
      }
      onChange(next);
    },
    [images, onChange]
  );

  const handleSlotClick = (slotIndex: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) await fillSlots(files, slotIndex);
    };
    input.click();
  };

  const handleRemove = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...images];
    next[slotIndex] = null;
    onChange(next);
  };

  const onDragStart = (e: React.DragEvent, slotIndex: number) => {
    if (!images[slotIndex]) { e.preventDefault(); return; }
    dragSlot.current = slotIndex;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await fillSlots(e.dataTransfer.files, targetIndex);
      dragSlot.current = null;
      return;
    }
    const srcIndex = dragSlot.current;
    if (srcIndex === null || srcIndex === targetIndex) { dragSlot.current = null; return; }
    const next = [...images];
    [next[srcIndex], next[targetIndex]] = [next[targetIndex], next[srcIndex]];
    onChange(next);
    dragSlot.current = null;
  };

  const onDragEnd = () => { dragSlot.current = null; };

  const renderSlot = (slotIndex: number, extraClass = "") => {
    const slot = PKG_GALLERY_SLOTS[slotIndex];
    const img = images[slotIndex];
    return (
      <div
        key={slotIndex}
        className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all
          ${img ? 'border-solid border-gray-300' : 'border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100'}
          ${slot.className} ${extraClass}`}
        draggable={!!img}
        onDragStart={(e) => onDragStart(e, slotIndex)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, slotIndex)}
        onDragEnd={onDragEnd}
        onClick={() => handleSlotClick(slotIndex)}
        title={img ? 'Drag to swap • Click to replace' : 'Click or drop image'}
      >
        {img ? (
          <>
            <img src={img} alt={`Package slot ${slotIndex + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <Camera className="text-white w-5 h-5" />
              <span className="text-white text-xs font-semibold">Replace</span>
            </div>
            <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              Slot {slotIndex + 1}
            </div>
            <button
              type="button"
              onClick={(e) => handleRemove(slotIndex, e)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Remove"
            >×</button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <Camera className="text-gray-400 w-6 h-6 mb-1" />
            <span className="text-xs font-semibold text-gray-700 text-center whitespace-pre-line">{slot.label}</span>
            <span className="text-[10px] text-yellow-500 font-medium mt-1">{slot.size}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Row 1: main + 2 stacked */}
      <div className="flex gap-4">
        {renderSlot(0)}
        <div className="flex flex-col gap-4">
          {renderSlot(1)}
          {renderSlot(2)}
        </div>
      </div>
      {/* Row 2: tall left + wide right */}
      <div className="flex gap-4">
        {renderSlot(3)}
        <div className="flex-1 relative">
          {renderSlot(4, isPremium ? '!border-yellow-400 !border-dashed !border-2' : '')}
          {isPremium && (
            <div className="absolute top-2 right-2 bg-gray-700 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition shadow-md z-10">
              <Scissors size={14} />
            </div>
          )}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-dashed border-gray-300 rounded"></span> Click or drop to upload</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-400 rounded"></span> Drag filled slots to swap</span>
      </div>
    </div>
  );
};

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
          <h5 className="font-bold text-gray-800 mb-1 text-sm">{title} Gallery Images</h5>
          <p className="text-sm text-gray-500 mb-4">
            Click a slot to upload • select multiple files to fill slots sequentially • drag a filled slot onto another to swap • drop files from your OS directly onto a slot.
          </p>
          <PackageGallery
            images={pkgData.galleryImages || [null, null, null, null, null]}
            onChange={(imgs) => updatePkg({ ...pkgData, galleryImages: imgs })}
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  );
};


export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isFound, setIsFound] = useState(true);
  const router = useRouter();
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [openCats, setOpenCats] = useState<string[]>([]);
  
  // Dynamic State
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
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

  // Gallery images — 5 slots matching the HTML layout (base64 strings sent to API)
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([null, null, null, null, null]);

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
        galleryImages: galleryImages.filter(Boolean), // base64 strings → API uploads to Supabase
        packages: packages,
        seoTags: seoTags ? seoTags.split(',').map(tag => tag.trim()) : [],
        status: status
      };

      const res = await fetch(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      alert(`Service ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
      if (status === 'active') router.push('/dashboard/services');
    } catch (error: any) {
      alert('Error saving service: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading service data...</div>;
  if (!isFound) return <div className="p-12 text-center text-red-500 font-bold">Service not found.</div>;

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
            id="desc-editor"
            className="w-full h-64 p-4 text-gray-900 bg-white outline-none overflow-y-auto prose max-w-none" 
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />
        </div>
      </div>

      {/* Service Gallery Images */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-gray-800 mb-1">Service Gallery Images</h3>
        <p className="text-sm text-gray-500 mb-4">
          Click a slot to upload • select multiple files to fill slots sequentially • drag a filled slot onto another to swap • drop files from your OS directly onto a slot.
        </p>
        <ServiceGallery
          images={galleryImages}
          onChange={setGalleryImages}
        />
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
