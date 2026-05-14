import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';

const ReviewModal = ({ driverId, driverName, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const user = authStore.getUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await poolStore.leaveReview(driverId, user.id, user.name || user.email, rating, comment);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Review {driverName}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={32} 
                color={star <= rating ? '#f59e0b' : '#cbd5e1'} 
                fill={star <= rating ? '#f59e0b' : 'none'}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
            ))}
          </div>

          <textarea 
            className="input-field"
            placeholder="How was the ride? (Optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ minHeight: '100px', marginBottom: '20px', padding: '12px' }}
          />

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
