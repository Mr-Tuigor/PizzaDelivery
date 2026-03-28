// models/Ingredient.js
const mongoose = require('mongoose');


const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'], required: true },
  stock: { type: Number, default: 50 }, // inventory count
  threshold: { type: Number, default: 20 }, // when to email admin
  priceAdd: { type: Number, default: 0 },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);