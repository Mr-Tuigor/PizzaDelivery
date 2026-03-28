const mongoose = require('mongoose');
const Ingredient = require('./models/Ingrediant'); // Check spelling matches your file
require('dotenv').config();

const ingredients = [
  // BASES
  { name: 'Wheat', category: 'base', stock: 50, priceAdd: 20 },
  { name: 'Thin Crust', category: 'base', stock: 50, priceAdd: 0 },
  { name: 'Pan Pizza', category: 'base', stock: 50, priceAdd: 30 },
  { name: 'Cheese Burst', category: 'base', stock: 50, priceAdd: 50 },
  { name: 'Stuffed Crust', category: 'base', stock: 50, priceAdd: 40 },
  // SAUCES
  { name: 'Marinara', category: 'sauce', stock: 50 },
  { name: 'Schezwan', category: 'sauce', stock: 50 },
  { name: 'Pesto', category: 'sauce', stock: 50 },
  { name: 'BBQ', category: 'sauce', stock: 50 },
  { name: 'Chipotle', category: 'sauce', stock: 50 },
  // Cheese
  { name: 'Mozzarella', category: 'cheese', stock: 50, priceAdd: 30 },
  { name: 'Provolone', category: 'cheese', stock: 50, priceAdd: 20 },
  { name: 'Cheddar', category: 'cheese', stock: 50, priceAdd: 35 },
  { name: 'Parmesan', category: 'cheese', stock: 50, priceAdd: 30 },
  { name: 'Goat Cheese', category: 'cheese', stock: 50, priceAdd: 40 },
  // Meat
  { name: 'Chicken Pepperoni', category: 'meat', stock: 50, priceAdd: 30 },
  { name: 'Grilled Chicken', category: 'meat', stock: 50, priceAdd: 50 },
  { name: 'Meatballs', category: 'meat', stock: 50, priceAdd: 40 },
  { name: 'Port', category: 'meat', stock: 50, priceAdd: 40 },
  { name: 'Chicken Sausage', category: 'meat', stock: 50, priceAdd: 30 },
  // Veggies
  { name: 'Onions', category: 'veggie', stock: 50},
  { name: 'Capsicum', category: 'veggie', stock: 50},
  { name: 'Tomatoes', category: 'veggie', stock: 50},
  { name: 'Sweet Corn', category: 'veggie', stock: 50},
  { name: 'Mushrooms', category: 'veggie', stock: 50},

];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Ingredient.deleteMany({}); // Clears existing to avoid duplicates
  await Ingredient.insertMany(ingredients);
  console.log("Database Seeded!");
  process.exit();
};

seedDB();