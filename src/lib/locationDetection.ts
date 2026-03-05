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

// Service PRINCIPAL: Géolocalisation du navigateur (GPS/WiFi) - TRÈS PRÉCIS
async function tryBrowserGeolocation(): Promise<DetectedLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Browser geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Browser GPS coordinates:', latitude, longitude);
        
        // Reverse geocoding avec Mapbox pour obtenir la ville
        try {
          const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
          if (!mapboxToken) {
            console.log('No Mapbox token for reverse geocoding');
            resolve(null);
            return;
          }

          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,locality,region,country&language=fr`
          );

          if (!response.ok) {
            console.log('Mapbox reverse geocoding failed');
            resolve(null);
            return;
          }

          const data = await response.json();
          
          let city = '';
          let region = '';
          let country = 'France';

          for (const feature of data.features || []) {
            if ((feature.place_type?.includes('place') || feature.place_type?.includes('locality')) && !city) {
              city = feature.text;
            }
            if (feature.place_type?.includes('region') && !region) {
              region = feature.text;
            }
            if (feature.place_type?.includes('country')) {
              country = feature.text;
            }
          }

          if (!city && data.features?.length > 0) {
            city = data.features[0].text || 'Ville détectée';
          }

          const location: DetectedLocation = {
            city: city || 'Position détectée',
            region: region || '',
            country: country,
            latitude,
            longitude,
          };

          console.log('Browser geolocation result:', location);
          resolve(location);
        } catch (error) {
          console.log('Reverse geocoding error:', error);
          resolve(null);
        }
      },
      (error) => {
        console.log('Browser geolocation denied or failed:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  });
}

// Fallback: ipgeolocation.io - Service IP avec clé API
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
  console.log('Starting geolocation detection...');
  
  // 1. ESSAYER D'ABORD LA GÉOLOCALISATION NAVIGATEUR (GPS/WiFi) - TRÈS PRÉCIS
  console.log('Trying browser geolocation (GPS/WiFi)...');
  const browserResult = await tryBrowserGeolocation();
  if (browserResult && browserResult.city && browserResult.latitude && browserResult.longitude) {
    console.log('Location detected via browser GPS:', browserResult);
    return browserResult;
  }
  console.log('Browser geolocation failed or denied, falling back to IP...');

  // 2. Fallback sur ipgeolocation.io (service IP avec API key)
  console.log('Trying ipgeolocation.io...');
  const ipGeoResult = await tryIpGeolocationIo();
  if (ipGeoResult && ipGeoResult.city && ipGeoResult.latitude && ipGeoResult.longitude) {
    console.log('Location detected via ipgeolocation.io:', ipGeoResult);
    return ipGeoResult;
  }

  // 3. Autres fallbacks IP
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
