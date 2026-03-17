import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { ShieldCheck } from 'lucide-react';
import { removeFromCart, updateCartItem } from '../api/cartApi';
import '../style_localisés/Panier.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const IS_SANDBOX = import.meta.env.VITE_PAYMENT_ENV !== 'production';

const PAYPAL_CLIENT_ID = IS_SANDBOX
  ? import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID
  : import.meta.env.VITE_PAYPAL_LIVE_CLIENT_ID;

const stripePromise = loadStripe(
  IS_SANDBOX
    ? import.meta.env.VITE_STRIPE_SANDBOX_PUBLIC_KEY
    : import.meta.env.VITE_STRIPE_LIVE_PUBLIC_KEY
);

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
  const { t } = useTranslation();
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
      const res = await fetch(`${BASE_URL}/api/paiement/stripe/intent`, {
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
      setErreur(t('cart.err_stripe_conn', "Erreur de connexion au serveur de paiement."));
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={payer} className="stripe-form">
      <p className="stripe-label">{t('cart.stripe_title', '💳 Informations de facturation sécurisées')}</p>

      <div className="stripe-field-group">
        <label className="stripe-field-label">{t('cart.name_on_card', 'Nom du titulaire ou de l\'entreprise')}</label>
        <input
          type="text"
          className="stripe-input-text"
          placeholder={t('cart.name_placeholder', 'Jean Dupont')}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
      </div>

      <div className="stripe-field-group">
        <label className="stripe-field-label">{t('cart.card_number', 'Numéro de carte')}</label>
        <div className="card-element-wrapper">
          <CardNumberElement options={STRIPE_STYLE} />
        </div>
      </div>

      <div className="stripe-row">
        <div className="stripe-field-group">
          <label className="stripe-field-label">{t('cart.expiry_date', "Date d'expiration")}</label>
          <div className="card-element-wrapper">
            <CardExpiryElement options={STRIPE_STYLE} />
          </div>
        </div>
        <div className="stripe-field-group">
          <label className="stripe-field-label">{t('cart.cvc', 'CVC')}</label>
          <div className="card-element-wrapper">
            <CardCvcElement options={STRIPE_STYLE} />
          </div>
        </div>
      </div>

      {erreur && <p className="stripe-error">⚠ {erreur}</p>}

      <button type="submit" className="btn-payer-carte" disabled={!stripe || loading}>
        {loading ? t('cart.processing', '⏳ Traitement...') : `🔒 ${t('cart.pay', 'Souscrire')} ${total.toFixed(2)} €`}
      </button>
    </form>
  );
}

function SecuriteBadges() {
  const { t } = useTranslation();
  return (
    <div className="securite-bandeau">
      <p className="securite-titre">{t('cart.secure_100', '🔒 Infrastructure de paiement 100% sécurisée')}</p>
      <div className="securite-logos">
        <div className="badge-item">
          <span className="badge-icon">🔐</span>
          <span className="badge-text">SSL Chiffré</span>
        </div>
        <div className="badge-item badge-highlight">
          <span className="badge-icon">🛡️</span>
          <span className="badge-text">3D Secure</span>
        </div>
        <div className="badge-item badge-visa">
          <span className="visa-text">VISA</span>
        </div>
        <div className="badge-item badge-paypal-logo">
          <span className="paypal-logo-text">Paypal</span>
        </div>
        <div className="badge-item badge-stripe">
          <span className="stripe-logo-text">stripe</span>
        </div>
      </div>
    </div>
  );
}

