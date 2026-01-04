import { ref, readonly } from 'vue';

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
            products.value = data;
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const addProduct = (product: Product) => {
        products.value.push(product);
    };

    const updateProduct = (id: string, updatedProduct: Product) => {
        const index = products.value.findIndex(p => p.id === id);
        if (index !== -1) {
            products.value[index] = updatedProduct;
        }
    };

    const deleteProduct = (id: string) => {
        products.value = products.value.filter(p => p.id !== id);
    };

    return {
        products: readonly(products),
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct
    };
}
