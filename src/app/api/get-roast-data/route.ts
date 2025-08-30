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
    generateContextualRoast,
    generateIntroMessage,
    generateSnarkyComment,
    generateFinalVerdict
} from '../../../lib/gemini';

// Question flow configuration
const QUESTION_FLOW = [
    {
        id: 'track_choice',
        type: 'image_choice',
        generateQuestion: (data: any) => {
            const topTracks = data.topTracks?.items || [];
            if (topTracks.length < 4) return null;

            return {
                botMessage: `looking at your top tracks... which one screams "i have no shame"?`,
                choices: topTracks.slice(0, 4).map((track: any) => ({
                    text: `${track.name} by ${track.artists[0].name}`,
                    value: `${track.name}|${track.artists[0].name}`,
                    imageUrl: track.album.images[0]?.url || ''
                }))
            };
        }
    },
    {
        id: 'genre_excuse',
        type: 'mcq',
        generateQuestion: (data: any) => {
            const topGenre = data.topGenres?.[0] || 'unknown';
            return {
                botMessage: `your top genre is "${topGenre}". what's your excuse?`,
                choices: [
                    { text: "it's actually deep and meaningful", value: "pretentious" },
                    { text: "it just hits different", value: "basic" },
                    { text: "my friends got me into it", value: "follower" },
                    { text: "no excuse, i own it", value: "honest" }
                ]
            };
        }
    },
    {
        id: 'mainstream_scale',
        type: 'slider',
        generateQuestion: (data: any) => {
            const topArtist = data.topArtists?.items?.[0];
            const followers = topArtist?.followers?.total || 0;
            return {
                botMessage: `${topArtist?.name || 'your top artist'} has ${followers.toLocaleString()} followers. how mainstream are you willing to admit you are?`,
                choices: [
                    { text: "0: i liked them before they were cool", value: '0' },
                    { text: "100: i am the mainstream", value: '100' }
                ]
            };
        }
    },
    {
        id: 'listening_mood',
        type: 'mcq',
        generateQuestion: (data: any) => {
            const recentTrack = data.recentlyPlayed?.items?.[0]?.track;
            return {
                botMessage: `you played "${recentTrack?.name || 'something'}" recently. what was the vibe?`,
                choices: [
                    { text: "crying in my car", value: "emotional_damage" },
                    { text: "pretending i'm in a music video", value: "main_character" },
                    { text: "it came on shuffle, i swear", value: "denial" },
                    { text: "unironically jamming", value: "no_shame" }
                ]
            };
        }
    },
    {
        id: 'artist_loyalty',
        type: 'mcq',
        generateQuestion: (data: any) => {
            const topArtist = data.topArtists?.items?.[0];
            return {
                botMessage: `${topArtist?.name || 'your top artist'} clearly owns your soul. how long has this been going on?`,
                choices: [
                    { text: "since before they were famous", value: "hipster" },
                    { text: "discovered them last month", value: "bandwagon" },
                    { text: "it's complicated", value: "complicated" },
                    { text: "we're basically married", value: "obsessed" }
                ]
            };
        }
    },
    {
        id: 'playlist_vibe',
        type: 'image_choice',
        generateQuestion: (data: any) => {
            const topTracks = data.topTracks?.items || [];
            if (topTracks.length < 6) return null;

            return {
                botMessage: `which of these best represents your playlist's personality disorder?`,
                choices: topTracks.slice(4, 8).map((track: any) => ({
                    text: `${track.name} by ${track.artists[0].name}`,
                    value: `${track.name}|${track.artists[0].name}`,
                    imageUrl: track.album.images[0]?.url || ''
                }))
            };
        }
    }
];

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
        const {
            step,
            choice,
            roastData,
            conversationHistory = [],
            currentQuestionIndex = 0,
            trackName,
            artistName
        } = body;

        // Handle snarky comments for scanner
        if (trackName && artistName) {
            const comment = await generateSnarkyComment(trackName, artistName);
            return NextResponse.json({ comment });
        }

        // Start conversation
        if (step === 'ready' && choice === 'start') {
            const introMessage = await generateIntroMessage();
            return NextResponse.json({
                nextStep: 'typing_intro',
                botMessage: introMessage,
                choices: [],
                conversationHistory: [],
                currentQuestionIndex: 0
            });
        }

        // Begin first question
        if (step === 'typing_intro' && choice === 'continue') {
            const firstQuestion = QUESTION_FLOW[0];
            const questionData = firstQuestion.generateQuestion(roastData);

            if (!questionData) {
                return NextResponse.json({
                    nextStep: 'final',
                    botMessage: "your music library is emptier than my emotion circuits. that's actually concerning.",
                    choices: [{ text: "fair point", value: "end" }],
                    conversationHistory
                });
            }

            return NextResponse.json({
                type: firstQuestion.type,
                nextStep: 'handle_question',
                botMessage: questionData.botMessage,
                choices: questionData.choices,
                conversationHistory,
                currentQuestionIndex: 0,
                questionId: firstQuestion.id
            });
        }

        // Handle question responses
        if (step === 'handle_question') {
            const questionId = body.questionId;
            const nextQuestionIndex = currentQuestionIndex + 1;

            // Generate roast for current choice
            const roastResponse = await generateContextualRoast({
                questionType: questionId,
                userChoice: choice,
                roastData,
                conversationHistory
            });

            // Update conversation history
            const updatedHistory = [
                ...conversationHistory,
                {
                    questionId,
                    question: body.botMessage || '',
                    userChoice: choice,
                    botResponse: roastResponse
                }
            ];

            // Check if we have more questions
            if (nextQuestionIndex >= QUESTION_FLOW.length) {
                // Generate final verdict
                const finalVerdict = await generateFinalVerdict(roastData, updatedHistory);
                return NextResponse.json({
                    nextStep: 'final',
                    botMessage: `${roastResponse}\n\n${finalVerdict}`,
                    choices: [{ text: "i need therapy after this", value: "end" }],
                    conversationHistory: updatedHistory
                });
            }

            // Generate next question
            const nextQuestion = QUESTION_FLOW[nextQuestionIndex];
            const questionData = nextQuestion.generateQuestion(roastData);

            if (!questionData) {
                // Skip this question if data is insufficient
                const finalVerdict = await generateFinalVerdict(roastData, updatedHistory);
                return NextResponse.json({
                    nextStep: 'final',
                    botMessage: `${roastResponse}\n\n${finalVerdict}`,
                    choices: [{ text: "i need therapy after this", value: "end" }],
                    conversationHistory: updatedHistory
                });
            }

            return NextResponse.json({
                type: nextQuestion.type,
                nextStep: 'handle_question',
                botMessage: `${roastResponse}\n\n${questionData.botMessage}`,
                choices: questionData.choices,
                conversationHistory: updatedHistory,
                currentQuestionIndex: nextQuestionIndex,
                questionId: nextQuestion.id
            });
        }

        // Final step
        if (step === 'final') {
            return NextResponse.json({
                nextStep: 'complete',
                botMessage: "go touch grass. or don't. i'm just a bot with better taste than you.",
                choices: [],
                conversationHistory
            });
        }

        return NextResponse.json({ error: 'Invalid step or choice' }, { status: 400 });

    } catch (error: any) {
        console.error("Error in POST /api/get-roast-data:", error);
        return NextResponse.json(
            { error: error.message || 'my circuits fried trying to process your taste' },
            { status: 500 }
        );
    }
}