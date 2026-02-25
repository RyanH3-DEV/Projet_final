import React, { useState } from 'react';
import '../style_localisés/ReinitialiserMotDePasse.css';

function ReinitialiserMotDePasse({ setCurrentPage }) {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [erreur, setErreur] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (form.password !== form.confirm) {
      setErreur("Les mots de passe ne sont pas identiques.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        alert("C'est fait !");
        setCurrentPage('connexion');
      } else {
        setErreur(data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      setErreur("Impossible de joindre le serveur.");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Nouveau mot de passe</h2>

        {erreur && <div className="status-message error">{erreur}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Ton adresse Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="********"
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="********"
              onChange={e => setForm({...form, confirm: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-reset">Changer</button>
        </form>

        <button onClick={() => setCurrentPage('connexion')} className="btn-back">
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}

export default ReinitialiserMotDePasse;