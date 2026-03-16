import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ShieldCheck, Truck, RotateCcw, CreditCard, Mail, MapPin, Phone } from 'lucide-react';
import '../style_localisés/Informations.css';

function Informations() {
  const { t } = useTranslation();

  return (
    <div className="info-container">

      <div className="info-hero">
        <h1>{t('info.page_title', 'Informations')}</h1>
        <p>{t('info.page_subtitle', 'Tout ce que vous devez savoir sur Shopping Livre')}</p>
      </div>

      <div className="info-grid">

        <div className="info-card">
          <div className="info-card-icon"><BookOpen size={32} /></div>
          <h3>{t('info.about_title', 'À propos de nous')}</h3>
          <p>{t('info.about_desc', 'BOOKS-LIVRE est une librairie en ligne passionnée par la littérature. Nous proposons une sélection soigneuse de romans, mangas, BD et livres jeunesse pour tous les profils de lecteurs.')}</p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><Truck size={32} /></div>
          <h3>{t('info.delivery_title', 'Livraison')}</h3>
          <p>
            {t('info.delivery_1', 'Livraison standard sous ')}
            <strong>{t('info.delivery_bold_1', '3 à 5 jours ouvrés')}</strong>
            {t('info.delivery_2', '. Livraison express disponible sous 24h. Livraison gratuite à partir de ')}
            <strong>{t('info.delivery_bold_2', '35 €')}</strong>
            {t('info.delivery_3', " d'achat.")}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><RotateCcw size={32} /></div>
          <h3>{t('info.returns_title', 'Retours & Remboursements')}</h3>
          <p>
            {t('info.returns_1', 'Vous disposez de ')}
            <strong>{t('info.returns_bold_1', '14 jours')}</strong>
            {t('info.returns_2', ' après réception pour retourner un article. Le remboursement est effectué sous 5 à 7 jours ouvrés après réception du retour.')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><CreditCard size={32} /></div>
          <h3>{t('info.payment_title', 'Paiement Sécurisé')}</h3>
          <p>
            {t('info.payment_1', 'Tous les paiements sont sécurisés par ')}
            <strong>{t('info.payment_bold_1', 'SSL')}</strong>
            {t('info.payment_2', ' et ')}
            <strong>{t('info.payment_bold_2', '3D Secure')}</strong>
            {t('info.payment_3', '. Nous acceptons Visa, Mastercard et PayPal. Vos données bancaires ne sont jamais stockées.')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><ShieldCheck size={32} /></div>
          <h3>{t('info.privacy_title', 'Confidentialité')}</h3>
          <p>
            {t('info.privacy_1', 'Vos données personnelles sont protégées conformément au ')}
            <strong>{t('info.privacy_bold_1', 'RGPD')}</strong>
            {t('info.privacy_2', '. Nous ne partageons jamais vos informations avec des tiers sans votre consentement.')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><Mail size={32} /></div>
          <h3>{t('info.contact_title', 'Nous contacter')}</h3>
          <div className="info-contact-list">
            <p><Mail size={16} /> {t('info.contact_email', 'assistance@gmail.com')}</p>
            <p><MapPin size={16} /> {t('info.contact_address', 'Courbevoie, Paris')}</p>
            <p><Phone size={16} /> {t('info.contact_hours', 'Du lundi au vendredi, 9h - 18h')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Informations;