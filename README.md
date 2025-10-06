# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Parkhub is a full-stack parking management system built with a microservices architecture consisting of three main applications:

- **Backend**: Express.js REST API with MongoDB
- **Frontend**: React.js user-facing application  
- **Admin**: React.js administrative dashboard

## Development Commands

### Backend (Express.js + MongoDB)
```powershell
# Navigate to backend
cd backend

# Start development server with nodemon
npm run server

# Start production server
npm start

# Install dependencies
npm install
```

### Frontend (React + Vite)
```powershell
# Navigate to frontend
cd frontend

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Install dependencies
npm install
```

### Admin Dashboard (React + Vite)
```powershell
# Navigate to admin
cd admin

# Start development server (runs on port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Install dependencies
npm install
```

### Running All Services
```powershell
# Start backend (terminal 1)
cd backend && npm run server

# Start frontend (terminal 2) 
cd frontend && npm run dev

# Start admin dashboard (terminal 3)
cd admin && npm run dev
```

## Architecture Overview

### Backend Architecture (Node.js/Express)

The backend follows a standard MVC pattern with the following key components:

**Models** (`/models/`):
- `User.js` - User authentication and profile management with bcrypt password hashing
- `ParkingSpot.js` - Parking spot data with location, pricing, and amenities
- `Booking.js` - Booking management with payment tracking

**Controllers** (`/controllers/`):
- `authController.js` - User registration, login, JWT authentication
- `parkingSpotController.js` - CRUD operations for parking spots
- `bookingController.js` - Booking creation and management

**Routes** (`/routes/`):
- RESTful API endpoints organized by resource
- JWT middleware for protected routes

**Configuration** (`/config/`):
- `mongodb.js` - Database connection using Mongoose
- `cloudinary.js` - Image upload configuration

**Key Features**:
- JWT-based authentication with bcrypt password hashing
- MongoDB with Mongoose ODM
- Cloudinary integration for image uploads
- Payment processing with Stripe and Razorpay
- CORS enabled for cross-origin requests

### Frontend Architecture (React/Vite)

**Structure** (`/src/`):
- `pages/` - Route components (Home, Parking, Checkout, UserBookings, Profile)
- `components/` - Reusable UI components (Navbar, SignIn, SignUp)
- `contexts/` - React Context for state management (AuthContext)
- `utils/` - Utility functions and helpers

**Key Features**:
- React Router for SPA navigation
- Context API for global state (authentication)
- Tailwind CSS for styling
- Axios for API communication
- React Toastify for notifications

### Admin Dashboard Architecture

**Structure** (`/src/`):
- `pages/` - Admin pages (Home, AddSpot, ManageSpots, Bookings)
- `components/` - Admin-specific components (Login, Navbar, ProtectedRoute)
- `contexts/` - Authentication context for admin users

**Key Features**:
- Protected routes requiring admin authentication
- Leaflet maps integration for location selection
- Google Places Autocomplete for address input
- CRUD interface for parking spot management
- Booking management dashboard

## Database Schema

### Users Collection
- Authentication fields (email, password, phone)
- Profile information (name, profileImage)
- Role-based access (user/admin)
- Relationships to bookings and favorites

### ParkingSpots Collection
- Location data (latitude, longitude, full address)
- Pricing structure (hourly, daily, monthly rates)
- Amenities and vehicle type support
- Operating hours and slot availability

### Bookings Collection
- References to User and ParkingSpot
- Customer details and vehicle information
- Time-based booking (start time, duration)
- Payment tracking (method, status, amount)

## Environment Configuration

Each application requires environment variables:

**Backend** (`.env`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_*` - Cloudinary configuration
- `STRIPE_*` / `RAZORPAY_*` - Payment provider keys

**Frontend/Admin** (`.env`):
- API endpoint configurations
- External service keys (Google Maps, etc.)

## Development Workflow

1. **Backend First**: Start the Express server to ensure API endpoints are available
2. **Database**: Ensure MongoDB is running and connected
3. **Frontend/Admin**: Start React applications which consume the backend API
4. **Hot Reload**: All applications support hot reload for development

## Technology Stack

**Backend**:
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- Cloudinary (image uploads)
- Stripe/Razorpay (payments)

**Frontend**:
- React 19 + Vite
- React Router Dom v7
- Tailwind CSS
- Axios

**Admin Dashboard**:
- React 18 + Vite  
- React Leaflet (maps)
- Google Places API
- Lucide React (icons)

## Port Configuration

- Backend API: Port 4000 (configurable via PORT env var)
- Frontend: Port 5173 (Vite default)
- Admin Dashboard: Port 5174 (configured in vite.config.js)