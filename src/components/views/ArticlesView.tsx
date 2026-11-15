import React from 'react';
import { ARTICLES } from '../../data/patagoniaData';
import { Article, Language } from '../../types';
import { BookOpen, Clock, Calendar, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { SafeImage } from '../SafeImage';

interface ArticlesViewProps {
  onSelectArticle: (article: Article) => void;
  language?: Language;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({
  onSelectArticle,
  language = 'es',
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title & SEO Hierarchy */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#2C7A9C]">
          <BookOpen className="w-4 h-4 text-[#D4A373]" />
          <span>{language === 'en' ? 'SURARIO · Travel Guides' : 'SURARIO · Guías de Viaje'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {language === 'en' ? 'Essential Guides to Travel across Patagonia' : 'Guías Esenciales para Viajar por la Patagonia'}
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-light">
          {language === 'en'
            ? 'Editorial insights curated by mountaineers, biologists, and local travelers. Critical knowledge on Patagonian wind patterns, border logistics, and protecting the fragile austral ecosystem.'
            : 'Textos editoriales elaborados por montañistas, biólogos y viajeros locales. Respuestas clave sobre el clima y el viento, trámites de aduana en el cruce de fronteras y protección del frágil ecosistema austral.'}
        </p>
      </div>

      {/* Featured Lead Article */}
      {ARTICLES.length > 0 && (
        <div
          onClick={() => onSelectArticle(ARTICLES[0])}
          className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
        >
          <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-stone-900">
            <SafeImage
              src={ARTICLES[0].image}
              alt={ARTICLES[0].title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F]/80 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 bg-[#142B1F]/85 text-[#D4A373] text-xs px-3.5 py-1 rounded-md font-semibold tracking-wider uppercase backdrop-blur-xs">
              {language === 'en' ? 'SURARIO Featured Guide' : 'Guía Destacada SURARIO'}
            </div>
            <div className="absolute bottom-3 left-4 text-xs text-stone-300 font-light">
              {language === 'en' ? 'Photo:' : 'Foto:'} {ARTICLES[0].photoCredit}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-[#142B1F]">{ARTICLES[0].category}</span>
                <span aria-hidden="true">·</span>
                <span>{ARTICLES[0].readTime}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors leading-tight">
                {ARTICLES[0].title}
              </h2>

              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-serif">
                {ARTICLES[0].excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#142B1F] text-[#D4A373] flex items-center justify-center font-bold text-xs">
                  {ARTICLES[0].author.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block">{ARTICLES[0].author}</span>
                  <span className="text-stone-500 text-[11px]">{ARTICLES[0].authorRole}</span>
                </div>
              </div>
              <span className="font-semibold text-[#142B1F] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                {language === 'en' ? 'Read Full Guide' : 'Leer Completo'} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {ARTICLES.slice(1).map((article) => (
          <div
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                <SafeImage
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142B1F]/70 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#142B1F]/80 text-[#D4A373] text-xs px-2.5 py-1 rounded font-medium">
                  {article.category}
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{article.readTime}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.date}</span>
                </div>

                <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-[#142B1F] transition-colors">
                  {article.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-serif">
                  {article.excerpt}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">{language === 'en' ? 'By' : 'Por'} {article.author}</span>
              <span className="font-semibold text-[#142B1F] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                {language === 'en' ? 'Read article' : 'Leer artículo'} <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sustainable ethics banner */}
      <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-stone-300 space-y-3">
        <h3 className="text-base font-serif font-bold text-[#142B1F] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2C7A9C]" />
          <span>{language === 'en' ? 'Conservation Principles & Ethical Hiking' : 'Principios de Conservación y Senderismo Ético'}</span>
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
          {language === 'en'
            ? 'Open campfires are strictly forbidden across national parks in Argentina and Chile. Following catastrophic historical fires in Torres del Paine, lighting camp stoves outside designated shelter zones results in immediate expulsion and legal prosecution. Always pack out all personal waste back to gateway cities.'
            : 'En los parques nacionales de Argentina y Chile está estrictamente prohibido hacer fuego en áreas no designadas. Tras los incendios históricos en Torres del Paine, las sanciones por encender hornillos fuera de refugios autorizados conllevan la expulsión inmediata del país. Recuerda regresar con todos tus residuos a los centros urbanos.'}
        </p>
      </div>

    </div>
  );
};
