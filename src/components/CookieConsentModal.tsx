import React, { useState } from 'react';
import { CookieConsentPreferences, Language } from '../types';
import { Shield, Check, X, Sliders, Info } from 'lucide-react';
import { saveStoredCookieConsent } from '../services/analyticsService';
import { TRANSLATIONS } from '../utils/i18n';

interface CookieConsentProps {
  preferences: CookieConsentPreferences;
  language?: Language;
  onUpdatePreferences: (prefs: CookieConsentPreferences) => void;
  isOpenPreferencesModal: boolean;
  onClosePreferencesModal: () => void;
  onNavigateToPolicy: () => void;
}

export const CookieConsentModal: React.FC<CookieConsentProps> = ({
  preferences,
  language = 'es',
  onUpdatePreferences,
  isOpenPreferencesModal,
  onClosePreferencesModal,
  onNavigateToPolicy,
}) => {
  const [analyticsChecked, setAnalyticsChecked] = useState(preferences.analytics);
  const [marketingChecked, setMarketingChecked] = useState(preferences.marketing);

  React.useEffect(() => {
    setAnalyticsChecked(preferences.analytics);
    setMarketingChecked(preferences.marketing);
  }, [preferences, isOpenPreferencesModal]);

  const t = TRANSLATIONS[language];

  const handleAcceptAll = () => {
    const updated = saveStoredCookieConsent({
      analytics: true,
      marketing: true,
    });
    onUpdatePreferences(updated);
    if (isOpenPreferencesModal) onClosePreferencesModal();
  };

  const handleRejectOptional = () => {
    const updated = saveStoredCookieConsent({
      analytics: false,
      marketing: false,
    });
    onUpdatePreferences(updated);
    if (isOpenPreferencesModal) onClosePreferencesModal();
  };

  const handleSaveCustom = () => {
    const updated = saveStoredCookieConsent({
      analytics: analyticsChecked,
      marketing: marketingChecked,
    });
    onUpdatePreferences(updated);
    onClosePreferencesModal();
  };

  return (
    <>
      {/* Bottom Floating Banner (shown if not answered yet) */}
      {!preferences.answered && !isOpenPreferencesModal && (
        <aside
          role="region"
          aria-label="Consentimiento de cookies"
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-stone-900/95 backdrop-blur-md text-white border-t border-stone-800 shadow-2xl animate-fadeIn"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="text-sm font-semibold text-white">
                  {t.cookieBannerTitle}
                </h3>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {t.cookieBannerText}{' '}
                <button
                  type="button"
                  onClick={onNavigateToPolicy}
                  className="text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  {t.cookiePolicy}
                </button>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                {t.rejectOptional}
              </button>
              <button
                type="button"
                onClick={onClosePreferencesModal}
                className="px-3.5 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 border border-amber-400/40 hover:border-amber-400 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.configureCookies}</span>
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs font-semibold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                {t.acceptAll}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Dialog / Modal */}
      {isOpenPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={onClosePreferencesModal}
        >
          <div
            className="bg-[#FAF8F5] text-stone-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-700" />
                <h3 id="cookie-prefs-title" className="text-lg font-serif font-bold text-stone-900">
                  {t.cookiePreferencesTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClosePreferencesModal}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
                aria-label="Cerrar modal de preferencias"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              En SURARIO respetamos tu derecho a la privacidad. Puedes elegir qué categorías de cookies permites. Las cookies técnicas necesarias no pueden desactivarse ya que garantizan la navegación y la seguridad de la sesión.
            </p>

            <div className="space-y-4">
              {/* Category: Necessary */}
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      Cookies Técnicas & Esenciales
                    </span>
                    <span className="text-[10px] bg-stone-300 text-stone-800 px-2 py-0.5 rounded-full font-medium">
                      Siempre activas
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Necesarias para almacenar el idioma seleccionado, la divisa, el estado de los filtros y tus propias preferencias de privacidad.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  aria-label="Cookies técnicas obligatorias"
                  className="mt-1 w-4 h-4 text-emerald-600 accent-emerald-600 cursor-not-allowed opacity-70"
                />
              </div>

              {/* Category: Analytics */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 flex items-start justify-between gap-4 hover:border-stone-300 transition-colors">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-900">
                    {t.analyticsCookies}
                  </span>
                  <p className="text-[11px] text-stone-600">
                    Nos ayuda a conocer de forma anónima qué itinerarios, guías y mapas resultan más útiles a los viajeros. No recolecta nombres, correos ni datos personales.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="chk-analytics"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  aria-label="Habilitar cookies analíticas"
                  className="mt-1 w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Category: Marketing & Affiliate */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 flex items-start justify-between gap-4 hover:border-stone-300 transition-colors">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-900">
                    {t.marketingCookies}
                  </span>
                  <p className="text-[11px] text-stone-600">
                    Permite atribuir enlaces a operadores locales y plataformas de reserva para sostener este proyecto editorial independiente.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="chk-marketing"
                  checked={marketingChecked}
                  onChange={(e) => setMarketingChecked(e.target.checked)}
                  aria-label="Habilitar cookies de marketing y afiliación"
                  className="mt-1 w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-200 flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                {t.rejectOptional}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors cursor-pointer"
                >
                  {t.acceptAll}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#142B1F] hover:bg-[#1E3F30] rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  {t.savePreferences}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
