import { useEffect } from 'react';

// URL de base dynamique — pointe sur le local par défaut
const BASE_URL   = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API        = `${BASE_URL}/api/stats`;
const COOKIE_KEY = 'books_livre_cookies_consent';

const analyticsAccepted = () => {
  try {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) return false;
    return JSON.parse(saved).analytics === true;
  } catch { return false; }
};

export function usePageTracking(pageName) {
  useEffect(() => {
    if (!analyticsAccepted()) return;
    fetch(`${API}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageName }),
    }).catch(err => console.error("Erreur tracking useEffect:", err));
  }, [pageName]);

  useEffect(() => {
    const handleConsent = () => {
      if (!analyticsAccepted()) return;
      fetch(`${API}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageName }),
      }).catch(err => console.error("Erreur tracking consent:", err));
    };
    window.addEventListener('cookieConsentUpdated', handleConsent);
    return () => window.removeEventListener('cookieConsentUpdated', handleConsent);
  }, [pageName]);
}

export async function trackEvent(event, data = {}) {
  if (!analyticsAccepted()) return;
  await fetch(`${API}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: `event:${event}`, ...data }),
  }).catch(err => console.error("Erreur trackEvent:", err));
}