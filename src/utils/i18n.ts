import { Language, Currency } from '../types';

export const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  CLP: 0.00102, // ~980 CLP per USD
  ARS: 0.00085, // ~1180 ARS per USD
};

export function convertPrice(
  amount: number,
  from: 'ARS' | 'CLP',
  to: Currency
): { convertedAmount: number; symbol: string; text: string } {
  if (from === to) {
    return {
      convertedAmount: amount,
      symbol: '$',
      text: `${amount.toLocaleString()} ${to}`,
    };
  }

  // Convert to USD first
  const amountInUSD = amount * RATES_TO_USD[from];
  // Convert to target
  const targetRate = RATES_TO_USD[to];
  const converted = Math.round(amountInUSD / targetRate);

  let symbol = '$';
  if (to === 'EUR') symbol = '€';
  if (to === 'USD') symbol = '$';
  if (to === 'CLP' || to === 'ARS') symbol = '$';

  return {
    convertedAmount: converted,
    symbol,
    text: `${symbol}${converted.toLocaleString()} ${to}`,
  };
}

export const TRANSLATIONS = {
  es: {
    // Header & Nav
    brandDescriptor: 'Guía de viajes por la Patagonia argentina y chilena',
    tagline: 'La Patagonia, mejor descubierta',
    navDestinations: 'Destinos',
    navExperiences: 'Experiencias',
    navAccommodations: 'Alojamientos',
    navActivities: 'Excursiones',
    navItineraries: 'Planificador',
    navMap: 'Mapa Austral',
    navGuides: 'Guías de Viaje',
    navProviders: 'Registrar Empresa',
    navContact: 'Contacto & Créditos',
    exploreNow: 'Explorar',
    changeLanguage: 'Idioma',
    changeCurrency: 'Moneda',
    exploreMap: 'Explorar mapa',
    exploreMapSub: 'Explorar mapa geográfico',
    destinationsFeatured: 'Destinos destacados',
    chileanPatagonia: 'Patagonia Chilena',
    argentinePatagonia: 'Patagonia Argentina',
    viewAllDestinations: 'Ver todos los destinos',
    experiencesTitle: 'Experiencias',
    trekkingMountain: 'Trekking & Montaña',
    trekkingMountainDesc: 'Fitz Roy, Cerro Torre, Dientes de Navarino y Torres del Paine',
    glaciersNavigation: 'Glaciares & Navegación',
    glaciersNavigationDesc: 'Perito Moreno, Glaciar Grey, fiordos y canales fueguinos',
    scenicRoutes: 'Rutas Escénicas',
    scenicRoutesDesc: 'Carretera Austral Ruta 7, mítica Ruta 40 y Paso Samoré',
    wildlifeEstancias: 'Vida Silvestre & Estancias',
    wildlifeEstanciasDesc: 'Avistamiento de fauna, cóndores, pingüinos y cultura gaucha',
    verifiedExcursionsNotice: 'Excursiones verificadas con guías locales',
    viewAllExperiences: 'Ver todas las experiencias',
    routesNav: 'Rutas',
    whereToStayNav: 'Dónde dormir',
    guidesNav: 'Guías',
    planTripButton: 'Planificar mi viaje',
    closeMenu: 'Cerrar menú',
    openMenu: 'Abrir menú de navegación',

    // Hero & Home
    heroKicker: 'SURARIO · Guía de viajes por la Patagonia',
    heroTitle: 'La Patagonia, mejor descubierta',
    heroSubtitle:
      'Encuentra lugares extraordinarios de norte a sur, descubre experiencias locales y planifica tu próxima aventura entre Argentina y Chile con rigor geográfico.',
    exploreDestinationsBtn: 'Explorar destinos',
    planTripBtn: 'Planificar mi viaje',
    viewOnMapBtn: 'Ver en el mapa',
    searchDestinationLabel: 'Destino o región',
    searchAllPatagonia: 'Toda la Patagonia (Todos los destinos)',
    searchExploreLabel: '¿Qué deseas explorar?',
    searchAllPortal: 'Explorar todo',
    searchDestinationsOption: 'Destinos principales (Fichas & Mapas)',
    searchActivitiesOption: 'Qué hacer (Trekking & Glaciares)',
    searchStaysOption: 'Dónde dormir (Hoteles & Cabañas)',
    searchItinerariesOption: 'Rutas e itinerarios (7 a 21 días)',
    searchButton: 'Buscar',
    searchPlaceholder: '¿A dónde quieres viajar?',
    searchAction: 'Buscar',
    allDestinations: 'Todos los destinos',
    trustPointPhotos: 'Fotografías documentales verificadas',
    trustPointRegions: '4 Regiones biogeográficas',
    trustPointIndependent: 'Acceso libre e independiente',

    // Regional Section
    geoNorthToSouth: 'Geografía de Norte a Sur',
    fourRegionsTitle: 'Cuatro macro-regiones para comprender la Patagonia',
    fourRegionsDesc:
      'Una extensión de más de 2.000 kilómetros dividida por la cordillera andina y esculpida por campos de hielo milenarios.',
    exploreRegion: 'Explorar región',
    spotlightTitle: 'Destinos Esenciales',
    spotlightSubtitle: 'Lugares que definen el carácter indómito del fin del mundo',
    viewFullGuide: 'Ver Guía Completa',
    viewFullDetails: 'Ver Detalles',
    itinerariesSectionTitle: 'Rutas e Itinerarios Recomendados',
    itinerariesSectionSubtitle: 'Travesías probadas sobre el terreno para viajar por carretera, barco o autobús',
    viewPlanner: 'Abrir planificador',
    accommodationsSectionTitle: 'Alojamientos con Identidad Patagónica',
    accommodationsSectionSubtitle: 'Hoteles boutique, eco-lodges y cabañas de madera con chimenea',
    viewAllStays: 'Ver todos los alojamientos',
    activitiesSectionTitle: 'Experiencias & Excursiones en Terreno',
    activitiesSectionSubtitle: 'Actividades verificadas para conectar con la naturaleza salvaje',
    viewAllTours: 'Ver todas las excursiones',
    guidesSectionTitle: 'Cuaderno de Viaje & Guías Prácticas',
    guidesSectionSubtitle: 'Consejos de equipamiento, cruces de frontera, clima y logística',
    readArticles: 'Leer todas las guías',
    providerBannerTitle: '¿Operas un hotel, excursión o servicio en la Patagonia?',
    providerBannerDesc:
      'Súmate al directorio editorial de SURARIO. Revisamos personalmente cada propuesta para ofrecer información rigurosa a viajeros de todo el mundo.',
    providerBannerBtn: 'Registrar mi empresa',

    // Weather widget
    weatherTitle: 'Tiempo & Viento Austral en Tiempo Real',
    weatherSubtitle: 'Datos meteorológicos satelitales en vivo vía Open-Meteo sin costes de API',
    weatherApparent: 'Sensación',
    weatherWind: 'Viento',
    weatherGusts: 'Ráfagas',
    weatherRain: 'Precipitación',
    weatherForecast3d: 'Pronóstico a 3 días',
    weatherWarning: 'Atención: en la Patagonia el viento condiciona navegaciones y pasos de montaña.',

    // Verification badges
    verifiedOfficial: 'Verificado Oficial',
    pendingVerification: 'Pendiente de verificación en terreno',
    seasonalAccess: 'Paso estacional',
    officialParkSite: 'Sitio oficial de Parques',
    verifiedNote: 'Información contrastada con organismos oficiales (CONAF / Parques Nacionales / WCS)',

    // Commercial, Affiliate & Recommendations (Priority 2)
    whereToStayTitle: 'Dónde alojarse',
    toursExperiencesTitle: 'Tours y experiencias recomendadas',
    affiliateBadge: 'Colaborador verificado',
    officialSiteBadge: 'Sitio oficial del prestador',
    checkWithProvider: 'Consultar con el proveedor',
    checkAvailability: 'Consultar disponibilidad',
    contactOperator: 'Consultar con operador local',
    bookOfficial: 'Reservar en web oficial',
    checkOnSite: 'Consultar disponibilidad en destino',
    affiliateNotice:
      'Transparencia editorial: los enlaces externos dirigen a proveedores autorizados y plataformas oficiales. SURARIO puede percibir una comisión de afiliación que sostiene nuestra investigación independiente sin incrementar jamás el precio para el viajero.',
    affiliateNoticeShort:
      'Enlace externo: puede generar una comisión para SURARIO sin ningún coste adicional para ti.',
    noDirectLinksWarning:
      'Esta recomendación no tiene enlace comercial directo disponible; la reserva o contacto se gestiona en destino o mediante sus vías locales autorizadas.',

    // Modals & Details
    overviewTab: 'Panorama General',
    weatherTab: 'Clima en vivo',
    howToArrive: 'Cómo llegar',
    bestSeason: 'Mejor época',
    physicalDemand: 'Exigencia física',
    technicalDemand: 'Dificultad técnica',
    recommendedDays: 'Días sugeridos',
    servicesTitle: 'Servicios en el terreno',
    waterAvailable: 'Agua potable disponible',
    noWater: 'Sin agua potable garantizada (llevar filtro)',
    cellSignalYes: 'Conectividad móvil disponible',
    cellSignalNo: 'Sin señal de telefonía (zona remota)',
    rangersYes: 'Guardaparques permanentes',
    rangersNo: 'Sin puesto fijo de guardaparques',
    sheltersYes: 'Refugios o campamentos habilitados',
    emergencyEvac: 'Plan de evacuación médica',
    minEquipment: 'Equipamiento indispensable',
    close: 'Cerrar',
    keyHighlights: 'Puntos destacados',
    addToRoute: 'Añadir a mi ruta',
    addedToRoute: 'Añadido a tu plan',
    filterBy: 'Filtrar por',
    clearFilters: 'Limpiar filtros',
    noResults: 'No se encontraron resultados con los criterios seleccionados.',

    // Itineraries & Planner
    itinerariesMasterTitle: 'Rutas e Itinerarios por la Patagonia',
    itinerariesMasterDesc:
      'La Patagonia es inmensa y las distancias entre valles y glaciares exigen una planificación realista. Explora nuestras tres rutas maestras estructuradas o diseña tu itinerario personalizado con la herramienta de SURARIO de 5 a 21 días.',
    curatedRoutesTab: 'Rutas Maestras Curadas',
    customPlannerTab: 'Diseñador de Viaje Personalizado',
    tripDuration: 'Duración del viaje',
    daysLabel: 'días',
    startingPoint: 'Punto de partida',
    travelStyle: 'Estilo de viaje',
    styleBinational: 'Binacional Completo (Argentina + Chile)',
    styleCarreteraAustral: 'Carretera Austral & Fiordos (Chile)',
    styleLagosNorte: 'Ruta de los 7 Lagos & Bosques (Norte)',
    styleAustralGlaciares: 'Glaciares & Fin del Mundo (Sur)',
    saveCustomPlan: 'Guardar mi itinerario',
    planSavedAlert: '¡Itinerario guardado en este navegador!',
    printItinerary: 'Imprimir / Guardar en PDF',
    pinnedDestinations: 'Tus destinos seleccionados',
    noPinnedDestinations: 'No has agregado destinos aún. Explora el mapa o los destinos y pulsa «Añadir a mi ruta».',
    dayByDay: 'Itinerario día a día',

    // Stays / Accommodations & Tours / Activities Views
    accommodationsTitle: 'Dónde Dormir en la Patagonia',
    accommodationsSubtitle:
      'Selección de hoteles boutique, eco-lodges, cabañas de madera con chimenea y hostales de montaña para senderistas. Filtra por destino, tipología y presupuesto orientativo.',
    filterDestination: 'Destino',
    filterType: 'Tipo de Alojamiento',
    filterPrice: 'Presupuesto Orientativo',
    filterCategory: 'Categoría',
    filterDifficulty: 'Dificultad',
    filterCountry: 'País',
    allCountries: 'Todos los países',
    onlyRemote: 'Solo zonas remotas',
    indicativePriceLabel: 'Tarifa orientativa',
    viewDetailsLabel: 'Ver Detalles',
    viewGuideLabel: 'Ver Guía de Actividad',
    activitiesTitle: 'Qué Hacer en la Patagonia: Excursiones & Actividades',
    activitiesSubtitle:
      'Senderismo frente a agujas de granito, caminatas con grampones sobre campos de hielo, navegaciones entre colonias de pingüinos y rutas panorámicas por los Andes australes.',

    // Map View
    mapTitle: 'Mapa Geográfico de la Patagonia',
    mapSubtitle:
      'Cartografía real con OpenStreetMap y Leaflet. Explora destinos desde el paralelo 38°S hasta el Cabo de Hornos sin costes de API.',
    backToGrid: 'Ver en cuadrícula',

    // Forms: Contact & Provider
    contactTitle: 'Contacto & Créditos Fotográficos',
    contactSubtitle:
      'SURARIO es un proyecto editorial independiente dedicado a documentar la geografía y el turismo de la Patagonia argentina y chilena.',
    yourName: 'Tu nombre completo',
    yourEmail: 'Correo electrónico',
    subjectLabel: 'Asunto de la consulta',
    messageLabel: 'Mensaje o propuesta',
    sendMessage: 'Enviar mensaje',
    messageSentSuccess: '¡Mensaje registrado localmente con éxito!',
    photoCreditsTitle: 'Créditos Fotográficos y Licencias Documentales',
    providerTitle: 'Registro de Proveedores Turísticos en SURARIO',
    providerSubtitle:
      'Si gestionas un hotel, cabaña, estancia, servicio de guías o empresa de transporte en la Patagonia argentina o chilena, solicita tu inclusión editorial en la plataforma.',
    businessName: 'Nombre comercial del servicio',
    businessType: 'Tipo de servicio',
    hotelType: 'Hotel o Alojamiento',
    tourOperatorType: 'Operador de Excursiones',
    transportType: 'Transporte / Logística',
    gastronomyType: 'Gastronomía / Estancia',
    contactPerson: 'Titular o responsable',
    phoneLabel: 'Teléfono / WhatsApp',
    websiteLabel: 'Sitio web o enlace oficial',
    descriptionLabel: 'Descripción de la propuesta',
    servicesOfferedLabel: 'Servicios destacados',
    acceptTermsLabel: 'Declaro que el servicio cuenta con las habilitaciones turísticas pertinentes.',
    submitApplication: 'Enviar propuesta para revisión',
    applicationSuccess: '¡Solicitud guardada en tu navegador!',

    // Cookie Banner & Modal
    cookieBannerTitle: 'Privacidad y Cookies en SURARIO',
    cookieBannerText:
      'Utilizamos cookies técnicas necesarias para el funcionamiento del portal y herramientas analíticas respetuosas con tu privacidad para comprender qué destinos y rutas resultan más útiles a los viajeros. No vendemos tus datos.',
    acceptAll: 'Aceptar todas',
    rejectOptional: 'Rechazar opcionales',
    configureCookies: 'Configurar preferencias',
    cookiePreferencesTitle: 'Preferencias de cookies',
    savePreferences: 'Guardar preferencias',
    necessaryCookies: 'Cookies técnicas necesarias (siempre activas)',
    analyticsCookies: 'Cookies de medición y analítica anónima (Google Analytics 4)',
    marketingCookies: 'Cookies de enlaces de afiliación y operadores',

    // Legal & Footer
    legalNotice: 'Aviso Legal',
    privacyPolicy: 'Política de Privacidad',
    cookiePolicy: 'Política de Cookies',
    affiliatePolicy: 'Transparencia & Afiliación',
    copyright: 'SURARIO. Portal turístico editorial independiente. Todos los derechos reservados.',
    currencyDisclaimer:
      'Conversión de divisas orientativa. Los pagos en destino se realizan en moneda local (ARS en Argentina, CLP en Chile) o en la divisa acordada con el prestador.',
    backToHome: 'Volver al inicio',
  },

  en: {
    // Header & Nav
    brandDescriptor: 'Travel guide to Argentine and Chilean Patagonia',
    tagline: 'Patagonia, better discovered',
    navDestinations: 'Destinations',
    navExperiences: 'Experiences',
    navAccommodations: 'Stays',
    navActivities: 'Excursions',
    navItineraries: 'Planner',
    navMap: 'Austral Map',
    navGuides: 'Travel Guides',
    navProviders: 'List Your Business',
    navContact: 'Contact & Credits',
    exploreNow: 'Explore',
    changeLanguage: 'Language',
    changeCurrency: 'Currency',
    exploreMap: 'Explore Map',
    exploreMapSub: 'Explore geographic map',
    destinationsFeatured: 'Featured Destinations',
    chileanPatagonia: 'Chilean Patagonia',
    argentinePatagonia: 'Argentine Patagonia',
    viewAllDestinations: 'View all destinations',
    experiencesTitle: 'Experiences',
    trekkingMountain: 'Trekking & Mountains',
    trekkingMountainDesc: 'Fitz Roy, Cerro Torre, Dientes de Navarino & Torres del Paine',
    glaciersNavigation: 'Glaciers & Navigation',
    glaciersNavigationDesc: 'Perito Moreno, Grey Glacier, fjords & Fuegian channels',
    scenicRoutes: 'Scenic Routes',
    scenicRoutesDesc: 'Carretera Austral Route 7, iconic Route 40 & Samoré Pass',
    wildlifeEstancias: 'Wildlife & Estancias',
    wildlifeEstanciasDesc: 'Wildlife spotting, condors, penguins & gaucho heritage',
    verifiedExcursionsNotice: 'Verified excursions with local guides',
    viewAllExperiences: 'View all experiences',
    routesNav: 'Routes',
    whereToStayNav: 'Where to stay',
    guidesNav: 'Guides',
    planTripButton: 'Plan my trip',
    closeMenu: 'Close menu',
    openMenu: 'Open navigation menu',

    // Hero & Home
    heroKicker: 'SURARIO · Patagonia Travel Guide',
    heroTitle: 'Patagonia, better discovered',
    heroSubtitle:
      'Find extraordinary places from north to south, discover local experiences, and plan your next journey across Argentina and Chile with geographical precision.',
    exploreDestinationsBtn: 'Explore destinations',
    planTripBtn: 'Plan my trip',
    viewOnMapBtn: 'View on map',
    searchDestinationLabel: 'Destination or region',
    searchAllPatagonia: 'All Patagonia (All destinations)',
    searchExploreLabel: 'What do you want to explore?',
    searchAllPortal: 'Explore everything',
    searchDestinationsOption: 'Key destinations (Guides & Maps)',
    searchActivitiesOption: 'Things to do (Trekking & Glaciers)',
    searchStaysOption: 'Where to stay (Hotels & Cabins)',
    searchItinerariesOption: 'Routes & itineraries (7 to 21 days)',
    searchButton: 'Search',
    searchPlaceholder: 'Where do you want to travel?',
    searchAction: 'Search',
    allDestinations: 'All destinations',
    trustPointPhotos: 'Verified documentary photography',
    trustPointRegions: '4 Biogeographical regions',
    trustPointIndependent: 'Free and independent access',

    // Regional Section
    geoNorthToSouth: 'Geography from North to South',
    fourRegionsTitle: 'Four macro-regions to understand Patagonia',
    fourRegionsDesc:
      'Over 2,000 kilometers of untamed land divided by the Andes mountain range and sculpted by millennial icefields.',
    exploreRegion: 'Explore region',
    spotlightTitle: 'Essential Destinations',
    spotlightSubtitle: 'Iconic places that define the untamed spirit of the End of the World',
    viewFullGuide: 'View Full Guide',
    viewFullDetails: 'View Details',
    itinerariesSectionTitle: 'Recommended Routes & Itineraries',
    itinerariesSectionSubtitle: 'Field-tested overland, ferry, and roadtrip journeys',
    viewPlanner: 'Open planner',
    accommodationsSectionTitle: 'Stays with Patagonian Character',
    accommodationsSectionSubtitle: 'Boutique hotels, eco-lodges, and cozy cabins with fireplaces',
    viewAllStays: 'View all stays',
    activitiesSectionTitle: 'Field Experiences & Excursions',
    activitiesSectionSubtitle: 'Verified activities to immerse yourself in wild nature',
    viewAllTours: 'View all excursions',
    guidesSectionTitle: 'Field Notes & Practical Travel Guides',
    guidesSectionSubtitle: 'Essential gear advice, border crossings, weather patterns, and logistics',
    readArticles: 'Read all travel guides',
    providerBannerTitle: 'Do you operate a hotel, tour, or service in Patagonia?',
    providerBannerDesc:
      'Join SURARIO’s editorial directory. We personally review every proposal to deliver rigorous guidance to travelers worldwide.',
    providerBannerBtn: 'List your business',

    // Weather widget
    weatherTitle: 'Real-Time Southern Weather & Wind',
    weatherSubtitle: 'Live satellite meteorological data via Open-Meteo with zero API fees',
    weatherApparent: 'Feels like',
    weatherWind: 'Wind',
    weatherGusts: 'Gusts',
    weatherRain: 'Precipitation',
    weatherForecast3d: '3-Day Forecast',
    weatherWarning: 'Notice: Patagonian winds frequently condition boat sailings and mountain passes.',

    // Verification badges
    verifiedOfficial: 'Official Verified',
    pendingVerification: 'Field verification pending',
    seasonalAccess: 'Seasonal access',
    officialParkSite: 'Official Park Website',
    verifiedNote: 'Fact-checked against official authorities (CONAF / Parques Nacionales / WCS)',

    // Commercial, Affiliate & Recommendations (Priority 2)
    whereToStayTitle: 'Where to Stay',
    toursExperiencesTitle: 'Recommended Tours & Experiences',
    affiliateBadge: 'Verified partner',
    officialSiteBadge: 'Official provider site',
    checkWithProvider: 'Check with provider',
    checkAvailability: 'Check availability',
    contactOperator: 'Contact local operator',
    bookOfficial: 'Book on official website',
    checkOnSite: 'Check on-site availability',
    affiliateNotice:
      'Editorial transparency: external links direct to verified operators and official platforms. SURARIO may earn an affiliate commission that sustains our independent fieldwork without ever increasing the price for the traveler.',
    affiliateNoticeShort:
      'External link: may generate a commission for SURARIO at no additional cost to you.',
    noDirectLinksWarning:
      'This recommendation does not currently have a direct online booking link; reservations are arranged on-site or through local channels.',

    // Modals & Details
    overviewTab: 'Overview',
    weatherTab: 'Live Weather',
    howToArrive: 'How to get there',
    bestSeason: 'Best season',
    physicalDemand: 'Physical demand',
    technicalDemand: 'Technical difficulty',
    recommendedDays: 'Suggested days',
    servicesTitle: 'On-site Services',
    waterAvailable: 'Potable water available',
    noWater: 'No guaranteed drinking water (bring water filter)',
    cellSignalYes: 'Mobile cellular coverage available',
    cellSignalNo: 'No cellular signal (remote wilderness)',
    rangersYes: 'Permanent park rangers station',
    rangersNo: 'No permanent ranger post',
    sheltersYes: 'Shelters or designated campsites',
    emergencyEvac: 'Medical evacuation plan',
    minEquipment: 'Essential gear',
    close: 'Close',
    keyHighlights: 'Key highlights',
    addToRoute: 'Add to my route',
    addedToRoute: 'Added to your plan',
    filterBy: 'Filter by',
    clearFilters: 'Clear filters',
    noResults: 'No results found matching your filters.',

    // Itineraries & Planner
    itinerariesMasterTitle: 'Routes & Itineraries across Patagonia',
    itinerariesMasterDesc:
      'Patagonia is immense and travel times between valleys and glaciers require realistic planning. Explore our three curated routes or build a custom itinerary with SURARIO’s 5 to 21-day tool.',
    curatedRoutesTab: 'Curated Master Routes',
    customPlannerTab: 'Custom Trip Planner',
    tripDuration: 'Trip duration',
    daysLabel: 'days',
    startingPoint: 'Starting point',
    travelStyle: 'Travel style',
    styleBinational: 'Full Binational (Argentina + Chile)',
    styleCarreteraAustral: 'Carretera Austral & Fjords (Chile)',
    styleLagosNorte: '7 Lakes Route & Northern Forests',
    styleAustralGlaciares: 'Glaciers & End of the World (South)',
    saveCustomPlan: 'Save my itinerary',
    planSavedAlert: 'Itinerary saved to this browser!',
    printItinerary: 'Print / Save as PDF',
    pinnedDestinations: 'Your pinned destinations',
    noPinnedDestinations: 'No destinations pinned yet. Explore the map or destinations and click "Add to my route".',
    dayByDay: 'Day-by-day itinerary',

    // Stays / Accommodations & Tours / Activities Views
    accommodationsTitle: 'Where to Stay in Patagonia',
    accommodationsSubtitle:
      'Curated boutique hotels, eco-lodges, cozy cabins with fireplaces, and mountain hostels for hikers. Filter by destination, type, and budget estimate.',
    filterDestination: 'Destination',
    filterType: 'Type of Accommodation',
    filterPrice: 'Budget Estimate',
    filterCategory: 'Category',
    filterDifficulty: 'Difficulty',
    filterCountry: 'Country',
    allCountries: 'All countries',
    onlyRemote: 'Remote areas only',
    indicativePriceLabel: 'Indicative rate',
    viewDetailsLabel: 'View Details',
    viewGuideLabel: 'View Activity Guide',
    activitiesTitle: 'Things to Do in Patagonia: Excursions & Activities',
    activitiesSubtitle:
      'Hiking before granite spires, crampon trekking over icefields, sailing through penguin colonies, and scenic journeys across the southern Andes.',

    // Map View
    mapTitle: 'Geographic Map of Patagonia',
    mapSubtitle:
      'Authentic OpenStreetMap and Leaflet cartography. Explore destinations from latitude 38°S down to Cape Horn with zero API fees.',
    backToGrid: 'View grid',

    // Forms: Contact & Provider
    contactTitle: 'Contact & Photographic Credits',
    contactSubtitle:
      'SURARIO is an independent editorial initiative documenting the geography and travel of Argentine and Chilean Patagonia.',
    yourName: 'Your full name',
    yourEmail: 'Email address',
    subjectLabel: 'Inquiry topic',
    messageLabel: 'Message or proposal',
    sendMessage: 'Send message',
    messageSentSuccess: 'Message registered locally successfully!',
    photoCreditsTitle: 'Photographic Credits & Documentary Licenses',
    providerTitle: 'Tourism Provider Registration on SURARIO',
    providerSubtitle:
      'If you manage a hotel, cabin, estancia, guide service, or transport company in Argentine or Chilean Patagonia, submit your editorial listing request.',
    businessName: 'Business / Service name',
    businessType: 'Service category',
    hotelType: 'Hotel or Stay',
    tourOperatorType: 'Tour Operator',
    transportType: 'Transport / Logistics',
    gastronomyType: 'Gastronomy / Estancia',
    contactPerson: 'Contact person / Representative',
    phoneLabel: 'Phone / WhatsApp',
    websiteLabel: 'Website or official link',
    descriptionLabel: 'Proposal description',
    servicesOfferedLabel: 'Key services offered',
    acceptTermsLabel: 'I declare that this service holds all relevant tourism operating permits.',
    submitApplication: 'Submit proposal for review',
    applicationSuccess: 'Application saved in your browser!',

    // Cookie Banner & Modal
    cookieBannerTitle: 'Privacy & Cookies on SURARIO',
    cookieBannerText:
      'We use essential technical cookies to run this portal and privacy-friendly analytics to learn which routes and destinations help travelers the most. We do not sell your personal data.',
    acceptAll: 'Accept all',
    rejectOptional: 'Decline optional',
    configureCookies: 'Cookie preferences',
    cookiePreferencesTitle: 'Cookie preferences',
    savePreferences: 'Save preferences',
    necessaryCookies: 'Necessary technical cookies (always active)',
    analyticsCookies: 'Anonymous measurement and analytics cookies (Google Analytics 4)',
    marketingCookies: 'Affiliate links and operator referral cookies',

    // Legal & Footer
    legalNotice: 'Legal Notice',
    privacyPolicy: 'Privacy Policy',
    cookiePolicy: 'Cookie Policy',
    affiliatePolicy: 'Transparency & Affiliate Disclosure',
    copyright: 'SURARIO. Independent editorial travel portal. All rights reserved.',
    currencyDisclaimer:
      'Currency conversions are indicative estimates. Payments at destinations are settled in local currency (ARS in Argentina, CLP in Chile) or as agreed with the service provider.',
    backToHome: 'Back to home',
  },
};
