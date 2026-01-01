import { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  unit?: string;
  image: string;
  description?: string;
  ingredients?: string[];
  allergens?: string[];
  rating?: number;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
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
    cost: 2.50, 
    stock: 30, 
    unit: "loaf", 
    image: "https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjE4NTc4ODR8MA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Traditional sourdough with a crispy crust and tangy flavor. Made with our 100-year-old starter culture for authentic taste.",
    ingredients: ["Wheat flour", "Water", "Sourdough starter", "Sea salt"],
    allergens: ["Gluten"],
    rating: 4.9
  },
  { 
    id: "3", 
    name: "Chocolate Chip Cookies", 
    category: "Cookies", 
    price: 3.00, 
    cost: 1.20, 
    stock: 120, 
    unit: "pcs", 
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjE4NjYwMjV8MA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Classic chocolate chip cookies with a crispy edge and chewy center. Packed with premium chocolate chips in every bite.",
    ingredients: ["Flour", "Butter", "Brown sugar", "Eggs", "Chocolate chips", "Vanilla extract", "Baking soda", "Salt"],
    allergens: ["Gluten", "Dairy", "Eggs", "Soy"],
    rating: 4.7
  },
  { 
    id: "4", 
    name: "Baguette", 
    category: "Bread", 
    price: 4.50, 
    cost: 1.80, 
    stock: 25, 
    unit: "pcs", 
    image: "https://images.unsplash.com/photo-1568471173242-461f0a730452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBiYWd1ZXR0ZXxlbnwxfHx8fDE3NjE5NjcyMzl8MA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Authentic French baguette with a crispy golden crust and airy interior. Perfect for sandwiches or as a side to any meal.",
    ingredients: ["Wheat flour", "Water", "Yeast", "Salt"],
    allergens: ["Gluten"],
    rating: 4.6
  },
  { 
    id: "5", 
    name: "Blueberry Muffin", 
    category: "Muffins", 
    price: 4.00, 
    cost: 1.50, 
    stock: 60, 
    unit: "pcs", 
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlYmVycnklMjBtdWZmaW5zfGVufDF8fHx8MTc2MTkxOTE3NXww&ixlib=rb-4.1.0&q=80&w=400",
    description: "Moist and fluffy blueberry muffins bursting with fresh blueberries. Topped with a sweet crumble for extra texture.",
    ingredients: ["Flour", "Fresh blueberries", "Sugar", "Butter", "Eggs", "Milk", "Baking powder", "Vanilla extract"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    rating: 4.5
  },
  { 
    id: "6", 
    name: "Apple Pie", 
    category: "Pies", 
    price: 18.00, 
    cost: 8.00, 
    stock: 12, 
    unit: "whole", 
    image: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHBsZSUyMHBpZXxlbnwxfHx8fDE3NjE5Mzc5ODR8MA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Classic American apple pie with a flaky butter crust and cinnamon-spiced apple filling. Served whole, perfect for sharing.",
    ingredients: ["Apples", "Flour", "Butter", "Sugar", "Cinnamon", "Nutmeg", "Lemon juice", "Salt"],
    allergens: ["Gluten", "Dairy"],
    rating: 4.9
  },
  { 
    id: "7", 
    name: "Matcha Cake", 
    category: "Cakes", 
    price: 22.00, 
    cost: 10.00, 
    stock: 15, 
    unit: "whole", 
    image: "https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlJTIwZ3JlZW4lMjB0ZWF8ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Delicate layers of premium Japanese matcha cake with white chocolate cream frosting. A perfect balance of earthy matcha and subtle sweetness.",
    ingredients: ["Premium matcha powder", "Cake flour", "Sugar", "Eggs", "Butter", "Milk", "White chocolate", "Heavy cream", "Vanilla extract"],
    allergens: ["Gluten", "Dairy", "Eggs", "Soy"],
    rating: 5.0
  },
  { 
    id: "8", 
    name: "Matcha Croissant", 
    category: "Pastries", 
    price: 6.50, 
    cost: 2.80, 
    stock: 35, 
    unit: "pcs", 
    image: "https://images.unsplash.com/photo-1696029741809-12b752232b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Our signature buttery croissant infused with vibrant matcha green tea. Flaky layers with a subtle earthy flavor and beautiful green hue.",
    ingredients: ["All-purpose flour", "Butter", "Matcha powder", "Milk", "Yeast", "Sugar", "Salt", "Eggs"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    rating: 4.9
  },
  { 
    id: "9", 
    name: "Matcha White Chocolate Cookies", 
    category: "Cookies", 
    price: 4.50, 
    cost: 1.80, 
    stock: 80, 
    unit: "pcs", 
    image: "https://images.unsplash.com/photo-1622170344594-1854c0c4d7d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjb29raWVzJTIwZ3JlZW58ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Soft and chewy matcha cookies studded with white chocolate chips. The perfect combination of earthy matcha and sweet white chocolate.",
    ingredients: ["Flour", "Matcha powder", "Butter", "Sugar", "Eggs", "White chocolate chips", "Baking powder", "Salt"],
    allergens: ["Gluten", "Dairy", "Eggs", "Soy"],
    rating: 4.8
  },
  { 
    id: "10", 
    name: "Matcha Latte", 
    category: "Beverages", 
    price: 5.50, 
    cost: 2.00, 
    stock: 50, 
    unit: "cups", 
    image: "https://images.unsplash.com/photo-1725799957338-51f677c0ffa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBsYXR0ZSUyMGRyaW5rfGVufDF8fHx8MTc2NDkxNzk0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Creamy matcha latte made with ceremonial grade matcha and steamed milk. Served hot or iced with beautiful latte art.",
    ingredients: ["Ceremonial grade matcha", "Fresh milk", "Simple syrup", "Hot water"],
    allergens: ["Dairy"],
    rating: 4.7
  },
];

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(products.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}