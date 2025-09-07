import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './PurchaseHistory.module.css';
import { backend_url } from '../../utils/helper';

const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 🔍 Search + Category states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const categories = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/cart/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                const errorText = await response.text();
                let errorMessage = 'Failed to fetch orders';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                setError(errorMessage);
            }
        } catch (error) {
            setError('Error fetching orders');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f39c12';
            case 'confirmed': return '#3498db';
            case 'shipped': return '#9b59b6';
            case 'delivered': return '#27ae60';
            case 'cancelled': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'confirmed': return '✅';
            case 'shipped': return '🚚';
            case 'delivered': return '📦';
            case 'cancelled': return '❌';
            default: return '❓';
        }
    };

    const getStatusProgress = (status) => {
        switch (status) {
            case 'pending': return 25;
            case 'confirmed': return 50;
            case 'shipped': return 75;
            case 'delivered': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Order Received';
            case 'confirmed': return 'Order Confirmed';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 🔍 Handlers for search + category
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    // 🔍 Filtered orders
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderNumber?.toString().includes(searchTerm) ||
            order.items.some((item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesCategory =
            selectedCategory === 'all' || order.status.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading purchase history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={fetchOrders}>Try Again</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Purchase History</h1>
                <p className={styles.subtitle}>Track your orders and purchases</p>
            </div>

            {/* 🔍 Search + Filter Section */}
            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search orders by product or order number..."
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
                            {category === 'all' ? 'All Orders' : category}
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📦</div>
                    <h3>No matching orders</h3>
                    <p>Try changing your search or filter</p>
                    <Link to="/" className={styles.shopBtn}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {filteredOrders.map((order) => (
                        <div key={order._id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderInfo}>
                                    <h3 className={styles.orderNumber}>Order #{order.orderNumber}</h3>
                                    <p className={styles.orderDate}>Placed on {formatDate(order.createdAt)}</p>
                                </div>
                                <div className={styles.orderStatusContainer}>
                                    <div
                                        className={styles.orderStatus}
                                        style={{ color: getStatusColor(order.status) }}
                                    >
                                        <span className={styles.statusIcon}>{getStatusIcon(order.status)}</span>
                                        <span className={styles.statusText}>{getStatusText(order.status)}</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{
                                                width: `${getStatusProgress(order.status)}%`,
                                                backgroundColor: getStatusColor(order.status)
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.orderItems}>
                                <h4>Items ({order.items.length})</h4>
                                {order.items.map((item, index) => (
                                    <div key={index} className={styles.orderItem}>
                                        <img
                                            src={item.image || '/no-image.svg'}
                                            alt={item.title}
                                            className={styles.itemImage}
                                        />
                                        <div className={styles.itemDetails}>
                                            <h5 className={styles.itemTitle}>{item.title}</h5>
                                            <p className={styles.itemQuantity}>Quantity: {item.quantity}</p>
                                            <p className={styles.itemPrice}>${item.price} each</p>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderSummary}>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal:</span>
                                    <span>${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Shipping:</span>
                                    <span>Free</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Tax:</span>
                                    <span>$0.00</span>
                                </div>
                                <div className={styles.summaryTotal}>
                                    <span>Total:</span>
                                    <span>${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className={styles.trackingInfo}>
                                <h4>📦 Tracking Information</h4>
                                {order.trackingNumber ? (
                                    <div className={styles.trackingDetails}>
                                        <div className={styles.trackingRow}>
                                            <span className={styles.trackingLabel}>Tracking Number:</span>
                                            <span className={styles.trackingValue}>{order.trackingNumber}</span>
                                        </div>
                                        {order.estimatedDelivery && (
                                            <div className={styles.trackingRow}>
                                                <span className={styles.trackingLabel}>Estimated Delivery:</span>
                                                <span className={styles.trackingValue}>{formatDate(order.estimatedDelivery)}</span>
                                            </div>
                                        )}
                                        <div className={styles.trackingRow}>
                                            <span className={styles.trackingLabel}>Current Status:</span>
                                            <span className={styles.trackingValue} style={{ color: getStatusColor(order.status) }}>
                                                {getStatusIcon(order.status)} {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.noTracking}>Tracking information will be available once your order is processed.</p>
                                )}
                            </div>

                            {order.notes && (
                                <div className={styles.orderNotes}>
                                    <h4>Notes</h4>
                                    <p>{order.notes}</p>
                                </div>
                            )}

                            <div className={styles.orderActions}>
                                <button className={styles.viewDetailsBtn}>
                                    View Details
                                </button>
                                {order.status === 'delivered' && (
                                    <button className={styles.reorderBtn}>
                                        Reorder
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;
