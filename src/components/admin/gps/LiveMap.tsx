import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PathPoint {
  lat: number;
  lng: number;
}

interface LiveMapProps {
  currentPosition: { lat: number; lng: number };
  pathPoints: PathPoint[];
  isTracking: boolean;
  mapStyle?: 'default' | 'dark' | 'retro';
  onMapStyleChange?: (style: 'default' | 'dark' | 'retro') => void;
}

export function LiveMap({ currentPosition, pathPoints, isTracking, mapStyle = 'default', onMapStyleChange }: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const previousPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map centered on Colombo, Sri Lanka by default
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([6.9271, 79.8612], 16);

    // Get tile layer URL based on style
    const getTileLayerUrl = (style: string) => {
      switch (style) {
        case 'dark':
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        case 'retro':
          return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
        default:
          return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      }
    };

    const getAttribution = (style: string) => {
      switch (style) {
        case 'dark':
          return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
        case 'retro':
          return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.hotosm.org/">Humanitarian OSM</a>';
        default:
          return '&copy; <a href="https://www.google.com/maps">Google Maps</a>';
      }
    };

    // Add tile layer
    const tileLayer = L.tileLayer(getTileLayerUrl(mapStyle), {
      attribution: getAttribution(mapStyle),
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update tile layer when map style changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const getTileLayerUrl = (style: string) => {
      switch (style) {
        case 'dark':
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        case 'retro':
          return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
        default:
          return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      }
    };

    const getAttribution = (style: string) => {
      switch (style) {
        case 'dark':
          return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
        case 'retro':
          return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.hotosm.org/">Humanitarian OSM</a>';
        default:
          return '&copy; <a href="https://www.google.com/maps">Google Maps</a>';
      }
    };

    // Remove old tile layer
    tileLayerRef.current.remove();

    // Add new tile layer
    const newTileLayer = L.tileLayer(getTileLayerUrl(mapStyle), {
      attribution: getAttribution(mapStyle),
      maxZoom: 19,
    }).addTo(mapRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Create custom car icon
  const createCarIcon = () => {
    return L.divIcon({
      html: '<div style="font-size: 30px; transform: rotate(0deg);">🚗</div>',
      className: 'car-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Animate marker between two positions
  const animateMarker = (
    marker: L.Marker,
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    duration: number = 1000
  ) => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentLat = fromLat + (toLat - fromLat) * progress;
      const currentLng = fromLng + (toLng - fromLng) * progress;

      marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animate();
  };

  // Update marker position with animation
  useEffect(() => {
    if (!mapRef.current || currentPosition.lat === 0 || currentPosition.lng === 0) return;

    const map = mapRef.current;
    const newLat = currentPosition.lat;
    const newLng = currentPosition.lng;

    if (!markerRef.current) {
      markerRef.current = L.marker([newLat, newLng], {
        icon: createCarIcon(),
      }).addTo(map);

      map.setView([newLat, newLng], 16);
      previousPositionRef.current = { lat: newLat, lng: newLng };
    } else {
      const prevPos = previousPositionRef.current;

      if (prevPos && isTracking) {
        const distance = map.distance([prevPos.lat, prevPos.lng], [newLat, newLng]);

        if (distance > 1) {
          animateMarker(markerRef.current, prevPos.lat, prevPos.lng, newLat, newLng, 1000);

          const bounds = map.getBounds();
          const newLatLng = L.latLng(newLat, newLng);

          if (!bounds.contains(newLatLng)) {
            map.panTo([newLat, newLng], { animate: true, duration: 1 });
          }
        }
      } else {
        markerRef.current.setLatLng([newLat, newLng]);
      }

      previousPositionRef.current = { lat: newLat, lng: newLng };
    }
  }, [currentPosition, isTracking]);

  // Update path polyline
  useEffect(() => {
    if (!mapRef.current || pathPoints.length < 2) {
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      return;
    }

    const map = mapRef.current;
    const latLngs: [number, number][] = pathPoints.map(p => [p.lat, p.lng]);

    if (!polylineRef.current) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.9,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      polylineRef.current.setLatLngs(latLngs);
    }
  }, [pathPoints]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full bg-gray-100" />

      <div className="absolute top-2 right-2 z-[1000]">
        <select
          value={mapStyle}
          onChange={(e) => {
            const newStyle = e.target.value as 'default' | 'dark' | 'retro';
            if (onMapStyleChange) {
              onMapStyleChange(newStyle);
            }
          }}
          className="px-3 py-2 text-xs rounded-lg border-2 border-gray-300 bg-white/95 backdrop-blur font-semibold text-gray-700 hover:bg-white transition focus:outline-none focus:border-blue-500 shadow-lg cursor-pointer"
        >
          <option value="default">🗺️ Default</option>
          <option value="dark">🌙 Dark Mode</option>
          <option value="retro">🎨 Retro Style</option>
        </select>
      </div>

      {isTracking && currentPosition.lat !== 0 && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-lg shadow-lg px-3 py-2 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-700">Live Tracking</span>
          </div>
        </div>
      )}

      {pathPoints.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
          <span className="text-xs font-semibold">
            {pathPoints.length} tracking points
          </span>
        </div>
      )}

      <style>{`
        .car-marker {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
