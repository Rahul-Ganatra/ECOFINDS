# 🛒 Marketplace App

A full-stack **marketplace application** where users can securely sign up with OTP verification, browse and view product details, manage carts, purchase items, and sellers can add, edit, delete, and track their product listings including sold-out items.  

Built with a **scalable backend** and a **user-friendly frontend**.

---

## 🚀 Features

- ✅ Secure **signup & login with OTP email verification**
- ✅ Product feed with **search & category filters**
- ✅ **Product details view** with image, description, price, and category
- ✅ **Cart management** with checkout flow
- ✅ **Seller features**: add, edit, delete, and view sold-out products
- ✅ **User dashboard** with profile editing
- ✅ Consolidated **My Listings** & **My Purchases** in dashboard
- ✅ **Purchase history** tracking for buyers

---

## 🛠 Tech Stack

**Frontend**
- React.js  
- Tailwind CSS (or any styling library)  
- Axios (for API calls)  

**Backend**
- Node.js with Express.js (v5.1.0)  
- MongoDB Atlas with Mongoose ODM  
- Redis (for caching & session management)  
- Nodemailer with SMTP (for OTP & notifications)  
- Cloudinary (for product image storage)  
- JWT (authentication)  
- bcrypt (password hashing)  
- Express Validator (input validation)  

**Development**
- Nodemon (hot reloading)

---

## 🔑 Environment Variables

Create a `.env` file inside the **backend** folder:

```env
# Database
MONGO_URI=

# Email (for OTP via SMTP)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# JWT Secret
JWT_KEY=

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

```

#### 📂 Project Structure
```
.
├── frontend/         # React frontend
│   ├── src/
│   └── package.json
│
├── backend/          # Node.js backend
│   ├── src/
│   ├── models/       # Mongoose schemas (Users, Products, Carts, Orders)
│   ├── routes/       # API routes
│   ├── controllers/  # Business logic
│   ├── utils/        # Helpers (email, jwt, cloudinary)
│   └── package.json
│
└── README.md
```


## 🔒 Security & Performance

OTP verification during signup ensures only valid users

JWT authentication for secure session management

bcrypt hashing for passwords

CORS configured for cross-origin access

API rate limiting for preventing abuse

## Built by Team Unfortunately Fortunate
