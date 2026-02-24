import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookOpen, ShoppingCart, Star, Library } from "lucide-react";

export default function Catalogue() {
  const { t } = useTranslation();
  const [activeGenre, setActiveGenre] = useState("roman");
  const [selectedBook, setSelectedBook] = useState(null);

  // Je remplace les entraînements par un catalogue de livres
  const books = [
    {
      id: 1,
      genre: "roman",
      title: "Les Misérables",
      author: "Victor Hugo",
      price: "15.90€",
      image: "/images/livres/les-miserables.jpg",
      description: "Une fresque historique et sociale du XIXe siècle français.",
      details: [
        { label: "Éditeur", value: "Hachette" },
        { label: "Pages", value: "1488" },
        { label: "Parution", value: "1862" }
      ]
    },
    {
      id: 2,
      genre: "manga",
      title: "One Piece Vol. 1",
      author: "Eiichiro Oda",
      price: "6.99€",
      image: "/images/livres/one-piece-1.jpg",
      description: "L'aventure commence pour Luffy, le garçon au chapeau de paille.",
      details: [
        { label: "Format", value: "Tankobon" },
        { label: "Série", value: "En cours" }
      ]
    }
  ];

  const filteredBooks = books.filter(book => book.genre === activeGenre);

  // Vue Détail du livre
  if (selectedBook) {
    return (
      <div className="catalog-wrapper">
        <button className="back-btn" onClick={() => setSelectedBook(null)}>
          <ArrowLeft size={18} /> {t('catalog.back')}
        </button>

        <header className="book-header">
          <h2>{selectedBook.title}</h2>
          <p className="book-author">Par {selectedBook.author}</p>
          <p className="book-desc">{selectedBook.description}</p>
          <button className="add-to-cart-btn">
            <ShoppingCart size={18} /> Ajouter au panier ({selectedBook.price})
          </button>
        </header>

        <div className="book-details-list">
          <h3>Informations techniques</h3>
          {selectedBook.details.map((detail, index) => (
            <div key={index} className="detail-item">
              <strong>{detail.label} :</strong> {detail.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vue Liste (Catalogue)
  return (
    <div className="catalog-wrapper">
      <header className="catalog-header">
        <h1><Library size={32} /> {t('catalog.title')}</h1>
        <p className="catalog-subtitle">Explorez notre sélection de livres.</p>
      </header>

      {/* Barre d'onglets pour les genres */}
      <div className="tabs-container">
        {["roman", "manga", "bd", "jeunesse"].map((genre) => (
          <button
            key={genre}
            className={activeGenre === genre ? "tab active-tab" : "tab"}
            onClick={() => setActiveGenre(genre)}
          >
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {filteredBooks.map((book) => (
          <div key={book.id} className="book-card">
            <div className="card-image" style={{ backgroundImage: `url(${book.image})` }}>
              <span className="card-price">{book.price}</span>
            </div>

            <div className="card-content">
              <h3 className="card-title">{book.title}</h3>
              <p className="card-author">{book.author}</p>

              <div className="card-actions">
                <button className="view-btn" onClick={() => setSelectedBook(book)}>
                  <BookOpen size={16} /> Voir les détails
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}