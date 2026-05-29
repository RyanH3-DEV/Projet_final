import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
    getCart,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeFromCart as apiRemoveFromCart
} from '../api/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshCart = async () => {
        setLoading(true);
        try {
            const data = await getCart();
            setCartItems(data.items || []);
        } catch (error) {
            console.error(t('cart.err_fetch'), error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    const addToCart = async (product, quantity = 1) => {
        try {
            await apiAddToCart(product, quantity);
            await refreshCart();
        } catch (error) {
            console.error(t('cart.err_add'), error);
        }
    };

    const removeFromCart = async (id) => {
        try {
            await apiRemoveFromCart(id);
            await refreshCart();
        } catch (error) {
            console.error(t('cart.err_delete'), error);
        }
    };

    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return;
        try {
            await apiUpdateCartItem(id, { quantity });
            await refreshCart();
        } catch (error) {
            console.error(t('cart.err_update'), error);
        }
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            cartCount,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);