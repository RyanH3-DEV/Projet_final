import React from 'react';
import '../style_localisés/CGV.css';

function CGV() {
  return (
    <div className="cgv-page">
      <div className="cgv-container">
        <h1>CONDITIONS GÉNÉRALES DE VENTE (CGV)</h1>
        <p className="subtitle">(Version juridique – conformité droit français et européen)</p>

        <section className="cgv-section">
          <h2>Article 1 – Identification du vendeur</h2>
          <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») sont conclues entre :</p>
          <p>
            <strong>[Nom de l’entreprise]</strong><br />
            [Forme juridique]<br />
            Siège social : [adresse complète]<br />
            Immatriculée au RCS de [ville] sous le numéro [RCS/SIRET]<br />
            Numéro de TVA intracommunautaire : [à compléter]<br />
            Adresse électronique : [email]
          </p>
          <p>Ci-après dénommé « le Vendeur ».</p>
          <p>Conformément aux articles L.111-1 et suivants du Code de la consommation, les présentes CGV sont communiquées préalablement à toute commande.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 2 – Objet et champ d’application</h2>
          <p>Les présentes CGV ont pour objet de définir les droits et obligations des parties dans le cadre de la vente en ligne de livres physiques et numériques via le site [Nom du site]. Elles s’appliquent :</p>
          <ul>
            <li>Aux consommateurs au sens de l’article liminaire du Code de la consommation</li>
            <li>Aux professionnels au sens de l’article liminaire du Code de la consommation</li>
          </ul>
          <p>Les CGV prévalent sur tout autre document, conformément à l’article 1119 du Code civil.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 3 – Information précontractuelle</h2>
          <p>Conformément aux articles L.111-1 et L.221-5 du Code de la consommation, le client reçoit, préalablement à la commande, les informations relatives :</p>
          <ul>
            <li>Aux caractéristiques essentielles des biens</li>
            <li>Au prix</li>
            <li>Aux frais de livraison</li>
            <li>Aux modalités de paiement</li>
            <li>Au droit de rétractation</li>
          </ul>
          <p>Le client reconnaît avoir pris connaissance de ces informations avant validation de la commande.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 4 – Commande</h2>
          <p>Conformément à l’article 1127-2 du Code civil, le client suit les étapes suivantes :</p>
          <ul>
            <li>Sélection des produits</li>
            <li>Vérification du panier</li>
            <li>Confirmation de la commande</li>
            <li>Paiement</li>
          </ul>
          <p>La vente est réputée conclue à compter de la confirmation du paiement. Le Vendeur se réserve le droit de refuser une commande en cas de litige antérieur (article 1104 du Code civil – principe de bonne foi).</p>
        </section>

        <section className="cgv-section">
          <h2>Article 5 – Prix</h2>
          <p>Les prix sont indiqués en euros (€) toutes taxes comprises (TTC).</p>
          <p>Conformément à l’article L.112-1 du Code de la consommation, le prix applicable est celui en vigueur au jour de la commande. Pour les livraisons hors UE, les droits de douane restent à la charge du client.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 6 – Paiement</h2>
          <p>Le paiement est exigible immédiatement à la commande.</p>
          <p>Les transactions sont sécurisées conformément :</p>
          <ul>
            <li>À la Directive (UE) 2015/2366 (DSP2)</li>
            <li>Au Règlement (UE) 2018/389 relatif à l’authentification forte</li>
          </ul>
          <p>En cas de défaut de paiement, la commande est annulée de plein droit.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 7 – Livraison</h2>
          <h3>7.1 Produits physiques</h3>
          <p>Conformément à l’article L.216-1 du Code de la consommation, le produit est livré à la date ou dans le délai indiqué au client. En cas de retard, le client peut résoudre le contrat selon les modalités prévues à l’article L.216-6 du Code de la consommation.</p>
          <p>Le transfert des risques intervient au moment où le consommateur prend physiquement possession du bien (article L.216-4 du Code de la consommation).</p>

          <h3>7.2 Produits numériques</h3>
          <p>La fourniture de contenus numériques est régie par les articles L.224-25-1 et suivants du Code de la consommation. Le contenu numérique est fourni immédiatement après paiement. Le client renonce expressément à son droit de rétractation conformément à l’article L.221-28, 13° du Code de la consommation.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 8 – Droit de rétractation</h2>
          <p>Conformément aux articles L.221-18 et suivants du Code de la consommation :</p>

          <h3>Produits physiques</h3>
          <p>Le consommateur dispose d’un délai de quatorze (14) jours à compter de la réception pour exercer son droit de rétractation sans avoir à motiver sa décision. Les frais de retour sont supportés par le client (article L.221-23). Le remboursement intervient dans un délai de quatorze (14) jours (article L.221-24).</p>

          <h3>Produits numériques</h3>
          <p>Conformément à l’article L.221-28, 13°, le droit de rétractation ne peut être exercé lorsque :</p>
          <ul>
            <li>L’exécution a commencé</li>
            <li>Et que le client a expressément renoncé à son droit</li>
          </ul>
        </section>

        <section className="cgv-section">
          <h2>Article 9 – Garanties légales</h2>
          <h3>9.1 Garantie légale de conformité</h3>
          <p>Conformément aux articles L.217-3 à L.217-20 du Code de la consommation, le vendeur est tenu de livrer un bien conforme au contrat. Le consommateur dispose d’un délai de deux ans à compter de la délivrance du bien pour agir.</p>

          <h3>9.2 Garantie des vices cachés</h3>
          <p>Conformément aux articles 1641 à 1649 du Code civil, le vendeur est tenu de la garantie à raison des défauts cachés.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 10 – Responsabilité</h2>
          <p>La responsabilité du Vendeur est engagée conformément aux articles 1231-1 et suivants du Code civil. Elle ne saurait être engagée en cas :</p>
          <ul>
            <li>De force majeure (article 1218 du Code civil)</li>
            <li>De faute du client</li>
            <li>De fait imprévisible et insurmontable d’un tiers</li>
          </ul>
          <p>La responsabilité est limitée au montant de la commande, sauf disposition d’ordre public contraire.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 11 – Réserve de propriété</h2>
          <p>Conformément à l’article 2367 du Code civil, le Vendeur conserve la propriété des biens vendus jusqu’au paiement intégral du prix.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 12 – Propriété intellectuelle</h2>
          <p>Les contenus du site sont protégés par le Code de la propriété intellectuelle. Toute reproduction non autorisée constitue une contrefaçon au sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
        </section>

        <section className="cgv-section">
          <h2>Article 13 – Données personnelles</h2>
          <p>Les données sont traitées conformément :</p>
          <ul>
            <li>Au Règlement (UE) 2016/679 (RGPD)</li>
            <li>À la Directive 2002/58/CE (ePrivacy)</li>
            <li>À la loi française n°78-17 du 6 janvier 1978 modifiée</li>
          </ul>
          <p>Le client dispose des droits prévus aux articles 15 à 22 du RGPD. Il peut introduire une réclamation auprès de l’autorité de contrôle compétente (en France : CNIL).</p>
        </section>

        <section className="cgv-section">
          <h2>Article 14 – Règlement des litiges</h2>
          <p>Conformément aux articles L.612-1 et suivants du Code de la consommation, le consommateur peut recourir gratuitement à un médiateur de la consommation.</p>
          <p>Conformément au Règlement (UE) n°524/2013, le client peut utiliser la plateforme européenne de règlement en ligne des litiges (RLL). À défaut de résolution amiable, les tribunaux compétents seront désignés conformément aux règles du Code de procédure civile.</p>
        </section>
      </div>
    </div>
  );
}

export default CGV;