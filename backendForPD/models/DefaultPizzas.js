const mongoose = require("mongoose");

const DefaultPizzaSchema = new mongoose.Schema({
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  meats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  price: Number,
  key: {
  type: String,
  unique: true
}
});


module.exports = mongoose.model('DefautlPizza', DefaultPizzaSchema);