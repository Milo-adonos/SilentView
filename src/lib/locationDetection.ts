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
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

async function tryIpApi(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon');
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 'success') return null;

    return {
      city: data.city,
      region: data.regionName,
      country: data.country,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return null;
  }
}

async function tryFreeIpApi(): Promise<DetectedLocation | null> {
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
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

export async function detectLocationFromIP(): Promise<DetectedLocation> {
  const services = [tryIpApiCo, tryFreeIpApi, tryIpApi];

  for (const service of services) {
    const result = await service();
    if (result && result.city && result.latitude && result.longitude) {
      console.log('Location detected:', result);
      return result;
    }
  }

  console.warn('All geolocation services failed, using fallback location');
  return fallbackLocation;
}
