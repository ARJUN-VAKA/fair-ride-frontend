import { useState, useEffect, useRef } from 'react';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';

export const useNotifications = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('fair_ride_notifications') === 'true');
  const user = authStore.getUser();
  const lastMessageTime = useRef(Date.now());

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      const granted = await requestPermission();
      if (granted) {
        setEnabled(true);
        localStorage.setItem('fair_ride_notifications', 'true');
        new Notification('Fair Ride', { body: 'Notifications enabled!' });
      } else {
        alert('Please allow notifications in your browser settings.');
      }
    } else {
      setEnabled(false);
      localStorage.setItem('fair_ride_notifications', 'false');
    }
  };

  useEffect(() => {
    if (!enabled || !user) return;

    const checkUpdates = async () => {
      try {
        // Poll for new messages in user's active rides
        // Note: For a production app, use specific backend push notifications or targeted WebSockets
        const myRides = await poolStore.getRidesByDriver(user.id);
        const myBookings = await poolStore.getBookingsByPassenger(user.id);
        const rideIds = [
          ...myRides.map(r => r.id),
          ...myBookings.map(b => b.rideId)
        ];

        for (const rId of rideIds) {
          const msgs = await poolStore.getMessages(rId);
          const newMsgs = msgs.filter(m => 
            new Date(m.timestamp).getTime() > lastMessageTime.current && 
            m.senderId !== user.id
          );
          
          for (const msg of newMsgs) {
            new Notification(`New message from ${msg.senderName}`, { body: msg.text });
            lastMessageTime.current = new Date(msg.timestamp).getTime();
          }
        }
      } catch (err) {
        console.error('Notification poll error:', err);
      }
    };

    const interval = setInterval(checkUpdates, 10000); // Check every 10 seconds to save requests
    return () => clearInterval(interval);
  }, [enabled, user]);

  return { enabled, toggleNotifications };
};
