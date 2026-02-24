import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ArrowRight, TrendingUp, Gift } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { t } = useTranslation();
  const [featuredBooks, setFeaturedBooks] = useState([]);

  // Je récupère les livres "Top du moment" via mon API Symfony
  useEffect(() => {
    // Je commente cette ligne tant que ton backend n'est pas prêt, et j'utilise des données de test
    // axios.get('/api/books/featured').then(res => setFeaturedBooks(res.data));

    setFeaturedBooks([
      { id: 1, title: "Le Petit Prince", author: "Saint-Exupéry", price: "7.50€", tag: "Best-seller" },
      { id: 2, title: "1984", author: "George Orwell", price: "8.90€", tag: "Essentiel" }
    ]);
  }, []);

  return (
    <main className="home-container">
      {/* Section Héro : Message de bienvenue */}
      <section className="hero-section" style={{ padding: '4rem 2rem', background: '#f8f9fa', textAlign: 'center' }}>
        <h1>{t('home.welcome_title')}</h1>
        <p>{t('home.welcome_subtitle')}</p>
        <button className="cta-button" style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px' }}>
          {t('home.explore_btn')} <ArrowRight size={18} />
        </button>
      </section>

      {/* Grille de catégories rapides */}
      <section className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '2rem' }}>
        <div className="category-card"><Star /> {t('genres.romans')}</div>
        <div className="category-card"><TrendingUp /> {t('genres.manga')}</div>
        <div className="category-card"><Gift /> {t('genres.promotions')}</div>
      </section>

      {/* Top du moment */}
      <section className="featured-books" style={{ padding: '2rem' }}>
        <h2>{t('home.top_books')}</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {featuredBooks.map(book => (
            <div key={book.id} className="book-card-mini" style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', minWidth: '200px' }}>
              <div style={{ height: '150px', background: '#eee', marginBottom: '10px' }}></div>
              <span style={{ fontSize: '0.8rem', color: 'orange' }}>{book.tag}</span>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <strong>{book.price}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;