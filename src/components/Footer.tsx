import React from 'react';
import { PageId, Language } from '../types';
import { Logo } from './Logo';
import { ShieldCheck, Camera, Compass, MapPin, Sliders, HeartHandshake, Scale, Cookie } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

interface FooterProps {
  language?: Language;
  onNavigate: (page: PageId) => void;
  onOpenCookieSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language = 'es',
  onNavigate,
  onOpenCookieSettings,
}) => {
  const t = TRANSLATIONS[language];

  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#142B1F] text-stone-300 border-t border-[#1C3D2C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Manifesto & Identity */}
          <div className="md:col-span-1 space-y-4">
            <button
              onClick={() => handleNav('inicio')}
              className="text-left focus:outline-none cursor-pointer"
              aria-label="SURARIO - Ir al inicio"
            >
              <Logo variant="light" size="md" showDescriptor={true} />
            </button>

            <p className="text-xs sm:text-sm text-stone-300 font-serif italic">
              «{t.tagline}»
            </p>

            <p className="text-xs text-stone-400 leading-relaxed font-light">
              {language === 'es'
                ? 'Guía editorial e independiente de viajes por la Patagonia argentina y chilena, Tierra del Fuego y los mares australes. Diseñada para viajeros que buscan rigor cartográfico y autenticidad.'
                : 'Independent editorial travel guide to Argentine and Chilean Patagonia, Tierra del Fuego, and the southern seas. Built for travelers seeking authentic routes and geographical precision.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#D4A373] shrink-0" />
              <span>Cartografía libre (OpenStreetMap) · Clima satelital Open-Meteo</span>
            </div>
          </div>

          {/* Destinos Australes y Regiones */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4A373] mb-4">
              {t.navDestinations}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  Los Lagos & Chiloé (Chile)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  Aysén & Carretera Austral
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  Bariloche & Ruta de los 7 Lagos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  El Calafate & El Chaltén (Fitz Roy)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  Torres del Paine & Puerto Natales
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left font-medium text-amber-200/90"
                >
                  Punta Arenas & Estrecho de Magallanes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left font-medium text-amber-200/90"
                >
                  Ushuaia, Tolhuin & Canal Beagle
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('destinos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left font-medium text-amber-200/90"
                >
                  Puerto Williams & Isla Navarino
                </button>
              </li>
            </ul>
          </div>

          {/* Explorar & Planificar */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4A373] mb-4">
              Explorar SURARIO
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              <li>
                <button
                  onClick={() => handleNav('mapa')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#2C7A9C]" />
                  <span>{t.navMap}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('itinerarios')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  {t.navItineraries}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('alojamientos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  {t.navAccommodations}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('excursiones')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  {t.navActivities}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('guias')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  {t.navGuides}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('proveedores')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left text-amber-200/90 font-medium"
                >
                  {t.navProviders}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contacto-creditos')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left"
                >
                  {t.navContact}
                </button>
              </li>
            </ul>
          </div>

          {/* Marco Legal & Transparencia */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4A373] mb-4">
              Legal & Privacidad
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              SURARIO promueve un modelo transparente de viajes independientes. Conoce nuestras políticas y configuración de privacidad.
            </p>
            <ul className="space-y-2 text-xs text-stone-300 pt-1">
              <li>
                <button
                  onClick={() => handleNav('politica-privacidad')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.privacyPolicy}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('politica-cookies')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Cookie className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.cookiePolicy}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('aviso-legal')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.legalNotice}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('transparencia-afiliacion')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.affiliatePolicy}</span>
                </button>
              </li>
              {onOpenCookieSettings && (
                <li className="pt-2">
                  <button
                    onClick={onOpenCookieSettings}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{t.configureCookies}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Currency & Legal Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1C3D2C] space-y-4">
          <p className="text-[11px] text-stone-400 leading-relaxed text-center sm:text-left">
            ℹ️ {t.currencyDisclaimer}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} SURARIO. {t.copyright}</span>
              <span className="text-stone-600">·</span>
              <button
                onClick={() => handleNav('admin')}
                className="hover:text-amber-400 text-stone-500 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                title="Acceso Privado Administrador"
              >
                <span>🔒</span>
                <span>{language === 'en' ? 'Admin Access' : 'Acceso Privado'}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <Compass className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>{t.tagline}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

