import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Mail, MapPin, Lock, Shield, ShieldCheck } from 'lucide-react';
import '../style_localisés/Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="main-footer">
      <div className="footer-container">

        <div className="footer-section">
          <h3>BOOKS-LIVRE</h3>
          <p className="footer-info-item"><MapPin size={18} /> Courbevoie, Paris</p>
          <p className="footer-info-item"><Mail size={18} /> assistance@gmail.com</p>
        </div>

        <div className="footer-section">
          <h3>{t("footer.legal")}</h3>
          <nav className="footer-links-list">
            <a href="/cgu" className="footer-link">{t("footer.cgu")}</a>
            <a href="/mentions-legales" className="footer-link">{t("footer.legal_mentions")}</a>
            <Link to="/contact" className="footer-link">{t("footer.contact")}</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h3>{t("footer.social")}</h3>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook" className="social-link"><Facebook size={24} /></a>
            <a href="https://twitter.com" aria-label="Twitter" className="social-link"><Twitter size={24} /></a>
            <a href="https://instagram.com" aria-label="Instagram" className="social-link"><Instagram size={24} /></a>
          </div>
        </div>

      </div>

      <div className="footer-security">
        <p className="security-title">Site protégé & sécurisé</p>
        <div className="security-badges">
          <div className="sec-badge">
            <div className="sec-badge-icon ssl"><Lock size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">SSL 256-bit</span>
              <span className="sec-desc">Chiffrement</span>
            </div>
          </div>
          <div className="sec-badge">
            <div className="sec-badge-icon antihack"><Shield size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">Anti-Intrusion</span>
              <span className="sec-desc">Protection active</span>
            </div>
          </div>
          <div className="sec-badge">
            <div className="sec-badge-icon owasp"><ShieldCheck size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">OWASP</span>
              <span className="sec-desc">Top 10 protégé</span>
            </div>
          </div>
          <div className="sec-badge">
            <div className="sec-badge-icon stripe"><span className="badge-logo-text">3D</span></div>
            <div className="sec-badge-text">
              <span className="sec-name">3D Secure</span>
              <span className="sec-desc">Paiement sécurisé</span>
            </div>
          </div>
          <div className="sec-badge">
            <div className="sec-badge-icon stripe"><span className="badge-logo-text">S</span></div>
            <div className="sec-badge-text">
              <span className="sec-name">Stripe</span>
              <span className="sec-desc">Certifié PCI-DSS</span>
            </div>
          </div>
          <div className="sec-badge">
            <div className="sec-badge-icon rate"><Shield size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">DDoS Guard</span>
              <span className="sec-desc">Rate limiting</span>
            </div>
          </div>
          <div className="sec-badge rgpd-badge">
            <div className="rgpd-icon">
              <img src="/Logo/rgpd.jpeg" alt="Logo RGPD" />
            </div>
            <div className="rgpd-text">
              <span className="sec-name">Conforme RGPD, Protection des données</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} BOOKS-LIVRE. {t("footer.rights_reserved")}.
      </div>
    </footer>
  );
};

export default Footer;