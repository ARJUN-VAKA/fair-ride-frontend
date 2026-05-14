import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generateProviderLink } from '../utils/deepLinks';
import { getDynamicFares } from '../utils/pricingEngine';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';

const getProviderIcon = (providerName) => {
  if (providerName.includes('Rapido')) return { bg: '#fcd34d', color: '#000', letter: 'R' };
  if (providerName.includes('Uber')) return { bg: '#000000', color: '#fff', letter: 'U' };
  if (providerName.includes('Ola')) return { bg: '#000000', color: '#fff', letter: 'O' };
  if (providerName.includes('Namma')) return { bg: '#22c55e', color: '#fff', letter: 'N' };
  return { bg: '#cbd5e1', color: '#000', letter: providerName.charAt(0) };
};

const ComparisonResults = ({ coords, addresses, accountsLinked }) => {
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('prices'); // 'prices' | 'pool'
  const [poolRides, setPoolRides] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(null);

  useEffect(() => {
    if (coords?.pickup && coords?.dropoff) {
      setResults(getDynamicFares(coords.pickup, coords.dropoff, false));
    }
  }, [coords]);

  useEffect(() => {
    if (activeTab === 'pool') {
      poolStore.getAvailableRides().then(setPoolRides);
    }
  }, [activeTab]);

  const handleBookSeat = async (rideId) => {
    const user = authStore.getUser();
    if (!user) return alert("Please log in first");
    
    setBookingLoading(rideId);
    try {
      await poolStore.bookSeat(rideId, user.id);
      alert("Seat booked successfully! Go to My Trips to view.");
      const updatedRides = await poolStore.getAvailableRides();
      setPoolRides(updatedRides);
    } catch (e) {
      alert("Error booking seat: " + e.message);
    }
    setBookingLoading(null);
  };

  if (!accountsLinked) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ marginBottom: '10px' }}>Unlock Exact Pricing</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Please connect your provider accounts above to view live accurate fares.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: '12px' }} />
        <h3 style={{ marginBottom: '8px' }}>No Rides Available</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Auto/Bike services may not be available for very long distances. Try a different route.
        </p>
      </div>
    );
  }

  const groupedResults = {
    'Bikes': results.filter(r => r.type === 'Bike'),
    'Autos': results.filter(r => r.type === 'Auto'),
    'Cabs': results.filter(r => r.type === 'Cab' || r.type === 'Premium Cab'),
  };

  return (
    <div className="page-enter" style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)' }}>
        <button 
          onClick={() => setActiveTab('prices')}
          style={{ flex: 1, padding: '16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'prices' ? '3px solid var(--accent-primary)' : '3px solid transparent', color: activeTab === 'prices' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          PRICES
        </button>
        <button 
          onClick={() => setActiveTab('pool')}
          style={{ flex: 1, padding: '16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'pool' ? '3px solid var(--accent-primary)' : '3px solid transparent', color: activeTab === 'pool' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          RIDE POOL
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {activeTab === 'prices' ? (
          <div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500, marginBottom: '20px' }}>
              <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Fares may change due to demand
            </div>

            {Object.entries(groupedResults).map(([category, rides]) => {
              if (rides.length === 0) return null;
              return (
                <div key={category} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {category}
                  </h3>
                  <div style={{ border: '1px solid var(--surface-border)', borderRadius: '12px', overflow: 'hidden' }}>
                    {rides.map((result, idx) => {
                      const icon = getProviderIcon(result.provider);
                      const isCheapest = idx === 0 && category === 'Bikes'; // Example logic for cheapest badge
                      
                      return (
                        <a 
                          key={result.id}
                          href={generateProviderLink(result.provider, coords?.pickup, coords?.dropoff, addresses?.pickup, addresses?.dropoff)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: idx < rides.length - 1 ? '1px solid var(--surface-border)' : 'none', textDecoration: 'none', color: 'inherit', background: '#fff', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: icon.bg, color: icon.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              {icon.letter}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{result.provider}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{result.eta} away</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{result.price}</div>
                            {isCheapest && <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Cheapest</div>}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500, marginBottom: '20px' }}>
              Share rides, Save money, Travel together
            </div>

            {poolRides.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No active pool rides available right now.</p>
            ) : (
              poolRides.map(pool => (
                <div key={pool.id} style={{ border: '1px solid var(--surface-border)', padding: '16px', marginBottom: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {pool.driverName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pool.driverName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vehicle: {pool.vehicle}</div>
                      </div>
                    </div>
                    <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                      {pool.seats} seats left
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {pool.pickup} <span style={{ margin: '0 8px', color: '#cbd5e1' }}>→</span> {pool.dropoff}
                      <div style={{ marginTop: '4px' }}>Departure: {pool.time}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{pool.price}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>per seat</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {pool.tags && pool.tags.map(tag => (
                      <span key={tag} style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} color="#3b82f6" /> {tag}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleBookSeat(pool.id)}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }}
                    disabled={bookingLoading === pool.id || pool.driverId === authStore.getUser()?.id}
                  >
                    {bookingLoading === pool.id ? 'Booking...' : pool.driverId === authStore.getUser()?.id ? 'Your Ride' : 'Book Seat'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonResults;
