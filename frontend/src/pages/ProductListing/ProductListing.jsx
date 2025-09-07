import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductListing.module.css';
import { backend_url } from '../../utils/helper';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = [
        'all', 'Electronics', 'Clothing', 'Books', 'Home & Garden',
        'Sports & Outdoors', 'Toys & Games', 'Automotive', 'Health & Beauty', 'Other'
    ];

    useEffect(() => {
        fetchProducts();
    }, [searchTerm, selectedCategory, currentPage]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 12
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory !== 'all') params.append('category', selectedCategory);

            const response = await fetch(`${backend_url}/api/products?${params}`);

            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
                setTotalPages(data.totalPages);
            } else {
                const errorText = await response.text();
                let errorMessage = 'Error fetching products';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                console.error('Error fetching products:', errorMessage);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Product added to cart successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error adding to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding to cart');
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>EcoFinds Marketplace</h1>
                <p className={styles.subtitle}>Discover sustainable second-hand treasures</p>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={styles.searchInput}
                    />
                    <span className={styles.searchIcon}>🔍</span>
                </div>

                <div className={styles.categoryFilters}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''
                                }`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category === 'all' ? 'All Categories' : category}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.productsGrid}>
                {products.length === 0 ? (
                    <div className={styles.noProducts}>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or category filter</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className={styles.productCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src={product.image || product.images?.[0]?.url || '/no-image.svg'}
                                    alt={product.title}
                                    className={styles.productImage}
                                />
                                <div className={styles.categoryTag}>{product.category}</div>
                            </div>

                            <div className={styles.productInfo}>
                                <h3 className={styles.productTitle}>{product.title}</h3>
                                <p className={styles.productDescription}>
                                    {product.description.length > 100
                                        ? `${product.description.substring(0, 100)}...`
                                        : product.description}
                                </p>
                                <div className={styles.productMeta}>
                                    <span className={styles.condition}>{product.condition}</span>
                                    <span className={styles.location}>📍 {product.location}</span>
                                </div>
                                <div className={styles.priceSection}>
                                    <span className={styles.price}>Rs.{product.price}</span>
                                    <div className={styles.actionButtons}>
                                        <Link
                                            to={`/product/${product._id}`}
                                            className={styles.viewBtn}
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            className={styles.cartBtn}
                                            onClick={() => handleAddToCart(product._id)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.paginationBtn}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles.paginationBtn}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <Link to="/add-product" className={styles.addProductBtn}>
                + Add New Product
            </Link>
        </div>
    );
};

export default ProductListing;
