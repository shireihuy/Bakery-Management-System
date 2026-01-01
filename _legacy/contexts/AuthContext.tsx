import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'customer' | 'cashier' | 'baker' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: UserRole, phone?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database (in a real app, this would be in a backend)
const MOCK_USERS = [
  { id: '1', email: 'admin@bakery.com', password: 'admin123', name: 'Admin User', role: 'admin' as UserRole },
  { id: '2', email: 'manager@bakery.com', password: 'manager123', name: 'Manager User', role: 'manager' as UserRole },
  { id: '3', email: 'baker@bakery.com', password: 'baker123', name: 'Baker User', role: 'baker' as UserRole },
  { id: '4', email: 'cashier@bakery.com', password: 'cashier123', name: 'Cashier User', role: 'cashier' as UserRole },
  { id: '5', email: 'customer@bakery.com', password: 'customer123', name: 'Customer User', role: 'customer' as UserRole },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('bakery_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('bakery_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole,
    phone?: string,
    address?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role,
      phone,
      address
    };

    MOCK_USERS.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('bakery_user', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bakery_user');
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update user in MOCK_USERS
    const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updates };
    }

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('bakery_user', JSON.stringify(updatedUser));
    
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasAccess, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}