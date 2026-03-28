# 🍕 Pizza Delivery App — Backend API Documentation

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT Bearer Token (sent in `Authorization` header)

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Table of Contents

1. [Authentication](#1-authentication)
   - [1.1 Register](#11-register)
   - [1.2 Login](#12-login)
   - [1.3 Get Current User](#13-get-current-user)
   - [1.4 Verify Email](#14-verify-email)
   - [1.5 Forgot Password](#15-forgot-password)
   - [1.6 Reset Password](#16-reset-password)
2. [Pizza / Ingredients](#2-pizza--ingredients)
   - [2.1 Get Ingredients](#21-get-ingredients)
   - [2.2 Get Inventory (Admin)](#22-get-inventory-admin)
   - [2.3 Update Stock (Admin)](#23-update-stock-admin)
3. [Orders](#3-orders)
   - [3.1 Create Order](#31-create-order)
   - [3.2 Verify Payment](#32-verify-payment)
   - [3.3 Get My Orders](#33-get-my-orders)
   - [3.4 Get All Orders (Admin)](#34-get-all-orders-admin)
   - [3.5 Update Order Status (Admin)](#35-update-order-status-admin)
4. [Data Models](#4-data-models)
5. [Error Handling](#5-error-handling)
6. [Environment Variables](#6-environment-variables)

---

## 1. Authentication

### 1.1 Register

Creates a new user account and sends a verification email.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful! Check your email for verification."
}
```

**Error Response (400):**
```json
{
  "message": "User with this email already exists"
}
```

**Backend Logic:**
1. Check if a user with the same email already exists
2. Hash the password using bcrypt (10+ salt rounds)
3. Generate a random email verification token
4. Save user to database with `emailVerified: false`
5. Send verification email with link: `{FRONTEND_URL}/verify-email?token={token}`
6. Return success message

---

### 1.2 Login

Authenticates a user and returns a JWT token.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

- **401 — Invalid credentials:**
```json
{
  "message": "Invalid email or password"
}
```

- **403 — Email not verified:**
```json
{
  "message": "Please verify your email before logging in"
}
```

**Backend Logic:**
1. Find user by email
2. Compare password hash using bcrypt
3. Check if `emailVerified` is `true`
4. Generate JWT token with `{ userId, role }` payload (expires in 7 days)
5. Return token and user object (excluding password)

---

### 1.3 Get Current User

Returns the currently authenticated user's profile.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Auth Required:** ✅ Yes (Bearer Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response (200):**
```json
{
  "user": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid or expired token"
}
```

**Backend Logic:**
1. Extract JWT from `Authorization` header
2. Verify and decode the token
3. Find user by `userId` from token payload
4. Return user object (excluding password)

---

### 1.4 Verify Email

Verifies a user's email address using the token sent during registration.

- **URL:** `/auth/verify-email/:token`
- **Method:** `GET`
- **Auth Required:** No

**URL Parameters:**
| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `token`   | String | The email verification token       |

**Success Response (200):**
```json
{
  "message": "Email verified successfully!"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid or expired verification token"
}
```

**Backend Logic:**
1. Find user with matching `verificationToken`
2. Check if token has expired (recommended: 24-hour expiry)
3. Set `emailVerified: true` and remove the token
4. Save user and return success

---

### 1.5 Forgot Password

Sends a password reset email to the user.

- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset link sent to your email"
}
```

**Error Response (404):**
```json
{
  "message": "No account found with this email"
}
```

**Backend Logic:**
1. Find user by email
2. Generate a random reset token with expiry (e.g., 1 hour)
3. Save `resetToken` and `resetTokenExpiry` to user document
4. Send email with link: `{FRONTEND_URL}/reset-password?token={token}`
5. Return success message (even if email not found, for security — optional)

---

### 1.6 Reset Password

Resets the user's password using the token from the reset email.

- **URL:** `/auth/reset-password/:token`
- **Method:** `POST`
- **Auth Required:** No

**URL Parameters:**
| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `token`   | String | The password reset token  |

**Request Body:**
```json
{
  "password": "newSecurePassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid or expired reset token"
}
```

**Backend Logic:**
1. Find user with matching `resetToken`
2. Check if `resetTokenExpiry` has not passed
3. Hash the new password
4. Update user's password, clear reset token fields
5. Return success

---

## 2. Pizza / Ingredients

### 2.1 Get Ingredients

Returns all available pizza ingredients for the pizza builder. Only returns ingredients that are in stock (stock > 0).

- **URL:** `/pizza/ingredients`
- **Method:** `GET`
- **Auth Required:** ✅ Yes

**Success Response (200):**
```json
{
  "ingredients": [
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e1f",
      "name": "Thin Crust",
      "category": "base",
      "priceAdd": 100,
      "stock": 50,
      "threshold": 20
    },
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e20",
      "name": "Tomato Sauce",
      "category": "sauce",
      "priceAdd": 30,
      "stock": 100,
      "threshold": 20
    },
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e21",
      "name": "Mozzarella",
      "category": "cheese",
      "priceAdd": 80,
      "stock": 60,
      "threshold": 15
    },
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e22",
      "name": "Bell Peppers",
      "category": "veggies",
      "priceAdd": 25,
      "stock": 40,
      "threshold": 10
    },
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e23",
      "name": "Pepperoni",
      "category": "meats",
      "priceAdd": 60,
      "stock": 35,
      "threshold": 10
    }
  ]
}
```

**Categories (5 types):**
| Category  | Selection Type | Required? |
|-----------|---------------|-----------|
| `base`    | Single select | ✅ Yes    |
| `sauce`   | Single select | ✅ Yes    |
| `cheese`  | Single select | ✅ Yes    |
| `veggies` | Multi select  | ❌ Optional |
| `meats`   | Multi select  | ❌ Optional |

---

### 2.2 Get Inventory (Admin)

Returns all ingredients with stock levels for admin management.

- **URL:** `/pizza/inventory`
- **Method:** `GET`
- **Auth Required:** ✅ Yes (Admin only)

**Success Response (200):**
```json
{
  "ingredients": [
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e1f",
      "name": "Thin Crust",
      "category": "base",
      "priceAdd": 100,
      "stock": 5,
      "threshold": 20
    }
  ]
}
```

**Error Response (403):**
```json
{
  "message": "Access denied. Admin only."
}
```

**Backend Logic:**
1. Verify the user has `role: "admin"`
2. Return ALL ingredients (including out-of-stock ones)
3. The frontend highlights items where `stock <= threshold` as "Low Stock"

---

### 2.3 Update Stock (Admin)

Updates the stock quantity of a specific ingredient.

- **URL:** `/pizza/inventory/:ingredientId`
- **Method:** `PUT`
- **Auth Required:** ✅ Yes (Admin only)

**URL Parameters:**
| Parameter       | Type   | Description                |
|-----------------|--------|----------------------------|
| `ingredientId`  | String | MongoDB ObjectId of ingredient |

**Request Body:**
```json
{
  "stock": 75
}
```

**Success Response (200):**
```json
{
  "message": "Stock updated successfully",
  "ingredient": {
    "_id": "665b2c3d4e5f6a7b8c9d0e1f",
    "name": "Thin Crust",
    "category": "base",
    "priceAdd": 100,
    "stock": 75,
    "threshold": 20
  }
}
```

**Backend Logic:**
1. Verify admin role
2. Find ingredient by ID
3. Update the `stock` field
4. Return updated ingredient

---

## 3. Orders

### 3.1 Create Order

Creates a new order and initiates a Razorpay payment.

- **URL:** `/orders/create`
- **Method:** `POST`
- **Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "pizzas": [
    {
      "base": "Thin Crust",
      "sauce": "Tomato Sauce",
      "cheese": "Mozzarella",
      "veggies": ["Bell Peppers", "Olives"],
      "meats": ["Pepperoni"],
      "price": 295
    },
    {
      "base": "Thick Crust",
      "sauce": "BBQ Sauce",
      "cheese": "Cheddar",
      "veggies": [],
      "meats": [],
      "price": 210
    }
  ],
  "totalAmount": 505
}
```

**Success Response (200):**
```json
{
  "razorpayKeyId": "rzp_test_xxxxxxxxxx",
  "razorpayOrder": {
    "id": "order_PxxxxxxxxxxxxxxX",
    "entity": "order",
    "amount": 50500,
    "amount_paid": 0,
    "amount_due": 50500,
    "currency": "INR",
    "status": "created"
  },
  "orderId": "665c3d4e5f6a7b8c9d0e1f2a"
}
```

**Backend Logic:**
1. Validate the pizza items and total amount
2. Create a Razorpay order using the Razorpay SDK:
   ```javascript
   const razorpayOrder = await razorpay.orders.create({
     amount: totalAmount * 100, // Convert ₹ to paise
     currency: "INR",
     receipt: `order_${Date.now()}`
   });
   ```
3. Save order to database with status `"Order Received"` and `paymentStatus: "pending"`
4. Store `razorpayOrderId` on the order document
5. Return Razorpay key ID and order details

**Important Notes:**
- Amount is in **paise** for Razorpay (multiply ₹ by 100)
- The `razorpayKeyId` is your **publishable** key (starts with `rzp_test_` or `rzp_live_`)
- Deduct ingredient stock quantities after successful payment (in verify endpoint)

---

### 3.2 Verify Payment

Verifies the Razorpay payment signature after successful payment on the frontend.

- **URL:** `/orders/verify`
- **Method:** `POST`
- **Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "razorpay_order_id": "order_PxxxxxxxxxxxxxxX",
  "razorpay_payment_id": "pay_PxxxxxxxxxxxxxxX",
  "razorpay_signature": "a1b2c3d4e5f6g7h8i9j0..."
}
```

**Success Response (200):**
```json
{
  "message": "Payment verified successfully",
  "order": {
    "_id": "665c3d4e5f6a7b8c9d0e1f2a",
    "status": "Order Received",
    "paymentStatus": "paid",
    "totalAmount": 505
  }
}
```

**Error Response (400):**
```json
{
  "message": "Payment verification failed. Invalid signature."
}
```

**Backend Logic:**
1. Generate expected signature using HMAC SHA256:
   ```javascript
   const crypto = require("crypto");
   const expectedSignature = crypto
     .createHmac("sha256", RAZORPAY_KEY_SECRET)
     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
     .digest("hex");
   ```
2. Compare `expectedSignature` with `razorpay_signature`
3. If match: Update order `paymentStatus` to `"paid"`
4. Deduct ingredient stock for each pizza in the order
5. If mismatch: Return 400 error

**Security Note:** This step is **critical** — never trust the frontend to confirm payment. Always verify the signature server-side using your Razorpay **secret key**.

---

### 3.3 Get My Orders

Returns all orders placed by the currently authenticated user. The frontend polls this endpoint every 30 seconds for real-time status updates.

- **URL:** `/orders/my-orders`
- **Method:** `GET`
- **Auth Required:** ✅ Yes

**Success Response (200):**
```json
{
  "orders": [
    {
      "_id": "665c3d4e5f6a7b8c9d0e1f2a",
      "pizzas": [
        {
          "base": "Thin Crust",
          "sauce": "Tomato Sauce",
          "cheese": "Mozzarella",
          "veggies": ["Bell Peppers"],
          "meats": ["Pepperoni"],
          "price": 295
        }
      ],
      "totalAmount": 295,
      "status": "In the Kitchen",
      "paymentStatus": "paid",
      "createdAt": "2025-06-01T10:30:00.000Z"
    }
  ]
}
```

**Backend Logic:**
1. Find all orders where `user` matches the authenticated user's ID
2. Sort by `createdAt` descending (newest first)
3. Only return orders with `paymentStatus: "paid"`

---

### 3.4 Get All Orders (Admin)

Returns all orders from all users for admin management.

- **URL:** `/orders/all`
- **Method:** `GET`
- **Auth Required:** ✅ Yes (Admin only)

**Success Response (200):**
```json
{
  "orders": [
    {
      "_id": "665c3d4e5f6a7b8c9d0e1f2a",
      "user": {
        "_id": "665a1b2c3d4e5f6a7b8c9d0e",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "pizzas": [
        {
          "base": "Thin Crust",
          "sauce": "Tomato Sauce",
          "cheese": "Mozzarella",
          "veggies": ["Bell Peppers"],
          "meats": ["Pepperoni"],
          "price": 295
        }
      ],
      "totalAmount": 295,
      "status": "Order Received",
      "paymentStatus": "paid",
      "createdAt": "2025-06-01T10:30:00.000Z"
    }
  ]
}
```

**Backend Logic:**
1. Verify admin role
2. Find all orders and populate the `user` field with `name` and `email`
3. Sort by `createdAt` descending

---

### 3.5 Update Order Status (Admin)

Updates the delivery status of an order.

- **URL:** `/orders/:orderId/status`
- **Method:** `PUT`
- **Auth Required:** ✅ Yes (Admin only)

**URL Parameters:**
| Parameter  | Type   | Description            |
|------------|--------|------------------------|
| `orderId`  | String | MongoDB ObjectId       |

**Request Body:**
```json
{
  "status": "In the Kitchen"
}
```

**Allowed Status Values:**
| Status             | Meaning                          |
|--------------------|----------------------------------|
| `Order Received`   | Order placed, payment confirmed  |
| `In the Kitchen`   | Pizza is being prepared          |
| `Sent to Delivery` | Out for delivery                 |

**Success Response (200):**
```json
{
  "message": "Order status updated",
  "order": {
    "_id": "665c3d4e5f6a7b8c9d0e1f2a",
    "status": "In the Kitchen"
  }
}
```

**Backend Logic:**
1. Verify admin role
2. Validate status is one of the 3 allowed values
3. Update order status
4. Return updated order

---

## 4. Data Models

### User Model
```javascript
{
  name:               String,     // Required
  email:              String,     // Required, unique, lowercase
  password:           String,     // Required, hashed with bcrypt
  role:               String,     // "user" or "admin", default: "user"
  emailVerified:      Boolean,    // default: false
  verificationToken:  String,     // Random token for email verification
  resetToken:         String,     // Random token for password reset
  resetTokenExpiry:   Date,       // Expiry time for reset token
  createdAt:          Date,       // Auto-generated
  updatedAt:          Date        // Auto-generated
}
```

### Ingredient Model
```javascript
{
  name:       String,   // Required, e.g. "Thin Crust"
  category:   String,   // Required, enum: ["base", "sauce", "cheese", "veggies", "meats"]
  priceAdd:   Number,   // Required, price in ₹ (e.g. 100)
  stock:      Number,   // Required, current stock count
  threshold:  Number,   // Low stock warning threshold (default: 20)
  createdAt:  Date,
  updatedAt:  Date
}
```

### Order Model
```javascript
{
  user:              ObjectId,   // Reference to User model
  pizzas: [{
    base:            String,
    sauce:           String,
    cheese:          String,
    veggies:         [String],
    meats:           [String],
    price:           Number
  }],
  totalAmount:       Number,     // Total in ₹
  status:            String,     // "Order Received" | "In the Kitchen" | "Sent to Delivery"
  paymentStatus:     String,     // "pending" | "paid" | "failed"
  razorpayOrderId:   String,     // Razorpay order ID
  razorpayPaymentId: String,     // Razorpay payment ID (after verification)
  createdAt:         Date,
  updatedAt:         Date
}
```

---

## 5. Error Handling

All error responses follow this format:

```json
{
  "message": "Human-readable error description"
}
```

### Common HTTP Status Codes

| Code | Meaning                | When Used                              |
|------|------------------------|----------------------------------------|
| 200  | OK                     | Successful request                     |
| 201  | Created                | User registered successfully           |
| 400  | Bad Request            | Invalid input, expired token           |
| 401  | Unauthorized           | Missing/invalid JWT token              |
| 403  | Forbidden              | Non-admin accessing admin route        |
| 404  | Not Found              | Resource doesn't exist                 |
| 500  | Internal Server Error  | Server-side errors                     |

---

## 6. Environment Variables

Your backend server needs these environment variables:

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/pizza-app

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# Email (for verification & reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Middleware Summary

You'll need these middleware functions:

| Middleware     | Purpose                                            | Used On                        |
|----------------|----------------------------------------------------|---------------------------------|
| `auth`         | Verifies JWT token, attaches `req.user`            | All protected routes            |
| `adminOnly`    | Checks `req.user.role === "admin"`                 | Admin routes                    |
| `errorHandler` | Catches errors, returns formatted JSON response    | Global (app-level)              |

---

## Recommended Tech Stack for Backend

| Component     | Recommended                     |
|---------------|---------------------------------|
| Runtime       | Node.js                         |
| Framework     | Express.js                      |
| Database      | MongoDB + Mongoose              |
| Auth          | JWT (jsonwebtoken) + bcrypt     |
| Payments      | Razorpay Node SDK               |
| Email         | Nodemailer                      |
| Validation    | express-validator or Joi        |

---

## Quick Setup Checklist

- [ ] Initialize Node.js project (`npm init`)
- [ ] Install dependencies: `express mongoose jsonwebtoken bcryptjs razorpay nodemailer cors dotenv`
- [ ] Create MongoDB database and seed ingredients
- [ ] Set up Razorpay test account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
- [ ] Configure SMTP for emails (Gmail app password or Mailgun/SendGrid)
- [ ] Create an admin user manually in the database (`role: "admin"`)
- [ ] Enable CORS for your frontend URL
- [ ] Test all 13 endpoints with Postman or Thunder Client
