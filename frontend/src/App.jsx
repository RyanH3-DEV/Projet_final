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

// ── Tracker automatique ──────────────────────────────────
// Doit être DANS <Router> pour avoir accès à useLocation
function Tracker() {
  const location = useLocation();
  usePageTracking(location.pathname);
  return null;
}

// ── Routes protégées ─────────────────────────────────────
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

// ── Lecture synchrone du localStorage ───────────────────
function lireUserDepuisStorage() {
  try {
    const token       = localStorage.getItem('token');
    const userDataRaw = localStorage.getItem('userData');
    if (token && userDataRaw) return JSON.parse(userDataRaw);
  } catch {}
  return null;
}

function App() {
  const [user,     setUser]    = useState(lireUserDepuisStorage);
  const [panier,   setPanier]  = useState([]);
  const [wishlist, setWishlist]= useState([]);
  const skipNextUserEffect     = useRef(false);

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
      const res  = await fetch(`${BASE_URL}/api/profil/wishlist?email=${encodeURIComponent(cible)}`);
      const data = await res.json();
      setWishlist(data.items || []);
    } catch { setWishlist([]); }
  }, []);

  // Chargement initial au montage
  useEffect(() => {
    if (user) {
      const email = localStorage.getItem('userEmail') || user.email;
      rafraichirPanier(email);
      rafraichirWishlist(email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quand user change (connexion / déconnexion)
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
    localStorage.setItem('token',     userData.token || '');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userData',  JSON.stringify(userData));
    skipNextUserEffect.current = true;
    setUser(userData);
    rafraichirPanier(userData.email);
    rafraichirWishlist(userData.email);
  }, [rafraichirPanier, rafraichirWishlist]);

  const deconnexion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    setUser(null);
    setPanier([]);
    setWishlist([]);
    window.location.href = '/';
  }, []);

  const ajouterAuPanier = useCallback(async (livre) => {
    if (!user) {
      alert("Connecte-toi pour ajouter au panier.");
      window.location.href = '/connexion';
      return;
    }
    try {
      await addToCart(livre);
      await rafraichirPanier(user.email);
      alert(`${livre.title} ajouté au panier !`);
    } catch (e) { alert("Erreur : " + e.message); }
  }, [user, rafraichirPanier]);

  const ajouterAWishlist = useCallback(async (livre) => {
    if (!user) {
      alert("Connecte-toi pour ajouter à la wishlist.");
      window.location.href = '/connexion';
      return false;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/profil/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          title: livre.title,
          price: parseFloat(livre.price),
          image: livre.image,
        }),
      });
      if (res.ok) {
        rafraichirWishlist(user.email);
        alert(`${livre.title} ajouté à la wishlist !`);
        return true;
      }
      return false;
    } catch { alert("Erreur wishlist."); return false; }
  }, [user, rafraichirWishlist]);

  const { afficherModal, secondesRestantes, resterConnecte } =
    useInactivityWatcher(user, deconnexion);

  return (
    <Router>
      {/* Tracker automatique — se déclenche à chaque changement de page */}
      <Tracker />

      <Header user={user} onLogout={deconnexion} />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/"                 element={<Home      ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/connexion"        element={<Connexion setUser={connecterUtilisateur} />} />
          <Route path="/inscription"      element={<Inscription />} />
          <Route path="/catalogue"        element={<Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/catalogue/:genre" element={<Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/informations"     element={<Informations />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/cgv"              element={<CGV />} />
          <Route path="/cgu"              element={<CGU />} />

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
          <Route path="/admin" element={
            <AdminRoute user={user}>
              <AdminDashboard />
            </AdminRoute>
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