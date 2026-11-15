import React, { useState, useEffect } from 'react';
import { Destination, Accommodation, Activity, PageId, DestinationWeatherData, Language, Currency } from '../types';
import { X, Calendar, Cloud, Compass, MapPin, CheckCircle, ArrowRight, BedDouble, Footprints, ExternalLink, ShieldCheck, AlertCircle, Mountain, PlusCircle, Check, Wind, Droplets, Info, ShieldAlert } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { fetchRealtimeWeather } from '../services/weatherService';
import { trackEvent } from '../services/analyticsService';
import { TRANSLATIONS } from '../utils/i18n';
import { DestinationAffiliateSections } from './affiliate/DestinationAffiliateSections';

interface DestinationModalProps {
  destination: Destination | null;
  accommodations: Accommodation[];
  activities: Activity[];
  language?: Language;
  currency?: Currency;
  onClose: () => void;
  onSelectAccommodation: (acc: Accommodation) => void;
  onSelectActivity: (act: Activity) => void;
  onNavigate: (page: PageId) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  accommodations,
  activities,
  language = 'es',
  currency = 'USD',
  onClose,
  onSelectAccommodation,
  onSelectActivity,
  onNavigate,
}) => {
  const [addedToRoute, setAddedToRoute] = useState(false);
  const [weatherData, setWeatherData] = useState<DestinationWeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!destination) return;

    // Track analytics
    trackEvent('view_destination', {
      destination_id: destination.id,
      destination_name: destination.name,
      country: destination.country,
      region: destination.region,
    });

    if (destination.coordinates) {
      setLoadingWeather(true);
      fetchRealtimeWeather(
        destination.id,
        destination.name,
        destination.coordinates.lat,
        destination.coordinates.lng,
        language
      ).then((data) => {
        setWeatherData(data);
        setLoadingWeather(false);
        trackEvent('weather_view', {
          destination_id: destination.id,
          destination_name: destination.name,
        });
      }).catch(() => {
        setLoadingWeather(false);
      });
    }
  }, [destination, language]);

  if (!destination) return null;

  const handleAddToRoute = () => {
    try {
      const currentPlan = JSON.parse(localStorage.getItem('surario_custom_plan') || '{}');
      const currentStops = currentPlan.selectedDestinations || [];
      if (!currentStops.includes(destination.id)) {
        currentPlan.selectedDestinations = [...currentStops, destination.id];
        localStorage.setItem('surario_custom_plan', JSON.stringify(currentPlan));
      }
      setAddedToRoute(true);
      setTimeout(() => setAddedToRoute(false), 2500);
    } catch {
      setAddedToRoute(true);
    }
  };

  const destinationAccommodations = accommodations.filter(
    (a) => a.destinationId === destination.id
  );
  const destinationActivities = activities.filter(
    (a) => a.destinationId === destination.id
  );

  const osmUrl = destination.coordinates
    ? `https://www.openstreetmap.org/?mlat=${destination.coordinates.lat}&mlon=${destination.coordinates.lng}#map=11/${destination.coordinates.lat}/${destination.coordinates.lng}`
    : null;

  const displayName = language === 'en' && destination.nameEn ? destination.nameEn : destination.name;
  const displayTagline = language === 'en' && destination.taglineEn ? destination.taglineEn : destination.tagline;
  const displayOverview = language === 'en' && destination.fullOverviewEn ? destination.fullOverviewEn : destination.fullOverview;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-dest-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF8F5] text-stone-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer shadow-lg"
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-stone-900">
          <SafeImage
            src={destination.image}
            alt={displayName}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs tracking-widest uppercase font-semibold text-amber-300">
              <span>{destination.country}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.region}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.altitude}</span>
              {destination.isRemote && (
                <span className="ml-2 bg-amber-500/90 text-stone-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {language === 'es' ? 'Acceso Remoto' : 'Remote Access'}
                </span>
              )}
              {destination.accessType && (
                <span className="bg-stone-800/80 text-stone-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                  {destination.accessType}
                </span>
              )}
            </div>
            <h2
              id="modal-dest-title"
              className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight"
            >
              {displayName}
            </h2>
            <p className="text-sm sm:text-base text-stone-200 font-light max-w-2xl leading-relaxed">
              {displayTagline}
            </p>
          </div>

          <div className="absolute top-4 left-4 z-10 text-[11px] text-stone-200 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
            Foto: {destination.photoCredit}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-10 space-y-8 max-h-[calc(85vh-18rem)] overflow-y-auto">
          {/* Status & Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs uppercase font-semibold tracking-widest text-stone-500">
                {t.overviewTab} & Contexto Geográfico
              </h3>
              
              {/* Verification status badge */}
              {destination.verificationStatus === 'Verificado Oficial' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">{t.verifiedOfficial}</span>
                </div>
              )}
              {destination.verificationStatus === 'Pendiente de verificación en terreno' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">{t.pendingVerification}</span>
                </div>
              )}
              {destination.verificationStatus === 'Paso estacional' && (
                <div className="flex items-center gap-1.5 text-xs text-sky-900 bg-sky-50 border border-sky-300 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-medium">{t.seasonalAccess}</span>
                </div>
              )}
            </div>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-light font-serif">
              {displayOverview}
            </p>

            {destination.verificationNote && (
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{destination.verificationNote}</span>
              </div>
            )}
          </div>

          {/* Real-time Weather Widget (Open-Meteo) */}
          <div className="p-5 bg-gradient-to-br from-stone-900 to-[#142B1F] text-white rounded-xl shadow-md border border-stone-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="text-xs uppercase font-semibold tracking-wider text-stone-200">
                  {t.weatherTitle}
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                  Open-Meteo Satelital
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                {destination.coordinates ? `${destination.coordinates.lat.toFixed(2)}° S, ${Math.abs(destination.coordinates.lng).toFixed(2)}° W` : ''}
              </span>
            </div>

            {loadingWeather ? (
              <div className="py-6 text-center text-xs text-stone-400 animate-pulse">
                Conectando con estaciones meteorológicas satelitales...
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Temperatura</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold font-serif text-white">{weatherData.current.temperature}°C</span>
                    </div>
                    <span className="text-[11px] text-stone-300">{weatherData.current.conditionText}</span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">{t.weatherApparent}</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold font-serif text-amber-300">{weatherData.current.apparentTemperature}°C</span>
                    </div>
                    <span className="text-[11px] text-stone-400">Viento patagónico</span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 uppercase tracking-wider">
                      <Wind className="w-3 h-3 text-sky-300" />
                      <span>{t.weatherWind} & Ráfagas</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold font-serif text-white">{weatherData.current.windSpeed}</span>
                      <span className="text-xs text-stone-300">km/h</span>
                    </div>
                    <span className="text-[11px] text-amber-400 font-medium">Ráfagas: {weatherData.current.windGusts} km/h</span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 uppercase tracking-wider">
                      <Droplets className="w-3 h-3 text-sky-400" />
                      <span>{t.weatherRain}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold font-serif text-white">{weatherData.current.precipitation}</span>
                      <span className="text-xs text-stone-300">mm</span>
                    </div>
                    <span className="text-[11px] text-stone-300">Tiempo real</span>
                  </div>
                </div>

                {/* 3-day forecast */}
                {weatherData.daily.length > 0 && (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-stone-400 font-medium">{t.weatherForecast3d}:</span>
                    <div className="flex items-center gap-4">
                      {weatherData.daily.map((day, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded">
                          <span className="text-stone-300 font-mono text-[11px]">{day.date.slice(5)}</span>
                          <span className="text-white font-bold">{day.maxTemp}° / {day.minTemp}°</span>
                          <span className="text-[11px] text-sky-300">{day.conditionText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-[11px] text-amber-200/90 italic">
                  💡 {t.weatherWarning}
                </p>
              </div>
            ) : (
              <div className="text-xs text-stone-400">
                {destination.weather}
              </div>
            )}
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-stone-100 rounded-xl border border-stone-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{t.bestSeason}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {destination.bestSeason}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 uppercase tracking-wide">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>{t.recommendedDays}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {destination.recommendedDays} a {destination.recommendedDays + 2} {language === 'es' ? 'días sugeridos' : 'suggested days'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 uppercase tracking-wide">
                <Mountain className="w-4 h-4 text-stone-700" />
                <span>{t.physicalDemand}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {destination.physicalDemand}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                <span>{t.technicalDemand}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {destination.technicalDemand || 'Baja / Senderismo básico'}
              </p>
            </div>
          </div>

          {/* On-site services and emergency plan */}
          {destination.services && (
            <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-3">
              <h4 className="text-xs uppercase font-semibold tracking-widest text-stone-600">
                {t.servicesTitle}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded border ${destination.services.drinkingWater ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                  <span className="font-semibold block">{destination.services.drinkingWater ? '💧 Agua potable' : '⚠️ Sin agua potable'}</span>
                  <span className="text-[11px] text-stone-500">{destination.services.drinkingWater ? t.waterAvailable : t.noWater}</span>
                </div>
                <div className={`p-2.5 rounded border ${destination.services.cellSignal ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                  <span className="font-semibold block">{destination.services.cellSignal ? '📶 Cobertura móvil' : '📵 Zona aislada'}</span>
                  <span className="text-[11px] text-stone-500">{destination.services.cellSignal ? t.cellSignalYes : t.cellSignalNo}</span>
                </div>
                <div className={`p-2.5 rounded border ${destination.services.rangers ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                  <span className="font-semibold block">{destination.services.rangers ? '🛡️ Guardaparques' : '🌲 Agreste'}</span>
                  <span className="text-[11px] text-stone-500">{destination.services.rangers ? t.rangersYes : t.rangersNo}</span>
                </div>
                <div className={`p-2.5 rounded border ${destination.services.shelters ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                  <span className="font-semibold block">{destination.services.shelters ? '🏕️ Refugios / Camping' : '🚫 Sin refugios'}</span>
                  <span className="text-[11px] text-stone-500">{destination.services.shelters ? t.sheltersYes : 'Travesía autónoma'}</span>
                </div>
              </div>
              {destination.services.emergencyEvac && (
                <div className="text-[11px] text-stone-600 pt-2 border-t border-stone-100 flex items-center gap-1.5">
                  <span className="font-semibold text-stone-800">Plan de evacuación médica:</span>
                  <span>{destination.services.emergencyEvac}</span>
                </div>
              )}
            </div>
          )}

          {/* Essential gear required */}
          {destination.minEquipment && destination.minEquipment.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-semibold tracking-widest text-stone-500">
                {t.minEquipment}
              </h4>
              <div className="flex flex-wrap gap-2">
                {destination.minEquipment.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-800 border border-stone-200 rounded-md text-xs font-medium">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Admin entity and official link */}
          {(destination.adminEntity || destination.officialUrl) && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="text-stone-700">
                {destination.adminEntity && (
                  <span>
                    Entidad administradora: <strong>{destination.adminEntity}</strong>
                  </span>
                )}
              </div>
              {destination.officialUrl && (
                <a
                  href={destination.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    try {
                      const domain = new URL(destination.officialUrl!).hostname;
                      trackEvent('affiliate_outbound_click', {
                        item_type: 'official_park',
                        item_id: destination.id,
                        item_name: destination.name,
                        outbound_domain: domain,
                      });
                    } catch {
                      trackEvent('affiliate_outbound_click', {
                        item_type: 'official_park',
                        item_id: destination.id,
                        item_name: destination.name,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-[#142B1F] hover:text-[#1E3F30] font-semibold underline underline-offset-2"
                >
                  <span>{t.officialParkSite}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Coordinates & OpenStreetMap */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#142B1F]" />
              {destination.coordinates && (
                <span>
                  Coordenadas: <strong>{destination.coordinates.lat.toFixed(4)}° S, {Math.abs(destination.coordinates.lng).toFixed(4)}° W</strong>
                </span>
              )}
            </div>
            {osmUrl && (
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#142B1F] hover:text-[#1E3F30] font-semibold underline underline-offset-2"
              >
                <span>Ver en mapa libre (OpenStreetMap)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Reusable affiliate-ready recommendations for stays and tours */}
          <DestinationAffiliateSections
            destination={destination}
            accommodations={accommodations}
            activities={activities}
            language={language}
            currency={currency}
            onSelectAccommodation={(acc) => {
              onClose();
              onSelectAccommodation(acc);
            }}
            onSelectActivity={(act) => {
              onClose();
              onSelectActivity(act);
            }}
            onNavigate={(page) => {
              onClose();
              onNavigate(page);
            }}
          />

          {/* Action bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
            <span className="text-xs text-stone-500 font-light">
              Datos verificados y redactados por el equipo editorial de SURARIO.
            </span>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleAddToRoute}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {addedToRoute ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-800">¡Añadido a mi ruta!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 text-[#2C7A9C]" />
                    <span>Añadir a mi ruta</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
