import { CookieConsentPreferences } from '../types';

export const GA_MEASUREMENT_ID = 'G-W0ZG7YR141';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventType =
  | 'page_view'
  | 'view_destination'
  | 'view_tour'
  | 'view_accommodation'
  | 'search'
  | 'map_destination_click'
  | 'itinerary_created'
  | 'language_changed'
  | 'currency_changed'
  | 'weather_view'
  | 'booking_button_click'
  | 'affiliate_outbound_click'
  | 'contact_form_submit'
  | 'provider_form_submit'
  // Backwards-compatible aliases
  | 'destination_view'
  | 'accommodation_view'
  | 'activity_view'
  | 'article_view'
  | 'language_change'
  | 'currency_change'
  | 'search_submit'
  | 'commercial_cta_click'
  | 'official_source_click'
  | 'provider_application_submit'
  | 'cookie_consent_update';

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  payload?: Record<string, string | number | boolean>;
}

// Global in-memory audit log (max 100 entries)
const eventLog: AnalyticsEvent[] = [];

// Cookie consent retrieval
export function getStoredCookieConsent(): CookieConsentPreferences {
  if (typeof window === 'undefined') {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      answered: false,
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem('surario_cookie_consent');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    answered: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Strips any potential PII (emails, phone numbers, names, free-form text) from event payloads
 */
export function sanitizeAnalyticsPayload(
  payload?: Record<string, unknown>
): Record<string, string | number | boolean> {
  if (!payload) return {};
  const cleaned: Record<string, string | number | boolean> = {};

  const piiKeys = new Set([
    'name',
    'email',
    'phone',
    'telephone',
    'message',
    'contactperson',
    'contact_person',
    'businessname',
    'business_name',
    'address',
    'ip',
    'user_id',
    'password',
    'card',
  ]);

  for (const [key, val] of Object.entries(payload)) {
    if (val === undefined || val === null) continue;
    const lowerKey = key.toLowerCase();
    if (piiKeys.has(lowerKey)) continue;

    if (typeof val === 'string') {
      // Discard values looking like email addresses
      if (val.includes('@') && val.includes('.')) continue;
      // Discard values looking like phone numbers (digits with + or hyphens)
      if (/^\+?[\d\s\-()]{7,}$/.test(val.trim())) continue;
      cleaned[key] = val;
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      cleaned[key] = val;
    }
  }

  return cleaned;
}

/**
 * Dynamically injects Google Analytics 4 tag (gtag.js) ONLY when analytics consent is granted.
 * Sets Google Consent Mode v2 and prevents default automatic page_view to avoid SPA duplicates.
 */
export function syncGoogleAnalyticsConsent(consent: CookieConsentPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
    }

    if (consent.analytics) {
      // User granted analytics consent:
      // 1. Update Consent Mode
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });

      // 2. Inject official gtag.js script if not already present
      const scriptId = 'ga4-gtag-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.onerror = () => {
          // Gracefully handles ad blockers or network offline without crashing
          console.info('Google Analytics script request blocked or unavailable (e.g. adblocker or offline).');
        };
        document.head.appendChild(script);

        // Configure GA4 once script is inserted
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
          send_page_view: false, // We dispatch page_view manually on SPA route changes
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure',
        });
      }
    } else {
      // User rejected or revoked analytics consent:
      // Update Consent Mode to denied
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });

      // Remove the script element if present to avoid further requests
      const existingScript = document.getElementById('ga4-gtag-script');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    }
  } catch (err) {
    // Failsafe: never disrupt site operation if GA fails
    console.warn('Analytics consent sync handled safely:', err);
  }
}

/**
 * Initializes GA4 consent mode on application bootstrap.
 */
export function initGoogleAnalytics(): void {
  const consent = getStoredCookieConsent();
  if (typeof window === 'undefined') return;

  try {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
    }

    // Set default consent state before any tag executes
    window.gtag('consent', 'default', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });

    if (consent.analytics) {
      syncGoogleAnalyticsConsent(consent);
    }
  } catch (err) {
    console.warn('Failsafe init Google Analytics error:', err);
  }
}

export function saveStoredCookieConsent(prefs: Partial<CookieConsentPreferences>): CookieConsentPreferences {
  const current = getStoredCookieConsent();
  const updated: CookieConsentPreferences = {
    ...current,
    ...prefs,
    necessary: true,
    answered: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('surario_cookie_consent', JSON.stringify(updated));
  } catch {
    // ignore
  }

  // Synchronize Google Analytics tag and consent state immediately
  syncGoogleAnalyticsConsent(updated);

  // Dispatch consent update event internally
  trackEvent('cookie_consent_update', {
    analytics: updated.analytics,
    marketing: updated.marketing,
  });

  return updated;
}

/**
 * Central event dispatcher for SURARIO.
 * Validates cookie consent before sending events to Google Analytics 4.
 */
export function trackEvent(
  event: AnalyticsEventType,
  payload?: Record<string, unknown>
): void {
  const consent = getStoredCookieConsent();
  const cleanPayload = sanitizeAnalyticsPayload(payload);

  // Normalize event name to official taxonomy
  let officialEventName: string = event;
  if (event === 'destination_view') officialEventName = 'view_destination';
  else if (event === 'activity_view') officialEventName = 'view_tour';
  else if (event === 'accommodation_view') officialEventName = 'view_accommodation';
  else if (event === 'search_submit') officialEventName = 'search';
  else if (event === 'language_change') officialEventName = 'language_changed';
  else if (event === 'currency_change') officialEventName = 'currency_changed';
  else if (event === 'provider_application_submit') officialEventName = 'provider_form_submit';
  else if (event === 'commercial_cta_click') officialEventName = 'booking_button_click';

  const eventItem: AnalyticsEvent = {
    event: officialEventName,
    timestamp: new Date().toISOString(),
    payload: cleanPayload,
  };

  // Always keep in-memory audit log for developers and inspection
  eventLog.push(eventItem);
  if (eventLog.length > 100) {
    eventLog.shift();
  }

  // Only forward to GA4 if user has explicitly granted analytics consent
  if (consent.analytics && typeof window !== 'undefined') {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', officialEventName, cleanPayload);
      } else if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: officialEventName,
          ...cleanPayload,
        });
      }
    } catch (err) {
      // Failsafe: logging failure must never break the UI
      console.warn('Analytics event dispatch warning:', err);
    }
  }
}

export function getAnalyticsEventLog(): AnalyticsEvent[] {
  return [...eventLog];
}
