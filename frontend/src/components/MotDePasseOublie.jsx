import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import '../style_localisés/Connexion.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function MotDePasseOublie() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const response = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSucces(true);
      } else {
        const data = await response.json();
        setErreur(data.message || t('auth.err_generic'));
      }
    } catch (err) {
      setErreur(t('alerts.server_unreachable'));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-header">
          <Shield className="brand-icon" size={42} />
          <h2>{t('auth.forgot_password_title')}</h2>
          <p className="subtitle">
            {t('auth.forgot_password_desc')}
          </p>
        </div>

        {succes ? (
          <div className="success-state">
            <CheckCircle className="success-icon" size={48} color="#2ecc71" />
            <p className="success-msg">
              {t('auth.forgot_email_sent')}
            </p>
            <button onClick={() => navigate('/connexion')} className="btn-login">
              {t('auth.back_to_login')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {erreur && <div className="error-box">⚠ {erreur}</div>}

            <div className="form-group">
              <label>{t('auth.email_pro')}</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nom@entreprise.fr"
                  required
                  disabled={chargement}
                />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={chargement || !email}>
              {chargement ? (
                <span className="loader-btn"><Loader2 className="spinner" size={18} /> {t('auth.sending')}</span>
              ) : (
                <span className="loader-btn"><Send size={18} /> {t('auth.send_link')}</span>
              )}
            </button>

            <Link to="/connexion" className="btn-back-link">
              <ArrowLeft size={16} /> {t('auth.back_to_login')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default MotDePasseOublie;