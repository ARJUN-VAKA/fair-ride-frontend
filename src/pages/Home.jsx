import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Users, Link as LinkIcon, CheckCircle, Map as MapIcon } from 'lucide-react';
import ComparisonResults from '../components/ComparisonResults';
import { geocodeAddress } from '../services/geocoding';
import AccountLinkModal from '../components/AccountLinkModal';
import LocationAutocomplete from '../components/LocationAutocomplete';
import MapSelector from '../components/MapSelector';
import { authStore } from '../utils/authStore';

const Home = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [coords, setCoords] = useState({ pickup: null, dropoff: null });
  const [addresses, setAddresses] = useState(null);
  const [accountsLinked, setAccountsLinked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState(null);

  const handleLocationSelect = (target, data) => {
    if (target === 'pickup') {
      setPickup(data.address);
      setCoords(prev => ({ ...prev, pickup: { lat: data.lat, lng: data.lng } }));
    } else {
      setDropoff(data.address);
      setCoords(prev => ({ ...prev, dropoff: { lat: data.lat, lng: data.lng } }));
    }
  };

  useEffect(() => {
    // If user is logged in via authStore, accounts are automatically linked
    const user = authStore.getUser();
    if (user) {
      setAccountsLinked(true);
      return;
    }
    // Fallback: check old localStorage key for backward compat
    const isLinked = localStorage.getItem('comparify_credentials_linked');
    if (isLinked === 'true') setAccountsLinked(true);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;
    
    setIsSearching(true);
    
    let finalPickupCoords = coords.pickup;
    let finalDropoffCoords = coords.dropoff;

    // Fetch real coordinates if they weren't selected via autocomplete/map
    if (!finalPickupCoords) {
      finalPickupCoords = await geocodeAddress(pickup);
      // Wait 1 second to respect Nominatim's strict 1 request/second limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!finalDropoffCoords) {
      finalDropoffCoords = await geocodeAddress(dropoff);
    }
    
    setCoords({ pickup: finalPickupCoords, dropoff: finalDropoffCoords });
    setAddresses({ pickup, dropoff });

    setIsSearching(false);
    setShowResults(true);
  };

  return (
    <div className="page-enter">
      <div className="hero-section">
        <h1 className="hero-title">
          Never Overpay for a <span className="text-gradient">Ride</span> Again.
        </h1>
        <p className="hero-subtitle">
          Compare real-time prices from all major ride-hailing services instantly. Opt-in for ride pooling to save up to 40% on your commute.
        </p>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSearch}>
          {/* PICKUP ROW */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <LocationAutocomplete
                label="Pickup Location"
                placeholder="Enter pickup address..."
                icon={MapPin}
                value={pickup}
                showCurrentLocation={true}
                onChange={(val) => {
                  setPickup(val);
                  setCoords(prev => ({ ...prev, pickup: null }));
                }}
                onSelect={(data) => handleLocationSelect('pickup', data)}
              />
            </div>
            <button
              type="button"
              onClick={() => setMapTarget('pickup')}
              className="btn-secondary"
              style={{ padding: '14px', flexShrink: 0, borderRadius: '12px' }}
              title="Select on Map"
            >
              <MapIcon size={20} />
            </button>
          </div>

          {/* DROP-OFF ROW */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <LocationAutocomplete
                label="Drop-off Location"
                placeholder="Where to?"
                icon={Navigation}
                value={dropoff}
                onChange={(val) => {
                  setDropoff(val);
                  setCoords(prev => ({ ...prev, dropoff: null }));
                }}
                onSelect={(data) => handleLocationSelect('dropoff', data)}
              />
            </div>
            <button
              type="button"
              onClick={() => setMapTarget('dropoff')}
              className="btn-secondary"
              style={{ padding: '14px', flexShrink: 0, borderRadius: '12px' }}
              title="Select on Map"
            >
              <MapIcon size={20} />
            </button>
          </div>
          
          <MapSelector 
            isOpen={mapTarget !== null}
            onClose={() => setMapTarget(null)}
            title={`Select ${mapTarget === 'pickup' ? 'Pickup' : 'Drop-off'} Location`}
            initialCoords={mapTarget && coords[mapTarget] ? coords[mapTarget] : null}
            onConfirm={(data) => handleLocationSelect(mapTarget, data)}
          />



          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.2rem', marginBottom: '16px' }}
            disabled={isSearching}
          >
            {isSearching ? 'Scanning providers...' : (
              <>
                <Search size={20} /> Compare Exact Fares
              </>
            )}
          </button>
          
          {!accountsLinked ? (
             <div style={{ textAlign: 'center' }}>
               <button type="button" onClick={() => setIsModalOpen(true)} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <LinkIcon size={18} /> Connect Ride Accounts
               </button>
             </div>
          ) : (
             <div style={{ textAlign: 'center', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
               <CheckCircle size={18} /> Provider Accounts securely linked
             </div>
          )}
        </form>
      </div>

      <AccountLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLinkSuccess={() => setAccountsLinked(true)} 
      />

      {showResults && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '2rem' }}>
            Available Rides
          </h2>
          <ComparisonResults coords={coords} addresses={addresses} accountsLinked={accountsLinked} />
        </div>
      )}
    </div>
  );
};

export default Home;
