"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

const RATING_COLORS: Record<string, string> = {
  "3-star": "#C8102E",
  "2-star": "#C8102E",
  "1-star": "#C8102E",
  "bib-gourmand": "#B45309",
  selected: "#78716C",
};

const RATING_SCALES: Record<string, number> = {
  "3-star": 10,
  "2-star": 8,
  "1-star": 7,
  "bib-gourmand": 6,
  selected: 5,
};

function createMarkerIcon(rating: string, isActive: boolean): google.maps.Symbol {
  const color = RATING_COLORS[rating] ?? "#C8102E";
  const baseScale = RATING_SCALES[rating] ?? 7;
  const scale = isActive ? baseScale * 1.5 : baseScale;

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#FFFFFF",
    strokeWeight: isActive ? 3 : 2,
    scale,
  };
}

export default function MapView() {
  const restaurants = useStore((s) => s.restaurants);
  const search = useStore((s) => s.search);
  const selectedRatings = useStore((s) => s.selectedRatings);
  const selectedRegion = useStore((s) => s.selectedRegion);
  const selectedCuisine = useStore((s) => s.selectedCuisine);
  const selectedRestaurant = useStore((s) => s.selectedRestaurant);
  const openDetail = useStore((s) => s.openDetail);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          r.name.toLowerCase().includes(q) ||
          r.name_en.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedRatings.length > 0 && !selectedRatings.includes(r.rating)) return false;
      if (selectedRegion && r.region !== selectedRegion) return false;
      if (selectedCuisine && r.cuisine !== selectedCuisine) return false;
      return true;
    });
  }, [restaurants, search, selectedRatings, selectedRegion, selectedCuisine]);

  // Google Maps SDK 로드
  useEffect(() => {
    if (typeof window === "undefined") return;

    const markReady = () => setSdkReady(true);

    if (window.google?.maps) {
      // 이미 로드된 경우 다음 마이크로태스크에서 state 업데이트
      queueMicrotask(markReady);
      return;
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      const wait = () => {
        if (window.google?.maps) markReady();
        else setTimeout(wait, 100);
      };
      setTimeout(wait, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("[GoogleMaps] SDK loaded successfully");
      markReady();
    };
    script.onerror = (e) => console.error("[GoogleMaps] Script failed to load", e);
    document.head.appendChild(script);
  }, []);

  // 맵 초기화
  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: { lat: 36.5, lng: 127.5 },
      zoom: 7,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f5f1eb" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8a8580" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1eb" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8e3dd" }] },
        { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4cfc9" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [{ color: "#d4cfc9" }],
        },
      ],
    });

    infoWindowRef.current = new google.maps.InfoWindow();
    mapRef.current = map;
  }, [sdkReady]);

  // 마커 업데이트
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const markers: google.maps.Marker[] = [];

    filtered.forEach((restaurant) => {
      const position = { lat: restaurant.latitude, lng: restaurant.longitude };
      bounds.extend(position);

      const isActive = selectedRestaurant?.id === restaurant.id;

      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position,
        icon: createMarkerIcon(restaurant.rating, isActive),
        zIndex: isActive ? 10 : 1,
        title: restaurant.name,
      });

      marker.addListener("click", () => openDetail(restaurant));

      marker.addListener("mouseover", () => {
        if (infoWindowRef.current && mapRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family:sans-serif;padding:2px 4px;">
              <div style="font-size:13px;font-weight:600;color:#1C1917;">${restaurant.name}</div>
              <div style="font-size:11px;color:#A8A29E;margin-top:2px;">${restaurant.cuisine} · ${restaurant.region}</div>
            </div>
          `);
          infoWindowRef.current.open(mapRef.current, marker);
        }
      });

      marker.addListener("mouseout", () => {
        infoWindowRef.current?.close();
      });

      markers.push(marker);
    });

    markersRef.current = markers;

    if (filtered.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [sdkReady, filtered, selectedRestaurant, openDetail]);

  // 선택된 레스토랑으로 이동
  useEffect(() => {
    if (!selectedRestaurant || !mapRef.current || !sdkReady) return;

    mapRef.current.panTo({
      lat: selectedRestaurant.latitude,
      lng: selectedRestaurant.longitude,
    });

    const currentZoom = mapRef.current.getZoom();
    if (currentZoom !== undefined && currentZoom < 13) {
      mapRef.current.setZoom(13);
    }
  }, [selectedRestaurant, sdkReady]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!sdkReady && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#ECE7E1" }}>
          <div className="text-center">
            <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] text-stone-400 mt-3 tracking-widest uppercase">Map</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-6 right-6 text-[9px] text-warm-gray/40 tracking-[0.15em] uppercase font-medium pointer-events-none">
        Michelin Guide Korea
      </div>
    </div>
  );
}
