import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, User, Info, LogOut, UserPlus, Globe, LogIn, LayoutDashboard, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/Header.css';

const Header = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Je vérifie si l'utilisateur est Admin OU Super Admin pour l'accès à la gestion standard
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');

  // Je réserve ce flag uniquement pour les fonctionnalités exclusives au Super Admin
  const isSuper = user?.roles?.includes('ROLE_SUPER_ADMIN');

  return (
    <header className="main-header">
      <nav className="nav-links">
        <Link to="/" className="nav-item">
          <Home size={18} /> {t('header.home', 'Accueil')}
        </Link>
        <Link to="/panier" className="nav-item">
          <ShoppingCart size={18} /> {t('header.cart', 'Panier')}
        </Link>

        {user && (
          <Link to="/profil" className="nav-item">
            <User size={18} /> {t('header.profile', 'Mon Profil')}
          </Link>
        )}

        <Link to="/informations" className="nav-item">
          <Info size={18} /> {t('header.informations', 'Informations')}
        </Link>

        {/* Désormais, si je suis Super Admin, je vois aussi ce lien */}
        {isAdmin && (
          <Link to="/admin" className="nav-item">
            <LayoutDashboard size={18} /> {t('header.admin', 'Administration')}
          </Link>
        )}

        {isSuper && (
          <Link to="/superadmin" className="nav-item">
            <Crown size={18} /> {t('header.superadmin', 'Super Admin')}
          </Link>
        )}
      </nav>

      <div className="user-profile">
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
          className="lang-btn"
        >
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
            <Link to="/connexion" className="nav-item">
              <LogIn size={18} /> {t('menu.login', 'Connexion')}
            </Link>
            <Link to="/inscription" className="nav-item">
              <UserPlus size={18} /> {t('menu.register', 'Inscription')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;