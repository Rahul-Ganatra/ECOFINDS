const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');

// Get user's cart
const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    console.log('Add to cart request:', req.body);
    console.log('User ID:', req.user?.id);

    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot add your own product to cart' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Save cart
    await cart.save();

    // Populate and calculate total
    await cart.populate({
      path: 'items.product',
      select: 'title price image images category condition location seller status'
    });

    // Calculate total amount after population
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
    
    await cart.save(); // Save the calculated total

    res.json({ message: 'Item added to cart successfully', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'title price image images category condition location seller status'
    });

    res.json({ message: 'Cart item updated successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'title price image images category condition location seller status'
    });

    res.json({ message: 'Item removed from cart successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Checkout - create order from cart
const checkout = async (req, res) => {
  try {
    console.log('Checkout request received:', {
      userId: req.user?.id,
      body: req.body
    });
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'title price image images category condition location seller status'
    });

    console.log('Cart found:', {
      cartExists: !!cart,
      itemsCount: cart?.items?.length || 0,
      userId: req.user.id
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate all products are still available
    for (const item of cart.items) {
      if (item.product.status !== 'available') {
        return res.status(400).json({ 
          message: `Product "${item.product.title}" is no longer available` 
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      title: item.product.title,
      image: item.product.image || item.product.images?.[0]?.url || '/no-image.svg'
    }));

    // Calculate total amount from cart items
    const calculatedTotal = cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ECO-${timestamp.slice(-6)}-${random}`;

    // Create order
    console.log('Creating order with data:', {
      userId: req.user.id,
      itemsCount: orderItems.length,
      totalAmount: calculatedTotal,
      shippingAddress: shippingAddress || {},
      orderNumber: orderNumber
    });

    const order = new Order({
      user: req.user.id,
      orderNumber: orderNumber,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress: shippingAddress || {},
      status: 'pending'
    });

    await order.save();
    console.log('Order created successfully:', order._id);

    // Mark products as sold
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        status: 'sold',
        buyer: req.user.id
      });
    }

    // Generate tracking number and estimated delivery
    const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 7 days from now

    // Update order with tracking info
    order.trackingNumber = trackingNumber;
    order.estimatedDelivery = estimatedDelivery;
    order.status = 'confirmed';
    await order.save();

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Populate order for response
    await order.populate({
      path: 'items.product',
      select: 'title price image images category condition location seller'
    });

    res.status(201).json({ 
      message: 'Order created successfully', 
      order,
      orderNumber: orderNumber,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery
    });
  } catch (error) {
    console.error('Checkout error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ 
      message: 'Error creating order', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.product',
        select: 'title price image images category condition location seller'
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.id 
    }).populate({
      path: 'items.product',
      select: 'title price image images category condition location seller'
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status (for admin use)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery, notes } = req.body;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.estimatedDelivery = estimatedDelivery || order.estimatedDelivery;
    order.notes = notes || order.notes;

    await order.save();

    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getOrders,
  getOrder,
  updateOrderStatus
};
