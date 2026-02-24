import { Home, ShoppingCart, User, Info, LogOut, LogIn, UserPlus, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  // J'importe la fonction de traduction et l'instance i18n
  const { t, i18n } = useTranslation();

  const authState = {
    isAuthenticated: true,
    username: "Ryan"
  };

  // Je crée une fonction pour basculer entre FR et EN
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #eee', alignItems: 'center' }}>

      <nav className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#333' }}>
          <Home size={18} /> Accueil
        </a>

        {authState.isAuthenticated && (
          <>
            <a href="/panier" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#333' }}>
              <ShoppingCart size={18} /> Panier
            </a>
            <a href="/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#333' }}>
              <User size={18} /> Mon Profil
            </a>
          </>
        )}

        <a href="/info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#333' }}>
          <Info size={18} /> Informations
        </a>
      </nav>

      <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {/* J'ajoute le bouton de changement de langue ici */}
        <button
          onClick={toggleLanguage}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0f0f0', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
          aria-label="Changer de langue"
        >
          <Globe size={18} />
          {i18n.language === 'fr' ? 'FR' : 'EN'}
        </button>

        {authState.isAuthenticated ? (
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="username" style={{ fontWeight: 'bold' }}>{authState.username}</span>
              <button onClick={() => console.log('Déconnexion...')} className="logout-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                <LogOut size={14} /> {t('menu.logout')}
              </button>
            </div>
            <div className="avatar">
              <img src="/images/avatar.png" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        ) : (
          <div className="auth-buttons" style={{ display: 'flex', gap: '1rem' }}>
            <a href="/connexion" className="login-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#333' }}>
              <LogIn size={18} /> {t('menu.login')}
            </a>
            <a href="/inscription" className="register-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#333' }}>
              <UserPlus size={18} /> {t('menu.register')}
            </a>
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;