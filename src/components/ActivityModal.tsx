import React, { useEffect } from 'react';
import { Activity, Language, Currency } from '../types';
import { X, Clock, Mountain, Calendar, Check, AlertTriangle, Backpack, ShieldCheck, ExternalLink } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { convertPrice, TRANSLATIONS } from '../utils/i18n';
import { trackEvent } from '../services/analyticsService';

interface ActivityModalProps {
  activity: Activity | null;
  language?: Language;
  currency?: Currency;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  language = 'es',
  currency = 'USD',
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!activity) return;
    trackEvent('view_tour', {
      tour_id: activity.id,
      tour_name: activity.title,
      destination_name: activity.destinationName,
      category: activity.category,
      difficulty: activity.difficulty,
    });
  }, [activity]);

  if (!activity) return null;

  const handleCommercialClick = (url: string) => {
    let outboundDomain = 'external';
    try {
      outboundDomain = new URL(url).hostname;
    } catch {
      // fallback
    }

    // Intention / CTA click, never logged as a confirmed reservation (Requirement 9)
    trackEvent('booking_button_click', {
      item_type: 'activity',
      item_id: activity.id,
      item_name: activity.title,
      destination_name: activity.destinationName,
    });

    trackEvent('affiliate_outbound_click', {
      item_type: 'activity',
      item_id: activity.id,
      item_name: activity.title,
      outbound_domain: outboundDomain,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const baseCurrency: 'ARS' | 'CLP' = activity.country === 'Argentina' ? 'ARS' : 'CLP';
  const defaultLocalAmount = activity.country === 'Argentina' ? 95000 : 85000;
  const localAmount = activity.priceInLocalCurrency?.amount || defaultLocalAmount;
  const conversion = convertPrice(localAmount, baseCurrency, currency);

  const bookingUrl = activity.officialUrl || activity.affiliateUrl || `https://www.google.com/search?q=${encodeURIComponent(activity.title + ' ' + activity.destinationName)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-act-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF8F5] text-stone-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer shadow-md"
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 w-full bg-stone-900 overflow-hidden">
          <SafeImage
            src={activity.image}
            alt={activity.title}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
            <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold text-amber-300">
              <span>{activity.destinationName}</span>
              <span aria-hidden="true">·</span>
              <span>{activity.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{activity.country}</span>
            </div>
            <h2
              id="modal-act-title"
              className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight"
            >
              {activity.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1 font-medium text-white bg-black/40 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{activity.duration}</span>
              </span>
              <span className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full">
                <Mountain className="w-3.5 h-3.5 text-amber-300" />
                <span>Dificultad: {activity.difficulty}</span>
              </span>
            </div>
          </div>

          <div className="absolute top-4 left-4 z-10 text-[11px] text-stone-200 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs">
            Foto: {activity.photoCredit}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-16rem)] overflow-y-auto">
          {/* Price box with transparent currency estimate */}
          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-800 block">
                Precio de referencia de la excursión
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-serif text-emerald-950">
                  {conversion.text}
                </span>
                <span className="text-xs text-stone-500">
                  (~{localAmount.toLocaleString()} {baseCurrency})
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.currencyDisclaimer}
              </p>
            </div>

            <button
              onClick={() => handleCommercialClick(bookingUrl)}
              className="px-5 py-2.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <span>{t.contactOperator}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Full description */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-stone-500">
              Sobre esta Experiencia
            </h3>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-serif">
              {activity.fullDescription}
            </p>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-700">
            <div className="space-y-1">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.bestSeason}:</span>
              </span>
              <p className="text-stone-600 pl-5">{activity.bestSeason}</p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cuidado ambiental:</span>
              </span>
              <p className="text-stone-600 pl-5">Regla estricta "No deje rastro" (Leave No Trace).</p>
            </div>
          </div>

          {/* Included */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-stone-500">
              Qué Incluye habitualmente
            </h3>
            <div className="space-y-2">
              {activity.included.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-stone-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What to bring */}
          <div className="space-y-3 p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-stone-800 flex items-center gap-2">
              <Backpack className="w-4 h-4 text-amber-700" />
              <span>Qué Llevar en tu Mochila</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
              {activity.whatToBring.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety disclaimer */}
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Seguridad en la montaña:</strong> Consulta siempre con la seccional de guardaparques local el estado del viento y del sendero antes de salir.
            </div>
          </div>

          {/* Editorial transparency note */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>{t.affiliatePolicy}:</strong> {t.affiliateNotice}
            </p>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-end pt-4 border-t border-stone-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

