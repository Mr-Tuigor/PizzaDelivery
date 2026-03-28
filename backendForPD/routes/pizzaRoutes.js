const router = require('express').Router();
const { getIngredients, getDefaultPizzas, reduceStockAfterOrder, updateInventory, createDefaultPizzas } = require('../controllers/pizzaController');
const { verifyAndPlaceOrder, inventoryDetails, inventoryStatus, getUserOrders } = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

router.get('/ingredients', protect, getIngredients);
router.get("/get-default-pizzas", getDefaultPizzas);
router.post("/create-default-pizzas", protect, createDefaultPizzas);
router.put('/:id/updateInventory', protect, updateInventory);


router.post('/order', protect, verifyAndPlaceOrder);
router.get('/:id/inventory', protect, inventoryDetails);
router.get('/myorders', protect, getUserOrders);

module.exports = router;