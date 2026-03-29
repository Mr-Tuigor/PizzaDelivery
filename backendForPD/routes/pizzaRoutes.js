const router = require('express').Router();
const { getIngredients, getDefaultPizzas, reduceStockAfterOrder, updateInventory, createDefaultPizzas } = require('../controllers/pizzaController');
const { verifyAndPlaceOrder, inventoryDetails, inventoryStatus, getUserOrders } = require('../controllers/orderController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/ingredients', protect, getIngredients);
router.get("/get-default-pizzas", getDefaultPizzas);
router.post("/create-default-pizzas", protect, createDefaultPizzas);
router.put('/updateInventory/:id', adminOnly, updateInventory);


router.post('/order', protect, verifyAndPlaceOrder);
router.get('/inventory', adminOnly, inventoryDetails);
router.get('/myorders', protect, getUserOrders);

module.exports = router;