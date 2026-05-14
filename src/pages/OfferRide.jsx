import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Users, CreditCard, Car } from 'lucide-react';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';

const OfferRide = ({ setCurrentPage }) => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = authStore.getUser();
    if (!user) return alert("Please log in first");

    if (!pickup || !dropoff) return alert("Please select locations");

    setLoading(true);
    try {
      await poolStore.offerRide({
        driverId: user.id,
        driverName: user.name || user.email,
        pickup,
        dropoff,
        time,
        seats: parseInt(seats),
        price: parseInt(price),
        vehicle,
        tags: ["AC", "Verified"]
      });
      setSuccess(true);
      
      setTimeout(() => {
        setCurrentPage('my-trips');
      }, 1500);
    } catch (err) {
      alert("Server connection error: Unable to publish ride. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Offer a Ride</h2>
      
      {success ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '60px', height: '60px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Car size={32} />
          </div>
          <h3>Ride Published!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Your ride is now visible to others.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <LocationAutocomplete
              label="Starting From"
              placeholder="Enter pickup location"
              icon={MapPin}
              value={pickup}
              onChange={setPickup}
              showCurrentLocation={true}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <LocationAutocomplete
              label="Going To"
              placeholder="Enter drop-off location"
              icon={Navigation}
              value={dropoff}
              onChange={setDropoff}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Departure Time</label>
              <input type="time" className="input-field" value={time} onChange={e => setTime(e.target.value)} required />
              <Clock className="input-icon" size={18} />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Seats Available</label>
              <input type="number" min="1" max="6" className="input-field" value={seats} onChange={e => setSeats(e.target.value)} required />
              <Users className="input-icon" size={18} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Price per Seat (₹)</label>
              <input type="number" min="10" className="input-field" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 100" required />
              <CreditCard className="input-icon" size={18} />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Vehicle Model</label>
              <input type="text" className="input-field" value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="e.g. Swift Dzire" required />
              <Car className="input-icon" size={18} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Ride'}
          </button>
        </form>
      )}
    </div>
  );
};

export default OfferRide;
