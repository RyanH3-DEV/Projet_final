import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style_localisés/Connexion.css';

function Connexion({ setUser }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur]     = useState('');
  const [bloque, setBloque]     = useState(false);
  const navigate                = useNavigate();

  const gererConnexion = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login_check', {
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
          setTimeout(() => setBloque(false), 30000);
        }
        setErreur(data.message || "Erreur d'identifiants");
      }
    } catch (err) {
      setErreur("Le serveur est injoignable.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Connexion</h2>
        {erreur && <div className="error-box">{erreur}</div>}
        <form onSubmit={gererConnexion}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={bloque} />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={bloque} />
          </div>
          <button type="submit" className="btn-login" disabled={bloque}>
            {bloque ? "Attendez..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Connexion;