import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from './layout/Header';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Home from './pages/Home';
import Panier from './pages/Panier';
import Footer from './layout/Footer';
import Informations from './pages/Informations';
import Contact from './pages/Contact';
import MonProfil from './pages/MonProfil';
import Catalogue from './pages/Catalogue';

import CGV from './components/CGV';
import CGU from './components/CGU';

import { getCart, addToCart } from './api/cartApi';
import { useInactivityWatcher, InactivityModal } from './components/InactivityWatcher';

function PageManager({ currentPage, setCurrentPage, user, setUser, panier, rafraichirPanier, ajouterAuPanier, ajouterAWishlist, wishlist, rafraichirWishlist }) {
  const location = useLocation();
  if (location.pathname === "/cgv" || location.pathname === "/cgu") return null;

  return (
    <>
      {currentPage === 'home' && (
        <Home ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} naviguerVersCatalogue={setCurrentPage} />
      )}
      {currentPage === 'connexion' && (
        <Connexion setUser={setUser} setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'inscription' && (
        <Inscription setCurrentPage={setCurrentPage} />
      )}
      {(currentPage === 'fiction' || currentPage === 'comics' || currentPage === 'juvenile' || currentPage === 'history' || currentPage === 'science' || currentPage === 'catalogue') && (
        <Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} genre={currentPage} />
      )}
      {currentPage === 'info' && <Informations />}
      {currentPage === 'contact' && <Contact />}
      {currentPage === 'profil' && user && (
        <MonProfil
          user={user}
          setUser={setUser}
          ajouterAuPanier={ajouterAuPanier}
          wishlist={wishlist}
          rafraichirWishlist={rafraichirWishlist}
        />
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
  const [wishlist, setWishlist] = useState([]);
  const vientDeSeConnecter = useRef(false);

  const rafraichirWishlist = useCallback(async (emailOverride = null) => {
    try {
      const email = emailOverride || localStorage.getItem('userEmail');
      if (!email) return;
      const res = await fetch(`http://127.0.0.1:8000/api/profil/wishlist?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setWishlist(data.items || []);
    } catch { setWishlist([]); }
  }, []);

  const rafraichirPanier = useCallback(async (emailOverride = null) => {
    try {
      const email = emailOverride || localStorage.getItem('userEmail');
      if (!email) return;
      const data = await getCart(email);
      setPanier(data.items || []);
    } catch { setPanier([]); }
  }, []);

  // ✅ Restaure la session au refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const userDataRaw = localStorage.getItem('userData');
    if (token && email && userDataRaw) {
      try {
        const userData = JSON.parse(userDataRaw);
        vientDeSeConnecter.current = true;
        setUser(userData);
        rafraichirPanier(email);
        rafraichirWishlist(email);
      } catch {}
    }
  }, [rafraichirPanier, rafraichirWishlist]);

  useEffect(() => {
    if (user) {
      if (!vientDeSeConnecter.current) {
        rafraichirPanier(user.email);
        rafraichirWishlist(user.email);
      }
      vientDeSeConnecter.current = false;
    } else {
      setPanier([]);
      setWishlist([]);
    }
  }, [user, rafraichirPanier, rafraichirWishlist]);

  const connecterUtilisateur = useCallback((userData) => {
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userData', JSON.stringify(userData));
    vientDeSeConnecter.current = true;
    setUser(userData);
    rafraichirPanier(userData.email);
    rafraichirWishlist(userData.email);
  }, [rafraichirPanier, rafraichirWishlist]);

  const ajouterAuPanier = useCallback(async (livre) => {
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
  }, [user, rafraichirPanier]);

  const ajouterAWishlist = useCallback(async (livre) => {
    if (!user) {
      alert("Tu dois être connecté pour ajouter à la wishlist.");
      setCurrentPage('connexion');
      return false;
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profil/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          title: livre.title,
          price: parseFloat(livre.price),
          image: livre.image,
        }),
      });
      if (res.ok || res.status === 200) {
        rafraichirWishlist(user.email);
        alert(livre.title + " ajouté à ta wishlist !");
        return true;
      }
      return false;
    } catch {
      alert("Erreur lors de l'ajout à la wishlist.");
      return false;
    }
  }, [user, rafraichirWishlist]);

  const deconnexion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setPanier([]);
    setWishlist([]);
    setCurrentPage('home');
  }, []);

  const { afficherModal, secondesRestantes, resterConnecte } = useInactivityWatcher(user, deconnexion);

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
          ajouterAWishlist={ajouterAWishlist}
          wishlist={wishlist}
          rafraichirWishlist={rafraichirWishlist}
        />
      </main>
      <Footer setCurrentPage={setCurrentPage} />
      {afficherModal && (
        <InactivityModal
          secondesRestantes={secondesRestantes}
          onRester={resterConnecte}
          onDeconnecter={deconnexion}
        />
      )}
    </Router>
  );
}

export default App;