import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';
import { backend_url } from '../../utils/helper';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${backend_url}/api/products/${id}`);
            const data = await response.json();

            if (response.ok) {
                setProduct(data);

                // Check if current user is the owner
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                setIsOwner(data.seller._id === user._id);
            } else {
                setError(data.message || 'Product not found');
            }
        } catch (error) {
            setError('Error fetching product');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/products/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: id })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Product added to cart successfully!');
            } else {
                alert(data.message || 'Error adding to cart');
            }
        } catch (error) {
            alert('Error adding to cart');
            console.error('Error:', error);
        }
    };

    const handlePurchase = async () => {
        if (!window.confirm('Are you sure you want to purchase this product?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/products/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: id })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Product purchased successfully!');
                fetchProduct(); // Refresh product data
            } else {
                alert(data.message || 'Error purchasing product');
            }
        } catch (error) {
            alert('Error purchasing product');
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.errorContainer}>
                <h2>Product Not Found</h2>
                <p>{error || 'The product you are looking for does not exist.'}</p>
                <button
                    className={styles.backBtn}
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h1 className={styles.title}>Product Details</h1>
            </div>

            <div className={styles.productContainer}>
                <div className={styles.imageSection}>
                    <div className={styles.imageContainer}>
                        <img
                            src={product.image || product.images?.[0]?.url || '/no-image.svg'}
                            alt={product.title}
                            className={styles.productImage}
                        />
                        <div className={styles.statusBadge}>
                            {product.status === 'available' ? 'Available' :
                                product.status === 'sold' ? 'Sold' : 'Pending'}
                        </div>
                    </div>
                </div>

                <div className={styles.detailsSection}>
                    <div className={styles.productHeader}>
                        <h2 className={styles.productTitle}>{product.title}</h2>
                        <div className={styles.categoryTag}>{product.category}</div>
                    </div>

                    <div className={styles.priceSection}>
                        <span className={styles.price}>Rs.{product.price}</span>
                        <span className={styles.condition}>{product.condition}</span>
                    </div>

                    <div className={styles.descriptionSection}>
                        <h3>Description</h3>
                        <p className={styles.description}>{product.description}</p>
                    </div>

                    <div className={styles.sellerSection}>
                        <h3>Seller Information</h3>
                        <div className={styles.sellerInfo}>
                            <div className={styles.sellerAvatar}>
                                {product.seller.name ? product.seller.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className={styles.sellerDetails}>
                                <p className={styles.sellerName}>{product.seller.name || 'Anonymous'}</p>
                                <p className={styles.sellerEmail}>{product.seller.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.locationSection}>
                        <h3>Location</h3>
                        <p className={styles.location}>📍 {product.location}</p>
                    </div>

                    <div className={styles.actionSection}>
                        {isOwner ? (
                            <div className={styles.ownerActions}>
                                <p className={styles.ownerMessage}>This is your product</p>
                                <div className={styles.ownerButtons}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => navigate(`/edit-product/${product._id}`)}
                                    >
                                        Edit Product
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => navigate('/my-listings')}
                                    >
                                        Manage Listings
                                    </button>
                                </div>
                            </div>
                        ) : product.status === 'available' ? (
                            <div className={styles.buyerActions}>
                                <button
                                    className={styles.cartBtn}
                                    onClick={handleAddToCart}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    className={styles.purchaseBtn}
                                    onClick={handlePurchase}
                                >
                                    Purchase Now
                                </button>
                            </div>
                        ) : (
                            <div className={styles.unavailableActions}>
                                <p className={styles.unavailableMessage}>
                                    This product is no longer available
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={styles.metaInfo}>
                        <p className={styles.dateInfo}>
                            Listed on {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                        {product.updatedAt !== product.createdAt && (
                            <p className={styles.updateInfo}>
                                Last updated on {new Date(product.updatedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
