import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { set } from "react-hook-form";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [defaultPizzas, setDefaultPizzas] = useState([])
  const [ingredients, setIngredients] = useState([]);
  const { toast } = useToast();
  // let isSelected = false;
  const navigate = useNavigate();

  // console.log(defaultPizzas);
  let i = 0;
  useEffect(() =>{
    api("pizza/get-default-pizzas")
    .then(data => {setDefaultPizzas(data.defaultPizzas); setIngredients(data.ingredients)})
    .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
    .finally(() => setLoading(false));
    // setDefaultPizzas(prev => prev.map(pizza => ({...pizza, isSelected: false})));
  }, []);


  const handleAddToCart = (pizza) => {
    if (!pizza.base || !pizza.sauce || !pizza.cheese) {
      toast({ title: "Please select base, sauce, and cheese", variant: "destructive" });
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      base: ingredients[pizza.base],
      sauce: ingredients[pizza.sauce],
      cheese: ingredients[pizza.cheese],
      veggies: pizza.veggies.map((v) => ingredients[v]),
      meats: pizza.meats.map((m) => ingredients[m]),
      price: pizza.price,
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    toast({ title: "Pizza added to cart! 🍕", description: `pizza details: base - ${ingredients[pizza.base]}\nsauce - '${ingredients[pizza.sauce]},\ncheese - ${ingredients[pizza.cheese]}\nveggies - ${pizza.veggies.map((v) => ingredients[v])}\nmeats - ${pizza.meats.map((m) => ingredients[m])}` });
    navigate("/cart");
  };


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🍕 Welcome, {user?.username}</h1>
          <div className="flex gap-2">
            {user?.role === "admin" && (
              <Button className="cursor-pointer" variant="outline" onClick={() => navigate("/admin")}>Admin Panel</Button>
            )}
            <Button className="cursor-pointer" variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/build")}>
            <CardHeader><CardTitle className="text-lg">🍕 Build Pizza</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Customize your own pizza with your favorite toppings</p></CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/cart")}>
            <CardHeader><CardTitle className="text-lg">🛒 Cart</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">View your cart and checkout</p></CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/orders")}>
            <CardHeader><CardTitle className="text-lg">📋 My Orders</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Track your current and past orders</p></CardContent>
          </Card>
        </div>
      </div>

      <h3 className="mt-10 text-center tex-white text-[40px]">Default Pizza Options</h3>
      <div className="ml-[5vw] mr-[5vw] grid grid-cols-1 md:grid-cols-3 gap-4">
            {/*Adding Default Pizza*/}
          {defaultPizzas.map((pizza) => (
            
           <Card key={pizza._id} className="mb-3"> 
              <CardHeader className="pb-2">
                  <Checkbox
                    className="cursor-pointer"
                    // checked = { pizza.isSelected || false }
                    onCheckedChange = {()=> setDefaultPizzas(prev => prev.map(p => (p._id === pizza._id)? {...p, isSelected: !p.isSelected}: p))}
                  /> 
                {pizza.isSelected && <Button onClick={()=> {console.log(pizza);return handleAddToCart(pizza)}}>Add to Cart</Button>}
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Default #{pizza._id.slice(-6)}</CardTitle>
                  
                </div>
                <p className="text-sm text-muted-foreground">
                  • ₹{pizza.price}
                </p>
              </CardHeader>
              <CardContent>
                {
                
                  <p key={pizza._id.slice(-6)} className="text-sm text-muted-foreground">  <br />
                    Pizza {++i}: <br /> Base: {ingredients[pizza.base]},<br /> Sauce: {ingredients[pizza.sauce]},<br /> Cheese: {ingredients[pizza.cheese]},<br />
                    Veggies: {pizza.veggies?.length > 0 && ` ${pizza.veggies.map(veggie => ingredients[veggie] + " ")}`},<br />
                    Meats: {pizza.meats?.length > 0 && ` ${pizza.meats.map(meat => ingredients[meat] + " ")}`}
                  </p>
                }
              </CardContent>
            </Card>
          ))}
          </div>
    </div>
  );
};

export default Dashboard;
