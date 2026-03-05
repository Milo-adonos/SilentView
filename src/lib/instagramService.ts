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

const RAPIDAPI_HOST = 'instagram-scraper-api2.p.rapidapi.com';

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile | null> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.error('No RapidAPI key found');
    return null;
  }

  // Nettoyer le username (enlever @ si présent)
  const cleanUsername = username.replace('@', '').trim();

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/info?username_or_id_or_url=${encodeURIComponent(cleanUsername)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      console.error('Instagram API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.data) {
      console.error('No data returned from Instagram API');
      return null;
    }

    const profile = data.data;

    return {
      username: profile.username || cleanUsername,
      fullName: profile.full_name || '',
      profilePicUrl: profile.profile_pic_url_hd || profile.profile_pic_url || '',
      followerCount: profile.follower_count || 0,
      followingCount: profile.following_count || 0,
      postCount: profile.media_count || 0,
      isPrivate: profile.is_private || false,
      bio: profile.biography || '',
    };
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return null;
  }
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
