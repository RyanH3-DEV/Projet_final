import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from './layout/Header';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Home from './pages/Home';
import Panier from './pages/Panier';
import Footer from './layout/Footer';

import CGV from './components/CGV';
import CGU from './components/CGU';

import { getCart, addToCart } from './api/cartApi';

function PageManager({ currentPage, setCurrentPage, user, setUser, panier, rafraichirPanier, ajouterAuPanier }) {
  const location = useLocation();

  if (location.pathname === "/cgv" || location.pathname === "/cgu") return null;

  return (
    <>
      {currentPage === 'home' && (
        <Home ajouterAuPanier={ajouterAuPanier} naviguerVersCatalogue={setCurrentPage} />
      )}
      {currentPage === 'connexion' && (
        <Connexion setUser={setUser} setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'inscription' && (
        <Inscription setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'panier' && user && (
        <Panier panier={panier} setCurrentPage={setCurrentPage} rafraichirPanier={rafraichirPanier} />
      )}
      {currentPage === 'panier' && !user && (
        <Connexion setUser={setUser} setCurrentPage={setCurrentPage} />
      )}
    </>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [panier, setPanier] = useState([]);

  // ✅ Ce ref évite que le useEffect vide le panier après connexion
  const vientDeSeConnecter = useRef(false);

  const rafraichirPanier = useCallback(async (emailOverride = null) => {
    try {
      const email = emailOverride || localStorage.getItem('userEmail');
      if (!email) return;
      const data = await getCart(email);
      setPanier(data.items || []);
    } catch (error) {
      console.error("Erreur de récupération du panier", error);
      setPanier([]);
    }
  }, []);

  // ✅ useEffect surveillé : on ne vide le panier QUE si ce n'est pas
  // une connexion fraîche (le panier est déjà chargé dans connecterUtilisateur)
  useEffect(() => {
    if (user) {
      if (!vientDeSeConnecter.current) {
        // Reconnexion normale via useEffect
        rafraichirPanier(user.email);
      }
      // Reset le flag après usage
      vientDeSeConnecter.current = false;
    } else {
      setPanier([]);
    }
  }, [user, rafraichirPanier]);

  const ajouterAuPanier = async (livre) => {
    if (!user) {
      alert("Tu dois être connecté pour ajouter un livre au panier.");
      setCurrentPage('connexion');
      return;
    }
    try {
      await addToCart(livre);
      await rafraichirPanier(user.email);
      alert(`"${livre.title}" a été ajouté à ton panier !`);
    } catch (error) {
      alert("Erreur lors de l'ajout au panier : " + error.message);
    }
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPanier([]);
    setCurrentPage('home');
  };

  const connecterUtilisateur = (userData) => {
    localStorage.setItem('userEmail', userData.email);

    // ✅ On connecte l'utilisateur IMMÉDIATEMENT — pas de latence
    vientDeSeConnecter.current = true;
    setUser(userData);

    // ✅ Le panier se charge en arrière-plan sans bloquer la navigation
    getCart(userData.email)
      .then(data => setPanier(data.items || []))
      .catch(() => setPanier([]));
  };

  return (
    <Router>
      <Header user={user} setCurrentPage={setCurrentPage} onLogout={deconnexion} />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/cgv" element={<CGV />} />
          <Route path="/cgu" element={<CGU />} />
        </Routes>
        <PageManager
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          setUser={connecterUtilisateur}
          panier={panier}
          rafraichirPanier={rafraichirPanier}
          ajouterAuPanier={ajouterAuPanier}
        />
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </Router>
  );
}

export default App;