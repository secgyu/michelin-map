"use client";

import { useState, useRef, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import RestaurantList from "./RestaurantList";
import DetailPanel from "./DetailPanel";

type SheetSnap = "peek" | "half" | "full";

const SNAP_POINTS: Record<SheetSnap, number> = {
  peek: 80,
  half: 45,
  full: 8,
};

export default function BottomSheet() {
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const isDetailOpen = useStore((s) => s.isDetailOpen);
  const y = useMotionValue(0);
  const dragStartY = useRef(0);

  const topPercent = SNAP_POINTS[snap];

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (velocity > 400 || offset > 80) {
        if (snap === "full") setSnap("half");
        else if (snap === "half") setSnap("peek");
      } else if (velocity < -400 || offset < -80) {
        if (snap === "peek") setSnap("half");
        else if (snap === "half") setSnap("full");
      }

      animate(y, 0, { type: "spring", stiffness: 400, damping: 35 });
    },
    [snap, y],
  );

  return (
    <motion.div
      className="fixed left-0 right-0 bottom-0 z-30 bg-cream flex flex-col"
      style={{
        top: `${topPercent}%`,
        y,
        borderRadius: "14px 14px 0 0",
        boxShadow: "0 -2px 30px rgba(0,0,0,0.06)",
      }}
      animate={{ top: `${topPercent}%` }}
      transition={{ type: "spring", stiffness: 350, damping: 35 }}
    >
      <motion.div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <div className="w-8 h-[3px] bg-stone-300/60 rounded-full" />
      </motion.div>

      {snap === "peek" ? (
        <button onClick={() => setSnap("half")} className="px-5 py-2 text-left">
          <p className="text-[13px] font-medium text-charcoal tracking-[-0.01em]">미쉐린 가이드 레스토랑</p>
          <p className="text-[10px] text-stone-400 mt-0.5 tracking-[0.02em]">위로 스와이프하여 목록 보기</p>
        </button>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          {isDetailOpen ? (
            <DetailPanel />
          ) : (
            <>
              <div className="px-5 pt-1 pb-2">
                <SearchBar />
                <FilterDropdown />
              </div>
              <RestaurantList />
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
