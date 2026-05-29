import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, XCircle } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function ConfirmationEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statut, setStatut] = useState('chargement');
  const [message, setMessage] = useState('');
  const appelEffectue = useRef(false);

  useEffect(() => {
    if (appelEffectue.current) return;
    appelEffectue.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatut('erreur');
      setMessage(t('confirmation_email.invalid_link_url'));
      return;
    }

    fetch(`${BASE_URL}/api/confirmation_directe_email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatut('succes');
          setMessage(data.message || t('confirmation_email.success_default'));
        } else {
          setStatut('erreur');
          setMessage(data.message || t('confirmation_email.error_used_or_invalid'));
        }
      })
      .catch(() => {
        setStatut('erreur');
        setMessage(t('confirmation_email.error_server'));
      });
  }, [searchParams, t]);

  return (
    <>
      <style>{`
        .confirm-page {
          min-height: 100vh;
          background: #050810;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
          padding: 24px;
        }
        .confirm-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 56px 48px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }
        .confirm-icon { margin-bottom: 24px; }
        .confirm-title {
          font-size: 24px;
          font-weight: 700;
          color: #e8eaf0;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }
        .confirm-msg {
          font-size: 15px;
          color: rgba(232,234,240,0.5);
          line-height: 1.6;
          margin: 0 0 32px;
        }
        .confirm-btn {
          display: inline-block;
          padding: 13px 32px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .confirm-btn:hover { opacity: 0.85; }
        .confirm-btn.succes { background: #00e5ff; color: #050810; }
        .confirm-btn.erreur {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: #e8eaf0;
        }
        .spinner {
          width: 48px; height: 48px;
          border: 3px solid rgba(0,229,255,0.1);
          border-top-color: #00e5ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 24px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="confirm-page">
        <div className="confirm-card">

          {statut === 'chargement' && (
            <>
              <div className="spinner" />
              <h2 className="confirm-title">{t('confirmation_email.loading_title')}</h2>
              <p className="confirm-msg">{t('confirmation_email.loading_desc')}</p>
            </>
          )}

          {statut === 'succes' && (
            <>
              <div className="confirm-icon">
                <ShieldCheck size={56} color="#00e676" />
              </div>
              <h2 className="confirm-title">{t('confirmation_email.success_title')}</h2>
              <p className="confirm-msg">
                {message}<br />
                {t('confirmation_email.success_desc_extra')}
              </p>
              <button
                className="confirm-btn succes"
                onClick={() => navigate('/connexion')}
              >
                {t('confirmation_email.btn_login')}
              </button>
            </>
          )}

          {statut === 'erreur' && (
            <>
              <div className="confirm-icon">
                <XCircle size={56} color="#ff5252" />
              </div>
              <h2 className="confirm-title">{t('confirmation_email.error_title')}</h2>
              <p className="confirm-msg">
                {message}<br />
                {t('confirmation_email.error_desc_extra')}
              </p>
              <button
                className="confirm-btn erreur"
                onClick={() => navigate('/inscription')}
              >
                {t('confirmation_email.btn_back_register')}
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default ConfirmationEmail;