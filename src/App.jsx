import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import OfferRide from './pages/OfferRide';
import MyTrips from './pages/MyTrips';
import { authStore } from './utils/authStore';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState(null); // null | 'user' | 'admin'

  useEffect(() => {
    // Check if user is already signed in from a previous session
    const user = authStore.getUser();
    if (user) {
      setUserRole(user.role);
    }
    // Silently warm up the serverless function so it's ready when user logs in
    fetch('/api').catch(() => {});
  }, []);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    authStore.logout();
    setUserRole(null);
    setCurrentPage('home');
  };

  // Show Admin Dashboard if admin is signed in
  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Show Login Page if not signed in
  if (!userRole) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Regular user — show normal app
  return (
    <div className="app-container">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={authStore.getUser()}
        onLogout={handleLogout}
      />
      <main>
        {currentPage === 'home' && <Home />}
        {currentPage === 'how-it-works' && <HowItWorks setCurrentPage={setCurrentPage} />}
        {currentPage === 'offer-ride' && <OfferRide setCurrentPage={setCurrentPage} />}
        {currentPage === 'my-trips' && <MyTrips />}
      </main>
    </div>
  );
}

export default App;
