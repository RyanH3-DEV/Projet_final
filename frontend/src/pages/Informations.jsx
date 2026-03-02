import React from 'react';
import { BookOpen, ShieldCheck, Truck, RotateCcw, CreditCard, Mail, MapPin, Phone } from 'lucide-react';
import '../style_localisés/Informations.css';

function Informations() {
  return (
    <div className="info-container">

      <div className="info-hero">
        <h1>Informations</h1>
        <p>Tout ce que vous devez savoir sur CYNA BOOKS</p>
      </div>

      <div className="info-grid">

        {/* À propos */}
        <div className="info-card">
          <div className="info-card-icon"><BookOpen size={32} /></div>
          <h3>À propos de nous</h3>
          <p>CYNA BOOKS est une librairie en ligne passionnée par la littérature. Nous proposons une sélection soigneuse de romans, mangas, BD et livres jeunesse pour tous les profils de lecteurs.</p>
        </div>

        {/* Livraison */}
        <div className="info-card">
          <div className="info-card-icon"><Truck size={32} /></div>
          <h3>Livraison</h3>
          <p>Livraison standard sous <strong>3 à 5 jours ouvrés</strong>. Livraison express disponible sous 24h. Livraison gratuite à partir de <strong>35 €</strong> d'achat.</p>
        </div>

        {/* Retours */}
        <div className="info-card">
          <div className="info-card-icon"><RotateCcw size={32} /></div>
          <h3>Retours & Remboursements</h3>
          <p>Vous disposez de <strong>14 jours</strong> après réception pour retourner un article. Le remboursement est effectué sous 5 à 7 jours ouvrés après réception du retour.</p>
        </div>

        {/* Paiement */}
        <div className="info-card">
          <div className="info-card-icon"><CreditCard size={32} /></div>
          <h3>Paiement Sécurisé</h3>
          <p>Tous les paiements sont sécurisés par <strong>SSL</strong> et <strong>3D Secure</strong>. Nous acceptons Visa, Mastercard et PayPal. Vos données bancaires ne sont jamais stockées.</p>
        </div>

        {/* Sécurité */}
        <div className="info-card">
          <div className="info-card-icon"><ShieldCheck size={32} /></div>
          <h3>Confidentialité</h3>
          <p>Vos données personnelles sont protégées conformément au <strong>RGPD</strong>. Nous ne partageons jamais vos informations avec des tiers sans votre consentement.</p>
        </div>

        {/* Contact */}
        <div className="info-card">
          <div className="info-card-icon"><Mail size={32} /></div>
          <h3>Nous contacter</h3>
          <div className="info-contact-list">
            <p><Mail size={16} /> boubakeryahia27@gmail.com</p>
            <p><MapPin size={16} /> Courbevoie, Paris</p>
            <p><Phone size={16} /> Du lundi au vendredi, 9h - 18h</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Informations;