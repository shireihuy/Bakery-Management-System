# 🍃 Matcha Bakery Management System

A specialized, modern, and visually stunning management system designed for artisan bakeries. Built with a premium **Matcha Green** aesthetic, this system streamlines operations from customer ordering to real-time inventory and ingredient tracking.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

---

## 📸 Project Overview
This project was developed to solve the challenges of manual management in small-scale bakeries. It provides a tailor-made experience that generic SaaS solutions often lack, focusing on a cohesive brand identity and bakery-specific workflows.

### 🌟 Key Features
*   **Customer Portal**: High-impact landing page, interactive product menu, and a seamless shopping cart experience.
*   **Admin Dashboard**: Real-time business analytics including total revenue, active orders, and product performance.
*   **Orders Management**: State-based workflow (Pending → Baking → Completed → Cancelled) with detailed tracking.
*   **Inventory 2.0**: Specialized ingredient tracking with automated low-stock alerts.
*   **Role-Based Access**: Secure authentication with specific views for Customers, Cashiers, Bakers, and Administrators.
*   **🌍 Multi-Language Support**: Full internationalization for **English**, **Japanese**, and **Vietnamese**, including dynamic font switching.
*   **🧪 Localization Lab**: A built-in, live translation editor for Administrators and Managers to fine-tune the shop's voice in real-time.

---

## 🌍 Internationalization (i18n)
The system features a premium localization engine that goes beyond simple text replacement:
*   **Live Switching**: Change languages instantly without page reloads.
*   **Dynamic Typography**: Automatically switches between **Outfit** (EN), **Noto Sans JP** (JP), and **Be Vietnam Pro** (VN) for perfect readability.
*   **Localization Lab**: A specialized UI (restricted to Managers) to edit any translation key live on the site. Search, filter by category, and save changes globally.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vue 3 (Composition API), Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 |
| **DevOps** | Docker, Docker Compose, Nginx (Production Build) |
| **Language** | TypeScript (Strict Mode) |

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v22+)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)

### Option 1: Running with Docker (Recommended)
1.  Clone the repository:
    ```bash
    git clone https://github.com/shireihuy/Bakery-Management-System.git
    cd Bakery-Management-System
    ```
2.  Start the containers:
    ```bash
    docker-compose up --build
    ```
3.  Access the apps:
    *   **Frontend**: `http://localhost:8080`
    *   **Database UI (Adminer)**: `http://localhost:8085`
    *   **Backend API**: `http://localhost:3000`

### Option 2: Local Development
**Frontend:**
```bash
cd client && npm install && npm run dev
```
**Backend:**
```bash
cd server && npm install && node src/index.js
```

---

## 🔐 Demo Credentials
Test the system with these pre-configured roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@bakery.com` | `adminpassword` |
| **Customer** | `john@example.com` | `password123` |

---

## 📁 Project Structure
```text
├── client/                # Vue 3 Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI & Floating Settings
│   │   ├── composables/   # Business logic & i18n Engine
│   │   ├── views/         # Role-specific page components
│   │   └── router/        # Guarded navigation logic
│   └── Dockerfile
├── server/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/   # Business logic handlers
│   │   ├── routes/        # API Endpoints
│   │   └── index.js       # Entry point
│   └── Dockerfile
└── docker-compose.yml     # Infrastructure (Postgres, App, Adminer)
```

---

## 🎨 Visual Identity
The system uses a custom **Matcha Twist** design language:
*   **Primary Colors**: Emerald Green, Forest Matcha, Creamy White.
*   **Aesthetics**: Glassmorphism, smooth micro-animations, and premium localized typography.

---

## 👨‍💻 Author
**Nguyễn Khánh Huy**
*   Student ID: 2052496
*   University: Ho Chi Minh City University of Technology (BK TP.HCM)
*   Topic: Specialized Bakery Management System

---

## 📄 License
This project is for educational purposes as part of the graduation project requirements.
