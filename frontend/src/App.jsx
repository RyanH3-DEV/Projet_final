import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Chatbot from './components/Chatbot';
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
import MentionsLegales from './components/MentionsLegales';

import ProductDetail from './pages/ProductDetail';

import CookieBanner from './components/CookieBanner';
import SecurityBadge from './components/SecurityBadge';
import CGV from './components/CGV';
import CGU from './components/CGU';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ConfirmationEmail from './pages/ConfirmationEmail';
import Desabonnement from './pages/Desabonnement';
import { getCart, addToCart } from './api/cartApi';
import { useInactivityWatcher, InactivityModal } from './components/InactivityWatcher';
import { usePageTracking } from './hooks/usePageTracking';
import { mergeGuestCartOnLogin } from './utils/mergeGuestCart';
import { useContent } from './context/ContentContext';

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userDataRaw = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (token && userDataRaw) return JSON.parse(userDataRaw);
  } catch {
    localStorage.clear();
    sessionStorage.clear();
  }
  return null;
}

function AppContent() {
  const navigate = useNavigate();
  const { contents } = useContent();

  const [user, setUser]         = useState(lireUserDepuisStorage);
  const [panier, setPanier]     = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const skipNextUserEffect      = useRef(false);

  useEffect(() => {
    if (contents?.favicon?.image) {
      const cleanedPath = contents.favicon.image.replace('http://127.0.0.1:8000', '');
      const rawUrl = cleanedPath.startsWith('http')
          ? cleanedPath
          : `${BASE_URL}${cleanedPath}`;

      const faviconUrl = `${rawUrl}?t=${new Date().getTime()}`;

      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      link.href = faviconUrl;

      if (cleanedPath.match(/\.(jpe?g)$/i)) {
        link.type = 'image/jpeg';
      } else {
        link.type = 'image/png';
      }
    }
  }, [contents]);

  const rafraichirPanier = useCallback(async (email) => {
    const cible = email || localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (!cible) return;
    try {
      const data = await getCart(cible);
      setPanier(data.items || []);
    } catch {
      setPanier([]);
    }
  }, []);

  const rafraichirWishlist = useCallback(async (email) => {
    const cible = email || localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (!cible) return;
    try {
      const res  = await fetch(`${BASE_URL}/api/profil/wishlist?email=${encodeURIComponent(cible)}`);
      const data = await res.json();
      setWishlist(data.items || []);
    } catch {
      setWishlist([]);
    }
  }, []);

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

  const connecterUtilisateur = useCallback(async (userData, resterConnecte = true) => {
    const storage = resterConnecte ? localStorage : sessionStorage;
    const autre = resterConnecte ? sessionStorage : localStorage;

    autre.removeItem('token');
    autre.removeItem('userData');
    autre.removeItem('userEmail');

    storage.setItem('token', userData.token || '');
    storage.setItem('userEmail', userData.email);
    storage.setItem('userData', JSON.stringify(userData));
    skipNextUserEffect.current = true;
    setUser(userData);
    await mergeGuestCartOnLogin(userData.email, () => rafraichirPanier(userData.email));
  }, [rafraichirPanier]);

  const deconnexion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('userEmail');
    setUser(null);
    setPanier([]);
    setWishlist([]);
    window.location.href = '/';
  }, []);

  const ajouterAuPanier = useCallback(async (service) => {
    try {
      await addToCart({
        ...service,
        subscriptionDuration: service.subscriptionDuration || 'mensuel',
      });
      if (user) await rafraichirPanier(user.email);
    } catch (e) {
      console.error('Erreur ajout panier:', e);
    }
  }, [user, rafraichirPanier]);

  const ajouterAWishlist = useCallback(async (service) => {
    if (!user) return false;
    try {
      const res = await fetch(`${BASE_URL}/api/profil/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, serviceId: service.id }),
      });
      if (res.ok) { rafraichirWishlist(user.email); return true; }
      return false;
    } catch {
      return false;
    }
  }, [user, rafraichirWishlist]);

  const { afficherModal, secondesRestantes, resterConnecte } =
    useInactivityWatcher(user, deconnexion);

  return (
    <>
      <Tracker />
      <Header user={user} onLogout={deconnexion} />

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/"            element={<Home ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/connexion"   element={<Connexion setUser={connecterUtilisateur} />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/confirmation" element={<ConfirmationEmail setUser={connecterUtilisateur} />} />
          <Route path="/informations" element={<Informations />} />
          <Route path="/contact"     element={<Contact />} />
          <Route path="/cgv"         element={<CGV />} />
          <Route path="/cgu"         element={<CGU />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/desabonnement" element={<Desabonnement />} />

          <Route path="/catalogue"            element={<Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />
          <Route path="/catalogue/:categorie" element={<Catalogue ajouterAuPanier={ajouterAuPanier} ajouterAWishlist={ajouterAWishlist} />} />

          <Route path="/produit/:id"          element={<ProductDetail ajouterAuPanier={ajouterAuPanier} />} />

          <Route path="/panier" element={
            <Panier
              panier={panier}
              rafraichirPanier={rafraichirPanier}
              onLoginRedirect={() => navigate('/connexion')}
            />
          } />

          <Route path="/profil" element={
            <ProtectedRoute user={user}>
              <MonProfil
                user={user}
                setUser={setUser}
                ajouterAuPanier={ajouterAuPanier}
                wishlist={wishlist}
                rafraichirWishlist={rafraichirWishlist}
              />
            </ProtectedRoute>
          } />

          <Route path="/superadmin" element={
            <AdminRoute user={user} requiredRole="ROLE_SUPER_ADMIN">
              <SuperAdminDashboard />
            </AdminRoute>
          } />
            <Route path="/admin" element={
              <AdminRoute user={user} requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </AdminRoute>
            } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <SecurityBadge />
      <CookieBanner />
      <Chatbot />
      {afficherModal && (
        <InactivityModal
          secondesRestantes={secondesRestantes}
          onRester={resterConnecte}
          onDeconnecter={deconnexion}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;