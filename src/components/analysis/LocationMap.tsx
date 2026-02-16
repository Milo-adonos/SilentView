import { useEffect, useRef, useState } from 'react';
import { Crosshair, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  isAnimating?: boolean;
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function LocationMap({ latitude, longitude, city, isAnimating = false }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [showOverlays, setShowOverlays] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [longitude, latitude],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || isAnimating) return;

    const flyToLocation = () => {
      map.current?.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        pitch: 45,
        bearing: -15,
        duration: 3000,
        essential: true,
        curve: 1.5,
      });

      setTimeout(() => {
        if (!map.current || marker.current) return;

        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.innerHTML = `
          <div class="marker-container">
            <div class="marker-ripple"></div>
            <div class="marker-ripple marker-ripple-delayed"></div>
            <div class="marker-pulse"></div>
            <div class="marker-pin">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `;

        marker.current = new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        setShowOverlays(true);
      }, 2000);
    };

    const timer = setTimeout(flyToLocation, 500);
    return () => clearTimeout(timer);
  }, [latitude, longitude, mapLoaded, isAnimating]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700/50">
      <div
        className={`absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 transition-all duration-500 ${showOverlays ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-slate-300">Position détectée</span>
      </div>

      <div
        className={`absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 transition-all duration-500 ${showOverlays ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <Crosshair className="w-3.5 h-3.5 text-rose-400" />
      </div>

      <div className="relative aspect-[16/9] w-full">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30 pointer-events-none" />

        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent transition-opacity duration-1000 ${showOverlays ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-rose-500/20 to-transparent transition-opacity duration-1000 ${showOverlays ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      </div>

      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-sm rounded-full border border-emerald-500/30 transition-all duration-500 ${showOverlays ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-white">{city}</span>
      </div>

      <style>{`
        .custom-marker {
          cursor: default;
        }
        .marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-ripple {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid rgba(244, 63, 94, 0.3);
          animation: ripple 2s infinite;
        }
        .marker-ripple-delayed {
          animation-delay: 0.5s;
          width: 60px;
          height: 60px;
          border-width: 1px;
          border-color: rgba(244, 63, 94, 0.2);
        }
        .marker-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(244, 63, 94, 0.3);
          border-radius: 50%;
          filter: blur(8px);
          animation: pulse 2s infinite;
        }
        .marker-pin {
          position: relative;
          background: linear-gradient(135deg, #f43f5e, #ea580c);
          border-radius: 50%;
          padding: 8px;
          color: white;
          box-shadow: 0 4px 20px rgba(244, 63, 94, 0.5);
          animation: bounce 2s infinite;
        }
        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
