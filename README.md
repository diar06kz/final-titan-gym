# Titan GYM — Final Project (Node.js + Express + MongoDB)

Tutan GYM is a full-stack fitness booking web application that allows users to register, log in, manage their profile, browse gym programs, and book training sessions.

Backend is built with **Node.js + Express**, database is **MongoDB**, authentication is **JWT**, passwords are hashed with **bcrypt**, validation uses **Joi**, and advanced features include **RBAC roles** + **SMTP welcome email** (Nodemailer, optional).

---

## Project Overview

Bloom GYM simulates a real fitness club booking system.

### Users can:
- create an account (register)
- log in to receive a JWT token
- open profile page and update personal data
- open Programs page, choose a program and book a time slot
- view and update their bookings
- cancel booking (status → `cancelled`)

### Admins / Moderators can:
- view **all bookings** (with user name/email/phone and role)
- admin can delete any booking

### Premium role:
- regular users have a limit of **max 3 active bookings**
- premium/admin users do not have that limit

---

## Main Features

### ✅ Authentication
- Register new users with hashed passwords (bcrypt)
- Login with JWT token
- Middleware protects private endpoints

### ✅ User Profile
- Get current user profile (`GET /users/profile`)
- Update profile (`PUT /users/profile`) with validation

### ✅ Bookings CRUD (Second Collection)
- Create booking
- Get all bookings for logged-in user
- Get booking by id (owner/admin only)
- Update booking (owner/admin only)
- Cancel booking (user) by setting `status="cancelled"`
- Delete booking (admin only)

### ✅ Advanced Features
- RBAC roles: `user`, `premium`, `moderator`, `admin`
- Admin/moderator endpoint: view all bookings
- SMTP (Nodemailer) welcome email (configurable by env)

---

## Roles & Access (RBAC)

Roles stored in `User.role`:
- `user`
- `premium`
- `moderator`
- `admin`

Rules:
- **user**: can manage ONLY own bookings; limit max **3 active** (`status="booked"`); can cancel booking (`status="cancelled"`)
- **premium**: can manage ONLY own bookings; **no limit**
- **moderator**: can view **all bookings** (read-only in UI), cannot delete
- **admin**: can view **all bookings** and **delete** any booking

Endpoints protected by RBAC:
- `GET /bookings/admin/all` → `admin` + `moderator`
- `DELETE /bookings/:id` → `admin` only

---

## Tech Stack

Backend:
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Joi validation
- Nodemailer (SMTP)
- Helmet + CORS + Morgan

Frontend:
- HTML
- CSS
- Bootstrap
- Vanilla JavaScript (Fetch API + localStorage token)

---

## Project Structure

```
titan-gym-backend/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── bookingController.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Booking.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── bookingRoutes.js
│   │
│   ├── services/
│   │   └── emailService.js
│   │
│   ├── utils/
│   │   ├── apiError.js
│   │   └── generateToken.js
│   │
│   └── validators/
│       ├── authValidators.js
│       ├── bookingValidators.js
│       └── userValidators.js
│
├── app.js
├── package.json
├── README.md
└── .gitignore
```

Frontend (example):
```
frontend/
  index.html
  profile.html
  programs.html
  style.css
  script.js
  pictures/
```

---

## Installation From Zero (Local)

### 0) Requirements
Install:
- Node.js (LTS recommended)
- MongoDB (local) OR MongoDB Atlas
- VS Code + Live Server extension (for frontend)

Check versions:
```bash
node -v
npm -v
```

### 1) Download / Clone project
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd titan-gym-backend
```

### 2) Install dependencies
```bash
npm install
```

### 3) Create `.env` file (IMPORTANT)
Create `.env` in project root (same folder as `package.json`):

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/titan_gym
JWT_SECRET=super_secret_key_change_me
JWT_EXPIRES_IN=7d

CLIENT_URL=http://127.0.0.1:5500,http://localhost:5500

MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=YOUR_API_KEY
MAIL_FROM="Bloom GYM <no-reply@titangym.com>"
ENABLE_EMAIL=false
```

