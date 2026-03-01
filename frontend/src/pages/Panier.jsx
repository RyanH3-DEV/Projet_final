import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { removeFromCart, updateCartItem } from '../api/cartApi';
import '../style_localisés/Panier.css';

const IS_SANDBOX = import.meta.env.VITE_PAYMENT_ENV !== 'production';

const PAYPAL_CLIENT_ID = IS_SANDBOX
  ? import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID
  : import.meta.env.VITE_PAYPAL_LIVE_CLIENT_ID;

const stripePromise = loadStripe(
  IS_SANDBOX
    ? import.meta.env.VITE_STRIPE_SANDBOX_PUBLIC_KEY
    : import.meta.env.VITE_STRIPE_LIVE_PUBLIC_KEY
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 FORMULAIRE STRIPE — champs séparés (CB + 3D Secure)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STRIPE_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e2328',
      fontFamily: 'Segoe UI, sans-serif',
      '::placeholder': { color: '#aaa' },
    },
    invalid: { color: '#e74c3c' },
  },
};

function StripeForm({ total, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [nom, setNom] = useState('');

  const payer = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErreur('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/paiement/stripe/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'eur',
          email: localStorage.getItem('userEmail'),
        }),
      });

      const { clientSecret } = await res.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: nom,
            email: localStorage.getItem('userEmail'),
          },
        },
      });

      if (error) {
        setErreur(error.message);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess('stripe');
      }
    } catch (err) {
      setErreur("Erreur de connexion au serveur de paiement.");
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={payer} className="stripe-form">
      <p className="stripe-label">💳 Informations de carte bancaire</p>

      {/* Nom sur la carte */}
      <div className="stripe-field-group">
        <label className="stripe-field-label">Nom sur la carte</label>
        <input
          type="text"
          className="stripe-input-text"
          placeholder="Jean Dupont"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
      </div>

      {/* Numéro de carte */}
      <div className="stripe-field-group">
        <label className="stripe-field-label">Numéro de carte</label>
        <div className="card-element-wrapper">
          <CardNumberElement options={STRIPE_STYLE} />
        </div>
      </div>

      {/* Date + CVC côte à côte */}
      <div className="stripe-row">
        <div className="stripe-field-group">
          <label className="stripe-field-label">Date d'expiration</label>
          <div className="card-element-wrapper">
            <CardExpiryElement options={STRIPE_STYLE} />
          </div>
        </div>
        <div className="stripe-field-group">
          <label className="stripe-field-label">CVC</label>
          <div className="card-element-wrapper">
            <CardCvcElement options={STRIPE_STYLE} />
          </div>
        </div>
      </div>

      {erreur && <p className="stripe-error">⚠ {erreur}</p>}

      <button type="submit" className="btn-payer-carte" disabled={!stripe || loading}>
        {loading ? '⏳ Traitement en cours...' : `🔒 Payer ${total.toFixed(2)} € par carte`}
      </button>
      <p className="secure-note">🔐 Paiement sécurisé 3D Secure — vos données ne sont jamais stockées</p>
    </form>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏅 BANDEAU DE LOGOS DE SÉCURITÉ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SecuriteBadges() {
  return (
    <div className="securite-bandeau">
      <p className="securite-titre">🔒 Paiement 100% sécurisé</p>
      <div className="securite-logos">
        <div className="badge-item">
          <span className="badge-icon">🔐</span>
          <span className="badge-text">SSL<br/>Chiffré</span>
        </div>
        <div className="badge-item badge-highlight">
          <span className="badge-icon">🛡️</span>
          <span className="badge-text">3D<br/>Secure</span>
        </div>
        <div className="badge-item badge-visa">
          <span className="visa-text">VISA</span>
        </div>
        <div className="badge-item">
          <div className="mastercard-circles">
            <div className="mc-circle mc-red"></div>
            <div className="mc-circle mc-orange"></div>
          </div>
        </div>
        <div className="badge-item badge-paypal-logo">
          <span className="paypal-logo-text">
            <span className="pp-blue">Pay</span><span className="pp-dark">Pal</span>
          </span>
        </div>
        <div className="badge-item badge-stripe">
          <span className="stripe-logo-text">stripe</span>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛒 COMPOSANT PRINCIPAL PANIER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Panier({ panier, rafraichirPanier }) {
  const [modePaiement, setModePaiement] = useState(null);
  const [paiementReussi, setPaiementReussi] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState('');

  const total = panier.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const gererSuppression = async (id) => {
    try {
      await removeFromCart(id);
      await rafraichirPanier();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const gererQuantite = async (id, quantiteActuelle, changement) => {
    const nouvelleQuantite = quantiteActuelle + changement;
    if (nouvelleQuantite < 1) { await gererSuppression(id); return; }
    try {
      await updateCartItem(id, nouvelleQuantite);
      await rafraichirPanier();
    } catch {
      alert("Erreur de mise à jour");
    }
  };

  const onSuccess = () => { setPaiementReussi(true); setModePaiement(null); };
  const onError = (msg) => setErreurPaiement(msg);

  if (paiementReussi) {
    return (
      <div className="panier-container">
        <div className="paiement-confirme">
          <div className="confirme-icon">✅</div>
          <h2>Paiement confirmé !</h2>
          <p>Merci pour ta commande. Tu recevras un email de confirmation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panier-container">
      <h2>Mon Panier Sauvegardé</h2>

      {panier.length === 0 ? (
        <p className="panier-vide">Ton panier est vide.</p>
      ) : (
        <>
          {/* Articles */}
          <div className="panier-items">
            {panier.map((item) => (
              <div key={item.id} className="item-row">
                <img src={item.image} alt={item.title} className="item-img" />
                <div className="item-details">
                  <p className="item-title"><strong>{item.title}</strong></p>
                  <p>Prix : {item.price.toFixed(2)} €</p>
                </div>
                <div className="item-actions">
                  <button className="btn-quantite" onClick={() => gererQuantite(item.id, item.quantity, -1)}>-</button>
                  <span className="qte-text">{item.quantity}</span>
                  <button className="btn-quantite" onClick={() => gererQuantite(item.id, item.quantity, 1)}>+</button>
                  <button className="btn-supprimer" onClick={() => gererSuppression(item.id)}>✕</button>
                </div>
              </div>
            ))}
            <hr className="divider" />
            <h3 className="total-text">Total : {total.toFixed(2)} €</h3>
          </div>

          {/* Section paiement */}
          <div className="paiement-section">
            <h3>Paiement Sécurisé</h3>
            <p className="paiement-desc">Choisis ton mode de règlement pour confirmer ta commande.</p>

            {erreurPaiement && (
              <div className="error-box" style={{ marginBottom: '15px' }}>⚠ {erreurPaiement}</div>
            )}

            {/* Choix du mode */}
            {!modePaiement && (
              <div className="paiement-boutons">
                <button className="btn-mastercard" onClick={() => setModePaiement('carte')}>
                  💳 Payer par carte
                </button>
                <button className="btn-paypal" onClick={() => setModePaiement('paypal')}>
                  Payer avec PayPal
                </button>
              </div>
            )}

            {/* Formulaire Stripe */}
            {modePaiement === 'carte' && (
              <div className="paiement-form-wrapper">
                <button className="btn-retour" onClick={() => { setModePaiement(null); setErreurPaiement(''); }}>
                  ← Retour
                </button>
                <Elements stripe={stripePromise}>
                  <StripeForm total={total} onSuccess={onSuccess} onError={onError} />
                </Elements>
              </div>
            )}

            {/* PayPal */}
            {modePaiement === 'paypal' && (
              <div className="paiement-form-wrapper">
                <button className="btn-retour" onClick={() => { setModePaiement(null); setErreurPaiement(''); }}>
                  ← Retour
                </button>
                {!PAYPAL_CLIENT_ID ? (
                  <div className="error-box">⚠ PayPal n'est pas encore configuré. Utilisez le paiement par carte.</div>
                ) : (
                  <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'EUR', intent: 'capture' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                      createOrder={async () => {
                        const res = await fetch('http://127.0.0.1:8000/api/paiement/paypal/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: total.toFixed(2), email: localStorage.getItem('userEmail') }),
                        });
                        const { orderID } = await res.json();
                        return orderID;
                      }}
                      onApprove={async (data) => {
                        const res = await fetch('http://127.0.0.1:8000/api/paiement/paypal/capture', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderID: data.orderID }),
                        });
                        const result = await res.json();
                        result.status === 'COMPLETED' ? onSuccess('paypal') : onError("Paiement PayPal non complété.");
                      }}
                      onError={(err) => onError("Erreur PayPal : " + err)}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}
          </div>

          <SecuriteBadges />
        </>
      )}
    </div>
  );
}

export default Panier;