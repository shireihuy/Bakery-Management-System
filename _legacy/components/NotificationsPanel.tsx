import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Bell, AlertTriangle, Info, CheckCircle, X, Trash2, BellOff, AlertCircle, Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  category: 'inventory' | 'order' | 'system' | 'sales';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    category: 'inventory',
    title: 'Critical Stock Alert',
    message: 'Butter stock is critically low (45kg remaining). Minimum threshold is 60kg. Immediate restocking required.',
    timestamp: '2025-11-15T10:30:00',
    read: false,
    actionRequired: true
  },
  {
    id: '2',
    type: 'warning',
    category: 'inventory',
    title: 'Low Stock Warning',
    message: 'Flour stock is below minimum level (85kg remaining). Consider placing a purchase order soon.',
    timestamp: '2025-11-15T09:15:00',
    read: false,
    actionRequired: true
  },
  {
    id: '3',
    type: 'info',
    category: 'order',
    title: 'New Order Received',
    message: 'Order #ORD-2345 has been placed by Sarah Williams for $127.50. Review and process the order.',
    timestamp: '2025-11-15T08:45:00',
    read: false,
    actionRequired: true
  },
  {
    id: '4',
    type: 'success',
    category: 'order',
    title: 'Order Completed',
    message: 'Order #ORD-2340 has been successfully delivered to John Doe.',
    timestamp: '2025-11-15T07:20:00',
    read: true,
    actionRequired: false
  },
  {
    id: '5',
    type: 'warning',
    category: 'inventory',
    title: 'Low Stock Warning',
    message: 'Yeast stock is running low (25kg remaining). Minimum threshold is 30kg.',
    timestamp: '2025-11-14T16:30:00',
    read: false,
    actionRequired: true
  },
  {
    id: '6',
    type: 'info',
    category: 'sales',
    title: 'Daily Sales Target Achieved',
    message: 'Congratulations! Today\'s sales have exceeded the target by 15%. Total revenue: $2,890.',
    timestamp: '2025-11-14T20:00:00',
    read: true,
    actionRequired: false
  },
  {
    id: '7',
    type: 'alert',
    category: 'system',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance on November 20, 2025 from 2:00 AM to 4:00 AM. Plan accordingly.',
    timestamp: '2025-11-14T14:00:00',
    read: false,
    actionRequired: false
  },
  {
    id: '8',
    type: 'success',
    category: 'order',
    title: 'Purchase Order Delivered',
    message: 'Purchase Order PO-002 from Fresh Dairy Co. has been delivered successfully.',
    timestamp: '2025-11-14T11:30:00',
    read: true,
    actionRequired: false
  },
  {
    id: '9',
    type: 'info',
    category: 'sales',
    title: 'Top Product Update',
    message: 'Croissants remain the top-selling product this week with 145 units sold.',
    timestamp: '2025-11-13T18:00:00',
    read: true,
    actionRequired: false
  },
  {
    id: '10',
    type: 'warning',
    category: 'order',
    title: 'Delayed Order',
    message: 'Order #ORD-2325 is delayed due to ingredient shortage. Customer has been notified.',
    timestamp: '2025-11-13T15:45:00',
    read: true,
    actionRequired: false
  }
];

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action-required'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'inventory':
        return <Package className="w-4 h-4" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'sales':
        return <TrendingUp className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'success':
        return 'default' as const;
      case 'info':
        return 'default' as const;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'action-required') return n.actionRequired && !n.read;
    return true;
  });

  const notificationsByCategory = (category: Notification['category']) => 
    filteredNotifications.filter(n => n.category === category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-amber-900">Notifications</h2>
          <p className="text-sm text-amber-600">Stay updated with alerts and system messages</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {unreadCount} Unread
            </Badge>
          )}
          {actionRequiredCount > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {actionRequiredCount} Action Required
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-24 bg-gradient-to-br from-blue-100 to-cyan-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761625501365-ab081f5cbd7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RpZmljYXRpb24lMjBiZWxsJTIwYWxlcnR8ZW58MXx8fHwxNzYzMTEyMjk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Total Notifications"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bell className="w-12 h-12 text-blue-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Notifications</div>
            <div className="text-amber-900">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-24 bg-gradient-to-br from-red-100 to-pink-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761625501365-ab081f5cbd7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RpZmljYXRpb24lMjBiZWxsJTIwYWxlcnR8ZW58MXx8fHwxNzYzMTEyMjk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Unread"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <BellOff className="w-12 h-12 text-red-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Unread</div>
            <div className="text-amber-900">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-24 bg-gradient-to-br from-yellow-100 to-orange-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761625501365-ab081f5cbd7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RpZmljYXRpb24lMjBiZWxsJTIwYWxlcnR8ZW58MXx8fHwxNzYzMTEyMjk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Action Required"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Action Required</div>
            <div className="text-amber-900">{actionRequiredCount}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-24 bg-gradient-to-br from-green-100 to-emerald-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761625501365-ab081f5cbd7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RpZmljYXRpb24lMjBiZWxsJTIwYWxlcnR8ZW58MXx8fHwxNzYzMTEyMjk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Today"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-12 h-12 text-green-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Today</div>
            <div className="text-amber-900">
              {notifications.filter(n => {
                const notifDate = new Date(n.timestamp).toDateString();
                const today = new Date().toDateString();
                return notifDate === today;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Notifications Panel */}
      <Card className="border-amber-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-amber-900">All Notifications</CardTitle>
              <CardDescription>Manage your notifications and alerts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="all" onClick={() => setFilter('all')}>
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  Inventory ({notificationsByCategory('inventory').length})
                </TabsTrigger>
                <TabsTrigger value="orders">
                  Orders ({notificationsByCategory('order').length})
                </TabsTrigger>
                <TabsTrigger value="system">
                  System ({notificationsByCategory('system').length + notificationsByCategory('sales').length})
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[600px]">
              <TabsContent value="all" className="p-6 m-0 space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Bell className="w-16 h-16 mb-4" />
                    <p>No notifications to display</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`border transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? 'border-amber-300 bg-amber-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-amber-900">{notification.title}</h3>
                                {!notification.read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="secondary" className="text-xs">Action Required</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(notification.category)}
                                <span className="capitalize">{notification.category}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="unread" className="p-6 m-0 space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <CheckCircle className="w-16 h-16 mb-4" />
                    <p>No unread notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className="border border-amber-300 bg-amber-50 transition-all duration-200 hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-amber-900">{notification.title}</h3>
                                <Badge variant="destructive" className="text-xs">New</Badge>
                                {notification.actionRequired && (
                                  <Badge variant="secondary" className="text-xs">Action Required</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(notification.category)}
                                <span className="capitalize">{notification.category}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="inventory" className="p-6 m-0 space-y-3">
                {notificationsByCategory('inventory').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Package className="w-16 h-16 mb-4" />
                    <p>No inventory notifications</p>
                  </div>
                ) : (
                  notificationsByCategory('inventory').map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`border transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? 'border-amber-300 bg-amber-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-amber-900">{notification.title}</h3>
                                {!notification.read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="secondary" className="text-xs">Action Required</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="orders" className="p-6 m-0 space-y-3">
                {notificationsByCategory('order').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ShoppingCart className="w-16 h-16 mb-4" />
                    <p>No order notifications</p>
                  </div>
                ) : (
                  notificationsByCategory('order').map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`border transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? 'border-amber-300 bg-amber-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-amber-900">{notification.title}</h3>
                                {!notification.read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="secondary" className="text-xs">Action Required</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="system" className="p-6 m-0 space-y-3">
                {[...notificationsByCategory('system'), ...notificationsByCategory('sales')].length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Bell className="w-16 h-16 mb-4" />
                    <p>No system notifications</p>
                  </div>
                ) : (
                  [...notificationsByCategory('system'), ...notificationsByCategory('sales')].map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`border transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? 'border-amber-300 bg-amber-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-amber-900">{notification.title}</h3>
                                {!notification.read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="secondary" className="text-xs">Action Required</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(notification.category)}
                                <span className="capitalize">{notification.category}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
