import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import '../Style_localisés/Panier.css'; // Attention à la majuscule de ton dossier

// Je récupère panier et setPanier depuis App.jsx
function Panier({ panier, setPanier, setCurrentPage }) {

    // Je gère le message de confirmation PayPal uniquement ici
    const [messageRetour, setMessageRetour] = useState(null);

    // Le calcul se fait automatiquement sur le "vrai" panier partagé
    const totalAmount = panier.reduce((total, article) => total + (article.prix * article.quantite), 0).toFixed(2);

    const modifierQuantite = (id, changement) => {
        setPanier(panier.map(article => {
            if (article.id === id) {
                const nouvelleQuantite = article.quantite + changement;
                return { ...article, quantite: nouvelleQuantite > 0 ? nouvelleQuantite : 1 };
            }
            return article;
        }));
    };

    const supprimerArticle = (id) => {
        setPanier(panier.filter(article => article.id !== id));
    };

    const allerVersPaiement = () => {
        setMessageRetour(null);
        setCurrentPage('paiement');
    };

    return (
        <div className="panier-container">

            {messageRetour && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                    backgroundColor: messageRetour.type === 'succes' ? '#d4edda' : '#f8d7da',
                    color: messageRetour.type === 'succes' ? '#155724' : '#721c24',
                    border: `1px solid ${messageRetour.type === 'succes' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    <strong>{messageRetour.type === 'succes' ? '✅ Succès : ' : '❌ Erreur : '}</strong>
                    {messageRetour.texte}
                </div>
            )}

            <h2>🛒 Mon Panier</h2>

            <div className="panier-items">
                {panier.length === 0 ? (
                    <p>Votre panier est vide.</p>
                ) : (
                    panier.map(article => (
                        <div key={article.id} className="item-row">
                            <div className="item-infos">
                                {/* J'affiche la couverture si elle existe, ou juste les infos */}
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    {article.image && <img src={article.image} alt={article.title} style={{ width: '40px', objectFit: 'cover' }} />}
                                    <div>
                                        <p style={{ margin: 0 }}><strong>{article.title}</strong></p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{article.author}</p>
                                    </div>
                                </div>
                                <p className="item-prix">{(article.prix * article.quantite).toFixed(2)}€</p>
                            </div>

                            <div className="item-actions">
                                <button onClick={() => modifierQuantite(article.id, -1)} className="btn-quantite">-</button>
                                <span>{article.quantite}</span>
                                <button onClick={() => modifierQuantite(article.id, 1)} className="btn-quantite">+</button>
                                <button onClick={() => supprimerArticle(article.id)} className="btn-supprimer">🗑️</button>
                            </div>
                        </div>
                    ))
                )}

                {panier.length > 0 && (
                    <>
                        <hr className="divider" />
                        <h3 className="total-text">Total à régler : {totalAmount}€</h3>
                    </>
                )}
            </div>

            {panier.length > 0 && (
                <div className="paiement-section">
                    <h3>Moyens de paiement sécurisés</h3>

                    <div className="paiement-actions">

                        <button onClick={allerVersPaiement} className="btn-mastercard" style={{ width: '250px' }}>
                            💳 Payer par Carte
                        </button>

                        <div className="paypal-wrapper">
                            <PayPalScriptProvider options={{ "client-id": "test", currency: "EUR" }}>
                                <PayPalButtons
                                    style={{ layout: "horizontal", color: "gold", shape: "rect", height: 45 }}
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            purchase_units: [{ amount: { value: totalAmount } }],
                                        });
                                    }}
                                    onApprove={(data, actions) => {
                                        return actions.order.capture().then(() => {
                                            setMessageRetour({ type: 'succes', texte: "Votre paiement PayPal a été accepté !" });
                                            setPanier([]); // Je vide le panier après l'achat
                                        });
                                    }}
                                />
                            </PayPalScriptProvider>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Panier;