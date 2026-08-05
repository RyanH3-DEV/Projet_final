import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';
import '../style_localisés/Paiement.css';

function Paiement({ setCurrentPage }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nomCarte: '',
    numeroCarte: '',
    dateExpiration: '',
    cvc: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const gererPaiement = (e) => {
    e.preventDefault();
    alert(t('payment.processing_alert'));
    setCurrentPage('home');
  };

  return (
    <div className="paiement-container">
      <div className="paiement-card">

        <div className="paiement-header">
          <h2>{t('payment.title')}</h2>
          <p>{t('payment.subtitle')}</p>
        </div>

        <form onSubmit={gererPaiement} className="paiement-form">
          <div className="form-group">
            <label>{t('payment.name_label')}</label>
            <input
              type="text"
              name="nomCarte"
              placeholder={t('payment.name_placeholder')}
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('payment.card_label')}</label>
            <div className="input-with-icon">
              <CreditCard size={20} className="input-icon" />
              <input
                type="text"
                name="numeroCarte"
                placeholder={t('payment.card_placeholder')}
                maxLength="19"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('payment.expiry_label')}</label>
              <input
                type="text"
                name="dateExpiration"
                placeholder={t('payment.expiry_placeholder')}
                maxLength="5"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('payment.cvc_label')}</label>
              <input
                type="text"
                name="cvc"
                placeholder={t('payment.cvc_placeholder')}
                maxLength="3"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-payer">
            <Lock size={18} style={{ marginRight: '8px' }} />
            {t('payment.confirm_btn')}
          </button>
        </form>

        <div className="security-badges">
          <div className="badge">
            <ShieldCheck size={32} />
            <span>{t('payment.badge_ssl_line1')}<br/>{t('payment.badge_ssl_line2')}</span>
          </div>
          <div className="badge">
            <div className="secure-text">3D SECURE</div>
            <span>{t('payment.badge_3d_line1')}<br/>{t('payment.badge_3d_line2')}</span>
          </div>
        </div>

        <button onClick={() => setCurrentPage('panier')} className="btn-retour">
          {t('payment.back_btn')}
        </button>
      </div>
    </div>
  );
}

export default Paiement;