// Uses relative path for Netlify Functions (proxied via netlify.toml)
const API_URL = '/api';

export const poolStore = {
  async offerRide(rideData) {
    const res = await fetch(`${API_URL}/rides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rideData)
    });
    if (!res.ok) throw new Error('Failed to offer ride');
    return res.json();
  },

  async getAvailableRides() {
    try {
      const res = await fetch(`${API_URL}/rides`);
      return res.json();
    } catch {
      return [];
    }
  },

  async getRidesByDriver(driverId) {
    try {
      const res = await fetch(`${API_URL}/rides/driver/${driverId}`);
      return res.json();
    } catch {
      return [];
    }
  },

  async completeRide(rideId) {
    const res = await fetch(`${API_URL}/rides/${rideId}/complete`, { method: 'PATCH' });
    return res.json();
  },

  async bookSeat(rideId, passengerId) {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, passengerId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Booking failed');
    }
    return res.json();
  },

  async getBookingsByPassenger(passengerId) {
    try {
      const res = await fetch(`${API_URL}/bookings/passenger/${passengerId}`);
      return res.json();
    } catch {
      return [];
    }
  },

  async sendMessage(rideId, senderId, senderName, text) {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, senderId, senderName, text })
    });
    return res.json();
  },

  async getMessages(rideId) {
    try {
      const res = await fetch(`${API_URL}/messages/${rideId}`);
      return res.json();
    } catch {
      return [];
    }
  },

  async markMessageAsRead(messageId) {
    const res = await fetch(`${API_URL}/messages/${messageId}/read`, { method: 'PATCH' });
    return res.json();
  },

  async leaveReview(driverId, reviewerId, reviewerName, rating, comment) {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, reviewerId, reviewerName, rating, comment })
    });
    return res.json();
  },

  async getDriverReviews(driverId) {
    try {
      const res = await fetch(`${API_URL}/reviews/driver/${driverId}`);
      return res.json();
    } catch {
      return [];
    }
  }
};
