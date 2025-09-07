const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update totalAmount and itemCount before saving
cartSchema.pre('save', async function(next) {
  this.itemCount = this.items.length;
  
  // Calculate total amount - handle both populated and non-populated products
  let totalAmount = 0;
  for (const item of this.items) {
    if (item.product && typeof item.product === 'object' && item.product.price) {
      // Product is populated
      totalAmount += item.product.price * item.quantity;
    } else {
      // Product is not populated, we'll calculate this after population
      totalAmount = 0;
      break;
    }
  }
  
  this.totalAmount = totalAmount;
  this.updatedAt = Date.now();
  next();
});

// Populate product details when fetching cart
cartSchema.pre('findOne', function() {
  this.populate({
    path: 'items.product',
    select: 'title price image images category condition location seller status'
  });
});

cartSchema.pre('find', function() {
  this.populate({
    path: 'items.product',
    select: 'title price image images category condition location seller status'
  });
});

module.exports = mongoose.model('Cart', cartSchema);
