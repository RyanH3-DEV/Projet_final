import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import {
  Elements, CardNumberElement, CardExpiryElement,
  CardCvcElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { removeFromCart, updateCartItem } from '../api/cartApi';
import {
  isLoggedIn, getGuestCart,
  removeFromGuestCart, updateGuestCartItem,
} from '../utils/guestCartUtils';
import { useContent } from '../context/ContentContext';
import { useCart } from '../context/CartContext';
import '../Style_localisés/Panier.css';

const BASE_URL   = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const IS_SANDBOX = import.meta.env.VITE_PAYMENT_ENV !== 'production';
const MAX_QUANTITE = 50;

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

function StripeForm({ total, connecte, emailInvite, setEmailInvite, onSuccess, onError }) {
  const { t } = useTranslation();
  const { contents } = useContent();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [nom, setNom] = useState('');

  const emailPourPaiement = connecte ? (localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')) : emailInvite;

  const payer = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!connecte && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInvite || '')) {
      setErreur(t('cart.err_email_required', 'Veuillez saisir une adresse e-mail valide.'));
      return;
    }

    setLoading(true);
    setErreur('');
    try {
      const res = await fetch(`${BASE_URL}/api/paiement/stripe/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: 'eur', email: emailPourPaiement }),
      });
      const { clientSecret } = await res.json();
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement), billing_details: { name: nom, email: emailPourPaiement } },
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

      {!connecte && (
        <div className="stripe-field-group">
          <label className="stripe-field-label" htmlFor="email-invite">
            {t('cart.email_for_order', 'E-mail pour recevoir votre confirmation')}
          </label>
          <input
            id="email-invite"
            type="email"
            className="stripe-input-text"
            placeholder="vous@exemple.fr"
            value={emailInvite}
            onChange={e => setEmailInvite(e.target.value)}
            required
          />
        </div>
      )}

      <div className="stripe-field-group">
        <label className="stripe-field-label" htmlFor="nom-carte">{contents.name_on_card || t('cart.name_on_card')}</label>
        <input id="nom-carte" type="text" className="stripe-input-text" placeholder="Jean Dupont" value={nom} onChange={e => setNom(e.target.value)} required />
      </div>
      <div className="stripe-field-group">
        <label className="stripe-field-label" htmlFor="numero-carte">{contents.card_number || t('cart.card_number')}</label>
        <div className="card-element-wrapper"><CardNumberElement id="numero-carte" options={STRIPE_STYLE} /></div>
      </div>
      <div className="stripe-row">
        <div className="stripe-field-group">
          <label className="stripe-field-label" htmlFor="expiration-carte">{contents.expiry_date || t('cart.expiry_date')}</label>
          <div className="card-element-wrapper"><CardExpiryElement id="expiration-carte" options={STRIPE_STYLE} /></div>
        </div>
        <div className="stripe-field-group">
          <label className="stripe-field-label" htmlFor="cvc-carte">{contents.cvc || t('cart.cvc')}</label>
          <div className="card-element-wrapper"><CardCvcElement id="cvc-carte" options={STRIPE_STYLE} /></div>
        </div>
      </div>
      {erreur && <p className="stripe-error" role="alert">{erreur}</p>}
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

function Panier({ panier: panierServeur = [], rafraichirPanier, onLoginRedirect }) {
  const { t } = useTranslation();
  const { contents } = useContent();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const connecte = isLoggedIn();

  const [panierInvite, setPanierInvite] = useState(() => connecte ? [] : getGuestCart());
  const [emailInvite, setEmailInvite] = useState('');
  const [quantiteEnCours, setQuantiteEnCours] = useState(null);

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
  const [derniereCommande, setDerniereCommande] = useState(null);

  const total = panier.reduce((acc, item) => {
    let prixUnitaire = item.price;
    if (item.subscriptionDuration === 'mensuel') {
      prixUnitaire = (item.price / 0.85) / 12;
    }
    return acc + (prixUnitaire * item.quantity);
  }, 0);

  const indisponibles = panier.filter(item => item.isAvailable === false);
  const peutPayer = panier.length > 0 && indisponibles.length === 0;

  const gererSuppression = async (id) => {
    if (connecte) {
      try {
        await removeFromCart(id);
        await rafraichirPanier();
        await refreshCart();
      } catch {
        alert(t('cart.err_delete'));
      }
    } else {
      setPanierInvite(removeFromGuestCart(id));
    }
  };

  const gererQuantite = async (id, qte, delta) => {
    if (quantiteEnCours === id) return;

    const nouvelleQte = qte + delta;
    if (nouvelleQte < 1) { await gererSuppression(id); return; }
    if (nouvelleQte > MAX_QUANTITE) return;

    if (connecte) {
      setQuantiteEnCours(id);
      try {
        await updateCartItem(id, { quantity: nouvelleQte });
        await rafraichirPanier();
        await refreshCart();
      } catch {
        alert(t('cart.err_update'));
      } finally {
        setQuantiteEnCours(null);
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
    if (!peutPayer) return;
    setModePaiement(mode);
  };

  const onSuccess = async (methode) => {
    const panierAvantVidage = [...panier];
    const totalAvantVidage = total;
    const methodeLabel = methode === 'paypal' ? 'PayPal' : 'Carte bancaire';
    const emailCommande = connecte ? (localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')) : emailInvite;

    try {
      const res = await fetch(`${BASE_URL}/api/profil/commandes/creer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailCommande,
          paymentMethod: methode,
          billingAddress: 'Adresse de facturation par défaut',
          cart: panierAvantVidage.map(item => ({
            id: item.id,
            quantity: item.quantity,
            subscriptionDuration: item.subscriptionDuration || 'mensuel',
          })),
        }),
      });
      const data = await res.json();
      setDerniereCommande({
        orderId: data.orderId,
        items: panierAvantVidage,
        total: totalAvantVidage,
        methode: methodeLabel,
      });
    } catch (e) {
      console.error('Erreur sauvegarde commande', e);
    }
    setPaiementReussi(true);
    setModePaiement(null);
    if (connecte) {
      await rafraichirPanier();
      await refreshCart();
    } else {
      setPanierInvite(getGuestCart());
    }
  };

  if (paiementReussi) {
    return (
      <div className="panier-container">
        <div className="paiement-confirme" role="status">
          <div className="confirme-icon"><ShieldCheck size={64} color="#2ecc71" aria-hidden="true" /></div>
          <h2>{contents.success_title || t('cart.success_title')}</h2>
          <p>{contents.success_msg || t('cart.success_msg')}</p>

          {derniereCommande && (
            <div className="confirmation-recap">
              <p className="confirmation-order-id">
                {contents.order_ref || t('cart.order_ref')} <strong>#{derniereCommande.orderId}</strong>
              </p>

              <div className="confirmation-items">
                {derniereCommande.items.map((item) => (
                  <div key={item.id} className="confirmation-item-row">
                    <span>{item.name}</span>
                    <span>{item.quantity} × {item.subscriptionDuration}</span>
                  </div>
                ))}
              </div>

              <div className="confirmation-total">
                <span>{contents.txt_total || t('cart.total')}</span>
                <strong>{derniereCommande.total.toFixed(2)} EUR</strong>
              </div>

              <p className="confirmation-payment-method">
                {contents.paid_via || t('cart.paid_via')} {derniereCommande.methode}
              </p>
            </div>
          )}

          {connecte ? (
            <button className="btn-voir-souscriptions" onClick={() => navigate('/profil')}>
              {contents.btn_view_subscriptions || t('cart.view_subscriptions')}
            </button>
          ) : (
            <button className="btn-voir-souscriptions" onClick={() => navigate('/')}>
              {t('cart.back_home', "Retour à l'accueil")}
            </button>
          )}
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
                  <img src={item.image} alt={`Visuel du service ${item.name}`} className="item-img" />
                  <div className="item-details">
                    <p className="item-title">
                      <strong>{item.name}</strong>
                      {estIndisponible && <span className="badge-indisponible">{contents.txt_indisponible || t('cart.unavailable')}</span>}
                    </p>
                    {!estIndisponible && (
                      <div className="subscription-choice">
                        <label htmlFor={`duree-${item.id}`}>{contents.txt_periode || t('cart.period')}</label>
                        <select
                          id={`duree-${item.id}`}
                          value={item.subscriptionDuration || 'mensuel'}
                          onChange={e => gererDuree(item.id, e.target.value)}
                          className="duration-select"
                          aria-label={`Choisir la période d'abonnement pour ${item.name}`}
                        >
                          <option value="mensuel">{t('cart.monthly')}</option>
                          <option value="annuel">{t('cart.yearly')}</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    {!estIndisponible && (
                      <div className="quantity-controls">
                        <label id={`qte-label-${item.id}`}>{contents.txt_licences || t('cart.licences')}</label>
                        <button
                          className="btn-quantite"
                          onClick={() => gererQuantite(item.id, item.quantity, -1)}
                          disabled={quantiteEnCours === item.id}
                          aria-label={item.quantity === 1 ? `Supprimer ${item.name} du panier` : `Diminuer la quantité de ${item.name}`}
                        >
                          -
                        </button>
                        <span className="qte-text" aria-live="polite" aria-labelledby={`qte-label-${item.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn-quantite"
                          onClick={() => gererQuantite(item.id, item.quantity, 1)}
                          disabled={quantiteEnCours === item.id || item.quantity >= MAX_QUANTITE}
                          aria-label={`Augmenter la quantité de ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                    <p className="item-price">{(prixUnitaire * item.quantity).toFixed(2)} EUR</p>
                    <button
                      className="btn-supprimer"
                      onClick={() => gererSuppression(item.id)}
                      aria-label={`Supprimer ${item.name} du panier`}
                    >
                      X
                    </button>
                  </div>
                </div>
              );
            })}
            <hr className="divider" />
            <h3 className="total-text">{contents.txt_total || t('cart.total')} {total.toFixed(2)} EUR</h3>
          </div>

          {indisponibles.length > 0 && (
            <div className="warning-bloque" role="alert">
              <AlertTriangle size={20} className="warning-bloque-icon" aria-hidden="true" />
              <div className="warning-bloque-content">
                <p className="warning-bloque-title">{contents.error_bloque_titre || t('cart.error_blocked_title')}</p>
                <p className="warning-bloque-msg">{contents.error_bloque_msg || t('cart.error_blocked_msg')}</p>
              </div>
            </div>
          )}

          <div className="paiement-section">
            <h3>{contents.paiement_titre || t('cart.payment_secure')}</h3>
            {erreurPaiement && <div className="error-box" role="alert">{erreurPaiement}</div>}

            {!modePaiement && (
              <div className="paiement-boutons">
                <button
                  className="btn-mastercard"
                  onClick={() => handlePaiementClick('carte')}
                  disabled={!peutPayer}
                  aria-label="Payer par carte bancaire"
                >
                  {contents.btn_carte || t('cart.btn_card')}
                </button>
                <button
                  className="btn-paypal"
                  onClick={() => handlePaiementClick('paypal')}
                  disabled={!peutPayer}
                  aria-label="Payer avec PayPal"
                >
                  {contents.btn_paypal || t('cart.btn_paypal')}
                </button>
              </div>
            )}

            {(modePaiement === 'carte' || modePaiement === 'paypal') && (
              <div className="paiement-form-wrapper">
                <button
                  className="btn-retour"
                  onClick={() => { setModePaiement(null); setErreurPaiement(''); }}
                  aria-label="Retour au choix du moyen de paiement"
                >
                  {contents.btn_retour || t('cart.btn_back')}
                </button>

                {!connecte && modePaiement === 'paypal' && (
                  <div className="stripe-field-group" style={{ marginBottom: '16px' }}>
                    <label className="stripe-field-label" htmlFor="email-invite-paypal">
                      {t('cart.email_for_order', 'E-mail pour recevoir votre confirmation')}
                    </label>
                    <input
                      id="email-invite-paypal"
                      type="email"
                      className="stripe-input-text"
                      placeholder="vous@exemple.fr"
                      value={emailInvite}
                      onChange={e => setEmailInvite(e.target.value)}
                      required
                    />
                  </div>
                )}

                {modePaiement === 'carte' ? (
                  <Elements stripe={stripePromise}>
                    <StripeForm
                      total={total}
                      connecte={connecte}
                      emailInvite={emailInvite}
                      setEmailInvite={setEmailInvite}
                      onSuccess={onSuccess}
                      onError={setErreurPaiement}
                    />
                  </Elements>
                ) : (
                  <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'EUR' }}>
                    <PayPalButtons
                      createOrder={async () => {
                        const emailPourPaiement = connecte ? (localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')) : emailInvite;
                        const res = await fetch(`${BASE_URL}/api/paiement/paypal/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: total.toFixed(2), email: emailPourPaiement }) });
                        const { orderID } = await res.json(); return orderID;
                      }}
                      onApprove={async (data) => {
                        if (!connecte && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInvite || '')) {
                          setErreurPaiement(t('cart.err_email_required', 'Veuillez saisir une adresse e-mail valide.'));
                          return;
                        }
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