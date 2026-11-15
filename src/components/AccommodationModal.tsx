import React, { useState, useEffect } from 'react';
import { Accommodation, Language, Currency } from '../types';
import { X, Star, MapPin, Check, Heart, Share2, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { convertPrice, TRANSLATIONS } from '../utils/i18n';
import { trackEvent } from '../services/analyticsService';

interface AccommodationModalProps {
  accommodation: Accommodation | null;
  language?: Language;
  currency?: Currency;
  onClose: () => void;
}

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  accommodation,
  language = 'es',
  currency = 'USD',
  onClose,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!accommodation) return;
    trackEvent('view_accommodation', {
      accommodation_id: accommodation.id,
      accommodation_name: accommodation.name,
      destination_name: accommodation.destinationName,
      type: accommodation.type,
      price_range: accommodation.priceRange,
    });

    try {
      const savedList = JSON.parse(localStorage.getItem('surario_saved_acc') || '[]');
      setIsSaved(savedList.includes(accommodation.id));
    } catch {
      setIsSaved(false);
    }
  }, [accommodation]);

  if (!accommodation) return null;

  const toggleSave = () => {
    try {
      const savedList: string[] = JSON.parse(
        localStorage.getItem('surario_saved_acc') || '[]'
      );
      let updated: string[];
      if (savedList.includes(accommodation.id)) {
        updated = savedList.filter((id) => id !== accommodation.id);
        setIsSaved(false);
      } else {
        updated = [...savedList, accommodation.id];
        setIsSaved(true);
      }
      localStorage.setItem('surario_saved_acc', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommercialClick = (url: string) => {
    let outboundDomain = 'external';
    try {
      outboundDomain = new URL(url).hostname;
    } catch {
      // fallback
    }

    // Intention / CTA click, never logged as a confirmed reservation (Requirement 9)
    trackEvent('booking_button_click', {
      item_type: 'accommodation',
      item_id: accommodation.id,
      item_name: accommodation.name,
      destination_name: accommodation.destinationName,
    });

    trackEvent('affiliate_outbound_click', {
      item_type: 'accommodation',
      item_id: accommodation.id,
      item_name: accommodation.name,
      outbound_domain: outboundDomain,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const baseCurrency: 'ARS' | 'CLP' = accommodation.country === 'Argentina' ? 'ARS' : 'CLP';
  const defaultLocalAmount = accommodation.country === 'Argentina' ? 145000 : 120000;
  const localAmount = accommodation.priceInLocalCurrency?.amount || defaultLocalAmount;
  const conversion = convertPrice(localAmount, baseCurrency, currency);

  const bookingUrl = accommodation.officialUrl || accommodation.affiliateUrl || `https://www.google.com/travel/hotels?q=${encodeURIComponent(accommodation.name + ' ' + accommodation.destinationName)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-acc-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF8F5] text-stone-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={toggleSave}
            className={`p-2.5 rounded-full transition-colors cursor-pointer shadow-md ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-stone-900/70 hover:bg-stone-900 text-white'
            }`}
            title={isSaved ? 'Guardado en tus favoritos' : 'Guardar en favoritos'}
            aria-label="Guardar en favoritos"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer shadow-md"
            title="Copiar enlace"
            aria-label="Compartir ficha"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer shadow-md"
            aria-label="Cerrar ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 w-full bg-stone-900 overflow-hidden">
          <SafeImage
            src={accommodation.image}
            alt={accommodation.name}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-amber-300">
              <span>{accommodation.destinationName}</span>
              <span aria-hidden="true">·</span>
              <span>{accommodation.typeLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{accommodation.country}</span>
            </div>
            <h2
              id="modal-acc-title"
              className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight"
            >
              {accommodation.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1 font-semibold text-amber-300 bg-black/40 px-2.5 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{accommodation.rating} / 5</span>
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full">Categoría: {accommodation.priceRange}</span>
            </div>
          </div>

          <div className="absolute top-4 left-4 z-10 text-[11px] text-stone-200 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs">
            Foto: {accommodation.photoCredit}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-16rem)] overflow-y-auto">
          {/* Price and commercial CTA */}
          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-800 block">
                Tarifa de referencia
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
              <span>{t.checkAvailability}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-stone-500">
              Descripción del Alojamiento
            </h3>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-serif">
              {accommodation.longDescription}
            </p>
          </div>

          {/* Location */}
          <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-stone-900">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Ubicación y Entorno</span>
            </div>
            <p className="text-stone-600 pl-6">{accommodation.location}</p>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-stone-500">
              Servicios & Comodidades Incluidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {accommodation.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs sm:text-sm text-stone-800 p-2.5 rounded-lg bg-white border border-stone-200"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial transparency note */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>{t.affiliatePolicy}:</strong> {t.affiliateNotice}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              onClick={toggleSave}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-900 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-current' : ''}`} />
              <span>{isSaved ? 'En favoritos' : 'Guardar en mi lista'}</span>
            </button>
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
