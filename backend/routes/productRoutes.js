const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  addToCart,
  purchaseProduct,
  getUserPurchases
} = require('../controllers/productController');
const auth = require('../middleware/userMiddleware');
const { upload, handleUploadError } = require('../config/cloudinary');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes
router.use(auth); // All routes below require authentication

// Product routes with image upload support
router.post('/', upload.single('image'), handleUploadError, createProduct);
router.put('/:id', upload.single('image'), handleUploadError, updateProduct);
router.delete('/:id', deleteProduct);
router.get('/user/my-products', getUserProducts);
router.post('/cart/add', addToCart);
router.post('/purchase', purchaseProduct);
router.get('/user/purchases', getUserPurchases);

module.exports = router;
