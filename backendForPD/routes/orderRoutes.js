const router = require('express').Router();
const { userOrders, verifyAndPlaceOrder, inventoryDetails, inventoryStatus, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post("/create", protect, verifyAndPlaceOrder);

router.get("/my-orders", protect, userOrders);

module.exports = router;