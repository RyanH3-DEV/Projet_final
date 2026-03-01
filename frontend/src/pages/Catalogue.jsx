// src/pages/Catalogue.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Loader } from "lucide-react";
import axios from "axios";
import { addToCart } from "../api/cartApi";
import '../style_localisés/Catalogue.css';

export default function Catalogue() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("fiction");

  const searchBooks = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const query = searchTerm ? `${searchTerm}+subject:${genre}` : `subject:${genre}`;
      const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=16&langRestrict=fr`);

      const formatted = res.data.items?.map(item => ({
        id: item.id,
        title: item.volumeInfo.title || "Titre inconnu",
        price: (item.volumeInfo.pageCount * 0.04 || 12.99).toFixed(2),
        image: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "https://via.placeholder.com/150",
        author: item.volumeInfo.authors?.[0] || "Auteur inconnu"
      })) || [];
      setBooks(formatted);
    } catch (err) {
      console.error("Je n'ai pas pu charger les livres", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { searchBooks(); }, [genre]);

  const handleAjoutPanier = async (book) => {
    try {
      // J'appelle l'API avec l'objet complet [cite: 2026-02-04]
      await addToCart(book);
      alert(`Je viens d'ajouter "${book.title}" à ton panier !`);
    } catch (error) {
      // Je redirige vers la connexion si l'utilisateur n'est pas identifié [cite: 2026-02-28]
      alert("Je te suggère de te connecter pour gérer ton panier permanent.");
    }
  };

  return (
    <div className="catalogue-container">
      <header className="catalogue-header">
        <h1 className="catalogue-title">Notre Bibliothèque</h1>
        <form onSubmit={searchBooks} className="search-filter-form">
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
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="filter-select">
              <option value="fiction">Romans & Fiction</option>
              <option value="comics">Mangas & BD</option>
              <option value="history">Histoire</option>
              <option value="science">Science</option>
            </select>
            <button type="submit" className="search-button">Rechercher</button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="loading-container"><Loader className="spinner" size={48} /><p>Je parcours les étagères...</p></div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book.id} className="book-card">
              <img src={book.image} alt={book.title} />
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <div className="book-footer">
                  <span className="book-price">{book.price} €</span>
                  <button onClick={() => handleAjoutPanier(book)} className="cart-button">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}