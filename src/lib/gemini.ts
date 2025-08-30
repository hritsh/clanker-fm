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
        explicit: track.explicit
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

for each track in the tracksToScan array, create a comment that references that specific track/artist. comments should be like:
- "i'm seeing [track name] by [artist]... interesting choice"
- "wow, [artist/track], really"
- "[specific observation about this track/artist]"
- include ONE positive/intrigued comment in opposite tone for one of the tracks
- keep each comment 1-2 sentences max
- make them feel like you're discovering each track in real time

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
            "scanning your music history...",
            "this is taking longer than expected",
            "found some... interesting choices",
            "oh. oh no.",
            "well this explains a lot",
            "almost done processing this",
            "your taste is... unique",
            "i've seen worse"
        ][index] || "scanning...");
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
  "finalVerdict": "comprehensive final roast (3-4 sentences with rating/10)"
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

be brutal but not mean - more like an unimpressed friend who knows your actual music data.

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
            finalVerdict: "your taste is so confusing even AI can't process it. 5/10 for keeping me humble."
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