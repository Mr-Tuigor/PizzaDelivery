import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = () =>
    api("/orders/all")
      .then((data) => setOrders(data.orders || data))
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }));

  const fetchInventory = () =>
    api("/pizza/inventory")
      .then((data) => setInventory(data.ingredients || data))
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }));

  useEffect(() => {
    Promise.all([fetchOrders(), fetchInventory()]).finally(() => setLoading(false));
  }, []);

  const statusColor = (status) => {
  switch (status) {
    case "received": return "bg-secondary text-secondary-foreground";
    case "in_kitchen": return "bg-purple-500 text-balck hover:bg-purple-400";
    case "sent_to_delivery": return "bg-blue-500 text-balck hover:bg-blue-400";
    case "delivered": return "bg-green-500 text-green-800 hover:bg-green-400";
    case "cancelled": return "bg-red-400 text-red-800 hover:bg-red-500"
    default: return "bg-muted text-muted-foreground";
  }
};


  const updateOrderStatus = async (orderId, status) => {
    try {
      await api(`/orders/${orderId}/status`, { method: "PUT", body: { status } });
      toast({ title: `Status updated to "${status}"` });
      fetchOrders();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateStock = async (ingredientId, stock) => {
    try {
      await api(`/pizza/updateInventory/${ingredientId}`, { method: "PUT", body: { stock } });
      toast({ title: "Stock updated" });
      fetchInventory();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };


  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🔧 Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Back</Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")}>Orders</Button>
          <Button variant={tab === "inventory" ? "default" : "outline"} onClick={() => setTab("inventory")}>Inventory</Button>
        </div>

        {tab === "orders" && (
          <div>
            <h2 className="text-lg font-semibold mb-3">All Orders ({orders.length})</h2>
            {orders.map((order) => (
              <Card key={order._id} className="mb-3">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof order.user === "object" ? `${order.user.username} (${order.user.userEmail})` : order.user}
                      </p>
                      <p className="text-sm text-muted-foreground">₹{order.totalAmount} • {new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-sm mt-1">{order.pizzas.length} pizza(s)</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColor(order.status)}>{order.status}</Badge>
                      {(order.status === "delivered" || order.status === "cancelled") || (
                      <Select value={order.status} onValueChange={(val) => updateOrderStatus(order._id, val)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          
                          {order.status === "received" && <SelectItem value="received">Order Received</SelectItem>}
                          {(order.status === "received" || order.status === "in_kitchen") && <SelectItem value="in_kitchen">In the Kitchen</SelectItem>}
                          <SelectItem value="sent_to_delivery">Sent to Delivery</SelectItem>
                          {/* {(order.status !== "received") && <SelectItem value="sent_to_delivery">Sent to Delivery</SelectItem>} */}
                          <SelectItem value="cancelled">Order Cancelled</SelectItem>
                          
                        </SelectContent>
                      </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "inventory" && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Inventory</h2>
            <div className="grid gap-3">
              {["base", "sauce", "cheese", "veggie", "meat"].map((category) => (
                <div key={category}>
                  <h3 className="font-medium capitalize mb-2">{category}</h3>
                  {inventory
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <Card key={item._id} className="mb-2">
                        <CardContent className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Price: ₹{item.priceAdd} • Threshold: {item.threshold}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.stock <= (item.threshold || 20) && <Badge variant="destructive">Low Stock!</Badge>}
                            <Input
                              type="number"
                              className="w-20"
                              defaultValue={item.stock}
                              onBlur={(e) => {
                                const newStock = parseInt(e.target.value);
                                if (newStock !== item.stock && !isNaN(newStock)) {
                                  updateStock(item._id, newStock);
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
