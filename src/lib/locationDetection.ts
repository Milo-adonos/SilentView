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

// Service 1: ipinfo.io - Très précis et fiable
async function tryIpInfo(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('https://ipinfo.io/json?token=');
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.city || !data.loc) return null;

    const [lat, lon] = data.loc.split(',').map(Number);

    return {
      city: data.city,
      region: data.region || '',
      country: data.country || 'France',
      latitude: lat,
      longitude: lon,
    };
  } catch {
    return null;
  }
}

// Service 2: ipwho.is - Gratuit et précis
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

// Service 3: ip-api.com (version HTTPS via proxy cloudflare)
async function tryIpApiFields(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('https://pro.ip-api.com/json/?fields=status,city,regionName,country,lat,lon&key=');
    if (!response.ok) {
      // Fallback to free version (HTTP only, may not work on HTTPS sites)
      const freeResponse = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon');
      if (!freeResponse.ok) return null;
      
      const data = await freeResponse.json();
      if (data.status !== 'success') return null;

      return {
        city: data.city,
        region: data.regionName || '',
        country: data.country || 'France',
        latitude: data.lat,
        longitude: data.lon,
      };
    }

    const data = await response.json();
    if (data.status !== 'success') return null;

    return {
      city: data.city,
      region: data.regionName || '',
      country: data.country || 'France',
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return null;
  }
}

// Service 4: geoplugin.net - Bon fallback
async function tryGeoPlugin(): Promise<DetectedLocation | null> {
  try {
    const response = await fetch('http://www.geoplugin.net/json.gp');
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.geoplugin_city || data.geoplugin_status === 404) return null;

    return {
      city: data.geoplugin_city,
      region: data.geoplugin_regionName || '',
      country: data.geoplugin_countryName || 'France',
      latitude: parseFloat(data.geoplugin_latitude),
      longitude: parseFloat(data.geoplugin_longitude),
    };
  } catch {
    return null;
  }
}

// Service 5: ipapi.is - Alternative récente et précise
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
  
  // Essayer les services dans l'ordre de fiabilité
  const services = [
    { name: 'ipwho.is', fn: tryIpWhois },
    { name: 'ipapi.is', fn: tryIpApiIs },
    { name: 'ipinfo.io', fn: tryIpInfo },
    { name: 'ip-api.com', fn: tryIpApiFields },
    { name: 'geoplugin.net', fn: tryGeoPlugin },
  ];

  for (const service of services) {
    console.log(`Trying ${service.name}...`);
    const result = await service.fn();
    if (result && result.city && result.latitude && result.longitude) {
      console.log(`Location detected via ${service.name}:`, result);
      return result;
    }
    console.log(`${service.name} failed or returned incomplete data`);
  }

  console.warn('All geolocation services failed, using fallback location');
  return fallbackLocation;
}
