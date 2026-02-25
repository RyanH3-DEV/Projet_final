import React, { useState } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import Contact from './pages/Contact';
import Panier from './pages/Panier';
import Paiement from './pages/Paiement';
import CGV from './components/CGV';
import CGU from './components/CGU';

function App() {
  // ... (le début du fichier avec pageInitiale reste le même)
  const pageInitiale = () => {
    const chemin = window.location.pathname;
    if (chemin === '/reinitialiser-mot-de-passe') return 'reset-password';
    if (chemin === '/cgv') return 'cgv';
    if (chemin === '/cgu') return 'cgu';
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(pageInitiale());
  const [user, setUser] = useState(null);

  // État global du panier
  const [panier, setPanier] = useState([]);
  const [categorieInitiale, setCategorieInitiale] = useState('fiction');

  const naviguer = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', '/');
  };

  const naviguerVersCatalogue = (categorie = 'fiction') => {
    setCategorieInitiale(categorie);
    naviguer('catalogue');
  };

  // LA FONCTION CLÉ POUR AJOUTER AU PANIER
  const ajouterAuPanier = (livre) => {
    const livreExistant = panier.find(item => item.id === livre.id);

    if (livreExistant) {
      // Si le livre existe déjà, on augmente la quantité
      setPanier(panier.map(item =>
        item.id === livre.id ? { ...item, quantite: item.quantite + 1 } : item
      ));
    } else {
      // Sinon, on l'ajoute. On s'assure que le prix est bien un nombre.
      // Le prix arrive sous forme de chaîne "12.99", on le convertit en nombre float.
      const prixNumerique = parseFloat(livre.price);
      setPanier([...panier, { ...livre, prix: prixNumerique, quantite: 1 }]);
    }
    // Petite confirmation visuelle pour l'utilisateur
    alert(`"${livre.title}" a été ajouté à votre panier.`);
  };

  return (
    <div className="app-layout">
      {/* On passe la longueur du panier au Header pour le petit badge */}
      <Header setCurrentPage={naviguer} user={user} panierCount={panier.length} />

      <main className="main-content">
        {currentPage === 'home' && (
          <Home
            naviguerVersCatalogue={naviguerVersCatalogue}
            ajouterAuPanier={ajouterAuPanier}
          />
        )}

        {currentPage === 'catalogue' && (
          <Catalogue
            categorieInitiale={categorieInitiale}
            ajouterAuPanier={ajouterAuPanier}
          />
        )}

        {/* ... les autres pages ... */}
        {currentPage === 'connexion' && <Connexion setCurrentPage={naviguer} setUser={setUser} />}
        {currentPage === 'inscription' && <Inscription setCurrentPage={naviguer} setUser={setUser} />}
        {currentPage === 'reset-password' && <ReinitialiserMotDePasse setCurrentPage={naviguer} />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'cgv' && <CGV />}
        {currentPage === 'cgu' && <CGU />}

        {currentPage === 'panier' && (
          <Panier
            panier={panier}
            setPanier={setPanier}
            setCurrentPage={naviguer}
          />
        )}

        {currentPage === 'paiement' && <Paiement setCurrentPage={naviguer} user={user} />}
      </main>
      <Footer setCurrentPage={naviguer} />
    </div>
  );
}

export default App;