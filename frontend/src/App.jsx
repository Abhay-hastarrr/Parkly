import React from 'react';
import { Navbar } from './components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home.jsx';
import Parking from './pages/Parking.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import Checkout from './pages/Checkout.jsx';
import UserBookings from './pages/UserBookings.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          {/* Main content area */}
          <main className="min-h-screen bg-gray-50">
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/parking" element={<Parking />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/checkout/:spotId" element={<Checkout />} />
                  <Route path="/bookings" element={<UserBookings />} />
                  <Route path="/profile" element={<Profile />} />
              </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;