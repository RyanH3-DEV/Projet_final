import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User, Shield, Heart, Settings, Trash2,
  ShoppingCart, Eye, MapPin, Plus, Loader2,
  CheckCircle, XCircle, FileText, Star
} from 'lucide-react';
import '../style_localisés/MonProfil.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API = `${BASE_URL}/api/profil`;

function Abonnements({ email }) {
  const { t } = useTranslation();
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annulationEnCours, setAnnulationEnCours] = useState(null);

  const fetchAbonnements = () => {
    setLoading(true);
    fetch(`${API}/abonnements?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => setAbonnements(d.abonnements || []))
      .catch(() => setAbonnements([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchAbonnements(), [email]);

  const annuler = async (id) => {
    if (!window.confirm(t('profil.confirm_cancel', 'Confirmer l\'annulation de cet abonnement ?'))) return;
    setAnnulationEnCours(id);
    try {
      await fetch(`${API}/abonnements/${id}/annuler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      fetchAbonnements();
    } finally {
      setAnnulationEnCours(null);
    }
  };

  if (loading) return <div className="profil-loading"><Loader2 className="spinner" /></div>;

  if (abonnements.length === 0) {
    return (
      <div className="profil-empty">
        <Shield size={48} opacity={0.2} />
        <p>{t('profil.no_active_subscriptions', 'Aucun abonnement actif pour le moment.')}</p>
      </div>
    );
  }

  return (
    <div className="abonnements-list">
      {abonnements.map(ab => (
        <div key={ab.id} className={`abonnement-card status-${ab.status}`}>
          <div className="abonnement-header">
            <div className="abonnement-info">
              <h4>{ab.serviceName}</h4>
              <p className="abonnement-meta">
                {ab.quantity} {t('profil.licences', 'licence(s)')} · {ab.billingPeriod === 'annuel' ? t('cart.yearly') : t('cart.monthly')}
              </p>
            </div>
            <span className={`abonnement-badge badge-${ab.status}`}>
              {ab.status === 'active' && <CheckCircle size={14} />}
              {ab.status === 'cancelled' && <XCircle size={14} />}
              {ab.status === 'active' ? t('profil.status_active', 'Actif') : t('profil.status_cancelled', 'Annulé')}
            </span>
          </div>

          <div className="abonnement-details">
            <div className="abonnement-detail-item">
              <span className="detail-label">{t('profil.price', 'Prix')}</span>
              <span className="detail-value">{Number(ab.price).toFixed(2)} EUR</span>
            </div>
            <div className="abonnement-detail-item">
              <span className="detail-label">{t('profil.started_at', 'Débuté le')}</span>
              <span className="detail-value">{ab.startsAt}</span>
            </div>
            <div className="abonnement-detail-item">
              <span className="detail-label">
                {ab.autoRenew ? t('profil.renews_at', 'Renouvellement') : t('profil.ends_at', 'Se termine le')}
              </span>
              <span className="detail-value">{ab.endsAt}</span>
            </div>
          </div>

          {ab.status === 'active' && ab.autoRenew && (
            <button
              className="btn-annuler-abonnement"
              onClick={() => annuler(ab.id)}
              disabled={annulationEnCours === ab.id}
            >
              {annulationEnCours === ab.id ? t('profil.cancelling', 'Annulation...') : t('profil.cancel_subscription', 'Annuler l\'abonnement')}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

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

  const telechargerFacture = (orderId) => {
    const url = `${BASE_URL}/api/profil/commandes/${orderId}/facture?email=${encodeURIComponent(email)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="profil-loading"><Loader2 className="spinner" /></div>;

  if (commandes.length === 0) return (
    <div className="profil-empty">
      <Shield size={48} opacity={0.2} />
      <p>{t('profil.no_subscriptions')}</p>
    </div>
  );

  return (
    <div className="historique-list">
      {commandes.map(cmd => (
        <div key={cmd.id} className={`commande-card ${ouvert === cmd.id ? 'active' : ''}`}>
          <div className="commande-header" onClick={() => setOuvert(ouvert === cmd.id ? null : cmd.id)}>
            <div className="commande-meta">
              <span className="commande-id">{t('profil.ref')} #CYN-{cmd.id}</span>
              <span className="commande-date">{cmd.date}</span>
            </div>
            <div className="commande-right">
              <span className={`commande-status status-${cmd.status}`}>
                {cmd.status === 'completed' ? `● ${t('profil.status_active')}` : `● ${cmd.status}`}
              </span>
              <span className="commande-total">{Number(cmd.total).toFixed(2)} €</span>
              <Eye size={18} />
            </div>
          </div>

          {ouvert === cmd.id && (
            <div className="commande-details-expand">
              <div className="billing-info-mini">
                <strong>{t('profil.billed_to')}</strong> {cmd.billingAddress}
              </div>
              {cmd.items.map((item, i) => (
                <div key={i} className="commande-item-row">
                  <div className="item-name-group">
                    <Shield size={16} className="item-icon" />
                    <div>
                      <p className="commande-item-title">{item.serviceName}</p>
                      <p className="commande-item-sub">{t('profil.commitment')} {item.subscriptionDuration}</p>
                    </div>
                  </div>
                  <div className="item-qty-price">
                    <span>{item.quantity} {item.quantity > 1 ? t('profil.license.plural') : t('profil.license.singular')}</span>
                    <strong>{(Number(item.price) * item.quantity).toFixed(2)} €</strong>
                  </div>
                </div>
              ))}

              <div className="commande-actions-footer">
                {cmd.invoicePath ? (
                  <button className="btn-invoice" onClick={() => telechargerFacture(cmd.id)}>
                    <FileText size={16} /> {t('profil.download_invoice')}
                  </button>
                ) : (
                  <span className="invoice-pending">{t('profil.generating_pdf')}</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
        <Plus size={18} /> {t('profil.add_address')}
      </button>

      {showAdd && (
        <form onSubmit={ajouter} className="address-form-popup">
          <div className="form-grid">
            <input type="text" placeholder={t('profil.form.firstname')} onChange={e => setNewAddr({...newAddr, prenom: e.target.value})} required />
            <input type="text" placeholder={t('profil.form.lastname')} onChange={e => setNewAddr({...newAddr, nom: e.target.value})} required />
            <input type="text" placeholder={t('profil.form.address')} className="full-width" onChange={e => setNewAddr({...newAddr, adresse1: e.target.value})} required />
            <input type="text" placeholder={t('profil.form.zip')} onChange={e => setNewAddr({...newAddr, codePostal: e.target.value})} required />
            <input type="text" placeholder={t('profil.form.city')} onChange={e => setNewAddr({...newAddr, ville: e.target.value})} required />
            <input type="text" placeholder={t('profil.form.phone')} className="full-width" onChange={e => setNewAddr({...newAddr, telephone: e.target.value})} />
          </div>
          <button type="submit" className="btn-save-address">{t('profil.form.save')}</button>
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

function FavorisTab({ email, ajouterAuPanier, wishlist, rafraichirWishlist }) {
  const { t } = useTranslation();
  const items = wishlist || [];

  const supprimer = async (id) => {
    await fetch(`${API}/wishlist/remove/${id}?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    if (rafraichirWishlist) rafraichirWishlist(email);
  };

  if (items.length === 0) return (
    <div className="profil-empty">
      <Heart size={48} opacity={0.2} />
      <p>{t('profil.wishlist_empty')}</p>
      <p className="profil-empty-sub">{t('profil.wishlist_empty_sub')}</p>
    </div>
  );

  return (
    <div className="wishlist-grid">
      {items.map(item => (
        <div key={item.id} className="wishlist-card">
          {item.image
            ? <img src={item.image} alt={item.name} className="wishlist-img" />
            : <div className="wishlist-img-placeholder"><Shield size={32} opacity={0.2} /></div>
          }
          <div className="wishlist-info">
            <p className="wishlist-title">{item.name}</p>
            <p className="wishlist-price">{Number(item.price).toFixed(2)} €{t('profil.per_month')}</p>
          </div>
          <div className="wishlist-actions">
            <button
              className="btn-wishlist-cart"
              onClick={() => ajouterAuPanier(item)}
              title={t('profil.add_cart_title')}
            >
              <ShoppingCart size={16} />
            </button>
            <button
              className="btn-wishlist-remove"
              onClick={() => supprimer(item.id)}
              title={t('profil.remove_wishlist_title')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

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
      setNotif({ msg: t('profil.notif_pwd_mismatch'), type: 'error' });
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
        setNotif({ msg: t('profil.notif_success'), type: 'success' });
        setUser({ ...user, ...data.user });
        setMdp({ current: '', new: '', confirm: '' });
      } else {
        setNotif({ msg: data.message, type: 'error' });
      }
    } catch {
      setNotif({ msg: t('profil.notif_server_error'), type: 'error' });
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
        <h4>{t('profil.identity_title')}</h4>
        <div className="infos-row">
          <div className="infos-field">
            <label>{t('profil.form.firstname')}</label>
            <input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div className="infos-field">
            <label>{t('profil.form.lastname')}</label>
            <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="infos-section">
        <h4>{t('profil.security_title')}</h4>
        <div className="infos-field">
          <label>{t('profil.form.current_pwd')}</label>
          <input type="password" value={mdp.current} onChange={e => setMdp({ ...mdp, current: e.target.value })} placeholder={t('profil.form.pwd_required')} />
        </div>
        <div className="infos-row">
          <div className="infos-field">
            <label>{t('profil.form.new_pwd')}</label>
            <input type="password" value={mdp.new} onChange={e => setMdp({ ...mdp, new: e.target.value })} />
          </div>
          <div className="infos-field">
            <label>{t('profil.form.confirm_pwd')}</label>
            <input type="password" value={mdp.confirm} onChange={e => setMdp({ ...mdp, confirm: e.target.value })} />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-sauvegarder" disabled={loading}>
        {loading ? <Loader2 className="spinner" size={18} /> : t('profil.form.apply_changes')}
      </button>
    </form>
  );
}

function MonProfil({ user, setUser, ajouterAuPanier, wishlist = [], rafraichirWishlist }) {
  const { t } = useTranslation();
  const [onglet, setOnglet] = useState('historique');

  const tabs = [
  { id: 'abonnements', label: t('profil.tabs.subscriptions', 'Abonnements'), icon: <Shield size={18} /> },
  { id: 'historique', label: t('profil.tabs.history'),  icon: <Shield size={18} /> },
  { id: 'adresses',   label: t('profil.tabs.billing'),  icon: <MapPin size={18} /> },
  { id: 'favoris',    label: t('profil.tabs.favorites'),icon: <Heart size={18} /> },
  { id: 'infos',      label: t('profil.tabs.settings'), icon: <Settings size={18} /> },
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
          <span className="user-role-badge">
            <Star size={12} /> {t('profil.certified_client')}
          </span>
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
          {onglet === 'abonnements' && <Abonnements email={user.email} />}
          {onglet === 'historique' && <Historique email={user.email} />}
          {onglet === 'adresses'   && <CarnetAdresses email={user.email} />}
          {onglet === 'favoris'    && (
            <FavorisTab
              email={user.email}
              ajouterAuPanier={ajouterAuPanier}
              wishlist={wishlist}
              rafraichirWishlist={rafraichirWishlist}
            />
          )}
          {onglet === 'infos'      && <InfosPersonnelles user={user} setUser={setUser} />}
        </div>
    </div>
  );
}

export default MonProfil;