import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style_localisés/Inscription.css';

function Inscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categoriesLecteurs = [
    { id: 'mysterieux', label: t('register.cat_mysterious', 'Le Mystérieux'),  imgUrl: '/avatars/Mysterieux.png' },
    { id: 'celebre',    label: t('register.cat_famous', 'Le Célèbre'),         imgUrl: '/avatars/celebre.png' },
    { id: 'rigoureux',  label: t('register.cat_rigorous', 'Le Rigoureux'),     imgUrl: '/avatars/liseur.jpg' },
    { id: 'passionne',  label: t('register.cat_passionate', 'Le Passionné'),   imgUrl: '/avatars/ancien-lecteur.jpg' },
    { id: 'voyageur',   label: t('register.cat_traveler', 'Le Voyageur'),      imgUrl: '/avatars/liseuse.png' },
  ];

  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', dateNaissance: '',
    password: '', confirmPassword: '',
    avatar: categoriesLecteurs[0].imgUrl,
    cgv: false
  });
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');

    if (!formData.cgv) {
      setErreur(t('register.error_cgv', "Tu dois accepter les CGV et les CGU pour pouvoir t'inscrire."));
      return;
    }
    if (!formData.dateNaissance) {
      setErreur(t('register.error_dob_required', "Veuillez entrer votre date de naissance."));
      return;
    }

    const dateNaissance = new Date(formData.dateNaissance);
    const aujourdhui   = new Date();
    let age = aujourdhui.getFullYear() - dateNaissance.getFullYear();
    const moisPasse =
      aujourdhui.getMonth() > dateNaissance.getMonth() ||
      (aujourdhui.getMonth() === dateNaissance.getMonth() && aujourdhui.getDate() >= dateNaissance.getDate());
    if (!moisPasse) age--;

    if (age < 18) {
      setErreur(t('register.error_age_18', "Tu dois avoir au moins 18 ans pour t'inscrire."));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErreur(t('register.error_password_match', "Les mots de passe ne correspondent pas."));
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/inscription-securisee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert(t('register.success_alert', "Ton aventure commence ! Connecte-toi maintenant."));
        navigate('/connexion');
      } else {
        setErreur(data.message || t('register.error_generic', "Une erreur est survenue lors de l'inscription."));
      }
    } catch (err) {
      setErreur(t('alerts.server_unreachable', "Impossible de joindre le serveur. Vérifie ta connexion."));
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        <h2>{t('register.title', 'Choisis ton profil de lecteur')}</h2>
        {erreur && <div className="error-box">{erreur}</div>}
        <form onSubmit={soumettre} noValidate>
          <div className="avatar-grid">
            {categoriesLecteurs.map((cat) => (
              <div
                key={cat.id}
                className={`avatar-item ${formData.avatar === cat.imgUrl ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, avatar: cat.imgUrl })}
              >
                <img src={cat.imgUrl} alt={cat.label} />
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
          <div className="form-content">
            <input type="text"     name="prenom"          placeholder={t('register.firstname_placeholder', 'Prénom')}                      onChange={handleChange} required />
            <input type="text"     name="nom"             placeholder={t('register.lastname_placeholder', 'Nom')}                         onChange={handleChange} required />
            <input type="email"    name="email"           placeholder={t('register.email_placeholder', 'Email')}                       onChange={handleChange} required />
            <input type="date"     name="dateNaissance"                                                                               onChange={handleChange} required />
            <input type="password" name="password"        placeholder={t('register.password_placeholder', 'Mot de passe')}                onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder={t('register.confirm_password_placeholder', 'Confirmation du mot de passe')} onChange={handleChange} required />
            <div className="checkbox-group">
              <input type="checkbox" name="cgv" checked={formData.cgv} onChange={handleChange} />
              <span className="cgv-text">
                {t('register.accept_terms_1', "J'accepte les ")}
                <a className="cgv-link" href="/cgv" target="_blank" rel="noopener noreferrer">{t('register.cgv_link', 'CGV')}</a>
                {t('register.accept_terms_2', ' et les ')}
                <a className="cgv-link" href="/cgu" target="_blank" rel="noopener noreferrer">{t('register.cgu_link', 'CGU')}</a>
                {t('register.accept_terms_3', '.')}
              </span>
            </div>
            <button type="submit" className="btn-submit">{t('register.submit_btn', 'Valider mon profil')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Inscription;