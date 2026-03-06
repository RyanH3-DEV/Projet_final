import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowRight, TrendingUp, Loader, BookOpen, ShoppingCart, Heart, Sparkles } from 'lucide-react';
import axios from 'axios';
import WelcomeScreen from '../components/WelcomeScreen';
import '../style_localisés/Home.css';

const getCoverUrl = (coverId) =>
  `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;

const Home = ({ ajouterAuPanier, ajouterAWishlist }) => {
  const { t }       = useTranslation();
  const navigate    = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [wishlistIds, setWishlistIds]     = useState(new Set());
  const [siteLoading, setSiteLoading]     = useState(true);

  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        const res  = await axios.get('https://openlibrary.org/search.json?subject=fiction&limit=8&fields=key,title,author_name,cover_i,number_of_pages_median&sort=rating');
        const docs = (res.data.docs || []).filter(d => d.cover_i).slice(0, 4);
        setFeaturedBooks(docs.map(doc => ({
          id:     doc.key,
          title:  doc.title || t('book.unknown_title', 'Titre inconnu'),
          author: doc.author_name?.[0] || t('book.unknown_author', 'Auteur inconnu'),
          price:  doc.number_of_pages_median
            ? (doc.number_of_pages_median * 0.04).toFixed(2)
            : (Math.floor(Math.random() * 10) + 8).toFixed(2),
          image:  getCoverUrl(doc.cover_i),
        })));
      } catch (err) {
        console.error('Erreur Open Library', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopBooks();
  }, [t]);

  const handleWishlist = async (book) => {
    if (!ajouterAWishlist) return;
    const ok = await ajouterAWishlist(book);
    if (ok) setWishlistIds(prev => new Set([...prev, book.id]));
  };

  const categories = [
    { path: '/catalogue/fiction',  icon: <BookOpen size={28} />,   label: t('genres.romans', 'Romans'),      color: '#c89b3c' },
    { path: '/catalogue/comics',   icon: <TrendingUp size={28} />, label: t('genres.manga_bd', 'Mangas & BD'), color: '#e74c3c' },
    { path: '/catalogue/juvenile', icon: <Star size={28} />,       label: t('genres.juvenile', 'Jeunesse'),    color: '#2ecc71' },
  ];

  if (siteLoading) {
    // Je passe la fonction de rappel pour lever le rideau dès que l'animation est finie (ou sautée)
    return <WelcomeScreen onDone={() => setSiteLoading(false)} />;
  }

  return (
    <main className="home-container">

      <section className="hero-section">
        <div className="hero-bg-overlay" />
        <div className="hero-content">
          <span className="hero-badge"><Sparkles size={14} /> {t('home.collection_2025', 'Collection 2025')}</span>
          <h1 className="hero-title">{t('home.welcome_title')}</h1>
          <p className="hero-subtitle">{t('home.welcome_subtitle')}</p>
          <button onClick={() => navigate('/catalogue/fiction')} className="hero-cta-button">
            {t('home.explore_btn', 'Découvrir le catalogue')} <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-books-deco">
          <div className="deco-book deco-1" />
          <div className="deco-book deco-2" />
          <div className="deco-book deco-3" />
        </div>
      </section>

      <section className="genres-section">
        <p className="genres-label">{t('home.browse_by_genre', 'PARCOURIR PAR GENRE')}</p>
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.path} className="category-card" onClick={() => navigate(cat.path)} style={{ '--cat-color': cat.color }}>
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.label}</h3>
              <ArrowRight size={16} className="cat-arrow" />
            </div>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <h2 className="section-title">{t('home.top_books', 'À la une')}</h2>
        </div>

        {loading ? (
          <div className="loading-container"><Loader size={36} className="spinner" /></div>
        ) : (
          <>
            <div className="featured-grid">
              {featuredBooks.map(book => (
                <div key={book.id} className="featured-card">
                  <div className="featured-image-container">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="featured-image"
                      onError={e => { e.target.closest('.featured-card').style.display = 'none'; }}
                    />
                    <div className="featured-overlay">
                      <button onClick={() => handleWishlist(book)} className={`overlay-btn ${wishlistIds.has(book.id) ? 'wishlisted' : ''}`} title={t('book.add_to_wishlist', 'Ajouter à la wishlist')}>
                        <Heart size={16} fill={wishlistIds.has(book.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => ajouterAuPanier(book)} className="overlay-btn" title={t('book.add_to_cart', 'Ajouter au panier')}>
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="featured-info">
                    <h3 className="featured-title">{book.title}</h3>
                    <p className="featured-author">{book.author}</p>
                    <strong className="featured-price">{book.price} €</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="view-all-container">
              <button onClick={() => navigate('/catalogue/fiction')} className="btn-voir-tout">
                {t('home.view_all', 'Tout voir')} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </section>

    </main>
  );
};

export default Home;