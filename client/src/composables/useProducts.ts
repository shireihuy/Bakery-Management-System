import { ref, readonly } from 'vue';
import { socketService } from '../services/socket';

export interface Product {
    readonly id: string;
    readonly name: string;
    readonly category: string;
    readonly price: number;
    readonly cost?: number;
    readonly stock: number;
    readonly unit?: string;
    readonly image: string;
    readonly description?: string;
    readonly ingredients?: readonly string[];
    readonly allergens?: readonly string[];
    readonly rating?: number;
}

const products = ref<Product[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useProducts() {
    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();

            // Map image path to full URL if it's a relative path from the server
            const productsWithFullUrls = data.map((p: any) => ({
                ...p,
                image: p.image?.startsWith('/') ? `${API_URL.replace('/api', '')}${p.image}` : p.image
            }));

            products.value = productsWithFullUrls;
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const getAuthHeader = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const addProduct = async (productData: any) => {
        try {
            const formData = new FormData();
            Object.keys(productData).forEach(key => {
                const value = productData[key];
                if (key === 'image' && value instanceof File) {
                    formData.append('image', value);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: formData
            });

            if (!response.ok) throw new Error('Failed to add product');
            await fetchProducts();
        } catch (err) {
            console.error('Error adding product:', err);
            throw err;
        }
    };

    const updateProduct = async (id: string, productData: any) => {
        try {
            const formData = new FormData();
            Object.keys(productData).forEach(key => {
                const value = productData[key];
                if (key === 'image' && value instanceof File) {
                    formData.append('image', value);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update product');
            await fetchProducts();
        } catch (err) {
            console.error('Error updating product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (!response.ok) throw new Error('Failed to delete product');
            await fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            throw err;
        }
    };

    return {
        products: readonly(products),
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct
    };
}

// Global listener for product updates
socketService.on('stock:updated', () => {
    const { fetchProducts } = useProducts();
    fetchProducts();
});
