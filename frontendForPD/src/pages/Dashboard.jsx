import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [defaultPizzas, setDefaultPizzas] = useState([])
  const [ingredients, setIngredients] = useState([]);
  const navigate = useNavigate();

  console.log(defaultPizzas);
  let i = 0;
  useEffect(() =>{
    api("pizza/get-default-pizzas")
    .then(data => {setDefaultPizzas(data.defaultPizzas); setIngredients(data.ingredients)})
    .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🍕 Welcome, {user?.username}</h1>
          <div className="flex gap-2">
            {user?.role === "admin" && (
              <Button variant="outline" onClick={() => navigate("/admin")}>Admin Panel</Button>
            )}
            <Button variant="ghost" onClick={logout}>Logout</Button>
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
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Default #{pizza._id.slice(-6)}</CardTitle>
                 
                </div>
                <p className="text-sm text-muted-foreground">
                  • ₹{0}
                </p>
              </CardHeader>
              <CardContent>
                {
                
                  <p key={pizza._id.slice(-6)} className="text-sm text-muted-foreground">  <br />
                    Pizza {++i}: <br /> Base: {ingredients[String(pizza.base)]},<br /> Sauce: {ingredients[String(pizza.sauce)]},<br /> Cheese: {ingredients[String(pizza.cheese)]},<br />
                    Veggies: {pizza.veggies?.length > 0 && ` ${pizza.veggies.map(veggie => ingredients[String(veggie)] + " ")}`},<br />
                    Meats: {pizza.meats?.length > 0 && ` ${pizza.meats.map(meat => ingredients[String(meat)] + " ")}`}
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
