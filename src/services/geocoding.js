export const geocodeAddress = async (address) => {
  try {
    // Added countrycodes=in to ensure robust Indian searches
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    // Fallback coordinates (e.g., somewhere in Bangalore) if address is vague
    console.warn(`Address not found for "${address}", using fallback coordinates.`);
    return {
      lat: 12.9716 + (Math.random() * 0.1), // Slight randomness so distance isn't 0
      lng: 77.5946 + (Math.random() * 0.1)
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback on network error
    return {
      lat: 12.9716 + (Math.random() * 0.1),
      lng: 77.5946 + (Math.random() * 0.1)
    };
  }
};
