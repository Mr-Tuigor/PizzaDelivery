import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const statusColor = (status) => {
  switch (status) {
    case "received": return "bg-secondary text-secondary-foreground";
    case "in_kitchen": return "bg-purple-500 text-balck hover:bg-purple-400";
    case "sent_to_delivery": return "bg-blue-500 text-balck hover:bg-blue-400";
    case "delivered": return "bg-green-500 text-green-800 hover:bg-green-400";
    case "cancelled": return "bg-red-500 text-red-800 hover:bg-red-400"
    default: return "bg-muted text-muted-foreground";
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = () => {
    api("/orders/my-orders")
      .then((data) => {
        setOrders(data.orders || data);
        setIngredients(data.ingredients)
      })
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📋 My Orders</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Back</Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No orders yet</p>
              <Button className="mt-4" onClick={() => navigate("/build")}>Order a Pizza</Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="mb-3">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Order #{order._id.slice(-6)}</CardTitle>
                  <Badge className={statusColor(order.status)}>{order.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}
                </p>
              </CardHeader>
              <CardContent>
                {order.pizzas.map((p, i) => (
                
                  <p key={i} className="text-sm text-muted-foreground"> <br />
                    Pizza {i + 1}: <br /> Base: {ingredients[p.base]},<br /> Sauce: {ingredients[p.sauce]},<br /> Cheese: {ingredients[p.cheese]},<br />
                    Veggies: {p.veggies?.length > 0 && ` ${p.veggies.map(veggie => ingredients[veggie] + " ")}`},<br />
                    Meats: {p.meats?.length > 0 && ` ${p.meats.map(meat => ingredients[meat] + " ")}`}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
