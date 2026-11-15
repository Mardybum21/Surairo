import React, { useState } from 'react';
import { DESTINATIONS } from '../../data/patagoniaData';
import { Destination, PatagoniaZone, DestinationCategory, Language } from '../../types';
import { MapPin, Calendar, Compass, ArrowRight, Search, CheckCircle, Map as MapIcon, Grid, ShieldCheck, Mountain, AlertCircle, Trees, Info } from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { InteractiveMap } from '../InteractiveMap';

interface DestinationsViewProps {
  onSelectDestination: (dest: Destination) => void;
  initialFilter?: string;
  initialZone?: PatagoniaZone | 'all';
  language?: Language;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  onSelectDestination,
  initialFilter,
  initialZone = 'all',
  language = 'es',
}) => {
  const [selectedZone, setSelectedZone] = useState<PatagoniaZone | 'all'>(initialZone);
  const [selectedCountry, setSelectedCountry] = useState<'Todos' | 'Argentina' | 'Chile'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory | 'all'>('all');
  const [onlyRemote, setOnlyRemote] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState(
    initialFilter && initialFilter !== 'todos' ? initialFilter : ''
  );

  const filteredDestinations = DESTINATIONS.filter((dest) => {
    const matchesCountry =
      selectedCountry === 'Todos' || dest.country === selectedCountry;
    const matchesZone =
      selectedZone === 'all' || dest.zone === selectedZone;
    const matchesCategory =
      selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesRemote =
      !onlyRemote || dest.isRemote === true;
    const matchesSearch =
      searchQuery.trim() === '' ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCountry && matchesZone && matchesCategory && matchesRemote && matchesSearch;
  });

  // Regional Profiles for the 4 macro-zones
  const regionalProfiles: Record<PatagoniaZone, { title: string; subtitle: string; description: string; highlights: string[]; logistics: string }> = {
    'chile-los-lagos': {
      title: 'Chile: Los Lagos, Chiloé & Palena',
      subtitle: 'Volcanes nevados, templada selva valdiviana y patrimonio insular',
      description: 'El portal norte de la Patagonia chilena abarca desde las riberas del lago Llanquihue y el cono simétrico del Volcán Osorno hasta los archipiélagos míticos de Chiloé con sus iglesias de madera y los bosques de alerces del Parque Pumalín Douglas Tompkins en Chaitén y Futaleufú.',
      highlights: ['Parque Nacional Vicente Pérez Rosales', 'Saltos del Petrohué', 'Iglesias de Chiloé (Patrimonio Mundial)', 'Parque Pumalín'],
      logistics: 'Vuelos comerciales al Aeropuerto El Tepual (Puerto Montt). Transbordadores marítimos hacia Chiloé (Canal de Chacao) y Hornopirén hacia Caleta Gonzalo para ingresar a la Carretera Austral.',
    },
    'chile-aysen': {
      title: 'Chile: Aysén & Carretera Austral',
      subtitle: '1.240 km de fiordos, ventisqueros colgantes y el lago más grande de Chile',
      description: 'Una de las travesías escénicas más aisladas y puras del planeta. Desde Puyuhuapi y los glaciares del Parque Nacional Queulat, atravesando Coyhaique y las cavernas azules de las Capillas de Mármol en Lago General Carrera, hasta los hielos del Glaciar Calluqueo y el final de la Ruta 7 en Caleta Tortel y Villa O’Higgins.',
      highlights: ['Ventisquero Colgante Queulat', 'Capillas de Mármol', 'Parque Nacional Patagonia', 'Glaciar Calluqueo (Monte San Lorenzo)'],
      logistics: 'Aeropuerto Balmaceda (BBA) para acceso central a Coyhaique. Vehículos 4x4 o tipo SUV recomendados para ripio de la Carretera Austral. Abastecimiento de combustible clave en Coyhaique, Tranquilo y Cochrane.',
    },
    'argentina-norte': {
      title: 'Argentina: Lagos Andinos & Cordillera Norte',
      subtitle: 'La mítica Ruta de los 7 Lagos, bosques de coihues y estepa',
      description: 'Abarca el noroeste de la Patagonia argentina: desde el corazón alpino de San Carlos de Bariloche y el Parque Nacional Nahuel Huapi, pasando por Villa La Angostura y San Martín de los Andes a través de la Ruta de los 7 Lagos, hasta el Parque Nacional Los Alerces en Chubut, hogar del Alerce Abuelo de 2.600 años.',
      highlights: ['Ruta de los 7 Lagos (Ruta 40)', 'Parque Nacional Nahuel Huapi', 'Parque Nacional Los Alerces', 'Cerro Campanario & Circuito Chico'],
      logistics: 'Aeropuertos de Bariloche (BRC), Chapelco/San Martín (CPC) y Esquel (EQS). Toda la Ruta de los 7 Lagos está pavimentada y en excelente estado durante todo el año.',
    },
    'austral-binacional': {
      title: 'Patagonia Austral Binacional: Glaciares & Fin del Mundo',
      subtitle: 'El Campo de Hielo Patagónico Sur, las agujas graníticas y Tierra del Fuego',
      description: 'La culminación del continente americano. Comparte entre Argentina y Chile los colosos de hielo más célebres del mundo: el Glaciar Perito Moreno en El Calafate, los senderos del Monte Fitz Roy en El Chaltén, las Torres del Paine en Magallanes, y la ciudad más austral del planeta, Ushuaia, a orillas del Canal Beagle.',
      highlights: ['Glaciar Perito Moreno', 'Monte Fitz Roy & Laguna de los Tres', 'Parque Nacional Torres del Paine', 'Canal Beagle & Tierra del Fuego'],
      logistics: 'Aeropuertos en El Calafate (FTE), Punta Arenas (PUQ) y Ushuaia (USH). Cruce fronterizo principal en Paso Río Don Guillermo (Cancha Carrera) para unir Calafate y Torres del Paine.',
    },
  };

  const activeRegion = selectedZone !== 'all' ? regionalProfiles[selectedZone] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Editorial Header */}
      <div className="max-w-4xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <Compass className="w-4 h-4 text-[#D4A373]" />
          <span>SURARIO · Geografía & Territorio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Destinos de la Patagonia Argentina y Chilena
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-light">
          Una guía rigurosa organizada de norte a sur. Desde los templados lagos y volcanes de Los Lagos y Bariloche, hasta los fiordos de la Carretera Austral y el confín glaciar de Tierra del Fuego.
        </p>
      </div>

      {/* Regional Selector Ribbon */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 px-2 pt-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400">
            Explorar por Macro-Región:
          </span>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
              className="font-medium text-[#142B1F] hover:text-[#2C7A9C] flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              {viewMode === 'grid' ? (
                <>
                  <MapIcon className="w-3.5 h-3.5 text-[#2C7A9C]" />
                  <span>Alternar a Mapa Interactivo</span>
                </>
              ) : (
                <>
                  <Grid className="w-3.5 h-3.5 text-[#142B1F]" />
                  <span>Alternar a Cuadrícula Editorial</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Toda la Patagonia' },
            { id: 'chile-los-lagos', label: '1. Chile: Los Lagos & Chiloé' },
            { id: 'chile-aysen', label: '2. Chile: Aysén & Carretera Austral' },
            { id: 'argentina-norte', label: '3. Argentina: Lagos Andinos (7 Lagos)' },
            { id: 'austral-binacional', label: '4. Austral Binacional: Glaciares' },
          ].map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedZone === z.id
                  ? 'bg-[#142B1F] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Regional Banner if a single zone is selected */}
      {activeRegion && (
        <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl p-6 sm:p-8 space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#2C7A9C] block">
              Cuaderno Regional
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {activeRegion.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-serif italic">
              {activeRegion.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light max-w-4xl">
            {activeRegion.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200/70 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-700" />
                <span>Parques y Áreas Clave:</span>
              </span>
              <div className="flex flex-wrap gap-1.5 text-stone-600">
                {activeRegion.highlights.map((h, i) => (
                  <span key={i} className="bg-white px-2.5 py-1 rounded-md border border-stone-200 text-[11px]">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#142B1F]" />
                <span>Conexiones & Logística:</span>
              </span>
              <p className="text-stone-600 text-xs leading-relaxed font-light">
                {activeRegion.logistics}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Country segmented button */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto shrink-0">
            {(['Todos', 'Argentina', 'Chile'] as const).map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCountry === country
                    ? 'bg-[#142B1F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {country === 'Todos' ? 'Ambos Países' : country}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por destino, lago o parque..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F]"
            />
          </div>

          {/* Toggle for remote glaciology areas */}
          <button
            onClick={() => setOnlyRemote(!onlyRemote)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              onlyRemote
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>🏔️ Solo Glaciares & Zonas Remotas</span>
          </button>
        </div>
      </div>

      {/* View Switch: Map View vs Grid View */}
      {viewMode === 'map' ? (
        <InteractiveMap
          destinations={filteredDestinations}
          onSelectDestination={onSelectDestination}
          selectedZone={selectedZone}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Mostrando {filteredDestinations.length} destinos organizados de norte a sur</span>
            {(selectedZone !== 'all' || selectedCountry !== 'Todos' || onlyRemote || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedZone('all');
                  setSelectedCountry('Todos');
                  setSelectedCategory('all');
                  setOnlyRemote(false);
                  setSearchQuery('');
                }}
                className="text-[#142B1F] underline font-medium cursor-pointer"
              >
                Restablecer todos los filtros
              </button>
            )}
          </div>

          {/* Destination Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest)}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container with fixed aspect ratio */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                    <SafeImage
                      src={dest.image}
                      alt={`Paisaje representativo de ${dest.name}, Patagonia`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F]/90 via-stone-950/20 to-transparent" />
                    
                    {/* Quiet text kicker */}
                    <div className="absolute top-3 left-3 bg-[#142B1F]/80 backdrop-blur-xs text-[#D4A373] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">
                      {dest.country}
                    </div>

                    {dest.isRemote && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                        Zona Remota
                      </div>
                    )}

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[11px] text-stone-300 uppercase tracking-widest block font-medium">
                        {dest.region} · {dest.altitude}
                      </span>
                      <h2 className="text-xl font-serif font-bold group-hover:text-[#D4A373] transition-colors leading-snug">
                        {language === 'en' && dest.nameEn ? dest.nameEn : dest.name}
                      </h2>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-2">
                      {language === 'en' && dest.descriptionEn ? dest.descriptionEn : dest.description}
                    </p>

                    {/* Coordinates & Physical Demand */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 py-2 border-y border-stone-100 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#2C7A9C]" />
                        {dest.coordinates.lat.toFixed(2)}° S, {Math.abs(dest.coordinates.lng).toFixed(2)}° W
                      </span>
                      <span className="font-sans font-normal text-stone-600">
                        {language === 'en' ? 'Demand' : 'Exigencia'}: <strong>{dest.physicalDemand}</strong>
                      </span>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                        {language === 'en' ? 'Highlights' : 'Puntos destacados'}
                      </span>
                      <div className="space-y-1 text-xs text-stone-700">
                        {((language === 'en' && dest.highlightsEn) || dest.highlights).slice(0, 2).map((h, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-[#2C7A9C] shrink-0 mt-0.5" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action Strip */}
                <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{dest.recommendedDays} {language === 'en' ? 'rec. days' : 'días rec.'}</span>
                  </div>
                  <span className="font-semibold text-[#142B1F] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {language === 'en' ? 'View Guide' : 'Ver Guía Completa'} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDestinations.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
          <p className="text-sm font-medium">No se encontraron destinos con esos criterios de búsqueda o zona.</p>
          <button
            onClick={() => {
              setSelectedZone('all');
              setSelectedCountry('Todos');
              setSelectedCategory('all');
              setOnlyRemote(false);
              setSearchQuery('');
            }}
            className="text-xs text-[#142B1F] underline font-medium cursor-pointer"
          >
            Limpiar filtros y ver todos los destinos
          </button>
        </div>
      )}

      {/* Regional Advice & Cartographic Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-300 text-xs text-stone-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <Compass className="w-4 h-4 text-[#142B1F]" />
            <span>Planificación de Cruces Binacionales</span>
          </div>
          <p className="leading-relaxed">
            Si vas a combinar destinos en Argentina y Chile (como El Calafate y Torres del Paine, o Bariloche y Puerto Varas), el cruce de fronteras requiere llevar documentación original del vehículo, seguro binacional RCI y declaración jurada SAG para ingresar a Chile sin productos de origen animal o vegetal no autorizados.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-stone-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Toponimia Oficial y Seguridad en Zonas Remotas</span>
          </div>
          <p className="leading-relaxed">
            En SURARIO verificamos toponimias con las fuentes cartográficas oficiales del Instituto Geográfico Militar (IGM Chile) e Instituto Geográfico Nacional (IGN Argentina). Para expediciones a zonas remotas (como Cabo Froward o Glaciar Calluqueo), contrata siempre guías de montaña certificados por AAGM o AGMP.
          </p>
        </div>
      </div>

    </div>
  );
};
