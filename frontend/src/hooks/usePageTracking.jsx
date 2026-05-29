import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API = `${BASE_URL}/api/stats`;
const COOKIE_KEY = 'books_livre_cookies_consent';

const analyticsAccepted = () => {
  try {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) return false;
    return JSON.parse(saved).analytics === true;
  } catch {
    return false;
  }
};

export function usePageTracking(pageName) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!analyticsAccepted()) return;

    fetch(`${API}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageName }),
    }).catch(err => console.error(t('tracking.err_effect'), err));
  }, [pageName, t]);

  useEffect(() => {
    const handleConsent = () => {
      if (!analyticsAccepted()) return;

      fetch(`${API}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageName }),
      }).catch(err => console.error(t('tracking.err_consent'), err));
    };

    window.addEventListener('cookieConsentUpdated', handleConsent);
    return () => window.removeEventListener('cookieConsentUpdated', handleConsent);
  }, [pageName, t]);
}

export async function trackEvent(event, data = {}) {
  if (!analyticsAccepted()) return;

  await fetch(`${API}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: `event:${event}`, ...data }),
  }).catch(err => console.error("Error tracking event:", err));
}