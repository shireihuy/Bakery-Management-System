import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import Dashboard from '../views/Dashboard.vue'
import ProductsManager from '../views/ProductsManager.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import CustomerView from '../views/CustomerView.vue'
import Settings from '../views/Settings.vue'
import OrdersView from '../views/OrdersView.vue'
import UsersView from '../views/UsersView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import InventoryView from '../views/InventoryView.vue'
import ReportsView from '../views/ReportsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: LandingPage
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterPage
        },
        {
            path: '/dashboard',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: Dashboard
                }
            ]
        },
        {
            path: '/orders',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'orders',
                    component: OrdersView
                }
            ]
        },
        {
            path: '/inventory',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'inventory',
                    component: InventoryView
                }
            ]
        },
        {
            path: '/reports',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'reports',
                    component: ReportsView
                }
            ]
        },
        {
            path: '/notifications',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'notifications',
                    component: NotificationsView
                }
            ]
        },
        {
            path: '/users',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'users',
                    component: UsersView
                }
            ]
        },
        {
            path: '/products',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'products',
                    component: ProductsManager
                }
            ]
        },
        {
            path: '/customer',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'customer-view',
                    component: CustomerView
                }
            ]
        },
        {
            path: '/settings',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'settings',
                    component: Settings
                }
            ]
        }
    ]
})

export default router
