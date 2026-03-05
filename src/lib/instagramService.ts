export interface InstagramProfile {
  username: string;
  fullName: string;
  profilePicUrl: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
  bio: string;
}

// Liste des APIs Instagram disponibles sur RapidAPI (essayées dans l'ordre)
const INSTAGRAM_APIS = [
  {
    name: 'Instagram Scraper API 2',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    endpoint: (username: string) => `/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`,
    parseResponse: (data: any) => data.data,
  },
  {
    name: 'Instagram Scraper 2022',
    host: 'instagram-scraper-2022.p.rapidapi.com',
    endpoint: (username: string) => `/ig/info/?user=${encodeURIComponent(username)}`,
    parseResponse: (data: any) => data,
  },
  {
    name: 'Instagram Profile',
    host: 'instagram-profile1.p.rapidapi.com',
    endpoint: (username: string) => `/getprofile/${encodeURIComponent(username)}`,
    parseResponse: (data: any) => data,
  },
  {
    name: 'Instagram Bulk Profile Scrapper',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    endpoint: (username: string) => `/clients/api/ig/ig_profile?ig=${encodeURIComponent(username)}`,
    parseResponse: (data: any) => data[0] || data,
  },
];

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile | null> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.error('[Instagram] No RapidAPI key found in VITE_RAPIDAPI_KEY');
    return null;
  }

  // Nettoyer le username (enlever @ si présent)
  const cleanUsername = username.replace('@', '').trim();
  console.log(`[Instagram] Fetching profile for: ${cleanUsername}`);

  // Essayer chaque API dans l'ordre
  for (const api of INSTAGRAM_APIS) {
    try {
      console.log(`[Instagram] Trying ${api.name}...`);
      
      const url = `https://${api.host}${api.endpoint(cleanUsername)}`;
      console.log(`[Instagram] URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': api.host,
        },
      });

      console.log(`[Instagram] ${api.name} response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Instagram] ${api.name} error:`, errorText);
        continue; // Essayer l'API suivante
      }

      const data = await response.json();
      console.log(`[Instagram] ${api.name} raw response:`, data);

      const profile = api.parseResponse(data);
      
      if (!profile) {
        console.error(`[Instagram] ${api.name} returned no profile data`);
        continue;
      }

      // Normaliser les données (différentes APIs ont différents formats)
      const result: InstagramProfile = {
        username: profile.username || profile.user?.username || cleanUsername,
        fullName: profile.full_name || profile.fullName || profile.user?.full_name || '',
        profilePicUrl: profile.profile_pic_url_hd || profile.profile_pic_url || profile.profilePicUrl || profile.profile_picture || profile.user?.profile_pic_url || '',
        followerCount: profile.follower_count || profile.followers || profile.edge_followed_by?.count || profile.user?.follower_count || 0,
        followingCount: profile.following_count || profile.following || profile.edge_follow?.count || profile.user?.following_count || 0,
        postCount: profile.media_count || profile.posts || profile.edge_owner_to_timeline_media?.count || profile.user?.media_count || 0,
        isPrivate: profile.is_private ?? profile.isPrivate ?? profile.user?.is_private ?? false,
        bio: profile.biography || profile.bio || profile.user?.biography || '',
      };

      console.log(`[Instagram] Successfully fetched profile via ${api.name}:`, result);
      return result;
      
    } catch (error) {
      console.error(`[Instagram] ${api.name} exception:`, error);
      continue; // Essayer l'API suivante
    }
  }

  console.error('[Instagram] All APIs failed');
  return null;
}

export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return count.toString();
}
