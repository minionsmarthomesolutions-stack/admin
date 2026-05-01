"use client";

import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteModal({ onCancel, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4 text-red-600">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Banner</h2>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete this banner? This action cannot be undone and will permanently remove the banner from your database.
          </p>
          
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
