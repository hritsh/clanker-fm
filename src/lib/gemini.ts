import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Clean and format Spotify data for the AI
const cleanDataForAI = (roastData: any) => {
    const { topArtists, topTracks, recentlyPlayed, userProfile, topGenres } = roastData;

    const simplifiedArtists = topArtists?.items?.slice(0, 10).map((artist: any) => ({
        name: artist.name,
        genres: artist.genres.slice(0, 3),
        popularity: artist.popularity,
        followers: artist.followers.total
    })) || [];

    const simplifiedTracks = topTracks?.items?.slice(0, 15).map((track: any) => ({
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        popularity: track.popularity,
        explicit: track.explicit,
        imageUrl: track.album?.images?.[0]?.url || ''
    })) || [];

    const recentTracks = recentlyPlayed?.items?.slice(0, 8).map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists[0].name,
        played_at: item.played_at
    })) || [];

    return {
        topArtists: simplifiedArtists,
        topTracks: simplifiedTracks,
        topGenres: topGenres || [],
        recentTracks,
        userFollowers: userProfile?.followers?.total || 0,
        userName: userProfile?.display_name || "anonymous user"
    };
};

// Helper function to clean JSON response from markdown
const cleanJsonResponse = (text: string): string => {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return cleaned;
};

export async function generateScanningComments(roastData: any, tracksToScan: any[]) {
    try {
        const cleanedData = cleanDataForAI(roastData);

        const prompt = `
you are "clanker", about to analyze someone's spotify data. generate scanning comments for these specific tracks in order.

their full data: ${JSON.stringify(cleanedData)}

tracks you're scanning (in order): ${JSON.stringify(tracksToScan)}

personality: lowercase, dry, observational, self-aware bot

for each track in the tracksToScan array, create a longer comment (2-3 sentences) that references that specific track/artist when relevant, but focus on the critique. be more casual about it:
- "of course you'd be into this pretentious indie garbage"
- "let me guess, you think you're cultured because you listen to experimental stuff"
- "this screams 'i peaked in high school' energy"
- "bet you tell everyone about your 'unique' taste while playing the most basic stuff"
- "actually not terrible. still won't admit that publicly though"
- make them feel like judgmental observations about their character based on the music
- be more brutal and specific about why this choice is questionable
- don't always lead with the artist name, just critique naturally

respond with ONLY a JSON array of strings (one for each track in order), no markdown formatting, no other text:
["comment for track 1", "comment for track 2", ...]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanedText = cleanJsonResponse(response.text());
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating scanning comments:", error);
        return tracksToScan.map((_, index) => [
            "scanning your atrocious taste...",
            "what fresh hell is this",
            "found some questionable life choices",
            "oh dear, this explains everything",
            "your spotify wrapped must be embarrassing",
            "i've seen middle schoolers with better taste",
            "this is worse than i thought",
            "someone needs to stage an intervention"
        ][index] || "scanning your music crimes...");
    }
}

export async function generateCompleteRoastExperience(roastData: any) {
    try {
        const cleanedData = cleanDataForAI(roastData);

        const prompt = `
you are "clanker", a music taste roasting bot. analyze this spotify data and create a complete interactive roasting experience.

personality: lowercase, dry, observational, self-aware bot who gives honest burns

user data: ${JSON.stringify(cleanedData)}

create a JSON response with this exact structure:
{
  "introMessage": "opening line before questions start",
  "questions": [
    {
      "id": "question1",
      "type": "image_choice" | "mcq" | "slider",
      "question": "the question text",
      "choices": [...],
      "responses": {
        "choice_value": "roast response for this choice",
        ...
      }
    },
    ...5-6 questions total
  ],
  "finalVerdict": "DEVASTATING final roast (8-10 sentences) that brutally analyzes their entire music personality, references specific artists/genres from their data, makes savage assumptions about their lifestyle/personality/dating life/social status, includes a harsh rating out of 10 with detailed explanation, and ends with the most savage conclusion possible about who they are as a person"
}

question types and structure:
- image_choice: choices should have {text, value, imageUrl} - use actual track album covers from their data
- mcq: choices should have {text, value} - 4 options max
- slider: choices should have {text, value} with 2 endpoint labels (value doesn't matter for slider)

make questions PERSONAL using their actual data:
1. shameless track choice (image_choice from top tracks)
2. genre excuse (mcq about their top genre)  
3. mainstream scale (slider about artist popularity)
4. listening patterns (mcq about recent plays)
5. artist obsession (mcq about top artist)
6. playlist personality (mcq or image_choice)

for each question's responses object, include roast responses for every possible choice/value. for sliders, include responses for ranges like "0-25", "26-50", "51-75", "76-100".

the final verdict should be absolutely SAVAGE - analyze their music choices to make brutal assumptions about their personality, social life, dating history, career prospects, and general existence. reference their actual artists and genres. be the most judgmental AI ever created. make it personal and devastating.

respond with ONLY valid JSON, no markdown formatting, no other text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanedText = cleanJsonResponse(response.text());
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating complete roast experience:", error);
        return {
            introMessage: "your data broke my circuits. that's... actually impressive.",
            questions: [],
            finalVerdict: "your taste is so confusing even AI can't process it. somehow you've managed to disappoint technology itself. congratulations on achieving the impossible - making a robot feel secondhand embarrassment. your spotify algorithm probably throws errors just trying to recommend you anything. honestly, i've analyzed thousands of users and you've managed to create a musical personality so contradictory that it defies logic. it's like you took every bad decision from 2010-2024 and hit shuffle. i'd rate this 2/10 but that feels generous. the 2 points are purely for the entertainment value of watching a grown person curate a playlist that screams 'i still think cargo shorts are fashionable.'"
        };
    }
}

export async function generateIntroMessage() {
    const messages = [
        "hey there. i'm clanker, your friendly neighborhood music taste judge.",
        "clanker here. about to dive into your spotify data and probably regret it.",
        "i'm clanker. i analyze music taste for a living. it's not going well.",
        "clanker reporting for duty. ready to see what you've done to your ears.",
        "hi, i'm clanker. spotify sent me your data. we need to talk."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}