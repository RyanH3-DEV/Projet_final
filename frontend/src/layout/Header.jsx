import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, User, Info, LogOut, UserPlus, Globe, LogIn, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/Header.css';

const Header = ({ user, onLogout }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAdmin  = user?.roles?.includes('ROLE_ADMIN');

  return (
    <header className="main-header">
      <nav className="nav-links">
        <Link to="/" className="nav-item"><Home size={18} /> Accueil</Link>
        <Link to="/panier" className="nav-item"><ShoppingCart size={18} /> Panier</Link>
        {user && <Link to="/profil" className="nav-item"><User size={18} /> Mon Profil</Link>}
        <Link to="/informations" className="nav-item"><Info size={18} /> Informations</Link>
        {isAdmin && <Link to="/admin" className="nav-item admin-link"><LayoutDashboard size={18} /> Admin</Link>}
      </nav>

      <div className="user-profile">
        <button onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')} className="lang-btn">
          <Globe size={18} /> {i18n.language === 'fr' ? 'FR' : 'EN'}
        </button>

        {user ? (
          <div className="user-info">
            <div className="user-details">
              <span className="username">{user.prenom} {user.nom}</span>
              <button onClick={() => { onLogout(); navigate('/'); }} className="logout-link">
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
            <div className="avatar"><img src={user.avatar} alt="Avatar" /></div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/connexion" className="nav-item"><LogIn size={18} /> Connexion</Link>
            <Link to="/inscription" className="nav-item"><UserPlus size={18} /> S'inscrire</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;