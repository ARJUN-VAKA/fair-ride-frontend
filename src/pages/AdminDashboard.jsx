import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Key, Users, Activity, Settings, LogOut,
  CheckCircle, XCircle, Save, RefreshCw, Car, Shield,
  TrendingUp, MapPin, Zap, Eye, EyeOff, Database, AlertTriangle, Loader
} from 'lucide-react';
import { authStore } from '../utils/authStore';

const PROVIDERS = [
  {
    id: 'uber',
    name: 'Uber',
    color: '#000000',
    accent: '#ffffff',
    bg: '#1a1a1a',
    desc: 'Uber Go, Uber Premier, Uber Moto',
    docsUrl: 'https://developer.uber.com/',
    placeholder: 'sk-uber-xxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    id: 'ola',
    name: 'Ola',
    color: '#1DB954',
    accent: '#ffffff',
    bg: '#0a2e1a',
    desc: 'Ola Mini, Ola Sedan, Ola Auto',
    docsUrl: 'https://devportal.olacabs.com/',
    placeholder: 'ola_key_xxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    id: 'rapido',
    name: 'Rapido',
    color: '#FFD700',
    accent: '#1a1a1a',
    bg: '#2a2400',
    desc: 'Rapido Bike, Rapido Auto',
    docsUrl: 'https://rapido.bike/business',
    placeholder: 'rpd_xxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    id: 'nammayatri',
    name: 'Namma Yatri',
    color: '#FF6B35',
    accent: '#ffffff',
    bg: '#2a1200',
    desc: 'Namma Yatri Auto, ONDC Rides',
    docsUrl: 'https://nammayatri.in/',
    placeholder: 'ny_xxxxxxxxxxxxxxxxxxxxxxxx'
  },
];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-panel" style={{ padding: '20px', flex: 1, minWidth: '140px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <Icon size={20} color={color} />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{value}</div>
  </div>
);

const DB_URI_KEY = 'fair_ride_admin_db_uri';

