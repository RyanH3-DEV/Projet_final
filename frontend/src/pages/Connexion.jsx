import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import '../style_localisés/Connexion.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function Connexion({ setUser }) {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur]     = useState('');
  const [chargement, setChargement] = useState(false);
  const [bloque, setBloque]     = useState(false);
  const [resterConnecte, setResterConnecte] = useState(false);

  const navigate = useNavigate();

  const gererConnexion = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const response = await fetch(`${BASE_URL}/api/connexion_directe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const stockage = resterConnecte ? localStorage : sessionStorage;

        stockage.setItem('token', data.token);
        stockage.setItem('user', JSON.stringify(data.user));

        if (!resterConnecte) {
            sessionStorage.setItem('autoLogout', 'true');
        }

        setUser(data.user);

        if (data.user.roles.includes('ROLE_ADMIN')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        if (response.status === 429) {
          setBloque(true);
          setTimeout(() => setBloque(false), 30000);
        }
        setErreur(data.message || t('auth.invalid_credentials'));
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
          <h2>{t('auth.login_title')}</h2>
          <p className="subtitle">{t('auth.login_subtitle')}</p>
        </div>

        {erreur && <div className="error-box">⚠ {erreur}</div>}

        <form onSubmit={gererConnexion} noValidate>
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
                disabled={bloque || chargement}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>{t('auth.password')}</label>
              <Link to="/mot-de-passe-oublie" className="forgot-link">
                {t('auth.forgot_password')}
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

          <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={resterConnecte}
              onChange={(e) => setResterConnecte(e.target.checked)}
              disabled={bloque || chargement}
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#00e5ff' }}
            />
            <label htmlFor="rememberMe" style={{ margin: 0, fontSize: '14px', color: '#e8eaf0', cursor: 'pointer' }}>
              {t('auth.remember_me')}
            </label>
          </div>

          <button type="submit" className="btn-login" disabled={bloque || chargement}>
            {chargement ? (
              <span className="loader-btn"><Loader2 className="spinner" size={18} /> {t('auth.processing')}</span>
            ) : (
              bloque ? t('auth.wait') : t('auth.login_btn')
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>{t('auth.no_account')} <Link to="/inscription">{t('auth.register_link')}</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Connexion;