function Panier({ panier, rafraichirPanier }) {
  const { t } = useTranslation();
  const [modePaiement, setModePaiement] = useState(null);
  const [paiementReussi, setPaiementReussi] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState('');

  const total = panier.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const gererSuppression = async (id) => {
    try {
      await removeFromCart(id);
      await rafraichirPanier();
    } catch {
      alert(t('cart.err_delete', "Erreur lors du retrait du service"));
    }
  };

  const gererQuantite = async (id, qte, changement) => {
    const nouvelleQte = qte + changement;
    if (nouvelleQte < 1) { await gererSuppression(id); return; }
    try {
      // J'appelle l'API avec la nouvelle quantité
      await updateCartItem(id, { quantity: nouvelleQte });
      await rafraichirPanier();
    } catch {
      alert(t('cart.err_update', "Erreur de mise à jour des licences"));
    }
  };

  const gererDuree = async (id, nouvelleDuree) => {
    try {
      // J'appelle l'API pour changer la période d'abonnement
      await updateCartItem(id, { subscriptionDuration: nouvelleDuree });
      await rafraichirPanier();
    } catch {
      alert(t('cart.err_duration', "Erreur de changement de période"));
    }
  };

  const onSuccess = async (methode) => {
    try {
      await fetch(`${BASE_URL}/api/profil/commandes/creer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: localStorage.getItem('userEmail'),
          paymentMethod: methode,
          billingAddress: "Adresse de facturation par défaut" // Sera récupéré depuis le carnet d'adresses
        }),
      });
    } catch (e) {
      console.error('Erreur sauvegarde commande', e);
    }
    setPaiementReussi(true);
    setModePaiement(null);
    await rafraichirPanier();
  };

  if (paiementReussi) {
    return (
      <div className="panier-container">
        <div className="paiement-confirme">
          <div className="confirme-icon"><ShieldCheck size={64} color="#2ecc71" /></div>
          <h2>{t('cart.success_title', 'Activation validée !')}</h2>
          <p>{t('cart.success_msg', 'Vos services SaaS Cyna sont en cours d\'activation. Vous allez recevoir un email récapitulatif.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panier-container">
      <h2>{t('cart.title', 'Récapitulatif de votre souscription')}</h2>

      {panier.length === 0 ? (
        <p className="panier-vide">{t('cart.empty', 'Aucun service sélectionné dans votre panier.')}</p>
      ) : (
        <>
          <div className="panier-items">
            {panier.map((item) => (
              <div key={item.id} className="item-row">
                <img src={item.image} alt={item.name} className="item-img" />
                <div className="item-details">
                  <p className="item-title"><strong>{item.name}</strong></p>
                  <div className="subscription-choice">
                    <label>{t('cart.period', 'Période :')}</label>
                    <select
                      value={item.subscriptionDuration || 'mensuel'}
                      onChange={(e) => gererDuree(item.id, e.target.value)}
                      className="duration-select"
                    >
                      <option value="mensuel">{t('cart.monthly', 'Mensuel')}</option>
                      <option value="annuel">{t('cart.yearly', 'Annuel (-15%)')}</option>
                    </select>
                  </div>
                </div>
                <div className="item-actions">
                  <div className="quantity-controls">
                    <label>{t('cart.licences', 'Licences :')}</label>
                    <button className="btn-quantite" onClick={() => gererQuantite(item.id, item.quantity, -1)}>-</button>
                    <span className="qte-text">{item.quantity}</span>
                    <button className="btn-quantite" onClick={() => gererQuantite(item.id, item.quantity, 1)}>+</button>
                  </div>
                  <p className="item-price">{(item.price * item.quantity).toFixed(2)} €</p>
                  <button className="btn-supprimer" onClick={() => gererSuppression(item.id)}>✕</button>
                </div>
              </div>
            ))}
            <hr className="divider" />
            <h3 className="total-text">{t('cart.total', 'Total HT :')} {total.toFixed(2)} €</h3>
          </div>

          <div className="paiement-section">
            <h3>{t('cart.payment_secure', 'Paiement Sécurisé')}</h3>
            {erreurPaiement && <div className="error-box">⚠ {erreurPaiement}</div>}

            {!modePaiement && (
              <div className="paiement-boutons">
                <button className="btn-mastercard" onClick={() => setModePaiement('carte')}>
                  {t('cart.btn_card', '💳 Régler par carte')}
                </button>
                <button className="btn-paypal" onClick={() => setModePaiement('paypal')}>
                  {t('cart.btn_paypal', 'Régler via PayPal')}
                </button>
              </div>
            )}

            {modePaiement === 'carte' && (
              <div className="paiement-form-wrapper">
                <button className="btn-retour" onClick={() => { setModePaiement(null); setErreurPaiement(''); }}>
                  {t('cart.btn_back', '← Retour au panier')}
                </button>
                <Elements stripe={stripePromise}>
                  <StripeForm total={total} onSuccess={onSuccess} onError={setErreurPaiement} />
                </Elements>
              </div>
            )}

            {modePaiement === 'paypal' && (
              <div className="paiement-form-wrapper">
                <button className="btn-retour" onClick={() => { setModePaiement(null); setErreurPaiement(''); }}>
                  {t('cart.btn_back', '← Retour au panier')}
                </button>
                <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'EUR' }}>
                  <PayPalButtons
                    createOrder={async () => {
                      const res = await fetch(`${BASE_URL}/api/paiement/paypal/create`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: total.toFixed(2), email: localStorage.getItem('userEmail') }),
                      });
                      const { orderID } = await res.json();
                      return orderID;
                    }}
                    onApprove={async (data) => {
                      const res = await fetch(`${BASE_URL}/api/paiement/paypal/capture`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderID: data.orderID }),
                      });
                      const result = await res.json();
                      if (result.status === 'COMPLETED') onSuccess('paypal');
                    }}
                  />
                </PayPalScriptProvider>
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