import React, { useState, useMemo } from 'react';
import { DESTINATIONS, ACCOMMODATIONS, ACTIVITIES } from '../../data/patagoniaData';
import { Destination, PatagoniaZone, DestinationCategory, Language } from '../../types';
import { RealGeoMap } from '../RealGeoMap';
import { SafeImage } from '../SafeImage';
import {
  Compass,
  Search,
  Grid,
  Map as MapIcon,
  X,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Check,
  Trees,
  Mountain,
  BedDouble,
  Footprints,
  Route,
  ChevronDown,
} from 'lucide-react';
import { TRANSLATIONS } from '../../utils/i18n';

interface MapViewProps {
  onSelectDestination: (dest: Destination) => void;
  onNavigateToPlanner?: (destinationId?: string) => void;
  language?: Language;
}

type MainCategory = 'regiones' | 'naturaleza' | 'aventuras' | 'rutas' | 'alojamientos' | null;

export const MapView: React.FC<MapViewProps> = ({
  onSelectDestination,
  onNavigateToPlanner,
  language = 'es',
}) => {
  const t = TRANSLATIONS[language];
  const [activeMainCategory, setActiveMainCategory] = useState<MainCategory>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDestination, setActiveDestination] = useState<Destination>(
    DESTINATIONS.find((d) => d.id === 'torres-del-paine') || DESTINATIONS[0]
  );
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [addedToRoute, setAddedToRoute] = useState(false);
  const [mobileCardOpen, setMobileCardOpen] = useState(true);

  // Progressive filtering logic
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      // Search matching
      const matchesSearch =
        searchQuery.trim() === '' ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tagline.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter matching
      if (!activeMainCategory || selectedSubFilter === 'all') return true;

      if (activeMainCategory === 'regiones') {
        return d.zone === selectedSubFilter;
      }
      if (activeMainCategory === 'naturaleza') {
        if (selectedSubFilter === 'parques') return d.category === 'parque-nacional';
        if (selectedSubFilter === 'glaciares') return d.category === 'glaciar' || d.isRemote;
        return true;
      }
      if (activeMainCategory === 'aventuras') {
        if (selectedSubFilter === 'trekking') return d.physicalDemand.toLowerCase().includes('exigente') || d.physicalDemand.toLowerCase().includes('moderada');
        if (selectedSubFilter === 'tranquilo') return d.physicalDemand.toLowerCase().includes('baja');
        return true;
      }
      if (activeMainCategory === 'rutas') {
        if (selectedSubFilter === 'carretera-austral') return d.zone === 'chile-aysen';
        if (selectedSubFilter === '7-lagos') return d.zone === 'argentina-norte';
        if (selectedSubFilter === 'fin-del-mundo') return d.zone === 'austral-binacional';
        return true;
      }
      if (activeMainCategory === 'alojamientos') {
        return true; // Shows destinations with accommodations
      }

      return true;
    });
  }, [activeMainCategory, selectedSubFilter, searchQuery]);

  // Handle adding destination to route
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
      // Fallback
      setAddedToRoute(true);
    }
  };

  const handleSelectMarker = (dest: Destination) => {
    setActiveDestination(dest);
    setMobileCardOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Exact Required Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
            <Compass className="w-4 h-4 text-[#D4A373]" />
            <span>{language === 'en' ? 'SURARIO · Authentic Geographic Cartography' : 'SURARIO · Cartografía Geográfica Real'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            {language === 'en' ? 'Find Your Patagonia' : 'Encuentra tu Patagonia'}
          </h1>
          <p className="text-base text-stone-600 font-serif italic leading-relaxed">
            {language === 'en'
              ? 'From temperate rainforests to glaciers: discover places worth the journey.'
              : 'Del bosque templado a los glaciares: descubre lugares que merecen el viaje.'}
          </p>
        </div>

        {/* View Mode Switcher: Map vs List */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-[#142B1F] text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Geographic Map' : 'Mapa Geográfico'}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-[#142B1F] text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{language === 'en' ? `Places List (${filteredDestinations.length})` : `Lista de Lugares (${filteredDestinations.length})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Simple Search Bar & Exact 5 Main Categories */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Simple search bar with suggestions */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search by place, peak, lake, or park...' : 'Buscar por lugar, cerro, lago o parque...'}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F] shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                aria-label={language === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Exactly 5 Main Filter Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'regiones', label: language === 'en' ? 'Regions' : 'Regiones', icon: Compass },
              { id: 'naturaleza', label: language === 'en' ? 'Nature' : 'Naturaleza', icon: Trees },
              { id: 'aventuras', label: language === 'en' ? 'Adventures' : 'Aventuras', icon: Footprints },
              { id: 'rutas', label: language === 'en' ? 'Routes' : 'Rutas', icon: Route },
              { id: 'alojamientos', label: language === 'en' ? 'Where to stay' : 'Dónde dormir', icon: BedDouble },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeMainCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (activeMainCategory === cat.id) {
                      setActiveMainCategory(null);
                      setSelectedSubFilter('all');
                    } else {
                      setActiveMainCategory(cat.id as MainCategory);
                      setSelectedSubFilter('all');
                    }
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#142B1F] text-white border-[#142B1F] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 shadow-2xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4A373]' : 'text-stone-500'}`} />
                  <span>{cat.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Simple Progressive Filter Sub-Panel (Only opens when a category is selected) */}
        {activeMainCategory && (
          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 shrink-0">
                {language === 'en' ? 'Options:' : 'Opciones:'}
              </span>

              {activeMainCategory === 'regiones' && (
                <>
                  <button
                    onClick={() => setSelectedSubFilter('all')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'all' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'All' : 'Todas'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('chile-los-lagos')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'chile-los-lagos' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    Chile: Los Lagos & Chiloé
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('chile-aysen')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'chile-aysen' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    Chile: Aysén & Carretera Austral
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('argentina-norte')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'argentina-norte' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'Argentina: Andean Lakes (7 Lakes)' : 'Argentina: Lagos Andinos (7 Lagos)'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('austral-binacional')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'austral-binacional' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'Southern Binational (Glaciers & End of the World)' : 'Austral Binacional (Glaciares & Fin del Mundo)'}
                  </button>
                </>
              )}

              {activeMainCategory === 'naturaleza' && (
                <>
                  <button
                    onClick={() => setSelectedSubFilter('all')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'all' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'All' : 'Todo'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('parques')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'parques' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? '🌲 National Parks' : '🌲 Parques Nacionales'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('glaciares')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'glaciares' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? '🏔️ Glaciers & Icefields' : '🏔️ Glaciares & Campos de Hielo'}
                  </button>
                </>
              )}

              {activeMainCategory === 'aventuras' && (
                <>
                  <button
                    onClick={() => setSelectedSubFilter('all')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'all' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'All difficulties' : 'Todas las dificultades'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('trekking')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'trekking' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'Hiking & Demanding Trekking' : 'Senderismo & Trekking Exigente'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('tranquilo')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'tranquilo' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'Scenic Walks & Boat Navigations' : 'Paseos Tranquilos & Navegaciones'}
                  </button>
                </>
              )}

              {activeMainCategory === 'rutas' && (
                <>
                  <button
                    onClick={() => setSelectedSubFilter('all')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'all' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'All routes' : 'Todas las rutas'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('carretera-austral')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'carretera-austral' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    Carretera Austral (Route 7)
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('7-lagos')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === '7-lagos' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'Seven Lakes Route & Nahuel Huapi' : 'Ruta de los 7 Lagos & Nahuel Huapi'}
                  </button>
                  <button
                    onClick={() => setSelectedSubFilter('fin-del-mundo')}
                    className={`px-3 py-1 rounded-lg ${selectedSubFilter === 'fin-del-mundo' ? 'bg-[#142B1F] text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {language === 'en' ? 'End of the World & Southern Glaciers' : 'Fin del Mundo & Glaciares Australes'}
                  </button>
                </>
              )}

              {activeMainCategory === 'alojamientos' && (
                <span className="text-stone-600 text-xs">
                  {language === 'en'
                    ? 'Showing destinations with curated eco-lodges, cabins, and mountain huts.'
                    : 'Mostrando los destinos con directorio de eco-lodges, cabañas y refugios.'}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setActiveMainCategory(null);
                setSelectedSubFilter('all');
              }}
              className="text-stone-400 hover:text-stone-800 p-1 cursor-pointer shrink-0"
              title="Cerrar filtro"
              aria-label="Cerrar filtro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Geographic Map Stage (Prominent Map + Inspiring Sidebar Card) */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[640px]">
          
          {/* Real Geographic Map Canvas (7 cols on desktop, full on mobile) */}
          <div className="lg:col-span-8 bg-[#E6EAE5] rounded-3xl border border-stone-300 overflow-hidden shadow-xs relative min-h-[480px] lg:min-h-[640px]">
            <RealGeoMap
              destinations={filteredDestinations}
              activeDestination={activeDestination}
              onSelectDestination={handleSelectMarker}
            />
          </div>

          {/* 5. Inspiring Destination Sidebar Card (Desktop Sidebar / Mobile expandable sheet) */}
          <div className="lg:col-span-4 flex flex-col">
            {activeDestination ? (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between h-full animate-fadeIn">
                
                <div>
                  {/* Photo with fixed aspect ratio and authentic credit */}
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
                      <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                        {activeDestination.name}
                      </h3>
                      <p className="text-xs text-stone-200 font-light truncate mt-0.5">
                        {activeDestination.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Evocative description */}
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif font-light">
                      {activeDestination.description}
                    </p>

                    {/* 2-3 Signature Experiences */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block">
                        {language === 'en' ? 'Signature Experiences' : 'Experiencias Clave'}
                      </span>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {activeDestination.highlights.slice(0, 3).map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#D4A373] font-bold">·</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Practical Verified Info */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-stone-100 font-mono">
                      <span>{activeDestination.recommendedDays} {language === 'en' ? 'suggested days' : 'días sugeridos'}</span>
                      <span>{activeDestination.altitude}</span>
                      <span>{activeDestination.physicalDemand}</span>
                    </div>
                  </div>
                </div>

                {/* Clear Action Buttons (One primary, one secondary) */}
                <div className="p-5 bg-[#FAF8F5] border-t border-stone-200 space-y-2">
                  <button
                    onClick={() => onSelectDestination(activeDestination)}
                    className="w-full py-3 bg-[#142B1F] hover:bg-[#1E3F30] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{language === 'en' ? 'Discover this place' : 'Descubrir este lugar'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                  </button>

                  <button
                    onClick={() => handleAddToRoute(activeDestination)}
                    className="w-full py-2.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {addedToRoute ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800">{t.addedToRoute}</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-[#2C7A9C]" />
                        <span>{t.addToRoute}</span>
                      </>
                    )}
                  </button>

                  {onNavigateToPlanner && (
                    <button
                      onClick={() => onNavigateToPlanner(activeDestination.id)}
                      className="w-full text-center text-[11px] text-stone-500 hover:text-[#142B1F] hover:underline font-medium cursor-pointer pt-0.5"
                    >
                      {language === 'en' ? 'View your stages in the Trip Planner →' : 'Ver tus etapas en el Planificador de Viajes →'}
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-stone-500 bg-white rounded-3xl border border-stone-200 flex flex-col items-center justify-center h-full">
                <Compass className="w-8 h-8 text-stone-300 mb-2" />
                <p className="text-xs">{language === 'en' ? 'Tap a marker on the map to explore that place.' : 'Toca un marcador sobre el mapa para descubrir ese lugar.'}</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Alternative List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onSelectDestination(dest)}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                  <SafeImage
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 bg-[#142B1F]/80 text-[#D4A373] text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded">
                    {dest.country} · {dest.region}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#D4A373] transition-colors">
                      {dest.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">{dest.recommendedDays} {language === 'en' ? 'days rec.' : 'días rec.'}</span>
                <span className="font-semibold text-[#142B1F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {language === 'en' ? 'Explore' : 'Descubrir'} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
