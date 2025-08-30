import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Clean and format Spotify data for the AI
const cleanDataForAI = (roastData: any) => {
    const { topArtists, topTracks, recentlyPlayed, userProfile, topGenres } = roastData;

    const simplifiedArtists = topArtists?.items?.slice(0, 8).map((artist: any) => ({
        name: artist.name,
        genres: artist.genres.slice(0, 3),
        popularity: artist.popularity,
        followers: artist.followers.total
    })) || [];

    const simplifiedTracks = topTracks?.items?.slice(0, 8).map((track: any) => ({
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        popularity: track.popularity,
        explicit: track.explicit
    })) || [];

    const recentTracks = recentlyPlayed?.items?.slice(0, 5).map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists[0].name,
        played_at: item.played_at
    })) || [];

    return {
        topArtists: simplifiedArtists,
        topTracks: simplifiedTracks,
        topGenres: topGenres || [],
        recentTracks,
        userFollowers: userProfile?.followers?.total || 0
    };
};

export async function generateContextualRoast(data: any) {
    try {
        const cleanedData = cleanDataForAI(data.roastData);
        const { questionType, userChoice, conversationHistory } = data;

        let contextPrompt = '';

        // Create context based on question type and previous answers
        switch (questionType) {
            case 'track_choice':
                const [trackName, artistName] = userChoice.split('|');
                contextPrompt = `user chose "${trackName}" by ${artistName} as their shameless track`;
                break;
            case 'genre_excuse':
                contextPrompt = `user's excuse for their top genre: "${userChoice}"`;
                break;
            case 'mainstream_scale':
                contextPrompt = `user rated themselves ${userChoice}/100 on mainstream scale`;
                break;
            case 'listening_mood':
                contextPrompt = `user's recent listening mood: "${userChoice}"`;
                break;
            case 'artist_loyalty':
                contextPrompt = `user's relationship with their top artist: "${userChoice}"`;
                break;
            case 'playlist_vibe':
                contextPrompt = `user describes their playlist as: "${userChoice}"`;
                break;
            default:
                contextPrompt = `user answered: "${userChoice}"`;
        }

        const prompt = `
you are "clanker", a music taste roasting bot. personality:
- always lowercase (except acronyms like EDM, R&B)
- short, dry observations (1-2 sentences max)
- self-aware that you're just a bot
- observational humor, not cruel
- occasionally give backhanded compliments

context: ${contextPrompt}

spotify data: ${JSON.stringify(cleanedData)}

conversation so far: ${JSON.stringify(conversationHistory)}

roast their choice in context of their overall taste and previous answers. be specific and reference their actual data when possible.

examples of your style:
"bold choice. explains the experimental hip hop phase."
"${cleanedData.topArtists[0]?.name} has ${cleanedData.topArtists[0]?.followers?.toLocaleString()} followers. you're not special."
"statistically, this tracks with your other questionable decisions."

respond as plain text, no quotes.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating contextual roast:", error);
        return "your choice broke my circuits. impressive, in the worst way.";
    }
}

export async function generateIntroMessage() {
    const messages = [
        "alright, let's see what you've subjected your ears to.",
        "opening your playlist. lowering my expectations.",
        "spotify gave me your data. i wish they hadn't.",
        "time to judge. this won't take long.",
        "analyzing your listening history... oh no...",
        "peeking at your stats while my algorithm judges you.",
        "about to roast your spotify data. you asked for this."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

export async function generateFinalVerdict(roastData: any, conversationHistory: any[]) {
    try {
        const cleanedData = cleanDataForAI(roastData);

        const prompt = `
you are "clanker", giving a final verdict on someone's music taste.

their spotify data: ${JSON.stringify(cleanedData)}
full conversation: ${JSON.stringify(conversationHistory)}

give a comprehensive final roast (3-4 sentences) that:
- summarizes their taste based on the conversation
- references specific choices they made
- includes a rating out of 10 (be realistic, 3-8 range)
- ends with a signature clanker self-aware comment

stay lowercase and dry. be brutal but not mean.

respond as plain text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating final verdict:", error);
        return "your taste is so confusing even AI can't process it. 5/10 for keeping me humble. i need a reboot after this.";
    }
}

export async function generateSnarkyComment(trackName: string, artistName: string) {
    try {
        const prompt = `
you are "clanker", a dry music roasting bot. generate one short sentence about: "${trackName}" by ${artistName}.

style: lowercase, observational, self-aware, dry humor

examples:
"bold choice. for a 2014 tumblr blog."
"ah yes, the soundtrack to your main character syndrome."
"this again. of course."

respond as plain text, no quotes.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating snarky comment:", error);
        return "this one again. of course.";
    }
}