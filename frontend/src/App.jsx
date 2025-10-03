import React from 'react';
import { Navbar } from './components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home.jsx';
import Parking from './pages/Parking.jsx';

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
              </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;