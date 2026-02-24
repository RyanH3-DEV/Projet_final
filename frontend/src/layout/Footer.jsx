import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Github, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5', padding: '3rem 2rem 1rem', marginTop: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section Informations */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ borderBottom: '2px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>CYNA BOOKS</h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MapPin size={18} /> Courbevoie, Paris
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} /> boubakeryahia27@gmail.com
          </p>
        </div>

        {/* Section Liens Légaux et Utiles */}
        <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ borderBottom: '2px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{t('footer.legal')}</h3>
          <a href="/cgu" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.3s' }}>{t('footer.cgu')}</a>
          <a href="/mentions-legales" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.3s' }}>{t('footer.legal_mentions')}</a>
          <a href="/contact" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.3s' }}>{t('footer.contact')}</a>
        </div>

        {/* Section Réseaux Sociaux */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ borderBottom: '2px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{t('footer.social')}</h3>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {/* J'utilise aria-label pour que les lecteurs d'écran comprennent la destination des liens (Accessibilité) */}
            <a href="https://facebook.com" aria-label="Facebook" style={{ color: '#f5f5f5' }}><Facebook size={24} /></a>
            <a href="https://twitter.com" aria-label="Twitter" style={{ color: '#f5f5f5' }}><Twitter size={24} /></a>
            <a href="https://instagram.com" aria-label="Instagram" style={{ color: '#f5f5f5' }}><Instagram size={24} /></a>
            <a href="https://github.com/RyanH3-DEV" aria-label="GitHub" style={{ color: '#f5f5f5' }}><Github size={24} /></a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #333', fontSize: '0.9rem', color: '#888' }}>
        &copy; {new Date().getFullYear()} CYNA BOOKS. {t('footer.rights_reserved')}.
      </div>
    </footer>
  );
};

export default Footer;