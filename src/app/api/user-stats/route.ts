import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getTopItems } from '../../../lib/spotify';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = session.accessToken as string;

    try {
        // Get top artists, tracks, and extract genres
        const [topArtists, topTracks] = await Promise.all([
            getTopItems(accessToken, 'artists', 'medium_term', 10),
            getTopItems(accessToken, 'tracks', 'medium_term', 10)
        ]);

        // Extract and count genres from top artists
        const allGenres = topArtists.items?.flatMap((artist: any) => artist.genres) || [];
        const genreCount = allGenres.reduce((acc: any, genre: string) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
        }, {});

        const topGenres = Object.entries(genreCount)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([genre]) => genre);

        const userStats = {
            topArtists: {
                title: "artists you think make you special",
                items: topArtists.items?.map((artist: any) => ({
                    name: artist.name,
                    image: artist.images?.[0]?.url,
                    followers: artist.followers?.total,
                    genres: artist.genres
                })) || []
            },
            topTracks: {
                title: "songs you overplay until we all hate them",
                items: topTracks.items?.map((track: any) => ({
                    name: track.name,
                    artist: track.artists?.[0]?.name,
                    image: track.album?.images?.[0]?.url,
                    duration: track.duration_ms,
                    popularity: track.popularity
                })) || []
            },
            topGenres: {
                title: "genres that define your personality apparently",
                items: topGenres.map((genre, index) => ({
                    name: genre,
                    rank: index + 1,
                    count: genreCount[genre]
                }))
            }
        };

        return NextResponse.json(userStats);

    } catch (error: any) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { error: error.message || 'your spotify account is as broken as your taste' },
            { status: 500 }
        );
    }
}
