import { ref, readonly } from "vue";
import { socketService } from "../services/socket";

export interface ProductBatch {
  readonly id: number;
  readonly productId: string;
  readonly quantity: number;
  readonly expirationDate: string | null;
  readonly receivedAt: string;
  readonly notes: string | null;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly cost?: number;
  readonly stock: number;
  readonly activeQuantity?: number;
  readonly totalQuantity?: number;
  readonly unit?: string;
  readonly image: string;
  readonly description?: string;
  readonly ingredients?: readonly string[];
  readonly allergens?: readonly string[];
  readonly rating?: number;
  readonly totalVotes?: number;
  readonly expirationDate?: string | null;
  readonly batches?: readonly ProductBatch[];
  readonly nearestExpiry?: string | null;
  readonly hasExpiredBatch?: boolean;
  readonly flashSale?: {
    readonly salePrice: number;
    readonly stock: number;
    readonly sold: number;
    readonly endTime: string;
  } | null;
}

import { API_URL } from "../config/api";

const products = ref<Product[]>([]);

export function useProducts() {
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      // Map image path to full URL if it's a relative path from the server
      const productsWithFullUrls = data.map((p: any) => ({
        ...p,
        image: p.image?.startsWith("/")
          ? `${API_URL.replace("/api", "")}${p.image}`
          : p.image
      }));

      products.value = productsWithFullUrls;
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const addProduct = async (productData: any) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          } else if (typeof value === "string" && value.trim()) {
            formData.append("image_url", value);
          }
        } else if (value !== undefined && value !== null) {
          // Send arrays as JSON strings
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: getAuthHeader(),
        body: formData
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to add product");
      }
      const created = await response.json();
      await fetchProducts();
      return created;
    } catch (err) {
      console.error("Error adding product:", err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          } else if (typeof value === "string" && value.trim()) {
            formData.append("image_url", value);
          }
        } else if (value !== undefined && value !== null) {
          // Send arrays as JSON strings
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: formData
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to update product");
      }
      const updated = await response.json();
      await fetchProducts();
      return updated;
    } catch (err) {
      console.error("Error updating product:", err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err;
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/products/tags`);
      if (!response.ok) throw new Error("Failed to fetch tags");
      return await response.json();
    } catch (err) {
      console.error("Error fetching tags:", err);
      return { ingredients: [], allergens: [] };
    }
  };

  const submitRating = async (id: string, rating: number) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}/rate`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) throw new Error("Failed to submit rating");
      await fetchProducts();
    } catch (err) {
      console.error("Error submitting rating:", err);
      throw err;
    }
  };

  const resetRatings = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}/ratings`, {
        method: "DELETE",
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error("Failed to reset ratings");
      await fetchProducts();
    } catch (err) {
      console.error("Error resetting ratings:", err);
      throw err;
    }
  };

  return {
    products: readonly(products),
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchTags,
    submitRating,
    resetRatings
  };
}

// Global listener for product updates
socketService.on("stock:updated", () => {
  const { fetchProducts } = useProducts();
  fetchProducts();
});

socketService.on("product:rating_updated", () => {
  const { fetchProducts } = useProducts();
  fetchProducts();
});
