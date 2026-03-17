import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Heart, ShieldCheck, ChevronRight, Zap, Lock, Eye, Server } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ── Icône par catégorie
const CATEGORY_ICONS = {
  edr: <ShieldCheck size={20} />,
  xdr: <Eye size={20} />,
  soc: <Server size={20} />,
  tous: <Zap size={20} />,
};

// ── Couleur d'accent par catégorie
const CATEGORY_ACCENT = {
  edr:  '#00e5ff',
  xdr:  '#7c4dff',
  soc:  '#00e676',
  tous: '#ff6d00',
};

const CATEGORIES = {
  tous: { label: 'Toutes les solutions', sub: 'SOC · EDR · XDR' },
  edr:  { label: 'EDR',  sub: 'Endpoint Detection & Response' },
  xdr:  { label: 'XDR',  sub: 'Extended Detection & Response' },
  soc:  { label: 'SOC',  sub: 'Security Operations Center' },
};

// ── Badges de confiance
const TRUST_BADGES = [
  { icon: <Lock size={14} />,       label: 'ISO 27001' },
  { icon: <ShieldCheck size={14} />, label: 'SOC 2 Type II' },
  { icon: <Zap size={14} />,         label: 'Déploiement < 24h' },
  { icon: <Eye size={14} />,         label: 'Monitoring 24/7' },
];

