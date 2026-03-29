import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";


const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    // api("/pizza/ingredients")
    //   .then((data) => setIngredients(data.ingredientList))
    //   .catch((err) => console.log(err.message));
  }, []);


  const total = cart.filter((p) => p.selected).reduce((sum, p) => sum + p.price, 0);

  const toggleSelection = (index) => {
    
  setCart(prevCart => 
    prevCart.map((pizza, i) => 
      i === index ? { ...pizza, selected: !pizza.selected } : pizza
  )
  );
};


  const removePizza = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleCheckout = async () => {
    
    if (total <= 0) {
      alert("please select your pizzas before payment");
      return;}
    setLoading(true);
    try {
      
      const data = await api("/orders/create", {
        method: "POST",
        body: { pizzas: cart.filter(c => c.selected)},
      });
      toast({title: "Thank you", description: data.message});
      // const options = {
      //   key: data.razorpayKeyId,
      //   amount: data.razorpayOrder.amount,
      //   currency: "INR",
      //   name: "Pizza Delivery",
      //   description: "Pizza Order Payment",
      //   order_id: data.razorpayOrder.id,
      //   handler: async (response) => {
      //     try {
      //       await api("/orders/verify", {
      //         method: "POST",
      //         body: {
      //           razorpay_order_id: response.razorpay_order_id,
      //           razorpay_payment_id: response.razorpay_payment_id,
      //           razorpay_signature: response.razorpay_signature,
      //         },
      //       });
      //       localStorage.removeItem("cart");
      //       toast({ title: "Order placed successfully! 🎉" });
      //       navigate("/orders");
      //     } catch (err) {
      //       toast({ title: "Payment verification failed", description: err.message, variant: "destructive" });
      //     }
      //   },
      //   theme: { color: "#ea580c" },
      // };

      // const rzp = new window.Razorpay(options);
      // rzp.open();
    } catch (err) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <button className="p-[min(1vw,8px)] text-xs sm:text-sm md:text-base lg:text-lg rounded-lg text-white bg-[#EB6723] cursor-pointer"
       onClick={() => {navigate("/dashboard")}}>Dashboard</button>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">🛒 Your Cart</h1>

        {cart.length === 0 ? (
          <Card>
            
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={() => navigate("/build")}>Build a Pizza</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {cart.map((pizza, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Checkbox className="cursor-pointer"
                      checked = { pizza.selected || false }
                      onCheckedChange={ () => toggleSelection(i) }
                      /> 
                      <p className="font-medium">Pizza #{i + 1}</p>
                      <p className="text-sm text-muted-foreground">{pizza.base} • {pizza.sauce} • {pizza.cheese}</p>
                      {pizza.veggies.length > 0 && <p className="text-sm text-muted-foreground">Veggies: {pizza.veggies.join(", ")}</p>}
                      {pizza.meats.length > 0 && <p className="text-sm text-muted-foreground">Meats: {pizza.meats.join(", ")}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{pizza.price}</p>
                      <Button variant="ghost" size="sm" className="text-destructive cursor-pointer" onClick={() => removePizza(i)}>Remove</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center mt-4">
              <Button className="cursor-pointer" variant="outline" onClick={() => navigate("/build")}>Add More</Button>
              <span className="sm:text-sm md:text-base lg:text-lg font-bold">Total: ₹{total}</span>
              <Button className="cursor-pointer" onClick={handleCheckout} disabled={loading}>
                {loading ? "Processing..." : "Pay with Razorpay"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
