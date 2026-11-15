import React from 'react';
import { DollarSign, ArrowLeft, ShieldCheck, HeartHandshake } from 'lucide-react';
import { PageId } from '../../types';

interface LegalViewProps {
  onNavigate: (page: PageId) => void;
}

export const TransparenciaAfiliacionView: React.FC<LegalViewProps> = ({ onNavigate }) => {
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
        <div className="flex items-center gap-2 text-xs uppercase font-semibold text-emerald-800 tracking-wider">
          <HeartHandshake className="w-4 h-4" />
          <span>SURARIO · Modelo Ético y Sostenibilidad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Transparencia Editorial y Declaración de Afiliación
        </h1>
        <p className="text-xs text-stone-500">
          Nuestro compromiso de independencia editorial, rigor geográfico y honestidad con el viajero.
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
          <span className="font-serif font-bold text-amber-950 text-base block">
            Principio fundamental de SURARIO
          </span>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            Ninguna empresa, hotel ni operador local puede pagar para alterar una recomendación de seguridad, falsear las dificultades de un sendero ni comprar una posición favorable en nuestra guía. La independencia editorial es el valor cardinal de SURARIO.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">¿Cómo se financia SURARIO?</h2>
          <p>
            Mantener actualizado un catálogo exhaustivo con más de 20 destinos australes, mapas interactivos libres sin API keys de pago y reportes meteorológicos satelitales en tiempo real requiere recursos de investigación, desarrollo y contrastación documental.
          </p>
          <p>
            Para mantener el acceso a SURARIO <strong>100% gratuito, sin muros de pago y sin publicidad intrusiva ni pop-ups molestos</strong>, participamos en programas de enlaces de afiliación turística verificados (por ejemplo, con plataformas de alojamiento o agencias de navegación acreditadas).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">¿Qué significa esto para ti como viajero?</h2>
          <ul className="list-disc pl-5 space-y-2 text-stone-600 text-xs sm:text-sm">
            <li>
              <strong>Cero sobrecoste:</strong> Si decides reservar una estadía o una excursión tras pulsar en nuestros botones de disponibilidad, el precio que pagas es exactamente el mismo (o en ocasiones con tarifas preferenciales negociadas). Jamás pagarás un céntimo más por acceder desde SURARIO.
            </li>
            <li>
              <strong>Comisión de mantenimiento:</strong> El prestador abona a SURARIO una pequeña comisión por derivación que se reinvierte en la verificación de datos sobre el terreno y en la infraestructura técnica del portal.
            </li>
            <li>
              <strong>Preferencia por canales oficiales:</strong> Siempre que un parque o monumento dispone de venta directa oficial (como pasesparques.cl de CONAF o la administración de APN), proporcionamos el enlace oficial directo de forma prioritaria.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">Identificación clara de enlaces</h2>
          <p>
            Identificamos claramente mediante insignias y textos descriptivos los enlaces que corresponden a canales oficiales de parques respecto a operadores comerciales y plataformas de reservas.
          </p>
        </section>
      </div>
    </article>
  );
};
