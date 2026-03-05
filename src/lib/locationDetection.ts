export interface DetectedLocation {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

const fallbackLocation: DetectedLocation = {
  city: 'Paris',
  region: 'Île-de-France',
  country: 'France',
  latitude: 48.8566,
  longitude: 2.3522,
};

// Service principal: ipgeolocation.io
async function tryIpGeolocationIo(): Promise<DetectedLocation | null> {
  try {
    const apiKey = import.meta.env.VITE_IPGEOLOCATION_API_KEY;
    if (!apiKey) {
      console.log('No ipgeolocation.io API key found');
      return null;
    }

    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.city || !data.latitude || !data.longitude) return null;

    return {
      city: data.city,
      region: data.state_prov || data.district || '',
      country: data.country_name || 'France',
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
  } catch {
    return null;
  }
}

// Fallback: ipwho.is
async function tryIpWhois(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.city) return null;

    return {
      city: data.city,
      region: data.region || '',
      country: data.country || 'France',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

// Fallback: ipapi.is
async function tryIpApiIs(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('https://api.ipapi.is/');
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.location?.city) return null;

    return {
      city: data.location.city,
      region: data.location.state || '',
      country: data.location.country || 'France',
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    };
  } catch {
    return null;
  }
}

export async function detectLocationFromIP(): Promise<DetectedLocation> {
  console.log('Starting IP geolocation detection...');
  
  const services = [
    { name: 'ipgeolocation.io', fn: tryIpGeolocationIo },
    { name: 'ipwho.is', fn: tryIpWhois },
    { name: 'ipapi.is', fn: tryIpApiIs },
  ];

  for (const service of services) {
    console.log(`Trying ${service.name}...`);
    const result = await service.fn();
    if (result && result.city && result.latitude && result.longitude) {
      console.log(`Location detected via ${service.name}:`, result);
      return result;
    }
  }

  console.warn('All services failed, using fallback');
  return fallbackLocation;
}
