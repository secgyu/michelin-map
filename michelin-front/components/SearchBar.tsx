"use client";

import { useStore } from "@/store/useStore";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar() {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 py-3">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-stone-400 group-focus-within:text-charcoal transition-colors duration-500 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="레스토랑, 요리, 지역 검색"
          className="w-full bg-transparent text-[15px] text-charcoal outline-none placeholder:text-stone-300 tracking-[-0.01em] font-light"
        />
        <AnimatePresence>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="text-stone-400 hover:text-charcoal transition-colors duration-300 shrink-0"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="h-[0.5px] bg-stone-200 group-focus-within:bg-charcoal/40 transition-colors duration-500" />
    </div>
  );
}
