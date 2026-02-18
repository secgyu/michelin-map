"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import RestaurantRow from "./RestaurantRow";

export default function RestaurantList() {
  const restaurants = useStore((s) => s.restaurants);
  const search = useStore((s) => s.search);
  const selectedRatings = useStore((s) => s.selectedRatings);
  const selectedRegion = useStore((s) => s.selectedRegion);
  const selectedCuisine = useStore((s) => s.selectedCuisine);
  const selectedRestaurant = useStore((s) => s.selectedRestaurant);
  const openDetail = useStore((s) => s.openDetail);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchEn = r.name_en.toLowerCase().includes(q);
        const matchCuisine = r.cuisine.toLowerCase().includes(q);
        const matchRegion = r.region.toLowerCase().includes(q);
        if (!matchName && !matchEn && !matchCuisine && !matchRegion) return false;
      }
      if (selectedRatings.length > 0 && !selectedRatings.includes(r.rating)) return false;
      if (selectedRegion && r.region !== selectedRegion) return false;
      if (selectedCuisine && r.cuisine !== selectedCuisine) return false;
      return true;
    });
  }, [restaurants, search, selectedRatings, selectedRegion, selectedCuisine]);

  const ratingOrder = { "3-star": 0, "2-star": 1, "1-star": 2, "bib-gourmand": 3 } as const;
  const sorted = useMemo(() => [...filtered].sort((a, b) => ratingOrder[a.rating] - ratingOrder[b.rating]), [filtered]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
      <div className="px-6 pt-4 pb-2 flex items-baseline justify-between shrink-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">{sorted.length}개 레스토랑</p>
        <p className="text-[10px] text-stone-300 tracking-tight">등급순</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {sorted.length === 0 ? (
          <div className="pt-20 text-center px-6">
            <p className="text-[14px] text-warm-gray font-light tracking-tight">검색 결과가 없습니다</p>
            <p className="text-[11px] text-stone-300 mt-2 font-light">다른 조건으로 검색해보세요</p>
          </div>
        ) : (
          <div className="pb-8">
            {sorted.map((restaurant, index) => (
              <RestaurantRow
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => openDetail(restaurant)}
                isActive={selectedRestaurant?.id === restaurant.id}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
