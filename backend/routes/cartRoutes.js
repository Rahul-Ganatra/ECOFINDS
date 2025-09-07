const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/cartController');
const auth = require('../middleware/userMiddleware');

// All cart routes require authentication
router.use(auth);

// Cart routes
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/checkout', checkout);

// Order routes
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrder);
router.put('/orders/:orderId', updateOrderStatus);

module.exports = router;
