import React, { useState } from 'react';
import { PHOTO_CREDITS } from '../../data/patagoniaData';
import { ContactMessage, Language } from '../../types';
import {
  Mail,
  Camera,
  Code2,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Server,
  Github,
  Globe,
  Compass,
} from 'lucide-react';
import { trackEvent } from '../../services/analyticsService';
import { TRANSLATIONS } from '../../utils/i18n';

interface ContactViewProps {
  language?: Language;
}

export const ContactView: React.FC<ContactViewProps> = ({ language = 'es' }) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(
    language === 'en' ? 'General trip inquiry' : 'Consulta general de viaje'
  );
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(language === 'en' ? 'Please enter your name.' : 'Por favor indica tu nombre.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'en' ? 'Please enter a valid email address.' : 'Por favor introduce un correo válido.');
      return;
    }
    if (message.trim().length < 10) {
      setError(language === 'en' ? 'Please write a message of at least 10 characters.' : 'Por favor escribe un mensaje de al menos 10 caracteres.');
      return;
    }

    const newMsg: ContactMessage = {
      id: `SUR-MSG-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem('surario_contact_messages') || '[]'
      );
      localStorage.setItem(
        'surario_contact_messages',
        JSON.stringify([newMsg, ...existing])
      );
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);

      trackEvent('contact_form_submit', {
        subject,
      });
    } catch {
      setError('Error al procesar el mensaje localmente.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title & SEO Hierarchy */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <Mail className="w-4 h-4 text-[#D4A373]" />
          <span>{language === 'en' ? 'SURARIO · Contact & Attributions' : 'SURARIO · Contacto & Atribuciones'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {t.contactTitle}
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-light">
          {t.contactSubtitle}
        </p>
      </div>

      {/* Grid: Contact form + FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              {language === 'en' ? 'Send Us a Message' : 'Envíanos un Mensaje'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'en'
                ? 'Editorial inquiries, trail updates, or photography collaboration proposals.'
                : 'Consultas editoriales, avisos de senderos o propuestas de colaboración fotográfica.'}
            </p>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs sm:text-sm animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">{t.messageSentSuccess}</strong>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {language === 'en'
                    ? 'This release operates client-side to ensure free, secure, and privacy-respecting functionality.'
                    : 'Esta primera versión opera en cliente para garantizar funcionamiento gratuito y seguro.'}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-800 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-xs font-semibold text-stone-700">
                  {t.yourName} *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'en' ? 'Your name' : 'Tu nombre'}
                  className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-semibold text-stone-700">
                  {t.yourEmail} *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-stone-700">
                {t.subjectLabel}
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F] focus:bg-white cursor-pointer"
              >
                <option value={language === 'en' ? 'General trip inquiry' : 'Consulta general de viaje'}>
                  {language === 'en' ? 'General trip inquiry across Patagonia' : 'Consulta general de viaje por la Patagonia'}
                </option>
                <option value={language === 'en' ? 'Trail suggestion' : 'Sugerencia de nuevo sendero o destino'}>
                  {language === 'en' ? 'Suggestion for a new trail or destination' : 'Sugerencia de nuevo sendero o destino'}
                </option>
                <option value={language === 'en' ? 'Data update' : 'Aviso de corrección sobre datos o climas'}>
                  {language === 'en' ? 'Data, logistics or weather correction' : 'Aviso de corrección sobre datos o climas'}
                </option>
                <option value={language === 'en' ? 'Photo collaboration' : 'Colaboración fotográfica'}>
                  {language === 'en' ? 'Photographic or editorial collaboration' : 'Colaboración fotográfica'}
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-msg" className="block text-xs font-semibold text-stone-700">
                {t.messageLabel} *
              </label>
              <textarea
                id="contact-msg"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === 'en' ? 'Write your inquiry or proposal...' : 'Escribe tu consulta o comentario...'}
                className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#142B1F] focus:bg-white"
              />
            </div>

            <div className="text-[11px] text-stone-500 font-light">
              {language === 'en'
                ? '* Note: In this functional release without paid backend dependencies, message submissions are validated in your browser.'
                : '* Nota: En esta primera versión funcional sin servicios de pago, los formularios se procesan y validan en tu propio navegador.'}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>{t.sendMessage}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick FAQ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-stone-300 space-y-4 shadow-2xs">
            <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#D4A373]" />
              <span>{language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-stone-900 block">
                  {language === 'en' ? 'What does the brand name SURARIO mean?' : '¿Qué significa la marca SURARIO?'}
                </span>
                <p className="text-stone-600 leading-relaxed font-light">
                  {language === 'en'
                    ? 'SURARIO is formed from "Sur" (South) and "Horario / Itinerario" (Schedule / Journey). It represents a deliberate, field-tested, and sustainable way of traveling across southern South America, beginning in Patagonia.'
                    : 'SURARIO nace de la unión entre el «Sur» y el «Itinerario/Horario» austral. Representa una forma pausada, documentada y respetuosa de viajar por el sur de Sudamérica, comenzando por la Patagonia.'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-stone-900 block">
                  {language === 'en' ? 'When is the best season to visit?' : '¿Cuándo es la mejor temporada para viajar?'}
                </span>
                <p className="text-stone-600 leading-relaxed font-light">
                  {language === 'en'
                    ? 'November through March provides the best conditions for mountain hiking and open roads. Autumn (April) paints the lenga beech forests in deep ochre and crimson in El Chaltén and Bariloche.'
                    : 'Entre noviembre y marzo para senderismo y clima templado. El otoño austral (abril) tiñe los bosques de lengas de rojo y ocre en El Chaltén y Bariloche.'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-stone-900 block">
                  {language === 'en' ? 'Why are there no fake payment checkout forms?' : '¿Por qué no hay pasarelas de pago ni tarjetas?'}
                </span>
                <p className="text-stone-600 leading-relaxed font-light">
                  {language === 'en'
                    ? 'To keep SURARIO 100% independent and transparent, without adding markups or intermediating directly between travelers and verified local providers.'
                    : 'Para mantener SURARIO como un portal 100% independiente y gratuito, sin encarecer las reservas con comisiones de pasarela ni intermediar en las transacciones de los prestadores locales.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Photo Credits Section */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
            <Camera className="w-4 h-4 text-[#D4A373]" />
            <span>Atribución & Fotografía Documental</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Créditos Fotográficos y Licencias
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            SURARIO rinde homenaje a los fotógrafos de naturaleza y archivos de conservación que documentan la grandeza de la Patagonia. Todas las imágenes empleadas provienen de registros de paisajes patagónicos bajo licencias compatibles con el uso editorial y documental libre.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Paisaje / Motivo</th>
                <th className="py-3 px-3">Autoría / Archivo</th>
                <th className="py-3 px-3">Tipo de Licencia</th>
                <th className="py-3 px-3">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {PHOTO_CREDITS.map((credit, idx) => (
                <tr key={idx} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-stone-900">
                    {credit.subject}
                  </td>
                  <td className="py-3 px-3">{credit.author}</td>
                  <td className="py-3 px-3">
                    <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-[11px] font-mono">
                      {credit.license}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-500 font-light">{credit.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How to Run, Save, and Publish Guide */}
      <section className="bg-[#142B1F] text-white p-6 sm:p-10 rounded-3xl space-y-8 shadow-xl border border-[#1C3D2C]">
        <div className="space-y-2 border-b border-[#1C3D2C] pb-4">
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#D4A373]">
            <Code2 className="w-4 h-4 text-[#D4A373]" />
            <span>Guía Técnica del Proyecto SURARIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Cómo Ejecutar, Guardar y Publicar SURARIO Gratuitamente
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            Construido con React, TypeScript, Vite y Tailwind CSS. No requiere servidores dedicados de pago, base de datos de suscripción ni tarjetas de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1: Run locally */}
          <div className="p-5 rounded-2xl bg-[#0E1E16] border border-[#1C3D2C] space-y-3">
            <div className="flex items-center gap-2 text-[#D4A373] text-xs font-semibold uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>1. Ejecutar en local</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Servidor de Desarrollo</h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              En tu ordenador con Node.js instalado:
            </p>
            <div className="p-2.5 bg-[#07120D] rounded-xl font-mono text-[11px] text-[#D4A373] space-y-1">
              <div>npm install</div>
              <div>npm run dev</div>
            </div>
            <p className="text-[11px] text-stone-400 font-light">
              Abre <code className="text-stone-300">http://localhost:3000</code> en tu navegador.
            </p>
          </div>

          {/* Step 2: Save code */}
          <div className="p-5 rounded-2xl bg-[#0E1E16] border border-[#1C3D2C] space-y-3">
            <div className="flex items-center gap-2 text-[#D4A373] text-xs font-semibold uppercase tracking-wider">
              <Github className="w-4 h-4" />
              <span>2. Guardar el Código</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Repositorio Git</h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Guarda tus cambios en GitHub de forma gratuita:
            </p>
            <div className="p-2.5 bg-[#07120D] rounded-xl font-mono text-[11px] text-[#D4A373] space-y-1">
              <div>git init</div>
              <div>git add .</div>
              <div>git commit -m "SURARIO marca inicial"</div>
            </div>
            <p className="text-[11px] text-stone-400 font-light">
              GitHub ofrece repositorios ilimitados sin coste.
            </p>
          </div>

          {/* Step 3: Deploy for free */}
          <div className="p-5 rounded-2xl bg-[#0E1E16] border border-[#1C3D2C] space-y-3">
            <div className="flex items-center gap-2 text-[#D4A373] text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>3. Publicar Gratis</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Sugerencia de URL</h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Si se solicita una App URL o subdominio, sugiere <strong className="text-white">surario</strong> (o como alternativa <strong className="text-white">surario-patagonia</strong>).
            </p>
            <ul className="text-xs text-stone-300 space-y-1 list-disc pl-4 font-light">
              <li><strong>Vercel (Hobby):</strong> Despliegue estático 1 clic desde GitHub.</li>
              <li><strong>Netlify (Starter):</strong> 100 GB/mes gratuitos.</li>
              <li><strong>GitHub Pages:</strong> Compila con <code className="text-[#D4A373]">npm run build</code>.</li>
            </ul>
          </div>
        </div>

        {/* Limitations disclosure */}
        <div className="p-5 bg-[#0A1710] border border-[#1C3D2C] rounded-2xl space-y-2 text-xs">
          <strong className="text-[#D4A373] font-semibold block">
            Limitaciones honestas de la versión gratuita & Escalabilidad futura:
          </strong>
          <ul className="text-stone-300 space-y-1 list-disc pl-4 leading-relaxed font-light">
            <li>
              <strong>Formularios en cliente:</strong> Los formularios se registran en <code className="text-stone-200">localStorage</code>. Si en el futuro deseas recibir las consultas de proveedores en tu casilla de email sin coste, puedes vincularlo con el nivel gratuito de <em>Formspree</em> o <em>EmailJS</em> (50-200 envíos/mes gratis sin tarjeta).
            </li>
            <li>
              <strong>Base de datos compartida:</strong> Para sincronización multiusuario con miles de hoteles, puedes conectar una capa gratuita de <em>Supabase</em> o <em>Cloud SQL Developer</em> cuando la escala del proyecto lo requiera.
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
};
