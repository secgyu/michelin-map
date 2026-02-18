"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import SidePanel from "@/components/SidePanel";
import MapView from "@/components/MapView";
import BottomSheet from "@/components/BottomSheet";
import MobileSearch from "@/components/MobileSearch";

export default function Home() {
  const isLoading = useStore((s) => s.isLoading);
  const error = useStore((s) => s.error);
  const restaurants = useStore((s) => s.restaurants);
  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    useStore.getState().loadData();
  }, []);

  if (isLoading && restaurants.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-michelin-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[12px] text-stone-400 mt-4 tracking-widest uppercase font-medium">로딩 중</p>
        </div>
      </div>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cream">
        <div className="text-center px-6 max-w-sm">
          <p className="text-[14px] text-charcoal font-medium mb-2">연결 실패</p>
          <p className="text-[12px] text-stone-400 leading-relaxed mb-4">{error}</p>
          <button
            onClick={() => {
              didLoad.current = false;
              useStore.getState().loadData();
            }}
            className="text-[12px] uppercase tracking-widest text-michelin-red hover:text-michelin-red/70 font-medium transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-cream">
      <div className="hidden md:flex h-full">
        <div className="w-[35%] min-w-[380px] max-w-[460px] h-full border-r border-stone-200/40">
          <SidePanel />
        </div>
        <div className="flex-1 h-full">
          <MapView />
        </div>
      </div>

      <div className="md:hidden h-full relative">
        <MobileSearch />
        <MapView />
        <BottomSheet />
      </div>
    </div>
  );
}
