-- Create Roles/Enum for RBAC
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Baker', 'Cashier', 'Customer');
    END IF;
END $$;

-- Users Table (Combines Employee and Customer logic from Class Diagram)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role user_role DEFAULT 'Customer',
    status VARCHAR(20) DEFAULT 'active',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL -- e.g., kg, liters, units
);

-- Inventory Table (Tracks stock level of ingredients)
CREATE TABLE IF NOT EXISTS inventory (
    ingredient_id INTEGER PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255), -- UUID for registered users, 'GUEST' for walk-ins
    customer_name VARCHAR(255), -- Stores name for walk-ins or snapshot for users
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Baking, Ready, Completed, Cancelled
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE
);

-- Order Details (Line items)
CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- Cash, Credit Card, etc.
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data (Optional - Admin Account)
-- Password is 'admin123' (hashed version should be used in production)
-- INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@bakery.com', '$2b$10$YourHashedPasswordHere', 'Admin');

-- Initial Products
INSERT INTO products (id, name, category, price, description, image_url) VALUES
(1, 'Croissant', 'Pastries', 5.00, 'Buttery, flaky French pastry with a golden, crisp exterior and soft, layered interior.', 'https://images.unsplash.com/photo-1733754348873-feeb45df3bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzYxOTE5MTc0fDA&ixlib=rb-4.1.0&q=80&w=400'),
(2, 'Sourdough Bread', 'Bread', 6.00, 'Traditional sourdough with a crispy crust and tangy flavor.', 'https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjE4NTc4ODR8MA&ixlib=rb-4.1.0&q=80&w=400'),
(3, 'Chocolate Chip Cookies', 'Cookies', 3.00, 'Classic chewy cookies loaded with semi-sweet chocolate chips.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjE4NjYwMjV8MA&ixlib=rb-4.1.0&q=80&w=400'),
(7, 'Matcha Cake', 'Cakes', 22.00, 'Delicate layers of premium Japanese matcha cake with white chocolate cream frosting.', 'https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlJTIwZ3JlZW4lMjB0ZWF8ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080'),
(10, 'Matcha Latte', 'Beverages', 5.50, 'Creamy matcha latte made with ceremonial grade matcha and steamed milk.', 'https://images.unsplash.com/photo-1725799957338-51f677c0ffa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBsYXR0ZSUyMGRyaW5rfGVufDF8fHx8MTc2NDkxNzk0Nnww&ixlib=rb-4.1.0&q=80&w=1080')
ON CONFLICT (id) DO NOTHING;

-- Reset serial sequence
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
