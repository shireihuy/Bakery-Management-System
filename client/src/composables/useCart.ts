import { ref } from 'vue';
import { useAuth } from './useAuth';
import type { Product } from './useProducts';

export interface CartItem extends Product {
    cartItemId?: number;
    quantity: number;
}

// Global cart state
const cart = ref<CartItem[]>([]);
const isCartLoading = ref(false);

import { API_URL } from '../config/api';

export function useCart() {
    const { user } = useAuth();

    // Base URL is either from env or default
    const getBaseUrl = () => {
        return API_URL;
    };

    const fetchCart = async () => {
        if (!user.value) {
            // Load from local storage if not logged in
            const savedCart = localStorage.getItem('bakery_cart');
            cart.value = savedCart ? JSON.parse(savedCart) : [];
            return;
        }

        isCartLoading.value = true;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getBaseUrl()}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                cart.value = data.cart;
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            isCartLoading.value = false;
        }
    };

    const addToCart = async (product: Product, qty: number = 1) => {
        const existingItem = cart.value.find(item => item.id === product.id);
        const newQuantity = existingItem ? Math.min(existingItem.quantity + qty, product.stock) : Math.min(qty, product.stock);

        if (!user.value) {
            if (existingItem) {
                existingItem.quantity = newQuantity;
            } else {
                cart.value.push({ ...product, quantity: newQuantity });
            }
            localStorage.setItem('bakery_cart', JSON.stringify(cart.value));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getBaseUrl()}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: newQuantity
                })
            });

            if (response.ok) {
                // Fetch the updated cart from server, or do optimistic update
                if (existingItem) {
                    existingItem.quantity = newQuantity;
                } else {
                    cart.value.push({ ...product, quantity: newQuantity });
                }
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const updateQuantity = async (productId: string, delta: number) => {
        const item = cart.value.find(i => i.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        const boundedQuantity = Math.max(0, Math.min(newQuantity, item.stock));

        if (boundedQuantity === 0) {
            await removeFromCart(productId);
            return;
        }

        if (!user.value) {
            item.quantity = boundedQuantity;
            localStorage.setItem('bakery_cart', JSON.stringify(cart.value));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getBaseUrl()}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: boundedQuantity
                })
            });

            if (response.ok) {
                item.quantity = boundedQuantity;
            }
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!user.value) {
            cart.value = cart.value.filter(item => item.id !== productId);
            localStorage.setItem('bakery_cart', JSON.stringify(cart.value));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getBaseUrl()}/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                cart.value = cart.value.filter(item => item.id !== productId);
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const clearCart = async () => {
        if (!user.value) {
            cart.value = [];
            localStorage.setItem('bakery_cart', '[]');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getBaseUrl()}/cart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                cart.value = [];
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    return {
        cart,
        isCartLoading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };
}
