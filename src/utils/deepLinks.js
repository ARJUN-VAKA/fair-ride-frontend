// Deep links for Indian ride providers
// Tested formats for web browser → app handoff

const enc = (val) => encodeURIComponent(val || '');

export const generateProviderLink = (provider, pickupCoords, dropoffCoords, pickupAddress, dropoffAddress) => {
  const p = provider.toLowerCase();

  if (!pickupCoords || !dropoffCoords) {
    if (p.includes('uber'))   return 'https://m.uber.com/looking';
    if (p.includes('ola'))    return 'https://book.olacabs.com/';
    if (p.includes('rapido')) return 'https://rapido.bike/';
    if (p.includes('namma'))  return 'https://nammayatri.in/';
    return '#';
  }

  const pLat = pickupCoords.lat.toFixed(6);
  const pLng = pickupCoords.lng.toFixed(6);
  const dLat = dropoffCoords.lat.toFixed(6);
  const dLng = dropoffCoords.lng.toFixed(6);

  if (p.includes('uber')) {
    // Uber universal link — brackets must be percent-encoded per RFC 3986
    // This works on both mobile (opens app) and web (opens m.uber.com)
    return (
      `https://m.uber.com/ul/?action=setPickup` +
      `&pickup%5Blatitude%5D=${pLat}` +
      `&pickup%5Blongitude%5D=${pLng}` +
      `&pickup%5Bnickname%5D=${enc(pickupAddress)}` +
      `&dropoff%5Blatitude%5D=${dLat}` +
      `&dropoff%5Blongitude%5D=${dLng}` +
      `&dropoff%5Bnickname%5D=${enc(dropoffAddress)}`
    );
  }

  if (p.includes('ola')) {
    const cat = p.includes('mini') ? 'mini' : 'auto';
    return (
      `https://book.olacabs.com/?` +
      `pickup_lat=${pLat}&pickup_lng=${pLng}&pickup_name=${enc(pickupAddress)}` +
      `&drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc(dropoffAddress)}` +
      `&category=${cat}&utm_source=fairride`
    );
  }

  if (p.includes('rapido')) {
    // Note: Rapido does not officially expose a public deep link format for third parties
    // to pre-fill coordinates. Custom intent:// schemes cause blank pages on iOS/Desktop.
    // Falling back to their official website to prevent 404s and errors.
    return 'https://www.rapido.bike/';
  }

  if (p.includes('namma')) {
    // Namma Yatri / ONDC correct web share link (opens the app on mobile)
    return (
      `https://nammayatri.in/link/ridedetails?` +
      `sourceAddress=${enc(pickupAddress)}&sourceLatLong=${pLat}%2C${pLng}` +
      `&destinationAddress=${enc(dropoffAddress)}&destinationLatLong=${dLat}%2C${dLng}`
    );
  }

  return '#';
};
