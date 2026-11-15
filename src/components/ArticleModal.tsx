import React from 'react';
import { Article, Language } from '../types';
import { X, Clock, Calendar, User, CheckCircle2 } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  language?: Language;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  language = 'es',
}) => {
  if (!article) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-art-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF8F5] text-stone-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-stone-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer"
          aria-label={language === 'en' ? 'Close article' : 'Cerrar artículo'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Article header banner */}
        <div className="relative h-64 sm:h-80 w-full bg-stone-900 overflow-hidden">
          <SafeImage
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
          
          <div className="absolute bottom-5 left-6 right-6 text-white space-y-2">
            <span className="text-xs uppercase font-semibold tracking-widest text-amber-300">
              {article.category}
            </span>
            <h2
              id="modal-art-title"
              className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight"
            >
              {article.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span>{article.author}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{article.readTime}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{article.date}</span>
              </span>
            </div>
          </div>

          <div className="absolute top-4 left-4 z-10 text-[11px] text-stone-200 bg-black/40 px-2.5 py-1 rounded backdrop-blur-xs">
            {language === 'en' ? 'Photo:' : 'Foto:'} {article.photoCredit}
          </div>
        </div>

        {/* Article content */}
        <div className="p-6 sm:p-10 space-y-6 max-h-[calc(85vh-18rem)] overflow-y-auto">
          {/* Deck / Excerpt */}
          <p className="text-base sm:text-lg font-serif italic text-stone-700 leading-relaxed border-l-2 border-amber-600 pl-4 py-1">
            {article.excerpt}
          </p>

          {/* Article paragraphs */}
          <div className="space-y-4 text-stone-800 text-sm sm:text-base leading-relaxed">
            {article.content.map((paragraph, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-stone-900 first-letter:leading-none'
                    : ''
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Key Tips Box */}
          <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-lg space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-amber-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-800" />
              <span>{language === 'en' ? 'Key Takeaways & Author Recommendations' : 'Puntos Clave y Recomendaciones del Autor'}</span>
            </h3>
            <ul className="space-y-2">
              {article.keyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-800">
                  <span className="text-amber-800 font-bold mt-0.5">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Author Card */}
          <div className="p-4 bg-stone-100 rounded-lg border border-stone-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-300 text-stone-800 flex items-center justify-center font-serif font-bold text-sm">
              {article.author.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">{article.author}</h4>
              <p className="text-xs text-stone-500">{article.authorRole}</p>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-end pt-4 border-t border-stone-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#142B1F] hover:bg-[#1E3F30] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Close Reading' : 'Cerrar Lectura'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
