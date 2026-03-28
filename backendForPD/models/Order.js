const mongoose = require('mongoose');


const PizzaSchema = new mongoose.Schema({
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  meats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  price: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pizzas: [ PizzaSchema ],
  totalAmount: Number, 
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default:'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: { type: String, enum: [ 'received', 'in_kitchen', 'sent_to_delivery', "delivered", "cancelled" ], default: 'received' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);