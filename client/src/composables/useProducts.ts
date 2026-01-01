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

const products = ref<Product[]>([
    {
        id: "1",
        name: "Croissant",
        category: "Pastries",
        price: 5.00,
        cost: 2.00,
        stock: 45,
        unit: "pcs",
        image: "https://images.unsplash.com/photo-1733754348873-feeb45df3bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzYxOTE5MTc0fDA&ixlib=rb-4.1.0&q=80&w=400",
        description: "Buttery, flaky French pastry with a golden, crisp exterior and soft, layered interior. Baked fresh daily for the perfect breakfast treat.",
        ingredients: ["All-purpose flour", "Butter", "Milk", "Yeast", "Sugar", "Salt", "Eggs"],
        allergens: ["Gluten", "Dairy", "Eggs"],
        rating: 4.8
    },
    {
        id: "2",
        name: "Sourdough Bread",
        category: "Bread",
        price: 6.00,
        cost: 1.50,
        stock: 20,
        unit: "loaf",
        image: "https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjE4NTc4ODR8MA&ixlib=rb-4.1.0&q=80&w=400",
        description: "Traditional sourdough with a crispy crust and tangy flavor.",
        ingredients: ["Bread flour", "Water", "Salt", "Starter culture"],
        allergens: ["Gluten"],
        rating: 4.9
    },
    {
        id: "3",
        name: "Chocolate Chip Cookies",
        category: "Cookies",
        price: 3.00,
        cost: 0.80,
        stock: 60,
        unit: "pcs",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjE4NjYwMjV8MA&ixlib=rb-4.1.0&q=80&w=400",
        description: "Classic chewy cookies loaded with semi-sweet chocolate chips.",
        ingredients: ["Flour", "Butter", "Brown Sugar", "Chocolate Chips", "Eggs", "Vanilla"],
        allergens: ["Gluten", "Dairy", "Eggs", "Soy"],
        rating: 4.7
    },
    {
        id: "7",
        name: "Matcha Cake",
        category: "Cakes",
        price: 22.00,
        cost: 8.00,
        stock: 5,
        unit: "whole",
        image: "https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlJTIwZ3JlZW4lMjB0ZWF8ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Delicate layers of premium Japanese matcha cake with white chocolate cream frosting. A perfect balance of earthy tea flavor and sweetness.",
        ingredients: ["Cake flour", "Matcha powder", "Sugar", "Eggs", "Vegetable oil", "White chocolate", "Heavy cream"],
        allergens: ["Gluten", "Dairy", "Eggs"],
        rating: 5.0
    },
    {
        id: "10",
        name: "Matcha Latte",
        category: "Beverages",
        price: 5.50,
        cost: 1.20,
        stock: 100,
        unit: "cup",
        image: "https://images.unsplash.com/photo-1725799957338-51f677c0ffa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBsYXR0ZSUyMGRyaW5rfGVufDF8fHx8MTc2NDkxNzk0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Creamy matcha latte made with ceremonial grade matcha and steamed milk.",
        ingredients: ["Matcha powder", "Milk (or oat/almond)", "Hot water", "Honey (optional)"],
        allergens: ["Dairy (can be substituted)"],
        rating: 4.7
    }
]);

export function useProducts() {
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
        addProduct,
        updateProduct,
        deleteProduct
    };
}
