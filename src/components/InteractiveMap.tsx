import React, { useState } from 'react';
import { Destination, PatagoniaZone, DestinationCategory } from '../types';
import { RealGeoMap } from './RealGeoMap';
import { SafeImage } from './SafeImage';
import { Compass, ExternalLink, ShieldCheck, ArrowRight, Grid, Map as MapIcon, PlusCircle, Check } from 'lucide-react';

interface InteractiveMapProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  selectedZone?: PatagoniaZone | 'all';
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  onSelectDestination,
  selectedZone = 'all',
}) => {
  const [activeDestination, setActiveDestination] = useState<Destination>(
    destinations.find((d) => d.id === 'torres-del-paine') || destinations[0]
  );
  const [addedToRoute, setAddedToRoute] = useState(false);

  const handleAddToRoute = (dest: Destination) => {
    try {
      const currentPlan = JSON.parse(localStorage.getItem('surario_custom_plan') || '{}');
      const currentStops = currentPlan.selectedDestinations || [];
      if (!currentStops.includes(dest.id)) {
        currentPlan.selectedDestinations = [...currentStops, dest.id];
        localStorage.setItem('surario_custom_plan', JSON.stringify(currentPlan));
      }
      setAddedToRoute(true);
      setTimeout(() => setAddedToRoute(false), 2500);
    } catch {
      setAddedToRoute(true);
    }
  };

  return (
    <div className="bg-[#FAF8F5] rounded-3xl border border-stone-300 p-4 sm:p-6 shadow-xs space-y-6">
      
      {/* Real Map Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[560px]">
        
        {/* Real Geographic Map */}
        <div className="lg:col-span-8 bg-[#E6EAE5] rounded-2xl border border-stone-300 overflow-hidden shadow-xs relative min-h-[460px] lg:min-h-[560px]">
          <RealGeoMap
            destinations={destinations}
            activeDestination={activeDestination}
            onSelectDestination={setActiveDestination}
          />
        </div>

        {/* Inspiring Destination Sidebar Card */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          {activeDestination ? (
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                  <SafeImage
                    src={activeDestination.image}
                    alt={activeDestination.name}
                    className="w-full h-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-[#142B1F]/90 text-[#D4A373] text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-md backdrop-blur-xs">
                    {activeDestination.country} · {activeDestination.region}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-xl font-serif font-bold text-white">
                      {activeDestination.name}
                    </h3>
                    <p className="text-xs text-stone-200 font-light truncate mt-0.5">
                      {activeDestination.tagline}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif font-light">
                    {activeDestination.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block">
                      Experiencias Clave
                    </span>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {activeDestination.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#D4A373] font-bold">·</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100 font-mono">
                    <span>{activeDestination.recommendedDays} días rec.</span>
                    <span>{activeDestination.altitude}</span>
                    <span>{activeDestination.physicalDemand}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 space-y-2">
                <button
                  onClick={() => onSelectDestination(activeDestination)}
                  className="w-full py-2.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Descubrir este lugar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                </button>
                <button
                  onClick={() => handleAddToRoute(activeDestination)}
                  className="w-full py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium rounded-xl border border-stone-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {addedToRoute ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-800">¡Añadido a tu ruta!</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-[#2C7A9C]" />
                      <span>Añadir a mi ruta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>

      </div>

    </div>
  );
};
