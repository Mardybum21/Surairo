import React from 'react';
import { Destination, Accommodation, Activity, Language, Currency, PageId } from '../../types';
import { SafeImage } from '../SafeImage';
import { TRANSLATIONS, convertPrice } from '../../utils/i18n';
import { trackEvent } from '../../services/analyticsService';
import {
  BedDouble,
  Footprints,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Info,
  Clock,
  Mountain,
  Star,
  MapPin,
  Compass,
} from 'lucide-react';

interface DestinationAffiliateSectionsProps {
  destination: Destination;
  accommodations: Accommodation[];
  activities: Activity[];
  language?: Language;
  currency?: Currency;
  onSelectAccommodation: (acc: Accommodation) => void;
  onSelectActivity: (act: Activity) => void;
  onNavigate: (page: PageId) => void;
}

export const DestinationAffiliateSections: React.FC<DestinationAffiliateSectionsProps> = ({
  destination,
  accommodations,
  activities,
  language = 'es',
  currency = 'USD',
  onSelectAccommodation,
  onSelectActivity,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];

  const destinationAccommodations = accommodations.filter(
    (acc) => acc.destinationId === destination.id
  );

  const destinationActivities = activities.filter(
    (act) => act.destinationId === destination.id
  );

  const handleOutboundClick = (
    itemType: 'accommodation' | 'activity',
    itemId: string,
    itemName: string,
    url: string
  ) => {
    let outboundDomain = 'external';
    try {
      outboundDomain = new URL(url).hostname;
    } catch {
      // fallback
    }

    trackEvent('booking_button_click', {
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      destination_name: destination.name,
    });

    trackEvent('affiliate_outbound_click', {
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      outbound_domain: outboundDomain,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-10 pt-6 border-t border-stone-200">
      
      {/* SECTION 1: DÓNDE ALOJARSE / WHERE TO STAY */}
      <section aria-labelledby="section-where-to-stay" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-[#142B1F]">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <h3 id="section-where-to-stay" className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {t.whereToStayTitle} {language === 'en' ? 'in' : 'en'} {destination.name}
              </h3>
              <span className="text-xs text-stone-500 font-light block">
                {language === 'en'
                  ? 'Curated eco-lodges, boutique stays & mountain shelters'
                  : 'Eco-lodges, hoteles boutique y refugios de montaña seleccionados'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('alojamientos')}
            className="text-xs font-semibold text-[#142B1F] hover:text-[#2C7A9C] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{t.viewAllStays}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
          </button>
        </div>

        {destinationAccommodations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinationAccommodations.map((acc) => {
              const baseCurrency = acc.country === 'Argentina' ? 'ARS' : 'CLP';
              const localAmount = acc.priceInLocalCurrency?.amount || (acc.country === 'Argentina' ? 145000 : 120000);
              const converted = convertPrice(localAmount, baseCurrency, currency);
              const hasDirectUrl = Boolean(acc.officialUrl || acc.affiliateUrl);
              const outboundUrl =
                acc.officialUrl ||
                acc.affiliateUrl ||
                `https://www.google.com/travel/hotels?q=${encodeURIComponent(
                  acc.name + ' ' + destination.name
                )}`;

              return (
                <div
                  key={acc.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:border-stone-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header with Badge */}
                    <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                      <SafeImage
                        src={acc.image}
                        alt={acc.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 bg-[#142B1F]/85 backdrop-blur-xs text-[#FAF8F5] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">
                        {acc.typeLabel}
                      </div>

                      {hasDirectUrl && (
                        <div className="absolute top-3 right-3 bg-emerald-700/90 text-white text-[10px] font-medium tracking-wide px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-200" />
                          <span>{t.affiliateBadge}</span>
                        </div>
                      )}

                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-1 text-[#D4A373]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold">{acc.rating}</span>
                        </div>
                        <span className="text-[11px] text-stone-200">{acc.priceRange}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                        {acc.name}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {acc.shortDescription}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {acc.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium"
                          >
                            ✓ {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA Bar */}
                  <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block font-medium">
                        {t.indicativePriceLabel}
                      </span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-semibold text-stone-900">{acc.indicativePrice}</span>
                        {currency !== 'USD' && (
                          <span className="text-[11px] font-semibold text-[#2C7A9C]">
                            (~{converted.text})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectAccommodation(acc)}
                        className="px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:text-stone-950 bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        {t.viewDetailsLabel}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOutboundClick('accommodation', acc.id, acc.name, outboundUrl)}
                        className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#142B1F] hover:bg-[#1E3F30] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title={language === 'en' ? 'Check rates and availability' : 'Consultar tarifas y disponibilidad'}
                      >
                        <span>{hasDirectUrl ? t.checkWithProvider : t.checkAvailability}</span>
                        <ExternalLink className="w-3 h-3 text-[#D4A373]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 space-y-1">
            <p className="font-medium">
              {language === 'en'
                ? 'No certified accommodations listed directly in this zone yet.'
                : 'Aún no hay alojamientos certificados listados directamente en esta ficha.'}
            </p>
            <p className="text-stone-400">
              {language === 'en'
                ? 'Check nearby regional towns or consult local park ranger stations.'
                : 'Consulta localidades cercanas o puestos de guardaparques para campamentos habilitados.'}
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: TOURS Y EXPERIENCIAS / TOURS & EXPERIENCES */}
      <section aria-labelledby="section-tours-experiences" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-[#142B1F]">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h3 id="section-tours-experiences" className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {t.toursExperiencesTitle} {language === 'en' ? 'in' : 'en'} {destination.name}
              </h3>
              <span className="text-xs text-stone-500 font-light block">
                {language === 'en'
                  ? 'Glacier treks, boat navigation & certified local guides'
                  : 'Caminatas en hielo, navegaciones marítimas y guías locales habilitados'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('excursiones')}
            className="text-xs font-semibold text-[#142B1F] hover:text-[#2C7A9C] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{t.viewAllTours}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
          </button>
        </div>

        {destinationActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinationActivities.map((act) => {
              const baseCurrency = act.country === 'Argentina' ? 'ARS' : 'CLP';
              const localAmount = act.priceInLocalCurrency?.amount || (act.country === 'Argentina' ? 85000 : 70000);
              const converted = convertPrice(localAmount, baseCurrency, currency);
              const hasDirectUrl = Boolean(act.officialUrl || act.affiliateUrl);
              const outboundUrl =
                act.officialUrl ||
                act.affiliateUrl ||
                `https://www.google.com/search?q=${encodeURIComponent(
                  act.title + ' ' + destination.name + ' tour operador'
                )}`;

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:border-stone-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header with Badge */}
                    <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                      <SafeImage
                        src={act.image}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 bg-[#142B1F]/85 backdrop-blur-xs text-[#D4A373] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">
                        {act.categoryLabel}
                      </div>

                      {hasDirectUrl && (
                        <div className="absolute top-3 right-3 bg-emerald-700/90 text-white text-[10px] font-medium tracking-wide px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-200" />
                          <span>{t.affiliateBadge}</span>
                        </div>
                      )}

                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1 text-stone-200">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{act.duration}</span>
                        </span>
                        <span className="flex items-center gap-1 text-stone-200">
                          <Mountain className="w-3.5 h-3.5 text-stone-400" />
                          <span>{act.difficulty}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                        {act.title}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {act.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom CTA Bar */}
                  <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block font-medium">
                        {t.indicativePriceLabel}
                      </span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-semibold text-stone-900">{act.indicativePrice}</span>
                        {currency !== 'USD' && (
                          <span className="text-[11px] font-semibold text-[#2C7A9C]">
                            (~{converted.text})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectActivity(act)}
                        className="px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:text-stone-950 bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        {t.viewGuideLabel}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOutboundClick('activity', act.id, act.title, outboundUrl)}
                        className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#142B1F] hover:bg-[#1E3F30] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title={language === 'en' ? 'Check tour details with local provider' : 'Consultar detalles del tour con operador local'}
                      >
                        <span>{hasDirectUrl ? t.checkWithProvider : t.contactOperator}</span>
                        <ExternalLink className="w-3 h-3 text-[#D4A373]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 space-y-1">
            <p className="font-medium">
              {language === 'en'
                ? 'No organized commercial excursions registered for this specific sector.'
                : 'No constan excursiones comerciales organizadas directamente en este sector.'}
            </p>
            <p className="text-stone-400">
              {language === 'en'
                ? 'This area is explored mainly via autonomous trekking or self-guided trails.'
                : 'Este destino se recorre principalmente mediante senderismo autónomo o sendas autoguiadas.'}
            </p>
          </div>
        )}
      </section>

      {/* Honest Affiliate Transparency Notice */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
        <Info className="w-4 h-4 text-[#2C7A9C] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-stone-800 block">
            {language === 'en' ? 'Affiliate & Booking Transparency' : 'Transparencia de Reservas y Afiliación'}
          </span>
          <p className="leading-relaxed font-light">
            {t.affiliateNotice}
          </p>
        </div>
      </div>

    </div>
  );
};