const DatabaseConfig = () => {
  const currentUri = localStorage.getItem(DB_URI_KEY) || '';
  const [uri, setUri] = useState(currentUri);
  const [showUri, setShowUri] = useState(false);
  const [status, setStatus] = useState(null); // null | 'testing' | 'ok' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [saved, setSaved] = useState(false);

  const handleTest = async () => {
    if (!uri.trim()) return;
    setStatus('testing');
    setStatusMsg('Connecting to database...');
    try {
      const res = await fetch('/api/admin/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: uri.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('ok');
        setStatusMsg(data.message);
      } else {
        setStatus('error');
        setStatusMsg(data.message);
      }
    } catch (e) {
      setStatus('error');
      setStatusMsg('Could not reach the API. Please try again.');
    }
  };

  const handleSave = () => {
    localStorage.setItem(DB_URI_KEY, uri.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    localStorage.removeItem(DB_URI_KEY);
    setUri('');
    setStatus(null);
    setStatusMsg('');
  };

  const isMongoUri = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');

  return (
    <div>
      <h1 style={{ marginBottom: '8px', fontSize: '1.6rem' }}>Database Configuration</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Manage the cloud database backend. The current active connection string is used for all user data.
      </p>

      {/* Current Status Card */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Database size={18} color="#10b981" />
          <strong style={{ color: '#f8fafc' }}>Active Database</strong>
          <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
            ● CONNECTED
          </span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8', wordBreak: 'break-all' }}>
          {currentUri
            ? currentUri.replace(/:([^@:]+)@/, ':****@') // mask password
            : 'mongodb+srv://Ride:****@cluster0.vzhfwkx.mongodb.net/fairride (Default)'}
        </div>
        <div style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Provider: MongoDB Atlas M0 (Free) &nbsp;|&nbsp; Cluster: Cluster0 &nbsp;|&nbsp; Region: Auto
        </div>
      </div>

      {/* New URI Input */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} color="#3b82f6" /> Update Database URI
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Paste a new MongoDB connection string below. The system will verify the connection before you can save it.
        </p>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type={showUri ? 'text' : 'password'}
            className="input-field"
            placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
            value={uri}
            onChange={e => { setUri(e.target.value); setStatus(null); }}
            style={{ paddingRight: '44px', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <button onClick={() => setShowUri(v => !v)} style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
          }}>
            {showUri ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Status Banner */}
        {status && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: status === 'ok' ? 'rgba(16,185,129,0.12)' : status === 'error' ? 'rgba(248,113,113,0.12)' : 'rgba(59,130,246,0.1)',
            border: `1px solid ${status === 'ok' ? 'rgba(16,185,129,0.3)' : status === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(59,130,246,0.2)'}`,
            color: status === 'ok' ? '#10b981' : status === 'error' ? '#f87171' : '#3b82f6'
          }}>
            {status === 'testing' && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {status === 'ok' && <CheckCircle size={16} />}
            {status === 'error' && <AlertTriangle size={16} />}
            <span style={{ fontSize: '0.9rem' }}>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTest}
            disabled={!isMongoUri || status === 'testing'}
            className="btn-secondary"
            style={{ padding: '10px 18px', display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            {status === 'testing' ? <Loader size={16} /> : <CheckCircle size={16} />}
            {status === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={status !== 'ok'}
            className="btn-primary"
            style={{ padding: '10px 18px', display: 'flex', gap: '6px', alignItems: 'center', opacity: status === 'ok' ? 1 : 0.5 }}
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save & Switch Database'}
          </button>
          {currentUri && (
            <button onClick={handleClear} className="btn-secondary" style={{ padding: '10px 16px', color: '#f87171', borderColor: '#f87171' }}>
              <XCircle size={16} /> Reset to Default
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Shield size={16} color="#f59e0b" /> How to Get a New MongoDB URI
        </h3>
        <ol style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 2, paddingLeft: '20px', margin: 0 }}>
          <li>Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>cloud.mongodb.com</a> and sign in.</li>
          <li>Click your cluster → <strong style={{ color: '#f8fafc' }}>Connect</strong> → <strong style={{ color: '#f8fafc' }}>Drivers</strong>.</li>
          <li>Select <strong style={{ color: '#f8fafc' }}>Node.js</strong> and copy the connection string.</li>
          <li>Replace <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>&lt;password&gt;</code> with your actual password.</li>
          <li>Add <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>/fairride</code> before the <code>?</code> query string.</li>
          <li>Paste it above, test the connection, then save.</li>
        </ol>
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⚡ For best serverless performance:</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> Use MongoDB Atlas M10+ clusters or enable connection pooling for sub-second cold starts.</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState(authStore.getAllApiKeys());
  const [savedKeys, setSavedKeys] = useState({});
  const [visibleKeys, setVisibleKeys] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  useEffect(() => {
    setApiKeys(authStore.getAllApiKeys());
    setSavedKeys(
      Object.fromEntries(
        PROVIDERS.map(p => [p.id, !!authStore.getApiKey(p.id)])
      )
    );
  }, []);

  const handleSaveKey = (providerId) => {
    authStore.saveApiKey(providerId, apiKeys[providerId] || '');
    setSavedKeys(prev => ({ ...prev, [providerId]: !!(apiKeys[providerId]) }));
    setSaveStatus(prev => ({ ...prev, [providerId]: 'saved' }));
    setTimeout(() => setSaveStatus(prev => ({ ...prev, [providerId]: '' })), 2000);
  };

  const handleClearKey = (providerId) => {
    authStore.saveApiKey(providerId, '');
    setApiKeys(prev => ({ ...prev, [providerId]: '' }));
    setSavedKeys(prev => ({ ...prev, [providerId]: false }));
  };

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const connectedCount = Object.values(savedKeys).filter(Boolean).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'api_keys', label: 'API Keys', icon: Key },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '24px' }}>
          <Car size={24} color="#3b82f6" />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>Fair Ride</span>
          <span style={{
            background: 'rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: '0.65rem',
            padding: '2px 6px', borderRadius: '4px', fontWeight: 700
          }}>ADMIN</span>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={18} />
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px' }}>
          <button onClick={onLogout} className="admin-logout-btn">
            <LogOut size={16} /> <span className="tab-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={{ marginBottom: '8px', fontSize: '1.6rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Manage your Fair Ride platform, API integrations, and monitor usage.
            </p>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <StatCard icon={Key} label="APIs Connected" value={`${connectedCount} / ${PROVIDERS.length}`} color="#3b82f6" />
              <StatCard icon={Zap} label="Pricing Mode" value={connectedCount > 0 ? 'Live + Algo' : 'Algorithmic'} color="#10b981" />
              <StatCard icon={Activity} label="Providers" value={PROVIDERS.length} color="#f59e0b" />
              <StatCard icon={Shield} label="Data Storage" value="Local Only" color="#8b5cf6" />
            </div>

            {/* Provider Status Grid */}
            <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Provider Integration Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {PROVIDERS.map(p => (
                <div key={p.id} className="glass-panel" style={{
                  padding: '20px',
                  borderLeft: `3px solid ${savedKeys[p.id] ? p.color : 'rgba(255,255,255,0.1)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{p.name}</span>
                    {savedKeys[p.id]
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem' }}><CheckCircle size={14} /> Live</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.8rem' }}><XCircle size={14} /> Simulated</span>
                    }
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Info Banner */}
            <div style={{
              padding: '20px', background: 'rgba(59,130,246,0.08)',
              borderRadius: '14px', border: '1px solid rgba(59,130,246,0.15)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <TrendingUp size={18} color="#3b82f6" /> How API Integration Works
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                When you paste a valid API key in the <strong style={{ color: '#f8fafc' }}>API Keys</strong> tab, the app will
                use that provider's live pricing endpoint to fetch real-time fares. For any provider
                without a key, the dynamic algorithmic engine provides accurate realistic estimates.
                Both modes work seamlessly side-by-side.
              </p>
            </div>
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === 'api_keys' && (
          <div>
            <h1 style={{ marginBottom: '8px', fontSize: '1.6rem' }}>API Key Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Paste your official API keys below. Keys are stored only in your browser's local storage — never on a server.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {PROVIDERS.map(p => {
                const hasKey = savedKeys[p.id];
                const isVisible = visibleKeys[p.id];
                const isSaved = saveStatus[p.id] === 'saved';

                return (
                  <div key={p.id} className="glass-panel" style={{
                    padding: '24px',
                    borderLeft: `4px solid ${hasKey ? p.color : 'rgba(255,255,255,0.1)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {p.name}
                          {hasKey
                            ? <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>● LIVE</span>
                            : <span style={{ fontSize: '0.7rem', background: 'rgba(148,163,184,0.15)', color: '#94a3b8', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>SIMULATED</span>
                          }
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.desc}</p>
                      </div>
                      <a href={p.docsUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}>
                        View API Docs →
                      </a>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={isVisible ? 'text' : 'password'}
                          className="input-field"
                          style={{ paddingRight: '44px' }}
                          placeholder={hasKey ? '••••••••••••••••••••••••' : p.placeholder}
                          value={apiKeys[p.id] || ''}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                        />
                        <button onClick={() => toggleVisibility(p.id)} style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
                        }}>
                          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button className="btn-primary" style={{ padding: '12px 16px', flexShrink: 0 }}
                        onClick={() => handleSaveKey(p.id)}>
                        {isSaved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save</>}
                      </button>
                      {hasKey && (
                        <button className="btn-secondary" style={{ padding: '12px 14px', flexShrink: 0 }}
                          onClick={() => handleClearKey(p.id)} title="Clear Key">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DATABASE TAB */}
        {activeTab === 'database' && <DatabaseConfig />}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <h1 style={{ marginBottom: '8px', fontSize: '1.6rem' }}>Settings</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Platform configuration and admin account settings.
            </p>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#3b82f6" /> Admin Account
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                Signed in as: <strong style={{ color: '#f8fafc' }}>{authStore.getUser()?.email}</strong>
              </p>
              <button className="btn-secondary" onClick={onLogout} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} color="#f59e0b" /> Clear All Data
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                This will clear all API keys and user sessions stored locally. Cannot be undone.
              </p>
              <button
                style={{
                  background: 'rgba(248,113,113,0.15)', color: '#f87171',
                  border: '1px solid rgba(248,113,113,0.3)', padding: '10px 20px',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 600
                }}
                onClick={() => {
                  if (window.confirm('Clear all local data?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                Clear All Local Data
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
