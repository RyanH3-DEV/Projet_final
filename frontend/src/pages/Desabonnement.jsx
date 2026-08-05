import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import '../style_localisés/Desabonnement.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function Desabonnement() {
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
      setMessage(t('unsubscribe.invalid_link'));
      return;
    }

    fetch(`${BASE_URL}/api/newsletter/unsubscribe?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatut('succes');
          setMessage(data.message || t('unsubscribe.success_default'));
        } else {
          setStatut('erreur');
          setMessage(data.message || t('unsubscribe.error_default'));
        }
      })
      .catch(() => {
        setStatut('erreur');
        setMessage(t('unsubscribe.server_unreachable'));
      });
  }, [searchParams, t]);

  return (
    <div className="unsub-container">
      <div className="unsub-card">
        {statut === 'chargement' && (
          <>
            <Loader2 className="spinner" size={48} />
            <h2>{t('unsubscribe.loading_title')}</h2>
            <p>{t('unsubscribe.loading_desc')}</p>
          </>
        )}

        {statut === 'succes' && (
          <>
            <CheckCircle className="icon-succes" size={56} />
            <h2>{t('unsubscribe.success_title')}</h2>
            <p>{message}</p>
            <button className="unsub-btn" onClick={() => navigate('/')}>
              {t('unsubscribe.btn_home')}
            </button>
          </>
        )}

        {statut === 'erreur' && (
          <>
            <XCircle className="icon-erreur" size={56} />
            <h2>{t('unsubscribe.error_title')}</h2>
            <p>{message}</p>
            <button className="unsub-btn secondary" onClick={() => navigate('/connexion')}>
              {t('unsubscribe.btn_profile')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Desabonnement;