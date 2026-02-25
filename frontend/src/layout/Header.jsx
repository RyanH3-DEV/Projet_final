import { Home, ShoppingCart, User, Info, LogOut, UserPlus, Globe, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/Header.css';

const Header = ({ setCurrentPage, user }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const navigerVers = (e, page) => {
    e.preventDefault();
    setCurrentPage(page);
  };

  return (
    <header className="main-header">
      <nav className="nav-links">
        <a href="/" onClick={(e) => navigerVers(e, 'home')} className="nav-item">
          <Home size={18} /> Accueil
        </a>

        <a href="/panier" onClick={(e) => navigerVers(e, 'panier')} className="nav-item">
          <ShoppingCart size={18} /> Panier
        </a>

        {user && (
          <a href="/profil" onClick={(e) => navigerVers(e, 'profil')} className="nav-item">
            <User size={18} /> Mon Profil
          </a>
        )}

        <a href="/info" onClick={(e) => navigerVers(e, 'info')} className="nav-item">
          <Info size={18} /> Informations
        </a>
      </nav>

      <div className="user-profile">
        <button onClick={toggleLanguage} className="lang-btn">
          <Globe size={18} /> {i18n.language === 'fr' ? 'FR' : 'EN'}
        </button>

        {user ? (
          <div className="user-info">
            <div className="user-details">
              {/* J'affiche le prénom et le nom si l'utilisateur est connecté */}
              <span className="username">{user.prenom} {user.nom}</span>
              <button onClick={() => window.location.reload()} className="logout-link">
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
            <div className="avatar">
              <img src={user.avatar} alt="Avatar" />
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            {/* Ajout du bouton Connexion */}
            <a href="/connexion" onClick={(e) => navigerVers(e, 'connexion')} className="nav-item">
              <LogIn size={18} /> Connexion
            </a>
            <a href="/inscription" onClick={(e) => navigerVers(e, 'inscription')} className="nav-item">
              <UserPlus size={18} /> S'inscrire
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;