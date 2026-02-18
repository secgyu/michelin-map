"use client";

import { useStore } from "@/store/useStore";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileSearch() {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 px-4 pb-2"
      style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
    >
      <motion.div
        animate={{
          backgroundColor: isFocused ? "rgba(250,249,246,0.98)" : "rgba(250,249,246,0.85)",
          boxShadow: isFocused ? "0 2px 20px rgba(0,0,0,0.06)" : "0 1px 8px rgba(0,0,0,0.03)",
        }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-3 backdrop-blur-lg"
        style={{ borderRadius: 3 }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-stone-400 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="레스토랑 검색"
          className="flex-1 bg-transparent text-[13px] text-charcoal outline-none placeholder:text-stone-300 font-light tracking-tight"
        />
        <AnimatePresence>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="text-stone-400"
            >
              <svg
                width="12"
                height="12"
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
      </motion.div>
    </div>
  );
}
