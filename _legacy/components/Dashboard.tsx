import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function Dashboard() {
  const stats = [
    {
      title: "Today's Sales",
      value: "$1,245",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Pending Orders",
      value: "23",
      change: "+3",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Products",
      value: "48",
      change: "5 categories",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Revenue (Month)",
      value: "$28,450",
      change: "+18.2%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "John Smith", items: 3, total: "$45.50", status: "completed" },
    { id: "ORD-002", customer: "Sarah Johnson", items: 2, total: "$28.00", status: "pending" },
    { id: "ORD-003", customer: "Mike Wilson", items: 5, total: "$67.25", status: "pending" },
    { id: "ORD-004", customer: "Emily Brown", items: 1, total: "$15.00", status: "completed" },
  ];

  const lowStockItems = [
    { name: "All-Purpose Flour", current: 15, min: 50, unit: "kg" },
    { name: "Butter", current: 8, min: 20, unit: "kg" },
    { name: "Vanilla Extract", current: 2, min: 5, unit: "L" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-green-200 bg-gradient-to-r from-green-500 to-emerald-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h2 className="text-white">Welcome to Your Bakery Dashboard</h2>
              </div>
              <p className="text-white/90 text-sm">Here's what's happening with your bakery today</p>
            </div>
            <div className="hidden md:block w-32 h-32 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1679673987713-54f809ce417d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc2MTk3NzQ4MXww&ixlib=rb-4.1.0&q=80&w=400"
                alt="Fresh bakery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-green-900">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-green-900">{order.id}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-900">{order.total}</p>
                    <p className="text-xs text-green-600">{order.items} items</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-green-900">{item.name}</p>
                    <Badge variant="destructive" className="text-xs">Low</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Current: {item.current} {item.unit}</span>
                    <span>Min: {item.min} {item.unit}</span>
                  </div>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(item.current / item.min) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Selling Products */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle>Best Selling Products (This Week)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-4">
            <div className="flex-1 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="h-32 relative overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1733754348873-feeb45df3bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzYxOTE5MTc0fDA&ixlib=rb-4.1.0&q=80&w=400"
                  alt="Croissant"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600">1</Badge>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100">
                <h4 className="text-green-900 mb-2">Croissant</h4>
                <div className="flex justify-between text-sm text-green-700">
                  <span>156 sold</span>
                  <span>$780</span>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="h-32 relative overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjE4NTc4ODR8MA&ixlib=rb-4.1.0&q=80&w=400"
                  alt="Sourdough Bread"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600">2</Badge>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100">
                <h4 className="text-green-900 mb-2">Sourdough Bread</h4>
                <div className="flex justify-between text-sm text-green-700">
                  <span>89 sold</span>
                  <span>$534</span>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="h-32 relative overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjE4NjYwMjV8MA&ixlib=rb-4.1.0&q=80&w=400"
                  alt="Chocolate Chip Cookies"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600">3</Badge>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100">
                <h4 className="text-green-900 mb-2">Chocolate Chip Cookies</h4>
                <div className="flex justify-between text-sm text-green-700">
                  <span>234 sold</span>
                  <span>$702</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}