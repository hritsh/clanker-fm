const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function getUserProfile(accessToken: string) {
    return fetchFromSpotify("/me", accessToken);
}

export async function getTopItems(
    accessToken: string,
    type: "artists" | "tracks",
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 50
) {
    return fetchFromSpotify(
        `/me/top/${type}?time_range=${timeRange}&limit=${limit}`,
        accessToken
    );
}

export async function getRecentlyPlayed(
    accessToken: string,
    limit: number = 50
) {
    return fetchFromSpotify(`/me/player/recently-played?limit=${limit}`, accessToken);
}

export async function getSavedTracks(accessToken: string, limit: number = 50) {
    return fetchFromSpotify(`/me/tracks?limit=${limit}`, accessToken);
}

export async function getArtistDetails(accessToken: string, artistId: string) {
    return fetchFromSpotify(`/artists/${artistId}`, accessToken);
}

export async function getArtistTopTracks(
    accessToken: string,
    artistId: string,
    market: string = "US"
) {
    return fetchFromSpotify(
        `/artists/${artistId}/top-tracks?market=${market}`,
        accessToken
    );
}

// Get user's music data formatted for similarity comparison
export async function getUserMusicData(accessToken: string) {
    const [topArtists, topTracks] = await Promise.all([
        getTopItems(accessToken, 'artists', 'medium_term', 15),
        getTopItems(accessToken, 'tracks', 'medium_term', 15)
    ]);

    // Extract genres from artists
    const allGenres = topArtists.items?.flatMap((artist: any) => artist.genres) || [];
    const genreCount = allGenres.reduce((acc: any, genre: string) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
    }, {});

    const topGenres = Object.entries(genreCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 15)
        .map(([genre]) => genre);

    return {
        artists: topArtists.items?.map((artist: any) => artist.name) || [],
        songs: topTracks.items?.map((track: any) => `${track.name} - ${track.artists?.[0]?.name}`) || [],
        genres: topGenres
    };
}

async function fetchFromSpotify(endpoint: string, accessToken: string) {
    const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Spotify API error: ${res.statusText}`);
    }

    return res.json();
}