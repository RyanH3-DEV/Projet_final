import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, Zap, Eye, Server, ArrowRight,
  Lock, CheckCircle, ChevronRight, Star, ShoppingCart
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

// ── Données statiques marketing ──────────────────────────────────────────────

const SOLUTIONS = [
  {
    key: 'edr',
    icon: <ShieldCheck size={28} />,
    color: '#00e5ff',
    label: 'EDR',
    title: 'Endpoint Detection & Response',
    desc: 'Détection et neutralisation des menaces sur chaque poste en temps réel.',
    path: '/catalogue/edr',
  },
  {
    key: 'xdr',
    icon: <Eye size={28} />,
    color: '#7c4dff',
    label: 'XDR',
    title: 'Extended Detection & Response',
    desc: 'Corrélation des données sur l\'ensemble de votre infrastructure hybride.',
    path: '/catalogue/xdr',
  },
  {
    key: 'soc',
    icon: <Server size={28} />,
    color: '#00e676',
    label: 'SOC',
    title: 'Security Operations Center',
    desc: 'Supervision continue de votre SI par des analystes certifiés 24h/24.',
    path: '/catalogue/soc',
  },
];

const STATS = [
  { value: '99.9%',  label: 'Disponibilité SLA' },
  { value: '< 2min', label: 'Temps de détection' },
  { value: '500+',   label: 'Entreprises protégées' },
  { value: '24/7',   label: 'Support inclus' },
];

const FEATURES = [
  { icon: <Lock size={18} />,        text: 'Chiffrement de bout en bout' },
  { icon: <CheckCircle size={18} />, text: 'Conforme RGPD & ISO 27001' },
  { icon: <Zap size={18} />,         text: 'Déploiement en moins de 24h' },
  { icon: <ShieldCheck size={18} />, text: 'Zéro infrastructure à gérer' },
];

// ────────────────────────────────────────────────────────────────────────────

