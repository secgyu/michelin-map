import { Restaurant } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

interface ListResponse {
  data: Restaurant[];
  total: number;
  limit: number;
  offset: number;
}

interface StringListResponse {
  data: string[];
}

export async function fetchRestaurants(params?: {
  rating?: string;
  region?: string;
  cuisine?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ListResponse> {
  const url = new URL(`${API_BASE}/restaurants`);

  if (params?.rating) url.searchParams.set("rating", params.rating);
  if (params?.region) url.searchParams.set("region", params.region);
  if (params?.cuisine) url.searchParams.set("cuisine", params.cuisine);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch restaurants: ${res.status}`);
  return res.json();
}

export async function fetchRestaurantById(id: number): Promise<Restaurant> {
  const res = await fetch(`${API_BASE}/restaurants/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch restaurant ${id}: ${res.status}`);
  return res.json();
}

export async function fetchRestaurantsByBounds(bounds: {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
}): Promise<{ data: Restaurant[]; total: number }> {
  const url = new URL(`${API_BASE}/restaurants/bounds`);
  url.searchParams.set("sw_lat", String(bounds.sw_lat));
  url.searchParams.set("sw_lng", String(bounds.sw_lng));
  url.searchParams.set("ne_lat", String(bounds.ne_lat));
  url.searchParams.set("ne_lng", String(bounds.ne_lng));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch restaurants by bounds: ${res.status}`);
  return res.json();
}

export async function fetchRegions(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/regions`);
  if (!res.ok) throw new Error(`Failed to fetch regions: ${res.status}`);
  const json: StringListResponse = await res.json();
  return json.data;
}

export async function fetchCuisines(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/cuisines`);
  if (!res.ok) throw new Error(`Failed to fetch cuisines: ${res.status}`);
  const json: StringListResponse = await res.json();
  return json.data;
}
