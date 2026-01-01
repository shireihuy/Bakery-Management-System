import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Edit, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: string;
  cost: number;
}

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "All-Purpose Flour",
      category: "Flour",
      currentStock: 15,
      minStock: 50,
      maxStock: 200,
      unit: "kg",
      lastRestocked: "2025-10-28",
      cost: 2.50
    },
    {
      id: "2",
      name: "Butter",
      category: "Dairy",
      currentStock: 8,
      minStock: 20,
      maxStock: 50,
      unit: "kg",
      lastRestocked: "2025-10-29",
      cost: 8.00
    },
    {
      id: "3",
      name: "Sugar",
      category: "Sweeteners",
      currentStock: 75,
      minStock: 30,
      maxStock: 100,
      unit: "kg",
      lastRestocked: "2025-10-25",
      cost: 1.20
    },
    {
      id: "4",
      name: "Eggs",
      category: "Dairy",
      currentStock: 120,
      minStock: 100,
      maxStock: 300,
      unit: "pcs",
      lastRestocked: "2025-10-31",
      cost: 0.25
    },
    {
      id: "5",
      name: "Vanilla Extract",
      category: "Flavoring",
      currentStock: 2,
      minStock: 5,
      maxStock: 15,
      unit: "L",
      lastRestocked: "2025-10-20",
      cost: 45.00
    },
    {
      id: "6",
      name: "Chocolate Chips",
      category: "Toppings",
      currentStock: 25,
      minStock: 15,
      maxStock: 40,
      unit: "kg",
      lastRestocked: "2025-10-30",
      cost: 12.00
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: 'kg',
    cost: ''
  });

  const categories = ['Flour', 'Dairy', 'Sweeteners', 'Flavoring', 'Toppings', 'Yeast', 'Nuts', 'Fruits'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setInventory(inventory.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              ...formData, 
              currentStock: parseFloat(formData.currentStock),
              minStock: parseFloat(formData.minStock),
              maxStock: parseFloat(formData.maxStock),
              cost: parseFloat(formData.cost)
            }
          : item
      ));
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        currentStock: parseFloat(formData.currentStock),
        minStock: parseFloat(formData.minStock),
        maxStock: parseFloat(formData.maxStock),
        unit: formData.unit,
        cost: parseFloat(formData.cost),
        lastRestocked: new Date().toISOString().split('T')[0]
      };
      setInventory([...inventory, newItem]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', currentStock: '', minStock: '', maxStock: '', unit: 'kg', cost: '' });
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      cost: item.cost.toString()
    });
    setIsDialogOpen(true);
  };

  const handleRestock = (item: InventoryItem) => {
    setRestockingItem(item);
    setRestockAmount('');
    setIsRestockDialogOpen(true);
  };

  const confirmRestock = () => {
    if (restockingItem && restockAmount) {
      setInventory(inventory.map(item =>
        item.id === restockingItem.id
          ? {
              ...item,
              currentStock: item.currentStock + parseFloat(restockAmount),
              lastRestocked: new Date().toISOString().split('T')[0]
            }
          : item
      ));
      setIsRestockDialogOpen(false);
      setRestockingItem(null);
      setRestockAmount('');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (item.currentStock < item.minStock) return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (percentage < 50) return { label: 'Low', color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown };
    return { label: 'Good', color: 'bg-green-100 text-green-800', icon: TrendingUp };
  };

  const lowStockCount = inventory.filter(item => item.currentStock < item.minStock).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-900">{inventory.length}</div>
            <p className="text-xs text-green-600 mt-1">{categories.length} categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}>
              {lowStockCount}
            </div>
            <p className="text-xs text-green-600 mt-1">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-900">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">Current stock value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Inventory Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Update inventory item information' : 'Add a new item to your inventory'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="L">Liters (L)</SelectItem>
                          <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cost">Cost per Unit ($)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        step="0.1"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minStock">Min Stock</Label>
                      <Input
                        id="minStock"
                        type="number"
                        step="0.1"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStock">Max Stock</Label>
                      <Input
                        id="maxStock"
                        type="number"
                        step="0.1"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min / Max</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const status = getStockStatus(item);
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.currentStock} {item.unit}
                          {item.currentStock < item.minStock && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-green-600">
                        {item.minStock} / {item.maxStock} {item.unit}
                      </TableCell>
                      <TableCell>${item.cost.toFixed(2)}</TableCell>
                      <TableCell>${(item.currentStock * item.cost).toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-green-600">{item.lastRestocked}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleRestock(item)}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>Add inventory to this item</DialogDescription>
          </DialogHeader>
          {restockingItem && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-600">Item</p>
                <p className="text-green-900">{restockingItem.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600">Current Stock</p>
                  <p className="text-green-900">{restockingItem.currentStock} {restockingItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Maximum Stock</p>
                  <p className="text-green-900">{restockingItem.maxStock} {restockingItem.unit}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="restockAmount">Amount to Add ({restockingItem.unit})</Label>
                <Input
                  id="restockAmount"
                  type="number"
                  step="0.1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              {restockAmount && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">New Stock Level</p>
                  <p className="text-green-900">
                    {(restockingItem.currentStock + parseFloat(restockAmount)).toFixed(1)} {restockingItem.unit}
                  </p>
                  <p className="text-sm text-green-600 mt-2">Cost</p>
                  <p className="text-green-900">
                    ${(parseFloat(restockAmount) * restockingItem.cost).toFixed(2)}
                  </p>
                </div>
              )}
              <Button 
                onClick={confirmRestock} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!restockAmount || parseFloat(restockAmount) <= 0}
              >
                Confirm Restock
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}