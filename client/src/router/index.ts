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
import { useAuth } from '../composables/useAuth'

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
            meta: { requiresAuth: true, roles: ['admin', 'manager', 'cashier', 'baker'] },
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
            meta: { requiresAuth: true, roles: ['admin', 'manager', 'cashier', 'baker'] },
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
            meta: { requiresAuth: true, roles: ['admin', 'manager', 'baker'] },
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
            meta: { requiresAuth: true, roles: ['admin', 'manager'] },
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
            meta: { requiresAuth: true },
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
            meta: { requiresAuth: true, roles: ['admin'] },
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
            meta: { requiresAuth: true, roles: ['admin', 'manager', 'cashier'] },
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
            meta: { requiresAuth: true },
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

router.beforeEach((to, _from, next) => {
    const { user } = useAuth()

    // Check if user is already logged in when visiting login/register
    if ((to.name === 'login' || to.name === 'register') && user.value) {
        return next({ name: 'home' })
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const allowedRoles = to.meta.roles as string[] | undefined

    if (requiresAuth && !user.value) {
        // Not logged in, redirect to login
        next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (requiresAuth && allowedRoles && !allowedRoles.includes(user.value?.role || '')) {
        // Logged in but doesn't have required role
        if (user.value?.role === 'customer') {
            next({ name: 'customer-view' })
        } else {
            next({ name: 'dashboard' })
        }
    } else {
        next()
    }
})

export default router
