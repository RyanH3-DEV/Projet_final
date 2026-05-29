import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardNumberElement, CardExpiryElement,
  CardCvcElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, AlertTriangle, LogIn } from 'lucide-react';
import { removeFromCart, updateCartItem } from '../api/cartApi';
import {
  isLoggedIn, getGuestCart,
  removeFromGuestCart, updateGuestCartItem,
} from '../utils/guestCartUtils';
import { useContent } from '../context/ContentContext';
import '../style_localisés/Panier.css';

const BASE_URL   = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
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
    base: { fontSize: '16px', color: '#1e2328', fontFamily: 'Segoe UI, sans-serif', '::placeholder': { color: '#aaa' } },
    invalid: { color: '#e74c3c' },
  },
};

function StripeForm({ total, onSuccess, onError }) {
  const { t } = useTranslation();
  const { contents } = useContent();
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
        body: JSON.stringify({ amount: Math.round(total * 100), currency: 'eur', email: localStorage.getItem('userEmail') }),
      });
      const { clientSecret } = await res.json();
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement), billing_details: { name: nom, email: localStorage.getItem('userEmail') } },
      });
      if (error) { setErreur(error.message); onError(error.message); }
      else if (paymentIntent.status === 'succeeded') onSuccess('stripe');
    } catch (err) {
      const msg = contents.err_stripe_conn || t('cart.err_stripe_conn');
      setErreur(msg); onError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={payer} className="stripe-form">
      <p className="stripe-label">{contents.stripe_title || t('cart.stripe_title')}</p>
      <div className="stripe-field-group">
        <label className="stripe-field-label">{contents.name_on_card || t('cart.name_on_card')}</label>
        <input type="text" className="stripe-input-text" placeholder="Jean Dupont" value={nom} onChange={e => setNom(e.target.value)} required />
      </div>
      <div className="stripe-field-group">
        <label className="stripe-field-label">{contents.card_number || t('cart.card_number')}</label>
        <div className="card-element-wrapper"><CardNumberElement options={STRIPE_STYLE} /></div>
      </div>
      <div className="stripe-row">
        <div className="stripe-field-group">
          <label className="stripe-field-label">{contents.expiry_date || t('cart.expiry_date')}</label>
          <div className="card-element-wrapper"><CardExpiryElement options={STRIPE_STYLE} /></div>
        </div>
        <div className="stripe-field-group">
          <label className="stripe-field-label">{contents.cvc || t('cart.cvc')}</label>
          <div className="card-element-wrapper"><CardCvcElement options={STRIPE_STYLE} /></div>
        </div>
      </div>
      {erreur && <p className="stripe-error">{erreur}</p>}
      <button type="submit" className="btn-payer-carte" disabled={!stripe || loading}>
        {loading ? t('cart.processing') : `${contents.btn_payer || t('cart.pay')} ${total.toFixed(2)} EUR`}
      </button>
    </form>
  );
}

function SecuriteBadges() {
  const { t } = useTranslation();
  const { contents } = useContent();
  return (
    <div className="securite-bandeau">
      <p className="securite-titre">{contents.secure_infra || t('cart.secure_100')}</p>
      <div className="securite-logos">
        <div className="badge-item"><span className="badge-icon">SSL</span><span className="badge-text">{contents.badge_ssl || t('cart.badge_ssl')}</span></div>
        <div className="badge-item badge-highlight"><span className="badge-icon">3DS</span><span className="badge-text">{contents.badge_3ds || t('cart.badge_3ds')}</span></div>
        <div className="badge-item badge-visa"><span className="visa-text">VISA</span></div>
        <div className="badge-item badge-paypal-logo"><span className="paypal-logo-text">PayPal</span></div>
        <div className="badge-item badge-stripe"><span className="stripe-logo-text">stripe</span></div>
      </div>
    </div>
  );
}

