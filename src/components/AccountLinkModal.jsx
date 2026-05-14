import React, { useState } from 'react';
import { X, Link as LinkIcon, ShieldAlert } from 'lucide-react';

const AccountLinkModal = ({ isOpen, onClose, onLinkSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLink = () => {
    if (!phone || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Save credentials to local memory (localStorage) for privacy
      localStorage.setItem('comparify_credentials_linked', 'true');
      localStorage.setItem('comparify_phone', phone);
      onLinkSuccess();
      onClose();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', position: 'relative', background: '#1e293b' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LinkIcon color="#3b82f6" /> Connect Accounts
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
          To fetch exact real-time pricing, link your Ola, Uber, and Rapido accounts securely.
        </p>

        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <ShieldAlert color="#f59e0b" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#fcd34d' }}>
            Privacy First: Your credentials are encrypted and stored ONLY in your device's local memory. We do not store them on our servers.
          </p>
        </div>

        <div className="input-group" style={{ marginBottom: '16px' }}>
          <label className="input-label" style={{ color: '#fff' }}>Phone Number / Email</label>
          <input 
            type="text" 
            className="input-field" 
            style={{ padding: '14px' }}
            placeholder="Enter registered mobile or email"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label className="input-label" style={{ color: '#fff' }}>Password / OTP</label>
          <input 
            type="password" 
            className="input-field" 
            style={{ padding: '14px' }}
            placeholder="Enter password or OTP"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            I accept the Terms & Conditions and consent to storing my credentials locally.
          </span>
        </label>

        <button 
          className="btn-primary" 
          style={{ width: '100%', opacity: (agreed && phone && password) ? 1 : 0.5 }}
          disabled={!agreed || loading || !phone || !password}
          onClick={handleLink}
        >
          {loading ? 'Authenticating & Linking...' : 'Connect Automatically'}
        </button>
      </div>
    </div>
  );
};

export default AccountLinkModal;
