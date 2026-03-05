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

// Service principal: ipgeolocation.io - Très précis avec clé API
async function tryIpGeolocationIo(): Promise<DetectedLocation | null> {
  try {
    const apiKey = import.meta.env.VITE_IPGEOLOCATION_API_KEY;
    if (!apiKey) {
      console.log('No ipgeolocation.io API key found');
      return null;
    }

    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`);
    if (!response.ok) {
      console.log('ipgeolocation.io response not ok:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.city || !data.latitude || !data.longitude) {
      console.log('ipgeolocation.io incomplete data:', data);
      return null;
    }

    return {
      city: data.city,
      region: data.state_prov || data.district || '',
      country: data.country_name || 'France',
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
  } catch (error) {
    console.error('ipgeolocation.io error:', error);
    return null;
  }
}

// Fallback 1: ipwho.is - Gratuit et précis
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

// Fallback 2: ipapi.is
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
  
  // Essayer ipgeolocation.io en premier (service principal avec API key)
  console.log('Trying ipgeolocation.io (primary service)...');
  const primaryResult = await tryIpGeolocationIo();
  if (primaryResult && primaryResult.city && primaryResult.latitude && primaryResult.longitude) {
    console.log('Location detected via ipgeolocation.io:', primaryResult);
    return primaryResult;
  }

  // Fallbacks si le service principal échoue
  const fallbackServices = [
    { name: 'ipwho.is', fn: tryIpWhois },
    { name: 'ipapi.is', fn: tryIpApiIs },
  ];

  for (const service of fallbackServices) {
    console.log(`Trying fallback: ${service.name}...`);
    const result = await service.fn();
    if (result && result.city && result.latitude && result.longitude) {
      console.log(`Location detected via ${service.name}:`, result);
      return result;
    }
  }

  console.warn('All geolocation services failed, using fallback location');
  return fallbackLocation;
}
