import { t } from 'i18next';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_URL  = `${BASE_URL}/api/cart`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        // J'ajoute l'autorisation si le token est présent pour la persistance sécurisée
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const getCart = async (emailParam = null) => {
    const email = (emailParam || localStorage.getItem('userEmail'))?.trim();
    if (!email) return { items: [] };

    try {
        const res = await fetch(`${API_URL}/?email=${encodeURIComponent(email)}`, {
            headers: getHeaders()
        });
        return res.ok ? res.json() : { items: [] };
    } catch {
        return { items: [] };
    }
};

export const addToCart = async (service, quantity = 1) => {
    const email = localStorage.getItem('userEmail')?.trim();

    if (!email) {
        throw new Error(t('api.cart_login_required', "Connexion requise pour gérer le panier."));
    }

    const res = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            serviceId: service.id,
            name: service.name,
            price: parseFloat(service.price),
            image: service.image,
            quantity: quantity,
            subscriptionDuration: service.subscriptionDuration || 'mensuel',
            email: email
        })
    });

    if (!res.ok) {
        let errorMessage = `${t('api.http_error', 'Erreur serveur')} ${res.status}`;
        try {
            const errorData = await res.json();
            if (errorData?.message) errorMessage = errorData.message;
        } catch {}
        throw new Error(errorMessage);
    }

    return res.json();
};

export const updateCartItem = async (id, updateData) => {
    const email = localStorage.getItem('userEmail')?.trim();

    // Je permets de mettre à jour soit la quantité, soit la durée d'abonnement
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...updateData, email })
    });

    return res.json();
};

export const removeFromCart = async (id) => {
    const email = localStorage.getItem('userEmail')?.trim();
    const res = await fetch(`${API_URL}/remove/${id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return res.json();
};