"use client";

import { Separator } from "@/components/ui/separator";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import RestaurantList from "./RestaurantList";
import DetailPanel from "./DetailPanel";

export default function SidePanel() {
  return (
    <aside className="relative h-full flex flex-col bg-cream">
      <DetailPanel />

      <div className="shrink-0 px-6 pt-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-michelin-red font-semibold mb-1">
              Michelin Guide
            </p>
            <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-charcoal leading-none">Korea</h1>
            <p className="text-[11px] text-stone-400 mt-1 tracking-[0.05em] font-light">Seoul · Busan · Jeju — 2026</p>
          </div>
          <div className="opacity-20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#C8102E">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z" />
            </svg>
          </div>
        </div>

        <SearchBar />
        <FilterDropdown />

        <Separator className="bg-stone-200/50 mt-4" />
      </div>

      <RestaurantList />
    </aside>
  );
}
