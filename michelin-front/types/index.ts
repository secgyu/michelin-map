export type Rating = "1-star" | "2-star" | "3-star" | "bib-gourmand" | "selected";

export interface Restaurant {
  id: number;
  name: string;
  name_en: string;
  rating: Rating;
  cuisine: string;
  address: string;
  latitude: number;
  longitude: number;
  price_range: number;
  image_url: string;
  description: string;
  region: string;
  phone_number?: string;
  michelin_url?: string;
}

export interface Filters {
  rating: Rating[];
  region: string;
  cuisine: string;
  search: string;
}

export interface MapBounds {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
}
