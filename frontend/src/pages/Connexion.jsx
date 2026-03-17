import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import '../style_localisés/Connexion.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Connexion({ setUser }) {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur]     = useState('');
  const [chargement, setChargement] = useState(false);
  const [bloque, setBloque]     = useState(false);
  const navigate                = useNavigate();

  const gererConnexion = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const response = await fetch(`${BASE_URL}/api/login_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        setUser(data.user);
        navigate('/');
      } else {
        if (response.status === 429) {
          setBloque(true);
          // Je désactive le blocage visuel après 30 secondes
          setTimeout(() => setBloque(false), 30000);
        }
        setErreur(data.message || t('auth.invalid_credentials', "Identifiants incorrects ou compte non vérifié."));
      }
    } catch (err) {
      setErreur(t('alerts.server_unreachable', "Le serveur d'authentification est injoignable."));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-header">
          <Shield className="brand-icon" size={42} />
          <h2>{t('auth.login_title', 'Accès Infrastructure Cyna')}</h2>
          <p className="subtitle">{t('auth.login_subtitle', 'Identifiez-vous pour gérer vos services de cybersécurité.')}</p>
        </div>

        {erreur && <div className="error-box">⚠ {erreur}</div>}

        <form onSubmit={gererConnexion} noValidate>
          <div className="form-group">
            <label>{t('auth.email', 'E-mail professionnel')}</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom@entreprise.fr"
                required
                disabled={bloque || chargement}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>{t('auth.password', 'Mot de passe')}</label>
              <Link to="/mot-de-passe-oublie" className="forgot-link">
                {t('auth.forgot_password', 'Oublié ?')}
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={bloque || chargement}
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={bloque || chargement}>
            {chargement ? (
              <span className="loader-btn"><Loader2 className="spinner" size={18} /> {t('auth.processing', 'Vérification...')}</span>
            ) : (
              bloque ? t('auth.wait', 'Sécurité activée : attendez...') : t('auth.login_btn', 'Se connecter')
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>{t('auth.no_account', "Nouveau sur la plateforme ?")} <Link to="/inscription">{t('auth.register_link', "Créer un compte professionnel")}</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Connexion;