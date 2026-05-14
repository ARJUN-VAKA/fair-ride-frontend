import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Check, CheckCheck } from 'lucide-react';
import { poolStore } from '../utils/poolStore';
import { authStore } from '../utils/authStore';
import { supabase } from '../utils/supabaseClient';

const ChatBox = ({ rideId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const user = authStore.getUser();
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = async () => {
    const data = await poolStore.getMessages(rideId);
    setMessages(data);
    
    // Mark unread messages from others as read
    const unreadFromOthers = data.filter(m => m.senderId !== user.id && !m.is_read);
    for (const msg of unreadFromOthers) {
      await poolStore.markMessageAsRead(msg.id);
    }
    if (unreadFromOthers.length > 0) {
      // Re-fetch to update local state after marking read
      const updated = await poolStore.getMessages(rideId);
      setMessages(updated);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    // Setup Supabase Realtime Broadcast for Typing Indicator
    const channel = supabase.channel(`chat_${rideId}`);
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== user.id) {
          setIsTyping(payload.payload.isTyping);
        }
      })
      .subscribe();
    
    channelRef.current = channel;

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, isTyping: true }
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user.id, isTyping: false }
        });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const textToSend = input.trim();
    setInput('');
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast', event: 'typing', payload: { userId: user.id, isTyping: false }
      });
    }
    
    await poolStore.sendMessage(rideId, user.id, user.name || user.email, textToSend);
    fetchMessages();
  };

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px',
      background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden',
      border: '1px solid var(--surface-border)'
    }}>
      <div style={{ background: 'var(--accent-primary)', padding: '16px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ride Chat</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '50%' }}>No messages yet. Say hi!</p>
        ) : (
          messages.map(m => {
            const isMe = m.senderId === user.id;
            return (
              <div key={m.id} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{isMe ? 'You' : m.senderName}</div>
                <div style={{
                  background: isMe ? 'var(--accent-primary)' : '#fff',
                  color: isMe ? '#fff' : 'var(--text-primary)',
                  padding: '10px 14px', borderRadius: '16px', border: isMe ? 'none' : '1px solid var(--surface-border)',
                  maxWidth: '80%', wordBreak: 'break-word', fontSize: '0.95rem', position: 'relative'
                }}>
                  {m.text}
                  {isMe && (
                    <div style={{ position: 'absolute', bottom: '-16px', right: '4px', fontSize: '0.7rem', color: m.is_read ? '#3b82f6' : '#94a3b8' }}>
                      {m.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              background: '#fff', color: 'var(--text-secondary)',
              padding: '10px 14px', borderRadius: '16px', border: '1px solid var(--surface-border)',
              fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              typing<span className="typing-dots">...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} style={{ height: '10px' }} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--surface-border)', background: '#fff' }}>
        <input 
          type="text" 
          value={input} 
          onChange={handleTyping} 
          placeholder="Type a message..." 
          style={{ flex: 1, padding: '10px', border: '1px solid var(--surface-border)', borderRadius: '20px', outline: 'none' }}
        />
        <button type="submit" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px', cursor: 'pointer' }}>
          <Send size={18} />
        </button>
      </form>
      
      <style>{`
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
        .typing-dots { animation: blink 1.4s infinite both; }
      `}</style>
    </div>
  );
};

export default ChatBox;
