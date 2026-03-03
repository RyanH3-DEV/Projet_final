import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style_localisés/Inscription.css';

function Inscription() {
  const navigate = useNavigate();

  const categoriesLecteurs = [
    { id: 'mysterieux', label: 'Le Mystérieux',  imgUrl: '/avatars/Mysterieux.png' },
    { id: 'celebre',    label: 'Le Célèbre',     imgUrl: '/avatars/celebre.png' },
    { id: 'rigoureux',  label: 'Le Rigoureux',   imgUrl: '/avatars/liseur.jpg' },
    { id: 'passionne',  label: 'Le Passionné',   imgUrl: '/avatars/ancien-lecteur.jpg' },
    { id: 'voyageur',   label: 'Le Voyageur',    imgUrl: '/avatars/liseuse.png' },
  ];

  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', dateNaissance: '',
    password: '', confirmPassword: '',
    avatar: categoriesLecteurs[0].id,
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
      setErreur("Tu dois accepter les CGV et les CGU pour pouvoir t'inscrire.");
      return;
    }
    if (!formData.dateNaissance) {
      setErreur("Veuillez entrer votre date de naissance.");
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
      setErreur("Tu dois avoir au moins 18 ans pour t'inscrire.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErreur("Les mots de passe ne correspondent pas.");
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
        alert("Ton aventure commence ! Connecte-toi maintenant.");
        navigate('/connexion');
      } else {
        setErreur(data.message || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err) {
      setErreur("Impossible de joindre le serveur. Vérifie ta connexion.");
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        <h2>Choisis ton profil de lecteur</h2>
        {erreur && <div className="error-box">{erreur}</div>}
        <form onSubmit={soumettre} noValidate>
          <div className="avatar-grid">
            {categoriesLecteurs.map((cat) => (
              <div
                key={cat.id}
                className={`avatar-item ${formData.avatar === cat.id ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, avatar: cat.id })}
              >
                <img src={cat.imgUrl} alt={cat.label} />
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
          <div className="form-content">
            <input type="text"     name="prenom"          placeholder="Prénom"                      onChange={handleChange} required />
            <input type="text"     name="nom"             placeholder="Nom"                         onChange={handleChange} required />
            <input type="email"    name="email"           placeholder="Email"                       onChange={handleChange} required />
            <input type="date"     name="dateNaissance"                                              onChange={handleChange} required />
            <input type="password" name="password"        placeholder="Mot de passe"                onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirmation du mot de passe" onChange={handleChange} required />
            <div className="checkbox-group">
              <input type="checkbox" name="cgv" checked={formData.cgv} onChange={handleChange} />
              <span className="cgv-text">
                J'accepte les
                <a className="cgv-link" href="/cgv" target="_blank" rel="noopener noreferrer"> CGV </a>
                et les
                <a className="cgv-link" href="/cgu" target="_blank" rel="noopener noreferrer"> CGU</a>.
              </span>
            </div>
            <button type="submit" className="btn-submit">Valider mon profil</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Inscription;