"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteProductModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteProductModal({ onCancel, onConfirm, isDeleting }: DeleteProductModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500 w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h2>
          <p className="text-gray-500 text-sm mb-6">
            This product will be permanently deleted. This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
