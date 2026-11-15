import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Destination } from '../types';
import { Compass, RefreshCw, AlertCircle, MapPin, ArrowRight } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

interface RealGeoMapProps {
  destinations: Destination[];
  activeDestination: Destination | null;
  onSelectDestination: (dest: Destination) => void;
  className?: string;
}

export const RealGeoMap: React.FC<RealGeoMapProps> = ({
  destinations,
  activeDestination,
  onSelectDestination,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [initError, setInitError] = useState(false);

  // Initial bounds for all of Patagonia (from 38°S to 56°S, Chile & Argentina)
  const patagoniaBounds: L.LatLngBoundsLiteral = [
    [-38.5, -76.0],
    [-56.0, -64.0],
  ];

  // Initialize Leaflet map with standard OpenStreetMap (100% free, no API key required)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Create map instance with discreet controls and bounded view
        const map = L.map(mapContainerRef.current, {
          center: [-47.5, -71.5],
          zoom: 5,
          minZoom: 4,
          maxZoom: 14,
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom: true,
          maxBounds: [
            [-35.0, -82.0],
            [-58.5, -58.0],
          ],
          maxBoundsViscosity: 0.7,
        });

        // Discreet zoom control at top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Standard OpenStreetMap tiles — authentic, open cartography with zero API keys or billing
        const osmTileLayer = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
            maxZoom: 19,
            // Subdomains for smooth loading
            subdomains: ['a', 'b', 'c'],
          }
        );

        // Track tile error gracefully without breaking the map
        osmTileLayer.on('tileerror', () => {
          setTileErrorCount((prev) => prev + 1);
        });

        osmTileLayer.addTo(map);

        // Layer group for destination markers
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Fit initial bounds cleanly
        map.fitBounds(patagoniaBounds, {
          padding: [30, 30],
          animate: false,
        });

        setMapLoaded(true);
      }
    } catch (err) {
      console.warn('Leaflet map initialization error, enabling graceful fallback:', err);
      setInitError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers whenever destinations change or active destination changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    destinations.forEach((dest) => {
      const isActive = activeDestination?.id === dest.id;
      const isChile = dest.country === 'Chile';

      // Category icon marker
      const categoryIcon = dest.category === 'parque-nacional'
        ? '🌲'
        : dest.category === 'glaciar'
        ? '🏔️'
        : dest.category === 'ruta-escenica'
        ? '🧭'
        : '🏘️';

      // Minimalist, accessible editorial DivIcon
      const iconHtml = `
        <div class="relative group cursor-pointer select-none">
          <div class="flex items-center gap-1.5 transition-transform duration-200 ${
            isActive ? 'scale-115 -translate-y-1' : 'hover:scale-105'
          }">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shadow-md border-2 ${
              isActive
                ? 'bg-[#142B1F] border-[#D4A373] text-white ring-4 ring-[#D4A373]/30'
                : isChile
                ? 'bg-[#1E3F30] border-white text-white'
                : 'bg-[#2C7A9C] border-white text-white'
            }">
              <span class="text-[11px]">${categoryIcon}</span>
            </div>
            <div class="hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold whitespace-nowrap shadow-xs backdrop-blur-md border ${
              isActive
                ? 'bg-[#142B1F] text-[#FAF8F5] border-[#D4A373]'
                : 'bg-[#FAF8F5]/90 text-stone-800 border-stone-200'
            }">
              ${dest.name}
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-surario-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], {
        icon: customIcon,
        title: `${dest.name} (${dest.region})`,
        alt: dest.name,
      });

      marker.on('click', () => {
        onSelectDestination(dest);
        trackEvent('map_destination_click', {
          destination_id: dest.id,
          destination_name: dest.name,
          country: dest.country,
          coordinates_lat: dest.coordinates.lat,
          coordinates_lng: dest.coordinates.lng,
        });
        mapInstanceRef.current?.flyTo(
          [dest.coordinates.lat, dest.coordinates.lng],
          Math.max(mapInstanceRef.current.getZoom(), 7),
          { duration: 0.8 }
        );
      });

      markersGroup.addLayer(marker);
    });
  }, [destinations, activeDestination, onSelectDestination]);

  // Center on active destination when selected externally
  useEffect(() => {
    if (!mapInstanceRef.current || !activeDestination) return;
    mapInstanceRef.current.flyTo(
      [activeDestination.coordinates.lat, activeDestination.coordinates.lng],
      Math.max(mapInstanceRef.current.getZoom(), 7),
      { duration: 0.8 }
    );
  }, [activeDestination]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(patagoniaBounds, {
      padding: [30, 30],
      animate: true,
      duration: 1.0,
    });
  };

  // If map engine fails to initialize, display a friendly fallback destination selector
  if (initError) {
    return (
      <div className={`relative w-full h-full min-h-[500px] p-6 bg-[#FAF8F5] rounded-2xl border border-stone-300 flex flex-col justify-between ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-800">
            <Compass className="w-5 h-5 text-[#2C7A9C]" />
            <h3 className="font-serif font-bold text-lg">Destinos Geográficos de la Patagonia</h3>
          </div>
          <p className="text-xs text-stone-600 font-light">
            Selecciona cualquier destino para explorar su información cartográfica, actividades e itinerario sugerido:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {destinations.map((dest) => {
              const isSelected = activeDestination?.id === dest.id;
              return (
                <button
                  key={dest.id}
                  onClick={() => onSelectDestination(dest)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#142B1F] text-white border-[#142B1F] shadow-xs'
                      : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                    <span>{dest.country}</span>
                    <span>{dest.recommendedDays}d</span>
                  </div>
                  <div className="font-serif font-bold text-xs truncate">{dest.name}</div>
                  <div className="text-[10px] truncate text-stone-400 mt-0.5">{dest.region}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Cartografía abierta OpenStreetMap</span>
          <span className="font-mono">{destinations.length} destinos verificados</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl ${className}`}>
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating reset view button */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleResetView}
          className="px-3.5 py-1.5 bg-[#FAF8F5]/95 hover:bg-white text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#142B1F]"
          title="Restablecer encuadre de toda la Patagonia"
        >
          <span className="w-2 h-2 rounded-full bg-[#142B1F]" />
          <span>Ver toda la Patagonia</span>
        </button>

        {/* Gentle offline/connection notice if tile loading issues occur */}
        {tileErrorCount > 4 && (
          <div className="max-w-xs px-3 py-2 bg-amber-50/95 border border-amber-200 text-amber-900 rounded-xl text-[11px] shadow-sm backdrop-blur-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-tight">
                Las teselas de OpenStreetMap tardan en cargar. Los marcadores y destinos siguen totalmente operativos.
              </p>
              <button
                onClick={() => setTileErrorCount(0)}
                className="text-[10px] font-semibold text-amber-800 underline hover:text-amber-950 cursor-pointer"
              >
                Ocultar aviso
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Geographic Indicator Legend */}
      <div className="absolute bottom-6 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-[#FAF8F5]/90 border border-stone-300 rounded-xl text-[11px] text-stone-700 backdrop-blur-md shadow-xs">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E3F30] inline-block border border-white" />
          Chile (Fiordos, Lagos & Selva Valdiviana)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2C7A9C] inline-block border border-white" />
          Argentina (Andes, Lagos & Estepa)
        </span>
      </div>
    </div>
  );
};
