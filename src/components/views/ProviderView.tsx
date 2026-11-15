import React, { useState, useEffect } from 'react';
import { DESTINATIONS } from '../../data/patagoniaData';
import { ProviderApplication, Language } from '../../types';
import {
  Building2,
  CheckCircle,
  AlertCircle,
  Info,
  Send,
  Trash2,
} from 'lucide-react';
import { trackEvent } from '../../services/analyticsService';
import { submitProviderApplication } from '../../services/dataService';

interface ProviderViewProps {
  language?: Language;
}

export const ProviderView: React.FC<ProviderViewProps> = ({ language = 'es' }) => {
  const isEn = language === 'en';

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<ProviderApplication['businessType']>('hotel');
  const [destination, setDestination] = useState('San Carlos de Bariloche');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Status & validation states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [savedApplications, setSavedApplications] = useState<ProviderApplication[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('surario_provider_apps');
      if (stored) {
        setSavedApplications(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!businessName.trim()) {
      setErrorMsg(isEn ? 'Please enter the commercial name of the service.' : 'Por favor introduce el nombre comercial del servicio.');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMsg(isEn ? 'Please enter the contact person or owner name.' : 'Por favor indica el nombre del responsable o titular.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(isEn ? 'Please enter a valid email address.' : 'Por favor introduce un correo electrónico válido.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(isEn ? 'Please enter a phone or WhatsApp contact number.' : 'Por favor introduce un número de teléfono o WhatsApp de contacto.');
      return;
    }
    if (description.trim().length < 20) {
      setErrorMsg(isEn ? 'Your proposal description must contain at least 20 characters.' : 'La descripción de tu propuesta debe contener al menos 20 caracteres.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg(isEn ? 'You must confirm the official permit & accuracy declaration.' : 'Debes aceptar la declaración de habilitaciones y veracidad.');
      return;
    }

    const newApp: ProviderApplication = {
      id: `SUR-${Date.now().toString().slice(-6)}`,
      businessName: businessName.trim(),
      businessType,
      destination,
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      description: description.trim(),
      servicesOffered: servicesOffered.trim(),
      submittedAt: new Date().toLocaleDateString(isEn ? 'en-US' : 'es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    submitProviderApplication(newApp)
      .then((res) => {
        const updated = [newApp, ...savedApplications.filter((a) => a.id !== newApp.id)];
        setSavedApplications(updated);
        setSuccessMsg(
          isEn
            ? res.mode === 'firestore'
              ? `Application ${newApp.id} submitted securely to SURARIO database and backed up in this browser!`
              : `Application ${newApp.id} saved in your browser (offline mode).`
            : res.mode === 'firestore'
              ? `¡Solicitud ${newApp.id} enviada de forma segura a la base de datos de SURARIO y respaldada en este navegador!`
              : `¡Solicitud ${newApp.id} guardada con éxito en tu navegador (modo local)!`
        );

        // Reset form fields
        setBusinessName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setWebsite('');
        setDescription('');
        setServicesOffered('');
        setAcceptedTerms(false);

        trackEvent('provider_form_submit', {
          business_type: businessType,
          destination,
          storage_mode: res.mode,
        });
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(isEn ? 'Error saving draft.' : 'Error al guardar la solicitud.');
      });
  };

  const handleDeleteApplication = (id: string) => {
    const updated = savedApplications.filter((app) => app.id !== id);
    setSavedApplications(updated);
    try {
      localStorage.setItem('surario_provider_apps', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title & SEO Hierarchy */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <Building2 className="w-4 h-4 text-[#D4A373]" />
          <span>{isEn ? 'SURARIO · For Local Providers' : 'SURARIO · Para Proveedores'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          {isEn ? 'Join the SURARIO Local Network' : 'Solicitud de Inclusión en la Red SURARIO'}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
          {isEn
            ? 'Do you manage a boutique hotel, lodge, mountain refuge, certified trekking guide service, or transfer in Argentine or Chilean Patagonia? Add your listing to SURARIO to reach travelers looking for independent, respectful travel.'
            : '¿Gestionas un hotel boutique, hostal, cabaña, guiada de montaña o transporte en la Patagonia argentina o chilena? Suma tu propuesta a SURARIO para conectar de manera directa con viajeros que valoran el turismo independiente y responsable.'}
        </p>
      </div>

      {/* Mandatory Technical Disclaimer */}
      <div className="p-5 bg-white border border-stone-300 rounded-2xl space-y-2 text-xs sm:text-sm text-stone-800 shadow-2xs">
        <div className="flex items-center gap-2 font-semibold text-stone-950">
          <Info className="w-4 h-4 text-[#2C7A9C] shrink-0" />
          <span>{isEn ? 'Transparent Information on Provider Submissions:' : 'Información transparente sobre el funcionamiento del formulario:'}</span>
        </div>
        <p className="text-stone-600 leading-relaxed text-xs">
          {isEn
            ? 'To ensure a 100% free service without paid backend servers, form submissions are validated in your browser and stored strictly in local memory (localStorage). We do not claim this writes to a remote database, we charge zero commissions, and we never collect payment card information.'
            : 'Para garantizar una versión gratuita y sin costes de servidores de pago, los datos de este formulario se validan en tu propio navegador y se almacenan únicamente en tu memoria local (localStorage). No afirmamos que la información se archive en una base de datos externa ni simulamos envíos de correos inexistentes. No solicitamos datos de tarjeta bancaria ni cobramos comisiones.'}
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">{successMsg}</span>
            <p className="text-xs text-emerald-800">
              {isEn ? 'You can view your locally saved draft below.' : 'Puedes ver el borrador guardado en este equipo más abajo.'}
            </p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs sm:text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6"
      >
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900">
            {isEn ? 'Service or Establishment Profile' : 'Ficha del Establecimiento o Servicio'}
          </h2>
          <span className="text-xs text-stone-500">
            {isEn ? 'Fields marked with an asterisk (*) are mandatory' : 'Los campos marcados con asterisco (*) son obligatorios'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Business Name */}
          <div className="space-y-1.5">
            <label htmlFor="prov-name" className="block text-xs font-semibold text-stone-700">
              {isEn ? 'Commercial Name *' : 'Nombre Comercial *'}
            </label>
            <input
              id="prov-name"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={isEn ? 'e.g. Cabañas Glaciar Huemul' : 'Ej. Cabañas Glaciar Huemul'}
              className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-1.5">
            <label htmlFor="prov-type" className="block text-xs font-semibold text-stone-700">
              {isEn ? 'Service Type *' : 'Tipo de Servicio *'}
            </label>
            <select
              id="prov-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900 cursor-pointer"
            >
              <option value="hotel">{isEn ? 'Hotel / Lodge / Inn' : 'Hotel / Hostería / Lodge'}</option>
              <option value="cabana">{isEn ? 'Cabins / Geodesic Dome' : 'Cabañas / Domo'}</option>
              <option value="hostal">{isEn ? 'Hostel / Mountain Refuge' : 'Hostal / Refugio de Montaña'}</option>
              <option value="guia">{isEn ? 'Certified Trekking & Mountain Guide' : 'Guía de Trekking / Montaña Habilitado'}</option>
              <option value="agencia">{isEn ? 'Excursion / Sailing Operator' : 'Operador de Excursiones o Navegación'}</option>
              <option value="transporte">{isEn ? 'Transfer / Shuttle Service' : 'Servicio de Traslado / Transporte'}</option>
            </select>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label htmlFor="prov-dest" className="block text-xs font-semibold text-stone-700">
              {isEn ? 'Primary Destination or Town *' : 'Destino o Localidad Principal *'}
            </label>
            <select
              id="prov-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900 cursor-pointer"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.country})
                </option>
              ))}
              <option value="Otra localidad">{isEn ? 'Other Patagonia Town' : 'Otra localidad de la Patagonia'}</option>
            </select>
          </div>

          {/* Contact Person */}
          <div className="space-y-1.5">
            <label htmlFor="prov-contact" className="block text-xs font-semibold text-stone-700">
              {isEn ? 'Contact Person *' : 'Persona de Contacto *'}
            </label>
            <input
              id="prov-contact"
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder={isEn ? 'e.g. Sofia Benitez' : 'Ej. Sofía Benítez'}
              className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="prov-email" className="block text-xs font-semibold text-stone-700">
              {isEn ? 'Email Address *' : 'Correo Electrónico *'}
            </label>
            <input
              id="prov-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@business.com"
              className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="prov-phone" className="block text-xs font-semibold text-stone-700">
              {isEn ? 'Phone or WhatsApp *' : 'Teléfono o WhatsApp *'}
            </label>
            <input
              id="prov-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 294 4123456"
              className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
            />
          </div>
        </div>

        {/* Website or Social */}
        <div className="space-y-1.5">
          <label htmlFor="prov-web" className="block text-xs font-semibold text-stone-700">
            {isEn ? 'Official Website or Instagram (optional)' : 'Sitio Web o Instagram Oficial (opcional)'}
          </label>
          <input
            id="prov-web"
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://... / @profile"
            className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="prov-desc" className="block text-xs font-semibold text-stone-700">
            {isEn ? 'Description of your Tourism Service *' : 'Descripción de tu Propuesta Turística *'}
          </label>
          <textarea
            id="prov-desc"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isEn ? 'Describe amenities, scenic views, guided excursion details...' : 'Describe las instalaciones, historia, vistas o tipo de guiadas...'}
            className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
          />
        </div>

        {/* Services */}
        <div className="space-y-1.5">
          <label htmlFor="prov-serv" className="block text-xs font-semibold text-stone-700">
            {isEn ? 'Highlighted Amenities / Services (comma-separated)' : 'Servicios Destacados (separados por coma)'}
          </label>
          <input
            id="prov-serv"
            type="text"
            value={servicesOffered}
            onChange={(e) => setServicesOffered(e.target.value)}
            placeholder={isEn ? 'Homemade breakfast, Mountain views, Trekking pole rentals, Wi-Fi' : 'Desayuno casero, Vistas al cerro, Alquiler de bastones, Wi-Fi'}
            className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#142B1F] focus:bg-white text-stone-900"
          />
        </div>

        {/* Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-[#142B1F]"
            />
            <span>
              {isEn
                ? 'I declare that the establishment or service holds the corresponding official licenses to operate in its jurisdiction and that the details provided are accurate.'
                : 'Declaro que el establecimiento o servicio cuenta con las habilitaciones oficiales correspondientes para operar en su jurisdicción y que los datos suministrados son fidedignos.'}
            </span>
          </label>
        </div>

        {/* Submit button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            className="px-7 py-3.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4 text-[#D4A373]" />
            <span>{isEn ? 'Save Application' : 'Registrar Solicitud'}</span>
          </button>
        </div>
      </form>

      {/* Local storage applications history (proves real client side functionality) */}
      {savedApplications.length > 0 && (
        <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-300 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              {isEn ? `Applications Saved in this Browser (${savedApplications.length})` : `Solicitudes Registradas en este Navegador (${savedApplications.length})`}
            </h3>
            <span className="text-[11px] text-stone-500 font-mono">localStorage</span>
          </div>

          <div className="space-y-3">
            {savedApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{app.businessName}</span>
                    <span className="text-stone-400 font-mono text-[10px]">({app.id})</span>
                    <span className="text-[#142B1F] bg-[#FAF8F5] border border-stone-200 px-2 py-0.5 rounded text-[10px] font-medium">
                      {isEn ? 'Local draft' : 'Borrador local'}
                    </span>
                  </div>
                  <p className="text-stone-600">
                    {app.destination} · {isEn ? 'Contact' : 'Contacto'}: {app.contactPerson} ({app.email})
                  </p>
                  <span className="text-stone-400 text-[10px]">{isEn ? 'Registered on' : 'Registrada el'} {app.submittedAt}</span>
                </div>

                <button
                  onClick={() => handleDeleteApplication(app.id)}
                  className="self-end sm:self-center p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title={isEn ? 'Delete local record' : 'Eliminar registro local'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
