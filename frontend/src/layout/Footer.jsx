import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Twitter, Github, Mail, MapPin, Lock, Shield, ShieldCheck, Zap } from 'lucide-react';
import useWindowSize from '../hooks/useWindowSize';
import '../style_localisés/Footer.css';

const SOLUTIONS = [
  { to: '/catalogue/edr',  labelKey: 'footer.solutions.edr' },
  { to: '/catalogue/xdr',  labelKey: 'footer.solutions.xdr' },
  { to: '/catalogue/soc',  labelKey: 'footer.solutions.soc' },
  { to: '/catalogue/tous', labelKey: 'footer.solutions.all' },
];

const LEGAL_LINKS = [
  { to: '/cgu',                       labelKey: 'footer.legal.cgu' },
  { to: '/mentions-legales',          labelKey: 'footer.legal.legal_notice' },
  { to: '/contact',                   labelKey: 'footer.legal.contact' },
  { to: '/politique-confidentialite', labelKey: 'footer.legal.privacy' },
];

const RESOURCES = [
  { to: '/contact',      labelKey: 'footer.resources.contact_expert' },
  { to: '/informations', labelKey: 'footer.resources.docs' },
  { to: '/connexion',    labelKey: 'footer.resources.client_area' },
  { to: '/inscription',  labelKey: 'footer.resources.start_trial' },
];

const SEC_BADGES = [
  { icon: <Lock        size={16} />, cls: 'ssl',  nameKey: 'footer.badges.ssl.name',  descKey: 'footer.badges.ssl.desc' },
  { icon: <Shield      size={16} />, cls: 'iso',  nameKey: 'footer.badges.iso.name',  descKey: 'footer.badges.iso.desc' },
  { icon: <ShieldCheck size={16} />, cls: 'soc2', nameKey: 'footer.badges.soc2.name', descKey: 'footer.badges.soc2.desc' },
  { icon: <Zap         size={16} />, cls: 'rgpd', nameKey: 'footer.badges.rgpd.name', descKey: 'footer.badges.rgpd.desc' },
  { icon: <Shield      size={16} />, cls: 'ddos', nameKey: 'footer.badges.ddos.name', descKey: 'footer.badges.ddos.desc' },
];

export default function Footer() {
  const { t } = useTranslation();
  const { width } = useWindowSize();

  if (width <= 650) return null;

  return (
    <footer className="cf-footer">
      <div className="cf-main">
        <div className="cf-brand">
          <Link to="/" className="cf-logo">
            <div className="cf-logo-icon"><ShieldCheck size={18} /></div>
            <span className="cf-logo-text">CY<span className="cf-logo-accent">NA</span></span>
          </Link>
          <p className="cf-tagline">
            {t('footer.brand_tagline')}
          </p>
          <div className="cf-contact-item"><MapPin size={14} /> {t('footer.location')}</div>
          <div className="cf-contact-item"><Mail   size={14} /> contact@cyna-it.fr</div>
          <div className="cf-socials">
            <a href="https://linkedin.com" className="cf-social" target="_blank" rel="noopener noreferrer"><Linkedin size={16} /></a>
            <a href="https://twitter.com"  className="cf-social" target="_blank" rel="noopener noreferrer"><Twitter  size={16} /></a>
            <a href="https://github.com"   className="cf-social" target="_blank" rel="noopener noreferrer"><Github   size={16} /></a>
          </div>
        </div>

        <div className="cf-col">
          <p className="cf-col-title">{t('footer.titles.solutions')}</p>
          <nav className="cf-links">
            {SOLUTIONS.map(s => (
              <Link key={s.to} to={s.to} className="cf-link">
                <ShieldCheck size={12} /> {t(s.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="cf-col">
          <p className="cf-col-title">{t('footer.titles.legal')}</p>
          <nav className="cf-links">
            {LEGAL_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="cf-link">{t(l.labelKey)}</Link>
            ))}
          </nav>
        </div>

        <div className="cf-col">
          <p className="cf-col-title">{t('footer.titles.resources')}</p>
          <nav className="cf-links">
            {RESOURCES.map(r => (
              <Link key={r.to} to={r.to} className="cf-link">{t(r.labelKey)}</Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="cf-security">
        <div className="cf-security-inner">
          <span className="cf-sec-label">{t('footer.security_label')}</span>
          <div className="cf-badges">
            {SEC_BADGES.map((b, i) => (
              <div key={i} className="cf-badge">
                <div className={`cf-badge-icon cf-badge-icon--${b.cls}`}>{b.icon}</div>
                <div>
                  <div className="cf-badge-name">{t(b.nameKey)}</div>
                  <div className="cf-badge-desc">{t(b.descKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cf-copyright">
        <span>&copy; {new Date().getFullYear()} Cyna — {t('footer.copyright.rights')}</span>
        <span>{t('footer.copyright.tagline')}</span>
      </div>
    </footer>
  );
}