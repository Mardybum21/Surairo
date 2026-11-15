import React, { useState } from 'react';
import {
  DESTINATIONS,
  ACCOMMODATIONS,
  ACTIVITIES,
  ITINERARIES,
  ARTICLES,
} from '../../data/patagoniaData';
import {
  Destination,
  Accommodation,
  Activity,
  Article,
  PageId,
} from '../../types';
import {
  Search,
  ArrowRight,
  Compass,
  MapPin,
  Calendar,
  Mountain,
  ShieldCheck,
  Check,
  BedDouble,
  Footprints,
  BookOpen,
  Route,
  ArrowUpRight,
  Trees,
  Map as MapIcon,
  Sparkles,
  Wind,
  Cloud,
  Droplets,
} from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { Language, Currency, DestinationWeatherData } from '../../types';
import { TRANSLATIONS } from '../../utils/i18n';
import { fetchRealtimeWeather } from '../../services/weatherService';

interface HomeViewProps {
  language?: Language;
  currency?: Currency;
  onNavigate: (page: PageId) => void;
  onSelectDestination: (dest: Destination) => void;
  onSelectAccommodation: (acc: Accommodation) => void;
  onSelectActivity: (act: Activity) => void;
  onSelectArticle: (art: Article) => void;
  onSearch: (destinationId: string, category: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language = 'es',
  currency = 'USD',
  onNavigate,
  onSelectDestination,
  onSelectAccommodation,
  onSelectActivity,
  onSelectArticle,
  onSearch,
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [liveWeathers, setLiveWeathers] = useState<Record<string, DestinationWeatherData>>({});

  const t = TRANSLATIONS[language];

  // Fetch weather for key locations
  React.useEffect(() => {
    const locations = [
      { id: 'bariloche', name: 'Bariloche', lat: -41.1335, lng: -71.3103 },
      { id: 'torres-del-paine', name: 'Torres del Paine', lat: -51.2532, lng: -72.8814 },
      { id: 'ushuaia', name: 'Ushuaia', lat: -54.8019, lng: -68.3030 },
      { id: 'puerto-williams', name: 'Puerto Williams', lat: -54.9333, lng: -67.6167 },
    ];

    locations.forEach((loc) => {
      fetchRealtimeWeather(loc.id, loc.name, loc.lat, loc.lng, language).then((data) => {
        setLiveWeathers((prev) => ({ ...prev, [loc.id]: data }));
      }).catch(() => {});
    });
  }, [language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(selectedDestId, selectedCategory);
  };

  // Curated spotlight destinations representing all 4 regions
  const spotlightDestinations = [
    DESTINATIONS.find((d) => d.id === 'torres-del-paine') || DESTINATIONS[0],
    DESTINATIONS.find((d) => d.id === 'el-chalten') || DESTINATIONS[1],
    DESTINATIONS.find((d) => d.id === 'punta-arenas') || DESTINATIONS[2],
    DESTINATIONS.find((d) => d.id === 'puerto-williams') || DESTINATIONS[3],
    DESTINATIONS.find((d) => d.id === 'bariloche') || DESTINATIONS[4],
    DESTINATIONS.find((d) => d.id === 'ushuaia') || DESTINATIONS[5],
  ];

  return (
    <div className="space-y-24 pb-24">
      
      {/* 1. Hero Section: Authentic Photographic Immersion */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center text-white overflow-hidden bg-[#142B1F]">
        <SafeImage
          src="/images/fitzroy.jpg"
          alt="Monte Fitz Roy y Laguna de los Tres en El Chaltén, Patagonia"
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-100 hover:scale-102 transition-transform duration-1000"
          priority
        />
        {/* Measured dark scrim for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F] via-[#142B1F]/50 to-stone-950/35" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-14 pb-24">
          
          {/* Brand Tagline Banner */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A373] bg-[#142B1F]/80 px-4 py-1.5 rounded-md backdrop-blur-md border border-[#D4A373]/30">
            <Compass className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{t.heroKicker}</span>
          </div>

          {/* Exact Required Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-[1.1] text-balance">
            {t.heroTitle}
          </h1>

          {/* Exact Required Subtitle */}
          <p className="text-base sm:text-xl text-stone-200 max-w-2xl mx-auto font-light leading-relaxed text-balance font-sans">
            {t.heroSubtitle}
          </p>

          {/* Prominent Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('destinos')}
              className="px-6 py-3.5 bg-[#D4A373] hover:bg-[#C48D57] text-[#142B1F] rounded-xl font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>{t.exploreDestinationsBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('itinerarios')}
              className="px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md rounded-xl font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2"
            >
              <Route className="w-4 h-4 text-[#D4A373]" />
              <span>{t.planTripBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('mapa')}
              className="px-5 py-3.5 bg-[#142B1F]/80 hover:bg-[#1E3F30] text-stone-200 border border-[#D4A373]/30 backdrop-blur-md rounded-xl font-medium text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#2C7A9C]" />
              <span>{t.viewOnMapBtn}</span>
            </button>
          </div>

          {/* Integrated Search Engine */}
          <div className="pt-4 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-[#FAF8F5] p-3 rounded-2xl shadow-2xl border border-stone-200/90 text-stone-800 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3"
            >
              <div className="w-full sm:w-1/2 flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-stone-200 text-left">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0" />
                <div className="w-full">
                  <label htmlFor="hero-dest-select" className="block text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                    {t.searchDestinationLabel}
                  </label>
                  <select
                    id="hero-dest-select"
                    value={selectedDestId}
                    onChange={(e) => setSelectedDestId(e.target.value)}
                    className="w-full text-xs sm:text-sm font-medium text-stone-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="todos">{t.searchAllPatagonia}</option>
                    <optgroup label={language === 'en' ? 'Chile: Los Lagos & Chiloé' : 'Chile: Los Lagos & Chiloé'}>
                      <option value="puerto-varas">Puerto Varas & Vicente Pérez Rosales</option>
                      <option value="chiloe">Archipiélago de Chiloé</option>
                      <option value="futaleufu">Futaleufú & Pumalín Douglas Tompkins</option>
                    </optgroup>
                    <optgroup label={language === 'en' ? 'Chile: Aysén & Carretera Austral' : 'Chile: Aysén & Carretera Austral'}>
                      <option value="parque-nacional-queulat">Puyuhuapi & P. N. Queulat</option>
                      <option value="capillas-marmol">Puerto Río Tranquilo & Capillas de Mármol</option>
                      <option value="cochrane">Cochrane & Glaciar Calluqueo</option>
                    </optgroup>
                    <optgroup label={language === 'en' ? 'Argentina: Andean Lakes (Route 40)' : 'Argentina: Lagos Andinos (Ruta 40)'}>
                      <option value="bariloche">San Carlos de Bariloche & Nahuel Huapi</option>
                      <option value="san-martin-de-los-andes">San Martín de los Andes & 7 Lagos</option>
                      <option value="parque-nacional-los-alerces">Esquel & P. N. Los Alerces</option>
                    </optgroup>
                    <optgroup label={language === 'en' ? 'Binational Austral Patagonia' : 'Patagonia Austral Binacional'}>
                      <option value="el-calafate">El Calafate & Glaciar Perito Moreno</option>
                      <option value="el-chalten">El Chaltén · Monte Fitz Roy</option>
                      <option value="torres-del-paine">Torres del Paine (Chile)</option>
                      <option value="puerto-natales">Puerto Natales (Chile)</option>
                      <option value="punta-arenas">Punta Arenas & Cabo Froward</option>
                      <option value="ushuaia">{language === 'en' ? 'Ushuaia · End of the World (Argentina)' : 'Ushuaia · Fin del Mundo (Argentina)'}</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="w-full sm:w-1/2 flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-stone-200 text-left">
                <Compass className="w-4 h-4 text-[#2C7A9C] shrink-0" />
                <div className="w-full">
                  <label htmlFor="hero-cat-select" className="block text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                    {t.searchExploreLabel}
                  </label>
                  <select
                    id="hero-cat-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm font-medium text-stone-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="todos">{t.searchAllPortal}</option>
                    <option value="destinos">{t.searchDestinationsOption}</option>
                    <option value="excursiones">{t.searchActivitiesOption}</option>
                    <option value="alojamientos">{t.searchStaysOption}</option>
                    <option value="itinerarios">{t.searchItinerariesOption}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-4 bg-[#142B1F] hover:bg-[#1E3F30] text-white rounded-xl font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
              >
                <Search className="w-4 h-4 text-[#D4A373]" />
                <span>{t.searchButton}</span>
              </button>
            </form>
          </div>

          <div className="text-[11px] text-stone-300 pt-1 flex flex-wrap items-center justify-center gap-3 font-light">
            <span>{t.trustPointPhotos}</span>
            <span aria-hidden="true">·</span>
            <span>{t.trustPointRegions}</span>
            <span aria-hidden="true">·</span>
            <span>{t.trustPointIndependent}</span>
          </div>
        </div>
      </section>

      {/* 2. Asymmetric Regional Magazine Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
              {t.geoNorthToSouth}
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
              {t.fourRegionsTitle}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('mapa')}
            className="text-xs font-semibold tracking-wider uppercase text-stone-800 hover:text-[#142B1F] flex items-center gap-1.5 cursor-pointer"
          >
            <span>{language === 'en' ? 'View complete geographic map' : 'Ver mapa cartográfico completo'}</span>
            <ArrowRight className="w-4 h-4 text-[#D4A373]" />
          </button>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Feature: Aysén & Carretera Austral (7 Cols) */}
          <div
            onClick={() => onNavigate('destinos')}
            className="lg:col-span-7 group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
              <SafeImage
                src="/images/queulat.jpg"
                alt="Ventisquero Colgante Queulat en Aysén, Carretera Austral"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
              <div className="absolute top-4 left-4 bg-[#142B1F]/90 text-[#D4A373] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md">
                Chile · Aysén
              </div>
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="text-xs uppercase tracking-widest text-stone-300 font-medium">
                  {language === 'en' ? 'Route 7 · 1,240 km of Fjords & Rainforest' : 'Ruta 7 · 1.240 km de Fiordos y Selva Fría'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold group-hover:text-[#D4A373] transition-colors">
                  {language === 'en' ? 'Aysén & The Legendary Carretera Austral' : 'Aysén & La Mítica Carretera Austral'}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-sm text-stone-600 leading-relaxed font-serif">
                {language === 'en'
                  ? 'From the hanging glacier in Queulat National Park and the turquoise mineral formations of the Marble Caves in Lake General Carrera, down to the southern icefields of Cochrane and Calluqueo Glacier.'
                  : 'Desde los glaciares colgantes del Parque Nacional Queulat y las formaciones minerales de las Capillas de Mármol en Lago General Carrera, hasta los campos de hielo de Cochrane y Glaciar Calluqueo.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                <span>Puyuhuapi</span>
                <span aria-hidden="true">·</span>
                <span>Puerto Río Tranquilo</span>
                <span aria-hidden="true">·</span>
                <span>Cochrane</span>
                <span aria-hidden="true">·</span>
                <span>Villa O'Higgins</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#142B1F]">
              <span>{language === 'en' ? 'Explore Aysén & access routes' : 'Explorar Aysén y sus accesos'}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {t.exploreRegion} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </span>
            </div>
          </div>

          {/* Right Column: 3 Stacked Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Los Lagos & Chiloé */}
            <div
              onClick={() => onNavigate('destinos')}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                  <SafeImage
                    src="/images/chiloe.jpg"
                    alt="Palafitos e iglesias de madera en Chiloé"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-[#2C7A9C] font-semibold uppercase tracking-wider block">
                    Chile Norte
                  </span>
                  <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                    {language === 'en' ? 'Los Lagos, Chiloé & Volcanoes' : 'Los Lagos, Chiloé & Volcanes'}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 font-light">
                    {language === 'en'
                      ? 'Osorno Volcano, Petrohué Waterfalls, UNESCO heritage wooden churches, and Pumalín temperate rainforest.'
                      : 'Volcán Osorno, Saltos del Petrohué, iglesias patrimoniales de madera y la selva de Pumalín.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Argentina Norte & 7 Lagos */}
            <div
              onClick={() => onNavigate('destinos')}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                  <SafeImage
                    src="/images/siete_lagos.jpg"
                    alt="Ruta de los 7 Lagos en Neuquén y Río Negro"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-[#142B1F] font-semibold uppercase tracking-wider block">
                    Argentina Norte
                  </span>
                  <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                    {language === 'en' ? 'Andean Lakes & Route 40' : 'Lagos Andinos & Ruta 40'}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 font-light">
                    {language === 'en'
                      ? 'Bariloche, the iconic Seven Lakes Route, San Martín de los Andes, and 2,600-year-old millennial larch trees.'
                      : 'Bariloche, la emblemática Ruta de los 7 Lagos, San Martín de los Andes y alerces milenarios de 2.600 años.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Austral Binacional */}
            <div
              onClick={() => onNavigate('destinos')}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                  <SafeImage
                    src="/images/torres_del_paine.jpg"
                    alt="Cuernos del Paine y lagos glaciares"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-[#2C7A9C] font-semibold uppercase tracking-wider block">
                    {language === 'en' ? 'Southern Binational' : 'Binacional Austral'}
                  </span>
                  <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                    {language === 'en' ? 'Glaciers & End of the World' : 'Glaciares & Fin del Mundo'}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 font-light">
                    {language === 'en'
                      ? 'Perito Moreno Glacier, Mount Fitz Roy spires, Torres del Paine National Park, and the southernmost reaches of Ushuaia.'
                      : 'El Perito Moreno, las agujas del Fitz Roy, Torres del Paine y el confín austral de Ushuaia.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real-Time Austral Weather Strip (Open-Meteo Satelital) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142B1F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="text-xs uppercase font-semibold tracking-widest text-[#D4A373]">
                  {t.weatherTitle}
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                  {language === 'en' ? 'Live · Open-Meteo Satellite' : 'En vivo · Satélite Open-Meteo'}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-light">
                {t.weatherSubtitle}
              </p>
            </div>
            <span className="text-xs text-amber-200/90 italic">
              ⚠️ {t.weatherWarning}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { id: 'bariloche', name: language === 'en' ? 'Bariloche (Lakes)' : 'Bariloche (Lagos)', lat: -41.13, lng: -71.31 },
              { id: 'torres-del-paine', name: 'Torres del Paine (Paine)', lat: -51.25, lng: -72.88 },
              { id: 'ushuaia', name: language === 'en' ? 'Ushuaia (Beagle Channel)' : 'Ushuaia (Canal Beagle)', lat: -54.80, lng: -68.30 },
              { id: 'puerto-williams', name: language === 'en' ? 'P. Williams (Cape Horn)' : 'P. Williams (Cabo Hornos)', lat: -54.93, lng: -67.62 },
            ].map((loc) => {
              const data = liveWeathers[loc.id];
              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    const found = DESTINATIONS.find((d) => d.id === loc.id);
                    if (found) onSelectDestination(found);
                  }}
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white group-hover:text-[#D4A373] transition-colors">
                      {loc.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {loc.lat}° S
                    </span>
                  </div>

                  {data ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-serif font-bold text-white">
                          {data.current.temperature}°C
                        </span>
                        <span className="text-[11px] text-amber-300 font-medium">
                          {t.weatherApparent}: {data.current.apparentTemperature}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-300 pt-1 border-t border-white/5">
                        <span className="truncate">{data.current.conditionText}</span>
                        <span className="flex items-center gap-1 text-sky-300 shrink-0">
                          <Wind className="w-3 h-3" />
                          <span>{data.current.windSpeed} km/h</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-[11px] text-stone-400 animate-pulse">
                      {language === 'en' ? 'Querying satellite...' : 'Consultando satélite...'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Curated Destinations Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
              {t.spotlightTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {t.spotlightSubtitle}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('destinos')}
            className="text-xs font-semibold tracking-wider uppercase text-stone-800 hover:text-[#142B1F] flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.viewAllDestinations}</span>
            <ArrowRight className="w-4 h-4 text-[#D4A373]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spotlightDestinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onSelectDestination(dest)}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                  <SafeImage
                    src={dest.image}
                    alt={`Paisaje representativo de ${dest.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F]/90 via-stone-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-[#142B1F]/80 backdrop-blur-xs text-[#D4A373] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">
                    {dest.country}
                  </div>

                  {dest.isRemote && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {language === 'en' ? 'Remote' : 'Remoto'}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-stone-300 uppercase tracking-widest block font-medium">
                      {dest.region}
                    </span>
                    <h3 className="text-lg font-serif font-bold group-hover:text-[#D4A373] transition-colors">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100 font-mono">
                    <span>{dest.recommendedDays} {language === 'en' ? 'days rec.' : 'días rec.'}</span>
                    <span>{dest.coordinates.lat.toFixed(2)}° S</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span className="text-stone-500 text-[11px] truncate max-w-[180px]">
                  {dest.highlights[0]}
                </span>
                <span className="font-semibold text-[#142B1F] group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                  {t.viewFullDetails} <ArrowRight className="w-3 h-3 text-[#D4A373]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Practical Route Planning Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142B1F] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-[#1C3D2C]">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#D4A373]">
              {language === 'en' ? 'Practical Route Planner' : 'Herramienta Práctica de Planificación'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              {language === 'en'
                ? 'Organize your trip between Argentina and Chile (5 to 21 Days)'
                : 'Organiza tus etapas entre Argentina y Chile (5 a 21 Días)'}
            </h2>
            <p className="text-sm sm:text-base text-stone-200 font-light leading-relaxed">
              {language === 'en'
                ? 'Distances in Patagonia are colossal. Use SURARIO’s interactive planner to balance overnight stays, starting points, and connections across lakes, volcanoes, and glaciers.'
                : 'Las distancias en la Patagonia son colosales. Usa el planificador interactivo de SURARIO para calcular noches óptimas, puntos de inicio y conexiones entre lagos, volcanes y glaciares.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate('itinerarios')}
                className="px-6 py-3.5 bg-[#D4A373] hover:bg-[#C48D57] text-[#142B1F] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Route className="w-4 h-4" />
                <span>{language === 'en' ? 'Design my custom route' : 'Diseñar mi ruta personalizada'}</span>
              </button>
              <button
                onClick={() => onNavigate('mapa')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-colors cursor-pointer backdrop-blur-xs flex items-center gap-2"
              >
                <MapIcon className="w-4 h-4 text-[#D4A373]" />
                <span>{language === 'en' ? 'Open geographic map' : 'Abrir mapa cartográfico'}</span>
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden lg:flex items-center justify-center">
            <Route className="w-96 h-96 -mr-16 text-white" />
          </div>
        </div>
      </section>

      {/* 5. Signature Experiences: Qué Hacer */}
      <section className="bg-[#FAF8F5] border-y border-stone-200/90 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
                {t.activitiesSectionTitle}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t.activitiesSectionSubtitle}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('excursiones')}
              className="text-xs font-semibold tracking-wider uppercase text-stone-800 hover:text-[#142B1F] flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.viewAllTours}</span>
              <ArrowRight className="w-4 h-4 text-[#D4A373]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACTIVITIES.slice(0, 3).map((act) => (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                    <SafeImage
                      src={act.image}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-xs text-white font-medium">
                      {act.destinationName}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">{act.categoryLabel}</span>
                      <span>{language === 'en' ? 'Difficulty' : 'Dificultad'}: {act.difficulty}</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                      {act.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{act.duration}</span>
                  <span className="font-semibold text-[#142B1F] flex items-center gap-1">
                    {t.viewGuideLabel} <ArrowRight className="w-3 h-3 text-[#D4A373]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Travel Guides: Cuaderno Austral */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
              {t.guidesSectionTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {t.guidesSectionSubtitle}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('guias')}
            className="text-xs font-semibold tracking-wider uppercase text-stone-800 hover:text-[#142B1F] flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.readArticles}</span>
            <ArrowRight className="w-4 h-4 text-[#D4A373]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                  <SafeImage
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 bg-[#142B1F]/80 backdrop-blur-xs text-[#D4A373] text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                    {art.category}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{art.readTime}</span>
                    <span>{art.date}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-light">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>{language === 'en' ? 'By' : 'Por'} {art.author}</span>
                <span className="font-semibold text-[#142B1F] group-hover:text-[#2C7A9C] flex items-center gap-1">
                  {language === 'en' ? 'Read guide' : 'Leer guía'} <ArrowRight className="w-3 h-3 text-[#D4A373]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Providers Network Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F5] border border-stone-300 text-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-2xl text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#142B1F]">
              <ShieldCheck className="w-4 h-4 text-[#2C7A9C]" />
              <span>{language === 'en' ? 'SURARIO Authentic Tourism Network' : 'Red de Turismo Auténtico SURARIO'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-950">
              {t.providerBannerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
              {t.providerBannerDesc}
            </p>
          </div>
          <button
            onClick={() => onNavigate('proveedores')}
            className="px-6 py-3.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>{t.providerBannerBtn}</span>
            <ArrowUpRight className="w-4 h-4 text-[#D4A373]" />
          </button>
        </div>
      </section>

    </div>
  );
};
