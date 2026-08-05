import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, XCircle } from 'lucide-react';
import '../Style_localisés/ConfirmationEmail.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ConfirmationEmail({ setUser }) {
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

          // Connexion automatique si les infos utilisateur sont présentes
          if (data.user && data.token && setUser) {
            await setUser({ ...data.user, token: data.token }, true);
          }
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
              Vous êtes maintenant connecté.
            </p>
            <button
              className="confirm-btn succes"
              onClick={() => navigate('/')}
            >
              Accéder à mon espace
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
  );
}

export default ConfirmationEmail;