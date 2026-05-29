import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../Style_localisés/ProductDetail.css';

const ProductDetail = () => {
    // Je récupère l'ID depuis l'URL
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // J'interroge l'API Symfony avec l'ID du produit
        fetch(`http://127.0.0.1:8001/api/services/${id}`)
            .then(response => response.json())
            .then(data => {
                setProduct(data);
                if (data.image) {
                    setMainImage(`http://127.0.0.1:8001/uploads/services/${data.image}`);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération :", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="loading">Chargement...</div>;
    if (!product) return <div className="error">Produit introuvable.</div>;

    const galleryImages = product.images || [];

    return (
        <div className="product-detail-page">
            <div className="gallery-section">
                <div className="main-image-container">
                    {mainImage ? (
                        <img src={mainImage} alt={product.name} className="main-image" />
                    ) : (
                        <div className="no-image">Aucune image</div>
                    )}
                </div>

                <div className="thumbnails-container">
                    {product.image && (
                        <img
                            src={`http://127.0.0.1:8001/uploads/services/${product.image}`}
                            alt="Couverture"
                            className={`thumbnail ${mainImage.includes(product.image) ? 'active' : ''}`}
                            onClick={() => setMainImage(`http://127.0.0.1:8001/uploads/services/${product.image}`)}
                        />
                    )}

                    {galleryImages.map((imgName, index) => {
                        const imageUrl = `http://127.0.0.1:8001/uploads/services/${imgName}`;
                        return (
                            <img
                                key={index}
                                src={imageUrl}
                                alt={`Galerie ${index}`}
                                className={`thumbnail ${mainImage === imageUrl ? 'active' : ''}`}
                                onClick={() => setMainImage(imageUrl)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="info-section">
                <h1>{product.name}</h1>
                <p className="price">{product.price} € / mois</p>

                <div className="description-box">
                    <h2>Description</h2>
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>

                {product.technicalSpecs && (
                    <div className="specs-box">
                        <h2>Spécifications techniques</h2>
                        <p>{product.technicalSpecs}</p>
                    </div>
                )}

                <button className="add-to-cart-btn">Ajouter au panier</button>
            </div>
        </div>
    );
};

export default ProductDetail;