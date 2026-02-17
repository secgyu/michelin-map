"use client";

import { useStore } from "@/store/useStore";
import StarRating from "./StarRating";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const priceLabels = ["", "합리적인 가격", "적당한 가격", "고급", "최고급"];

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-stone-400 mt-[1px] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium mb-0.5">{label}</p>
        <p className="text-[13px] text-charcoal tracking-tight font-light leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function DetailPanel() {
  const isDetailOpen = useStore((s) => s.isDetailOpen);
  const selectedRestaurant = useStore((s) => s.selectedRestaurant);
  const closeDetail = useStore((s) => s.closeDetail);

  return (
    <AnimatePresence>
      {isDetailOpen && selectedRestaurant && (
        <motion.div
          initial={{ x: "-100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0.5 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-20 bg-cream flex flex-col"
        >
          <div className="px-6 py-4 flex items-center">
            <button
              onClick={closeDetail}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-stone-400 hover:text-charcoal transition-colors duration-300 font-medium"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div
              className="relative w-full aspect-[16/10] bg-parchment overflow-hidden mx-6"
              style={{ width: "calc(100% - 48px)" }}
            >
              {selectedRestaurant.image_url ? (
                <Image
                  src={selectedRestaurant.image_url}
                  alt={selectedRestaurant.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 35vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#A8A29E"
                      strokeWidth="1"
                      className="mx-auto mb-2"
                    >
                      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z" />
                    </svg>
                    <p className="text-[10px] text-stone-400 tracking-widest uppercase">Michelin Guide</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm text-charcoal border-0 px-2 py-1 text-[10px] font-medium tracking-wide"
                >
                  {selectedRestaurant.rating === "bib-gourmand"
                    ? "BIB GOURMAND"
                    : `${"★".repeat(parseInt(selectedRestaurant.rating))} MICHELIN`}
                </Badge>
              </div>
            </div>

            <div className="px-6 pt-7 pb-12">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h2 className="text-[26px] font-semibold tracking-[-0.03em] leading-tight text-charcoal">
                    {selectedRestaurant.name}
                  </h2>
                  <p className="text-[12px] text-stone-400 tracking-[0.02em] mt-1 font-light italic">
                    {selectedRestaurant.name_en}
                  </p>
                </div>
                <StarRating rating={selectedRestaurant.rating} size="lg" />
              </div>

              <Separator className="bg-stone-200/60 my-6" />

              <div className="space-y-0">
                <MetaItem
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  }
                  label="Address"
                  value={selectedRestaurant.address}
                />
                <MetaItem
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  }
                  label="Cuisine"
                  value={selectedRestaurant.cuisine}
                />
                <MetaItem
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  }
                  label="Price"
                  value={priceLabels[selectedRestaurant.price_range]}
                />
              </div>

              <Separator className="bg-stone-200/60 my-6" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium mb-3">About</p>
                <p className="text-[14px] text-charcoal/75 leading-[1.9] tracking-[-0.005em] font-light">
                  {selectedRestaurant.description}
                </p>
              </div>

              {selectedRestaurant.phone_number && (
                <>
                  <Separator className="bg-stone-200/60 my-6" />
                  <MetaItem
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    }
                    label="Phone"
                    value={selectedRestaurant.phone_number}
                  />
                </>
              )}

              <div className="mt-10 flex gap-4">
                {selectedRestaurant.michelin_url && (
                  <a
                    href={selectedRestaurant.michelin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] font-medium text-michelin-red hover:text-michelin-red/70 transition-colors duration-300"
                  >
                    <span>Michelin Guide</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
