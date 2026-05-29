import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Filter, Loader2, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useContent } from '../context/ContentContext';
import '../style_localisés/Catalogue.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api";

const cleanText = (html) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : null;

const MOCK_SERVICES = [
  { id: 1, name: "CrowdStrike Falcon", category: "edr", price: 149.99, image: null },
  { id: 2, name: "Microsoft Defender XDR", category: "xdr", price: 199.00, image: null },
  { id: 3, name: "Splunk Enterprise Security", category: "soc", price: 299.00, image: null },
  { id: 4, name: "SentinelOne Singularity", category: "edr", price: 129.00, image: null },
  { id: 5, name: "Palo Alto Cortex XDR", category: "xdr", price: 249.00, image: null },
  { id: 6, name: "Elastic SIEM", category: "soc", price: 89.00, image: null },
];

export default function Catalogue({ ajouterAuPanier }) {
  const { t } = useTranslation();
  const { categorie: catParam } = useParams();
  const navigate = useNavigate();
  const { contents } = useContent();

  // Je regroupe toutes mes déclarations d'états en haut pour éviter les erreurs d'initialisation
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(catParam || 'tous');
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("priority");

  // Je gère le délai (debounce) pour la barre de recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Je déclenche la récupération des données dès qu'un filtre change
  useEffect(() => {
    fetchItems(activeCategory, debouncedSearchTerm);
  }, [activeCategory, debouncedSearchTerm, minPrice, maxPrice, sortBy]);

  // 1. Je mets à jour la fonction de filtrage fictive (Mock)
    const applyMockFilter = (cat, search, min, max) => {
      let list = MOCK_SERVICES;

      if (cat && cat !== 'tous') {
        list = list.filter(s => s.category === cat);
      }

      if (search) {
        list = list.filter(s =>
          s.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filtrage par prix dans le Mock
      if (min !== "") {
        list = list.filter(s => s.price >= parseFloat(min));
      }
      if (max !== "") {
        list = list.filter(s => s.price <= parseFloat(max));
      }

      return list;
    };

    // 2. Je mets à jour l'appel dans fetchItems pour lui passer les prix
    const fetchItems = async (cat, search) => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/services`, {
          params: {
            categorie: cat !== 'tous' ? cat : null,
            search: search || null,
            minPrice: minPrice !== "" ? minPrice : null,
            maxPrice: maxPrice !== "" ? maxPrice : null,
            sortBy: sortBy
          }
        });

        if (response.data && response.data.length > 0) {
          setItems(response.data);
        } else {
          // J'ajoute minPrice et maxPrice ici
          setItems(applyMockFilter(cat, search, minPrice, maxPrice));
        }
      } catch (err) {
        console.error(t('catalogue.error_fetch'), err);
        setItems(applyMockFilter(cat, search, minPrice, maxPrice));
      } finally {
        setLoading(false);
      }
    };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(activeCategory, searchTerm);
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setActiveCategory(newCat);
    navigate(`/catalogue/${newCat}`);
  };

  const handleAddToCart = (item) => {
    if (ajouterAuPanier) {
      ajouterAuPanier({ ...item, quantity: 1, subscriptionDuration: 'mensuel' });
    } else {
      alert(t('catalogue.error_cart'));
    }
  };

  const uniqueCategories = ['tous', 'edr', 'xdr', 'soc', 'siem'];

  return (
    <div className="catalogue-container">

      <header className="catalogue-header">
        <h1
          className="catalogue-title"
          dangerouslySetInnerHTML={{ __html: contents.catalogue_title?.text || t('catalogue.title') }}
        />
      </header>

      <form onSubmit={handleSearch} className="search-filter-form">
        <div className="search-bar-container">
          <div className="search-icon-wrapper">
            <Search size={20} />
          </div>
          <input
            className="search-input"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={cleanText(contents.catalogue_search_placeholder?.text) || t('catalogue.search_placeholder')}
          />
        </div>

        <div className="filter-group">
            <Filter size={20} className="filter-icon" />
            <select
              className="filter-select"
              value={activeCategory}
              onChange={handleCategoryChange}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'tous' ? t('catalogue.all_categories') : cat.toUpperCase()}
                </option>
              ))}
            </select>

            <input
                type="number"
                placeholder="Prix min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-input"
            />
            <input
                type="number"
                placeholder="Prix max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
            />

            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priority">Recommandé</option>
                <option value="newest">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
            </select>
        </div>

        <button type="submit" className="search-button">
          {cleanText(contents.catalogue_filter_btn?.text) || t('catalogue.filter_btn')}
        </button>
      </form>

      {loading ? (
        <div className="loading-container">
          <Loader2 className="spinner" size={40} />
          <p>{t('catalogue.loading')}</p>
        </div>
      ) : items.length > 0 ? (
        <div className="books-grid">
          {items.map(item => (
            <div key={item.id} className="book-card">
              <Link to={`/produit/${item.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div className="book-image-container">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="book-image" />
                  ) : (
                    <ShieldCheck size={80} style={{ color: '#e0e0e0', opacity: 0.5 }} />
                  )}
                </div>
              </Link>

              <div className="book-info">
                <Link to={`/produit/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className="book-title">{item.name}</h3>
                </Link>
                <p className="book-author" style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                  {item.category || t('catalogue.default_category')}
                </p>

                <div className="book-footer">
                  <span className="book-price">
                    {Number(item.price).toFixed(2)} € <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#666' }}>{t('catalogue.per_month')}</span>
                  </span>
                  <button
                    className="cart-button"
                    onClick={() => handleAddToCart(item)}
                    title={t('catalogue.subscribe_title')}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>

                <Link to={`/produit/${item.id}`} style={{ display: 'block', textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
                  Voir les détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>{t('catalogue.no_results')}</p>
        </div>
      )}

    </div>
  );
}