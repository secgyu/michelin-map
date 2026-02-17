"use client";

import { useStore } from "@/store/useStore";
import { Rating } from "@/types";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

const ratingOptions: { value: Rating; label: string; sub: string }[] = [
  { value: "3-star", label: "★★★", sub: "Three Stars" },
  { value: "2-star", label: "★★", sub: "Two Stars" },
  { value: "1-star", label: "★", sub: "One Star" },
  { value: "bib-gourmand", label: "BG", sub: "Bib Gourmand" },
];

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative text-[12px] tracking-[0.02em] px-3 py-1.5
        transition-all duration-300 ease-out
        ${active ? "text-charcoal font-medium" : "text-stone-400 hover:text-warm-gray font-normal"}
      `}
    >
      {children}
      {active && (
        <motion.div
          layoutId="filter-active"
          className="absolute inset-0 bg-parchment -z-10"
          style={{ borderRadius: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}

export default function FilterDropdown() {
  const isFilterOpen = useStore((s) => s.isFilterOpen);
  const toggleFilter = useStore((s) => s.toggleFilter);
  const selectedRatings = useStore((s) => s.selectedRatings);
  const toggleRating = useStore((s) => s.toggleRating);
  const selectedRegion = useStore((s) => s.selectedRegion);
  const setRegion = useStore((s) => s.setRegion);
  const selectedCuisine = useStore((s) => s.selectedCuisine);
  const setCuisine = useStore((s) => s.setCuisine);
  const regions = useStore((s) => s.regions);
  const cuisines = useStore((s) => s.cuisines);

  const activeCount = selectedRatings.length + (selectedRegion ? 1 : 0) + (selectedCuisine ? 1 : 0);

  return (
    <div className="mt-4">
      <button onClick={toggleFilter} className="flex items-center gap-2 group">
        <span className="text-[11px] uppercase tracking-[0.15em] text-warm-gray group-hover:text-charcoal transition-colors duration-300 font-medium">
          Filters
        </span>
        {activeCount > 0 && (
          <span className="w-4 h-4 flex items-center justify-center text-[9px] font-semibold text-white bg-michelin-red rounded-full">
            {activeCount}
          </span>
        )}
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-stone-400 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2 font-medium">Distinction</p>
                <div className="flex flex-wrap gap-1">
                  {ratingOptions.map((opt) => (
                    <FilterButton
                      key={opt.value}
                      active={selectedRatings.includes(opt.value)}
                      onClick={() => toggleRating(opt.value)}
                    >
                      {opt.label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <Separator className="bg-stone-200/60" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2 font-medium">Region</p>
                <div className="flex flex-wrap gap-1">
                  <FilterButton active={!selectedRegion} onClick={() => setRegion("")}>
                    All
                  </FilterButton>
                  {regions.map((region) => (
                    <FilterButton
                      key={region}
                      active={selectedRegion === region}
                      onClick={() => setRegion(selectedRegion === region ? "" : region)}
                    >
                      {region}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <Separator className="bg-stone-200/60" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2 font-medium">Cuisine</p>
                <div className="flex flex-wrap gap-1">
                  <FilterButton active={!selectedCuisine} onClick={() => setCuisine("")}>
                    All
                  </FilterButton>
                  {cuisines.map((cuisine) => (
                    <FilterButton
                      key={cuisine}
                      active={selectedCuisine === cuisine}
                      onClick={() => setCuisine(selectedCuisine === cuisine ? "" : cuisine)}
                    >
                      {cuisine}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {activeCount > 0 && (
                <button
                  onClick={() => {
                    useStore.getState().clearRatings();
                    setRegion("");
                    setCuisine("");
                  }}
                  className="text-[11px] text-michelin-red/70 hover:text-michelin-red transition-colors duration-300 tracking-tight pt-1"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
