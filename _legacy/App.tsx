import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { OrdersProvider } from './contexts/OrdersContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import Dashboard from './components/Dashboard';
import ProductsManager from './components/ProductsManager';
import OrdersManager from './components/OrdersManager';
import InventoryManager from './components/InventoryManager';
import CustomerView from './components/CustomerView';
import UserManager from './components/UserManager';
import ReportsAnalytics from './components/ReportsAnalytics';
import NotificationsPanel from './components/NotificationsPanel';
import Settings from './components/Settings';
import { LayoutDashboard, Package, ShoppingCart, Warehouse, LogOut, User, Users, BarChart3, Bell, Settings as SettingsIcon } from 'lucide-react';

function AppContent() {
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Show landing page if not authenticated and showLanding is true
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Show login/register if not authenticated
  if (!user) {
    return authMode === 'login' 
      ? <LoginPage onToggleMode={() => setAuthMode('register')} onBackToHome={() => setShowLanding(true)} />
      : <RegisterPage onToggleMode={() => setAuthMode('login')} onBackToHome={() => setShowLanding(true)} />;
  }

  // Role-based access control
  const canAccessDashboard = ['admin', 'manager'].includes(user.role);
  const canAccessProducts = ['admin', 'manager', 'cashier'].includes(user.role);
  const canAccessOrders = ['admin', 'manager', 'cashier', 'baker'].includes(user.role);
  const canAccessInventory = ['admin', 'manager', 'baker'].includes(user.role);
  const canAccessReports = ['admin', 'manager'].includes(user.role);
  const canAccessNotifications = ['admin', 'manager', 'cashier', 'baker'].includes(user.role);
  const canAccessUsers = user.role === 'admin';
  const isCustomer = user.role === 'customer';

  // Customer gets a special view
  if (isCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <header className="bg-white border-b border-green-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-green-900">Matcha Bakery</h1>
                  <p className="text-sm text-green-600">Fresh baked goods daily</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-900">{user.name}</span>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  className="border-green-200 hover:bg-green-50"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="border-green-200 hover:bg-green-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <CustomerView />
        </main>

        <Settings open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    );
  }

  // Staff view with role-based tabs
  const availableTabs = [];
  if (canAccessDashboard) availableTabs.push('dashboard');
  if (canAccessProducts) availableTabs.push('products');
  if (canAccessOrders) availableTabs.push('orders');
  if (canAccessInventory) availableTabs.push('inventory');
  if (canAccessReports) availableTabs.push('reports');
  if (canAccessNotifications) availableTabs.push('notifications');
  if (canAccessUsers) availableTabs.push('users');

  // Set default tab to first available
  if (!availableTabs.includes(activeTab)) {
    setActiveTab(availableTabs[0]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="bg-white border-b border-green-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-green-900">Matcha Bakery Management</h1>
                <p className="text-sm text-green-600">Manage your bakery operations efficiently</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-900">{user.name}</span>
                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="border-green-200 hover:bg-green-50"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="border-green-200 hover:bg-green-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex w-auto h-auto">
            {canAccessDashboard && (
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
            )}
            {canAccessProducts && (
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
            )}
            {canAccessOrders && (
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
            )}
            {canAccessInventory && (
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                <span className="hidden sm:inline">Inventory</span>
              </TabsTrigger>
            )}
            {canAccessReports && (
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            )}
            {canAccessNotifications && (
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            )}
            {canAccessUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          {canAccessDashboard && (
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
          )}

          {canAccessProducts && (
            <TabsContent value="products">
              <ProductsManager />
            </TabsContent>
          )}

          {canAccessOrders && (
            <TabsContent value="orders">
              <OrdersManager />
            </TabsContent>
          )}

          {canAccessInventory && (
            <TabsContent value="inventory">
              <InventoryManager />
            </TabsContent>
          )}

          {canAccessReports && (
            <TabsContent value="reports">
              <ReportsAnalytics />
            </TabsContent>
          )}

          {canAccessNotifications && (
            <TabsContent value="notifications">
              <NotificationsPanel />
            </TabsContent>
          )}

          {canAccessUsers && (
            <TabsContent value="users">
              <UserManager />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {isSettingsOpen && (
        <Settings open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <OrdersProvider>
          <AppContent />
          <Toaster position="top-right" />
        </OrdersProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}