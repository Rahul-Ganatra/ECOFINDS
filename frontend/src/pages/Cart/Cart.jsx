import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';
import { backend_url } from '../../utils/helper';
import { useUser } from '../../UserContext';

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState({});

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
            setError('Please log in to view your cart');
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCart(data);
            } else {
                const errorText = await response.text();
                let errorMessage = 'Failed to fetch cart';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                setError(errorMessage);
            }
        } catch (error) {
            setError('Error fetching cart');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        try {
            setUpdating(prev => ({ ...prev, [itemId]: true }));
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/cart/item/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchCart(); // Refresh cart
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Error removing item');
        } finally {
            setUpdating(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setUpdating(prev => ({ ...prev, [itemId]: true }));
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/cart/item/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (response.ok) {
                fetchCart(); // Refresh cart
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error updating quantity');
        } finally {
            setUpdating(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleCheckout = async () => {
        try {
            if (!user) {
                alert('Please log in to proceed with checkout');
                navigate('/login');
                return;
            }

            const token = localStorage.getItem('token');
            console.log('Checkout attempt:', {
                hasToken: !!token,
                tokenLength: token?.length,
                backendUrl: backend_url,
                userId: user._id
            });

            if (!token) {
                alert('Please log in to proceed with checkout');
                navigate('/login');
                return;
            }

            const response = await fetch(`${backend_url}/api/cart/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shippingAddress: {
                        street: '123 Main St',
                        city: 'New York',
                        state: 'NY',
                        zipCode: '10001',
                        country: 'USA'
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Order placed successfully!\nOrder Number: ${data.orderNumber}\nTracking Number: ${data.trackingNumber}\nEstimated Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}`);
                navigate('/purchase-history');
            } else {
                const errorText = await response.text();
                console.error('Checkout error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                });

                let errorMessage = 'Failed to place order';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                alert(`Checkout failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order');
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                {user ? (
                    <button onClick={fetchCart}>Try Again</button>
                ) : (
                    <Link to="/login" className={styles.loginBtn}>
                        Log In
                    </Link>
                )}
            </div>
        );
    }

    const cartItems = cart?.items || [];
    const totalAmount = cart?.totalAmount || 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Shopping Cart</h1>
                <p className={styles.subtitle}>Review your items before checkout</p>
            </div>

            {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                    <div className={styles.emptyCartIcon}>🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <Link to="/" className={styles.shopBtn}>
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <div className={styles.cartItems}>
                        {cartItems.map((item) => (
                            <div key={item._id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    <img
                                        src={item.product?.image || item.product?.images?.[0]?.url || '/no-image.svg'}
                                        alt={item.product?.title}
                                        className={styles.productImage}
                                    />
                                </div>
                                <div className={styles.itemDetails}>
                                    <h3 className={styles.itemTitle}>{item.product?.title}</h3>
                                    <p className={styles.itemCategory}>{item.product?.category}</p>
                                    <p className={styles.itemCondition}>Condition: {item.product?.condition}</p>
                                    <p className={styles.itemLocation}>📍 {item.product?.location}</p>
                                </div>
                                <div className={styles.itemQuantity}>
                                    <label htmlFor={`quantity-${item._id}`}>Quantity:</label>
                                    <div className={styles.quantityControls}>
                                        <button
                                            className={styles.quantityBtn}
                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updating[item._id]}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            id={`quantity-${item._id}`}
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                                            className={styles.quantityInput}
                                            min="1"
                                            disabled={updating[item._id]}
                                        />
                                        <button
                                            className={styles.quantityBtn}
                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                            disabled={updating[item._id]}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.itemPrice}>
                                    <span className={styles.price}>${item.product?.price}</span>
                                    <span className={styles.totalPrice}>
                                        Total: ${(item.product?.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveItem(item._id)}
                                        disabled={updating[item._id]}
                                    >
                                        {updating[item._id] ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.cartSummary}>
                        <div className={styles.summaryCard}>
                            <h3>Order Summary</h3>
                            <div className={styles.summaryRow}>
                                <span>Subtotal ({cartItems.length} items):</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tax:</span>
                                <span>0.00</span>
                            </div>
                            <div className={styles.summaryDivider}></div>
                            <div className={styles.summaryRow}>
                                <span className={styles.totalLabel}>Total:</span>
                                <span className={styles.totalAmount}>${totalAmount.toFixed(2)}</span>
                            </div>
                            <button
                                className={styles.checkoutBtn}
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </button>
                            <Link to="/" className={styles.continueShopping}>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default Cart;
