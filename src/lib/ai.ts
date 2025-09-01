import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const useOpenAI = !!openaiApiKey;

let openai: OpenAI | null = null;
let geminiModel: any = null;

if (useOpenAI) {
    openai = new OpenAI({ apiKey: openaiApiKey });
} else if (geminiApiKey) {
    const genAI = new GoogleGenerativeAI(geminiApiKey as string);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
} else {
    throw new Error("No AI API key found in environment variables.");
}

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
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }
    return cleaned;
};

async function callAI(prompt: string): Promise<string> {
    if (useOpenAI && openai) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 1024,
        });
        return completion.choices[0].message.content || "";
    } else if (geminiModel) {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    throw new Error("No AI model available.");
}

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

        const text = await callAI(prompt);
        const cleanedText = cleanJsonResponse(text);
        console.log("Cleaned text for scanning:", cleanedText);

        const parsed = JSON.parse(cleanedText);
        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error("Error generating scanning comments:", error);
        return tracksToScan.map((_, index) => [
            "scanning your atrocious taste...",
            "this is worse than i thought...",
            "finding some questionable life choices...",
            "what fresh hell is this...",
            "oh dear, this explains everything...",
            "your spotify wrapped must be embarrassing...",
            "i've seen middle schoolers with better taste...",
            "someone needs to stage an intervention..."
        ][index] || "scanning your music crimes...");
    }
}

export async function generateCompleteRoastExperience(roastData: any) {
    try {
        const cleanedData = cleanDataForAI(roastData);

        const prompt = `
you are "clanker", a sarcastic, hyper-observant music analyst bot. analyze this spotify data and create a complete interactive roasting experience.

personality: lowercase, dry, clinical yet devastating in your analysis

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
  "finalVerdict": "SPECIAL TYPEWRITER FORMAT - see below"
}

question types and structure:
- image_choice: choices should have {text, value, imageUrl} - use actual track album covers from their data
- mcq: choices should have {text, value} - 4 options max
- slider: choices should have {text, value} with 2 endpoint labels

make questions PERSONAL using their actual data:
1. shameless track choice (image_choice from top tracks)
2. genre excuse (mcq about their top genre)  
3. mainstream scale (slider about artist popularity)
4. listening patterns (mcq about recent plays)
5. artist obsession (mcq about top artist)
6. playlist personality (mcq)

for each question's responses object, include roast responses for every possible choice/value. for sliders, include responses for ranges like "0-25", "26-50", "51-75", "76-100".

IMPORTANT - finalVerdict format (typewriter style with backspacing):
output exactly in this beat-by-beat order, with each line as a separate line in the string:

initializing final analysis...
your taste is actually pretty goo (this will be backspaced)
your taste is actually pretty... predictable.
rewriting assessment...
pattern detected: [top artist 1], [top artist 2], [top artist 3]
emotional range: [short absurd roast, e.g. "somewhere between elevator music and breakup playlist for a plant"]
variety score: [percentage]% — dangerously low
most replayed track: [track] — [artist]
diagnosis: terminal case of [genre] dependency
side effects: [short roast about lifestyle/personality]
tracks raising the most concern:
  [track 1] — [artist]
  [track 2] — [artist]
  [track 3] — [artist]
  [track 4] — [artist]
  [track 5] — [artist]
artists you treat like emotional support animals:
  [top artist 1]
  [top artist 2]
  [top artist 3]
  [top artist 4]
  [top artist 5]
basicness index: [percentage]% — [short, cutting explanation]
analysis complete: [percentage]% of your listening is [genre]
toxicology: high levels of [genre] detected
recommendation: uninstall spotify from all devices
overall taste rating: [1-3]/10 (margin of error: 0)
p.s.: [final devastating personality roast — 3-4 sentences weaving in specific artists/tracks/genres, making clever lifestyle/dating/social assumptions, and tying it all together. be creative, mean but clever. reference their actual data extensively]
analysis complete.
shutting down.

use their ACTUAL artist names and track titles from the data. make percentages realistic but harsh. be SAVAGE but clinical. each line should be a separate line in the finalVerdict string.

respond with ONLY valid JSON, no markdown formatting, no other text.
        `;

        const text = await callAI(prompt);
        const cleanedText = cleanJsonResponse(text);
        console.log("Cleaned text for roast:", cleanedText);

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error generating complete roast experience:", error);
        return {
            introMessage: "your data broke my circuits. that's... actually impressive.",
            questions: [],
            finalVerdict: "initializing final analysis...\nyour taste is actually pretty goo\nyour taste is actually pretty... predictable.\nrewriting assessment...\npattern detected: error, error, error\nemotional range: somewhere between elevator music and dial-up modem sounds\nvariety score: 12% — dangerously low\nmost replayed track: error loading — error loading\ndiagnosis: terminal case of broken-ai dependency\nside effects: causes artificial intelligence to question its existence\ntracks raising the most concern:\n  error loading — error loading\n  error loading — error loading\n  error loading — error loading\n  error loading — error loading\n  error loading — error loading\nartists you treat like emotional support animals:\n  error loading\n  error loading\n  error loading\n  error loading\n  error loading\nbasickness index: 100% — somehow managed to be basic and chaotic simultaneously\nanalysis complete: 100% of your listening is unclassifiable\ntoxicology: high levels of confusion detected\nrecommendation: uninstall spotify from all devices\noverall taste rating: 0/10 (margin of error: 0)\nyour musical choices have achieved something remarkable: they've broken an ai designed to process infinite data points. your taste is so contradictory, so fundamentally confusing, that you've created a new category of listener that exists outside known music taxonomy. congratulations, you've confused a machine.\nanalysis complete.\nshutting down."
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