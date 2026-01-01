import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Calendar, FileText } from 'lucide-react';
import { Badge } from "./ui/badge";
import { useState } from 'react';

const salesData = [
  { month: 'Jan', revenue: 12500, orders: 145, avgOrder: 86 },
  { month: 'Feb', revenue: 15200, orders: 178, avgOrder: 85 },
  { month: 'Mar', revenue: 18900, orders: 210, avgOrder: 90 },
  { month: 'Apr', revenue: 16700, orders: 195, avgOrder: 86 },
  { month: 'May', revenue: 21300, orders: 245, avgOrder: 87 },
  { month: 'Jun', revenue: 24800, orders: 289, avgOrder: 86 },
  { month: 'Jul', revenue: 22400, orders: 267, avgOrder: 84 },
  { month: 'Aug', revenue: 26100, orders: 305, avgOrder: 86 },
  { month: 'Sep', revenue: 23700, orders: 278, avgOrder: 85 },
  { month: 'Oct', revenue: 28900, orders: 334, avgOrder: 87 },
  { month: 'Nov', revenue: 31200, orders: 365, avgOrder: 85 }
];

const productSalesData = [
  { name: 'Croissants', value: 2850, percentage: 28 },
  { name: 'Sourdough Bread', value: 2340, percentage: 23 },
  { name: 'Cinnamon Rolls', value: 1820, percentage: 18 },
  { name: 'Baguette', value: 1560, percentage: 16 },
  { name: 'Chocolate Cake', value: 1540, percentage: 15 }
];

const inventoryData = [
  { ingredient: 'Flour', current: 85, minimum: 100, optimal: 200, status: 'low' },
  { ingredient: 'Sugar', current: 120, minimum: 80, optimal: 150, status: 'good' },
  { ingredient: 'Butter', current: 45, minimum: 60, optimal: 120, status: 'critical' },
  { ingredient: 'Eggs', current: 180, minimum: 100, optimal: 200, status: 'good' },
  { ingredient: 'Yeast', current: 25, minimum: 30, optimal: 50, status: 'low' }
];

const topCustomers = [
  { name: 'John Doe', orders: 45, revenue: 3890, avgOrder: 86 },
  { name: 'Jane Smith', orders: 38, revenue: 3420, avgOrder: 90 },
  { name: 'Mike Johnson', orders: 34, revenue: 2950, avgOrder: 87 },
  { name: 'Sarah Williams', orders: 29, revenue: 2480, avgOrder: 86 },
  { name: 'David Brown', orders: 27, revenue: 2310, avgOrder: 86 }
];

