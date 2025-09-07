const Product = require('../models/product');
const User = require('../models/user');
const { uploadSingleImage, uploadMultipleImages, deleteImage, deleteMultipleImages } = require('../utils/imageUpload');

// Get all products with filtering and search
const getAllProducts = async (req, res) => {
  try {
    console.log('Getting all products with query:', req.query);
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = { status: 'available' };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('buyer', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      condition,
      location
    } = req.body;

    let imageData = null;
    let images = [];

    // Handle single image upload
    if (req.file) {
      try {
        imageData = await uploadSingleImage(req.file);
        images = [imageData];
      } catch (uploadError) {
        return res.status(400).json({ 
          message: 'Error uploading image', 
          error: uploadError.message 
        });
      }
    }

    // Handle multiple images upload
    if (req.files && req.files.length > 0) {
      try {
        images = await uploadMultipleImages(req.files);
      } catch (uploadError) {
        return res.status(400).json({ 
          message: 'Error uploading images', 
          error: uploadError.message 
        });
      }
    }

    const product = new Product({
      title,
      description,
      category,
      price,
      image: images.length > 0 ? images[0].url : '/no-image.svg',
      images: images,
      condition,
      location,
      seller: req.user.id
    });

    await product.save();
    await product.populate('seller', 'name email');

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      condition,
      location
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    let newImages = [...product.images];

    // Handle new image uploads
    if (req.file) {
      try {
        const imageData = await uploadSingleImage(req.file);
        newImages = [imageData];
      } catch (uploadError) {
        return res.status(400).json({ 
          message: 'Error uploading image', 
          error: uploadError.message 
        });
      }
    }

    // Handle multiple new images upload
    if (req.files && req.files.length > 0) {
      try {
        newImages = await uploadMultipleImages(req.files);
      } catch (uploadError) {
        return res.status(400).json({ 
          message: 'Error uploading images', 
          error: uploadError.message 
        });
      }
    }

    // Delete old images from Cloudinary if new ones are uploaded
    if ((req.file || (req.files && req.files.length > 0)) && product.images.length > 0) {
      try {
        const publicIds = product.images.map(img => img.public_id);
        await deleteMultipleImages(publicIds);
      } catch (deleteError) {
        console.error('Error deleting old images:', deleteError);
        // Continue with update even if deletion fails
      }
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price || product.price;
    product.condition = condition || product.condition;
    product.location = location || product.location;
    
    // Update images if new ones were uploaded
    if (req.file || (req.files && req.files.length > 0)) {
      product.images = newImages;
      product.image = newImages.length > 0 ? newImages[0].url : product.image;
    }

    await product.save();
    await product.populate('seller', 'name email');

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        const publicIds = product.images.map(img => img.public_id);
        await deleteMultipleImages(publicIds);
      } catch (deleteError) {
        console.error('Error deleting images from Cloudinary:', deleteError);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get user's products
const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user products', error: error.message });
  }
};

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // For now, we'll just return success. In a real app, you'd have a cart model
    res.json({ message: 'Product added to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product to cart', error: error.message });
  }
};

// Purchase product
const purchaseProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot purchase your own product' });
    }

    product.buyer = req.user.id;
    product.status = 'sold';
    await product.save();

    res.json({ message: 'Product purchased successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing product', error: error.message });
  }
};

// Get user's purchased products
const getUserPurchases = async (req, res) => {
  try {
    const products = await Product.find({ buyer: req.user.id })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user purchases', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  addToCart,
  purchaseProduct,
  getUserPurchases
};
