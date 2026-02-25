import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';
import '../style_localisés/Paiement.css';

function Paiement({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    nomCarte: '',
    numeroCarte: '',
    dateExpiration: '',
    cvc: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const gererPaiement = (e) => {
    e.preventDefault();
    // Je simule un traitement de paiement
    alert("Traitement sécurisé en cours... Paiement accepté !");
    setCurrentPage('home');
  };

  return (
    <div className="paiement-container">
      <div className="paiement-card">

        <div className="paiement-header">
          <h2>Paiement Sécurisé</h2>
          <p>Finalisez votre commande en toute sécurité.</p>
        </div>

        <form onSubmit={gererPaiement} className="paiement-form">
          <div className="form-group">
            <label>Nom sur la carte</label>
            <input
              type="text"
              name="nomCarte"
              placeholder="Jean Dupont"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Numéro de carte</label>
            <div className="input-with-icon">
              <CreditCard size={20} className="input-icon" />
              <input
                type="text"
                name="numeroCarte"
                placeholder="0000 0000 0000 0000"
                maxLength="19"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date d'expiration</label>
              <input
                type="text"
                name="dateExpiration"
                placeholder="MM/AA"
                maxLength="5"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>CVC</label>
              <input
                type="text"
                name="cvc"
                placeholder="123"
                maxLength="3"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-payer">
            <Lock size={18} style={{ marginRight: '8px' }} />
            Confirmer le paiement
          </button>
        </form>

        {/* Section de réassurance bien visible */}
        <div className="security-badges">
          <div className="badge">
            <ShieldCheck size={32} />
            <span>Paiement 100% Sécurisé<br/>Cryptage SSL 256-bit</span>
          </div>
          <div className="badge">
            <div className="secure-text">3D SECURE</div>
            <span>Vérification<br/>bancaire activée</span>
          </div>
        </div>

        <button onClick={() => setCurrentPage('panier')} className="btn-retour">
          Retour au panier
        </button>
      </div>
    </div>
  );
}

export default Paiement;