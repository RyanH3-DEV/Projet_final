import { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Loader } from "lucide-react";
import axios from "axios";
import '../style_localisés/Catalogue.css';

export default function Catalogue() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("fiction");
  const [sortBy, setSortBy] = useState("relevance");

  const searchBooks = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      let query = `subject:${genre}`;
      if (searchTerm.trim() !== "") {
        query = `${searchTerm}+subject:${genre}`;
      }

      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&orderBy=${sortBy}&maxResults=16&langRestrict=fr`);
      const data = response.data;

      if (data.items) {
        const formattedBooks = data.items.map(item => {
          const vol = item.volumeInfo;
          const sale = item.saleInfo;

          const imageUrl = vol.imageLinks?.thumbnail
            ? vol.imageLinks.thumbnail.replace("http:", "https:")
            : "https://via.placeholder.com/150x200?text=Pas+de+couverture";

          let prix = 12.99;
          if (sale && sale.retailPrice) {
             prix = sale.retailPrice.amount;
          } else if (vol.pageCount) {
             prix = (vol.pageCount * 0.04).toFixed(2);
          } else {
             prix = ((vol.title?.length || 10) % 15) + 8.99;
          }

          return {
            id: item.id,
            title: vol.title || "Titre inconnu",
            author: vol.authors ? vol.authors.join(", ") : "Auteur inconnu",
            price: Number(prix).toFixed(2) + " €",
            image: imageUrl,
            description: vol.description || "Aucune description disponible."
          };
        });
        setBooks(formattedBooks);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des livres", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchBooks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre, sortBy]);

  return (
    <div className="catalogue-container">
      <header className="catalogue-header">
        <h1 className="catalogue-title">Notre Bibliothèque</h1>

        <form onSubmit={searchBooks} className="search-filter-form">

          <div className="search-bar-container">
            <div className="search-icon-wrapper">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Rechercher un titre, un auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={20} className="filter-icon" />

            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="filter-select"
            >
              <option value="fiction">Romans & Fiction</option>
              <option value="comics">Mangas & BD</option>
              <option value="history">Histoire</option>
              <option value="science">Science</option>
              <option value="computers">Informatique</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Plus pertinents</option>
              <option value="newest">Plus récents</option>
            </select>

            <button type="submit" className="search-button">
              Rechercher
            </button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Recherche dans nos étagères...</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.length > 0 ? (
            books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-image-container">
                  <img src={book.image} alt={book.title} className="book-image" />
                </div>

                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>

                  <div className="book-footer">
                    <span className="book-price">{book.price}</span>
                    <button className="cart-button" title="Ajouter au panier">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              Aucun livre ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
}