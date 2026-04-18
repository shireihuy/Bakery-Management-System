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
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 5,
    unit VARCHAR(50) DEFAULT 'pcs',
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ingredients JSONB DEFAULT '[]',
    allergens JSONB DEFAULT '[]'
);

-- Product Ratings Table
CREATE TABLE IF NOT EXISTS product_ratings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
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

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
    usage_limit INTEGER DEFAULT NULL,
    usage_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255), -- UUID for registered users, 'GUEST' for walk-ins
    customer_name VARCHAR(255), -- Stores name for walk-ins or snapshot for users
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    coupon_id INTEGER REFERENCES coupons(id) DEFAULT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Baking, Ready, Completed, Cancelled
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'Pending',
    transaction_id VARCHAR(255),
    payment_url TEXT,
    qr_code TEXT,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    delivery_type VARCHAR(20) DEFAULT 'Pick-up',
    cancel_reason TEXT
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
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_id VARCHAR(255)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default Payment Settings
INSERT INTO system_settings (key, value) VALUES
('payment_qr_config', '{
    "bankId": "vpb",
    "accountNumber": "12345678",
    "accountName": "THE ARTISAN BAKERY",
    "messageTemplate": "Bakery Payment for #{orderId}"
}')
ON CONFLICT (key) DO NOTHING;

-- Predefined Tags Table
CREATE TABLE IF NOT EXISTS predefined_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL -- 'ingredient' or 'allergen'
);

-- Seed Initial Tags
INSERT INTO predefined_tags (name, type) VALUES
('Flour', 'ingredient'),
('Sugar', 'ingredient'),
('Butter', 'ingredient'),
('Eggs', 'ingredient'),
('Milk', 'ingredient'),
('Yeast', 'ingredient'),
('Salt', 'ingredient'),
('Matcha Powder', 'ingredient'),
('Chocolate Chips', 'ingredient'),
('Vanilla Extract', 'ingredient'),
('Milk', 'allergen'),
('Eggs', 'allergen'),
('Nuts', 'allergen'),
('Wheat', 'allergen'),
('Soy', 'allergen'),
('Dairy', 'allergen'),
('Gluten', 'allergen')
ON CONFLICT (name) DO NOTHING;

-- Initial Products
INSERT INTO products (id, name, category, price, description, image_url, stock_quantity) VALUES
(1, 'Matcha Croissant', 'Pastries', 5.00, 'Buttery, flaky French pastry with a golden, crisp exterior and soft, layered interior.', 'https://images.unsplash.com/photo-1733754348873-feeb45df3bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzYxOTE5MTc0fDA&ixlib=rb-4.1.0&q=80&w=400', 50),
(2, 'Sourdough Bread', 'Bread', 6.00, 'Traditional sourdough with a crispy crust and tangy flavor.', 'https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjE4NTc4ODR8MA&ixlib=rb-4.1.0&q=80&w=400', 20),
(3, 'Chocolate Chip Cookies', 'Cookies', 3.00, 'Classic chewy cookies loaded with semi-sweet chocolate chips.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjE4NjYwMjV8MA&ixlib=rb-4.1.0&q=80&w=400', 100),
(4, 'Matcha Mochi Donut', 'Donuts', 3.50, 'Chewy, pull-apart mochi donuts with a vibrant matcha glaze.', 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2NoaSUyMGRvbnV0fGVufDF8fHx8MTc2NDkzOTgwNHww&ixlib=rb-4.1.0&q=80&w=400', 40),
(5, 'Green Tea Macarons', 'Pastries', 12.00, 'Elegant French macarons filled with rich matcha ganache.', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNhcm9uc3xlbnwxfHx8fDE3NjQ5Mzk4NTB8MA&ixlib=rb-4.1.0&q=80&w=400', 60),
(6, 'Matcha Cheesecake', 'Cakes', 7.50, 'Velvety smooth cheesecake with a hint of matcha and a graham cracker crust.', 'https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlfGVufDF8fHx8MTc2NDkzOTc1OHww&ixlib=rb-4.1.0&q=80&w=400', 15),
(7, 'Matcha Cake', 'Cakes', 22.00, 'Delicate layers of premium Japanese matcha cake with white chocolate cream frosting.', 'https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlJTIwZ3JlZW4lMjB0ZWF8ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080', 10),
(10, 'Matcha Latte', 'Beverages', 5.50, 'Creamy matcha latte made with ceremonial grade matcha and steamed milk.', 'https://images.unsplash.com/photo-1725799957338-51f677c0ffa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBsYXR0ZSUyMGRyaW5rfGVufDF8fHx8MTc2NDkxNzk0Nnww&ixlib=rb-4.1.0&q=80&w=1080', 30)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    stock_quantity = EXCLUDED.stock_quantity;

-- Reset serial sequence
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Assigned, Dispatched, In Transit, Delivered, Failed
    tracking_number VARCHAR(100),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    estimated_time TIMESTAMP WITH TIME ZONE,
    actual_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flash Sales Tables
CREATE TABLE IF NOT EXISTS flash_sales (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flash_sale_items (
    id SERIAL PRIMARY KEY,
    flash_sale_id INTEGER REFERENCES flash_sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sale_price DECIMAL(10, 2) NOT NULL,
    flash_sale_stock INTEGER NOT NULL,
    sold_quantity INTEGER DEFAULT 0,
    UNIQUE(flash_sale_id, product_id)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

