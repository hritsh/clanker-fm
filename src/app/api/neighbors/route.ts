import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { findSimilarUsers, User, MOCK_USERS } from '../../../lib/database';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: 'nice try, but you need to log in first' }, { status: 401 });
    }

    try {
        const { username, userMusicData } = await request.json();

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: 'clanker needs a username, obviously' }, { status: 400 });
        }

        if (!userMusicData || !userMusicData.artists || !userMusicData.songs || !userMusicData.genres) {
            return NextResponse.json({ error: 'clanker needs your music data first. visit home page to load it' }, { status: 400 });
        }

        // Check if username is already taken by someone in our mock database
        const userExists = MOCK_USERS.find(user => user.username.toLowerCase() === username.toLowerCase());
        if (userExists) {
            return NextResponse.json({
                error: 'username already taken by someone with equally questionable taste. try another one'
            }, { status: 409 });
        }

        // Create user data for similarity comparison using the provided music data
        const currentUserData: Partial<User> = {
            username: username,
            artists: userMusicData.artists.slice(0, 10), // top 10 artists
            songs: userMusicData.songs.slice(0, 10),     // top 10 songs  
            genres: userMusicData.genres.slice(0, 10)    // top 10 genres
        };

        // Find similar users from mock database
        const similarUsers = findSimilarUsers(currentUserData, 5);

        return NextResponse.json({
            username,
            currentUserData,
            matches: similarUsers
        });
    } catch (error: any) {
        console.error('Error finding neighbors:', error);
        return NextResponse.json(
            { error: error.message || 'clanker\'s algorithm broke trying to find people with your taste' },
            { status: 500 }
        );
    }
}
