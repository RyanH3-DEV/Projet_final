import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Cookie, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import '../Style_localisés/CookieBanner.css';

const COOKIE_KEY = 'books_livre_cookies_consent';

const COOKIE_CATEGORIES = [
  { id: 'necessary', required: true },
  { id: 'functional', required: false },
  { id: 'analytics', required: false },
  { id: 'payment', required: false },
];

export default function CookieBanner() {
  const { t } = useTranslation();

  // ICI : Je force 'visible' à true par défaut pour les tests
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState('banner');
  const [expanded, setExpanded] = useState(null);
  const [consents, setConsents] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    payment: false,
  });

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

        <div className="cookie-header">
          <div className="cookie-header-left">
            <Cookie size={22} className="cookie-icon" />
            <h3>{t('cookie.manage')}</h3>
          </div>
          <button className="cookie-close" onClick={refuserTout} title={t('cookie.close_title')}>
            <X size={18} />
          </button>
        </div>

        {mode === "banner" && (
          <>
            <p className="cookie-text">
              {t('cookie.banner_text')}
            </p>
            <div className="cookie-actions">
              <button className="btn-cookie-accept" onClick={() => sauvegarder(true)}>
                {t('cookie.accept_all')}
              </button>
              <button className="btn-cookie-customize" onClick={() => setMode("customize")}>
                {t('cookie.customize')}
              </button>
              <button className="btn-cookie-refuse" onClick={refuserTout}>
                {t('cookie.refuse_all')}
              </button>
            </div>
            <p className="cookie-rgpd-note">
              <Shield size={12} /> {t('cookie.rgpd_note')}
            </p>
          </>
        )}

        {mode === "customize" && (
          <>
            <p className="cookie-text">
              {t('cookie.customize_text')}
            </p>

            <div className="cookie-categories">
              {COOKIE_CATEGORIES.map(cat => (
                <div key={cat.id} className="cookie-category">
                  <div
                    className="cookie-category-header"
                    onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                  >
                    <div className="cookie-category-left">
                      <span className="cookie-category-label">{t(`cookie.cat_${cat.id}_label`)}</span>
                      {cat.required && <span className="cookie-required">{t('cookie.required')}</span>}
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
                    <p className="cookie-category-desc">{t(`cookie.cat_${cat.id}_desc`)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="cookie-actions">
              <button className="btn-cookie-accept" onClick={() => sauvegarder(false)}>
                {t('cookie.save_choices')}
              </button>
              <button className="btn-cookie-accept" onClick={() => sauvegarder(true)}>
                {t('cookie.accept_all')}
              </button>
              <button className="btn-cookie-refuse" onClick={refuserTout}>
                {t('cookie.refuse_all')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}