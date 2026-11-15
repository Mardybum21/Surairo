import React, { useState } from 'react';
import { ACCOMMODATIONS, DESTINATIONS } from '../../data/patagoniaData';
import { Accommodation, Language, Currency } from '../../types';
import { Search, Star, BedDouble, Check, ArrowRight, Info } from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { convertPrice } from '../../utils/i18n';

interface AccommodationsViewProps {
  onSelectAccommodation: (acc: Accommodation) => void;
  initialDestinationFilter?: string;
  language?: Language;
  currency?: Currency;
  accommodations?: Accommodation[];
}

export const AccommodationsView: React.FC<AccommodationsViewProps> = ({
  onSelectAccommodation,
  initialDestinationFilter,
  language = 'es',
  currency = 'USD',
  accommodations,
}) => {
  const [destinationFilter, setDestinationFilter] = useState<string>(
    initialDestinationFilter && initialDestinationFilter !== 'todos'
      ? initialDestinationFilter
      : 'todos'
  );
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [priceFilter, setPriceFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = accommodations && accommodations.length > 0 ? accommodations : ACCOMMODATIONS;

  const filteredAccommodations = currentList.filter((acc) => {
    // Only show published items to public visitors
    if (acc.published === false) return false;
    const matchesDest =
      destinationFilter === 'todos' || acc.destinationId === destinationFilter;
    const matchesType = typeFilter === 'todos' || acc.type === typeFilter;
    const matchesPrice =
      priceFilter === 'todos' || acc.priceRange === priceFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDest && matchesType && matchesPrice && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title & SEO Hierarchy */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <BedDouble className="w-4 h-4 text-[#D4A373]" />
          <span>SURARIO · Dónde Dormir</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Dónde Dormir en la Patagonia
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-light">
          Selección de hoteles boutique, eco-lodges, cabañas de madera con chimenea y hostales de montaña para senderistas. Filtra por destino, tipología y presupuesto orientativo.
        </p>
      </div>

      {/* Honest Transparency Banner */}
      <div className="p-4 sm:p-5 bg-white border border-stone-300 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-stone-800 shadow-2xs">
        <Info className="w-5 h-5 text-[#2C7A9C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-900">
            Aviso de datos de demostración editorial en SURARIO:
          </p>
          <p className="text-stone-600 leading-relaxed text-xs">
            Las fichas de este directorio representan modelos y ejemplos reales de la infraestructura patagónica para la primera versión de la plataforma. No reflejan disponibilidad ni precios en tiempo real; para reservas formales se recomienda contactar con las cámaras de turismo locales y prestadores habilitados.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Destination filter */}
          <div>
            <label htmlFor="acc-dest-filter" className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Destino
            </label>
            <select
              id="acc-dest-filter"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#142B1F] cursor-pointer"
            >
              <option value="todos">Todos los destinos</option>
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.country})
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label htmlFor="acc-type-filter" className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Tipo de Alojamiento
            </label>
            <select
              id="acc-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#142B1F] cursor-pointer"
            >
              <option value="todos">Todos los tipos</option>
              <option value="hotel">Hoteles & Lodges</option>
              <option value="cabana">Cabañas & Domos</option>
              <option value="hostal">Hostales de Montaña</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label htmlFor="acc-price-filter" className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Rango Orientativo
            </label>
            <select
              id="acc-price-filter"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#142B1F] cursor-pointer"
            >
              <option value="todos">Cualquier presupuesto</option>
              <option value="Económico">Económico (Hostales / Refugios)</option>
              <option value="Medio">Medio (Cabañas / Hosterías)</option>
              <option value="Premium">Premium (Eco-Lodges / Vistas)</option>
            </select>
          </div>

          {/* Search text */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-stone-500 mb-1.5">
              Palabra Clave
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, lago o servicio..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F]"
              />
            </div>
          </div>
        </div>

        {/* Clear filters shortcut */}
        {(destinationFilter !== 'todos' ||
          typeFilter !== 'todos' ||
          priceFilter !== 'todos' ||
          searchQuery !== '') && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
            <span>Mostrando {filteredAccommodations.length} alojamientos filtrados</span>
            <button
              onClick={() => {
                setDestinationFilter('todos');
                setTypeFilter('todos');
                setPriceFilter('todos');
                setSearchQuery('');
              }}
              className="text-[#142B1F] underline font-medium cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid of accommodations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAccommodations.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onSelectAccommodation(acc)}
            className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                <SafeImage
                  src={acc.image}
                  alt={`Alojamiento ${acc.name} en ${acc.destinationName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-xs text-white font-medium">
                  {acc.destinationName}
                </div>
                <div className="absolute top-3 right-3 bg-[#142B1F]/85 backdrop-blur-xs text-[#D4A373] text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{acc.rating}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span className="font-semibold text-stone-700">{acc.typeLabel}</span>
                    <span>{acc.priceRange}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                    {acc.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {acc.shortDescription}
                  </p>
                </div>

                {/* Amenities pills */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="text-[11px] text-stone-600 space-y-1">
                    {acc.amenities.slice(0, 3).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase text-stone-400 block font-medium">
                  {language === 'en' ? 'Indicative rate' : 'Tarifa orientativa'}
                </span>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-semibold text-stone-900">{acc.indicativePrice}</span>
                  {currency !== 'USD' && (
                    <span className="text-[11px] font-semibold text-[#2C7A9C]">
                      (~{convertPrice(acc.priceInLocalCurrency?.amount || (acc.country === 'Argentina' ? 145000 : 120000), acc.country === 'Argentina' ? 'ARS' : 'CLP', currency).text})
                    </span>
                  )}
                </div>
              </div>
              <span className="font-semibold text-[#142B1F] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                {language === 'en' ? 'View Details' : 'Ver Detalles'} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredAccommodations.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
          <p className="text-sm font-medium">No se encontraron alojamientos con los filtros seleccionados.</p>
          <button
            onClick={() => {
              setDestinationFilter('todos');
              setTypeFilter('todos');
              setPriceFilter('todos');
              setSearchQuery('');
            }}
            className="text-xs text-[#142B1F] underline font-medium cursor-pointer"
          >
            Limpiar filtros y ver todos los alojamientos
          </button>
        </div>
      )}

    </div>
  );
};
