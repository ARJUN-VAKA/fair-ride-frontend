import React, { useState, useEffect } from 'react';
import { Bike, Car, ChevronRight, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generateProviderLink } from '../utils/deepLinks';
import { getDynamicFares } from '../utils/pricingEngine';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';

const AutoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M7 10v4h10v-4" />
  </svg>
);

const getProviderLogo = (name) => {
  const providers = {
    'Ola': { color: '#000', bg: '#fcd34d', label: 'OLA' },
    'Rapido': { color: '#000', bg: '#fbbf24', label: 'rapido' },
    'Uber': { color: '#fff', bg: '#000', label: 'Uber' },
    'Namma': { color: '#fff', bg: '#22c55e', label: 'Namma Yatri' },
    'Bharat': { color: '#fff', bg: '#3b82f6', label: 'Bharat Taxi' },
  };
  const key = Object.keys(providers).find(k => name.includes(k));
  return providers[key] || { color: '#fff', bg: '#cbd5e1', label: name };
};

const FareComparisonGrid = ({ coords, addresses, accountsLinked }) => {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null); // { provider, type, price }

  useEffect(() => {
    if (coords?.pickup && coords?.dropoff) {
      setResults(getDynamicFares(coords.pickup, coords.dropoff, false));
    }
  }, [coords]);

  if (results.length === 0) return null;

  // Dynamically determine available providers from results
  // This ensures Namma Yatri only shows if its API key is present
  const availableProviders = [...new Set(results.map(r => r.provider))];
  // Sort them in a consistent order
  const order = ['Ola', 'Rapido', 'Uber', 'Namma', 'Bharat'];
  const providers = order.filter(p => availableProviders.some(ap => ap.includes(p)));

  const vehicleTypes = [
    { id: 'Bike', icon: Bike, label: 'Bike' },
    { id: 'Auto', icon: AutoIcon, label: 'Auto' },
    { id: 'Cab', icon: Car, label: 'Cab' },
  ];

  const getFare = (provider, type) => {
    return results.find(r => r.provider.includes(provider) && r.type === type);
  };

  const handleBooking = () => {
    if (!selected) return;
    const link = generateProviderLink(selected.provider, coords.pickup, coords.dropoff, addresses.pickup, addresses.dropoff);
    window.open(link, '_blank');
  };

  return (
    <div className="page-enter" style={{ background: '#ffffff', borderRadius: '24px', border: '2px solid #eef2f6', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
      {/* Version Marker for debugging */}
      <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', fontSize: '0.5rem', color: '#cbd5e1' }}>V3.1</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
            <th style={{ padding: '20px 12px', width: '30%' }}></th>
            {vehicleTypes.map(v => {
              const Icon = v.icon;
              return (
                <th key={v.id} style={{ padding: '20px 8px', borderLeft: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: 'var(--accent-primary)', transform: 'scale(1.1)' }}><Icon size={24} /></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{v.label}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {providers.map((pName, pIdx) => {
            const logo = getProviderLogo(pName);
            return (
              <tr key={pName} style={{ borderBottom: pIdx < providers.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }}>
                <td style={{ padding: '20px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '12px', 
                      background: logo.bg, color: logo.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '0.75rem', fontWeight: 900, flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      {pName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{logo.label}</span>
                  </div>
                </td>
                {vehicleTypes.map(v => {
                  const fare = getFare(pName, v.id);
                  const isSelected = selected?.provider === pName && selected?.type === v.id;
                  return (
                    <td 
                      key={v.id} 
                      onClick={() => fare && setSelected({ provider: pName, type: v.id, price: fare.price })}
                      style={{ 
                        padding: '20px 8px', 
                        textAlign: 'center', 
                        borderLeft: '1px solid #f1f5f9', 
                        cursor: fare ? 'pointer' : 'default',
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ 
                        fontWeight: 900, fontSize: '1.2rem', 
                        color: isSelected ? 'var(--accent-secondary)' : (fare ? 'var(--text-primary)' : '#e2e8f0'),
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s'
                      }}>
                        {fare ? `₹${fare.price}` : '--'}
                      </div>
                      {isSelected && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-secondary)' }} />}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* BOOK BUTTON */}
      <div style={{ padding: '30px 20px', textAlign: 'center', background: '#f8fafc', borderTop: '2px solid #f1f5f9' }}>
        <button 
          className="btn-primary" 
          disabled={!selected}
          onClick={handleBooking}
          style={{ 
            width: '100%', 
            padding: '20px', 
            fontSize: '1.2rem', 
            borderRadius: '20px',
            background: selected ? 'var(--success-color)' : '#e2e8f0',
            boxShadow: selected ? '0 15px 30px rgba(16, 185, 129, 0.3)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            border: 'none',
            color: 'white',
            fontWeight: 800,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: selected ? 'pointer' : 'not-allowed'
          }}
        >
          {selected ? (
            <>Confirm {selected.provider} {selected.type} <ChevronRight size={24} /></>
          ) : 'Choose your ride to proceed'}
        </button>
        <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--success-color)" /> 
          <span style={{ fontWeight: 600 }}>Direct secure link to provider app</span>
        </div>
      </div>
    </div>
  );
};

export default FareComparisonGrid;
