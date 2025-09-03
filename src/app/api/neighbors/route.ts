import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { findSimilarUsers, User } from '../../../lib/database';
import { getAllUsersExcept, upsertUser, DbUser } from '../../../lib/supabase';
import { getUserProfile, getUserMusicData } from '../../../lib/spotify';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: 'nice try, but you need to log in first' }, { status: 401 });
    }

    try {
        const accessToken = session.accessToken as string;

        // Get current user's Spotify profile and music data
        const [userProfile, userMusicData] = await Promise.all([
            getUserProfile(accessToken),
            getUserMusicData(accessToken)
        ]);

        console.log('User profile:', userProfile);
        console.log('User music data:', userMusicData);

        // Get country from IP address
        const clientIP = getClientIP(request);
        const countryInfo = await getCountryFromIP(clientIP);

        // Create user data for database storage
        const currentUserData: DbUser = {
            id: userProfile.id, // Spotify user ID
            username: userProfile.display_name || userProfile.id,
            country: countryInfo.flag,
            artists: userMusicData.artists.slice(0, 20),
            songs: userMusicData.songs.slice(0, 20),
            genres: userMusicData.genres.slice(0, 20),
            image: userProfile.images?.[0]?.url || null
        };

        console.log('Current user data:', {
            id: currentUserData.id,
            username: currentUserData.username,
            country: currentUserData.country,
            countryCode: countryInfo.code,
            image: currentUserData.image,
            artistsCount: currentUserData.artists.length,
            songsCount: currentUserData.songs.length,
            genresCount: currentUserData.genres.length
        });

        // Try to save/update current user in database
        let dbSaveSuccess = false;
        try {
            await upsertUser(currentUserData);
            dbSaveSuccess = true;
            console.log('User saved to database successfully');
        } catch (dbError) {
            console.error('Failed to save user to database, continuing with comparison only:', dbError);
        }

        // Get all other users from database
        let realUsers: User[] = [];
        try {
            const dbUsers = await getAllUsersExcept(userProfile.id);
            console.log(`Fetched ${dbUsers.length} users from database`);

            // Convert db users to User interface format
            realUsers = dbUsers.map(dbUser => ({
                id: dbUser.id,
                username: dbUser.username,
                country: dbUser.country,
                artists: dbUser.artists,
                songs: dbUser.songs,
                genres: dbUser.genres,
                image: dbUser.image || null
            }));
        } catch (dbError) {
            console.error('Failed to fetch users from database, using only mock users:', dbError);
        }

        // Find similar users (combines real users + mock users)
        const similarUsers = findSimilarUsers(currentUserData, realUsers, 10);

        return NextResponse.json({
            username: currentUserData.username,
            currentUserData,
            matches: similarUsers,
            dbStatus: {
                saveSuccess: dbSaveSuccess,
                realUsersCount: realUsers.length
            }
        });
    } catch (error: any) {
        console.error('Error finding neighbors:', error);
        return NextResponse.json(
            { error: error.message || 'clanker\'s algorithm broke trying to find people with your taste' },
            { status: 500 }
        );
    }
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    // Fallback to connection remote address
    return '127.0.0.1'; // localhost fallback
}

// Helper function to get country from IP
async function getCountryFromIP(ip: string): Promise<{ code: string; flag: string }> {
    try {
        const response = await fetch(`https://api.country.is/${ip}`);
        const data = await response.json();

        if (data.country) {
            return {
                code: data.country,
                flag: getCountryFlag(data.country)
            };
        }
    } catch (error) {
        console.error('Error fetching country from IP:', error);
    }

    // Fallback to world emoji
    return { code: 'XX', flag: '🌍' };
}

// Helper function to convert country code to flag emoji
function getCountryFlag(countryCode: string): string {
    console.log('Getting country flag for:', countryCode);
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 0x1F1E6 - 65 + char.charCodeAt(0));

    console.log('Country flag code points:', codePoints);
    console.log('Country flag emoji:', String.fromCodePoint(...codePoints));
    return String.fromCodePoint(...codePoints);
}