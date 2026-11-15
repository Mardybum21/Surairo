export type Country = 'Argentina' | 'Chile';

export type Language = 'es' | 'en';
export type Currency = 'CLP' | 'ARS' | 'EUR' | 'USD';

export type PatagoniaZone =
  | 'chile-los-lagos' // Región de Los Lagos, Chiloé y norte
  | 'chile-aysen' // Aysén y Carretera Austral
  | 'argentina-norte' // Neuquén, Río Negro y Chubut (Siete Lagos, Bariloche, Alerces)
  | 'austral-binacional'; // Santa Cruz, Magallanes y Tierra del Fuego

export type DestinationCategory =
  | 'ciudad'
  | 'pueblo'
  | 'parque-nacional'
  | 'glaciar'
  | 'ruta-escenica'
  | 'remoto';

export interface DestinationServices {
  drinkingWater?: boolean;
  cellSignal?: boolean;
  rangers?: boolean;
  shelters?: boolean;
  emergencyEvac?: string;
}

export interface Destination {
  id: string;
  name: string;
  nameEn?: string;
  officialName?: string;
  country: Country;
  region: string;
  zone: PatagoniaZone;
  category: DestinationCategory;
  categoryLabel: string;
  tagline: string;
  taglineEn?: string;
  image: string;
  photoCredit: string;
  photoSource: string;
  description: string;
  descriptionEn?: string;
  fullOverview: string;
  fullOverviewEn?: string;
  highlights: string[];
  highlightsEn?: string[];
  activities: string[];
  nearbyParks?: string[];
  physicalDemand: string;
  technicalDemand?: 'Baja' | 'Moderada' | 'Exigente' | 'Técnica / Andinismo';
  bestSeason: string;
  weather: string;
  howToGetThere: string;
  recommendedDays: number;
  altitude: string;
  coordinates: { lat: number; lng: number };
  isPopular?: boolean;
  isRemote?: boolean;
  officialSource?: string;
  officialUrl?: string;
  adminEntity?: string;
  accessType?: 'Abierto todo el año' | 'Estacional' | 'Reserva previa obligatoria' | 'Expedición autónoma';
  services?: DestinationServices;
  minEquipment?: string[];
  verificationStatus?: 'Verificado Oficial' | 'Pendiente de verificación en terreno' | 'Paso estacional';
  verificationNote?: string;
}

export type AccommodationType = 'hotel' | 'hostal' | 'cabana' | 'refugio' | 'camping' | 'estancia';
export type PriceRange = 'Económico' | 'Medio' | 'Premium';

export interface Accommodation {
  id: string;
  name: string;
  nameEn?: string;
  destinationId: string;
  destinationName: string;
  country: Country;
  zone: PatagoniaZone;
  type: AccommodationType;
  typeLabel: string;
  priceRange: PriceRange;
  indicativePrice: string;
  pricePerNight?: number;
  currency?: Currency;
  priceInLocalCurrency?: { amount: number; currency: 'ARS' | 'CLP' };
  rating: number;
  image: string;
  photos?: string[];
  photoCredit?: string;
  photoSource?: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  longDescription: string;
  longDescriptionEn?: string;
  amenities: string[];
  amenitiesEn?: string[];
  location: string;
  coordinates?: { lat: number; lng: number };
  demoNote?: string;
  officialUrl?: string;
  affiliateUrl?: string;
  externalBookingUrl?: string;
  bookingProvider?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivityCategory =
  | 'trekking'
  | 'glaciares'
  | 'fauna'
  | 'navegacion'
  | 'rutas'
  | 'kayak'
  | 'termas'
  | 'cultura';

export type Difficulty = 'Baja' | 'Moderada' | 'Exigente' | 'Muy Exigente';

export interface Activity {
  id: string;
  title: string;
  name?: string;
  titleEn?: string;
  nameEn?: string;
  destinationId: string;
  destinationName: string;
  country: Country;
  zone: PatagoniaZone;
  category: ActivityCategory;
  categoryLabel: string;
  duration: string;
  durationEn?: string;
  difficulty: Difficulty;
  bestSeason: string;
  indicativePrice: string;
  price?: number;
  currency?: Currency;
  priceInLocalCurrency?: { amount: number; currency: 'ARS' | 'CLP' };
  image: string;
  photos?: string[];
  photoCredit?: string;
  photoSource?: string;
  shortDescription: string;
  description?: string;
  descriptionEn?: string;
  fullDescription: string;
  fullDescriptionEn?: string;
  included: string[];
  includedEn?: string[];
  whatToBring: string[];
  demoNote?: string;
  officialUrl?: string;
  affiliateUrl?: string;
  externalBookingUrl?: string;
  operatorName?: string;
  published?: boolean;
  coordinates?: { lat: number; lng: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface ItineraryStop {
  dayNumber: number;
  title: string;
  location: string;
  country: Country;
  description: string;
  activitySuggestion: string;
  transportTip?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  tagline: string;
  days: number;
  theme: 'lagos-volcanes' | 'chiloe-cultural' | 'carretera-austral' | 'aysen-lagos' | 'senderismo' | 'glaciares' | 'binacional';
  themeLabel: string;
  countries: Country[];
  summary: string;
  highlights: string[];
  idealFor: string;
  stops: ItineraryStop[];
  transportAdvice: string;
  budgetTip: string;
  seasonalityWarning?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  image: string;
  photoCredit: string;
  photoSource: string;
  content: string[];
  keyTips: string[];
}

export interface ProviderApplication {
  id: string;
  businessName: string;
  businessType: 'hotel' | 'hostal' | 'cabana' | 'guia' | 'agencia' | 'transporte' | 'refugio' | 'camping';
  destination: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  description: string;
  servicesOffered: string;
  submittedAt: string;
  status?: 'pending' | 'approved' | 'rejected' | 'archived';
  createdAt?: any;
  adminNotes?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  answered: boolean;
  updatedAt: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  weatherCode: number;
  conditionText: string;
  time: string;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  conditionText: string;
  maxWind: number;
}

export interface DestinationWeatherData {
  destinationId: string;
  destinationName: string;
  fetchedAt: number;
  current: CurrentWeather;
  daily: DailyForecast[];
}

export type PageId =
  | 'inicio'
  | 'destinos'
  | 'destino-detalle'
  | 'alojamientos'
  | 'alojamiento-detalle'
  | 'excursiones'
  | 'actividad-detalle'
  | 'itinerarios'
  | 'mapa'
  | 'guias'
  | 'articulo-detalle'
  | 'proveedores'
  | 'contacto-creditos'
  | 'politica-privacidad'
  | 'politica-cookies'
  | 'aviso-legal'
  | 'transparencia-afiliacion'
  | 'admin';