Notes:
- `CLIENT_URL` must include your frontend origin (Live Server).
- If you use MongoDB Atlas, set `MONGO_URI` to your Atlas connection string.
- Do NOT push `.env` to GitHub.

### 4) Run backend
Dev mode:
```bash
npm run dev
```

Backend will run at:
- `http://localhost:5001`

Test quickly:
- `GET http://localhost:5001/` → `{ "message": "API is running" }`

### 5) Run frontend
Open `frontend/` with VS Code and run **Live Server** on:
- `index.html`
- `profile.html`
- `programs.html`

Frontend uses:
```js
const API_BASE = "http://localhost:5001";
```

---

## How to Use (User Flow)

### Step 1 — Register
1. Open `index.html`
2. Click **Sign Up/In**
3. Fill in Sign Up form (name, surname, email, phone, password)
4. Submit → token is saved to localStorage automatically

### Step 2 — Login
1. Click **Sign Up/In**
2. Switch to Sign In
3. Enter email + password
4. Submit → token is saved

### Step 3 — Open Profile
1. Open `profile.html`
2. If logged in → profile loads from server (`GET /users/profile`)
3. Update phone/city/DOB/goal and press **Save Changes** (`PUT /users/profile`)

### Step 4 — Programs & Booking
1. Open `programs.html`
2. Choose a category filter
3. Click **Book** on any program
4. Choose date + time + optional note → confirm
5. Booking appears in “My bookings” table

### Step 5 — Update Booking
1. In bookings table click **Update**
2. Change date/time/note
3. Save changes (`PUT /bookings/:id`)

### Step 6 — Cancel Booking (User)
1. Regular user sees **Cancel** button for active bookings
2. Click cancel → sends (`PUT /bookings/:id`) with:
```json
{ "status": "cancelled" }
```

### Step 7 — Delete Booking (Admin only)
1. Admin sees **Delete** button
2. Click delete (`DELETE /bookings/:id`)

### Premium Limit (Important)
If role is NOT `premium` and NOT `admin`:
- maximum **3 active bookings** (`status="booked"`)
- if user tries to create more → server returns **403**:
```json
{ "message": "Limit reached: upgrade to premium for more bookings" }
```

---

## API Documentation (Detailed)

### Base URL (Local)
`http://localhost:5001`

### Auth Header for Private Endpoints
For private endpoints include:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Common Error Format
All errors return:
```json
{ "message": "Error message" }
```

---

# 1) AUTH (Public)

## 1.1 POST `/register`
Register a new user (bcrypt password hashing + optional welcome email).

**Request body**
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@mail.com",
  "phone": "+7 777 777 77 77",
  "password": "password123"
}
```

**Success response (201)**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John",
    "surname": "Doe",
    "email": "john@mail.com",
    "role": "user"
  }
}
```

**Errors**
- `400` user exists:
```json
{ "message": "User with this email already exists" }
```
- `400` validation error (example):
```json
{ "message": "\"password\" length must be at least 8 characters long" }
```

**Notes**
- Email is lowercased before saving.
- Welcome email is sent only if `ENABLE_EMAIL=true`.

---

## 1.2 POST `/login`
Login and get JWT token.

**Request body**
```json
{
  "email": "john@mail.com",
  "password": "password123"
}
```

