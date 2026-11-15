import React, { useState } from 'react';
import { Accommodation, Activity, Language } from '../../types';
import { SafeImage } from '../SafeImage';
import { Star, MapPin, Check, ExternalLink, X, Globe, Eye } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'accommodation' | 'activity';
  item: Accommodation | Activity | null;
  onPublishClick?: () => void;
}

export function PreviewModal({
  isOpen,
  onClose,
  type,
  item,
  onPublishClick,
}: PreviewModalProps) {
  const [previewLang, setPreviewLang] = useState<Language>('es');

  if (!isOpen || !item) return null;

  const isPublished = item.published === true;
  const isAccommodation = type === 'accommodation';
  const acc = isAccommodation ? (item as Accommodation) : null;
  const act = !isAccommodation ? (item as Activity) : null;

  const isEn = previewLang === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-[#FAF8F5] text-stone-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-300 my-8 flex flex-col max-h-[90vh]">
        
        {/* Top Control Bar (Admin only) */}
        <div className="bg-[#142B1F] text-stone-100 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#214332]">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold block">
                Vista Previa Editorial
              </span>
              <span className="text-[11px] text-stone-300">
                {isPublished ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Publicado en SURARIO (visible para visitantes)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Borrador Privado (No visible públicamente)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="inline-flex items-center bg-[#1c382a] p-1 rounded-xl border border-[#2e523f] text-xs">
              <button
                type="button"
                onClick={() => setPreviewLang('es')}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  previewLang === 'es'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🇪🇸 Español
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  previewLang === 'en'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Quick Publish if draft */}
            {!isPublished && onPublishClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPublishClick();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                Publicar Ficha
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-[#1f3f2f] transition-colors cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Faithful rendering of public SURARIO ficha */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          
          {/* Hero Banner */}
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg bg-stone-200">
            <SafeImage
              src={item.image}
              alt={isAccommodation ? acc?.name || '' : act?.title || ''}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/90 text-stone-900 font-semibold backdrop-blur-sm shadow-md">
                {isAccommodation ? acc?.typeLabel || acc?.type : act?.categoryLabel || act?.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#142B1F]/90 text-amber-300 font-semibold backdrop-blur-sm shadow-md">
                {item.country}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs uppercase font-mono tracking-widest text-amber-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {item.destinationName}
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                {isAccommodation
                  ? (isEn && acc?.nameEn ? acc.nameEn : acc?.name)
                  : (isEn && act?.titleEn ? act.titleEn : act?.title || act?.name)}
              </h2>
            </div>
          </div>

          {/* Key Facts Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isAccommodation ? (
              <>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Rating' : 'Valoración'}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold text-stone-900">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{acc?.rating || 4.8} / 5</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Category' : 'Categoría'}
                  </span>
                  <span className="text-sm font-bold text-stone-900 capitalize">
                    {acc?.type}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Price Range' : 'Rango Tarifario'}
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {acc?.priceRange || 'Medio'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Indicative Price' : 'Tarifa Orientativa'}
                  </span>
                  <span className="text-sm font-bold text-[#142B1F]">
                    {acc?.indicativePrice || `${acc?.currency || 'USD'} ${acc?.pricePerNight || 120} / noche`}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Duration' : 'Duración'}
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {isEn && act?.durationEn ? act.durationEn : act?.duration}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Difficulty' : 'Dificultad'}
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {act?.difficulty || 'Moderada'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Best Season' : 'Mejor Época'}
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {act?.bestSeason || 'Noviembre a Abril'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block mb-0.5">
                    {isEn ? 'Price' : 'Tarifa'}
                  </span>
                  <span className="text-sm font-bold text-[#142B1F]">
                    {act?.indicativePrice || `${act?.currency || 'USD'} ${act?.price || 75}`}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {isEn ? 'Overview & Highlights' : 'Descripción y Características'}
            </h3>
            
            <p className="text-stone-700 leading-relaxed text-sm">
              {isAccommodation
                ? (isEn && acc?.longDescriptionEn ? acc.longDescriptionEn : acc?.longDescription || acc?.shortDescription)
                : (isEn && act?.fullDescriptionEn ? act.fullDescriptionEn : act?.fullDescription || act?.shortDescription)}
            </p>
          </div>

          {/* Amenities / Included Tags */}
          <div className="space-y-3 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-serif text-base font-bold text-stone-900">
              {isAccommodation
                ? (isEn ? 'Services & Amenities' : 'Servicios y Comodidades')
                : (isEn ? 'What is Included' : 'Servicios Incluidos')}
            </h3>

            <div className="flex flex-wrap gap-2">
              {isAccommodation ? (
                (isEn && acc?.amenitiesEn && acc.amenitiesEn.length > 0
                  ? acc.amenitiesEn
                  : acc?.amenities || []
                ).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))
              ) : (
                (isEn && act?.includedEn && act.includedEn.length > 0
                  ? act.includedEn
                  : act?.included || []
                ).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Action / Booking Preview */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-amber-800 font-bold block">
                {isEn ? 'Commercial Channel' : 'Canal de Reserva'}
              </span>
              <p className="text-xs text-amber-900 mt-0.5">
                {isAccommodation
                  ? acc?.bookingProvider || 'SURARIO Partner Direct'
                  : act?.operatorName || 'Operador Local Verificado'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#142B1F] text-amber-300 text-xs font-medium shadow-md">
              <span>{isEn ? 'External Booking Link' : 'Enlace Oficial de Reserva'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>ID Ficha: <code className="font-mono text-stone-700">{item.id}</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium transition-colors cursor-pointer"
          >
            Cerrar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
}