function LoginNudge({ onLoginRedirect }) {
  const { t } = useTranslation();
  const { contents } = useContent();
  return (
    <div className="login-nudge-box">
      <LogIn size={22} className="login-nudge-icon" />
      <div className="login-nudge-content">
        <p className="login-nudge-title">
          {contents.login_nudge_title || t('cart.login_required_title')}
        </p>
        <p className="login-nudge-msg">
          {contents.login_nudge_msg || t('cart.login_required_msg')}
        </p>
        <button className="btn-login-nudge" onClick={onLoginRedirect}>
          {contents.btn_login || t('cart.btn_login')}
        </button>
      </div>
    </div>
  );
}

function Panier({ panier: panierServeur = [], rafraichirPanier, onLoginRedirect }) {
  const { t } = useTranslation();
  const { contents } = useContent();
  const connecte = isLoggedIn();

  const [panierInvite, setPanierInvite] = useState(() => connecte ? [] : getGuestCart());

  useEffect(() => {
    if (connecte) return;
    const sync = () => setPanierInvite(getGuestCart());
    window.addEventListener('guestCartUpdated', sync);
    return () => window.removeEventListener('guestCartUpdated', sync);
  }, [connecte]);

  const panier = connecte ? panierServeur : panierInvite;

  const [modePaiement, setModePaiement] = useState(null);
  const [paiementReussi, setPaiementReussi] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState('');
  const [showLoginNudge, setShowLoginNudge] = useState(false);

  const total = panier.reduce((acc, item) => {
    let prixUnitaire = item.price;
    if (item.subscriptionDuration === 'mensuel') {
      prixUnitaire = (item.price / 0.85) / 12;
    }
    return acc + (prixUnitaire * item.quantity);
  }, 0);

  const indisponibles = panier.filter(item => item.isAvailable === false);
  const peutPayer = connecte && panier.length > 0 && indisponibles.length === 0;

  const gererSuppression = async (id) => {
    if (connecte) {
      try {
        await removeFromCart(id);
        await rafraichirPanier();
      } catch {
        alert(t('cart.err_delete'));
      }
    } else {
      setPanierInvite(removeFromGuestCart(id));
    }
  };

  const gererQuantite = async (id, qte, delta) => {
    const nouvelleQte = qte + delta;
    if (nouvelleQte < 1) { await gererSuppression(id); return; }
    if (connecte) {
      try {
        await updateCartItem(id, { quantity: nouvelleQte });
        await rafraichirPanier();
      } catch {
        alert(t('cart.err_update'));
      }
    } else {
      setPanierInvite(updateGuestCartItem(id, { quantity: nouvelleQte }));
    }
  };

  const gererDuree = async (id, nouvelleDuree) => {
    if (connecte) {
      try {
        await updateCartItem(id, { subscriptionDuration: nouvelleDuree });
        await rafraichirPanier();
      } catch {
        alert(t('cart.err_duration'));
      }
    } else {
      setPanierInvite(updateGuestCartItem(id, { subscriptionDuration: nouvelleDuree }));
    }
  };

  const handlePaiementClick = (mode) => {
    if (!connecte) { setShowLoginNudge(true); return; }
    if (!peutPayer) return;
    setModePaiement(mode);
  };

  const onSuccess = async (methode) => {
    try {
      await fetch(`${BASE_URL}/api/profil/commandes/creer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: localStorage.getItem('userEmail'), paymentMethod: methode, billingAddress: 'Adresse de facturation par défaut' }),
      });
    } catch (e) { console.error('Erreur sauvegarde commande', e); }
    setPaiementReussi(true);
    setModePaiement(null);
    if (connecte) await rafraichirPanier();
  };

  if (paiementReussi) {
    return (
      <div className="panier-container">
        <div className="paiement-confirme">
          <div className="confirme-icon"><ShieldCheck size={64} color="#2ecc71" /></div>
          <h2>{contents.success_title || t('cart.success_title')}</h2>
          <p>{contents.success_msg || t('cart.success_msg')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panier-container">
      <h2>{contents.panier_titre || t('cart.title')}</h2>

      {!connecte && panier.length > 0 && (
        <p className="guest-notice">
          {contents.guest_notice || t('cart.guest_notice')}
        </p>
      )}

      {panier.length === 0 ? (
        <p className="panier-vide">{contents.panier_vide || t('cart.empty')}</p>
      ) : (
        <>
          <div className="panier-items">
            {panier.map(item => {
              const estIndisponible = item.isAvailable === false;
              let prixUnitaire = item.price;
              if (item.subscriptionDuration === 'mensuel') {
                prixUnitaire = (item.price / 0.85) / 12;
              }

              return (
                <div key={item.id} className={`item-row ${estIndisponible ? 'item-indisponible' : ''}`}>
                  <img src={item.image} alt={item.name} className="item-img" />
                  <div className="item-details">
                    <p className="item-title">
                      <strong>{item.name}</strong>
                      {estIndisponible && <span className="badge-indisponible">{contents.txt_indisponible || t('cart.unavailable')}</span>}
                    </p>
                    {!estIndisponible && (
                      <div className="subscription-choice">
                        <label>{contents.txt_periode || t('cart.period')}</label>
                        <select value={item.subscriptionDuration || 'mensuel'} onChange={e => gererDuree(item.id, e.target.value)} className="duration-select">
                          <option value="mensuel">{t('cart.monthly')}</option>
                          <option value="annuel">{t('cart.yearly')}</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    {!estIndisponible && (
                      <div className="quantity-controls">
                        <label>{contents.txt_licences || t('cart.licences')}</label>
                        <button className="btn-quantite" onClick={() => gererQuantite(item.id, item.quantity, -1)}>-</button>
                        <span className="qte-text">{item.quantity}</span>
                        <button className="btn-quantite" onClick={() => gererQuantite(item.id, item.quantity, 1)}>+</button>
                      </div>
                    )}
                    <p className="item-price">{(prixUnitaire * item.quantity).toFixed(2)} EUR</p>
                    <button className="btn-supprimer" onClick={() => gererSuppression(item.id)}>X</button>
                  </div>
                </div>
              );
            })}
            <hr className="divider" />
            <h3 className="total-text">{contents.txt_total || t('cart.total')} {total.toFixed(2)} EUR</h3>
          </div>

          {indisponibles.length > 0 && (
            <div className="warning-bloque">
              <AlertTriangle size={20} className="warning-bloque-icon" />
              <div className="warning-bloque-content">
                <p className="warning-bloque-title">{contents.error_bloque_titre || t('cart.error_blocked_title')}</p>
                <p className="warning-bloque-msg">{contents.error_bloque_msg || t('cart.error_blocked_msg')}</p>
              </div>
            </div>
          )}

          <div className="paiement-section">
            <h3>{contents.paiement_titre || t('cart.payment_secure')}</h3>
            {erreurPaiement && <div className="error-box">{erreurPaiement}</div>}
            {showLoginNudge && !connecte && <LoginNudge onLoginRedirect={onLoginRedirect} />}

            {!modePaiement && (
              <div className="paiement-boutons">
                <button className="btn-mastercard" onClick={() => handlePaiementClick('carte')} disabled={connecte && !peutPayer}>
                  {contents.btn_carte || t('cart.btn_card')}
                </button>
                <button className="btn-paypal" onClick={() => handlePaiementClick('paypal')} disabled={connecte && !peutPayer}>
                  {contents.btn_paypal || t('cart.btn_paypal')}
                </button>
              </div>
            )}

            {(modePaiement === 'carte' || modePaiement === 'paypal') && (
              <div className="paiement-form-wrapper">
                <button className="btn-retour" onClick={() => { setModePaiement(null); setErreurPaiement(''); }}>{contents.btn_retour || t('cart.btn_back')}</button>
                {modePaiement === 'carte' ? (
                  <Elements stripe={stripePromise}><StripeForm total={total} onSuccess={onSuccess} onError={setErreurPaiement} /></Elements>
                ) : (
                  <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'EUR' }}>
                    <PayPalButtons
                      createOrder={async () => {
                        const res = await fetch(`${BASE_URL}/api/paiement/paypal/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: total.toFixed(2), email: localStorage.getItem('userEmail') }) });
                        const { orderID } = await res.json(); return orderID;
                      }}
                      onApprove={async (data) => {
                        const res = await fetch(`${BASE_URL}/api/paiement/paypal/capture`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderID: data.orderID }) });
                        const result = await res.json();
                        if (result.status === 'COMPLETED') onSuccess('paypal');
                      }}
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