**Success response (200)**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John",
    "surname": "Doe",
    "email": "john@mail.com",
    "role": "user"
  }
}
```

**Errors**
- `400` invalid credentials:
```json
{ "message": "Invalid email or password" }
```
- `400` validation error (example):
```json
{ "message": "\"email\" must be a valid email" }
```

---

# 2) USER (Private)

## 2.1 GET `/users/profile`
Retrieve the logged-in user's profile (password excluded).

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success response (200)**
```json
{
  "user": {
    "_id": "USER_ID",
    "name": "John",
    "surname": "Doe",
    "email": "john@mail.com",
    "phone": "+7...",
    "role": "user",
    "city": "",
    "dateOfBirth": null,
    "goal": "",
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-05T10:00:00.000Z"
  }
}
```

**Errors**
- `401` missing token:
```json
{ "message": "Unauthorized: token missing" }
```
- `401` invalid token:
```json
{ "message": "Unauthorized: invalid token" }
```

---

## 2.2 PUT `/users/profile`
Update profile fields (validated by Joi).  
If email is provided, it is checked for duplicates and lowercased.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request body (example)**
```json
{
  "phone": "+7 700 000 00 00",
  "city": "Almaty",
  "dateOfBirth": "2004-05-21",
  "goal": "Build muscle"
}
```

**Success response (200)**
```json
{
  "user": {
    "_id": "USER_ID",
    "name": "John",
    "surname": "Doe",
    "email": "john@mail.com",
    "phone": "+7 700 000 00 00",
    "role": "user",
    "city": "Almaty",
    "dateOfBirth": "2004-05-21T00:00:00.000Z",
    "goal": "Build muscle"
  }
}
```

**Errors**
- `400` validation error (example):
```json
{ "message": "\"goal\" length must be less than or equal to 200 characters long" }
```
- `400` email already in use:
```json
{ "message": "Email already in use" }
```

---

# 3) BOOKINGS (Private)

## 3.1 POST `/bookings`
Create a new booking for current user.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request body**
```json
{
  "programTitle": "Strength Basics",
  "category": "strength",
  "date": "2026-02-10",
  "time": "15:00",
  "note": "first class"
}
```

**Success response (201)**
```json
{
  "booking": {
    "_id": "BOOKING_ID",
    "user": "USER_ID",
    "programTitle": "Strength Basics",
    "category": "strength",
    "date": "2026-02-10T00:00:00.000Z",
    "time": "15:00",
    "status": "booked",
    "note": "first class",
    "createdAt": "2026-02-05T10:10:00.000Z",
    "updatedAt": "2026-02-05T10:10:00.000Z"
  }
}
```

**Errors**
- `400` validation error (example):
```json
{ "message": "\"category\" must be one of [strength, cardio, yoga, dance]" }
```
- `403` booking limit reached (user role only):
```json
{ "message": "Limit reached: upgrade to premium for more bookings" }
```

**Notes**
- If role is NOT `premium` and NOT `admin` → max 3 active bookings (`status="booked"`).

---

## 3.2 GET `/bookings`
Get bookings of the current logged-in user.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success response (200)**
```json
{
  "bookings": [
    {
      "_id": "BOOKING_ID",
      "user": "USER_ID",
      "programTitle": "Yoga Flow",
      "category": "yoga",
      "date": "2026-02-10T00:00:00.000Z",
      "time": "12:00",
      "status": "booked",
      "note": "",
      "createdAt": "2026-02-05T10:10:00.000Z",
      "updatedAt": "2026-02-05T10:10:00.000Z"
    }
  ]
}
```

---

## 3.3 GET `/bookings/:id`
Get booking by id. Access: **owner OR admin**.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success response (200)**
```json
{
  "booking": {
    "_id": "BOOKING_ID",
    "user": "USER_ID",
    "programTitle": "Strength Basics",
    "category": "strength",
    "date": "2026-02-10T00:00:00.000Z",
    "time": "15:00",
    "status": "booked",
    "note": "first class"
  }
}
```

**Errors**
- `404` booking not found:
```json
{ "message": "Booking not found" }
```
- `403` forbidden (not owner and not admin):
```json
{ "message": "Forbidden" }
```
- `400` invalid id format:
```json
{ "message": "Invalid booking id" }
```

---

## 3.4 PUT `/bookings/:id`
Update booking fields. Access: **owner OR admin**.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request body (example)**
```json
{
  "date": "2026-02-12",
  "time": "18:30",
  "note": "updated note"
}
```

**Success response (200)**
```json
{
  "booking": {
    "_id": "BOOKING_ID",
    "user": "USER_ID",
    "programTitle": "Strength Basics",
    "category": "strength",
    "date": "2026-02-12T00:00:00.000Z",
    "time": "18:30",
    "status": "booked",
    "note": "updated note",
    "updatedAt": "2026-02-05T10:20:00.000Z"
  }
}
```

**Errors**
- `400` validation error (example):
```json
{ "message": "\"note\" length must be less than or equal to 500 characters long" }
```
- `403` forbidden:
```json
{ "message": "Forbidden" }
```
- `404` booking not found:
```json
{ "message": "Booking not found" }
```

---

## 3.5 Cancel Booking (User)
Regular users do not delete bookings — they cancel them by setting status to `cancelled`.

### PUT `/bookings/:id`

**Request body**
```json
{
  "status": "cancelled"
}
```

**Success response (200)**
```json
{
  "booking": {
    "_id": "BOOKING_ID",
    "status": "cancelled"
  }
}
```

**Notes**
- booking remains in database
- status changes to `cancelled`
- active booking limit is updated

---

## 3.6 DELETE `/bookings/:id` (Admin only)
Delete booking. Access: **admin only**.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success response (200)**
```json
{
  "message": "Booking deleted"
}
```

**Errors**
- `403` forbidden:
```json
{ "message": "Forbidden" }
```
- `404` booking not found:
```json
{ "message": "Booking not found" }
```
- `400` invalid id:
```json
{ "message": "Invalid booking id" }
```

---

# 4) ADMIN / MODERATOR

## 4.1 GET `/bookings/admin/all`
Get all bookings with populated user info. Access: **admin OR moderator**.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success response (200)**
```json
{
  "bookings": [
    {
      "_id": "BOOKING_ID",
      "programTitle": "Kickboxing",
      "category": "sport",
      "date": "2026-02-10T00:00:00.000Z",
      "time": "12:00",
      "status": "booked",
      "note": "",
      "user": {
        "_id": "USER_ID",
        "name": "John",
        "surname": "Doe",
        "email": "john@mail.com",
        "phone": "+7...",
        "role": "user"
      }
    }
  ]
}
```

**Errors**
- `403` insufficient role:
```json
{ "message": "Forbidden: insufficient role" }
```

---

## SMTP Email (Nodemailer)

A welcome email is sent after registration **only if enabled** (`ENABLE_EMAIL=true`).

Environment variables:
```env
MAIL_HOST=...
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM="Titan GYM <no-reply@bloomgym.com>"
ENABLE_EMAIL=true
```

If `ENABLE_EMAIL=false`, email sending is skipped.

---

## Screenshots

Screenshots are stored in `/screenshots` folder.

1. `screenshots/home.png` — Home page UI (stats + images)
2. `screenshots/auth-signup.png` — Sign Up modal
3. `screenshots/auth-signin.png` — Sign In modal
4. `screenshots/profile.png` — Profile loaded from server
5. `screenshots/programs.png` — Programs grid + filters
6. `screenshots/booking-modal.png` — Booking modal with time slots
7. `screenshots/my-bookings.png` — My bookings table
8. `screenshots/admin-all-bookings.png` — Admin/Moderator view: all bookings with user info
9. `screenshots/edit-booking.png` — Update booking modal
10. `screenshots/delete-booking.png` — Delete booking button (admin role)

---

## Deployment (Required)

Deployed API URL: https://final-bloom-gym.onrender.com 
GitHub Repository: https://github.com/Kundyz882/Final-Bloom-Gym.git

Environment variables required on platform (Render/Railway/Replit):
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- optional `MAIL_*`

Backend start command:
- `npm start` → runs `node app.js`

---

## Titan Creator
- Gizatov Diar
  


