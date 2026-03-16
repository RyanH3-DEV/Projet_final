import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, User, Info, LogOut, UserPlus, Globe, LogIn, LayoutDashboard, Crown, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/Header.css';

const Header = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const isSuper = user?.roles?.includes('ROLE_SUPER_ADMIN');

  const closeMenu = () => setMenuOpen(false);
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');

  return (
    <>
      <header className="main-header">

        {/* ── Navigation desktop ── */}
        <nav className="nav-links">
          <Link to="/" className="nav-item"><Home size={18} /> {t('header.home', 'Accueil')}</Link>
          <Link to="/panier" className="nav-item"><ShoppingCart size={18} /> {t('header.cart', 'Panier')}</Link>
          {user && (
            <Link to="/profil" className="nav-item"><User size={18} /> {t('header.profile', 'Mon Profil')}</Link>
          )}
          <Link to="/informations" className="nav-item"><Info size={18} /> {t('header.informations', 'Informations')}</Link>
          {isAdmin && (
            <Link to="/admin" className="nav-item"><LayoutDashboard size={18} /> {t('header.admin', 'Administration')}</Link>
          )}
          {isSuper && (
            <Link to="/superadmin" className="nav-item"><Crown size={18} /> {t('header.superadmin', 'Super Admin')}</Link>
          )}
        </nav>

        {/* ── Profil / langue desktop ── */}
        <div className="user-profile">
          <button onClick={toggleLang} className="lang-btn">
            <Globe size={18} /> {i18n.language === 'fr' ? 'FR' : 'EN'}
          </button>

          {user ? (
            <div className="user-info">
              <div className="user-details">
                <span className="username">{user.prenom} {user.nom}</span>
                <button onClick={() => { onLogout(); navigate('/'); }} className="logout-link">
                  <LogOut size={14} /> {t('menu.logout', 'Se déconnecter')}
                </button>
              </div>
              <div className="avatar">
                <img src={user.avatar} alt="Avatar" />
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/connexion" className="nav-item"><LogIn size={18} /> {t('menu.login', 'Connexion')}</Link>
              <Link to="/inscription" className="nav-item"><UserPlus size={18} /> {t('menu.register', 'Inscription')}</Link>
            </div>
          )}
        </div>

        {/* ── Hamburger mobile ── */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </header>

      {/* ── Menu mobile hors du header ── */}
      {menuOpen && (
        <div className="mobile-menu open">

          <Link to="/" className="nav-item" onClick={closeMenu}>
            <Home size={18} /> {t('header.home', 'Accueil')}
          </Link>
          <Link to="/panier" className="nav-item" onClick={closeMenu}>
            <ShoppingCart size={18} /> {t('header.cart', 'Panier')}
          </Link>
          {user && (
            <Link to="/profil" className="nav-item" onClick={closeMenu}>
              <User size={18} /> {t('header.profile', 'Mon Profil')}
            </Link>
          )}
          <Link to="/informations" className="nav-item" onClick={closeMenu}>
            <Info size={18} /> {t('header.informations', 'Informations')}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-item" onClick={closeMenu}>
              <LayoutDashboard size={18} /> {t('header.admin', 'Administration')}
            </Link>
          )}
          {isSuper && (
            <Link to="/superadmin" className="nav-item" onClick={closeMenu}>
              <Crown size={18} /> {t('header.superadmin', 'Super Admin')}
            </Link>
          )}

          <div className="mobile-menu-bottom">
            <button onClick={toggleLang} className="lang-btn">
              <Globe size={18} /> {i18n.language === 'fr' ? 'FR' : 'EN'}
            </button>

            {user ? (
              <div className="user-info">
                <div className="avatar"><img src={user.avatar} alt="Avatar" /></div>
                <div className="user-details">
                  <span className="username">{user.prenom} {user.nom}</span>
                  <button onClick={() => { onLogout(); navigate('/'); closeMenu(); }} className="logout-link">
                    <LogOut size={14} /> {t('menu.logout', 'Se déconnecter')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/connexion" className="nav-item" onClick={closeMenu}>
                  <LogIn size={18} /> {t('menu.login', 'Connexion')}
                </Link>
                <Link to="/inscription" className="nav-item" onClick={closeMenu}>
                  <UserPlus size={18} /> {t('menu.register', 'Inscription')}
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </>
  );
};

export default Header;