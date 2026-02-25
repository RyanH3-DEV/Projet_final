import React from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Github, Mail, MapPin } from 'lucide-react';
import '../style_localisés/Footer.css';

const Footer = ({ setCurrentPage }) => {
  const { t } = useTranslation();

  const navigerVers = (e, page) => {
    e.preventDefault();
    setCurrentPage(page);
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">

        {/* Section Informations */}
        <div className="footer-section">
          <h3>CYNA BOOKS</h3>
          <p className="footer-info-item">
            <MapPin size={18} /> Courbevoie, Paris
          </p>
          <p className="footer-info-item">
            <Mail size={18} /> boubakeryahia27@gmail.com
          </p>
        </div>

        {/* Section Liens Légaux et Utiles */}
        <div className="footer-section">
          <h3>{t('footer.legal')}</h3>
          <nav className="footer-links-list">
            <a href="/cgu" className="footer-link">{t('footer.cgu')}</a>
            <a href="/mentions-legales" className="footer-link">{t('footer.legal_mentions')}</a>
            {/* J'utilise la navigation interne ici */}
            <a href="/contact" onClick={(e) => navigerVers(e, 'contact')} className="footer-link">
              {t('footer.contact')}
            </a>
          </nav>
        </div>

        {/* Section Réseaux Sociaux */}
        <div className="footer-section">
          <h3>{t('footer.social')}</h3>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook" className="social-link"><Facebook size={24} /></a>
            <a href="https://twitter.com" aria-label="Twitter" className="social-link"><Twitter size={24} /></a>
            <a href="https://instagram.com" aria-label="Instagram" className="social-link"><Instagram size={24} /></a>
            <a href="https://github.com/RyanH3-DEV" aria-label="GitHub" className="social-link"><Github size={24} /></a>
          </div>
        </div>

      </div>

      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} CYNA BOOKS. {t('footer.rights_reserved')}.
      </div>
    </footer>
  );
};

export default Footer;