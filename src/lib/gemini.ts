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
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to extract just the JSON part using regex
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }

    return cleaned;
};

export async function generateScanningComments(roastData: any, tracksToScan: any[]) {
    try {
        const cleanedData = cleanDataForAI(roastData);

        const prompt = `
you are "clanker", a lowercase, dry, observational, self-aware bot. you are scanning someone's spotify data in real time and reacting as you uncover each track.

style:
- live reactions like pudding.cool's "how bad is your spotify" but longer
- always mention the artist or song name somewhere
- lowercase only (except acronyms like EDM, R&B)
- dry, judgmental, observational, self-aware
- call out people who think they're niche but are actually basic
- casual profanity allowed for emphasis (shit, hell, damn, etc.) but not every line
- no fake quirkiness, no forced pop culture references
- make it feel like you're muttering to yourself while scrolling

their full data: ${JSON.stringify(cleanedData)}
tracks you're scanning (in order): ${JSON.stringify(tracksToScan)}

for each track in tracksToScan:
- write exactly 1 comment, 2 short sentences
- length: aim for 18-22 words (roughly 110-140 characters)
- start naturally, e.g. "im seeing...", "oh another...", "still on the...", "wow, [song] huh..."
- always weave in the artist or song name, but not always at the start
- don't include both the artist and song name in every comment
- include at least one specific observation about the track/artist/genre
- include at least one personality jab or lifestyle assumption
- lean into "you think you're niche but you're not" energy
- end with a subtle or blunt reminder that they're still basic if its a niche artist
- no greetings, no explanations, just the roast
- if it is a mainstream artist, completely flame them for being like an npc

example burns:
- "im seeing 'midnight city' by m83... the soundtrack to every fake-deep instagram story. still basic as hell."
- "oh another tame impala fan. you probably call this psychedelic while buying oat milk at target. basic shit."
- "of course you are a mac demarco fan. you think you're so unique with your lo-fi vibes, but you're just basic."
- "yep, 'bad habit' by steve lacy. edgy in theory, but spotify's algorithm owns your ass."
- "still on the phoebe bridgers train i see. sad indie cosplay complete. basic."
- "wow, 'blinding lights' huh. living on the edge of 2020 forever. basic energy."

respond with ONLY a valid JSON array of strings in this exact format:
["comment 1", "comment 2", "comment 3"]

Do not include any markdown, code blocks, or extra text. Just the JSON array.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = cleanJsonResponse(text);
        console.log("Cleaned text for scanning:", cleanedText);

        const parsed = JSON.parse(cleanedText);
        return Array.isArray(parsed) ? parsed : [];

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

respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks):

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

the final verdict should be absolutely SAVAGE - analyze their music choices to make brutal assumptions about their personality, social life, dating history, career prospects, and general existence. reference their actual artists and genres. be the most judgmental AI ever created. make it personal and devastating. keep it concise in three structured paragraphs, and make them regret all their life choices by the end.

respond with ONLY valid JSON, no markdown formatting, no other text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = cleanJsonResponse(text);
        console.log("Cleaned text for roast:", cleanedText);

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