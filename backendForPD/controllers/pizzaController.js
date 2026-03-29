const Ingredient = require('../models/Ingrediant');
const DefaultPizzas = require("../models/DefaultPizzas");



// Caching ingredients for multiple uses.
let cachedIngredients = [];
const refreshIngredientCache = async () => {
  try {
    cachedIngredients = await Ingredient.find().lean(); 
    console.log(`[Cache] Loaded ${cachedIngredients.length} ingredients into memory.`);
  } catch (err) {
    console.error("Failed to load ingredients cache:", err);
  }
};
refreshIngredientCache();

exports.getIngredients = async (req, res) => {
  try {
    // Fetches all ingredients so the user can choose
    // const ingredientList = await Ingredient.find();

    res.status(200).json({
      message: "Fetched Successful",
      ingredientList: cachedIngredients
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    const item = await Ingredient.findByIdAndUpdate(id, { stock }, { returnDocument: 'after' });
    res.status(200).json({ message: "Stock Updated", item });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

exports.createDefaultPizzas = async (req, res) =>{
  let totalPrice = 0;
  try{
  let { defaultPizza } = req.body;
  const pizza = await DefaultPizzas.find({base: defaultPizza.base}).lean();
  const ingredientsObject = {};

  cachedIngredients.forEach(ing =>{
    ingredientsObject[ing._id] = {name: ing.name, category: ing.category, price: ing.priceAdd};
  });
let priceOfPizza = 0;

Object.values(defaultPizza).forEach((ing) => {
  if(Array.isArray(ing)){
    ing.forEach((i) => priceOfPizza += ingredientsObject[i].price);
  } else {
  priceOfPizza += ingredientsObject[ing].price;
  }
});


  const areIngredientsValid = Object.entries(defaultPizza).every(([category, ing]) => {
    if(Array.isArray(ing)){
      return ing.every(i => {
        if(category !== ingredientsObject[i].category){
          console.log(category, ingredientsObject[i].category);
          throw new Error("Ingredients error: Ingredients Id mismatched, try again");
        }

      totalPrice += ingredientsObject[i].price;
      return i in ingredientsObject;
   })

    }
    if(category !== ingredientsObject[ing].category){
       throw new Error("Ingredients error: Ingredients Id mismatched, try again");
    }
    totalPrice += ingredientsObject[ing].price;
    return ing in ingredientsObject;
  });


  if(!areIngredientsValid) return res.status(400).json({
    message: "Error occured: Invalid Ingredients found! try again later"
  });

const generatePizzaKey = (pizza) => {
  const normalize = (arr) =>
    arr.map(x => String(x).slice(20,25)).sort().join(',');

  return [
    String(pizza.base.slice(20,25)),
    String(pizza.sauce.slice(20,25)),
    String(pizza.cheese.slice(20,25)),
    normalize(pizza.veggie),
    normalize(pizza.meat)
  ].join('|');
};

  if(pizza.length < 1) {
    const key = generatePizzaKey(defaultPizza);
    const newDefaultPizza = new DefaultPizzas({
      base: defaultPizza.base,
      sauce: defaultPizza.sauce,
      cheese: defaultPizza.cheese,
      veggies: defaultPizza.veggie.map(v => v),
      meats: defaultPizza.meat.map(m => m),
      price: priceOfPizza,
      key
    })

    await newDefaultPizza.save();

    res.status(200).json({
    message: "Addedd"
    })
    return;
  }


const key = generatePizzaKey(defaultPizza);

const newDefaultPizza = new DefaultPizzas({
  base: defaultPizza.base,
  sauce: defaultPizza.sauce,
  cheese: defaultPizza.cheese,
  veggies: defaultPizza.veggie.map(v => v),
  meats: defaultPizza.meat.map(m => m),
  price: priceOfPizza,
  key
});

await newDefaultPizza.save();

    res.status(200).json({
    message: "Added"
    })

} catch(err){
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Pizza already exists"
    });
  }
  console.error(err);
  res.status(400).json({
    message: err.message
  });
}

}

exports.getDefaultPizzas = async (req, res) =>{
  try{
  const pizzas = await DefaultPizzas.find().lean();
  let ingredientsObject = {};
    
    cachedIngredients.forEach(ing =>{
    ingredientsObject[ing._id] = ing.name;
  });

    res.status(200).json({
      defaultPizzas: pizzas,
      ingredients: ingredientsObject
    });
  }catch(err){
    res.status(400).json({
      message: err.message
    })
  }

}

// This would be called inside your PlaceOrder logic
exports.reduceStockAfterOrder = async (pizzaDetails) => {
  // 1. Identify all used ingredient IDs (Base, Sauce, Veggies, etc.)
  const usedIngredients = [
    pizzaDetails.base, 
    pizzaDetails.sauce, 
    ...pizzaDetails.veggies
  ];

  // 2. Loop through and decrement each by 1
  for (let id of usedIngredients) {
    const item = await Ingredient.findByIdAndUpdate(
      id, 
      { $inc: { stock: -1 } }, // $inc with a negative number subtracts
      { new: true }
    );

    // 3. Check Threshold for Email (Task #8)
    if (item.stock < item.threshold) {
      // Trigger your Email Notification function here
      console.log(`Alert: ${item.name} is low on stock!`);
    }
  }
};