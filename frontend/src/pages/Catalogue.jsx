import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Search, Filter, ShoppingCart, Loader, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { addToCart } from "../api/cartApi";
import '../style_localisés/Catalogue.css';

const BOOKS_PER_PAGE = 16;

const getCoverUrl = (coverId) =>
  `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;

export default function Catalogue({ ajouterAuPanier, ajouterAWishlist }) {
  const { t } = useTranslation();
  const { genre: genreParam } = useParams();
  const navigate              = useNavigate();

  const GENRES = {
    fiction:  { label: t('genres.fiction', 'Romans & Fiction'), subject: 'fiction' },
    comics:   { label: t('genres.comics', 'Mangas & BD'),       subject: 'comics' },
    juvenile: { label: t('genres.juvenile', 'Jeunesse'),        subject: 'juvenile_fiction' },
    history:  { label: t('genres.history', 'Histoire'),         subject: 'history' },
    science:  { label: t('genres.science', 'Science'),          subject: 'science' },
  };

  const [books, setBooks]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre]           = useState(
    Object.keys(GENRES).includes(genreParam) ? genreParam : 'fiction'
  );
  const [page, setPage]             = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    const g = Object.keys(GENRES).includes(genreParam) ? genreParam : 'fiction';
    setGenre(g);
    setPage(1);
    setSearchTerm("");
    fetchPage(1, g, "");
  }, [genreParam, t]);

  const handleGenreChange = (newGenre) => {
    navigate(`/catalogue/${newGenre}`);
  };

  const fetchPage = async (nouvellePage, currentGenre, currentSearch) => {
    setLoading(true);
    try {
      const offset  = (nouvellePage - 1) * BOOKS_PER_PAGE;
      const subject = GENRES[currentGenre]?.subject || 'fiction';
      const url = currentSearch
        ? `https://openlibrary.org/search.json?q=${encodeURIComponent(currentSearch)}&subject=${subject}&limit=${BOOKS_PER_PAGE}&offset=${offset}&fields=key,title,author_name,cover_i,number_of_pages_median`
        : `https://openlibrary.org/search.json?subject=${subject}&limit=${BOOKS_PER_PAGE}&offset=${offset}&fields=key,title,author_name,cover_i,number_of_pages_median`;

      const res  = await axios.get(url);
      const docs = res.data.docs || [];

      const formatted = docs
        .filter(doc => doc.cover_i)
        .map(doc => ({
          id:     doc.key,
          title:  doc.title || t('book.unknown_title', 'Titre inconnu'),
          author: doc.author_name?.[0] || t('book.unknown_author', 'Auteur inconnu'),
          price:  doc.number_of_pages_median
            ? (doc.number_of_pages_median * 0.04).toFixed(2)
            : (Math.floor(Math.random() * 10) + 8).toFixed(2),
          image:  getCoverUrl(doc.cover_i),
        }));

      if (formatted.length === 0) return;

      setBooks(formatted);
      setPage(nouvellePage);
      setHasNextPage(res.data.numFound > offset + BOOKS_PER_PAGE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erreur Open Library', err);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = (e, nouvellePage = 1) => {
    if (e) e.preventDefault();
    fetchPage(nouvellePage, genre, searchTerm);
  };

  const handleAjoutPanier = (book) => {
    if (ajouterAuPanier) ajouterAuPanier(book);
    else alert(t('alerts.login_required_cart', "Connecte-toi pour gérer ton panier."));
  };

  const handleWishlist = async (book) => {
    if (!ajouterAWishlist) return;
    const ok = await ajouterAWishlist(book);
    if (ok) setWishlistIds(prev => new Set([...prev, book.id]));
  };

  const getPageNumbers = () => {
    const pages = [];
    const debut = Math.max(1, page - 3);
    const fin   = page + (hasNextPage ? 3 : 0);
    for (let i = debut; i <= fin; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="catalogue-container">
      <header className="catalogue-header">
        <h1 className="catalogue-title">{t('catalogue.title', 'Notre Bibliothèque')}</h1>
        <form onSubmit={(e) => searchBooks(e, 1)} className="search-filter-form">
          <div className="search-bar-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('catalogue.search_placeholder', 'Chercher un titre, un auteur...')}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={20} className="filter-icon" />
            <select value={genre} onChange={(e) => handleGenreChange(e.target.value)} className="filter-select">
              {Object.entries(GENRES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <button type="submit" className="search-button">{t('catalogue.search_btn', 'Rechercher')}</button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>{t('catalogue.loading', 'Je parcours les étagères...')}</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className="book-card">
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
                        title={t('book.add_to_wishlist', 'Ajouter à la wishlist')}
                      >
                        <Heart size={16} fill={wishlistIds.has(book.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => handleAjoutPanier(book)} className="cart-button" title={t('book.add_to_cart', 'Ajouter au panier')}>
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(page > 1 || hasNextPage) && (
            <div className="pagination">
              <button className="page-btn page-nav" onClick={() => fetchPage(page - 1, genre, searchTerm)} disabled={page === 1}>
                <ChevronLeft size={18} />
              </button>
              {getPageNumbers().map(p => (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => fetchPage(p, genre, searchTerm)}>
                  {p}
                </button>
              ))}
              <button className="page-btn page-nav" onClick={() => fetchPage(page + 1, genre, searchTerm)} disabled={!hasNextPage}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}