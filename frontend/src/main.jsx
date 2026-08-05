import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';

// J'importe les Contextes
import { ContentProvider } from './context/ContentContext.jsx';
import { CartProvider } from './context/CartContext.jsx'; // <-- Nouveau

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <CartProvider> {/* <-- J'ajoute le Provider du panier ici */}
        <App />
      </CartProvider>
    </ContentProvider>
  </StrictMode>,
);