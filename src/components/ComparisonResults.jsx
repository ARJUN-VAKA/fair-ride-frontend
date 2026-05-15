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

const ComparisonResults = ({ coords, addresses, accountsLinked }) => {
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
    <div className="page-enter" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--surface-border)', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--surface-border)' }}>
            <th style={{ padding: '16px 12px', width: '30%' }}></th>
            {vehicleTypes.map(v => {
              const Icon = v.icon;
              return (
                <th key={v.id} style={{ padding: '16px 8px', borderLeft: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ color: 'var(--text-primary)' }}><Icon size={20} /></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{v.label}</span>
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
              <tr key={pName} style={{ borderBottom: pIdx < providers.length - 1 ? '1px solid var(--surface-border)' : 'none', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '10px', 
                      background: logo.bg, color: logo.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '0.65rem', fontWeight: 900, flexShrink: 0,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                      {pName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{logo.label}</span>
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
                        padding: '16px 8px', 
                        textAlign: 'center', 
                        borderLeft: '1px solid var(--surface-border)', 
                        cursor: fare ? 'pointer' : 'default',
                        background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ 
                        fontWeight: 800, fontSize: '1rem', 
                        color: isSelected ? 'var(--accent-secondary)' : (fare ? 'var(--text-primary)' : '#cbd5e1'),
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.2s'
                      }}>
                        {fare ? `₹${fare.price}` : '--'}
                      </div>
                      {isSelected && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-secondary)' }} />}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* BOOK BUTTON */}
      <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--surface-border)' }}>
        <button 
          className="btn-primary" 
          disabled={!selected}
          onClick={handleBooking}
          style={{ 
            width: '100%', 
            padding: '18px', 
            fontSize: '1.1rem', 
            borderRadius: '16px',
            background: selected ? 'var(--success-color)' : '#cbd5e1',
            boxShadow: selected ? '0 10px 20px rgba(16, 185, 129, 0.2)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            border: 'none',
            color: 'white',
            fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed'
          }}
        >
          {selected ? (
            <>Book {selected.provider} {selected.type} <ChevronRight size={20} /></>
          ) : 'Select your ride to book'}
        </button>
        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="var(--success-color)" /> 
          <span style={{ fontWeight: 500 }}>Secure direct-to-app booking</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonResults;
