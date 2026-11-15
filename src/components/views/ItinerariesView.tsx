import React, { useState } from 'react';
import { ITINERARIES, DESTINATIONS } from '../../data/patagoniaData';
import { Itinerary, Destination, Language, Currency } from '../../types';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Sliders,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
  Route,
  Sparkles,
  Mountain,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { trackEvent } from '../../services/analyticsService';
import { TRANSLATIONS } from '../../utils/i18n';

interface ItinerariesViewProps {
  language?: Language;
  currency?: Currency;
}

export const ItinerariesView: React.FC<ItinerariesViewProps> = ({
  language = 'es',
  currency = 'USD',
}) => {
  const t = TRANSLATIONS[language];
  const [activeItineraryId, setActiveItineraryId] = useState<string>('itinerario-7-dias');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Custom Trip Planner state (conserving 5 to 21 days slider & local storage save & print)
  const [customDays, setCustomDays] = useState<number>(10);
  const [customStart, setCustomStart] = useState<string>('el-calafate');
  const [customStyle, setCustomStyle] = useState<string>('binacional');
  const [customPlanSaved, setCustomPlanSaved] = useState(false);
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(() => {
    try {
      const plan = JSON.parse(localStorage.getItem('surario_custom_plan') || '{}');
      return plan.selectedDestinations || [];
    } catch {
      return [];
    }
  });

  const handleRemoveDestination = (id: string) => {
    const updated = savedDestinationIds.filter((dId: string) => dId !== id);
    setSavedDestinationIds(updated);
    try {
      const current = JSON.parse(localStorage.getItem('surario_custom_plan') || '{}');
      current.selectedDestinations = updated;
      localStorage.setItem('surario_custom_plan', JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  const activeItinerary =
    ITINERARIES.find((it) => it.id === activeItineraryId) || ITINERARIES[0];

  // Logic to generate custom plan breakdown for all regions
  const generateCustomPlan = () => {
    const stops = [];

    if (customStyle === 'carretera-austral') {
      if (customDays <= 7) {
        stops.push({
          dayRange: 'Días 1 a 3',
          location: 'Puerto Montt & Hornopirén / Chaitén (Ruta 7 Norte)',
          focus: 'Navegación por fiordos y senderos de alerces milenarios en Parque Pumalín.',
        });
        stops.push({
          dayRange: `Días 4 a ${customDays}`,
          location: 'Puyuhuapi & P. N. Queulat',
          focus: 'Caminata al Ventisquero Colgante y aguas termales en el fiordo.',
        });
      } else if (customDays <= 12) {
        stops.push({
          dayRange: 'Días 1 a 4',
          location: 'Puerto Varas & Parque Pumalín (Chaitén)',
          focus: 'Volcanes, bosque templado lluvioso y cascadas de deshielo.',
        });
        stops.push({
          dayRange: 'Días 5 a 8',
          location: 'Puyuhuapi & Coyhaique',
          focus: 'Ventisquero Colgante Queulat, Cuesta del Queulat y Reserva Río Simpson.',
        });
        stops.push({
          dayRange: `Días 9 a ${customDays}`,
          location: 'Puerto Río Tranquilo & Capillas de Mármol',
          focus: 'Navegación en kayak por cavernas de mármol y avistamiento del Glaciar Exploradores.',
        });
      } else {
        stops.push({
          dayRange: 'Días 1 a 5',
          location: 'Puerto Montt a Puyuhuapi (Carretera Austral Norte)',
          focus: 'Transbordadores por fiordos, Pumalín y Glaciar Colgante Queulat.',
        });
        stops.push({
          dayRange: 'Días 6 a 11',
          location: 'Coyhaique, Río Tranquilo & Capillas de Mármol',
          focus: 'Lago General Carrera, cuevas de mármol y Valle Exploradores.',
        });
        stops.push({
          dayRange: 'Días 12 a 16',
          location: 'Cochrane & Glaciar Calluqueo (Monte San Lorenzo)',
          focus: 'Parque Nacional Patagonia (Valle Chacabuco) y laguna del glaciar.',
        });
        stops.push({
          dayRange: `Días 17 a ${customDays}`,
          location: 'Caleta Tortel & Villa O’Higgins (Fin de la Ruta 7)',
          focus: 'Pasarelas de madera de ciprés de las Guaitecas y Glaciar O’Higgins.',
        });
      }
    } else if (customStyle === 'lagos-volcanes') {
      if (customDays <= 7) {
        stops.push({
          dayRange: 'Días 1 a 3',
          location: 'San Carlos de Bariloche & Nahuel Huapi (Argentina)',
          focus: 'Circuito Chico, Cerro Campanario y navegación a Bosque de Arrayanes.',
        });
        stops.push({
          dayRange: `Días 4 a ${customDays}`,
          location: 'San Martín de los Andes & Ruta de los 7 Lagos',
          focus: 'Travesía escénica por lagos Correntoso, Espejo, Falkner y Parque Nacional Lanín.',
        });
      } else {
        stops.push({
          dayRange: 'Días 1 a 4',
          location: 'Puerto Varas & Petrohué (Chile)',
          focus: 'Volcán Osorno, Saltos del Petrohué y Lago Todos los Santos.',
        });
        stops.push({
          dayRange: 'Días 5 a 8',
          location: 'Cruce Andino a Bariloche & Villa La Angostura',
          focus: 'Paso Cardenal Samoré, Circuito Chico y refugios de montaña.',
        });
        stops.push({
          dayRange: `Días 9 a ${customDays}`,
          location: 'Ruta 7 Lagos, San Martín & P. N. Los Alerces',
          focus: 'Alerzales milenarios de 2.600 años y lagos glaciares cristalinos.',
        });
      }
    } else {
      // Default / Binacional & Glaciares
      if (customDays <= 7) {
        stops.push({
          dayRange: 'Días 1 a 3',
          location: 'El Calafate & Glaciar Perito Moreno (Argentina)',
          focus: 'Pasarelas del glaciar, navegación entre témpanos y Reserva Laguna Nimez.',
        });
        stops.push({
          dayRange: `Días 4 a ${customDays}`,
          location: 'El Chaltén (Capital Nacional del Trekking)',
          focus: 'Senderos al Fitz Roy (Laguna de los Tres) y Laguna Torre.',
        });
      } else if (customDays <= 12) {
        stops.push({
          dayRange: 'Días 1 a 3',
          location: 'El Calafate (Argentina)',
          focus: 'Glaciar Perito Moreno y centro de interpretación Glaciarium.',
        });
        stops.push({
          dayRange: 'Días 4 a 7',
          location: 'El Chaltén (Argentina)',
          focus: 'Senderismo de montaña, Laguna de los Tres y Chorrillo del Salto.',
        });
        stops.push({
          dayRange: `Días 8 a ${customDays}`,
          location: 'Puerto Natales & Torres del Paine (Chile)',
          focus: 'Cruce internacional por Paso Don Guillermo, Mirador Base Torres y Lago Pehoé.',
        });
      } else {
        stops.push({
          dayRange: 'Días 1 a 4',
          location: 'San Carlos de Bariloche & Ruta 7 Lagos (Argentina)',
          focus: 'Lagos Nahuel Huapi y Moreno, Circuito Chico y senderos de bosque andino.',
        });
        stops.push({
          dayRange: 'Días 5 a 9',
          location: 'El Calafate & El Chaltén (Santa Cruz)',
          focus: 'Perito Moreno y caminata cumbre al pie del Monte Fitz Roy.',
        });
        stops.push({
          dayRange: 'Días 10 a 14',
          location: 'Torres del Paine & Puerto Natales (Chile)',
          focus: 'Mirador Cuernos del Paine, Glaciar Grey y senderos de estepa austral.',
        });
        stops.push({
          dayRange: `Días 15 a ${customDays}`,
          location: 'Punta Arenas, Estrecho de Magallanes & Ushuaia (Fin del Mundo)',
          focus: 'Canal Beagle, Parque Nacional Tierra del Fuego y pingüineras australes.',
        });
      }
    }

    return stops;
  };

  const handleSaveCustomPlan = () => {
    try {
      const plan = {
        days: customDays,
        start: customStart,
        style: customStyle,
        selectedDestinations: savedDestinationIds,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('surario_custom_plan', JSON.stringify(plan));
      setCustomPlanSaved(true);
      setTimeout(() => setCustomPlanSaved(false), 3000);

      trackEvent('itinerary_created', {
        days_count: customDays,
        destinations_count: savedDestinationIds.length,
        travel_style: customStyle,
        starting_point: customStart,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const customPlanStops = generateCustomPlan();
  const pinnedDestinations: Destination[] = savedDestinationIds
    .map((id: string) => DESTINATIONS.find((d: Destination) => d.id === id))
    .filter((d: Destination | undefined): d is Destination => Boolean(d));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title & SEO Hierarchy */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <Route className="w-4 h-4 text-[#D4A373]" />
          <span>{language === 'en' ? 'SURARIO · Master Routes & Itineraries' : 'SURARIO · Rutas e Itinerarios Maestros'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {t.itinerariesMasterTitle}
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-light">
          {t.itinerariesMasterDesc}
        </p>
      </div>

      {/* Tabs for Curated Itineraries */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-1.5 bg-stone-200/70 rounded-2xl overflow-x-auto max-w-3xl">
          {ITINERARIES.map((it) => (
            <button
              key={it.id}
              onClick={() => {
                setActiveItineraryId(it.id);
                setExpandedDay(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeItineraryId === it.id
                  ? 'bg-[#142B1F] text-white shadow-xs'
                  : 'text-stone-700 hover:text-[#142B1F]'
              }`}
            >
              <span>{it.days} {t.daysLabel}: {it.title}</span>
            </button>
          ))}
        </div>

        {/* Active Itinerary Presentation */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div className="space-y-3 border-b border-stone-200 pb-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider font-semibold text-[#2C7A9C]">
              <span>{language === 'en' ? 'Duration' : 'Duración'}: {activeItinerary.days} {t.daysLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{language === 'en' ? 'Countries' : 'Países'}: {activeItinerary.countries.join(' & ')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500 font-normal">{activeItinerary.idealFor}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
              {activeItinerary.title}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-serif max-w-4xl">
              {activeItinerary.summary}
            </p>
          </div>

          {/* Highlights & Logistics strips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                {language === 'en' ? 'Route Highlights' : 'Puntos Fuertes de la Ruta'}
              </span>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {activeItinerary.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2C7A9C] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-300 space-y-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#142B1F] block">
                {language === 'en' ? 'Transport & Budget Advice' : 'Transporte & Consejos de Presupuesto'}
              </span>
              <p className="text-stone-700 leading-relaxed">
                <strong className="text-stone-900">{language === 'en' ? 'Transport:' : 'Transporte:'}</strong> {activeItinerary.transportAdvice}
              </p>
              <p className="text-stone-700 leading-relaxed pt-1">
                <strong className="text-stone-900">{language === 'en' ? 'Budget tip:' : 'Ahorro:'}</strong> {activeItinerary.budgetTip}
              </p>
            </div>
          </div>

          {/* Day by Day Accordion / Timeline */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm uppercase font-semibold tracking-widest text-stone-500">
              {t.dayByDay}
            </h3>

            <div className="space-y-3">
              {activeItinerary.stops.map((stop) => {
                const isOpen = expandedDay === stop.dayNumber;
                return (
                  <div
                    key={stop.dayNumber}
                    className="border border-stone-200 rounded-2xl overflow-hidden transition-colors bg-[#FAF8F5]"
                  >
                    <button
                      onClick={() => setExpandedDay(isOpen ? null : stop.dayNumber)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-100/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-full bg-[#142B1F] text-[#D4A373] flex items-center justify-center font-bold text-xs shrink-0">
                          {stop.dayNumber}
                        </span>
                        <div>
                          <span className="text-xs text-[#2C7A9C] uppercase font-semibold tracking-wider block">
                            {stop.location}
                          </span>
                          <span className="text-sm sm:text-base font-serif font-bold text-stone-900">
                            {stop.title}
                          </span>
                        </div>
                      </div>
                      <div className="text-stone-500">
                        {isOpen ? <ChevronUp className="w-5 h-5 text-[#142B1F]" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 pt-0 sm:pl-16 space-y-3 text-xs sm:text-sm text-stone-700 border-t border-stone-200/60 bg-white">
                        <p className="leading-relaxed mt-3 font-serif">
                          {stop.description}
                        </p>
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                          <strong className="text-stone-800">{language === 'en' ? 'SURARIO Tip:' : 'Sugerencia SURARIO:'}</strong>{' '}
                          {stop.activitySuggestion}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Custom Route Planner (Branded for SURARIO) */}
      <section className="bg-[#142B1F] text-white rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl border border-[#1C3D2C]">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4A373]">
            <Sliders className="w-4 h-4 text-[#D4A373]" />
            <span>{language === 'en' ? 'SURARIO Trip Planner' : 'Planificador de Viajes SURARIO'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {language === 'en' ? 'Design Your Custom Austral Route (5 to 21 Days)' : 'Diseña tu Propia Ruta Austral (5 a 21 Días)'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            {language === 'en'
              ? 'Adjust your trip length, style, and starting gateway to automatically calculate a realistic itinerary across Patagonia.'
              : 'Ajusta los días disponibles, la temática y el punto de partida para calcular automáticamente una distribución equilibrada de etapas por toda la Patagonia.'}
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#0E1E16] rounded-2xl border border-[#1C3D2C]">
          
          {/* Days slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-300">
              <label htmlFor="planner-days-slider">{t.tripDuration}</label>
              <span className="text-[#D4A373] text-sm font-bold">{customDays} {t.daysLabel}</span>
            </div>
            <input
              id="planner-days-slider"
              type="range"
              min={5}
              max={21}
              value={customDays}
              onChange={(e) => setCustomDays(Number(e.target.value))}
              className="w-full accent-[#D4A373] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>5 {t.daysLabel}</span>
              <span>12 {t.daysLabel}</span>
              <span>21 {t.daysLabel} ({language === 'en' ? 'Grand Traverse' : 'Travesía total'})</span>
            </div>
          </div>

          {/* Starting point */}
          <div className="space-y-2">
            <label htmlFor="planner-start-select" className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
              {t.startingPoint}
            </label>
            <select
              id="planner-start-select"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full text-xs sm:text-sm bg-[#142B1F] border border-[#1C3D2C] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4A373] cursor-pointer"
            >
              <option value="puerto-montt">{language === 'en' ? 'Puerto Montt / Puerto Varas (Northern Chile)' : 'Puerto Montt / Puerto Varas (Chile Norte)'}</option>
              <option value="bariloche">{language === 'en' ? 'Bariloche (Lakes & Andean Forests)' : 'Bariloche (Lagos y Bosques Andinos)'}</option>
              <option value="coyhaique">{language === 'en' ? 'Coyhaique (Carretera Austral Aysén)' : 'Coyhaique (Carretera Austral Aysén)'}</option>
              <option value="el-calafate">{language === 'en' ? 'El Calafate (Glacier Gateway)' : 'El Calafate (Portal de los Glaciares)'}</option>
              <option value="puerto-natales">Puerto Natales (Torres del Paine)</option>
              <option value="ushuaia">{language === 'en' ? 'Ushuaia (Tierra del Fuego · End of the World)' : 'Ushuaia (Tierra del Fuego · Fin del Mundo)'}</option>
            </select>
          </div>

          {/* Route Style */}
          <div className="space-y-2">
            <label htmlFor="planner-style-select" className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
              {t.travelStyle}
            </label>
            <select
              id="planner-style-select"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              className="w-full text-xs sm:text-sm bg-[#142B1F] border border-[#1C3D2C] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4A373] cursor-pointer"
            >
              <option value="binacional">{t.styleBinational}</option>
              <option value="carretera-austral">{t.styleCarreteraAustral}</option>
              <option value="lagos-volcanes">{t.styleLagosNorte}</option>
            </select>
          </div>
        </div>

        {/* Generated Custom Plan Result */}
        <div className="bg-[#0A1710] p-6 rounded-2xl border border-[#1C3D2C] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C3D2C] pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#D4A373] font-semibold">
                {language === 'en' ? 'Itinerary Generated by SURARIO' : 'Itinerario Generado por SURARIO'}
              </span>
              <h3 className="text-lg font-serif font-bold text-white">
                {language === 'en' ? `Optimized ${customDays}-Day Route` : `Ruta Optimizada de ${customDays} Días`}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCustomPlan}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#142B1F] hover:bg-[#1E3F30] text-stone-200 text-xs rounded-lg border border-[#1C3D2C] transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>{customPlanSaved ? t.planSavedAlert : t.saveCustomPlan}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#142B1F] hover:bg-[#1E3F30] text-stone-200 text-xs rounded-lg border border-[#1C3D2C] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printItinerary}</span>
              </button>
            </div>
          </div>

          {/* Pinned Destinations from Map & Cards */}
          {pinnedDestinations.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0F241A] border border-[#1C3D2C] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.pinnedDestinations} ({pinnedDestinations.length})</span>
                </span>
                <span className="text-[11px] text-stone-400">
                  {language === 'en' ? 'Integrated as suggested highlights in your route' : 'Se integran como hitos sugeridos en tu ruta'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {pinnedDestinations.map((dest: Destination) => (
                  <div
                    key={dest.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#142B1F] border border-[#1C3D2C] text-xs text-white group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-stone-900 shrink-0">
                        <SafeImage
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-[#D4A373] block truncate">
                          {dest.region}
                        </span>
                        <h5 className="font-serif font-bold text-white truncate">
                          {dest.name}
                        </h5>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDestination(dest.id)}
                      className="p-1 text-stone-400 hover:text-rose-400 transition-colors ml-2 cursor-pointer shrink-0"
                      title={language === 'en' ? 'Remove from my route' : 'Quitar de mi ruta'}
                      aria-label={`Quitar ${dest.name} de mi ruta`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {customPlanStops.map((stop, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#142B1F]/90 border border-[#1C3D2C] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider block">
                    {stop.dayRange}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-1">
                    {stop.location}
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed font-light mt-1">
                    {stop.focus}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#1C3D2C]/60 flex items-center justify-between text-[11px] text-[#D4A373]">
                  <span>{language === 'en' ? `Stage #${idx + 1}` : `Etapa #${idx + 1}`}</span>
                  <span className="flex items-center gap-1 font-medium">
                    {language === 'en' ? 'View on map' : 'Ver en mapa cartográfico'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Honest Logistical Disclaimer */}
          <div className="p-4 bg-[#07120D] border border-[#1C3D2C] rounded-xl text-xs text-stone-300 space-y-1.5 font-light">
            <strong className="text-[#D4A373] font-semibold block">
              {language === 'en'
                ? 'Notice on distances, transit times, and border crossings in Patagonia:'
                : 'Aviso sobre distancias, traslados y pasos fronterizos en la Patagonia:'}
            </strong>
            <p className="leading-relaxed">
              {language === 'en'
                ? 'In Patagonia, kilometer distance does not equal standard highway driving time due to gravel road sections, sudden crosswinds exceeding 80 km/h, and seasonal ferry frequencies (such as Caleta Tortel, Hornopirén, or Primera Angostura in Magellan). We strongly advise avoiding ticket connections with less than 4 hours between international border controls.'
                : 'En la Patagonia las distancias kilométricas no equivalen a tiempos de conducción estándar debido a tramos de ripio, vientos cruzados de más de 80 km/h y frecuencias de barcazas estacionales (como en Caleta Tortel, Hornopirén o Primera Angostura en Magallanes). No compres pasajes con conexiones ajustadas de menos de 4 horas entre aduanas.'}
            </p>
          </div>

          <p className="text-[11px] text-stone-500 pt-1 font-light">
            {language === 'en'
              ? 'Secure storage: This trip plan is saved locally in your browser memory (localStorage) with no account or fees required.'
              : 'Almacenamiento seguro: Este plan se almacena localmente en la memoria de tu navegador (localStorage) sin cuentas ni coste alguno.'}
          </p>
        </div>
      </section>

    </div>
  );
};
