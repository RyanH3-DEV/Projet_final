import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User, Shield, Heart, Settings, Trash2,
  ShoppingCart, Eye, MapPin, Plus, Loader2,
  CheckCircle, XCircle, FileText
} from 'lucide-react';
import { removeFromCart } from '../api/cartApi';
import '../style_localisés/MonProfil.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API = `${BASE_URL}/api/profil`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 1 — Historique des Souscriptions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Historique({ email }) {
  const { t } = useTranslation();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [ouvert, setOuvert]       = useState(null);

  useEffect(() => {
    fetch(`${API}/commandes?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => setCommandes(d.orders || []))
      .catch(() => setCommandes([]))
      .finally(() => setLoading(false));
  }, [email]);

  // ── Logique de téléchargement de la facture
  const telechargerFacture = (orderId) => {
    // Je construis l'URL avec l'ID de la commande et l'email pour la vérification de sécurité
    const url = `${BASE_URL}/api/profil/commandes/${orderId}/facture?email=${encodeURIComponent(email)}`;

    // J'ouvre le lien dans un nouvel onglet pour déclencher le téléchargement BinaryFileResponse
    window.open(url, '_blank');
  };

  if (loading) return <div className="profil-loading"><Loader2 className="spinner" /></div>;

  if (commandes.length === 0) return (
    <div className="profil-empty">
      <Shield size={48} opacity={0.2} />
      <p>{t('profil.no_subscriptions', 'Aucune souscription active.')}</p>
    </div>
  );

  return (
    <div className="historique-list">
      {commandes.map(cmd => (
        <div key={cmd.id} className={`commande-card ${ouvert === cmd.id ? 'active' : ''}`}>
          <div className="commande-header" onClick={() => setOuvert(ouvert === cmd.id ? null : cmd.id)}>
            <div className="commande-meta">
              <span className="commande-id">Ref: #CYN-{cmd.id}</span>
              <span className="commande-date">{cmd.date}</span>
            </div>
            <div className="commande-right">
              <span className={`commande-status status-${cmd.status}`}>
                {cmd.status === 'completed' ? '● Actif' : '● ' + cmd.status}
              </span>
              <span className="commande-total">{Number(cmd.total).toFixed(2)} €</span>
              <Eye size={18} />
            </div>
          </div>

          {ouvert === cmd.id && (
            <div className="commande-details-expand">
              <div className="billing-info-mini">
                <strong>Facturé à :</strong> {cmd.billingAddress}
              </div>
              {cmd.items.map((item, i) => (
                <div key={i} className="commande-item-row">
                  <div className="item-name-group">
                    <Shield size={16} className="item-icon" />
                    <div>
                      <p className="commande-item-title">{item.serviceName}</p>
                      <p className="commande-item-sub">Engagement : {item.subscriptionDuration}</p>
                    </div>
                  </div>
                  <div className="item-qty-price">
                    <span>{item.quantity} licences</span>
                    <strong>{(Number(item.price) * item.quantity).toFixed(2)} €</strong>
                  </div>
                </div>
              ))}

              <div className="commande-actions-footer">
                {/* J'affiche le bouton seulement si un chemin de facture existe en base */}
                {cmd.invoicePath ? (
                  <button
                    className="btn-invoice"
                    onClick={() => telechargerFacture(cmd.id)}
                  >
                    <FileText size={16} /> {t('profil.download_invoice', 'Télécharger la facture PDF')}
                  </button>
                ) : (
                  <span className="invoice-pending">Génération du PDF en cours...</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 2 — Carnet d'Adresses (NOUVEAU)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CarnetAdresses({ email }) {
  const { t } = useTranslation();
  const [adresses, setAdresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAddr, setNewAddr] = useState({
    prenom: '', nom: '', adresse1: '', ville: '', codePostal: '', pays: 'France', telephone: ''
  });

  const fetchAdresses = () => {
    setLoading(true);
    fetch(`${API}/adresses?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => setAdresses(d.adresses || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchAdresses(), [email]);

  const ajouter = async (e) => {
    e.preventDefault();
    await fetch(`${API}/adresses/ajouter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAddr, email })
    });
    setShowAdd(false);
    fetchAdresses();
  };

  const supprimer = async (id) => {
    await fetch(`${API}/adresses/supprimer/${id}?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    fetchAdresses();
  };

  if (loading) return <div className="profil-loading"><Loader2 className="spinner" /></div>;

  return (
    <div className="adresses-container">
      <button className="btn-add-address" onClick={() => setShowAdd(!showAdd)}>
        <Plus size={18} /> {t('profil.add_address', 'Ajouter une adresse de facturation')}
      </button>

      {showAdd && (
        <form onSubmit={ajouter} className="address-form-popup">
          <div className="form-grid">
            <input type="text" placeholder="Prénom" onChange={e => setNewAddr({...newAddr, prenom: e.target.value})} required />
            <input type="text" placeholder="Nom" onChange={e => setNewAddr({...newAddr, nom: e.target.value})} required />
            <input type="text" placeholder="Adresse" className="full-width" onChange={e => setNewAddr({...newAddr, adresse1: e.target.value})} required />
            <input type="text" placeholder="Code Postal" onChange={e => setNewAddr({...newAddr, codePostal: e.target.value})} required />
            <input type="text" placeholder="Ville" onChange={e => setNewAddr({...newAddr, ville: e.target.value})} required />
            <input type="text" placeholder="Téléphone" className="full-width" onChange={e => setNewAddr({...newAddr, telephone: e.target.value})} />
          </div>
          <button type="submit" className="btn-save-address">Enregistrer</button>
        </form>
      )}

      <div className="address-grid">
        {adresses.map(addr => (
          <div key={addr.id} className="address-card">
            <div className="address-content">
              <strong>{addr.prenom} {addr.nom}</strong>
              <p>{addr.adresse1}</p>
              <p>{addr.codePostal} {addr.ville}</p>
              <p className="addr-country">{addr.pays}</p>
            </div>
            <button className="btn-delete-addr" onClick={() => supprimer(addr.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 3 — Services Favoris (Wishlist)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function WishlistTab({ email, ajouterAuPanier, wishlist, rafraichirWishlist }) {
  const { t } = useTranslation();
  const items = wishlist || [];

  const supprimer = async (id) => {
    await fetch(`${API}/wishlist/remove/${id}?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    if (rafraichirWishlist) rafraichirWishlist(email);
  };

  if (items.length === 0) return (
    <div className="profil-empty">
      <Heart size={48} opacity={0.2} />
      <p>{t('profil.wishlist_empty', 'Votre liste de veille est vide.')}</p>
    </div>
  );

  return (
    <div className="wishlist-grid">
      {items.map(item => (
        <div key={item.id} className="wishlist-card">
          <img src={item.image} alt={item.name} className="wishlist-img" />
          <div className="wishlist-info">
            <p className="wishlist-title">{item.name}</p>
            <p className="wishlist-price">{Number(item.price).toFixed(2)} €/mois</p>
          </div>
          <div className="wishlist-actions">
            <button className="btn-wishlist-cart" onClick={() => ajouterAuPanier(item)}>
              <ShoppingCart size={16} />
            </button>
            <button className="btn-wishlist-remove" onClick={() => supprimer(item.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 4 — Paramètres du Compte
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function InfosPersonnelles({ user, setUser }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ prenom: user.prenom || '', nom: user.nom || '', avatar: user.avatar || 'default' });
  const [mdp, setMdp] = useState({ current: '', new: '', confirm: '' });
  const [notif, setNotif] = useState({ msg: '', type: '' });
  const [loading, setLoading] = useState(false);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setNotif({ msg: '', type: '' });

    if (mdp.new && mdp.new !== mdp.confirm) {
      setNotif({ msg: 'Les mots de passe ne correspondent pas.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/modifier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          prenom: form.prenom,
          nom: form.nom,
          avatar: form.avatar,
          currentPassword: mdp.current || undefined,
          newPassword: mdp.new || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotif({ msg: 'Profil mis à jour avec succès.', type: 'success' });
        setUser({ ...user, ...data.user });
        setMdp({ current: '', new: '', confirm: '' });
      } else {
        setNotif({ msg: data.message, type: 'error' });
      }
    } catch {
      setNotif({ msg: 'Erreur serveur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sauvegarder} className="infos-form">
      {notif.msg && (
        <div className={`profil-notification ${notif.type}`}>
          {notif.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {notif.msg}
        </div>
      )}

      <div className="infos-section">
        <h4>Identité du collaborateur</h4>
        <div className="infos-row">
          <div className="infos-field">
            <label>Prénom</label>
            <input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div className="infos-field">
            <label>Nom</label>
            <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="infos-section">
        <h4>Sécurité</h4>
        <div className="infos-field">
          <label>Mot de passe actuel</label>
          <input type="password" value={mdp.current} onChange={e => setMdp({ ...mdp, current: e.target.value })} placeholder="Requis pour tout changement" />
        </div>
        <div className="infos-row">
          <div className="infos-field">
            <label>Nouveau mot de passe</label>
            <input type="password" value={mdp.new} onChange={e => setMdp({ ...mdp, new: e.target.value })} />
          </div>
          <div className="infos-field">
            <label>Confirmation</label>
            <input type="password" value={mdp.confirm} onChange={e => setMdp({ ...mdp, confirm: e.target.value })} />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-sauvegarder" disabled={loading}>
        {loading ? <Loader2 className="spinner" size={18} /> : 'Appliquer les modifications'}
      </button>
    </form>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOSANT PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MonProfil({ user, setUser, ajouterAuPanier, wishlist = [], rafraichirWishlist }) {
  const { t } = useTranslation();
  const [onglet, setOnglet] = useState('historique');

  const tabs = [
    { id: 'historique', label: 'Souscriptions', icon: <Shield size={18} /> },
    { id: 'adresses',   label: 'Facturation',    icon: <MapPin size={18} /> },
    { id: 'wishlist',   label: 'Veille technique', icon: <Heart size={18} /> },
    { id: 'infos',      label: 'Paramètres',     icon: <Settings size={18} /> },
  ];

  return (
    <div className="profil-container">
      <div className="profil-hero">
        <div className="profil-avatar-container">
          <div className="avatar-placeholder">
            {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
          </div>
        </div>
        <div className="profil-hero-info">
          <h2>{user.prenom} {user.nom}</h2>
          <span className="user-role-badge">Client Certifié Cyna</span>
          <p className="user-email-text">{user.email}</p>
        </div>
      </div>

      <div className="profil-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profil-tab ${onglet === tab.id ? 'active' : ''}`}
            onClick={() => setOnglet(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="profil-content">
        {onglet === 'historique' && <Historique email={user.email} />}
        {onglet === 'adresses'   && <CarnetAdresses email={user.email} />}
        {onglet === 'wishlist'   && <WishlistTab email={user.email} ajouterAuPanier={ajouterAuPanier} wishlist={wishlist} rafraichirWishlist={rafraichirWishlist} />}
        {onglet === 'infos'      && <InfosPersonnelles user={user} setUser={setUser} />}
      </div>
    </div>
  );
}

export default MonProfil;