import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {
    getUserProfile,
    getTopItems,
    getRecentlyPlayed,
    getSavedTracks
} from '../../../lib/spotify';
import {
    generateScanningComments,
    generateCompleteRoastExperience,
    generateIntroMessage
} from '../../../lib/gemini';

// Add Edge Runtime configuration for Cloudflare Pages
export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = session.accessToken as string;

    try {
        const [userProfile, topArtists, topTracks, recentlyPlayed, savedTracks] =
            await Promise.all([
                getUserProfile(accessToken),
                getTopItems(accessToken, 'artists', 'medium_term', 15),
                getTopItems(accessToken, 'tracks', 'medium_term', 25),
                getRecentlyPlayed(accessToken, 25),
                getSavedTracks(accessToken, 25)
            ]);

        // Extract and count genres
        const allGenres = topArtists.items?.flatMap((artist: any) => artist.genres) || [];
        const genreCount = allGenres.reduce((acc: any, genre: string) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
        }, {});
        const topGenres = Object.entries(genreCount)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 8)
            .map(([genre]) => genre);

        const roastData = {
            userProfile,
            topArtists,
            topTracks,
            topGenres,
            recentlyPlayed,
            savedTracks,
        };

        return NextResponse.json(roastData);

    } catch (error: any) {
        console.error('Error fetching Spotify data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch data from Spotify' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, roastData, tracksToScan } = body;

        // Generate intro message
        if (action === 'intro') {
            const introMessage = await generateIntroMessage();
            console.log("Generated intro message:", introMessage);
            return NextResponse.json({ introMessage });
        }

        // Generate scanning comments
        if (action === 'scanning') {
            const scanningComments = await generateScanningComments(roastData, tracksToScan);
            console.log("Generated scanning comments:", scanningComments);
            return NextResponse.json({ scanningComments });
        }

        // Generate complete roast experience
        if (action === 'complete_roast') {
            const roastExperience = await generateCompleteRoastExperience(roastData);
            console.log("Generated complete roast experience:", roastExperience);
            return NextResponse.json(roastExperience);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error("Error in POST /api/get-roast-data:", error);
        return NextResponse.json(
            { error: error.message || 'my circuits fried trying to process your taste' },
            { status: 500 }
        );
    }
}