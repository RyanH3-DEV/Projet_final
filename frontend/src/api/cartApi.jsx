import { t } from 'i18next';

const API_URL = "http://127.0.0.1:8000/api/cart";

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

// ✅ getCart accepte un email optionnel pour éviter le problème de timing
export const getCart = async (emailParam = null) => {
    const email = (emailParam || localStorage.getItem('userEmail'))?.trim();
    if (!email) return { items: [] };

    const res = await fetch(`${API_URL}/?email=${encodeURIComponent(email)}`, {
        headers: getHeaders()
    });

    return res.ok ? res.json() : { items: [] };
};

export const addToCart = async (book, quantity = 1) => {
    const email = localStorage.getItem('userEmail')?.trim();

    if (!email) {
        throw new Error(t('api.cart_login_required', "Tu dois être connecté pour cette action."));
    }

    const res = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            productId: book.id,
            title: book.title,
            price: parseFloat(book.price),
            image: book.image,
            quantity: quantity,
            email: email
        })
    });

    if (!res.ok) {
        let errorMessage = `${t('api.http_error', 'Erreur HTTP')} ${res.status}`;
        try {
            const errorData = await res.json();
            if (errorData?.message) errorMessage = errorData.message;
        } catch (err) {}
        throw new Error(errorMessage);
    }

    return res.json();
};

export const updateCartItem = async (id, quantity) => {
    const email = localStorage.getItem('userEmail')?.trim();
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity, email })
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