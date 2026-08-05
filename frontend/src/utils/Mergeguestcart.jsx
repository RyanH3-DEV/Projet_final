// src/utils/mergeGuestCart.js
import { getGuestCart, clearGuestCart } from './guestCartUtils';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function mergeGuestCartOnLogin(email, rafraichirPanier) {
  const guestItems = getGuestCart();
  if (!guestItems.length || !email) return;

  try {
    await Promise.all(
      guestItems.map(item =>
        fetch(`${BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            serviceId:            item.id,
            quantity:             item.quantity,
            subscriptionDuration: item.subscriptionDuration,
          }),
        })
      )
    );
  } catch (err) {
    console.error('[mergeGuestCart] Erreur fusion :', err);
  } finally {
    clearGuestCart();
    if (typeof rafraichirPanier === 'function') await rafraichirPanier();
  }
}