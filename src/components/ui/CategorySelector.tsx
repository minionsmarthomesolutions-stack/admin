"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface SubCategory { logo?: string; items?: string[]; }
interface MainCategory { code: string; logo?: string; subcategories?: Record<string, SubCategory>; }
interface CategoryRow { id: string; document: MainCategory; }

interface Props {
  categoriesData: CategoryRow[];
  selectedMain: string;
  selectedCat: string;
  selectedSub: string;
  onSelect: (main: string, cat: string, sub: string) => void;
  /** visual style - 'accordion' (default like Products) or 'compact' (like Services) */
  variant?: "accordion" | "compact";
}

export default function CategorySelector({
  categoriesData,
  selectedMain,
  selectedCat,
  selectedSub,
  onSelect,
  variant = "compact",
}: Props) {
  const [openCats, setOpenCats] = useState<string[]>([]);

  const toggleCat = (name: string) =>
    setOpenCats(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);

  if (categoriesData.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-3 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
        <div className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
        Loading categories…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categoriesData.map((catObj) => {
        const main = catObj.id;
        const subcategoriesObj = catObj.document?.subcategories || {};
        const subs = Object.keys(subcategoriesObj);
        const isOpen = openCats.includes(main);
        const isMainSelected = selectedMain === main;

        return (
          <div key={main} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Main Category Header */}
            <div
              onClick={() => toggleCat(main)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors font-semibold text-sm ${
                isMainSelected
                  ? "bg-[#ffc800] text-black"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <ChevronRight
                size={15}
                className={`transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`}
              />
              {catObj.document?.logo && (
                <img src={catObj.document.logo} alt="" className="w-5 h-5 rounded object-cover" />
              )}
              <span className="flex-1">{main}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isMainSelected ? "bg-black/10 text-black" : "bg-white/10 text-white"
              }`}>{catObj.document?.code}</span>
            </div>

            {/* Sub-categories */}
            {isOpen && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                {/* Sub chips */}
                <div className="flex flex-wrap gap-2">
                  {subs.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No sub-categories</span>
                  )}
                  {subs.map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => { onSelect(main, sub, ""); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedCat === sub && isMainSelected
                          ? "border-[#ffc800] bg-yellow-50 text-yellow-800"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* Sub-Sub items */}
                {isMainSelected && selectedCat && subcategoriesObj[selectedCat]?.items?.length ? (
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Select Item:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {subcategoriesObj[selectedCat].items!.map((item: string) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => onSelect(main, selectedCat, item)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                            selectedSub === item
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Custom input */}
                <input
                  type="text"
                  placeholder="Or type a custom sub-category…"
                  value={isMainSelected ? selectedSub : ""}
                  onChange={e => onSelect(main, selectedCat, e.target.value)}
                  onClick={() => { if (!isMainSelected) onSelect(main, "", ""); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-full max-w-xs outline-none focus:border-[#ffc800] bg-white text-gray-800"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Selection badge */}
      {selectedMain && (
        <div className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <span className="text-emerald-500">✓</span>
          <strong>{selectedMain}</strong>
          {selectedCat && <><span className="text-gray-400 mx-0.5">›</span>{selectedCat}</>}
          {selectedSub && <><span className="text-gray-400 mx-0.5">›</span>{selectedSub}</>}
        </div>
      )}
    </div>
  );
}
