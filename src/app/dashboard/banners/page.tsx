"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BannerCard from '@/components/banners/BannerCard';
import DeleteModal from '@/components/banners/DeleteModal';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      const res = await fetch(`/api/banners/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) {
        setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: newStatus } : b));
      }
    } catch(e) {
       console.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/banners/${bannerToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(prev => prev.filter(b => b.id !== bannerToDelete));
      }
    } catch(e) {
      console.error("Failed to delete banner");
    }
    setIsDeleting(false);
    setBannerToDelete(null);
  };

  if (isLoading) {
    return (
       <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
         <div className="flex flex-col items-center animate-pulse">
            <ImageIcon className="text-gray-300 w-12 h-12 mb-4" />
            <div className="text-lg text-gray-500 font-medium">Loading banners...</div>
         </div>
       </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize your homepage banners</p>
        </div>
        <Link href="/dashboard/banners/add" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium shadow-sm w-full sm:w-auto justify-center">
          <PlusCircle size={20} />
          Add New Banner
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
             <ImageIcon size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Banners Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't setup any custom banners yet. Go ahead and create your very first one to get started.</p>
          <Link href="/dashboard/banners/add" className="bg-blue-50 text-blue-600 border border-blue-200 px-6 py-2 rounded-lg font-medium hover:bg-blue-100 transition">
             Create Banner
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {banners.map(banner => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onToggle={handleToggleStatus}
              onDelete={setBannerToDelete}
              onPreview={(b) => console.log('Previewing:', b)}
              onEdit={(b) => router.push(`/dashboard/banners/${b.id}/edit`)}
            />
          ))}
        </div>
      )}

      {bannerToDelete && (
        <DeleteModal
          onCancel={() => setBannerToDelete(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
