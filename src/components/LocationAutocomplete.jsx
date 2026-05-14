import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader, LocateFixed } from 'lucide-react';

const LocationAutocomplete = ({ label, placeholder, icon: Icon, value, onChange, onSelect, showCurrentLocation }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&addressdetails=1&countrycodes=in&limit=6`
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch (err) {
      console.error('Suggestion fetch error:', err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setLocError('');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(val), 900);
  };

  const handleSelect = (item) => {
    const short = item.display_name.split(',').slice(0, 3).join(', ');
    setQuery(short);
    onChange(short);
    setSuggestions([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect({ address: short, lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
          );
          const data = await res.json();
          const addr = data.display_name
            ? data.display_name.split(',').slice(0, 3).join(', ')
            : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQuery(addr);
          onChange(addr);
          if (onSelect) onSelect({ address: addr, lat, lng });
        } catch {
          const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQuery(addr);
          onChange(addr);
          if (onSelect) onSelect({ address: addr, lat, lng });
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocError('Location access denied. Please allow location in browser settings.');
        else setLocError('Could not get your location. Try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="input-group" ref={wrapperRef} style={{ marginBottom: 0 }}>
      <label className="input-label">{label}</label>

      {/* Row: Input + Current Location button */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          />
          <Icon className="input-icon" size={18} />

          {/* Suggestions dropdown */}
          {isOpen && suggestions.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#ffffff', border: '1px solid var(--surface-border)',
              borderRadius: '12px', listStyle: 'none', padding: '4px 0',
              margin: '4px 0 0 0', maxHeight: '220px', overflowY: 'auto', zIndex: 999,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem',
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '8px',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid var(--surface-border)' : 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={14} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ lineHeight: 1.4 }}>{item.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* "Use My Location" button — only shown for pickup */}
        {showCurrentLocation && (
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={locating}
            title="Use current location"
            style={{
              flexShrink: 0, padding: '14px', borderRadius: '12px', border: 'none',
              background: locating ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.15)',
              color: '#3b82f6', cursor: locating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', minWidth: '46px'
            }}
          >
            {locating ? <Loader size={18} className="spin" /> : <LocateFixed size={18} />}
          </button>
        )}
      </div>

      {locError && (
        <p style={{ color: '#f87171', fontSize: '0.78rem', margin: '6px 0 0 0' }}>{locError}</p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
