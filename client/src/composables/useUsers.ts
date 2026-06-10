import { ref } from "vue";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | /* 'Baker' */ "Cashier" | "Customer";
  status: "active" | "inactive";
  phone?: string;
  address?: string;
  province_id?: number | null;
  district_id?: number | null;
  ward_code?: string | null;
  joinDate: string;
}

import { API_URL } from "../config/api";

const users = ref<User[]>([]);

export function useUsers() {
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        users.value = data.map((u: any) => ({
          ...u,
          role: u.role as User["role"]
        }));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const addUser = async (
    userData: Omit<User, "id" | "joinDate"> & { password?: string }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userData,
          phone_number: userData.phone // Mapping frontend 'phone' to backend 'phone_number'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user");
      }

      const newUser = await response.json();
      await fetchUsers(); // Refresh list
      return newUser;
    } catch (err) {
      console.error("Failed to add user:", err);
      throw err;
    }
  };

  const updateUser = async (
    id: string,
    updates: Partial<Omit<User, "id" | "joinDate">>
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        await fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    fetchUsers
  };
}
