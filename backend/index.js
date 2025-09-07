require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import route files
const userAuthRoutes = require("./routes/userAuth"); // contains OTP routes
const adminAuthRoutes = require("./routes/adminAuth");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// ===== Middleware =====
// CORS setup for frontend
const corsOptions = {
  origin: ["http://localhost:5174", "http://localhost:5173"], // Add your frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Use route files
app.use("/api/auth", userAuthRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// ===== MongoDB Connection =====
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ecofinds";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Health Check Routes =====
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Add sample products for testing
app.get("/api/setup-sample-data", async (req, res) => {
  try {
    const Product = require('./models/product');
    const User = require('./models/user');

    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ emailId: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        emailId: 'test@example.com',
        password: 'hashedpassword123',
        phoneno: '1234567890',
        city: 'New York',
        state: 'NY',
        country: 'USA'
      });
      await testUser.save();
    }

    // Clear existing products
    await Product.deleteMany({});

    // Add sample products
    const sampleProducts = [
      {
        title: 'Vintage DSLR Camera',
        description: 'Beautiful vintage DSLR camera in excellent condition. Perfect for photography enthusiasts. Includes original lens and carrying case.',
        category: 'Electronics',
        price: 150,
        image: '/no-image.svg',
        condition: 'Good',
        location: 'New York, NY',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Designer Leather Handbag',
        description: 'Luxury designer handbag, barely used. Genuine leather with gold hardware. Perfect for special occasions.',
        category: 'Clothing',
        price: 300,
        image: '/no-image.svg',
        condition: 'Like New',
        location: 'Los Angeles, CA',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Programming Books Collection',
        description: 'Collection of programming books for web development including React, Node.js, and JavaScript guides.',
        category: 'Books',
        price: 50,
        image: '/no-image.svg',
        condition: 'Good',
        location: 'Chicago, IL',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Mountain Bike',
        description: 'High-quality mountain bike perfect for outdoor adventures. Recently serviced and in great condition.',
        category: 'Sports & Outdoors',
        price: 400,
        image: '/no-image.svg',
        condition: 'Good',
        location: 'Denver, CO',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Garden Tools Set',
        description: 'Complete set of garden tools including shovel, rake, and pruning shears. Perfect for home gardening.',
        category: 'Home & Garden',
        price: 75,
        image: '/no-image.svg',
        condition: 'Fair',
        location: 'Portland, OR',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Board Game Collection',
        description: 'Collection of popular board games including Monopoly, Scrabble, and Chess. Great for family game nights.',
        category: 'Toys & Games',
        price: 60,
        image: '/no-image.svg',
        condition: 'Good',
        location: 'Seattle, WA',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Car Phone Mount',
        description: 'Universal car phone mount with magnetic attachment. Compatible with all smartphone sizes.',
        category: 'Automotive',
        price: 25,
        image: '/no-image.svg',
        condition: 'Like New',
        location: 'Miami, FL',
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Skincare Set',
        description: 'Premium skincare set including cleanser, moisturizer, and serum. Unopened and sealed.',
        category: 'Health & Beauty',
        price: 80,
        image: '/no-image.svg',
        condition: 'New',
        location: 'San Francisco, CA',
        seller: testUser._id,
        status: 'available'
      }
    ];

    await Product.insertMany(sampleProducts);

    res.json({ message: 'Sample data created successfully!', count: sampleProducts.length });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sample data', error: error.message });
  }
});

// Debug endpoint to test cart functionality
app.get("/api/debug/cart-test", async (req, res) => {
  try {
    const Product = require('./models/product');
    const User = require('./models/user');
    const Cart = require('./models/cart');
    const Order = require('./models/order');
    
    // Get first available product
    const product = await Product.findOne({ status: 'available' });
    const user = await User.findOne();
    const cart = await Cart.findOne();
    
    res.json({
      message: 'Debug info',
      hasProducts: !!product,
      hasUsers: !!user,
      hasCarts: !!cart,
      productId: product?._id,
      userId: user?._id,
      productTitle: product?.title,
      cartItems: cart?.items?.length || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

// Debug endpoint to test checkout without authentication
app.post("/api/debug/checkout-test", async (req, res) => {
  try {
    const Cart = require('./models/cart');
    const Order = require('./models/order');
    const User = require('./models/user');
    
    // Get first user
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ message: 'No users found' });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: user._id }).populate({
      path: 'items.product',
      select: 'title price image images category condition location seller status'
    });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      title: item.product.title,
      image: item.product.image || item.product.images?.[0]?.url || '/no-image.svg'
    }));

    // Calculate total amount
    const calculatedTotal = cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Create order
    const order = new Order({
      user: user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress: {},
      status: 'pending'
    });

    await order.save();
    
    res.json({
      message: 'Test order created successfully',
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: calculatedTotal,
      itemsCount: orderItems.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Test checkout error', 
      error: error.message,
      stack: error.stack
    });
  }
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    "Loaded OpenRouter API Key:",
    process.env.OPENROUTER_API_KEY ? "YES" : "NO"
  );
  console.log(
    "Using OpenRouter API Key:",
    process.env.OPENROUTER_API_KEY?.slice(0, 8)
  );
});
