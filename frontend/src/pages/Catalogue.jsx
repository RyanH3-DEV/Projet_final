import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Loader, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { addToCart } from "../api/cartApi";
import '../style_localisés/Catalogue.css';

const BOOKS_PER_PAGE = 16;

export default function Catalogue({ ajouterAuPanier, ajouterAWishlist, genre: genreInitial = 'fiction' }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState(
    ['fiction','comics','juvenile','history','science'].includes(genreInitial) ? genreInitial : 'fiction'
  );
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // ✅ Charge une page ET vérifie si la suivante existe vraiment
  const fetchPage = async (nouvellePage, currentGenre, currentSearch) => {
    setLoading(true);
    try {
      const startIndex = (nouvellePage - 1) * BOOKS_PER_PAGE;
      const query = currentSearch
        ? `${currentSearch}+subject:${currentGenre}`
        : `subject:${currentGenre}`;

      const [resCurrent, resNext] = await Promise.all([
        axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${BOOKS_PER_PAGE}&startIndex=${startIndex}&langRestrict=fr`),
        axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&startIndex=${startIndex + BOOKS_PER_PAGE}&langRestrict=fr`),
      ]);

      const formatted = resCurrent.data.items
        ?.filter(item => item.volumeInfo.imageLinks?.thumbnail)
        .map(item => ({
          id: item.id,
          title: item.volumeInfo.title || "Titre inconnu",
          price: (item.volumeInfo.pageCount * 0.04 || 12.99).toFixed(2),
          image: item.volumeInfo.imageLinks.thumbnail
            .replace("http:", "https:")
            .replace("zoom=1", "zoom=2")
            .replace("&edge=curl", ""),
          author: item.volumeInfo.authors?.[0] || "Auteur inconnu"
        })) || [];

      if (formatted.length === 0) return; // Page vide → on ne change rien

      setBooks(formatted);
      setPage(nouvellePage);
      // ✅ hasNextPage = vrai SEULEMENT si Google confirme des résultats après
      setHasNextPage((resNext.data.items?.length || 0) > 0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Erreur chargement livres", err);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = (e, nouvellePage = 1) => {
    if (e) e.preventDefault();
    fetchPage(nouvellePage, genre, searchTerm);
  };

  useEffect(() => {
    setPage(1);
    fetchPage(1, genre, searchTerm);
  }, [genre]);

  const handleAjoutPanier = async (book) => {
    if (ajouterAuPanier) { ajouterAuPanier(book); }
    else {
      try { await addToCart(book); alert(`"${book.title}" ajouté !`); }
      catch { alert("Connecte-toi pour gérer ton panier."); }
    }
  };

  const handleWishlist = async (book) => {
    if (!ajouterAWishlist) return;
    const ok = await ajouterAWishlist(book);
    if (ok) setWishlistIds(prev => new Set([...prev, book.id]));
  };

  // Pages à afficher : 3 avant + courante + 3 après
  const getPageNumbers = () => {
    const pages = [];
    const debut = Math.max(1, page - 3);
    const fin = page + (hasNextPage ? 3 : 0);
    for (let i = debut; i <= fin; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="catalogue-container">
      <header className="catalogue-header">
        <h1 className="catalogue-title">Notre Bibliothèque</h1>
        <form onSubmit={(e) => searchBooks(e, 1)} className="search-filter-form">
          <div className="search-bar-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Chercher un titre, un auteur..."
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
              <option value="juvenile">Jeunesse</option>
              <option value="history">Histoire</option>
              <option value="science">Science</option>
            </select>
            <button type="submit" className="search-button">Rechercher</button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Je parcours les étagères...</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map(book => (
              <div
                key={book.id}
                className="book-card"
              >
                <img
                  src={book.image}
                  alt={book.title}
                  onError={e => { e.target.closest('.book-card').style.display = 'none'; }}
                />
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                  <div className="book-footer">
                    <span className="book-price">{book.price} €</span>
                    <div className="book-btn-group">
                      <button
                        onClick={() => handleWishlist(book)}
                        className={`add-to-wishlist-btn ${wishlistIds.has(book.id) ? 'wishlisted' : ''}`}
                        title="Ajouter à la wishlist"
                      >
                        <Heart size={16} fill={wishlistIds.has(book.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => handleAjoutPanier(book)} className="cart-button">
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── PAGINATION DYNAMIQUE ── */}
          {(page > 1 || hasNextPage) && (
            <div className="pagination">
              <button
                className="page-btn page-nav"
                onClick={() => fetchPage(page - 1, genre, searchTerm)}
                disabled={page === 1}
              >
                <ChevronLeft size={18} />
              </button>

              {getPageNumbers().map(p => (
                <button
                  key={p}
                  className={`page-btn ${page === p ? 'active' : ''}`}
                  onClick={() => fetchPage(p, genre, searchTerm)}
                  disabled={p > page && !hasNextPage}
                >
                  {p}
                </button>
              ))}

              <button
                className="page-btn page-nav"
                onClick={() => fetchPage(page + 1, genre, searchTerm)}
                disabled={!hasNextPage}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}