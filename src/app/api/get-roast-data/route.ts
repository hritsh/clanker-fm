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
    generateRoast,
    generateIntroMessage,
    generateSnarkyComment,
    generateFinalRoast
} from '../../../lib/gemini';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = session.accessToken as string;

    try {
        // Fetch all required data from Spotify
        const userProfilePromise = getUserProfile(accessToken);
        const topArtistsPromise = getTopItems(accessToken, 'artists', 'medium_term', 10);
        const topTracksPromise = getTopItems(accessToken, 'tracks', 'medium_term', 20);
        const recentlyPlayedPromise = getRecentlyPlayed(accessToken, 20);
        const savedTracksPromise = getSavedTracks(accessToken, 20);

        const [userProfile, topArtists, topTracks, recentlyPlayed, savedTracks] =
            await Promise.all([
                userProfilePromise,
                topArtistsPromise,
                topTracksPromise,
                recentlyPlayedPromise,
                savedTracksPromise
            ]);

        // Package the data for the client
        const roastData = {
            userProfile,
            topArtists,
            topTracks,
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
    const body = await request.json();
    const { step, choice, roastData, history = [], questionQueue = [], trackName, artistName } = body;

    // For handling specific track comments in the scanner
    if (trackName && artistName) {
        const comment = await generateSnarkyComment(trackName, artistName);
        return NextResponse.json({ comment });
    }

    try {
        // Initial welcome message
        if (step === 'ready' && choice === 'start') {
            const introMessage = await generateIntroMessage();
            return NextResponse.json({
                nextStep: 'typing_intro',
                botMessage: introMessage,
                choices: [],
            });
        }

        // Start the main sequence after intro
        if (step === 'typing_intro' && choice === 'continue') {
            // Generate question types based on data availability
            const questionTypes = ['image_choice', 'mcq', 'slider'];
            const shuffledQuestions = questionTypes.sort(() => 0.5 - Math.random());

            // Setup for first question - create an image choice question
            const topTracks = roastData.topTracks?.items || [];
            if (topTracks.length >= 4) {
                const choices = topTracks.slice(0, 4).map((track: any) => ({
                    text: `${track.name} by ${track.artists[0].name}`,
                    value: track.name,
                    imageUrl: track.album.images[0]?.url || ''
                }));

                return NextResponse.json({
                    type: 'image_choice',
                    nextStep: 'handle_question',
                    botMessage: "Looking at your top tracks... which one are you most embarrassed about?",
                    choices,
                    questionQueue: shuffledQuestions.slice(1) // Remove the first question type
                });
            }

            // Fallback if no tracks available
            return NextResponse.json({
                nextStep: 'final',
                botMessage: "Your listening history is so empty, I can't even roast you properly.",
                choices: [{ text: "That's fair", value: "end" }]
            });
        }

        // Handle responses to questions
        if (step === 'handle_question') {
            // Generate response to user's choice
            const roastResponse = await generateRoast({
                choice,
                questionType: body.type,
                roastData: {
                    topArtist: roastData.topArtists?.items[0],
                    topTrack: roastData.topTracks?.items[0]
                }
            });

            // If there are no more questions, move to final roast
            if (!questionQueue || questionQueue.length === 0) {
                const finalRoast = await generateFinalRoast(roastData, history);
                return NextResponse.json({
                    nextStep: 'final',
                    botMessage: `${roastResponse}\n\n${finalRoast}`,
                    choices: [{ text: "I need some ice for this burn", value: "end" }]
                });
            }

            // Create next question based on queue
            const nextQuestionType = questionQueue[0];
            const remainingQueue = questionQueue.slice(1);

            let nextQuestion: any = {
                type: nextQuestionType,
                nextStep: 'handle_question',
                botMessage: "Default question",
                choices: []
            };

            if (nextQuestionType === 'slider') {
                const topArtist = roastData.topArtists?.items[0];
                nextQuestion = {
                    type: 'slider',
                    nextStep: 'handle_question',
                    botMessage: `So you listen to ${topArtist?.name || 'music'} a lot. On a scale of 0 to 100, how deep does your fandom *really* go?`,
                    choices: [
                        { text: `0: Just know the hits`, value: '0' },
                        { text: `100: Have their logo tattooed`, value: '100' },
                    ]
                };
            } else if (nextQuestionType === 'mcq') {
                const randomTrackIndex = Math.floor(Math.random() * Math.min(5, roastData.topTracks?.items.length || 1));
                const track = roastData.topTracks?.items[randomTrackIndex];
                nextQuestion = {
                    type: 'mcq',
                    nextStep: 'handle_question',
                    botMessage: `You listen to '${track?.name || 'this song'}' by ${track?.artists[0]?.name || 'someone'} a lot. What's the usual vibe?`,
                    choices: [
                        { text: "Staring dramatically out a rainy window.", value: "A" },
                        { text: "The main character in my own music video.", value: "B" },
                        { text: "It's for my 'deep thoughts' playlist.", value: "C" },
                        { text: "I just like the beat, I swear.", value: "D" },
                    ]
                };
            }

            return NextResponse.json({
                ...nextQuestion,
                botMessage: `${roastResponse}\n\n${nextQuestion.botMessage}`,
                questionQueue: remainingQueue
            });
        }

        // Handle final message
        if (step === 'final') {
            return NextResponse.json({
                nextStep: 'complete',
                botMessage: "Now go reevaluate your life choices... or at least your playlists.",
                choices: []
            });
        }

        return NextResponse.json({ error: 'Invalid step or choice' }, { status: 400 });

    } catch (error: any) {
        console.error("Error in POST /api/get-roast-data:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to process roast step.' },
            { status: 500 }
        );
    }
}