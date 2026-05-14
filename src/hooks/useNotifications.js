import { useState, useEffect, useRef } from 'react';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';

export const useNotifications = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('fair_ride_notifications') === 'true');
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('fair_ride_notification_list');
    return saved ? JSON.parse(saved) : [];
  });
  const user = authStore.getUser();
  const lastMessageTime = useRef(Date.now());

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('fair_ride_notification_list', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title, body) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotif, ...prev].slice(0, 20)); // Keep last 20
    
    // Also trigger system notification if enabled
    if (enabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        addNotification('Fair Ride', 'Notifications enabled!');
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
            addNotification(`New message from ${msg.senderName}`, msg.text);
            lastMessageTime.current = new Date(msg.timestamp).getTime();
          }
        }
      } catch (err) {
        console.error('Notification poll error:', err);
      }
    };

    const interval = setInterval(checkUpdates, 10000); 
    return () => clearInterval(interval);
  }, [enabled, user]);

  return { 
    enabled, 
    toggleNotifications, 
    notifications, 
    unreadCount, 
    clearNotifications, 
    markAllRead 
  };
};
