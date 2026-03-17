import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, User, Mail, Lock } from 'lucide-react';
import '../style_localisés/Inscription.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Inscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '/avatars/default-user.png',
    cgv: false
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
      setErreur(t('register.error_cgv', "Vous devez accepter les conditions générales pour créer un compte."));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErreur(t('register.error_password_match', "Les mots de passe ne correspondent pas."));
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
          avatar: formData.avatar
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('register.success_alert', "Compte créé avec succès ! Un e-mail de confirmation vous a été envoyé."));
        navigate('/connexion');
      } else {
        setErreur(data.message || t('register.error_generic', "Une erreur est survenue lors de la création du compte."));
      }
    } catch (err) {
      setErreur(t('alerts.server_unreachable', "Le serveur est injoignable. Veuillez vérifier votre connexion."));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        <div className="brand-header">
          <Shield className="brand-icon" size={40} />
          <h2>{t('register.title', 'Rejoindre l\'infrastructure Cyna')}</h2>
          <p className="subtitle">{t('register.subtitle', 'Créez votre compte pour accéder à nos solutions de cybersécurité.')}</p>
        </div>

        {erreur && <div className="error-box">{erreur}</div>}

        <form onSubmit={soumettre} noValidate>
          <div className="form-content">
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input
                type="text"
                name="prenom"
                placeholder={t('register.firstname_placeholder', 'Prénom')}
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
                placeholder={t('register.lastname_placeholder', 'Nom')}
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
                placeholder={t('register.email_placeholder', 'E-mail professionnel')}
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
                placeholder={t('register.password_placeholder', 'Mot de passe')}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <p className="password-hint">
              {t('register.password_hint', 'Minimum 8 caractères, incluant une majuscule, un chiffre et un symbole.')}
            </p>

            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('register.confirm_password_placeholder', 'Confirmer le mot de passe')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" name="cgv" id="cgv" checked={formData.cgv} onChange={handleChange} />
              <label htmlFor="cgv" className="cgv-text">
                {t('register.accept_terms', "J'accepte les conditions d'utilisation et la politique de confidentialité.")}
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={chargement}>
              {chargement ? t('register.loading', 'Traitement...') : t('register.submit_btn', 'Créer mon compte professionnel')}
            </button>
          </div>
        </form>

        <p className="footer-link">
          {t('register.already_account', 'Déjà inscrit ?')} <a href="/connexion">{t('register.login_link', 'Se connecter')}</a>
        </p>
      </div>
    </div>
  );
}

export default Inscription;