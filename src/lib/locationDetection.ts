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
  // Essayer plusieurs services dans l'ordre
  const services = [tryIpApi, tryIpApiCo, tryIpGeolocation];

  for (const service of services) {
    const result = await service();
    if (result) {
      console.log('Location detected:', result);
      return result;
    }
  }

  console.warn('All geolocation services failed, using fallback location');
  return fallbackLocation;
}

export function getDetectionDelay(): number {
  return 4000 + Math.random() * 2000;
}