export default function Home({ ajouterAuPanier }) {
  const { t }    = useTranslation();
  const navigate = useNavigate();

  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/services`, { params: { limit: 3 } })
      .then(r => setTopServices((r.data || []).slice(0, 3)))
      .catch(() => setTopServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .home-cyna {
          background: #050810;
          color: #e8eaf0;
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── HERO ─────────────────────────────────────────────── */
        .home-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          padding: 80px 48px;
          overflow: hidden;
        }
        .hero-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }
        .hero-glow-1 {
          position: absolute;
          width: 700px; height: 700px;
          top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute;
          width: 500px; height: 500px;
          bottom: -100px; right: 5%;
          background: radial-gradient(circle, rgba(124,77,255,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
        }

        .hero-inner {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .hero-left {}
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #00e5ff;
          background: rgba(0,229,255,0.07);
          border: 1px solid rgba(0,229,255,0.2);
          padding: 6px 14px;
          border-radius: 4px;
          margin-bottom: 28px;
          animation: fadeUp 0.6s ease both;
        }
        .hero-tag-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00e5ff;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .hero-h1 {
          font-size: clamp(36px, 4.5vw, 62px);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 0 0 24px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-h1-accent { color: #00e5ff; }

        .hero-sub {
          font-size: 17px;
          line-height: 1.65;
          color: rgba(232,234,240,0.5);
          font-weight: 300;
          max-width: 480px;
          margin: 0 0 40px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: #00e5ff;
          color: #050810;
          border: none;
          border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: transparent;
          color: rgba(232,234,240,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-ghost:hover {
          border-color: rgba(255,255,255,0.3);
          color: #e8eaf0;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 48px;
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .hero-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(232,234,240,0.45);
        }
        .hero-feature-item svg { color: #00e676; flex-shrink: 0; }

        /* ── Hero right: stats card ── */
        .hero-right {
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute;
          top: -1px; left: 20px; right: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00e5ff, transparent);
        }
        .hero-card-title {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232,234,240,0.3);
          margin: 0 0 24px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .stat-item {
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .stat-item:hover { border-color: rgba(0,229,255,0.3); }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #00e5ff;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 11px;
          color: rgba(232,234,240,0.35);
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .hero-card-badge {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(0,230,118,0.06);
          border: 1px solid rgba(0,230,118,0.15);
          border-radius: 10px;
          font-size: 12px;
          color: rgba(232,234,240,0.5);
        }
        .hero-card-badge svg { color: #00e676; }

        /* ── SOLUTIONS ────────────────────────────────────────── */
        .home-solutions {
          padding: 100px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(232,234,240,0.3);
          margin-bottom: 16px;
        }
        .section-title {
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 12px;
          line-height: 1.15;
        }
        .section-sub {
          font-size: 16px;
          color: rgba(232,234,240,0.4);
          font-weight: 300;
          max-width: 500px;
          line-height: 1.6;
          margin: 0 0 56px;
        }
        .solutions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .solution-card {
          padding: 32px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          cursor: pointer;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .solution-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, var(--sol-color, #00e5ff) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .solution-card:hover {
          border-color: var(--sol-color, #00e5ff);
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .solution-card:hover::after { opacity: 0.04; }

        .sol-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 22px;
          color: var(--sol-color, #00e5ff);
          transition: background 0.3s;
        }
        .solution-card:hover .sol-icon {
          background: rgba(255,255,255,0.07);
        }
        .sol-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sol-color, #00e5ff);
          margin-bottom: 8px;
          display: block;
        }
        .sol-title {
          font-size: 17px;
          font-weight: 600;
          color: #e8eaf0;
          margin: 0 0 12px;
          line-height: 1.3;
        }
        .sol-desc {
          font-size: 13px;
          color: rgba(232,234,240,0.4);
          line-height: 1.65;
          margin: 0 0 24px;
        }
        .sol-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--sol-color, #00e5ff);
          transition: gap 0.2s;
        }
        .solution-card:hover .sol-link { gap: 10px; }

        /* ── TOP SERVICES ──────────────────────────────────────── */
        .home-top {
          padding: 0 48px 100px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .top-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .btn-voir-tout {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(232,234,240,0.5);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .btn-voir-tout:hover {
          color: #e8eaf0;
          border-color: rgba(255,255,255,0.25);
        }
        .top-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .top-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s;
        }
        .top-card:hover {
          border-color: rgba(0,229,255,0.3);
          transform: translateY(-3px);
        }
        .top-card-img {
          width: 100%;
          height: 130px;
          object-fit: cover;
          opacity: 0.55;
        }
        .top-card-placeholder {
          width: 100%;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,229,255,0.04), rgba(124,77,255,0.04));
          color: rgba(0,229,255,0.15);
        }
        .top-card-body { padding: 20px; }
        .top-card-cat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #00e5ff;
          margin-bottom: 8px;
        }
        .top-card-name {
          font-size: 15px;
          font-weight: 600;
          color: #e8eaf0;
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .top-card-desc {
          font-size: 12px;
          color: rgba(232,234,240,0.35);
          margin: 0 0 18px;
          line-height: 1.55;
        }
        .top-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .top-card-price {
          font-size: 18px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.02em;
        }
        .top-card-price small {
          font-size: 11px;
          color: rgba(232,234,240,0.3);
          font-weight: 400;
          letter-spacing: 0;
        }
        .btn-top-cart {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          background: #00e5ff;
          color: #050810;
          border: none;
          border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-top-cart:hover { opacity: 0.85; }

        /* ── Loading skeleton ── */
        .top-skeleton {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          height: 280px;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        /* ── CTA BAND ──────────────────────────────────────────── */
        .home-cta-band {
          margin: 0 48px 100px;
          max-width: 1104px;
          margin-left: auto;
          margin-right: auto;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(0,229,255,0.07), rgba(124,77,255,0.07));
          border: 1px solid rgba(0,229,255,0.15);
          padding: 64px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }
        .home-cta-band::before {
          content: '';
          position: absolute;
          top: -1px; left: 60px; right: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00e5ff 40%, #7c4dff, transparent);
        }
        .cta-band-left { flex: 1; min-width: 260px; }
        .cta-band-title {
          font-size: clamp(22px, 2.5vw, 32px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 12px;
          line-height: 1.2;
        }
        .cta-band-sub {
          font-size: 15px;
          color: rgba(232,234,240,0.45);
          font-weight: 300;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .home-hero { padding: 60px 24px; min-height: auto; }
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .home-solutions, .home-top { padding-left: 24px; padding-right: 24px; }
          .solutions-grid, .top-grid { grid-template-columns: 1fr; }
          .home-cta-band { margin: 0 24px 80px; padding: 40px 28px; }
        }
      `}</style>

      <div className="home-cyna">

        {/* ── HERO ── */}
        <section className="home-hero">
          <div className="hero-noise" />
          <div className="hero-glow-1" />
          <div className="hero-glow-2" />
          <div className="hero-grid-bg" />

          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-tag">
                <div className="hero-tag-dot" />
                Cybersécurité SaaS · Entreprise
              </div>
              <h1 className="hero-h1">
                Sécurisez votre SI<br />
                <span className="hero-h1-accent">sans compromis.</span>
              </h1>
              <p className="hero-sub">
                Cyna vous donne accès aux meilleures solutions SOC, EDR et XDR
                du marché, en souscription mensuelle, sans infrastructure à gérer.
              </p>
              <div className="hero-ctas">
                <button className="btn-primary" onClick={() => navigate('/catalogue/tous')}>
                  Voir les solutions <ArrowRight size={16} />
                </button>
                <button className="btn-ghost" onClick={() => navigate('/contact')}>
                  Demander une démo
                </button>
              </div>
              <div className="hero-features">
                {FEATURES.map((f, i) => (
                  <div key={i} className="hero-feature-item">
                    {f.icon} {f.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-card">
                <p className="hero-card-title">// Performance en temps réel</p>
                <div className="stats-grid">
                  {STATS.map((s, i) => (
                    <div key={i} className="stat-item">
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="hero-card-badge">
                  <CheckCircle size={16} />
                  Infrastructure certifiée ISO 27001 & SOC 2 Type II
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOLUTIONS ── */}
        <section className="home-solutions">
          <p className="section-eyebrow">// Notre offre</p>
          <h2 className="section-title">Trois piliers de protection,<br />un seul abonnement.</h2>
          <p className="section-sub">
            Chaque solution est disponible indépendamment ou en bundle.
            Souscription par licence, résiliable à tout moment.
          </p>
          <div className="solutions-grid">
            {SOLUTIONS.map(sol => (
              <div
                key={sol.key}
                className="solution-card"
                style={{ '--sol-color': sol.color }}
                onClick={() => navigate(sol.path)}
              >
                <div className="sol-icon">{sol.icon}</div>
                <span className="sol-badge">{sol.label}</span>
                <h3 className="sol-title">{sol.title}</h3>
                <p className="sol-desc">{sol.desc}</p>
                <span className="sol-link">
                  Découvrir <ChevronRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOP SERVICES ── */}
        <section className="home-top">
          <div className="top-header">
            <div>
              <p className="section-eyebrow">// Sélection du moment</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Services les plus souscrits
              </h2>
            </div>
            <button className="btn-voir-tout" onClick={() => navigate('/catalogue/tous')}>
              Tout le catalogue <ArrowRight size={14} />
            </button>
          </div>

          <div className="top-grid">
            {loading
              ? [1, 2, 3].map(i => <div key={i} className="top-skeleton" />)
              : topServices.length > 0
                ? topServices.map(svc => (
                    <div key={svc.id} className="top-card">
                      {svc.image
                        ? <img src={svc.image} alt={svc.name} className="top-card-img" />
                        : <div className="top-card-placeholder"><ShieldCheck size={40} /></div>
                      }
                      <div className="top-card-body">
                        <div className="top-card-cat">
                          {svc.category?.toUpperCase() || 'SERVICE'}
                        </div>
                        <h3 className="top-card-name">{svc.name}</h3>
                        <p className="top-card-desc">
                          {svc.description?.substring(0, 72)}{svc.description?.length > 72 ? '…' : ''}
                        </p>
                        <div className="top-card-footer">
                          <div className="top-card-price">
                            {Number(svc.price).toFixed(2)} €
                            <small> /mois</small>
                          </div>
                          <button
                            className="btn-top-cart"
                            onClick={() => ajouterAuPanier?.({ ...svc, subscriptionDuration: 'mensuel' })}
                          >
                            <ShoppingCart size={13} /> Souscrire
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                : SOLUTIONS.map(sol => (
                    <div
                      key={sol.key}
                      className="top-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(sol.path)}
                    >
                      <div className="top-card-placeholder" style={{ color: sol.color }}>
                        {sol.icon}
                      </div>
                      <div className="top-card-body">
                        <div className="top-card-cat" style={{ color: sol.color }}>{sol.label}</div>
                        <h3 className="top-card-name">{sol.title}</h3>
                        <p className="top-card-desc">{sol.desc}</p>
                        <div className="top-card-footer">
                          <div className="top-card-price">Sur devis</div>
                          <button className="btn-top-cart" style={{ background: sol.color }}
                            onClick={e => { e.stopPropagation(); navigate(sol.path); }}>
                            Voir <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
            }
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <div className="home-cta-band">
          <div className="cta-band-left">
            <h2 className="cta-band-title">
              Prêt à sécuriser votre infrastructure ?
            </h2>
            <p className="cta-band-sub">
              Déploiement en 24h · Support dédié · Sans engagement minimum
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/catalogue/tous')}>
              Voir toutes les solutions <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" onClick={() => navigate('/contact')}>
              Contacter un expert
            </button>
          </div>
        </div>

      </div>
    </>
  );
}