export default function Catalogue({ ajouterAuPanier, ajouterAWishlist }) {
  const { t } = useTranslation();
  const { categorie: catParam } = useParams();
  const navigate = useNavigate();

  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorie, setCategorie]   = useState(
    Object.keys(CATEGORIES).includes(catParam) ? catParam : 'tous'
  );
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [hoveredId, setHoveredId]     = useState(null);
  const [addedId, setAddedId]         = useState(null);

  useEffect(() => {
    const c = Object.keys(CATEGORIES).includes(catParam) ? catParam : 'tous';
    setCategorie(c);
    fetchServices(c, searchTerm);
  }, [catParam]);

  const fetchServices = async (currentCat, currentSearch) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/services`, {
        params: {
          categorie: currentCat !== 'tous' ? currentCat : null,
          search: currentSearch || null,
        },
      });
      setServices(response.data);
    } catch (err) {
      console.error('Erreur catalogue Cyna', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorieChange = (newCat) => {
    navigate(`/catalogue/${newCat}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(categorie, searchTerm);
  };

  const handleAjoutPanier = (service) => {
    if (ajouterAuPanier) {
      ajouterAuPanier({ ...service, subscriptionDuration: 'mensuel' });
      setAddedId(service.id);
      setTimeout(() => setAddedId(null), 1500);
    } else {
      alert("Veuillez vous connecter pour souscrire à un service.");
    }
  };

  const handleWishlist = async (service) => {
    if (!ajouterAWishlist) return;
    const ok = await ajouterAWishlist(service);
    if (ok) setWishlistIds(prev => new Set([...prev, service.id]));
  };

  const accentColor = CATEGORY_ACCENT[categorie] || '#00e5ff';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .cyna-catalogue {
          min-height: 100vh;
          background: #050810;
          color: #e8eaf0;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* ── Hero ── */
        .cat-hero {
          position: relative;
          padding: 72px 48px 56px;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cat-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 10% 50%, rgba(0,229,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 90% 20%, rgba(124,77,255,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .cat-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .cat-hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cat-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent, #00e5ff);
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.2);
          padding: 6px 14px;
          border-radius: 4px;
          margin-bottom: 24px;
        }
        .cat-hero-title {
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }
        .cat-hero-title span {
          color: var(--accent, #00e5ff);
        }
        .cat-hero-sub {
          font-size: 16px;
          color: rgba(232,234,240,0.5);
          font-weight: 300;
          max-width: 560px;
          line-height: 1.6;
          margin: 0 0 40px;
        }

        /* ── Trust badges ── */
        .trust-badges {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(232,234,240,0.6);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 12px;
          border-radius: 6px;
        }
        .trust-badge svg { color: var(--accent, #00e5ff); }

        /* ── Toolbar ── */
        .cat-toolbar {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 48px;
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .cat-search-wrap {
          flex: 1;
          min-width: 260px;
          position: relative;
        }
        .cat-search-wrap svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(232,234,240,0.3);
        }
        .cat-search-input {
          width: 100%;
          padding: 12px 16px 12px 46px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e8eaf0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .cat-search-input::placeholder { color: rgba(232,234,240,0.25); }
        .cat-search-input:focus { border-color: var(--accent, #00e5ff); }

        .cat-filter-btn {
          padding: 12px 20px;
          background: var(--accent, #00e5ff);
          color: #050810;
          border: none;
          border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .cat-filter-btn:hover { opacity: 0.85; }

        /* ── Category tabs ── */
        .cat-tabs {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px 32px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cat-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(232,234,240,0.5);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-tab:hover {
          border-color: rgba(255,255,255,0.2);
          color: #e8eaf0;
        }
        .cat-tab.active {
          background: rgba(0,229,255,0.08);
          border-color: var(--tab-accent, #00e5ff);
          color: var(--tab-accent, #00e5ff);
        }
        .cat-tab-sub {
          font-size: 10px;
          opacity: 0.6;
          font-family: 'JetBrains Mono', monospace;
          display: none;
        }
        @media (min-width: 768px) { .cat-tab-sub { display: block; } }

        /* ── Grid ── */
        .cat-grid-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }
        .cat-count {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: rgba(232,234,240,0.3);
          margin-bottom: 24px;
          letter-spacing: 0.05em;
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        /* ── Service Card ── */
        .svc-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          cursor: default;
        }
        .svc-card:hover {
          border-color: var(--card-accent, #00e5ff);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--card-accent, #00e5ff) inset;
        }
        .svc-card-top {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        }
        .svc-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
          transition: opacity 0.3s, transform 0.3s;
        }
        .svc-card:hover .svc-card-img {
          opacity: 0.8;
          transform: scale(1.04);
        }
        .svc-card-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,229,255,0.05), rgba(124,77,255,0.05));
        }
        .svc-category-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(5,8,16,0.85);
          border: 1px solid var(--card-accent, #00e5ff);
          color: var(--card-accent, #00e5ff);
          backdrop-filter: blur(8px);
        }
        .svc-status-dot {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(5,8,16,0.85);
          backdrop-filter: blur(8px);
        }
        .svc-status-dot.ok {
          color: #00e676;
          border: 1px solid rgba(0,230,118,0.3);
        }
        .svc-status-dot.ko {
          color: #ff5252;
          border: 1px solid rgba(255,82,82,0.3);
        }
        .svc-status-dot::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .svc-card-body {
          padding: 20px 22px 22px;
        }
        .svc-name {
          font-size: 17px;
          font-weight: 600;
          color: #e8eaf0;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .svc-desc {
          font-size: 13px;
          color: rgba(232,234,240,0.45);
          line-height: 1.6;
          margin: 0 0 20px;
          min-height: 42px;
        }
        .svc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .svc-price-block { line-height: 1; }
        .svc-price {
          font-size: 22px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.03em;
        }
        .svc-price-period {
          font-size: 11px;
          color: rgba(232,234,240,0.3);
          font-family: 'JetBrains Mono', monospace;
          margin-top: 2px;
        }
        .svc-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .btn-wishlist {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(232,234,240,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-wishlist:hover, .btn-wishlist.active {
          border-color: #ff6b9d;
          color: #ff6b9d;
          background: rgba(255,107,157,0.08);
        }
        .btn-cart {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          background: var(--card-accent, #00e5ff);
          color: #050810;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-cart:hover { opacity: 0.85; }
        .btn-cart:active { transform: scale(0.97); }
        .btn-cart:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(232,234,240,0.3);
          cursor: not-allowed;
        }
        .btn-cart.added {
          background: #00e676;
        }

        /* ── Loading ── */
        .cat-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 120px 48px;
          color: rgba(232,234,240,0.3);
          font-size: 14px;
        }
        .loading-ring {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(0,229,255,0.1);
          border-top-color: #00e5ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Empty ── */
        .cat-empty {
          text-align: center;
          padding: 80px 48px;
          color: rgba(232,234,240,0.25);
        }
        .cat-empty svg { margin-bottom: 16px; opacity: 0.15; }
        .cat-empty p { font-size: 15px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .cat-hero { padding: 48px 24px 40px; }
          .cat-toolbar { padding: 24px 24px; }
          .cat-tabs { padding: 0 24px 24px; }
          .cat-grid-wrapper { padding: 0 24px 60px; }
          .cat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        className="cyna-catalogue"
        style={{ '--accent': accentColor }}
      >
        {/* ── Hero ── */}
        <div className="cat-hero">
          <div className="cat-hero-grid" />
          <div className="cat-hero-content">
            <div className="cat-eyebrow" style={{ '--accent': accentColor }}>
              <ShieldCheck size={12} />
              Plateforme de cybersécurité SaaS
            </div>
            <h1 className="cat-hero-title">
              Protégez votre infrastructure<br />
              <span style={{ color: accentColor }}>avec les meilleurs outils.</span>
            </h1>
            <p className="cat-hero-sub">
              Déployez des solutions SOC, EDR et XDR de niveau enterprise en quelques heures.
              Souscription mensuelle ou annuelle, sans engagement minimum.
            </p>
            <div className="trust-badges">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="trust-badge" style={{ '--accent': accentColor }}>
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <form onSubmit={handleSearch} className="cat-toolbar">
          <div className="cat-search-wrap">
            <Search size={16} />
            <input
              className="cat-search-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un service (EDR, SOC, XDR...)"
              style={{ '--accent': accentColor }}
            />
          </div>
          <button
            type="submit"
            className="cat-filter-btn"
            style={{ background: accentColor }}
          >
            Filtrer
          </button>
        </form>

        {/* ── Tabs ── */}
        <div className="cat-tabs">
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <button
              key={key}
              className={`cat-tab ${categorie === key ? 'active' : ''}`}
              style={{ '--tab-accent': CATEGORY_ACCENT[key] }}
              onClick={() => handleCategorieChange(key)}
            >
              {CATEGORY_ICONS[key]}
              {val.label}
              <span className="cat-tab-sub">{val.sub}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="cat-grid-wrapper">
          {loading ? (
            <div className="cat-loading">
              <div className="loading-ring" />
              <span>Chargement des solutions...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="cat-empty">
              <ShieldCheck size={64} />
              <p>Aucun service trouvé pour cette sélection.</p>
            </div>
          ) : (
            <>
              <p className="cat-count">
                {services.length} solution{services.length > 1 ? 's' : ''} disponible{services.length > 1 ? 's' : ''}
              </p>
              <div className="cat-grid">
                {services.map(service => {
                  const cat = service.category?.toLowerCase() || 'tous';
                  const accent = CATEGORY_ACCENT[cat] || '#00e5ff';
                  const isAdded = addedId === service.id;
                  const isWished = wishlistIds.has(service.id);

                  return (
                    <div
                      key={service.id}
                      className="svc-card"
                      style={{ '--card-accent': accent }}
                      onMouseEnter={() => setHoveredId(service.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Image */}
                      <div className="svc-card-top">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.name}
                            className="svc-card-img"
                          />
                        ) : (
                          <div className="svc-card-img-placeholder">
                            <ShieldCheck size={48} style={{ color: accent, opacity: 0.2 }} />
                          </div>
                        )}
                        <div className="svc-category-badge">
                          {CATEGORY_ICONS[cat]}
                          {cat.toUpperCase()}
                        </div>
                        <div className={`svc-status-dot ${service.isAvailable ? 'ok' : 'ko'}`}>
                          {service.isAvailable ? 'Disponible' : 'Indisponible'}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="svc-card-body">
                        <h3 className="svc-name">{service.name}</h3>
                        <p className="svc-desc">
                          {service.description?.substring(0, 80)}{service.description?.length > 80 ? '…' : ''}
                        </p>
                        <div className="svc-footer">
                          <div className="svc-price-block">
                            <div className="svc-price">{Number(service.price).toFixed(2)} €</div>
                            <div className="svc-price-period">/ mois · par licence</div>
                          </div>
                          <div className="svc-actions">
                            <button
                              className={`btn-wishlist ${isWished ? 'active' : ''}`}
                              onClick={() => handleWishlist(service)}
                              title="Ajouter à la veille"
                            >
                              <Heart size={16} fill={isWished ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              className={`btn-cart ${isAdded ? 'added' : ''}`}
                              style={!isAdded && service.isAvailable ? { background: accent } : {}}
                              onClick={() => handleAjoutPanier(service)}
                              disabled={!service.isAvailable}
                            >
                              {isAdded ? (
                                <><ShieldCheck size={14} /> Ajouté</>
                              ) : (
                                <><ShoppingCart size={14} /> Souscrire</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}