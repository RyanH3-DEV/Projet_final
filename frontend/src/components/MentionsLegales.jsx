import React from 'react';
import '../style_localisés/CGU.css';

function MentionsLegales() {
  return (
    <div className="cgu-page">
      <div className="cgu-container">
        <h1>Mentions légales</h1>

        <section className="cgu-section">
          <h2>1. Éditeur du site</h2>
          <p>
            <strong>Cyna</strong><br />
            Plateforme de cybersécurité SaaS<br />
            Adresse : [À compléter]<br />
            RCS : [À compléter]<br />
            Email : contact@cyna-it.fr
          </p>
        </section>

        <section className="cgu-section">
          <h2>2. Directeur de la publication</h2>
          <p>
            Le directeur de la publication du site est le représentant légal de la société Cyna.
          </p>
        </section>

        <section className="cgu-section">
          <h2>3. Hébergement</h2>
          <p>
            Le site est hébergé par : [Nom de l'hébergeur]<br />
            Adresse : [Adresse de l'hébergeur]
          </p>
        </section>

        <section className="cgu-section">
          <h2>4. Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, logos, icônes, structure) est la propriété exclusive
            de Cyna ou de ses partenaires, sauf mention contraire. Toute reproduction, représentation, modification,
            publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé
            utilisé, est interdite sans autorisation écrite préalable.
          </p>
        </section>

        <section className="cgu-section">
          <h2>5. Données personnelles</h2>
          <p>
            Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à la gestion
            des comptes clients et des abonnements aux services proposés. Conformément à la loi « Informatique et
            Libertés » et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès,
            de rectification, de suppression et d'opposition aux données vous concernant.
          </p>
          <p>
            Pour exercer ces droits, vous pouvez nous contacter à l'adresse : contact@cyna-it.fr
          </p>
        </section>

        <section className="cgu-section">
          <h2>6. Cookies</h2>
          <p>
            Ce site utilise des cookies afin d'améliorer l'expérience utilisateur et de sécuriser les paiements.
            Vous pouvez à tout moment gérer vos préférences de cookies via le bandeau prévu à cet effet.
          </p>
        </section>

        <section className="cgu-section">
          <h2>7. Limitation de responsabilité</h2>
          <p>
            Cyna s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations
            diffusées sur ce site. Cyna ne saurait être tenu responsable des erreurs, d'une absence de disponibilité
            des informations, ou de la présence de virus sur son site.
          </p>
        </section>

        <section className="cgu-section">
          <h2>8. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut d'accord
            amiable, le litige sera porté devant les tribunaux français compétents.
          </p>
        </section>
      </div>
    </div>
  );
}

export default MentionsLegales;