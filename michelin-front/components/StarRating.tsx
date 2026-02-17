"use client";

import { Rating } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StarRatingProps {
  rating: Rating;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function MichelinStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z" />
    </svg>
  );
}

function BibGourmandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="10" r="6" fill="currentColor" />
      <ellipse cx="12" cy="19" rx="3.5" ry="2.5" fill="currentColor" />
      <circle cx="9.8" cy="9" r="0.9" fill="#FAF9F6" />
      <circle cx="14.2" cy="9" r="0.9" fill="#FAF9F6" />
      <path
        d="M10 12.5c0 0 0.9 1.2 2 1.2s2-1.2 2-1.2"
        stroke="#FAF9F6"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SelectedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="serif">
        M
      </text>
    </svg>
  );
}

const ratingLabels: Record<Rating, string> = {
  "3-star": "미쉐린 3스타",
  "2-star": "미쉐린 2스타",
  "1-star": "미쉐린 1스타",
  "bib-gourmand": "빕 구르망",
  selected: "미쉐린 셀렉티드",
};

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export default function StarRating({ rating, size = "sm", showLabel = false }: StarRatingProps) {
  const sizeClass = sizeClasses[size];
  const label = ratingLabels[rating];

  let content: React.ReactNode;

  if (rating === "bib-gourmand") {
    content = (
      <span className="inline-flex items-center gap-1">
        <BibGourmandIcon className={`${sizeClass} text-amber-700`} />
        {showLabel && <span className="text-[11px] font-medium text-amber-700 tracking-tight">Bib Gourmand</span>}
      </span>
    );
  } else if (rating === "selected") {
    content = (
      <span className="inline-flex items-center gap-1">
        <SelectedIcon className={`${sizeClass} text-stone-500`} />
        {showLabel && <span className="text-[11px] font-medium text-stone-500 tracking-tight">Selected</span>}
      </span>
    );
  } else {
    content = (
      <span className="inline-flex items-center gap-[1px]">
        {Array.from({ length: parseInt(rating) }).map((_, i) => (
          <MichelinStar key={i} className={`${sizeClass} text-michelin-red`} />
        ))}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center cursor-default">{content}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-charcoal text-cream text-[11px] font-medium px-2.5 py-1 border-0">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
