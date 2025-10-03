import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AddSpot from './pages/AddSpot';
import ManageSpots from './pages/ManageSpots';
import Bookings from './pages/Bookings';

// Component to handle conditional navbar rendering
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <main className="flex-1">
      {/* Only show navbar if not on login page */}
      {!isLoginPage && <Navbar />}
      
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/addspot" element={
          <ProtectedRoute>
            <AddSpot />
          </ProtectedRoute>
        } />
        <Route path="/manage-spots" element={
          <ProtectedRoute>
            <ManageSpots />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
      </Routes>
    </main>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer style={{ zIndex: 999999 }} />
      </AuthProvider>
    </Router>
  );
};

export default App;