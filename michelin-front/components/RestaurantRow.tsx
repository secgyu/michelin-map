"use client";

import { Restaurant } from "@/types";
import StarRating from "./StarRating";

interface RestaurantRowProps {
  restaurant: Restaurant;
  onClick: () => void;
  isActive: boolean;
  index: number;
}

const priceLabel = (range: number) => "₩".repeat(range);

export default function RestaurantRow({ restaurant, onClick, isActive, index }: RestaurantRowProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left group transition-all duration-300 ease-out
        relative py-[18px] px-6
        ${isActive ? "bg-parchment" : "hover:bg-warm-beige/40"}
      `}
      style={{
        animation: `fadeSlideIn 0.4s ${index * 30}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h3
              className={`
              text-[15px] tracking-[-0.02em] leading-none truncate
              transition-all duration-300
              ${isActive ? "font-semibold text-charcoal" : "font-medium text-charcoal/90 group-hover:text-charcoal"}
            `}
            >
              {restaurant.name}
            </h3>
            <StarRating rating={restaurant.rating} />
          </div>

          <p className="text-[11.5px] text-stone-400 leading-none tracking-[0.01em] flex items-center">
            <span className="font-light">{restaurant.cuisine}</span>
            <span className="mx-2 text-stone-300 text-[8px]">|</span>
            <span className="font-light">{restaurant.region}</span>
            <span className="mx-2 text-stone-300 text-[8px]">|</span>
            <span className="text-stone-300 font-light">{priceLabel(restaurant.price_range)}</span>
          </p>
        </div>

        <span className="text-[10px] text-stone-300 tracking-[0.03em] shrink-0 mt-0.5 font-light italic">
          {restaurant.name_en}
        </span>
      </div>

      <div className="absolute bottom-0 left-6 right-6 h-[0.5px] bg-stone-200/70" />
    </button>
  );
}
