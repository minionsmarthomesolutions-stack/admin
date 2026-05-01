"use client";

import { useState } from 'react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Eye, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface BannerCardProps {
  banner: any;
  onToggle: (id: string, newStatus: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  onPreview: (banner: any) => void;
  onEdit: (banner: any) => void;
}

export default function BannerCard({ banner, onToggle, onDelete, onPreview, onEdit }: BannerCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(banner.id, !banner.isActive);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="relative h-48 bg-gray-50 flex items-center justify-center">
        {banner.imageA ? (
          <img src={banner.imageA} alt={banner.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ImageIcon size={32} className="mb-2" />
            <span className="text-sm border border-dashed border-gray-300 px-3 py-1 rounded-md">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{banner.title}</h3>
        <p className="text-sm text-gray-500 mb-2">Category: {banner.categoryId}</p>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${banner.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
          {banner.type} banner
        </span>
      </div>
      <div className="bg-gray-50 flex justify-between items-center px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
           <ToggleSwitch isActive={banner.isActive} isToggling={isToggling} onToggle={handleToggle} />
           <span className="text-xs text-gray-500">{banner.isActive ? 'Active' : 'Draft'}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onPreview(banner)} className="text-gray-400 hover:text-blue-500 transition" title="Preview">
             <Eye size={18} />
          </button>
          <button onClick={() => onEdit(banner)} className="text-gray-400 hover:text-green-500 transition" title="Edit">
             <Edit size={18} />
          </button>
          <button onClick={() => onDelete(banner.id)} className="text-gray-400 hover:text-red-500 transition" title="Delete">
             <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
