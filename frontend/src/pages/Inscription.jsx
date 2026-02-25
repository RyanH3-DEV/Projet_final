import React, { useState } from 'react';
import '../style_localisés/Inscription.css';

function Inscription({ setCurrentPage }) {
  // Je définis les avatars par style de lecture
  const categoriesLecteurs = [
    { id: 'mysterieux', label: 'Le Mystérieux', seed: 'mystic', desc: 'Lit dans l\'ombre' },
    { id: 'connu', label: 'Le Célèbre', seed: 'star', desc: 'Influenceur littéraire' },
    { id: 'rigoureux', label: 'Le Rigoureux', seed: 'pro', desc: 'Analyse chaque ligne' },
    { id: 'passionne', label: 'Le Passionné', seed: 'fire', desc: 'Dévore les chapitres' },
    { id: 'voyageur', label: 'Le Voyageur', seed: 'map', desc: 'S\'évade par les mots' },
    { id: 'classique', label: 'Le Classique', seed: 'ancient', desc: 'Amoureux du papier' }
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

    if (formData.password !== formData.confirmPassword) {
      setErreur("Je constate que les mots de passe ne correspondent pas.");
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
        alert("Ton aventure commence !");
        setCurrentPage('connexion');
      } else {
        setErreur(data.message);
      }
    } catch (err) {
      setErreur("Je n'arrive pas à joindre le serveur.");
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        <header className="card-header">
          <h2>Choisis ton profil de lecteur</h2>
          <p>Rejoins la communauté des passionnés</p>
        </header>

        {erreur && <div className="error-box">{erreur}</div>}

        <form onSubmit={soumettre}>
          {/* Grille de sélection d'avatar style "Champion Select" */}
          <div className="avatar-grid">
            {categoriesLecteurs.map((cat) => (
              <div
                key={cat.id}
                className={`avatar-item ${formData.avatar === cat.id ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, avatar: cat.id })}
              >
                <div className="avatar-frame">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cat.seed}`} alt={cat.label} />
                </div>
                <span className="avatar-label">{cat.label}</span>
              </div>
            ))}
          </div>

          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input type="text" name="prenom" onChange={handleChange} required placeholder="Jean" />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" name="nom" onChange={handleChange} required placeholder="Dupont" />
              </div>
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input type="email" name="email" onChange={handleChange} required placeholder="nom@exemple.com" />
            </div>

            <div className="form-group">
              <label>Date de naissance</label>
              <input type="date" name="dateNaissance" onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" onChange={handleChange} required placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirmation</label>
                <input type="password" name="confirmPassword" onChange={handleChange} required placeholder="••••••••" />
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" name="cgv" id="cgv" checked={formData.cgv} onChange={handleChange} />
              <label htmlFor="cgv">J'accepte les <strong>CGU / CGV</strong></label>
            </div>

            <button type="submit" className="btn-submit">Valider mon profil</button>
          </div>
        </form>

        <button onClick={() => setCurrentPage('connexion')} className="btn-link">
          Déjà un compte ? Connecte-toi ici
        </button>
      </div>
    </div>
  );
}

export default Inscription;