import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { PageId } from '../../types';

interface LegalViewProps {
  onNavigate: (page: PageId) => void;
  onOpenCookieSettings?: () => void;
}

export const PoliticaPrivacidadView: React.FC<LegalViewProps> = ({ onNavigate }) => {
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
          <Shield className="w-4 h-4" />
          <span>SURARIO · Marco Legal y de Privacidad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Política de Privacidad y Protección de Datos
        </h1>
        <p className="text-xs text-stone-500">
          Última actualización: Temporada Austral 2026/2027 · Conforme al Reglamento General de Protección de Datos (RGPD UE 2016/679) y legislaciones chilena (Ley 19.628) y argentina (Ley 25.326).
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">1. Responsable del Tratamiento</h2>
          <p>
            El portal <strong>SURARIO</strong> (accesible en dominio público y aplicativo oficial) es un proyecto editorial e informativo independiente sobre turismo y geografía en la Patagonia argentina y chilena. Para cualquier consulta en materia de privacidad o ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), el contacto se gestiona a través de la dirección postal y correo de contacto editorial: <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-800">privacidad@surario.com</code>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">2. Principios de Minimización y Privacidad por Diseño</h2>
          <p>
            SURARIO no solicita registro de cuenta obligatorio para navegar por sus guías, consultar mapas libres ni utilizar el planificador de itinerarios. El uso del portal es libre y anónimo.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li><strong>Formularios de contacto y sugerencias:</strong> Los datos remitidos voluntariamente (nombre, email y mensaje) se emplean exclusivamente para responder a la consulta del usuario.</li>
            <li><strong>Registro de proveedores locales:</strong> La información de contacto comercial de operadores de alojamiento y excursiones se procesa para evaluar su inclusión contrastada en el directorio austral.</li>
            <li><strong>Almacenamiento local (LocalStorage):</strong> Tu itinerario personalizado y tu lista de destinos guardados se almacenan exclusivamente en tu propio dispositivo (navegador) y no se envían a servidores centrales de SURARIO.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">3. Analítica Anónima y No Rastreo Invasivo</h2>
          <p>
            SURARIO no realiza fingerprinting ni perfilado comercial cruzado. Las métricas analíticas se recopilan bajo estricto consentimiento y de forma agregada para entender qué rutas y artículos ayudan mejor a los viajeros a organizar expediciones seguras.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-900">4. Ejercicio de Derechos</h2>
          <p>
            En cualquier momento puedes solicitar la supresión de tus datos de contacto o revocar tu consentimiento de cookies a través del panel de configuración accesible en el pie de página.
          </p>
        </section>
      </div>
    </article>
  );
};
