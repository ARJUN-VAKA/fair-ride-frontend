import React from 'react';
import { Search, Calculator, Users, ShieldCheck } from 'lucide-react';

const HowItWorks = ({ setCurrentPage }) => {
  const steps = [
    {
      icon: <Search size={32} color="#3b82f6" />,
      title: '1. Enter Your Route',
      desc: 'Use the smart search bar or drop a pin on the interactive map to set pickup and drop-off points anywhere in India.'
    },
    {
      icon: <Calculator size={32} color="#8b5cf6" />,
      title: '2. Compare & Choose',
      desc: 'Instantly see real-time fare estimates from Uber, Ola, Rapido, and Namma Yatri — sorted by price so you never overpay.'
    },
    {
      icon: <Users size={32} color="#10b981" />,
      title: '3. Enable Ride Pooling',
      desc: 'Toggle the Pool feature. We match you with other Fair Ride users heading the same direction to split the fare by up to 40%.'
    },
    {
      icon: <ShieldCheck size={32} color="#f59e0b" />,
      title: '4. Book Securely',
      desc: 'Tap "Book" and get redirected to your chosen provider\'s app with trip details pre-filled. Your data stays on your device.'
    }
  ];

  return (
    <div className="page-enter" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="hero-section" style={{ marginBottom: '40px' }}>
        <h1 className="hero-title">How <span className="text-gradient">Fair Ride</span> Works</h1>
        <p className="hero-subtitle">
          Your one-stop smart aggregator for finding the most cost-effective and efficient rides across India.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        {steps.map((step, idx) => (
          <div key={idx} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              width: '64px', height: '64px',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {step.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '10px 0 0 0' }}>{step.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem', margin: 0 }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ marginTop: '40px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
        <h2 style={{ marginBottom: '16px' }}>Ready to save on your next trip?</h2>
        <button
          className="btn-primary"
          onClick={() => setCurrentPage && setCurrentPage('home')}
        >
          Start Comparing Now
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;
