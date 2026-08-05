import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, ShieldCheck, Zap, Calendar, CreditCard, Mail, MapPin, Phone } from 'lucide-react';
import '../style_localisés/Informations.css';

function Informations() {
  const { t } = useTranslation();

  return (
    <div className="info-container">

      <div className="info-hero">
        <h1>{t('info.page_title')}</h1>
        <p>{t('info.page_subtitle')}</p>
      </div>

      <div className="info-grid">

        <div className="info-card">
          <div className="info-card-icon"><Server size={32} /></div>
          <h3>{t('info.about_title')}</h3>
          <p>{t('info.about_desc')}</p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><Zap size={32} /></div>
          <h3>{t('info.deploy_title')}</h3>
          <p>
            {t('info.deploy_1')}
            <strong>{t('info.deploy_bold_1')}</strong>
            {t('info.deploy_2')}
            <strong>{t('info.deploy_bold_2')}</strong>
            {t('info.deploy_3')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><Calendar size={32} /></div>
          <h3>{t('info.sub_title')}</h3>
          <p>
            {t('info.sub_1')}
            <strong>{t('info.sub_bold_1')}</strong>
            {t('info.sub_2')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><CreditCard size={32} /></div>
          <h3>{t('info.payment_title')}</h3>
          <p>
            {t('info.payment_1')}
            <strong>{t('info.payment_bold_1')}</strong>
            {t('info.payment_2')}
            <strong>{t('info.payment_bold_2')}</strong>
            {t('info.payment_3')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><ShieldCheck size={32} /></div>
          <h3>{t('info.privacy_title')}</h3>
          <p>
            {t('info.privacy_1')}
            <strong>{t('info.privacy_bold_1')}</strong>
            {t('info.privacy_2')}
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-icon"><Mail size={32} /></div>
          <h3>{t('info.contact_title')}</h3>
          <div className="info-contact-list">
            <p><Mail size={16} /> {t('info.contact_email')}</p>
            <p><MapPin size={16} /> {t('info.contact_address')}</p>
            <p><Phone size={16} /> {t('info.contact_hours')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Informations;