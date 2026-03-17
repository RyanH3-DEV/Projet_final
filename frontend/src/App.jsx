import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import AdminDashboard from './pages/AdminDashboard';
import CookieBanner from './components/CookieBanner';
import SecurityBadge from './components/SecurityBadge';
import CGV from './components/CGV';
import CGU from './components/CGU';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { getCart, addToCart } from './api/cartApi';
import { useInactivityWatcher, InactivityModal } from './components/InactivityWatcher';
import { usePageTracking } from './hooks/usePageTracking';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Tracker() {
  const location = useLocation();
  usePageTracking(location.pathname);
  return null;
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/connexion" replace />;
  return children;
}

function AdminRoute({ user, children, requiredRole = 'ROLE_ADMIN' }) {
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.roles?.includes('ROLE_SUPER_ADMIN')) return children;
  if (!user.roles?.includes(requiredRole)) return <Navigate to="/" replace />;
  return children;
}

function lireUserDepuisStorage() {
  try {
    const token = localStorage.getItem('token');
    const userDataRaw = localStorage.getItem('userData');
    if (token && userDataRaw) return JSON.parse(userDataRaw);
  } catch {
    // En cas d'erreur de parsing, je nettoie pour éviter les crashs au démarrage
    localStorage.clear();
  }
  return null;
}

function App() {
  const [user, setUser] = useState(lireUserDepuisStorage);
  const [panier, setPanier] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const skipNextUserEffect = useRef(false);

  const rafraichirPanier = useCallback(async (email) => {
    const cible = email || localStorage.getItem('userEmail');
    if (!cible) return;
    try {
      const data = await getCart(cible);
      setPanier(data.items || []);
    } catch { setPanier([]); }
  }, []);

  const rafraichirWishlist = useCallback(async (email) => {
    const cible = email || localStorage.getItem('userEmail');
    if (!cible) return;
    try {
      const res = await fetch(`${BASE_URL}/api/profil/wishlist?email=${encodeURIComponent(cible)}`);
      const data = await res.json();
      setWishlist(data.items || []);
    } catch { setWishlist([]); }
  }, []);

  // Persistance au rafraîchissement : je recharge les données si l'utilisateur est présent
  useEffect(() => {
    const storedUser = lireUserDepuisStorage();
    if (storedUser) {
      rafraichirPanier(storedUser.email);
      rafraichirWishlist(storedUser.email);
    }
  }, [rafraichirPanier, rafraichirWishlist]);

  useEffect(() => {
    if (skipNextUserEffect.current) {
      skipNextUserEffect.current = false;
      return;
    }
    if (user) {
      rafraichirPanier(user.email);
      rafraichirWishlist(user.email);
    } else {
      setPanier([]);
      setWishlist([]);
    }
  }, [user, rafraichirPanier, rafraichirWishlist]);

  const connecterUtilisateur = useCallback((userData) => {
    localStorage.setItem('token', userData.token || '');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userData', JSON.stringify(userData));
    skipNextUserEffect.current = true;
    setUser(userData);
  }, []);

  const deconnexion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    setUser(null);
    setPanier([]);
    setWishlist([]);
    window.location.href = '/';
  }, []);

  const ajouterAuPanier = useCallback(async (service) => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    try {
      // Je m'assure d'envoyer les données SaaS (ID et durée par défaut)
      await addToCart({
        ...service,
        subscriptionDuration: service.subscriptionDuration || 'mensuel'
      });
      await rafraichirPanier(user.email);
    } catch (e) {
      console.error("Erreur ajout panier:", e);
    }
  }, [user, rafraichirPanier]);

  const ajouterAWishlist = useCallback(async (service) => {
    if (!user) return false;
    try {
      const res = await fetch(`${BASE_URL}/api/profil/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          serviceId: service.id, // J'utilise l'ID plutôt que le titre pour la base
        }),
      });
      if (res.ok) {
        rafraichirWishlist(user.email);
        return true;
      }
      return false;
    } catch { return false; }
  }, [user, rafraichirWishlist]);

  const { afficherModal, secondesRestantes, resterConnecte } =
    useInactivityWatcher(user, deconnexion);

  return (
    <Router>
      <Tracker />
      <Header user={user} onLogout={deconnexion} />

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/connexion" element={<Connexion setUser={connecterUtilisateur} />} />
          <Route path="/inscription" element={<Inscription />} />

          <Route path="/catalogue" element={<Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/catalogue/:categorie" element={<Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />

          <Route path="/informations" element={<Informations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/cgu" element={<CGU />} />

          <Route path="/panier" element={
            <ProtectedRoute user={user}>
              <Panier panier={panier} rafraichirPanier={rafraichirPanier} />
            </ProtectedRoute>
          } />

          <Route path="/profil" element={
            <ProtectedRoute user={user}>
              <MonProfil
                user={user} setUser={setUser}
                ajouterAuPanier={ajouterAuPanier}
                wishlist={wishlist} rafraichirWishlist={rafraichirWishlist}
              />
            </ProtectedRoute>
          } />

          <Route path="/superadmin" element={
            <AdminRoute user={user} requiredRole="ROLE_SUPER_ADMIN">
              <SuperAdminDashboard />
            </AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <SecurityBadge />
      <CookieBanner />

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