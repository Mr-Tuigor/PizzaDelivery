const router = require('express').Router();
const { userOrders, getAllOrders, verifyAndPlaceOrder, inventoryDetails, inventoryStatus, getUserOrders } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post("/create", protect, verifyAndPlaceOrder);

router.get("/my-orders", protect, userOrders);
router.get("/all", adminOnly, getAllOrders);

module.exports = router;