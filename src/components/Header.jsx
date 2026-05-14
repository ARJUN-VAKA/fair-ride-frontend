import React from 'react';
import { Car, LogOut, User, ChevronDown, Bell } from 'lucide-react';

import { useNotifications } from '../hooks/useNotifications';

const Header = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const { enabled: notificationsEnabled, toggleNotifications } = useNotifications();

  return (
    <header className="header">
      <div className="logo" onClick={() => setCurrentPage('home')}>
        <Car size={32} color="#3b82f6" />
        Fair Ride
      </div>
      <nav className="nav-links">
        <a
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          Compare Fares
        </a>
        <a
          className={`nav-link ${currentPage === 'offer-ride' ? 'active' : ''}`}
          onClick={() => setCurrentPage('offer-ride')}
        >
          Offer a Ride
        </a>
        {user && (
          <a
            className={`nav-link ${currentPage === 'my-trips' ? 'active' : ''}`}
            onClick={() => setCurrentPage('my-trips')}
          >
            My Trips
          </a>
        )}
        <a
          className={`nav-link ${currentPage === 'how-it-works' ? 'active' : ''}`}
          onClick={() => setCurrentPage('how-it-works')}
        >
          How it Works
        </a>
      </nav>

      {/* User Section */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleNotifications}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: notificationsEnabled ? '#3b82f6' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', borderRadius: '50%', transition: 'all 0.2s',
              background: notificationsEnabled ? 'rgba(59,130,246,0.1)' : 'transparent'
            }}
            title={notificationsEnabled ? "Notifications Enabled" : "Enable Notifications"}
          >
            <Bell size={20} />
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', padding: '8px 14px',
            borderRadius: '50px', border: '1px solid var(--surface-border)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <User size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.name || user.email}
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', padding: '8px 14px', borderRadius: '50px',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
            }}
            title="Sign Out"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
