import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './MyListings.module.css';
import { backend_url } from '../../utils/helper';

const MyListings = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search + Category states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const categories = ['all', 'electronics', 'fashion', 'books', 'furniture'];

    useEffect(() => {
        fetchUserProducts();
    }, []);

    const fetchUserProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/products/user/my-products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                const errorText = await response.text();
                let errorMessage = 'Error fetching products';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                setError(errorMessage);
            }
        } catch (error) {
            setError('Error fetching products');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Product deleted successfully!');
                fetchUserProducts(); // Refresh the list
            } else {
                alert(data.message || 'Error deleting product');
            }
        } catch (error) {
            alert('Error deleting product');
            console.error('Error:', error);
        }
    };

    // Handlers for search + category
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    // Filtered products
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your products...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Listings</h1>
                <p className={styles.subtitle}>Manage your products</p>
                <Link to="/add-product" className={styles.addBtn}>
                    + Add New Product
                </Link>
            </div>

            {/* 🔍 Search + Filter Section */}
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
                            className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category === 'all' ? 'All Categories' : category}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div className={styles.noProducts}>
                    <div className={styles.noProductsIcon}>📦</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or category filter</p>
                </div>
            ) : (
                <div className={styles.productsGrid}>
                    {filteredProducts.map((product) => (
                        <div key={product._id} className={styles.productCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src={product.image || product.images?.[0]?.url || '/no-image.svg'}
                                    alt={product.title}
                                    className={styles.productImage}
                                />
                                <div className={styles.statusTag}>
                                    {product.status === 'available' ? 'Available' :
                                        product.status === 'sold' ? 'Sold' : 'Pending'}
                                </div>
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
                                            View
                                        </Link>
                                        <Link
                                            to={`/edit-product/${product._id}`}
                                            className={styles.editBtn}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteProduct(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.dateInfo}>
                                    Listed on {new Date(product.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListings;
