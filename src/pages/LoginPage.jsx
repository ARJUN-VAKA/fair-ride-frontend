import React, { useState } from 'react';
import { Car, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { authStore } from '../utils/authStore';

const LoginPage = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(async () => {
      const result = mode === 'login'
        ? await authStore.login(email, password)
        : await authStore.register(name, email, password);

      setLoading(false);
      if (result.success) {
        onLoginSuccess(result.role);
      } else {
        setError(result.error);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px'
    }}>
      {/* Decorative Blobs */}
      <div style={{
        position: 'fixed', top: '-100px', right: '-100px', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', left: '-100px', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '12px 24px', background: 'rgba(59,130,246,0.1)',
            borderRadius: '50px', marginBottom: '16px'
          }}>
            <Car size={28} color="#3b82f6" />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Fair Ride</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            India's smartest ride fare aggregator
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'flex', background: 'var(--surface-border)', borderRadius: '12px',
            padding: '4px', marginBottom: '28px'
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '10px',
                  fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: mode === m ? 'var(--accent-blue)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" placeholder="Your name"
                  value={name} onChange={(e) => setName(e.target.value)} required />
                <User className="input-icon" size={18} />
              </div>
            )}

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Mail className="input-icon" size={18} />
            </div>

            <div className="input-group" style={{ marginBottom: '8px' }}>
              <label className="input-label">Password</label>
              <input type={showPassword ? 'text' : 'password'} className="input-field"
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ paddingRight: '48px' }}
              />
              <Lock className="input-icon" size={18} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                marginTop: '10px'
              }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p style={{
                color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '10px 14px',
                borderRadius: '8px', fontSize: '0.85rem', margin: '12px 0'
              }}>{error}</p>
            )}

            <button type="submit" className="btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '16px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{
              marginTop: '20px', padding: '14px', background: 'rgba(59,130,246,0.08)',
              borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Shield size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  All data is stored privately on your device. We never share your info with third parties.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
