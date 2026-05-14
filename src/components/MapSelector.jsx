import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, Check } from 'lucide-react';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapRecenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapSelector = ({ isOpen, onClose, onConfirm, title, initialCoords }) => {
  // Default to Bangalore center or initial coords
  const [position, setPosition] = useState(initialCoords || { lat: 12.9716, lng: 77.5946 });
  const [addressName, setAddressName] = useState('Fetching address...');
  const [loading, setLoading] = useState(false);

  // Update map position if initialCoords changes when modal opens, else get location
  useEffect(() => {
    if (isOpen) {
      if (initialCoords) {
        setPosition(initialCoords);
      } else if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLoading(false);
          },
          (err) => {
            console.error("Geolocation error:", err);
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }
  }, [isOpen, initialCoords]);

  useEffect(() => {
    if (position && isOpen) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position, isOpen]);

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddressName(data.display_name.split(',').slice(0, 3).join(', '));
      } else {
        setAddressName('Unknown Location');
      }
    } catch (err) {
      console.error(err);
      setAddressName('Unknown Location');
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    onConfirm({
      address: addressName,
      lat: position.lat,
      lng: position.lng
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 2000, backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', height: '500px', display: 'flex', flexDirection: 'column', position: 'relative', background: '#ffffff', padding: 0, overflow: 'hidden' }}>
        
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{title || 'Select Location'}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <MapRecenter position={position} />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
          
          <div style={{ 
            position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', 
            background: '#ffffff', padding: '8px 16px', borderRadius: '20px', 
            zIndex: 1000, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap', color: 'var(--text-primary)', border: '1px solid var(--surface-border)'
          }}>
            Click anywhere on the map to drop the pin
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
          <div style={{ flex: 1, marginRight: '16px', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selected Location</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
              {loading ? 'Loading...' : addressName}
            </div>
          </div>
          <button className="btn-primary" onClick={handleConfirm} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            <Check size={16} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
