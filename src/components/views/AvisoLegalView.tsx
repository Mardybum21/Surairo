import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';
import { PageId } from '../../types';

interface LegalViewProps {
  onNavigate: (page: PageId) => void;
}

export const AvisoLegalView: React.FC<LegalViewProps> = ({ onNavigate }) => {
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
        <div className="flex items-center gap-2 text-xs uppercase font-semibold text-stone-700 tracking-wider">
          <Scale className="w-4 h-4" />
          <span>SURARIO · Marco Legal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Aviso Legal y Condiciones de Uso
        </h1>
        <p className="text-xs text-stone-500">
          Portal informativo y editorial de viajes por la Patagonia y los territorios australes.
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">1. Objeto y Naturaleza Editorial</h2>
          <p>
            SURARIO es una plataforma editorial e informativa dedicada a la divulgación cartográfica, geográfica y turística de la Patagonia argentina y chilena, Tierra del Fuego, las islas del Canal Beagle y los archipiélagos australes.
          </p>
          <p>
            SURARIO <strong>no es una agencia de viajes mayorista ni minorista</strong>, no emite pasajes de transporte, no efectúa cobros de estancias hoteleras ni formaliza contratos turísticos directos. Los contratos y acuerdos se celebran exclusivamente entre el viajero y el prestador local correspondiente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">2. Seguridad en Montaña y Exención de Responsabilidad</h2>
          <p>
            La geografía austral presenta condiciones climáticas extremas y cambiantes (vientos huracanados, descensos bruscos de temperatura, pasos de montaña nevados y cruces de ríos condicionados por mareas como en Cabo Froward y Dientes de Navarino).
          </p>
          <p>
            Toda información técnica sobre senderos, tiempos estimados y exigencias físicas es de carácter orientativo. Es responsabilidad ineludible de cada expedicionario verificar las alertas de CONAF (Chile) y Parques Nacionales (Argentina), registrarse ante Carabineros de Chile o Gendarmería Nacional Argentina cuando corresponda, portar el equipamiento adecuado y contratar guías de montaña acreditados para zonas remotas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">3. Propiedad Intelectual y Fuentes Cartográficas</h2>
          <p>
            La cartografía interactiva se basa en los datos libres de <strong>OpenStreetMap</strong> bajo licencia Open Database License (ODbL). Las fotografías y textos han sido recopilados de fuentes documentales oficiales, licencias de difusión pública y autores acreditados en la sección de Créditos.
          </p>
        </section>
      </div>
    </article>
  );
};
