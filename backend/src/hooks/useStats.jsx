import { useEffect } from 'react';

const API = 'http://127.0.0.1:8000/api/stats';

// Verifie si l'utilisateur a accepte les cookies analytiques
const analyticsAccepted = () => {
  try {
    const saved = localStorage.getItem('books_livre_cookies_consent');
    if (!saved) return false;
    return JSON.parse(saved).analytics === true;
  } catch {
    return false;
  }
};

// Hook a appeler dans chaque page pour tracker la visite
export function usePageTracking(pageName) {
  useEffect(() => {
    if (!analyticsAccepted()) return; // Respect RGPD

    fetch(`${API}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageName }),
    }).catch(() => {});
  }, [pageName]);
}

// Fonction pour tracker un evenement specifique (ajout panier, inscription, etc.)
export async function trackEvent(event, data = {}) {
  if (!analyticsAccepted()) return;

  await fetch(`${API}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: `event:${event}`, ...data }),
  }).catch(() => {});
}
