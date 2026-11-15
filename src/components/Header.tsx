import React, { useState, useEffect, useRef } from 'react';
import { PageId, Language, Currency } from '../types';
import { Logo } from './Logo';
import { TRANSLATIONS } from '../utils/i18n';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Compass,
  Map as MapIcon,
  Route,
  Trees,
  Mountain,
  BedDouble,
  Footprints,
  BookOpen,
  Waves,
  Camera,
  ChevronRight,
  Globe,
  Coins,
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  language?: Language;
  currency?: Currency;
  onNavigate: (page: PageId) => void;
  onSelectDestinationById?: (id: string) => void;
  onLanguageChange?: (lang: Language) => void;
  onCurrencyChange?: (curr: Currency) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  language = 'es',
  currency = 'USD',
  onNavigate,
  onSelectDestinationById,
  onLanguageChange,
  onCurrencyChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'destinos' | 'experiencias' | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<'destinos' | 'experiencias' | null>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = TRANSLATIONS[language];

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDestination = (id: string) => {
    if (onSelectDestinationById) {
      onSelectDestinationById(id);
    } else {
      onNavigate('destinos');
    }
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleMouseEnter = (menu: 'destinos' | 'experiencias') => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Structured Curated Destinos by Zone
  const chileDestinos = [
    { id: 'puerto-varas', name: 'Puerto Varas & Llanquihue', sub: language === 'en' ? 'Volcanoes, lakes & heritage' : 'Volcanes, lagos y tradición' },
    { id: 'castro-chiloe', name: 'Chiloé & Archipiélago', sub: language === 'en' ? 'Palafitos, wooden churches & myths' : 'Palafitos, iglesias y mitos' },
    { id: 'carretera-austral', name: 'Carretera Austral & Aysén', sub: language === 'en' ? 'Route 7, Queulat & Marble caves' : 'Ruta 7, Queulat y Mármol' },
    { id: 'torres-del-paine', name: 'Torres del Paine & Natales', sub: language === 'en' ? 'Paine Massif & glacial fjords' : 'Macizo Paine y fiordos' },
  ];

  const argentinaDestinos = [
    { id: 'bariloche', name: 'Bariloche & Nahuel Huapi', sub: language === 'en' ? 'Andean lakes & alpine peaks' : 'Lagos andinos y montaña' },
    { id: 'san-martin-andes', name: 'San Martín & Ruta 7 Lagos', sub: language === 'en' ? 'Forests & glacial beaches' : 'Bosques y playas lacustres' },
    { id: 'el-calafate', name: 'El Calafate & Glaciares', sub: language === 'en' ? 'Perito Moreno & steppe' : 'Perito Moreno y estepa' },
    { id: 'el-chalten', name: 'El Chaltén (Fitz Roy)', sub: language === 'en' ? 'National trekking capital' : 'Capital nacional del trekking' },
    { id: 'ushuaia', name: 'Ushuaia & Fin del Mundo', sub: language === 'en' ? 'Beagle Channel & Tierra del Fuego' : 'Canal Beagle y Tierra del Fuego' },
  ];

  // Structured Experiencias Categories
  const experienciasCategories = [
    {
      title: t.trekkingMountain,
      desc: t.trekkingMountainDesc,
      icon: Mountain,
    },
    {
      title: t.glaciersNavigation,
      desc: t.glaciersNavigationDesc,
      icon: Waves,
    },
    {
      title: t.scenicRoutes,
      desc: t.scenicRoutesDesc,
      icon: Route,
    },
    {
      title: t.wildlifeEstancias,
      desc: t.wildlifeEstanciasDesc,
      icon: Trees,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors" ref={headerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          
          {/* Brand Wordmark & Emblem */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="group flex items-center cursor-pointer focus:outline-none text-left shrink-0"
            aria-label="SURARIO - Ir al inicio"
          >
            <Logo variant="dark" size="md" showDescriptor={true} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-stone-700" aria-label="Navegación principal">
            
            {/* 1. Explorar (Direct link to Geographic Leaflet Map) */}
            <button
              onClick={() => handleNavClick('mapa')}
              className={`py-2 px-1 tracking-wide transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'mapa'
                  ? 'text-[#142B1F] font-semibold border-b-2 border-[#142B1F]'
                  : 'text-stone-700 hover:text-[#142B1F]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-[#2C7A9C]" />
              <span>{t.exploreMap}</span>
            </button>

            {/* 2. Destinos Dropdown (Clean, structured dual-column without oversized menus) */}
            <div
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('destinos')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('destinos')}
                aria-expanded={activeDropdown === 'destinos'}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 py-1 px-1 tracking-wide transition-colors cursor-pointer ${
                  currentPage === 'destinos' || activeDropdown === 'destinos'
                    ? 'text-[#142B1F] font-semibold'
                    : 'text-stone-700 hover:text-[#142B1F]'
                }`}
              >
                <span>{t.navDestinations}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'destinos' ? 'rotate-180 text-[#142B1F]' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Destinos Dropdown Menu with smooth transition */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full w-[490px] bg-white rounded-2xl shadow-xl border border-stone-200/90 p-4 transition-all duration-200 origin-top z-50 ${
                  activeDropdown === 'destinos'
                    ? 'opacity-100 translate-y-1 visible pointer-events-auto'
                    : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-stone-100">
                  {/* Chile Column */}
                  <div>
                    <div className="flex items-center gap-1.5 pb-2 mb-1 border-b border-stone-100">
                      <span className="w-2 h-2 rounded-full bg-[#2C7A9C]"></span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        {t.chileanPatagonia}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {chileDestinos.map((dest) => (
                        <li key={dest.id}>
                          <button
                            onClick={() => handleSelectDestination(dest.id)}
                            className="w-full text-left p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors group cursor-pointer"
                          >
                            <span className="text-xs font-medium text-stone-800 group-hover:text-[#142B1F] flex items-center justify-between">
                              <span>{dest.name}</span>
                              <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-[#2C7A9C] group-hover:translate-x-0.5 transition-all" />
                            </span>
                            <span className="text-[11px] text-stone-400 block line-clamp-1">
                              {dest.sub}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Argentina Column */}
                  <div>
                    <div className="flex items-center gap-1.5 pb-2 mb-1 border-b border-stone-100">
                      <span className="w-2 h-2 rounded-full bg-[#D4A373]"></span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        {t.argentinePatagonia}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {argentinaDestinos.map((dest) => (
                        <li key={dest.id}>
                          <button
                            onClick={() => handleSelectDestination(dest.id)}
                            className="w-full text-left p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors group cursor-pointer"
                          >
                            <span className="text-xs font-medium text-stone-800 group-hover:text-[#142B1F] flex items-center justify-between">
                              <span>{dest.name}</span>
                              <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-[#142B1F] group-hover:translate-x-0.5 transition-all" />
                            </span>
                            <span className="text-[11px] text-stone-400 block line-clamp-1">
                              {dest.sub}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Quick Links */}
                <div className="pt-2.5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleNavClick('mapa')}
                    className="text-stone-500 hover:text-[#2C7A9C] flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-[#2C7A9C]" />
                    <span>{t.exploreMapSub}</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('destinos')}
                    className="text-[#142B1F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t.viewAllDestinations}</span>
                    <ArrowRight className="w-3 h-3 text-[#D4A373]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Experiencias Dropdown (Clean, curated category grid) */}
            <div
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('experiencias')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('excursiones')}
                aria-expanded={activeDropdown === 'experiencias'}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 py-1 px-1 tracking-wide transition-colors cursor-pointer ${
                  currentPage === 'excursiones' || activeDropdown === 'experiencias'
                    ? 'text-[#142B1F] font-semibold'
                    : 'text-stone-700 hover:text-[#142B1F]'
                }`}
              >
                <span>{t.experiencesTitle}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'experiencias' ? 'rotate-180 text-[#142B1F]' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Experiencias Dropdown Menu with smooth transition */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full w-[490px] bg-white rounded-2xl shadow-xl border border-stone-200/90 p-4 transition-all duration-200 origin-top z-50 ${
                  activeDropdown === 'experiencias'
                    ? 'opacity-100 translate-y-1 visible pointer-events-auto'
                    : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-100">
                  {experienciasCategories.map((exp, idx) => {
                    const IconComponent = exp.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavClick('excursiones')}
                        className="text-left p-2.5 rounded-xl border border-stone-100/90 hover:border-stone-300 hover:bg-[#FAF8F5] transition-all group cursor-pointer flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#142B1F] flex items-center justify-center shrink-0 transition-colors">
                          <IconComponent className="w-4 h-4 text-stone-700 group-hover:text-[#FAF8F5] transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-semibold text-stone-900 group-hover:text-[#142B1F]">
                              {exp.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-stone-500 font-light line-clamp-2 leading-snug">
                            {exp.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Bar */}
                <div className="pt-2.5 flex items-center justify-between text-xs">
                  <span className="text-stone-400 text-[11px]">
                    {t.verifiedExcursionsNotice}
                  </span>
                  <button
                    onClick={() => handleNavClick('excursiones')}
                    className="text-[#142B1F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t.viewAllExperiences}</span>
                    <ArrowRight className="w-3 h-3 text-[#D4A373]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Rutas */}
            <button
              onClick={() => handleNavClick('itinerarios')}
              className={`py-2 px-1 tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'itinerarios' ? 'text-[#142B1F] font-semibold border-b-2 border-[#142B1F]' : 'text-stone-700 hover:text-[#142B1F]'
              }`}
            >
              {t.routesNav}
            </button>

            {/* 5. Dónde dormir */}
            <button
              onClick={() => handleNavClick('alojamientos')}
              className={`py-2 px-1 tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'alojamientos' ? 'text-[#142B1F] font-semibold border-b-2 border-[#142B1F]' : 'text-stone-700 hover:text-[#142B1F]'
              }`}
            >
              {t.whereToStayNav}
            </button>

            {/* Secondary: Guías */}
            <button
              onClick={() => handleNavClick('guias')}
              className={`py-2 px-1 text-xs text-stone-500 hover:text-stone-900 tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'guias' ? 'text-[#142B1F] font-semibold' : ''
              }`}
            >
              {t.guidesNav}
            </button>
          </nav>

          {/* Right Area: Language, Currency, Primary Prominent Action «Planificar mi viaje» */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Language Switch */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => onLanguageChange && onLanguageChange('es')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'es' ? 'bg-[#142B1F] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Español"
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange && onLanguageChange('en')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'en' ? 'bg-[#142B1F] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-medium text-stone-700">
              <Coins className="w-3 h-3 text-stone-500" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value as Currency)}
                aria-label="Moneda"
                className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="CLP">CLP</option>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <button
              onClick={() => handleNavClick('itinerarios')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold tracking-wider uppercase rounded-xl bg-[#142B1F] hover:bg-[#1E3F30] text-[#D4A373] shadow-xs transition-all cursor-pointer"
            >
              <Route className="w-3.5 h-3.5" />
              <span>{t.navItineraries}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-[#142B1F] rounded-xl border border-stone-300 bg-white focus:outline-none cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Non-obstructive Mobile Backdrop Scrim */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-20 bg-stone-900/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Clean, intuitive, max-height bounded, easy to scroll and dismiss) */}
      {mobileMenuOpen && (
        <div className="relative z-40 lg:hidden border-b border-stone-200 bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 shadow-xl max-h-[calc(100vh-5.5rem)] overflow-y-auto">
          
          {/* Top Primary Mobile Action */}
          <button
            onClick={() => handleNavClick('itinerarios')}
            className="w-full p-3 bg-[#142B1F] text-[#D4A373] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Route className="w-4 h-4" />
            <span>{t.planTripButton} ({t.routesNav})</span>
          </button>

          {/* Collapsible Menu Items with Intuitive Hierarchy */}
          <div className="divide-y divide-stone-200/80 border-y border-stone-200/80">
            {/* Explorar (Real Geo Map) */}
            <button
              onClick={() => handleNavClick('mapa')}
              className="w-full py-3 text-left text-sm font-semibold text-stone-900 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-[#2C7A9C]" />
                <span>{t.exploreMapSub}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Destinos Accordion */}
            <div>
              <button
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'destinos' ? null : 'destinos')}
                className="w-full py-3 flex items-center justify-between text-left text-sm font-semibold text-stone-900"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#142B1F]" />
                  <span>{t.destinationsFeatured}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform ${
                    mobileExpandedSection === 'destinos' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileExpandedSection === 'destinos' && (
                <div className="pb-3 pl-2 pr-1 space-y-3 text-xs bg-stone-50/70 p-3 rounded-xl mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#2C7A9C] tracking-wider block mb-1.5">
                      {t.chileanPatagonia}
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {chileDestinos.map((dest) => (
                        <button
                          key={dest.id}
                          onClick={() => handleSelectDestination(dest.id)}
                          className="text-left py-1 px-2 rounded text-stone-700 hover:text-[#142B1F] hover:bg-stone-200/60 flex items-center justify-between"
                        >
                          <span>{dest.name}</span>
                          <ChevronRight className="w-3 h-3 text-stone-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D4A373] tracking-wider block mb-1.5">
                      {t.argentinePatagonia}
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {argentinaDestinos.map((dest) => (
                        <button
                          key={dest.id}
                          onClick={() => handleSelectDestination(dest.id)}
                          className="text-left py-1 px-2 rounded text-stone-700 hover:text-[#142B1F] hover:bg-stone-200/60 flex items-center justify-between"
                        >
                          <span>{dest.name}</span>
                          <ChevronRight className="w-3 h-3 text-stone-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavClick('destinos')}
                    className="w-full text-center py-2 text-xs font-semibold text-[#142B1F] bg-white border border-stone-200 rounded-lg hover:bg-stone-100"
                  >
                    {t.viewAllDestinations} →
                  </button>
                </div>
              )}
            </div>

            {/* Experiencias Accordion */}
            <div>
              <button
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'experiencias' ? null : 'experiencias')}
                className="w-full py-3 flex items-center justify-between text-left text-sm font-semibold text-stone-900"
              >
                <span className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-[#2C7A9C]" />
                  <span>{t.experiencesTitle}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform ${
                    mobileExpandedSection === 'experiencias' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileExpandedSection === 'experiencias' && (
                <div className="pb-3 pl-2 pr-1 space-y-2 text-xs bg-stone-50/70 p-3 rounded-xl mb-2">
                  {experienciasCategories.map((exp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavClick('excursiones')}
                      className="w-full text-left py-1.5 px-2 rounded text-stone-700 hover:text-[#142B1F] hover:bg-stone-200/60 flex items-center justify-between"
                    >
                      <span className="font-medium">{exp.title}</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </button>
                  ))}
                  <button
                    onClick={() => handleNavClick('excursiones')}
                    className="w-full text-center py-2 text-xs font-semibold text-[#142B1F] bg-white border border-stone-200 rounded-lg hover:bg-stone-100"
                  >
                    {t.viewAllExperiences} →
                  </button>
                </div>
              )}
            </div>

            {/* Rutas */}
            <button
              onClick={() => handleNavClick('itinerarios')}
              className="w-full py-3 text-left text-sm font-semibold text-stone-900 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Route className="w-4 h-4 text-stone-600" />
                <span>{t.routesNav}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Dónde dormir */}
            <button
              onClick={() => handleNavClick('alojamientos')}
              className="w-full py-3 text-left text-sm font-semibold text-stone-900 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-stone-600" />
                <span>{t.whereToStayNav}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Secondary: Guías */}
            <button
              onClick={() => handleNavClick('guias')}
              className="w-full py-3 text-left text-xs text-stone-600 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                <span>{t.guidesNav}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
            <button
              onClick={() => handleNavClick('proveedores')}
              className="hover:text-stone-800 underline font-medium"
            >
              {t.navProviders}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              {t.closeMenu}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

