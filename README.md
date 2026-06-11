# 🍃 Matcha Bakery Management System

A specialized, modern, and visually stunning management system designed for artisan bakeries. Built with a premium **Matcha Green** aesthetic, this system streamlines operations from customer ordering to real-time inventory and ingredient tracking.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-646CFF?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![PayOS](https://img.shields.io/badge/PayOS-Payments-7B68EE?style=flat-square)]()
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Chatbot-8E75B2?style=flat-square)](https://ai.google.dev/)

---

## 📸 Project Overview
This project was developed to solve the challenges of manual management in small-scale bakeries. It provides a tailor-made experience with a focus on cohesive brand identity, bakery-specific workflows, and high-performance automation. The system supports **three languages** (English, Japanese, Vietnamese) and integrates with **PayOS** for online payments, **GHN** for delivery logistics, and **Gemini AI** for an intelligent customer support chatbot.

---

## 🌟 Key Features

### Customer-Facing
*   **🛍️ Product Catalog** — Browse products with real-time stock visibility, batch tracking, and flash sale pricing.
*   **🛒 Cart & Checkout** — Add items with live stock validation against active (non-expired) batches.
*   **💳 Online Payments** — PayOS integration for QR code and bank transfer payments.
*   **🚚 Delivery** — GHN (Giao Hàng Nhanh) integration for shipping quotes and order tracking.
*   **💬 AI Chatbot** — Gemini-powered assistant that answers bakery questions, order status, and product info in EN, JP, or VN.

### Staff / Admin
*   **📊 Admin Dashboard** — Real-time analytics: revenue, active orders, top products, and low-stock alerts.
*   **⚡ Flash Sales** — Create time-limited discounts with stock caps and real-time countdowns.
*   **📦 Order Management** — Full state workflow (Pending → Ready → Completed → Cancelled) with batch-aware stock restoration on cancellation.
*   **🧪 Batch Inventory** — FEFO (First-Expiry-First-Out) tracking with `product_batches` and `order_detail_allocations`. Each order deducts from the nearest-expiring batch first.
*   **🔔 Notifications** — Real-time socket-based alerts for low stock, new orders, and support messages.
*   **🌍 Localization Lab** — Live translation editor for Managers to fine-tune the shop's multilingual voice.
*   **🔐 Role-Based Access** — Admin, Manager, Cashier, and Customer roles with session management.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vue 3 (Composition API, `<script setup>`), Vite 6, Tailwind CSS 4.0 |
| **Backend** | Node.js 22, Express.js |
| **Database** | PostgreSQL 15 with `pg` driver |
| **Testing** | Vitest, Supertest (20 test suites, 118+ tests) |
| **Real-time** | Socket.io (chat, stock updates, notifications) |
| **AI** | Google Gemini API (domain-locked chatbot) |
| **Payments** | PayOS (QR code / bank transfer) |
| **Delivery** | GHN API (shipping quotes & tracking) |
| **Auth** | JWT + bcryptjs + Turnstile (Cloudflare bot check) |
| **Storage** | Cloudinary (image uploads), Multer |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Hosting** | Vercel (frontend), Railway (backend + DB) |

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v22+)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)

### Running with Docker (Recommended)
1.  **Clone and Start**:
    ```bash
    git clone https://github.com/shireihuy/Bakery-Management-System.git
    cd Bakery-Management-System
    docker compose up --build -d
    ```
2.  **Access the apps**:
    *   **Frontend**: `http://localhost:8080`
    *   **Backend API**: `http://localhost:3000`
    *   **Adminer (DB UI)**: `http://localhost:8085`

### Environment Variables
Copy `server/.env` and configure:
| Variable | Description |
| :--- | :--- |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection |
| `JWT_SECRET` | Token signing secret |
| `GEMINI_API_KEY` | Google Gemini AI key for chatbot |
| `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | PayOS payment gateway |
| `GHN_TOKEN`, `GHN_SHOP_ID` | GHN delivery integration |
| `CLOUDINARY_*` | Image hosting |
| `TURNSTILE_SECRET_KEY` | Cloudflare bot protection |

### 🌐 Cloud Deployments

| Service | URL | Tech |
| :--- | :--- | :--- |
| **Frontend** (Vercel) | [https://bakery-management-system.vercel.app](https://bakery-management-system.vercel.app) | Vue 3 + Vite (static SPA) |
| **Backend API** (Railway) | [https://bakery-management-system-production-a124.up.railway.app](https://bakery-management-system-production-a124.up.railway.app) | Node.js + Express |
| **Database** (Railway) | PostgreSQL 15 (managed via Railway) | `order_detail_allocations` for batch tracking |

The frontend is deployed on **Vercel** (static build with SPA rewrites), while the backend and PostgreSQL database are hosted on **Railway**. Database migrations run automatically on server startup via `node src/scripts/migrate.js`.

### Running Tests
The project includes 20 test suites (118+ tests) using Vitest:
```bash
# Run Client Tests
cd client && npm run test

# Run Server Tests
cd server && npm run test

# With Coverage
cd server && npm run test:coverage
```

---

## 📁 Project Structure
```text
├── client/                # Vue 3 Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # Reusable UI (Support Chat, Tables, Cards)
│   │   ├── composables/   # Logic, Auth, & i18n Engine
│   │   ├── views/         # Reports, Flash Sales, Admin Panel
│   │   └── config/        # API client configuration
│   ├── public/            # Static assets
│   └── dist/              # Production build output
├── server/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/   # Business logic (Orders, Cart, Batches, etc.)
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # External integrations (PayOS, GHN)
│   │   ├── middleware/     # Auth, role guards
│   │   ├── utils/         # Helpers (batchStock, imageUrl, ghnClient)
│   │   ├── scripts/       # migrate.js (auto-run on startup)
│   │   └── config/        # Database pool, PayOS config
│   ├── db/
│   │   └── init.sql       # Schema with all tables, indexes, seeds
│   └── uploads/           # Local file uploads
├── docker-compose.yml     # Postgres 15 + API + Client + Adminer
└── vercel.json            # Vercel SPA deployment config
```

---

## 🗄️ Database Schema Highlights

| Table | Purpose |
| :--- | :--- |
| `users` | Customers & staff with RBAC roles |
| `products` | Catalog with ingredients, allergens, stock levels |
| `product_batches` | Batch-level inventory with expiration tracking |
| `order_detail_allocations` | FEFO allocation tracking per order line |
| `orders` / `order_details` | Customer orders with status workflow |
| `payments` | Payment records linked to orders |
| `coupons` | Discount codes with usage limits |
| `flash_sales` / `flash_sale_items` | Time-limited promotions |
| `notifications` | In-app notification queue |
| `cart_items` | Per-user shopping cart |
| `deliveries` | GHN delivery tracking |
| `chat_messages` | Support chat history |
| `inventory` / `ingredients` | Raw ingredient stock management |

---

## 👨‍💻 Author
**Nguyễn Khánh Huy**
*   Student ID: 2052496
*   University: Ho Chi Minh City University of Technology (BK TP.HCM)
*   Topic: Specialized Bakery Management System

---

## 📄 License
This project is for educational purposes as part of the graduation project requirements.
