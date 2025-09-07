const cloudinary = require('cloudinary').v2;

// Upload single image to Cloudinary
const uploadSingleImage = async (file, folder = 'ecofinds/products') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      transformation: [
        { width: 800, height: 600, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      public_id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload multiple images to Cloudinary
const uploadMultipleImages = async (files, folder = 'ecofinds/products') => {
  try {
    const uploadPromises = files.map(file => uploadSingleImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Failed to upload images');
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

// Delete multiple images from Cloudinary
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw new Error('Failed to delete images');
  }
};

// Generate optimized image URL with transformations
const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  };

  const finalTransformations = { ...defaultTransformations, ...transformations };
  
  return cloudinary.url(publicId, finalTransformations);
};

// Generate responsive image URLs for different screen sizes
const getResponsiveImageUrls = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 200, crop: 'fill' }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 400, crop: 'fill' }),
    large: getOptimizedImageUrl(publicId, { width: 800, height: 600, crop: 'limit' }),
    original: getOptimizedImageUrl(publicId, { width: 1200, height: 800, crop: 'limit' })
  };
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  getResponsiveImageUrls
};
