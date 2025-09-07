import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddProduct.module.css';
import { backend_url } from '../../utils/helper';

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        condition: '',
        location: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Electronics', 'Clothing', 'Books', 'Home & Garden',
        'Sports & Outdoors', 'Toys & Games', 'Automotive', 'Health & Beauty', 'Other'
    ];

    const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        // Create preview URL and store the file
        const imageUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: file, imagePreview: imageUrl }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('location', formData.location);

            // Add image file if selected
            if (formData.image && formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            const response = await fetch(`${backend_url}/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (response.ok) {
                const data = await response.json();
                alert('Product added successfully!');
                navigate('/my-listings');
            } else {
                const errorText = await response.text();
                let errorMessage = 'Error adding product';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                setError(errorMessage);
            }
        } catch (error) {
            setError('Error adding product');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h1 className={styles.title}>Add New Product</h1>
            </div>

            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="title" className={styles.label}>
                            Product Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Enter product title"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category" className={styles.label}>
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.label}>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={styles.textarea}
                            placeholder="Describe your product..."
                            rows="4"
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="price" className={styles.label}>
                                Price (Rs.) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="condition" className={styles.label}>
                                Condition *
                            </label>
                            <select
                                id="condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select condition</option>
                                {conditions.map(condition => (
                                    <option key={condition} value={condition}>
                                        {condition}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="location" className={styles.label}>
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="City, State"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image" className={styles.label}>
                            Product Image
                        </label>
                        <div className={styles.imageUpload}>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className={styles.fileInput}
                            />
                            <label htmlFor="image" className={styles.fileLabel}>
                                <span className={styles.uploadIcon}>📷</span>
                                <span className={styles.uploadText}>
                                    {formData.image ? 'Change Image' : '+ Add Image (Placeholder)'}
                                </span>
                            </label>
                            {formData.imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={formData.imagePreview} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Adding Product...' : 'Submit Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
