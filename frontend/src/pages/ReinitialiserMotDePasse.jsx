import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import '../style_localisés/ReinitialiserMotDePasse.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ReinitialiserMotDePasse() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (form.password !== form.confirm) {
      setErreur(t('auth.err_password_match'));
      return;
    }

    if (!token) {
      setErreur(t('auth.err_token_missing'));
      return;
    }

    setChargement(true);

    try {
      const response = await fetch(`${BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          password: form.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucces(true);
        setTimeout(() => navigate('/connexion'), 3000);
      } else {
        setErreur(data.message || t('auth.err_generic'));
      }
    } catch (err) {
      setErreur(t('alerts.server_unreachable'));
    } finally {
      setChargement(false);
    }
  };

  if (succes) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card succes-state">
          <CheckCircle size={48} color="#2ecc71" />
          <h2>{t('auth.reset_success')}</h2>
          <p>{t('auth.redirect_login')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="brand-header">
          <Shield className="brand-icon" size={40} />
          <h2>{t('auth.new_password_title')}</h2>
          <p>{t('auth.reset_instruction')}</p>
        </div>

        {erreur && (
          <div className="error-box">
            <AlertCircle size={18} />
            <span>{erreur}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.new_password')}</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                onChange={e => setForm({...form, password: e.target.value})}
                required
                disabled={chargement}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('auth.confirm_new_password')}</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                onChange={e => setForm({...form, confirm: e.target.value})}
                required
                disabled={chargement}
              />
            </div>
          </div>

          <button type="submit" className="btn-reset" disabled={chargement || !token}>
            {chargement ? <Loader2 className="spinner" size={18} /> : t('auth.change_btn')}
          </button>
        </form>

        <button onClick={() => navigate('/connexion')} className="btn-back">
          {t('auth.back_to_login')}
        </button>
      </div>
    </div>
  );
}

export default ReinitialiserMotDePasse;