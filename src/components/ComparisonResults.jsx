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
    <div className="page-enter" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--surface-border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* GRID HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--surface-border)', background: '#f8fafc' }}>
        {vehicleTypes.map(v => {
          const Icon = v.icon;
          return (
            <div key={v.id} style={{ padding: '20px', textAlign: 'center', borderLeft: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Icon size={22} color="var(--text-primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{v.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRID ROWS */}
      {providers.map((pName, pIdx) => {
        const logo = getProviderLogo(pName);
        return (
          <div key={pName} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', borderBottom: pIdx < providers.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: logo.bg, color: logo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {pName.charAt(0)}
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{logo.label}</span>
            </div>
            {vehicleTypes.map(v => {
              const fare = getFare(pName, v.id);
              const isSelected = selected?.provider === pName && selected?.type === v.id;
              return (
                <div 
                  key={v.id} 
                  onClick={() => fare && setSelected({ provider: pName, type: v.id, price: fare.price })}
                  style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    borderLeft: '1px solid var(--surface-border)', 
                    cursor: fare ? 'pointer' : 'default',
                    background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: fare ? 'var(--text-primary)' : '#cbd5e1' }}>
                    {fare ? `₹${fare.price}` : '--'}
                  </span>
                  {isSelected && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#3b82f6' }} />}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* BOOK BUTTON */}
      <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--surface-border)' }}>
        <button 
          className="btn-primary" 
          disabled={!selected}
          onClick={handleBooking}
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            padding: '16px', 
            fontSize: '1.2rem', 
            borderRadius: '50px',
            background: selected ? '#65a30d' : '#94a3b8',
            boxShadow: selected ? '0 4px 12px rgba(101, 163, 13, 0.3)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          {selected ? `Book ${selected.provider} ${selected.type}` : 'Select a Fare to Book'}
          <ChevronRight size={20} />
        </button>
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <ShieldCheck size={14} color="#10b981" /> Verified direct booking links
        </div>
      </div>
    </div>
  );
};

export default ComparisonResults;
