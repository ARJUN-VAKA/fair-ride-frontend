import React from 'react';
import { Car, LogOut, User, ChevronDown, Bell, Settings, Trash2, X } from 'lucide-react';

import { useNotifications } from '../hooks/useNotifications';

const Header = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const { 
    enabled: notificationsEnabled, 
    toggleNotifications, 
    notifications, 
    unreadCount, 
    clearNotifications,
    markAllRead
  } = useNotifications();

  const [showNotifs, setShowNotifs] = React.useState(false);

  return (
    <header className="header" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="logo" onClick={() => setCurrentPage('home')}>
        <Car size={32} color="#3b82f6" />
        Fair Ride <span style={{ fontSize: '0.6rem', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', verticalAlign: 'middle' }}>v2.1</span>
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
        <div className="user-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs) markAllRead();
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: notificationsEnabled ? '#3b82f6' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px', borderRadius: '50%', transition: 'all 0.2s',
                background: showNotifs ? 'rgba(59,130,246,0.1)' : 'transparent'
              }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="notification-dropdown">
                <div style={{
                  padding: '16px', borderBottom: '1px solid var(--surface-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc'
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleNotifications(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title={notificationsEnabled ? "Disable System Notifications" : "Enable System Notifications"}
                    >
                      <Settings size={16} color={notificationsEnabled ? '#3b82f6' : 'currentColor'} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title="Clear All"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowNotifs(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <Bell size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px', color: 'var(--text-primary)' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {notif.body}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', padding: '8px 14px',
            borderRadius: '50px', border: '1px solid var(--surface-border)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <User size={16} color="var(--accent-primary)" />
            <span className="user-badge-text" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
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
            <LogOut size={15} /> <span className="sign-out-text">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
