# 🍃 Matcha Bakery Management System

A specialized, modern, and visually stunning management system designed for artisan bakeries. Built with a premium **Matcha Green** aesthetic, this system streamlines operations from customer ordering to real-time inventory and ingredient tracking.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-646CFF?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

---

## 📸 Project Overview
This project was developed to solve the challenges of manual management in small-scale bakeries. It provides a tailor-made experience with a focus on cohesive brand identity, bakery-specific workflows, and high-performance automation.

### 🌟 Key Features
*   **⚡ Flash Sale Engine**: Integrated discount management with real-time countdowns and automated price updates.
*   **💬 Interactive Support**: Smart "Quick Help" support chat with localized response menus (EN, JP, VN).
*   **Admin Dashboard**: Real-time business analytics including revenue reports, active orders, and product performance.
*   **Orders Management**: Full state-based workflow (Pending → Baking → Completed → Cancelled).
*   **Inventory 2.0**: Specialized ingredient tracking with automated low-stock alerts.
*   **🌍 Multi-Language Support**: Premium internationalization engine with dynamic font switching for **English**, **Japanese**, and **Vietnamese**.
*   **🧪 Localization Lab**: Live translation editor for Managers to fine-tune the shop's voice in real-time.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vue 3 (Composition API), Vite, Tailwind CSS 4.0 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 |
| **Testing** | Vitest, Supertest (Ready for CI/CD) |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Language** | TypeScript (Strict Mode) |

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

### Running Tests
The project includes a robust testing infrastructure using Vitest:
```bash
# Run Client Tests
cd client && npm run test

# Run Server Tests
cd server && npm run test
```

---

## 📁 Project Structure
```text
├── client/                # Vue 3 Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI (Support Chat, Tables, Cards)
│   │   ├── composables/   # Logic, Auth, & i18n Engine
│   │   ├── views/         # Reports, Flash Sales, Admin Panel
│   └── vitest.config.ts   # Client test configuration
├── server/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/   # Business logic (Cart, Flash Sales, Orders)
│   │   ├── routes/        # API Endpoints
│   │   └── index.js       # Entry point
│   └── vitest.config.js   # Server test configuration
└── docker-compose.yml     # Infrastructure (Postgres, App, Adminer)
```

---

## 👨‍💻 Author
**Nguyễn Khánh Huy**
*   Student ID: 2052496
*   University: Ho Chi Minh City University of Technology (BK TP.HCM)
*   Topic: Specialized Bakery Management System

---

## 📄 License
This project is for educational purposes as part of the graduation project requirements.
