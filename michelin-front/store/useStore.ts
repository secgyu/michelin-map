import { create } from "zustand";
import { Rating, Restaurant } from "@/types";
import {
  fetchRestaurants,
  fetchRegions as fetchRegionsApi,
  fetchCuisines as fetchCuisinesApi,
} from "@/lib/api";

interface AppState {
  // --- Server data ---
  restaurants: Restaurant[];
  regions: string[];
  cuisines: string[];
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;

  // --- Filters ---
  search: string;
  setSearch: (search: string) => void;

  selectedRatings: Rating[];
  toggleRating: (rating: Rating) => void;
  clearRatings: () => void;

  selectedRegion: string;
  setRegion: (region: string) => void;

  selectedCuisine: string;
  setCuisine: (cuisine: string) => void;

  // --- UI state ---
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;

  isDetailOpen: boolean;
  openDetail: (restaurant: Restaurant) => void;
  closeDetail: () => void;

  isFilterOpen: boolean;
  toggleFilter: () => void;

  isMobileListOpen: boolean;
  setMobileListOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // --- Server data ---
  restaurants: [],
  regions: [],
  cuisines: [],
  isLoading: false,
  error: null,

  loadData: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const [restaurantRes, regions, cuisines] = await Promise.all([
        fetchRestaurants({ limit: 9999 }),
        fetchRegionsApi(),
        fetchCuisinesApi(),
      ]);
      set({
        restaurants: restaurantRes.data,
        regions,
        cuisines,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "데이터를 불러오지 못했습니다";
      set({ error: message, isLoading: false });
    }
  },

  // --- Filters ---
  search: "",
  setSearch: (search) => set({ search }),

  selectedRatings: [],
  toggleRating: (rating) =>
    set((state) => ({
      selectedRatings: state.selectedRatings.includes(rating)
        ? state.selectedRatings.filter((r) => r !== rating)
        : [...state.selectedRatings, rating],
    })),
  clearRatings: () => set({ selectedRatings: [] }),

  selectedRegion: "",
  setRegion: (region) => set({ selectedRegion: region }),

  selectedCuisine: "",
  setCuisine: (cuisine) => set({ selectedCuisine: cuisine }),

  // --- UI state ---
  selectedRestaurant: null,
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

  isDetailOpen: false,
  openDetail: (restaurant) =>
    set({ selectedRestaurant: restaurant, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false }),

  isFilterOpen: false,
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),

  isMobileListOpen: false,
  setMobileListOpen: (open) => set({ isMobileListOpen: open }),
}));
