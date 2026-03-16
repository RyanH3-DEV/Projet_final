import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Cookie, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import '../Style_localisés/CookieBanner.css';

const COOKIE_KEY = 'books_livre_cookies_consent';

const COOKIE_CATEGORIES = [
  {
    id: 'necessary',
    label: 'Cookies essentiels',
    description: 'Indispensables au fonctionnement du site : session, panier, authentification. Ne peuvent pas etre refuses.',
    required: true,
  },
  {
    id: 'functional',
    label: 'Cookies fonctionnels',
    description: 'Memorisent vos preferences : langue, theme, wishlist. Ameliorent votre experience.',
    required: false,
  },
  {
    id: 'analytics',
    label: 'Cookies analytiques',
    description: 'Mesurent audience et navigation pour ameliorer le site. Aucune donnee personnelle transmise.',
    required: false,
  },
  {
    id: 'payment',
    label: 'Cookies de paiement',
    description: 'Stripe et PayPal utilisent des cookies pour securiser les transactions 3D Secure.',
    required: false,
  },
];

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible]       = useState(false);
  const [mode, setMode]             = useState('banner'); // banner | customize
  const [expanded, setExpanded]     = useState(null);
  const [consents, setConsents]     = useState({
    necessary: true,
    functional: false,
    analytics: false,
    payment: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      // J'affiche après 1 seconde
      setTimeout(() => setVisible(true), 1000);
    }
  }, []);

  const sauvegarder = (tout) => {
    const result = tout
      ? { necessary: true, functional: true, analytics: true, payment: true }
      : { ...consents, necessary: true };

    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      ...result,
      date: new Date().toISOString(),
      version: '1.0',
    }));
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated'));
    setVisible(false);
  };

  const refuserTout = () => {
    const result = { necessary: true, functional: false, analytics: false, payment: false };
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      ...result,
      date: new Date().toISOString(),
      version: '1.0',
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-overlay">
      <div className={`cookie-banner ${mode === "customize" ? "cookie-banner--large" : ""}`}>

        {/* Header */}
        <div className="cookie-header">
          <div className="cookie-header-left">
            <Cookie size={22} className="cookie-icon" />
            <h3>{t('cookie.manage', 'Gestion des cookies')}</h3>
          </div>
          <button className="cookie-close" onClick={refuserTout} title={t('cookie.close_title', 'Refuser et fermer')}>
            <X size={18} />
          </button>
        </div>

        {mode === "banner" && (
          <>
            <p className="cookie-text">
              {t('cookie.banner_text', 'Nous utilisons des cookies pour assurer le bon fonctionnement du site, securiser vos paiements et ameliorer votre experience. Conformement au RGPD, vous pouvez accepter, refuser ou personnaliser votre choix.')}
            </p>
            <div className="cookie-actions">
              <button className="btn-cookie-accept" onClick={() => sauvegarder(true)}>
                {t('cookie.accept_all', 'Tout accepter')}
              </button>
              <button className="btn-cookie-customize" onClick={() => setMode("customize")}>
                {t('cookie.customize', 'Personnaliser')}
              </button>
              <button className="btn-cookie-refuse" onClick={refuserTout}>
                {t('cookie.refuse_all', 'Tout refuser')}
              </button>
            </div>
            <p className="cookie-rgpd-note">
              <Shield size={12} /> {t('cookie.rgpd_note', 'Conforme RGPD — Vos donnees ne sont jamais vendues a des tiers.')}
            </p>
          </>
        )}

        {mode === "customize" && (
          <>
            <p className="cookie-text">
              {t('cookie.customize_text', 'Choisissez les categories de cookies que vous acceptez. Les cookies essentiels sont toujours actives.')}
            </p>

            <div className="cookie-categories">
              {COOKIE_CATEGORIES.map(cat => (
                <div key={cat.id} className="cookie-category">
                  <div
                    className="cookie-category-header"
                    onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                  >
                    <div className="cookie-category-left">
                      <span className="cookie-category-label">{t(`cookie.cat_${cat.id}_label`, cat.label)}</span>
                      {cat.required && <span className="cookie-required">{t('cookie.required', 'Requis')}</span>}
                      {expanded === cat.id
                        ? <ChevronUp size={14} className="cookie-chevron" />
                        : <ChevronDown size={14} className="cookie-chevron" />
                      }
                    </div>
                    <label className="cookie-toggle" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={consents[cat.id]}
                        disabled={cat.required}
                        onChange={e => setConsents(prev => ({ ...prev, [cat.id]: e.target.checked }))}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  {expanded === cat.id && (
                    <p className="cookie-category-desc">{t(`cookie.cat_${cat.id}_desc`, cat.description)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="cookie-actions">
              <button className="btn-cookie-accept" onClick={() => sauvegarder(false)}>
                {t('cookie.save_choices', 'Sauvegarder mes choix')}
              </button>
              <button className="btn-cookie-accept" onClick={() => sauvegarder(true)}>
                {t('cookie.accept_all', 'Tout accepter')}
              </button>
              <button className="btn-cookie-refuse" onClick={refuserTout}>
                {t('cookie.refuse_all', 'Tout refuser')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Je vérifie le consentement depuis n'importe quel composant grâce à ce hook
export function useCookieConsent(category) {
  const saved = localStorage.getItem(COOKIE_KEY);
  if (!saved) return false;
  try {
    return JSON.parse(saved)[category] === true;
  } catch {
    return false;
  }
}