import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, User, Mail, Lock } from 'lucide-react';
import '../style_localisés/Inscription.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function Inscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    cgv: false,
    newsletter: false
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');

    if (!formData.cgv) {
      setErreur(t('register.error_cgv'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErreur(t('register.error_password_match'));
      return;
    }

    const regexMdp = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=])[A-Za-z\d@$!%*?&_\-+=]{8,}$/;
    if (!regexMdp.test(formData.password)) {
      setErreur(t('register.error_password_weak'));
      return;
    }

    setChargement(true);

    try {
      const response = await fetch(`${BASE_URL}/api/inscription-securisee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          password: formData.password,
          cgv: formData.cgv,
          newsletter: formData.newsletter,
          avatar: formData.avatar
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('register.success_alert'));
        navigate('/connexion');
      } else {
        setErreur(data.message || t('register.error_generic'));
      }
    } catch (err) {
      setErreur(t('alerts.server_unreachable'));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        <div className="brand-header">
          <Shield className="brand-icon" size={40} />
          <h2>{t('register.title')}</h2>
          <p className="subtitle">{t('register.subtitle')}</p>
        </div>

        {erreur && <div className="error-box">{erreur}</div>}

        <form onSubmit={soumettre} noValidate>
          <div className="form-content">
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input
                type="text"
                name="prenom"
                placeholder={t('register.firstname_placeholder')}
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <User className="input-icon" size={18} />
              <input
                type="text"
                name="nom"
                placeholder={t('register.lastname_placeholder')}
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="email"
                placeholder={t('register.email_placeholder')}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                name="password"
                placeholder={t('register.password_placeholder')}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <p className="password-hint">
              {t('register.password_hint')}
            </p>

            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('register.confirm_password_placeholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" name="newsletter" id="newsletter" checked={formData.newsletter} onChange={handleChange} />
              <label htmlFor="newsletter" className="cgv-text">
                {t('register.newsletter_optin')}
              </label>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" name="cgv" id="cgv" checked={formData.cgv} onChange={handleChange} />
              <label htmlFor="cgv" className="cgv-text">
                {t('register.accept_terms')}
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={chargement}>
              {chargement ? t('register.loading') : t('register.submit_btn')}
            </button>
          </div>
        </form>

        <p className="footer-link">
          {t('register.already_account')} <a href="/connexion">{t('register.login_link')}</a>
        </p>
      </div>
    </div>
  );
}

export default Inscription;