const Order = require('../models/Order');
const Ingredient = require('../models/Ingrediant');
const UserModel = require('../models/User');
const { Error } = require('mongoose');

// To cache the ingredients details
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


exports.verifyAndPlaceOrder = async (req, res)=>{
  try{
  let { pizzas} = req.body;
  let totalAmount = 0;

  // console.log(cachedIngredients);
  try{
    const id_of_pizza_ingredients = pizzas.map(pizza => {
      let pricePerPizza = 0;
      const IngredientId = (name) => cachedIngredients.find(ing => {
        if(ing.name === name){
        pricePerPizza+= ing.priceAdd;
        totalAmount+= ing.priceAdd;
        }
        return ing.name === name
      })?._id;
      
      return {
        base: IngredientId(pizza.base),
        sauce: IngredientId(pizza.sauce),
        cheese: IngredientId(pizza.cheese),
        veggies: pizza.veggies.map((veggie) => IngredientId(veggie)),
        meats: pizza.meats.map((meat) => IngredientId(meat)),
        price: pricePerPizza
      }
  });

  const razorpay_orderId =  generateId();
  const razorpay_paymentId =  generateId();

  try{
    const newOrder = new Order({
      user:{
      userId: req.user._id,
      username: req.user.username,
      userEmail: req.user.email,
      },
      pizzas: id_of_pizza_ingredients,
      totalAmount,
      razorpayOrderId: razorpay_orderId,
      razorpayPaymentId: razorpay_paymentId,
    });

    await newOrder.save();

    res.status(200).json({
      message: "Order Placed Successfully",
      orderDetails: {
      user: req.user.username,
      pizzas: id_of_pizza_ingredients,
      totalAmount,
      razorpayOrderId: razorpay_orderId,
      razorpayPaymentId: razorpay_paymentId,
      }
    });

  } catch(err){
    console.log("Error on creating new Order:\t\n", err.message);
    res.status(400).json({
      message: err.message
    });
  }

  } catch(err){
    console.log("Error on getting ingredients Id:\t\n", err.message);
    res.status(400).json({
      message: err.message
    });
  }
} catch(err){
  res.status(402).json({
    message: "Provide the pizza details please"
  })
}
}

exports.userOrders = async (req, res)=>{
  try{
  let user = req.user._id;

  const userOrders = await Order.find({user}).lean();

  const ingredientsObject = {};
  cachedIngredients.forEach(ing =>{
    ingredientsObject[ing._id] = ing.name;
  });


  res.status(200).json({
    orders: userOrders,
    ingredients: ingredientsObject
  });

  } catch(err){
    console.log("Error from userOrders",err.message);
  }

}

exports.getAllOrders = async(req, res)=>{
  try{
  const orders = await Order.find().lean();
  
  if(orders.length < 1){
    throw new Error("There are no orders to show.")
  }
  // const user = await UserModel.findOne({orders})
  res.status(200).json({
      orders
    });

  } catch(err){
    res.status(400).json({
      message: err.message
    })
  }

}

exports.inventoryDetails = async (req, res)=>{
  try{
    const ingredients = await Ingredient.find();

    res.status(200).json({
      ingredients
    })
  } catch(error){
    res.status(400).json({
      message: error.message
    })
  }
}

exports.inventoryStatus = async (req, res)=>{
  try{
  const ingredients = await Ingredient.find();

  } catch(error){
    res.status(400).json({
      message: error.message
    })
  }

}

exports.getUserOrders = async (req, res)=>{
  try{
    const order = await Order.find();

  } catch(error){
    res.status(400).json({
      message: error.message
    })
  }
}



function generateId(){
  let arr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";
  let id = '';

  for(let i =1; i<= 10; i++){
    id+= arr[Math.floor(Math.random() * arr.length)];
  }
  return id;
}















// // Initialize Razorpay (Replace with your keys from .env)
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // 1. Create Razorpay Order
// exports.createRazorpayOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const options = {
//       amount: amount * 100, // Razorpay works in paise (100 paise = 1 INR)
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ message: "Razorpay order creation failed", error });
//   }
// };

// // 2. Verify Payment & Update Inventory
// exports.verifyAndPlaceOrder = async (req, res) => {
//   try {
//     const { 
//       razorpay_order_id, 
//       razorpay_payment_id, 
//       razorpay_signature,
//       pizzas, // This is the array carrying the "pizzaDetails"
//       totalAmount 
//     } = req.body;

//     // Verify Signature (Security Check)
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature !== expectedSign) {
//       return res.status(400).json({ message: "Invalid payment signature" });
//     }

//     // PAYMENT SUCCESSFUL -> LOGIC STARTS HERE
    
//     // Save Order to Database
//     const newOrder = new Order({
//       user: req.user.id, // From your authMiddleware
//       pizzas,
//       totalAmount,
//       paymentStatus: 'paid',
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       status: 'received'
//     });
//     await newOrder.save();

//     // Loop through each pizza to reduce stock
//     for (const pizza of pizzas) {
//       // Create a list of all ingredient IDs used in this specific pizza
//       const ingredientIds = [
//         pizza.base, 
//         pizza.sauce, 
//         pizza.cheese, 
//         ...(pizza.veggies || []), 
//         ...(pizza.meats || [])
//       ];

//       // Update each ingredient in MongoDB
//       for (const id of ingredientIds) {
//         const item = await Ingredient.findByIdAndUpdate(
//           id, 
//           { $inc: { stock: -1 } }, // Subtract 1 from current stock
//           { new: true }
//         );

//         // Check Threshold (Task #8)
//         if (item && item.stock < item.threshold) {
//           console.log(`ALERT: ${item.name} is low! Current stock: ${item.stock}`);
//           // TODO: Call your sendEmail function here
//         }
//       }
//     }

//     res.status(201).json({ message: "Order placed and stock updated!", order: newOrder });
//   } catch (error) {
//     res.status(500).json({ message: "Order placement failed", error });
//   }
// };