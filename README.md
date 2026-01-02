# 🍃 Matcha Bakery Management System

A specialized, modern, and visually stunning management system designed for artisan bakeries. Built with a premium **Matcha Green** aesthetic, this system streamlines operations from customer ordering to real-time inventory and ingredient tracking.

---

## 📸 Project Overview
This project was developed to solve the challenges of manual management in small-scale bakeries. It provides a tailor-made experience that generic SaaS solutions often lack, focusing on a cohesive brand identity and bakery-specific workflows.

### 🌟 Key Features
*   **Customer Portal**: High-impact landing page, interactive product menu, and a seamless shopping cart experience.
*   **Admin Dashboard**: Real-time business analytics including total revenue, active orders, and product performance.
*   **Orders Management**: State-based workflow (Pending → Processing → Completed) with detailed order tracking.
*   **Inventory 2.0**: Specialized ingredient tracking with automated low-stock alerts and "Matcha Green" themed manager.
*   **Role-Based Access**: Secure authentication for Customers, Staff, and Administrators.
*   **Dockerized Environment**: Ready-to-deploy containers for the entire stack.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vue 3 (Composition API), Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **DevOps** | Docker, Docker Compose |
| **Language** | TypeScript (Strict Mode) |

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v22+ recommended)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for containerized setup)

### Option 1: Running with Docker (Recommended)
This is the fastest way to get the database, backend, and frontend running together.

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
    *   Frontend: `http://localhost:8080`
    *   Backend API: `http://localhost:3000`

### Option 2: Local Development
If you want to run the components individually:

**Frontend (Client):**
```bash
cd client
npm install
npm run dev
```

**Backend (Server):**
```bash
cd server
npm install
node src/index.js
```

---

## 📁 Project Structure
```text
├── client/                # Vue 3 Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── composables/   # Business logic (useOrders, useProducts, etc.)
│   │   ├── views/         # Page components (Dashboard, CustomerView, etc.)
│   │   └── router/        # Navigation logic
│   └── Dockerfile
├── server/                # Node.js Express API
│   ├── src/
│   │   ├── routes/        # API Endpoints
│   │   └── index.js       # Entry point
│   └── Dockerfile
└── docker-compose.yml     # Multi-container orchestration
```

---

## 🎨 Visual Identity
The system uses a custom **Matcha Twist** design language:
*   **Primary Colors**: Emerald Green, Forest Matcha.
*   **Aesthetics**: Glassmorphism, smooth micro-animations, and premium typography.

---

## 👨‍💻 Author
**Nguyễn Khánh Huy**
*   Student ID: 2052496
*   University: Ho Chi Minh City University of Technology (BK TP.HCM)
*   Topic: Specialized Bakery Management System

---

## 📄 License
This project is for educational purposes as part of the graduation project requirements.
