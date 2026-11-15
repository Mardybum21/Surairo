import React from 'react';
import { Cookie, ArrowLeft, Sliders } from 'lucide-react';
import { PageId } from '../../types';

interface LegalViewProps {
  onNavigate: (page: PageId) => void;
  onOpenCookieSettings?: () => void;
}

export const PoliticaCookiesView: React.FC<LegalViewProps> = ({ onNavigate, onOpenCookieSettings }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 animate-fadeIn">
      <button
        onClick={() => onNavigate('inicio')}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>

      <div className="border-b border-stone-200 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold text-amber-800 tracking-wider">
          <Cookie className="w-4 h-4" />
          <span>SURARIO · Transparencia Digital</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Política de Cookies y Tecnologías Similares
        </h1>
        <p className="text-xs text-stone-500">
          Última actualización: 2026/2027 · Conforme a la Directiva ePrivacy y el RGPD europeo.
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-emerald-900 text-sm block">Panel de Preferencias de Cookies</span>
            <span className="text-xs text-emerald-700">Puedes modificar tu consentimiento o retirar los permisos en cualquier momento.</span>
          </div>
          {onOpenCookieSettings && (
            <button
              onClick={onOpenCookieSettings}
              className="px-4 py-2 bg-[#142B1F] hover:bg-[#1E3F30] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configurar mis cookies</span>
            </button>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">¿Qué son las cookies y qué tecnologías usamos?</h2>
          <p>
            Las cookies son pequeños ficheros de texto que se descargan en tu navegador web al visitar sitios web. En SURARIO utilizamos almacenamiento local (<code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">localStorage</code>) y cookies técnicas para recordar tus selecciones de moneda, idioma y filtros de búsqueda sin necesidad de iniciar sesión.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-stone-900">Clasificación de cookies en SURARIO</h2>
          
          <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200 text-xs">
            <div className="p-4 bg-stone-50 space-y-1">
              <span className="font-bold text-stone-900">1. Cookies Técnicas & Estrictamente Necesarias</span>
              <p className="text-stone-600">
                Permiten la navegación fluida, la memorización del idioma y divisa elegida y la persistencia de las preferencias del banner de consentimiento. No requieren autorización previa.
              </p>
            </div>
            <div className="p-4 bg-white space-y-1">
              <span className="font-bold text-stone-900">2. Cookies de Medición y Analítica (Google Analytics 4 — ID: G-W0ZG7YR141)</span>
              <p className="text-stone-600">
                Utilizamos Google Analytics 4 (identificador <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono">G-W0ZG7YR141</code>) implementado estrictamente con Google Consent Mode v2 y anonimización de IP. Las etiquetas analíticas no se cargan ni recopilan datos hasta que el usuario otorga su consentimiento explícito en el banner o en este panel. Puedes retirar tu consentimiento en cualquier momento haciendo clic en el botón superior «Configurar mis cookies».
              </p>
            </div>
            <div className="p-4 bg-stone-50 space-y-1">
              <span className="font-bold text-stone-900">3. Cookies de Enlaces de Afiliación (Opcionales)</span>
              <p className="text-stone-600">
                Al hacer clic en botones como «Consultar disponibilidad», se puede generar una cookie temporal en el operador de destino para registrar la referencia de SURARIO.
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};
