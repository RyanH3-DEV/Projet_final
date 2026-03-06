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
          <p className="footer-info-item"><MapPin size={18} /> {t("footer.address", "Courbevoie, Paris")}</p>
          <p className="footer-info-item"><Mail size={18} /> assistance@gmail.com</p>
        </div>

        <div className="footer-section">
          <h3>{t("footer.legal", "Informations Légales")}</h3>
          <nav className="footer-links-list">
            <a href="/cgu" className="footer-link">{t("footer.cgu", "CGU")}</a>
            <a href="/mentions-legales" className="footer-link">{t("footer.legal_mentions", "Mentions Légales")}</a>
            <Link to="/contact" className="footer-link">{t("footer.contact", "Contact")}</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h3>{t("footer.social", "Réseaux Sociaux")}</h3>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook" className="social-link"><Facebook size={24} /></a>
            <a href="https://twitter.com" aria-label="Twitter" className="social-link"><Twitter size={24} /></a>
            <a href="https://instagram.com" aria-label="Instagram" className="social-link"><Instagram size={24} /></a>
          </div>
        </div>

      </div>

      <div className="footer-security">
        <p className="security-title">{t("footer.secure_site", "Site protégé & sécurisé")}</p>
        <div className="security-badges">

          {/* Je remplace les div par des balises a pour rendre chaque badge cliquable */}
          <a href="https://fr.wikipedia.org/wiki/Transport_Layer_Security" target="_blank" rel="noopener noreferrer" className="sec-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sec-badge-icon ssl"><Lock size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">SSL 256-bit</span>
              <span className="sec-desc">{t("footer.encryption", "Chiffrement")}</span>
            </div>
          </a>

          <a href="https://fr.wikipedia.org/wiki/Syst%C3%A8me_de_d%C3%A9tection_d%27intrusion" target="_blank" rel="noopener noreferrer" className="sec-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sec-badge-icon antihack"><Shield size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">{t("footer.anti_intrusion", "Anti-Intrusion")}</span>
              <span className="sec-desc">{t("footer.active_protection", "Protection active")}</span>
            </div>
          </a>

          <a href="https://owasp.org/Top10/" target="_blank" rel="noopener noreferrer" className="sec-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sec-badge-icon owasp"><ShieldCheck size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">OWASP</span>
              <span className="sec-desc">{t("footer.top10_protected", "Top 10 protégé")}</span>
            </div>
          </a>

          <a href="https://fr.wikipedia.org/wiki/3-D_Secure" target="_blank" rel="noopener noreferrer" className="sec-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sec-badge-icon stripe"><span className="badge-logo-text">3D</span></div>
            <div className="sec-badge-text">
              <span className="sec-name">3D Secure</span>
              <span className="sec-desc">{t("footer.secure_payment", "Paiement sécurisé")}</span>
            </div>
          </a>

          <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="sec-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sec-badge-icon stripe"><span className="badge-logo-text">S</span></div>
            <div className="sec-badge-text">
              <span className="sec-name">Stripe</span>
              <span className="sec-desc">{t("footer.pci_certified", "Certifié PCI-DSS")}</span>
            </div>
          </a>

          <a href="https://fr.wikipedia.org/wiki/Attaque_par_d%C3%A9ni_de_service" target="_blank" rel="noopener noreferrer" className="sec-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sec-badge-icon rate"><Shield size={18} /></div>
            <div className="sec-badge-text">
              <span className="sec-name">DDoS Guard</span>
              <span className="sec-desc">Rate limiting</span>
            </div>
          </a>

          <a href="https://www.cnil.fr/fr/comprendre-le-rgpd" target="_blank" rel="noopener noreferrer" className="sec-badge rgpd-badge" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="rgpd-icon">
              <img src="/Logo/rgpd.jpeg" alt="Logo RGPD" />
            </div>
            <div className="rgpd-text">
              <span className="sec-name">{t("footer.rgpd_compliant", "Conforme RGPD, Protection des données")}</span>
            </div>
          </a>
        </div>
      </div>

      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} BOOKS-LIVRE. {t("footer.rights_reserved", "Tous droits réservés")}.
      </div>
    </footer>
  );
};

export default Footer;