import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// In majorChanges branch

const STEPS = ["base", "sauce", "cheese", "veggie", "meat"];

const PizzaBuilder = () => {
  const [ingredients, setIngredients] = useState([]);
  const [pizza, setPizza] = useState({ base: null, sauce: null, cheese: null, veggies: [], meats: [] });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("inside PizzaBuilder");
    api("/pizza/ingredients")
      .then((data) => setIngredients(data.ingredientList || data))
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const step = STEPS[currentStep];
  const stepIngredients = ingredients.filter((i) => i.category === step && i.stock > 0);
  //   const stepIngredients = ingredients.filter((i) => STEPS.includes(i.category) && i.stock > 0);


  const isSelected = (item) => {
    if (step === "veggie") return pizza.veggies.some((v) => v._id === item._id);
    if (step === "meat") return pizza.meats.some((m) => m._id === item._id);
    return pizza[step]?._id === item._id;
  };

  const selectItem = (item) => {
    if (step === "veggie") {
      setPizza((p) => ({
        ...p,
        veggies: p.veggies.some((v) => v._id === item._id)
          ? p.veggies.filter((v) => v._id !== item._id)
          : [...p.veggies, item],
      }));
    } else if (step === "meat") {
      setPizza((p) => ({
        ...p,
        meats: p.meats.some((m) => m._id === item._id)
          ? p.meats.filter((m) => m._id !== item._id)
          : [...p.meats, item],
      }));
    } else {
      setPizza((p) => ({ ...p, [step]: item }));
    }
  };

  const canProceed = () => {
    if (step === "veggie" || step === "meat") return true;
    return pizza[step] !== null;
  };

  const getPrice = () => {
    let price = 0;
    if (pizza.base) price += pizza.base.priceAdd;
    if (pizza.sauce) price += pizza.sauce.priceAdd;
    if (pizza.cheese) price += pizza.cheese.priceAdd;
    pizza.veggies.forEach((v) => (price += v.priceAdd));
    pizza.meats.forEach((m) => (price += m.priceAdd));
    return price;
  };

  const handleAddToCart = () => {
    if (!pizza.base || !pizza.sauce || !pizza.cheese) {
      toast({ title: "Please select base, sauce, and cheese", variant: "destructive" });
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      base: pizza.base.name,
      sauce: pizza.sauce.name,
      cheese: pizza.cheese.name,
      veggies: pizza.veggies.map((v) => v.name),
      meats: pizza.meats.map((m) => m.name),
      price: getPrice(),
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    toast({ title: "Pizza added to cart! 🍕" });
    navigate("/cart");
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading ingredients...</div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <button className="p-[min(1vw,8px)] text-xs sm:text-sm md:text-base lg:text-lg rounded-lg text-white bg-[#EB6723] cursor-pointer"
       onClick={() => {navigate("/dashboard")}}>Back to Dashboard</button>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">🍕 Build Your Pizza</h1>

        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                i === currentStep ? "bg-primary text-primary-foreground" : i < currentStep ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              Choose your {step} {step === "veggies" || step === "meats" ? "(optional, multi-select)" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stepIngredients.length === 0 ? (
              <p className="text-muted-foreground">No {step} options available right now.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stepIngredients.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => selectItem(item)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      isSelected(item)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">+₹{item.priceAdd}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} disabled={currentStep === 0}>
                Back
              </Button>
              <span className="font-semibold">Total: ₹{getPrice()}</span>
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()}>Next</Button>
              ) : (
                <Button onClick={handleAddToCart}>Add to Cart</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PizzaBuilder;
