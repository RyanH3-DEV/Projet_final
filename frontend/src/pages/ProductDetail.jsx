import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowLeft, Zap, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Style_localisés/ProductDetail.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function ProductDetail({ ajouterAuPanier }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [produit, setProduit] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [ajoute, setAjoute] = useState(false);
  const [indexImage, setIndexImage] = useState(0);

  useEffect(() => {
    setChargement(true);
    setErreur(false);
    setIndexImage(0);
    fetch(`${BASE_URL}/api/services/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        setProduit(data);
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [id]);

  // Construction de la liste d'images : image principale + galerie d'images additionnelles
  const galerieImages = produit
    ? [
        ...(produit.image ? [produit.image] : []),
        ...((produit.images || []).filter(Boolean)),
      ]
    : [];

  const imageActuelle = galerieImages[indexImage] || null;

  const imagePrecedente = () => {
    setIndexImage((i) => (i === 0 ? galerieImages.length - 1 : i - 1));
  };

  const imageSuivante = () => {
    setIndexImage((i) => (i === galerieImages.length - 1 ? 0 : i + 1));
  };

  const handleAjouterPanier = () => {
    if (!produit || !ajouterAuPanier) return;
    ajouterAuPanier({
      id: produit.id,
      name: produit.name,
      price: produit.price,
      image: produit.image,
      isAvailable: produit.isAvailable,
      subscriptionDuration: 'mensuel',
    });
    setAjoute(true);
    setTimeout(() => setAjoute(false), 2000);
  };

  const handleEssaiGratuit = () => {
    if (!produit || !ajouterAuPanier) return;
    ajouterAuPanier({
      id: produit.id,
      name: produit.name,
      price: produit.price,
      image: produit.image,
      isAvailable: produit.isAvailable,
      subscriptionDuration: 'mensuel',
    });
    navigate('/panier');
  };

  if (chargement) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">
          <div className="spinner-produit" />
        </div>
      </div>
    );
  }

  if (erreur || !produit) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error">
          <p>{t('product_detail.not_found', 'Produit introuvable.')}</p>
          <Link to="/solutions" className="btn-retour-catalogue">
            {t('product_detail.back_to_catalog', 'Retour au catalogue')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">

        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> {t('product_detail.back', 'Retour')}
        </button>

        <div className="product-detail-grid">

          {/* ── Galerie d'images ─────────────────────────────────────────── */}
          <div className="product-detail-gallery">
            <div className="product-detail-image-wrapper">
              {imageActuelle ? (
                <img src={imageActuelle} alt={produit.name} className="product-detail-image" />
              ) : (
                <div className="product-detail-image-placeholder">
                  <ShieldCheck size={80} />
                </div>
              )}

              {galerieImages.length > 1 && (
                <>
                  <button className="gallery-nav gallery-nav--prev" onClick={imagePrecedente} aria-label="Image précédente">
                    <ChevronLeft size={22} />
                  </button>
                  <button className="gallery-nav gallery-nav--next" onClick={imageSuivante} aria-label="Image suivante">
                    <ChevronRight size={22} />
                  </button>
                  <div className="gallery-counter">
                    {indexImage + 1} / {galerieImages.length}
                  </div>
                </>
              )}
            </div>

            {galerieImages.length > 1 && (
              <div className="product-detail-thumbnails">
                {galerieImages.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail-btn ${i === indexImage ? 'thumbnail-btn--active' : ''}`}
                    onClick={() => setIndexImage(i)}
                  >
                    <img src={img} alt={`${produit.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Informations produit ─────────────────────────────────────── */}
          <div className="product-detail-info">
            <span className="product-detail-category">{produit.category}</span>
            <h1 className="product-detail-name">{produit.name}</h1>

            <div className="product-detail-description">
              <p className="product-detail-description-main">{produit.description}</p>

              <div className="product-detail-features">
                <div className="feature-item">
                  <Check size={16} />
                  <span>{t('product_detail.feature_protection', 'Protection continue contre les menaces émergentes')}</span>
                </div>
                <div className="feature-item">
                  <Check size={16} />
                  <span>{t('product_detail.feature_dashboard', 'Tableau de bord centralisé et alertes en temps réel')}</span>
                </div>
                <div className="feature-item">
                  <Check size={16} />
                  <span>{t('product_detail.feature_integration', 'Intégration rapide avec votre infrastructure existante')}</span>
                </div>
                <div className="feature-item">
                  <Check size={16} />
                  <span>{t('product_detail.feature_support', 'Accompagnement par nos experts en cybersécurité')}</span>
                </div>
              </div>
            </div>

            {produit.technicalSpecs && (
              <div className="product-detail-specs">
                <h3>{t('product_detail.specs_title', 'Caractéristiques techniques')}</h3>
                <p>{produit.technicalSpecs}</p>
              </div>
            )}

            {!produit.isAvailable && (
              <div className="product-detail-unavailable">
                {t('product_detail.unavailable', 'Ce service est actuellement indisponible.')}
              </div>
            )}

            <div className="product-detail-price-row">
              <span className="product-detail-price">{Number(produit.price).toFixed(2)} EUR</span>
              <span className="product-detail-price-period">/ {t('product_detail.per_month', 'mois')}</span>
            </div>

            <div className="product-detail-cta-group">
              <button
                className="btn-cta-essai"
                onClick={handleEssaiGratuit}
                disabled={!produit.isAvailable}
              >
                <Zap size={18} />
                {t('product_detail.cta_trial', 'Démarrer un essai gratuit')}
              </button>

              <button
                className={`btn-cta-panier ${ajoute ? 'btn-cta-panier--success' : ''}`}
                onClick={handleAjouterPanier}
                disabled={!produit.isAvailable}
              >
                {ajoute ? (
                  <>
                    <Check size={18} />
                    {t('product_detail.added', 'Ajouté !')}
                  </>
                ) : (
                  t('product_detail.add_to_cart', 'Ajouter au panier')
                )}
              </button>
            </div>

            <ul className="product-detail-guarantees">
              <li><Check size={14} /> {t('product_detail.guarantee_1', 'Sans engagement, résiliable à tout moment')}</li>
              <li><Check size={14} /> {t('product_detail.guarantee_2', 'Support 24/7 inclus')}</li>
              <li><Check size={14} /> {t('product_detail.guarantee_3', 'Activation sous 24h')}</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetail;