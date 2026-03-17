import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Twitter, Github, Mail, MapPin, Lock, Shield, ShieldCheck, Zap } from 'lucide-react';
import useWindowSize from '../hooks/useWindowSize';
import '../style_localisés/Footer.css';

const SOLUTIONS = [
  { to: '/catalogue/edr',  label: 'EDR — Endpoint Detection' },
  { to: '/catalogue/xdr',  label: 'XDR — Extended Detection' },
  { to: '/catalogue/soc',  label: 'SOC — Security Operations' },
  { to: '/catalogue/tous', label: 'Toutes les solutions' },
];

const LEGAL_LINKS = [
  { to: '/cgu',                       label: 'CGU' },
  { to: '/mentions-legales',          label: 'Mentions légales' },
  { to: '/contact',                   label: 'Contact' },
  { to: '/politique-confidentialite', label: 'Politique de confidentialité' },
];

const RESOURCES = [
  { to: '/contact',      label: 'Contacter un expert' },
  { to: '/informations', label: 'Documentation' },
  { to: '/connexion',    label: 'Espace client' },
  { to: '/inscription',  label: 'Démarrer un essai' },
];

const SEC_BADGES = [
  { icon: <Lock        size={16} />, cls: 'ssl',  name: 'SSL 256-bit',    desc: 'Chiffrement' },
  { icon: <Shield      size={16} />, cls: 'iso',  name: 'ISO 27001',      desc: 'Certifié' },
  { icon: <ShieldCheck size={16} />, cls: 'soc2', name: 'SOC 2 Type II',  desc: 'Audité' },
  { icon: <Zap         size={16} />, cls: 'rgpd', name: 'RGPD',           desc: 'Conforme' },
  { icon: <Shield      size={16} />, cls: 'ddos', name: 'DDoS Guard',     desc: 'Rate limiting' },
];

export default function Footer() {
  const { t }     = useTranslation();
  const { width } = useWindowSize();

  if (width <= 650) return null;

  return (
    <footer className="cf-footer">

      {/* ── Colonnes principales ── */}
      <div className="cf-main">

        {/* Marque */}
        <div className="cf-brand">
          <Link to="/" className="cf-logo">
            <div className="cf-logo-icon"><ShieldCheck size={18} /></div>
            <span className="cf-logo-text">CY<span className="cf-logo-accent">NA</span></span>
          </Link>
          <p className="cf-tagline">
            Plateforme de cybersécurité SaaS pour les entreprises.
            SOC, EDR et XDR disponibles en souscription mensuelle.
          </p>
          <div className="cf-contact-item"><MapPin size={14} /> Paris, France</div>
          <div className="cf-contact-item"><Mail   size={14} /> contact@cyna-it.fr</div>
          <div className="cf-socials">
            <a href="https://linkedin.com" className="cf-social" target="_blank" rel="noopener noreferrer"><Linkedin size={16} /></a>
            <a href="https://twitter.com"  className="cf-social" target="_blank" rel="noopener noreferrer"><Twitter  size={16} /></a>
            <a href="https://github.com"   className="cf-social" target="_blank" rel="noopener noreferrer"><Github   size={16} /></a>
          </div>
        </div>

        {/* Solutions */}
        <div className="cf-col">
          <p className="cf-col-title">// Solutions</p>
          <nav className="cf-links">
            {SOLUTIONS.map(s => (
              <Link key={s.to} to={s.to} className="cf-link">
                <ShieldCheck size={12} /> {s.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Légal */}
        <div className="cf-col">
          <p className="cf-col-title">// Légal</p>
          <nav className="cf-links">
            {LEGAL_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="cf-link">{l.label}</Link>
            ))}
          </nav>
        </div>

        {/* Ressources */}
        <div className="cf-col">
          <p className="cf-col-title">// Ressources</p>
          <nav className="cf-links">
            {RESOURCES.map(r => (
              <Link key={r.to} to={r.to} className="cf-link">{r.label}</Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Bandeau sécurité ── */}
      <div className="cf-security">
        <div className="cf-security-inner">
          <span className="cf-sec-label">Infrastructure certifiée</span>
          <div className="cf-badges">
            {SEC_BADGES.map((b, i) => (
              <div key={i} className="cf-badge">
                <div className={`cf-badge-icon cf-badge-icon--${b.cls}`}>{b.icon}</div>
                <div>
                  <div className="cf-badge-name">{b.name}</div>
                  <div className="cf-badge-desc">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div className="cf-copyright">
        <span>&copy; {new Date().getFullYear()} Cyna — Tous droits réservés</span>
        <span>Plateforme SaaS de cybersécurité</span>
      </div>

    </footer>
  );
}