import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ArrowRight, TrendingUp, Gift, Loader, BookOpen, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import '../style_localisés/Home.css';

const Home = ({ naviguerVersCatalogue, ajouterAuPanier }) => {
  const { t } = useTranslation();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (La logique de récupération des livres reste la même)
    const fetchTopBooks = async () => {
      try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=4&langRestrict=fr');
        const data = response.data;
        if (data.items) {
          const formattedBooks = data.items.map(item => {
            const vol = item.volumeInfo;
            const sale = item.saleInfo;
            const imageUrl = vol.imageLinks?.thumbnail ? vol.imageLinks.thumbnail.replace("http:", "https:") : "https://via.placeholder.com/150x200?text=Pas+de+couverture";
            let prix = 12.99;
            if (sale && sale.retailPrice) { prix = sale.retailPrice.amount; }
            else if (vol.pageCount) { prix = (vol.pageCount * 0.04).toFixed(2); }
            else { prix = ((vol.title?.length || 10) % 15) + 8.99; }

            return {
              id: item.id,
              title: vol.title || "Titre inconnu",
              author: vol.authors ? vol.authors[0] : "Auteur inconnu",
              // On garde le prix en format chaîne pour l'affichage direct
              price: Number(prix).toFixed(2),
              image: imageUrl,
              tag: "Nouveau"
            };
          });
          setFeaturedBooks(formattedBooks);
        }
      } catch (error) { console.error("Erreur API", error); } finally { setLoading(false); }
    };
    fetchTopBooks();
  }, []);

  return (
    <main className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t('home.welcome_title') || 'L\'élégance des mots.'}</h1>
          <p className="hero-subtitle">{t('home.welcome_subtitle') || 'Explorez notre collection littéraire.'}</p>
          <button onClick={() => naviguerVersCatalogue('fiction')} className="hero-cta-button">
            Découvrir le catalogue <ArrowRight size={20} className="icon-right" />
          </button>
        </div>
      </section>

      {/* ... (Section catégories reste similaire, le style changera via CSS) ... */}
      <section className="home-section">
        <h2 className="section-title">Parcourir par genre</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => naviguerVersCatalogue('fiction')}>
            <BookOpen size={32} className="category-icon" />
            <h3>Romans</h3>
          </div>
          <div className="category-card" onClick={() => naviguerVersCatalogue('comics')}>
            <TrendingUp size={32} className="category-icon" />
            <h3>Mangas & BD</h3>
          </div>
          <div className="category-card" onClick={() => naviguerVersCatalogue('juvenile')}>
            <Star size={32} className="category-icon" />
            <h3>Jeunesse</h3>
          </div>
        </div>
      </section>

      <section className="home-section bg-white">
        <h2 className="section-title">À la une</h2>
        {loading ? (
          <div className="loading-container"><Loader size={40} className="spinner" /></div>
        ) : (
          <div className="featured-grid">
            {featuredBooks.map(book => (
              <div key={book.id} className="featured-card">
                <div className="featured-image-container">
                  <img src={book.image} alt={book.title} className="featured-image" />
                </div>
                <div className="featured-info">
                  <h3 className="featured-title">{book.title}</h3>
                  <p className="featured-author">{book.author}</p>
                  <div className="featured-footer">
                    <strong className="featured-price">{book.price} €</strong>
                    {/* Le bouton est maintenant relié à la fonction et a une classe CSS */}
                    <button onClick={() => ajouterAuPanier(book)} className="add-to-cart-btn" title="Ajouter au panier">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-container">
          <button onClick={() => naviguerVersCatalogue('fiction')} className="btn-secondary">
            Tout voir
          </button>
        </div>
      </section>
    </main>
  );
};
export default Home;