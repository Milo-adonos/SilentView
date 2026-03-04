export interface DetectedLocation {
  city: string;
  region: string;
  country: string;
  flag: string;
  latitude: number;
  longitude: number;
}

const countryFlags: Record<string, string> = {
  'France': '🇫🇷',
  'Belgium': '🇧🇪',
  'Belgique': '🇧🇪',
  'Switzerland': '🇨🇭',
  'Suisse': '🇨🇭',
  'Canada': '🇨🇦',
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'Allemagne': '🇩🇪',
  'Spain': '🇪🇸',
  'Espagne': '🇪🇸',
  'Italy': '🇮🇹',
  'Italie': '🇮🇹',
  'Netherlands': '🇳🇱',
  'Pays-Bas': '🇳🇱',
  'Portugal': '🇵🇹',
  'Luxembourg': '🇱🇺',
  'Monaco': '🇲🇨',
  'Morocco': '🇲🇦',
  'Maroc': '🇲🇦',
  'Algeria': '🇩🇿',
  'Algerie': '🇩🇿',
  'Tunisia': '🇹🇳',
  'Tunisie': '🇹🇳',
  'Senegal': '🇸🇳',
  'Ivory Coast': '🇨🇮',
  'Cote d\'Ivoire': '🇨🇮',
};

const fallbackLocation: DetectedLocation = {
  city: 'Paris',
  region: 'Ile-de-France',
  country: 'France',
  flag: '🇫🇷',
  latitude: 48.8566,
  longitude: 2.3522,
};

function getFlag(country: string): string {
  return countryFlags[country] || '🌍';
}

// Géolocalisation du navigateur (GPS/WiFi - très précis)
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
        console.log('Browser geolocation success:', latitude, longitude);
        
        // Utiliser Mapbox reverse geocoding pour obtenir la ville
        try {
          const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
          if (!mapboxToken) {
            console.log('No Mapbox token for reverse geocoding');
            resolve(null);
            return;
          }

          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,region,country&language=fr`
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
            if (feature.place_type?.includes('place') && !city) {
              city = feature.text;
            }
            if (feature.place_type?.includes('region') && !region) {
              region = feature.text;
            }
            if (feature.place_type?.includes('country')) {
              country = feature.text;
            }
          }

          // Fallback si pas de ville trouvée
          if (!city && data.features?.length > 0) {
            city = data.features[0].text || 'Ville inconnue';
          }

          const location: DetectedLocation = {
            city: city || 'Ville détectée',
            region: region || '',
            country: country,
            flag: getFlag(country),
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
        console.log('Browser geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache pendant 5 minutes
      }
    );
  });
}

async function tryIpApi(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,lat,lon', {
      method: 'GET',
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== 'success') return null;

    return {
      city: data.city,
      region: data.regionName,
      country: data.country,
      flag: getFlag(data.country),
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return null;
  }
}

async function tryIpApiCo(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) return null;

    const data = await response.json();

    if (data.error) return null;

    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      flag: getFlag(data.country_name),
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

async function tryIpGeolocation(): Promise<DetectedLocation | null> {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (!ipResponse.ok) return null;

    const { ip } = await ipResponse.json();

    const geoResponse = await fetch(`https://freeipapi.com/api/json/${ip}`);
    if (!geoResponse.ok) return null;

    const data = await geoResponse.json();

    return {
      city: data.cityName,
      region: data.regionName,
      country: data.countryName,
      flag: getFlag(data.countryName),
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

export async function detectLocationFromIP(): Promise<DetectedLocation> {
  // 1. Essayer d'abord la géolocalisation du navigateur (GPS/WiFi - très précis)
  console.log('Trying browser geolocation first...');
  const browserResult = await tryBrowserGeolocation();
  if (browserResult) {
    console.log('Location detected via browser (GPS/WiFi):', browserResult);
    return browserResult;
  }

  // 2. Fallback sur les services IP (moins précis)
  console.log('Browser geolocation failed, falling back to IP services...');
  const ipServices = [tryIpApiCo, tryIpGeolocation, tryIpApi];

  for (const service of ipServices) {
    const result = await service();
    if (result) {
      console.log('Location detected via IP:', result);
      return result;
    }
  }

  console.warn('All geolocation services failed, using fallback location');
  return fallbackLocation;
}

export function getDetectionDelay(): number {
  return 4000 + Math.random() * 2000;
}