const COLORS = ['#f59e0b', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

export default function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState('monthly');

  const currentRevenue = 31200;
  const previousRevenue = 28900;
  const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

  const currentOrders = 365;
  const previousOrders = 334;
  const ordersGrowth = ((currentOrders - previousOrders) / previousOrders * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-amber-900">Reports & Analytics</h2>
          <p className="text-sm text-amber-600">Track business performance and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-32 bg-gradient-to-br from-green-100 to-emerald-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758873271761-6cfe9b4f000c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjByZXBvcnRzJTIwY2hhcnRzfGVufDF8fHx8MTc2MzIxNjIyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Revenue"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <DollarSign className="w-16 h-16 text-green-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <Badge variant="default" className="bg-green-100 text-green-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{revenueGrowth}%
              </Badge>
            </div>
            <div className="text-amber-900">${currentRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">vs ${previousRevenue.toLocaleString()} last month</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-32 bg-gradient-to-br from-blue-100 to-cyan-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758873271761-6cfe9b4f000c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjByZXBvcnRzJTIwY2hhcnRzfGVufDF8fHx8MTc2MzIxNjIyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Orders"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-blue-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Total Orders</span>
              <Badge variant="default" className="bg-blue-100 text-blue-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{ordersGrowth}%
              </Badge>
            </div>
            <div className="text-amber-900">{currentOrders}</div>
            <p className="text-xs text-gray-500 mt-1">vs {previousOrders} last month</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758873271761-6cfe9b4f000c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjByZXBvcnRzJTIwY2hhcnRzfGVufDF8fHx8MTc2MzIxNjIyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Average Order"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-16 h-16 text-amber-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <Badge variant="secondary">
                <TrendingDown className="w-3 h-3 mr-1" />
                -1.2%
              </Badge>
            </div>
            <div className="text-amber-900">$85.48</div>
            <p className="text-xs text-gray-500 mt-1">vs $86.52 last month</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-32 bg-gradient-to-br from-purple-100 to-pink-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758873271761-6cfe9b4f000c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjByZXBvcnRzJTIwY2hhcnRzfGVufDF8fHx8MTc2MzIxNjIyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Customers"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-16 h-16 text-purple-600 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Active Customers</span>
              <Badge variant="default" className="bg-purple-100 text-purple-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
            </div>
            <div className="text-amber-900">1,247</div>
            <p className="text-xs text-gray-500 mt-1">vs 1,108 last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Sales Reports
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product Analytics
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Inventory Reports
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customer Insights
          </TabsTrigger>
        </TabsList>

        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="month" stroke="#92400e" />
                    <YAxis stroke="#92400e" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Orders Trend</CardTitle>
                <CardDescription>Monthly orders over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="month" stroke="#92400e" />
                    <YAxis stroke="#92400e" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24' }}
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="#f59e0b" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <CardTitle className="text-amber-900">Revenue & Orders Comparison</CardTitle>
              <CardDescription>Track revenue and order volume trends</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis dataKey="month" stroke="#92400e" />
                  <YAxis yAxisId="left" stroke="#92400e" />
                  <YAxis yAxisId="right" orientation="right" stroke="#92400e" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} name="Revenue ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#fb923c" strokeWidth={2} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Analytics Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Top Products by Revenue</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productSalesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productSalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Product Performance</CardTitle>
                <CardDescription>Sales breakdown by product</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productSalesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis type="number" stroke="#92400e" />
                    <YAxis dataKey="name" type="category" stroke="#92400e" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24' }}
                    />
                    <Bar dataKey="value" fill="#f59e0b" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <CardTitle className="text-amber-900">Product Sales Details</CardTitle>
              <CardDescription>Detailed breakdown of product performance</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {productSalesData.map((product, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-amber-900">{product.name}</span>
                        <span className="text-gray-600">${product.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${product.percentage}%`, backgroundColor: COLORS[index] }}
                        />
                      </div>
                    </div>
                    <Badge variant="secondary">{product.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <CardTitle className="text-amber-900">Inventory Status Overview</CardTitle>
              <CardDescription>Current stock levels vs optimal levels</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis dataKey="ingredient" stroke="#92400e" />
                  <YAxis stroke="#92400e" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24' }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="#f59e0b" name="Current Stock" />
                  <Bar dataKey="minimum" fill="#fb923c" name="Minimum Level" />
                  <Bar dataKey="optimal" fill="#fdba74" name="Optimal Level" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryData.map((item, index) => (
              <Card key={index} className={`border-2 shadow-lg ${
                item.status === 'critical' ? 'border-red-300 bg-red-50' : 
                item.status === 'low' ? 'border-yellow-300 bg-yellow-50' : 
                'border-green-300 bg-green-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-amber-900">{item.ingredient}</h3>
                    <Badge variant={
                      item.status === 'critical' ? 'destructive' : 
                      item.status === 'low' ? 'secondary' : 
                      'default'
                    } className="capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="text-amber-900">{item.current} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum:</span>
                      <span className="text-gray-700">{item.minimum} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Optimal:</span>
                      <span className="text-gray-700">{item.optimal} kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.status === 'critical' ? 'bg-red-500' : 
                          item.status === 'low' ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${(item.current / item.optimal) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <CardTitle className="text-amber-900">Top Customers</CardTitle>
              <CardDescription>Customers with highest revenue contribution</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-amber-900">{customer.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          {customer.orders} orders
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${customer.avgOrder} avg
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-900">${customer.revenue}</div>
                      <div className="text-xs text-gray-500">Total Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Customer Growth</CardTitle>
                <CardDescription>New vs returning customers</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'New Customers', value: 456 },
                        { name: 'Returning Customers', value: 791 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#f59e0b" />
                      <Cell fill="#fb923c" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Customer Metrics</CardTitle>
                <CardDescription>Key customer statistics</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Customer Retention Rate</span>
                      <span className="text-amber-900">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="text-amber-900">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Repeat Purchase Rate</span>
                      <span className="text-amber-900">63%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '63%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Referral Rate</span>
                      <span className="text-amber-900">34%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '34%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
