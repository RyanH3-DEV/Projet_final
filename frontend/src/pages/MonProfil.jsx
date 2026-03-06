import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ShoppingBag, Heart, Settings, Trash2, ShoppingCart, Eye } from 'lucide-react';
import '../style_localisés/MonProfil.css';

const API = 'http://127.0.0.1:8000/api/profil';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 1 — Historique des commandes
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

  if (loading) return <div className="profil-loading">{t('profil.loading', '⏳ Chargement...')}</div>;

  if (commandes.length === 0) return (
    <div className="profil-empty">
      <ShoppingBag size={48} />
      <p>{t('profil.no_orders', 'Aucune commande pour le moment.')}</p>
    </div>
  );

  return (
    <div className="historique-list">
      {commandes.map(cmd => (
        <div key={cmd.id} className="commande-card">
          <div className="commande-header" onClick={() => setOuvert(ouvert === cmd.id ? null : cmd.id)}>
            <div className="commande-meta">
              <span className="commande-id">{t('profil.order_prefix', 'Commande #')}{cmd.id}</span>
              <span className="commande-date">{cmd.date}</span>
            </div>
            <div className="commande-right">
              <span className={`commande-status status-${cmd.status}`}>
                {cmd.status === 'completed' ? t('profil.status_paid', '✅ Payée') : cmd.status}
              </span>
              <span className="commande-total">{Number(cmd.total).toFixed(2)} €</span>
              <Eye size={18} className="commande-eye" />
            </div>
          </div>

          {ouvert === cmd.id && (
            <div className="commande-items">
              {cmd.items.map((item, i) => (
                <div key={i} className="commande-item-row">
                  <img src={item.image} alt={item.title} className="commande-img" />
                  <div className="commande-item-info">
                    <p className="commande-item-title">{item.title}</p>
                    <p className="commande-item-price">{Number(item.price).toFixed(2)} € × {item.quantity}</p>
                  </div>
                  <strong>{(Number(item.price) * item.quantity).toFixed(2)} €</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 2 — Wishlist
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
      <Heart size={48} />
      <p>{t('profil.wishlist_empty', 'Ta wishlist est vide.')}</p>
      <p className="profil-empty-sub">{t('profil.wishlist_empty_sub', 'Ajoute des livres depuis le catalogue !')}</p>
    </div>
  );

  return (
    <div className="wishlist-grid">
      {items.map(item => (
        <div key={item.id} className="wishlist-card">
          <img src={item.image} alt={item.title} className="wishlist-img" />
          <div className="wishlist-info">
            <p className="wishlist-title">{item.title}</p>
            <p className="wishlist-price">{Number(item.price).toFixed(2)} €</p>
          </div>
          <div className="wishlist-actions">
            <button className="btn-wishlist-cart" onClick={() => ajouterAuPanier(item)} title={t('profil.add_to_cart', 'Ajouter au panier')}>
              <ShoppingCart size={16} />
            </button>
            <button className="btn-wishlist-remove" onClick={() => supprimer(item.id)} title={t('profil.remove', 'Retirer')}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONGLET 3 — Informations personnelles
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AVATARS = [
  { id: 'mysterieux',  label: 'Le Mystérieux', imgUrl: '/avatars/Mysterieux.png' },
  { id: 'celebre',     label: 'Le Célèbre',    imgUrl: '/avatars/celebre.png' },
  { id: 'rigoureux',   label: 'Le Rigoureux',  imgUrl: '/avatars/liseur.jpg' },
  { id: 'passionne',   label: 'Le Passionné',  imgUrl: '/avatars/ancien-lecteur.jpg' },
  { id: 'voyageur',    label: 'Le Voyageur',   imgUrl: '/avatars/liseuse.jpg' },
];

function InfosPersonnelles({ user, setUser }) {
  const { t } = useTranslation();
  const [form, setForm]       = useState({ prenom: user.prenom || '', nom: user.nom || '', avatar: user.avatar || '' });
  const [mdp, setMdp]         = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [erreur, setErreur]   = useState('');
  const [loading, setLoading] = useState(false);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setMessage(''); setErreur('');

    if (mdp.new && mdp.new !== mdp.confirm) {
      setErreur(t('profil.err_password_match', 'Les nouveaux mots de passe ne correspondent pas.'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/modifier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:           user.email,
          prenom:          form.prenom,
          nom:             form.nom,
          avatar:          form.avatar,
          currentPassword: mdp.current || undefined,
          newPassword:     mdp.new || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(t('profil.success_update', '✅ Profil mis à jour avec succès !'));
        setUser({ ...user, ...data.user });
        setMdp({ current: '', new: '', confirm: '' });
      } else {
        setErreur(data.message || t('profil.err_update', 'Erreur lors de la mise à jour.'));
      }
    } catch {
      setErreur(t('profil.err_server', 'Impossible de joindre le serveur.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sauvegarder} className="infos-form">

      {message && <div className="profil-success">{message}</div>}
      {erreur  && <div className="profil-error">{erreur}</div>}

      <div className="infos-section">
        <h4>{t('profil.choose_avatar', 'Choisir un avatar')}</h4>
        <div className="avatar-grid-profil">
          {AVATARS.map(av => (
            <div
              key={av.id}
              className={`avatar-item-profil ${form.avatar === av.id ? 'active' : ''}`}
              onClick={() => setForm({ ...form, avatar: av.id })}
            >
              <img src={av.imgUrl} alt={av.label} />
              <span>{t(`profil.avatar_${av.id}`, av.label)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="infos-section">
        <h4>{t('profil.general_infos', 'Informations générales')}</h4>
        <div className="infos-row">
          <div className="infos-field">
            <label>{t('profil.firstname', 'Prénom')}</label>
            <input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div className="infos-field">
            <label>{t('profil.lastname', 'Nom')}</label>
            <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
        </div>
        <div className="infos-field">
          <label>{t('profil.email_fixed', 'Email (non modifiable)')}</label>
          <input type="email" value={user.email} disabled className="infos-disabled" />
        </div>
      </div>

      <div className="infos-section">
        <h4>{t('profil.change_password', 'Changer le mot de passe')} <span className="infos-optional">{t('profil.optional', '(optionnel)')}</span></h4>
        <div className="infos-field">
          <label>{t('profil.current_password', 'Mot de passe actuel')}</label>
          <input type="password" value={mdp.current} onChange={e => setMdp({ ...mdp, current: e.target.value })} placeholder={t('profil.leave_empty', 'Laissez vide pour ne pas changer')} />
        </div>
        <div className="infos-row">
          <div className="infos-field">
            <label>{t('profil.new_password', 'Nouveau mot de passe')}</label>
            <input type="password" value={mdp.new} onChange={e => setMdp({ ...mdp, new: e.target.value })} />
          </div>
          <div className="infos-field">
            <label>{t('profil.confirm_password', 'Confirmation')}</label>
            <input type="password" value={mdp.confirm} onChange={e => setMdp({ ...mdp, confirm: e.target.value })} />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-sauvegarder" disabled={loading}>
        {loading ? t('profil.saving', '⏳ Sauvegarde...') : t('profil.save_btn', '💾 Sauvegarder les modifications')}
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
    { id: 'historique', label: t('profil.tab_history', 'Historique'), icon: <ShoppingBag size={18} /> },
    { id: 'wishlist',   label: t('profil.tab_wishlist', 'Wishlist'),   icon: <Heart size={18} /> },
    { id: 'infos',      label: t('profil.tab_account', 'Mon compte'), icon: <Settings size={18} /> },
  ];

  return (
    <div className="profil-container">

      {/* En-tête profil */}
      <div className="profil-hero">
        <div className="profil-avatar">
          <img
            src={`/avatars/${user.avatar === 'mysterieux' ? 'Mysterieux.png' : user.avatar === 'celebre' ? 'celebre.png' : user.avatar === 'rigoureux' ? 'liseur.jpg' : user.avatar === 'passionne' ? 'ancien-lecteur.jpg' : 'liseuse.jpg'}`}
            alt="Avatar"
            onError={e => { e.target.src = '/avatars/Mysterieux.png'; }}
          />
        </div>
        <div className="profil-hero-info">
          <h2>{user.prenom} {user.nom}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      {/* Onglets */}
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

      {/* Contenu */}
      <div className="profil-content">
        {onglet === 'historique' && <Historique email={user.email} />}
        {onglet === 'wishlist'   && <WishlistTab email={user.email} ajouterAuPanier={ajouterAuPanier} wishlist={wishlist} rafraichirWishlist={rafraichirWishlist} />}
        {onglet === 'infos'      && <InfosPersonnelles user={user} setUser={setUser} />}
      </div>

    </div>
  );
}

export default MonProfil;