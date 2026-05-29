import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, Zap, Eye, Server, ArrowRight,
  Lock, CheckCircle, ChevronRight, ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import { useContent } from '../context/ContentContext';
import '../style_localisés/Home.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const cleanText = (html) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : null;

const SOLUTIONS = [
  { key: 'edr', icon: <ShieldCheck size={28} />, color: '#00e5ff', label: 'EDR', titleKey: 'home.solutions.edr_title', descKey: 'home.solutions.edr_desc', path: '/catalogue/edr' },
  { key: 'xdr', icon: <Eye size={28} />, color: '#7c4dff', label: 'XDR', titleKey: 'home.solutions.xdr_title', descKey: 'home.solutions.xdr_desc', path: '/catalogue/xdr' },
  { key: 'soc', icon: <Server size={28} />, color: '#00e676', label: 'SOC', titleKey: 'home.solutions.soc_title', descKey: 'home.solutions.soc_desc', path: '/catalogue/soc' },
];

const STATS = [
  { value: '99.9%',  labelKey: 'home.stats.sla' },
  { value: '< 2min', labelKey: 'home.stats.detection' },
  { value: '500+',   labelKey: 'home.stats.companies' },
  { value: '24/7',   labelKey: 'home.stats.support' },
];

const FEATURES = [
  { icon: <Lock size={18} />,        textKey: 'home.features.encryption' },
  { icon: <CheckCircle size={18} />, textKey: 'home.features.compliance' },
  { icon: <Zap size={18} />,         textKey: 'home.features.deployment' },
  { icon: <ShieldCheck size={18} />, textKey: 'home.features.no_infra' },
];

export default function Home({ ajouterAuPanier }) {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const { contents } = useContent();

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
    <div className="home-cyna">

      <section className="home-hero">
        <div className="hero-noise" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-grid-bg" />

        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              {cleanText(contents.hero_tag?.text) || t('home.hero.tag')}
            </div>

            <h1
              className="hero-h1"
              dangerouslySetInnerHTML={{ __html: contents.hero_title?.text || t('home.hero.title') }}
            />

            <p
              className="hero-sub"
              dangerouslySetInnerHTML={{ __html: contents.hero_subtitle?.text || t('home.hero.subtitle') }}
            />

            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => navigate('/catalogue/tous')}>
                {cleanText(contents.hero_btn_primary?.text) || t('home.hero.btn_primary')} <ArrowRight size={16} />
              </button>
              <button className="btn-ghost" onClick={() => navigate('/contact')}>
                {cleanText(contents.hero_btn_secondary?.text) || t('home.hero.btn_secondary')}
              </button>
            </div>
            <div className="hero-features">
              {FEATURES.map((f, i) => (
                <div key={i} className="hero-feature-item">
                  {f.icon} {t(f.textKey)}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card">
              <p className="hero-card-title">
                {cleanText(contents.hero_stats_title?.text) || t('home.hero.stats_title')}
              </p>
              <div className="stats-grid">
                {STATS.map((s, i) => (
                  <div key={i} className="stat-item">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{t(s.labelKey)}</div>
                  </div>
                ))}
              </div>
              <div className="hero-card-badge">
                <CheckCircle size={16} />
                {cleanText(contents.hero_stats_badge?.text) || t('home.hero.stats_badge')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-solutions">
        <p className="section-eyebrow">
          {cleanText(contents.solutions_eyebrow?.text) || t('home.solutions.eyebrow')}
        </p>
        <h2
          className="section-title"
          dangerouslySetInnerHTML={{ __html: contents.solutions_title?.text || t('home.solutions.title') }}
        />
        <p
          className="section-sub"
          dangerouslySetInnerHTML={{ __html: contents.solutions_subtitle?.text || t('home.solutions.subtitle') }}
        />
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
              <h3 className="sol-title">{t(sol.titleKey)}</h3>
              <p className="sol-desc">{t(sol.descKey)}</p>
              <span className="sol-link">
                {t('home.solutions.discover')} <ChevronRight size={14} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-top">
        <div className="top-header">
          <div>
            <p className="section-eyebrow">
              {cleanText(contents.top_services_eyebrow?.text) || t('home.top.eyebrow')}
            </p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {cleanText(contents.top_services_title?.text) || t('home.top.title')}
            </h2>
          </div>
          <button className="btn-voir-tout" onClick={() => navigate('/catalogue/tous')}>
            {cleanText(contents.top_services_btn?.text) || t('home.top.btn_all')} <ArrowRight size={14} />
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
                        {svc.category?.toUpperCase() || t('home.top.default_category')}
                      </div>
                      <h3 className="top-card-name">{svc.name}</h3>
                      <p className="top-card-desc">
                        {svc.description?.substring(0, 72)}{svc.description?.length > 72 ? '…' : ''}
                      </p>
                      <div className="top-card-footer">
                        <div className="top-card-price">
                          {Number(svc.price).toFixed(2)} €
                          <small>{t('home.top.per_month')}</small>
                        </div>
                        <button
                          className="btn-top-cart"
                          onClick={() => ajouterAuPanier?.({ ...svc, subscriptionDuration: 'mensuel' })}
                        >
                          <ShoppingCart size={13} /> {t('home.top.subscribe')}
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
                      <h3 className="top-card-name">{t(sol.titleKey)}</h3>
                      <p className="top-card-desc">{t(sol.descKey)}</p>
                      <div className="top-card-footer">
                        <div className="top-card-price">{t('home.top.on_quote')}</div>
                        <button className="btn-top-cart" style={{ background: sol.color }}
                          onClick={e => { e.stopPropagation(); navigate(sol.path); }}>
                          {t('home.top.view')} <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
          }
        </div>
      </section>

      <div className="home-cta-band">
        <div className="cta-band-left">
          <h2 className="cta-band-title">
            {cleanText(contents.cta_title?.text) || t('home.cta.title')}
          </h2>
          <p className="cta-band-sub">
            {cleanText(contents.cta_subtitle?.text) || t('home.cta.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/catalogue/tous')}>
            {cleanText(contents.cta_btn_primary?.text) || t('home.cta.btn_primary')} <ArrowRight size={16} />
          </button>
          <button className="btn-ghost" onClick={() => navigate('/contact')}>
            {cleanText(contents.cta_btn_secondary?.text) || t('home.cta.btn_secondary')}
          </button>
        </div>
      </div>

    </div>
  );
}