import React, { useState } from 'react';
import { ACTIVITIES, DESTINATIONS } from '../../data/patagoniaData';
import { Activity, Language, Currency } from '../../types';
import { Search, Footprints, Clock, Mountain, ArrowRight, Info, Compass } from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { convertPrice } from '../../utils/i18n';

interface ActivitiesViewProps {
  onSelectActivity: (act: Activity) => void;
  initialDestinationFilter?: string;
  language?: Language;
  currency?: Currency;
  activities?: Activity[];
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  onSelectActivity,
  initialDestinationFilter,
  language = 'es',
  currency = 'USD',
  activities,
}) => {
  const [destinationFilter, setDestinationFilter] = useState<string>(
    initialDestinationFilter && initialDestinationFilter !== 'todos'
      ? initialDestinationFilter
      : 'todos'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = activities && activities.length > 0 ? activities : ACTIVITIES;

  const filteredActivities = currentList.filter((act) => {
    // Only show published items to public visitors
    if (act.published === false) return false;
    const matchesDest =
      destinationFilter === 'todos' || act.destinationId === destinationFilter;
    const matchesCat =
      categoryFilter === 'todos' || act.category === categoryFilter;
    const matchesDiff =
      difficultyFilter === 'todos' || act.difficulty === difficultyFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDest && matchesCat && matchesDiff && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title & SEO Hierarchy */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <Footprints className="w-4 h-4 text-[#D4A373]" />
          <span>SURARIO · Qué Hacer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Qué Hacer en la Patagonia: Excursiones & Actividades
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-light">
          Senderismo frente a agujas de granito, caminatas con grampones sobre campos de hielo, navegaciones entre colonias de pingüinos y rutas panorámicas por los Andes australes.
        </p>
      </div>

      {/* Info notice */}
      <div className="p-4 sm:p-5 bg-white border border-stone-300 rounded-2xl flex items-start gap-3.5 text-xs text-stone-800 shadow-2xs">
        <Info className="w-5 h-5 text-[#2C7A9C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-stone-900">Información editorial de referencia en SURARIO:</strong>
          <p className="text-stone-600 leading-relaxed">
            Las estimaciones de dificultad y duración te ayudan a organizar las etapas del viaje. En la Patagonia muchos senderos de montaña son públicos y autoguiados de acceso libre, mientras que las expediciones sobre glaciares o navegaciones requieren operadores autorizados por Parques Nacionales.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Destination */}
          <div>
            <label htmlFor="act-dest-filter" className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Destino
            </label>
            <select
              id="act-dest-filter"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#142B1F] cursor-pointer"
            >
              <option value="todos">Todos los destinos</option>
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="act-cat-filter" className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Categoría de Actividad
            </label>
            <select
              id="act-cat-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#142B1F] cursor-pointer"
            >
              <option value="todos">Todas las categorías</option>
              <option value="trekking">Trekking y Senderismo</option>
              <option value="glaciares">Glaciares e Hielo</option>
              <option value="navegacion">Navegación Austral</option>
              <option value="rutas">Rutas Panorámicas</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="act-diff-filter" className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Nivel de Dificultad
            </label>
            <select
              id="act-diff-filter"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#142B1F] cursor-pointer"
            >
              <option value="todos">Cualquier dificultad</option>
              <option value="Baja">Baja (Paseos y Navegaciones)</option>
              <option value="Moderada">Moderada (Caminatas de 4-6h)</option>
              <option value="Exigente">Exigente (Trekking de morrena y altura)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Búsqueda
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Fitz Roy, pingüinos, catamarán..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F]"
              />
            </div>
          </div>
        </div>

        {/* Clear filter bar */}
        {(destinationFilter !== 'todos' ||
          categoryFilter !== 'todos' ||
          difficultyFilter !== 'todos' ||
          searchQuery !== '') && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
            <span>Mostrando {filteredActivities.length} actividades disponibles</span>
            <button
              onClick={() => {
                setDestinationFilter('todos');
                setCategoryFilter('todos');
                setDifficultyFilter('todos');
                setSearchQuery('');
              }}
              className="text-[#142B1F] underline font-medium cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            onClick={() => onSelectActivity(act)}
            className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Photo */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                <SafeImage
                  src={act.image}
                  alt={`Excursión ${act.title} en ${act.destinationName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-xs text-white font-medium">
                  {act.destinationName}
                </div>
                <div className="absolute top-3 right-3 bg-[#142B1F]/85 backdrop-blur-xs text-[#D4A373] text-xs px-2.5 py-1 rounded font-medium">
                  {act.categoryLabel}
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{act.duration}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-stone-400" />
                    <span>Dificultad: {act.difficulty}</span>
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {act.shortDescription}
                </p>
              </div>
            </div>

            {/* Bottom price and CTA */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <div className="flex items-baseline gap-1.5 flex-wrap max-w-[220px]">
                <span className="font-semibold text-stone-800">
                  {act.indicativePrice}
                </span>
                {currency !== 'USD' && (
                  <span className="text-[11px] font-semibold text-[#2C7A9C]">
                    (~{convertPrice(act.priceInLocalCurrency?.amount || (act.country === 'Argentina' ? 85000 : 70000), act.country === 'Argentina' ? 'ARS' : 'CLP', currency).text})
                  </span>
                )}
              </div>
              <span className="font-semibold text-[#142B1F] group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                {language === 'en' ? 'Activity Guide' : 'Ver Guía'} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
          <p className="text-sm font-medium">No se encontraron actividades con estos criterios de búsqueda.</p>
          <button
            onClick={() => {
              setDestinationFilter('todos');
              setCategoryFilter('todos');
              setDifficultyFilter('todos');
              setSearchQuery('');
            }}
            className="text-xs text-[#142B1F] underline font-medium cursor-pointer"
          >
            Ver todas las actividades
          </button>
        </div>
      )}

    </div>
  );
};
