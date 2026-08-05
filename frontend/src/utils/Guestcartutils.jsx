// src/utils/guestCartUtils.js
const KEY = 'cyna_guest_cart';

export function isLoggedIn() {
  return !!(localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail'));
}

export function getGuestCart() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function save(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('guestCartUpdated'));
}

export function addToGuestCart(item) {
  const cart = getGuestCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity ?? 1;
  } else {
    cart.push({
      ...item,
      quantity: item.quantity ?? 1,
      subscriptionDuration: item.subscriptionDuration ?? 'mensuel',
    });
  }
  save(cart);
  return getGuestCart();
}

export function removeFromGuestCart(id) {
  const cart = getGuestCart().filter(i => i.id !== id);
  save(cart);
  return cart;
}

export function updateGuestCartItem(id, changes) {
  const cart = getGuestCart().map(i => i.id === id ? { ...i, ...changes } : i);
  save(cart);
  return cart;
}

export function clearGuestCart() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('guestCartUpdated'));
}

export function guestCartCount() {
  return getGuestCart().reduce((acc, i) => acc + i.quantity, 0);
}