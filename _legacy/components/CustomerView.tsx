import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, Info, Star, Search, Filter, SlidersHorizontal, History, Clock, CheckCircle, XCircle, Package as PackageIcon, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useProducts, Product } from '../contexts/ProductsContext';
import { useOrders, Order } from '../contexts/OrdersContext';
import { useAuth } from '../contexts/AuthContext';
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner@2.0.3";

interface CartItem extends Product {
  quantity: number;
}

export default function CustomerView() {
  const { products } = useProducts();
  const { addOrder, getCustomerOrders } = useOrders();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('menu');

  // Get customer's orders
  const customerOrders = user ? getCustomerOrders(user.id) : [];

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: Math.max(0, Math.min(newQuantity, item.stock)) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to place an order.');
      return;
    }

    const newOrder = addOrder({
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items: cart.map(item => ({
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: getTotalPrice(),
      status: 'pending',
      phone: user.phone,
      address: user.address
    });

    toast.success('Order placed successfully! Order ID: ' + newOrder.id);
    setCart([]);
    setIsCartOpen(false);
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const addToCartFromDialog = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
      setIsProductDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <PackageIcon className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Cart */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-green-900">Welcome, {user?.name}!</h2>
          <p className="text-sm text-green-600">Browse our menu or check your order history</p>
        </div>
        <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-emerald-600">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Shopping Cart</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center py-8 text-green-600">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-green-900">{item.name}</p>
                          <p className="text-xs text-green-600">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm text-green-900 w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-900">Total</span>
                      <span className="text-green-900">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={handleCheckout}
                    >
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Menu and Order History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Order History ({customerOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Menu Tab */}
        <TabsContent value="menu" className="space-y-6">
          {/* Search, Filter, and Sort Controls */}
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-green-300 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Filter className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <SlidersHorizontal className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-green-600">
                  Showing {filteredAndSortedProducts.length} of {products.length} products
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <Card className="border-green-200">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Search className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-green-900 mb-2">No products found</h3>
                    <p className="text-sm text-green-600">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Clear all filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
                <Card key={product.id} className="border-green-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => openProductDetails(product)}>
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600">{product.category}</Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-green-500 text-green-500" />
                          <span className="text-sm text-green-900">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-green-900">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-green-600">{product.stock} available</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-green-300 hover:bg-green-50"
                          onClick={() => openProductDetails(product)}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="orders" className="space-y-6">
          {customerOrders.length === 0 ? (
            <Card className="border-green-200">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <History className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-green-900 mb-2">No orders yet</h3>
                    <p className="text-sm text-green-600 mb-4">
                      Start browsing our delicious menu to place your first order!
                    </p>
                    <Button
                      onClick={() => setActiveTab('menu')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Browse Menu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customerOrders.map((order) => (
                <Card key={order.id} className="border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Order Header */}
                      <div className="text-center border-b border-green-200 pb-2">
                        <p className="text-xs text-green-600">Matcha Bakery</p>
                        <p className="text-sm text-green-900">{order.id}</p>
                        <p className="text-xs text-green-600">{order.date}</p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-center">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>

                      {/* Order Items */}
                      <div className="border-y border-green-200 py-2">
                        <p className="text-xs text-green-600 mb-1.5">Items</p>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start text-xs">
                              <span className="text-green-900 flex-1">
                                {item.productName}
                                <span className="text-green-600 ml-1">x{item.quantity}</span>
                              </span>
                              <span className="text-green-600 ml-2">
                                ${(item.quantity * item.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-green-900">Total</span>
                        <span className="text-green-900">${order.total.toFixed(2)}</span>
                      </div>

                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingOrder(order)}
                        className="w-full border-green-300 hover:bg-green-50 text-xs h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-green-900">{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  View detailed information including ingredients and allergen warnings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Product Image */}
                <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                  <ImageWithFallback
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-base px-3 py-1">
                    {selectedProduct.category}
                  </Badge>
                </div>

                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-green-900">${selectedProduct.price.toFixed(2)}</span>
                    {selectedProduct.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-green-500 text-green-500" />
                        <span className="text-green-900">{selectedProduct.rating} / 5.0</span>
                      </div>
                    )}
                  </div>
                  <Badge variant={selectedProduct.stock > 10 ? "default" : "secondary"}>
                    {selectedProduct.stock} in stock
                  </Badge>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div>
                    <h3 className="text-green-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>
                )}

                {/* Ingredients */}
                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-green-900 mb-2">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 border-green-200">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                  <div>
                    <h3 className="text-green-900 mb-2">Allergen Information</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="flex gap-3 pt-4 border-t border-green-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsProductDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={addToCartFromDialog}
                    disabled={selectedProduct.stock === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-green-900">Order Details - {viewingOrder?.id}</DialogTitle>
            <DialogDescription>
              View complete details of your order
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600">Order Date</p>
                  <p className="text-green-900">{viewingOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Status</p>
                  <Badge className={getStatusColor(viewingOrder.status)}>
                    {getStatusIcon(viewingOrder.status)}
                    <span className="ml-1">{viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}</span>
                  </Badge>
                </div>
                {viewingOrder.phone && (
                  <div>
                    <p className="text-sm text-green-600">Phone</p>
                    <p className="text-green-900">{viewingOrder.phone}</p>
                  </div>
                )}
                {viewingOrder.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-green-600">Delivery Address</p>
                    <p className="text-green-900">{viewingOrder.address}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-green-600 mb-2">Order Items</p>
                <div className="space-y-2">
                  {viewingOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-green-50 rounded">
                      <span className="text-green-900">{item.productName}</span>
                      <span className="text-green-600">
                        {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-900">Total</span>
                  <span className="text-green-900">${viewingOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}