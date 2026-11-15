import React, { useState, useEffect, useRef } from 'react';
import {
  PageId,
  Destination,
  Accommodation,
  Activity,
  Article,
  Language,
  Currency,
  CookieConsentPreferences,
} from './types';
import {
  DESTINATIONS,
  ACCOMMODATIONS,
  ACTIVITIES,
  ARTICLES,
} from './data/patagoniaData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DestinationModal } from './components/DestinationModal';
import { AccommodationModal } from './components/AccommodationModal';
import { ActivityModal } from './components/ActivityModal';
import { ArticleModal } from './components/ArticleModal';
import { CookieConsentModal } from './components/CookieConsentModal';
import { HomeView } from './components/views/HomeView';
import { DestinationsView } from './components/views/DestinationsView';
import { AccommodationsView } from './components/views/AccommodationsView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { ItinerariesView } from './components/views/ItinerariesView';
import { ArticlesView } from './components/views/ArticlesView';
import { ProviderView } from './components/views/ProviderView';
import { ContactView } from './components/views/ContactView';
import { MapView } from './components/views/MapView';
import { PoliticaPrivacidadView } from './components/views/PoliticaPrivacidadView';
import { PoliticaCookiesView } from './components/views/PoliticaCookiesView';
import { AvisoLegalView } from './components/views/AvisoLegalView';
import { TransparenciaAfiliacionView } from './components/views/TransparenciaAfiliacionView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { getStoredCookieConsent, trackEvent, initGoogleAnalytics } from './services/analyticsService';
import { testFirestoreConnection } from './services/firebase';
import { subscribeToAuthChanges } from './services/authService';
import { getLiveAccommodations, getLiveActivities } from './services/dataService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'inicio';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [liveAccommodations, setLiveAccommodations] = useState<Accommodation[]>(ACCOMMODATIONS);
  const [liveActivities, setLiveActivities] = useState<Activity[]>(ACTIVITIES);

  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem('surario_lang') as Language) || 'es';
    } catch {
      return 'es';
    }
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      return (localStorage.getItem('surario_curr') as Currency) || 'USD';
    } catch {
      return 'USD';
    }
  });

  const [cookieConsent, setCookieConsent] = useState<CookieConsentPreferences>(getStoredCookieConsent);
  const [isCookiePreferencesOpen, setIsCookiePreferencesOpen] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchDestinationId, setSearchDestinationId] = useState<string>('todos');

  const lastTrackedPageRef = useRef<string | null>(null);

  // Initialize GA4, Google Consent Mode, and Firebase health check on application bootstrap
  useEffect(() => {
    initGoogleAnalytics();
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state for the administrator
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((state) => {
      setIsAdminAuthenticated(state.isAdmin);
    });
    return () => unsubscribe();
  }, []);

  // Fetch live published listings from Firestore, with fallback to patagoniaData
  useEffect(() => {
    getLiveAccommodations(ACCOMMODATIONS).then(setLiveAccommodations);
    getLiveActivities(ACTIVITIES).then(setLiveActivities);
  }, [currentPage]);

  // URL / Hash routing for /admin and #admin
  useEffect(() => {
    const handleUrlRoute = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentPage('admin');
      }
    };
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Sync language with HTML tag, document title, and SEO meta
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('surario_lang', language);
    } catch {
      // ignore
    }
    if (currentPage === 'admin') {
      document.title = 'SURARIO — Panel de Administración';
      return;
    }

    if (language === 'en') {
      document.title = 'SURARIO — Patagonia Travel Guide & Journey Planner';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'SURARIO is an independent editorial travel guide and itinerary planner for Argentine and Chilean Patagonia, Tierra del Fuego, and the southern cone.');
      }
    } else {
      document.title = 'SURARIO — Guía Editorial de Viajes por la Patagonia Argentina y Chilena';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Portal editorial de viajes, naturaleza y planificación independiente por la Patagonia argentina y chilena, Tierra del Fuego y los canales australes.');
      }
    }
  }, [language, currentPage]);

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    trackEvent('language_changed', { language: newLang, previous_language: language });
  };

  const handleCurrencyChange = (newCurr: Currency) => {
    if (newCurr === currency) return;
    setCurrency(newCurr);
    try {
      localStorage.setItem('surario_curr', newCurr);
    } catch {
      // ignore
    }
    trackEvent('currency_changed', { currency: newCurr, previous_currency: currency });
  };

  // Track page navigation (deduplicated: only fires when currentPage genuinely transitions)
  useEffect(() => {
    if (lastTrackedPageRef.current === currentPage) return;
    lastTrackedPageRef.current = currentPage;

    if (currentPage !== 'admin') {
      trackEvent('page_view', {
        page_title: `SURARIO — ${currentPage}`,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_path: `/#${currentPage}`,
        page_id: currentPage,
        language,
      });
    }
  }, [currentPage]);

  // Handle ESC key to close any active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDestination(null);
        setSelectedAccommodation(null);
        setSelectedActivity(null);
        setSelectedArticle(null);
        setIsCookiePreferencesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    if (page === 'admin') {
      if (window.location.hash !== '#admin' && window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '#admin');
      }
    } else {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (destinationId: string, category: string) => {
    setSearchDestinationId(destinationId);
    trackEvent('search', {
      search_term: destinationId === 'todos' ? 'todos' : destinationId,
      destination_id: destinationId,
      category,
    });

    if (category === 'destinos') {
      if (destinationId !== 'todos') {
        const dest = DESTINATIONS.find((d) => d.id === destinationId);
        if (dest) {
          setSelectedDestination(dest);
          return;
        }
      }
      handleNavigate('destinos');
    } else if (category === 'alojamientos') {
      handleNavigate('alojamientos');
    } else if (category === 'excursiones') {
      handleNavigate('excursiones');
    } else if (category === 'itinerarios') {
      handleNavigate('itinerarios');
    } else {
      if (destinationId !== 'todos') {
        const dest = DESTINATIONS.find((d) => d.id === destinationId);
        if (dest) {
          setSelectedDestination(dest);
          return;
        }
      }
      handleNavigate('destinos');
    }
  };

  /* ==============================================================
   * ADMIN PORTAL VIEW (STANDALONE SECURE WORKSPACE)
   * ============================================================== */
  if (currentPage === 'admin') {
    if (isAdminAuthenticated) {
      return (
        <AdminDashboard
          onBackToPublic={() => handleNavigate('inicio')}
          language={language}
        />
      );
    }

    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
        }}
        onBackToPublic={() => handleNavigate('inicio')}
      />
    );
  }

  /* ==============================================================
   * PUBLIC PORTAL VIEW
   * ============================================================== */
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#142B1F] selection:text-white font-sans">
      
      {/* Top Header */}
      <Header
        currentPage={currentPage}
        language={language}
        currency={currency}
        onNavigate={handleNavigate}
        onLanguageChange={handleLanguageChange}
        onCurrencyChange={handleCurrencyChange}
        onSelectDestinationById={(id) => {
          const dest = DESTINATIONS.find((d) => d.id === id);
          if (dest) setSelectedDestination(dest);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'inicio' && (
          <HomeView
            language={language}
            currency={currency}
            onNavigate={handleNavigate}
            onSelectDestination={setSelectedDestination}
            onSelectAccommodation={setSelectedAccommodation}
            onSelectActivity={setSelectedActivity}
            onSelectArticle={setSelectedArticle}
            onSearch={handleSearch}
          />
        )}

        {currentPage === 'destinos' && (
          <DestinationsView
            onSelectDestination={setSelectedDestination}
            initialFilter={searchDestinationId}
            language={language}
          />
        )}

        {currentPage === 'mapa' && (
          <MapView
            language={language}
            onSelectDestination={setSelectedDestination}
            onNavigateToPlanner={() => handleNavigate('itinerarios')}
          />
        )}

        {currentPage === 'alojamientos' && (
          <AccommodationsView
            onSelectAccommodation={setSelectedAccommodation}
            initialDestinationFilter={searchDestinationId}
            language={language}
            currency={currency}
            accommodations={liveAccommodations}
          />
        )}

        {currentPage === 'excursiones' && (
          <ActivitiesView
            onSelectActivity={setSelectedActivity}
            initialDestinationFilter={searchDestinationId}
            language={language}
            currency={currency}
            activities={liveActivities}
          />
        )}

        {currentPage === 'itinerarios' && (
          <ItinerariesView language={language} currency={currency} />
        )}

        {currentPage === 'guias' && (
          <ArticlesView language={language} onSelectArticle={setSelectedArticle} />
        )}

        {currentPage === 'proveedores' && <ProviderView language={language} />}

        {currentPage === 'contacto-creditos' && <ContactView language={language} />}

        {currentPage === 'politica-privacidad' && (
          <PoliticaPrivacidadView onNavigate={handleNavigate} />
        )}

        {currentPage === 'politica-cookies' && (
          <PoliticaCookiesView
            onNavigate={handleNavigate}
            onOpenCookieSettings={() => setIsCookiePreferencesOpen(true)}
          />
        )}

        {currentPage === 'aviso-legal' && (
          <AvisoLegalView onNavigate={handleNavigate} />
        )}

        {currentPage === 'transparencia-afiliacion' && (
          <TransparenciaAfiliacionView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onNavigate={handleNavigate}
        onOpenCookieSettings={() => setIsCookiePreferencesOpen(true)}
      />

      {/* Cookie Consent Banner and Preferences Modal */}
      <CookieConsentModal
        preferences={cookieConsent}
        language={language}
        onUpdatePreferences={setCookieConsent}
        isOpenPreferencesModal={isCookiePreferencesOpen}
        onClosePreferencesModal={() => setIsCookiePreferencesOpen(false)}
        onNavigateToPolicy={() => handleNavigate('politica-cookies')}
      />

      {/* Modals for Deep Direct Details */}
      <DestinationModal
        destination={selectedDestination}
        accommodations={liveAccommodations}
        activities={liveActivities}
        language={language}
        onClose={() => setSelectedDestination(null)}
        onSelectAccommodation={(acc) => {
          setSelectedDestination(null);
          setSelectedAccommodation(acc);
        }}
        onSelectActivity={(act) => {
          setSelectedDestination(null);
          setSelectedActivity(act);
        }}
        onNavigate={handleNavigate}
      />

      <AccommodationModal
        accommodation={selectedAccommodation}
        language={language}
        currency={currency}
        onClose={() => setSelectedAccommodation(null)}
      />

      <ActivityModal
        activity={selectedActivity}
        language={language}
        currency={currency}
        onClose={() => setSelectedActivity(null)}
      />

      <ArticleModal
        article={selectedArticle}
        language={language}
        onClose={() => setSelectedArticle(null)}
      />

    </div>
  );
}
