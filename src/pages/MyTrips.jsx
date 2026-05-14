import React, { useState, useEffect } from 'react';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';
import { Car, Clock, CheckCircle, MessageCircle, Star } from 'lucide-react';
import ChatBox from '../components/ChatBox';
import ReviewModal from '../components/ReviewModal';

const MyTrips = () => {
  const [offeredRides, setOfferedRides] = useState([]);
  const [bookedTrips, setBookedTrips] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [reviewDriver, setReviewDriver] = useState(null);
  const user = authStore.getUser();

  const fetchTrips = async () => {
    if (!user) return;
    const offered = await poolStore.getRidesByDriver(user.id);
    setOfferedRides(offered);
    
    const booked = await poolStore.getBookingsByPassenger(user.id);
    setBookedTrips(booked);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCompleteRide = async (rideId) => {
    await poolStore.completeRide(rideId);
    fetchTrips();
  };

  if (!user) return <div className="page-enter" style={{ textAlign: 'center', padding: '40px' }}>Please log in to view your trips.</div>;

  return (
    <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>My Trips</h2>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ borderBottom: '2px solid var(--surface-border)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
          Rides I'm Offering
        </h3>
        {offeredRides.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You haven't offered any rides yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {offeredRides.map(ride => (
              <div key={ride.id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{ride.pickup} → {ride.dropoff}</div>
                  <div style={{ color: ride.status === 'completed' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                    {ride.status === 'completed' ? 'Completed' : 'Active'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {ride.time}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Car size={16} /> {ride.vehicle}</span>
                </div>
                {ride.status === 'active' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" onClick={() => setActiveChatId(ride.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                      <MessageCircle size={16} /> Group Chat
                    </button>
                    <button className="btn-secondary" onClick={() => handleCompleteRide(ride.id)} style={{ padding: '8px 16px', fontSize: '0.9rem', borderColor: '#10b981', color: '#10b981' }}>
                      <CheckCircle size={16} /> Mark Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ borderBottom: '2px solid var(--surface-border)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
          Rides I've Booked
        </h3>
        {bookedTrips.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You haven't booked any rides yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookedTrips.map(booking => {
              const ride = booking.ride;
              if (!ride) return null;
              
              return (
                <div key={booking.id} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{ride.pickup} → {ride.dropoff}</div>
                    <div style={{ color: ride.status === 'completed' ? '#10b981' : '#3b82f6', fontWeight: 600 }}>
                      {ride.status === 'completed' ? 'Ride Completed' : 'Booking Confirmed'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Driver: {ride.driverName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {ride.time}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {ride.status === 'active' && (
                      <button className="btn-primary" onClick={() => setActiveChatId(ride.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        <MessageCircle size={16} /> Chat with Driver
                      </button>
                    )}
                    {ride.status === 'completed' && (
                      <button className="btn-secondary" onClick={() => setReviewDriver({ id: ride.driverId, name: ride.driverName })} style={{ padding: '8px 16px', fontSize: '0.9rem', borderColor: '#f59e0b', color: '#f59e0b' }}>
                        <Star size={16} /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeChatId && <ChatBox rideId={activeChatId} onClose={() => setActiveChatId(null)} />}
      {reviewDriver && <ReviewModal driverId={reviewDriver.id} driverName={reviewDriver.name} onClose={() => setReviewDriver(null)} />}
    </div>
  );
};

export default MyTrips;
