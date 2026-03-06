import React from 'react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/CGU.css';

function CGU() {
  const { t } = useTranslation();

  return (
    <div className="cgu-page">
      <div className="cgu-container">
        <h1>{t('cgu.title', 'CONDITIONS GÉNÉRALES D’UTILISATION (CGU)')}</h1>

        <section className="cgu-section">
          <h2>{t('cgu.art1_title', 'Article 1 – Identification de l’éditeur')}</h2>
          <p>{t('cgu.art1_p1', 'Le présent site internet [Nom du site] (ci-après « le Site ») est édité par :')}</p>
          <p>
            <strong>{t('cgu.company_name', '[Nom de l’entreprise]')}</strong><br />
            {t('cgu.company_form', '[Forme juridique]')}<br />
            {t('cgu.company_address', 'Siège social : [adresse complète]')}<br />
            {t('cgu.company_rcs', 'Immatriculée au RCS de [ville] sous le numéro [RCS]')}<br />
            {t('cgu.company_email', 'Adresse électronique : [email]')}
          </p>
          <p>{t('cgu.art1_p2', 'Le directeur de la publication est : [Nom].')}</p>
          <p>{t('cgu.art1_p3', 'L’hébergeur du Site est :')}</p>
          <p>
            {t('cgu.host_name', '[Nom de l’hébergeur]')}<br />
            {t('cgu.host_address', '[Adresse de l’hébergeur]')}
          </p>
          <p>{t('cgu.art1_p4', 'Conformément aux articles 6 III et 19 de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art2_title', 'Article 2 – Objet des CGU')}</h2>
          <p>{t('cgu.art2_p1', 'Les présentes Conditions Générales d’Utilisation ont pour objet de définir :')}</p>
          <ul>
            <li>{t('cgu.art2_li1', 'Les modalités d’accès au Site')}</li>
            <li>{t('cgu.art2_li2', 'Les conditions d’utilisation des services proposés')}</li>
            <li>{t('cgu.art2_li3', 'Les droits et obligations des utilisateurs')}</li>
          </ul>
          <p>{t('cgu.art2_p2', 'Toute navigation sur le Site implique l’acceptation sans réserve des présentes CGU.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art3_title', 'Article 3 – Accès au Site')}</h2>
          <p>{t('cgu.art3_p1', 'Le Site est accessible à tout utilisateur disposant d’un accès à Internet. L’éditeur s’efforce d’assurer une disponibilité continue du Site, sans obligation de résultat.')}</p>
          <p>{t('cgu.art3_p2', 'Conformément à l’article 1217 du Code civil, l’éditeur ne saurait être tenu responsable des interruptions résultant :')}</p>
          <ul>
            <li>{t('cgu.art3_li1', 'De maintenance technique')}</li>
            <li>{t('cgu.art3_li2', 'D’une défaillance du réseau Internet')}</li>
            <li>{t('cgu.art3_li3', 'D’un cas de force majeure au sens de l’article 1218 du Code civil')}</li>
          </ul>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art4_title', 'Article 4 – Création de compte')}</h2>
          <p>{t('cgu.art4_p1', 'L’accès à certaines fonctionnalités (commande, téléchargement d’ebooks) nécessite la création d’un compte utilisateur.')}</p>
          <p>{t('cgu.art4_p2', 'L’utilisateur s’engage à :')}</p>
          <ul>
            <li>{t('cgu.art4_li1', 'Fournir des informations exactes et complètes')}</li>
            <li>{t('cgu.art4_li2', 'Maintenir la confidentialité de ses identifiants')}</li>
            <li>{t('cgu.art4_li3', 'Informer immédiatement l’éditeur de toute utilisation frauduleuse')}</li>
          </ul>
          <p>{t('cgu.art4_p3', 'L’utilisateur demeure seul responsable de l’usage de son compte. En cas de violation des présentes CGU, l’éditeur se réserve le droit de suspendre ou supprimer le compte.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art5_title', 'Article 5 – Obligations de l’utilisateur')}</h2>
          <p>{t('cgu.art5_p1', 'L’utilisateur s’engage à :')}</p>
          <ul>
            <li>{t('cgu.art5_li1', 'Utiliser le Site conformément à sa destination')}</li>
            <li>{t('cgu.art5_li2', 'Ne pas porter atteinte au bon fonctionnement du Site')}</li>
            <li>{t('cgu.art5_li3', 'Ne pas introduire de virus ou de programmes malveillants')}</li>
            <li>{t('cgu.art5_li4', 'Ne pas tenter d’accéder frauduleusement aux systèmes informatiques')}</li>
          </ul>
          <p>{t('cgu.art5_p2', 'Conformément aux articles 323-1 et suivants du Code pénal, toute intrusion frauduleuse dans un système de traitement automatisé de données est passible de sanctions pénales.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art6_title', 'Article 6 – Contenus publiés sur le Site')}</h2>
          <p>{t('cgu.art6_p1', 'Les informations diffusées sur le Site sont fournies à titre informatif. L’éditeur s’efforce d’assurer l’exactitude des informations, sans garantie d’exhaustivité.')}</p>
          <p>{t('cgu.art6_p2', 'L’éditeur se réserve le droit de modifier les contenus à tout moment, sans préavis.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art7_title', 'Article 7 – Propriété intellectuelle')}</h2>
          <p>{t('cgu.art7_p1', 'Le Site et l’ensemble de ses éléments (textes, graphismes, logos, images, architecture, base de données) sont protégés par :')}</p>
          <ul>
            <li>{t('cgu.art7_li1', 'Le Code de la propriété intellectuelle')}</li>
            <li>{t('cgu.art7_li2', 'Les articles L.111-1 et suivants du CPI')}</li>
            <li>{t('cgu.art7_li3', 'Les articles L.335-2 et suivants relatifs à la contrefaçon')}</li>
          </ul>
          <p>{t('cgu.art7_p2', 'Toute reproduction, représentation, adaptation ou exploitation non autorisée est strictement interdite.')}</p>
          <p>{t('cgu.art7_p3', 'Les livres numériques vendus sont destinés à un usage strictement personnel. Toute diffusion ou reproduction constitue une violation des droits d’auteur.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art8_title', 'Article 8 – Données personnelles')}</h2>
          <p>{t('cgu.art8_p1', 'Les données personnelles collectées via le Site sont traitées conformément :')}</p>
          <ul>
            <li>{t('cgu.art8_li1', 'Au Règlement (UE) 2016/679 (RGPD)')}</li>
            <li>{t('cgu.art8_li2', 'À la loi n°78-17 du 6 janvier 1978 modifiée')}</li>
            <li>{t('cgu.art8_li3', 'À la directive 2002/58/CE (ePrivacy)')}</li>
          </ul>

          <h3>{t('cgu.art8_1_title', '8.1 Finalités du traitement')}</h3>
          <p>{t('cgu.art8_1_p1', 'Les données sont collectées pour :')}</p>
          <ul>
            <li>{t('cgu.art8_1_li1', 'La gestion des commandes')}</li>
            <li>{t('cgu.art8_1_li2', 'La gestion des comptes utilisateurs')}</li>
            <li>{t('cgu.art8_1_li3', 'Le service client')}</li>
            <li>{t('cgu.art8_1_li4', 'La prévention des fraudes')}</li>
          </ul>

          <h3>{t('cgu.art8_2_title', '8.2 Droits des utilisateurs')}</h3>
          <p>{t('cgu.art8_2_p1', 'Conformément aux articles 15 à 22 du RGPD, l’utilisateur dispose :')}</p>
          <ul>
            <li>{t('cgu.art8_2_li1', 'D’un droit d’accès, de rectification et d’effacement')}</li>
            <li>{t('cgu.art8_2_li2', 'D’un droit d’opposition et à la limitation')}</li>
            <li>{t('cgu.art8_2_li3', 'D’un droit à la portabilité')}</li>
          </ul>
          <p>{t('cgu.art8_2_p2', 'Il peut exercer ces droits en contactant : [email]. Il peut introduire une réclamation auprès de l’autorité de contrôle compétente (CNIL en France).')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art9_title', 'Article 9 – Cookies')}</h2>
          <p>{t('cgu.art9_p1', 'Le Site peut utiliser des cookies conformément :')}</p>
          <ul>
            <li>{t('cgu.art9_li1', 'À l’article 82 de la loi Informatique et Libertés')}</li>
            <li>{t('cgu.art9_li2', 'Aux lignes directrices de la CNIL')}</li>
          </ul>
          <p>{t('cgu.art9_p2', 'Les cookies non strictement nécessaires nécessitent le consentement préalable de l’utilisateur. L’utilisateur peut configurer ses préférences via un bandeau de gestion des cookies.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art10_title', 'Article 10 – Responsabilité')}</h2>
          <p>{t('cgu.art10_p1', 'Conformément aux articles 1240 et suivants du Code civil, la responsabilité de l’éditeur ne peut être engagée qu’en cas de faute prouvée.')}</p>
          <p>{t('cgu.art10_p2', 'L’éditeur ne saurait être tenu responsable :')}</p>
          <ul>
            <li>{t('cgu.art10_li1', 'Des dommages indirects ou de la perte de données')}</li>
            <li>{t('cgu.art10_li2', 'D’un préjudice commercial')}</li>
            <li>{t('cgu.art10_li3', 'D’une incompatibilité technique du matériel de l’utilisateur')}</li>
          </ul>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art11_title', 'Article 11 – Liens hypertextes')}</h2>
          <p>{t('cgu.art11_p1', 'Le Site peut contenir des liens vers des sites tiers. Conformément à la directive 2000/31/CE sur le commerce électronique, l’éditeur ne saurait être tenu responsable du contenu des sites externes.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art12_title', 'Article 12 – Modification des CGU')}</h2>
          <p>{t('cgu.art12_p1', 'L’éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles versions sont applicables dès leur mise en ligne.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art13_title', 'Article 13 – Nullité partielle')}</h2>
          <p>{t('cgu.art13_p1', 'Si une clause des présentes CGU est déclarée nulle, les autres dispositions demeureront applicables, conformément à l’article 1184 du Code civil.')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art14_title', 'Article 14 – Droit applicable et juridiction compétente')}</h2>
          <p>{t('cgu.art14_p1', 'Les présentes CGU sont soumises au droit français.')}</p>
          <p>{t('cgu.art14_p2', 'En cas de litige :')}</p>
          <ul>
            <li>{t('cgu.art14_li1', 'Une solution amiable sera recherchée')}</li>
            <li>{t('cgu.art14_li2', 'À défaut, compétence est attribuée aux juridictions compétentes conformément aux règles du Code de procédure civile')}</li>
          </ul>
          <p>{t('cgu.art14_p3', 'Pour les consommateurs, les règles protectrices du Code de la consommation s’appliquent.')}</p>
        </section>
      </div>
    </div>
  );
}

export default CGU;