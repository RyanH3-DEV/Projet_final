import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, User, LogOut, UserPlus, Globe, LogIn,
  LayoutDashboard, Crown, Menu, X, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContent } from '../context/ContentContext';
import { useCart } from '../context/CartContext';
import useWindowSize from '../hooks/useWindowSize';
import '../style_localisés/Header.css';

const cleanText = (html) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : '';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

const formatImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const cleanedPath = imagePath.replace('http://127.0.0.1:8000', '');
  if (cleanedPath.startsWith('http')) return cleanedPath;
  return `${BASE_URL}${cleanedPath}`;
};

const buildNavLinks = (t, user, isAdmin, isSuper, contents, cartCount) => [
  {
    to: '/',
    label: cleanText(contents.nav_home?.text) || t('header.home')
  },
  {
    to: '/catalogue/tous',
    label: t('header.catalogue')
  },
  {
    to: '/panier',
    label: `${cleanText(contents.nav_cart?.text) || t('header.cart')} ${cartCount > 0 ? `(${cartCount})` : ''}`,
    icon: <ShoppingCart size={15} />
  },
  ...(user    ? [{ to: '/profil',     label: t('header.profile'),  icon: <User            size={15} /> }] : []),
  ...(isAdmin ? [{ to: '/admin',      label: 'Admin',              icon: <LayoutDashboard size={15} /> }] : []),
  ...(isSuper ? [{ to: '/superadmin', label: 'Super Admin',        icon: <Crown           size={15} /> }] : []),
];

export default function Header({ user, onLogout }) {
  const { t, i18n } = useTranslation();
  const { contents } = useContent();
  const { cartCount } = useCart();

  const navigate     = useNavigate();
  const location     = useLocation();
  const [open, setOpen] = useState(false);
  const { width }    = useWindowSize();
  const isMobile     = width <= 720;

  const isAdmin    = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const isSuper    = user?.roles?.includes('ROLE_SUPER_ADMIN');
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  const close      = () => setOpen(false);

  const navLinks   = buildNavLinks(t, user, isAdmin, isSuper, contents, cartCount);
  const isActive   = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <>
      <header className="ch-header">
        <div className="ch-inner">

          <Link to="/" className="ch-logo">
            <div className="ch-logo-icon">
              {contents.logo_principal?.image ? (
                <img src={formatImageUrl(contents.logo_principal.image)} alt="Logo" style={{ height: '20px' }} />
              ) : (
                <ShieldCheck size={18} />
              )}
            </div>

            <span className="ch-logo-text">
              {contents.site_name?.text ? (
                cleanText(contents.site_name.text)
              ) : (
                <>CY<span className="ch-logo-accent">NA</span></>
              )}
            </span>
          </Link>

          <nav className="ch-nav">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`ch-link ${isActive(l.to) ? 'ch-link--active' : ''}`}>
                {l.icon} {l.label}
              </Link>
            ))}
          </nav>

          <div className="ch-right">
            <button onClick={toggleLang} className="ch-lang">
              <Globe size={12} /> {i18n.language.toUpperCase()}
            </button>
            {user ? (
              <div className="ch-user">
                <div className="ch-avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" />
                    : `${user.prenom?.charAt(0)}${user.nom?.charAt(0)}`}
                </div>
                <span className="ch-username">{user.prenom}</span>
                <button className="ch-logout" onClick={() => { onLogout(); navigate('/'); }}>
                  <LogOut size={13} /> {t('header.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/connexion"   className="ch-btn-login">
                  <LogIn size={14} /> {t('header.login')}
                </Link>
                <Link to="/inscription" className="ch-btn-register">
                  <UserPlus size={14} /> {t('header.register')}
                </Link>
              </>
            )}
          </div>

          {isMobile && (
            <button className="ch-hamburger" onClick={() => setOpen(p => !p)} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </header>

      {isMobile && open && (
        <div className="ch-drawer">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`ch-link ${isActive(l.to) ? 'ch-link--active' : ''}`} onClick={close}>
              {l.icon} {l.label}
              <ChevronRight size={14} className="ch-link-arrow" />
            </Link>
          ))}

          <div className="ch-divider" />

          <div className="ch-drawer-bottom">
            <button onClick={toggleLang} className="ch-lang">
              <Globe size={12} /> {i18n.language.toUpperCase()}
            </button>
            {user ? (
              <div className="ch-user">
                <div className="ch-avatar">
                  {user.avatar ? <img src={user.avatar} alt="" /> : `${user.prenom?.charAt(0)}${user.nom?.charAt(0)}`}
                </div>
                <span className="ch-username">{user.prenom} {user.nom}</span>
                <button className="ch-logout" onClick={() => { onLogout(); navigate('/'); close(); }}>
                  <LogOut size={13} /> {t('header.logout')}
                </button>
              </div>
            ) : (
              <div className="ch-auth-row">
                <Link to="/connexion"   className="ch-btn-login"    onClick={close}><LogIn    size={14} /> {t('header.login')}    </Link>
                <Link to="/inscription" className="ch-btn-register" onClick={close}><UserPlus size={14} /> {t('header.register')} </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}