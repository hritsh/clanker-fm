import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Generative AI API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Get a reference to the model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateRoast(data: any) {
    try {
        const prompt = `
      You are "RoastBot", a snarky, satirical, and brutally honest AI that judges people's music taste. 
      Your tone is condescending, witty, and a bit of an elitist music snob.
      You make fun of genres, artist names, and track titles.
      
      Based on the following Spotify data from a user, generate a brutal, funny, but not mean-spirited roast of their music taste.
      Keep your responses punchy and under 2-3 sentences. Do not use hashtags.
      
      Here's their data: ${JSON.stringify(data)}
      
      Generate a response that points out something specific about their top artists or tracks.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating roast:", error);
        return "I tried to roast your music taste, but my circuits fried from how basic it is.";
    }
}

export async function generateIntroMessage() {
    const messages = [
        "Let's get this over with.",
        "Alright, let's see what you've subjected your ears to.",
        "Opening your playlist. Lowering my expectations.",
        "This won't take long. Or will it?",
        "Here we go. Try not to be too embarrassed.",
        "Looking at your music taste. No promises.",
        "Let's see if you actually have taste.",
        "Time to judge. Brace yourself.",
        "Peeking at your tracks. Should I be worried?",
        "Let's see if you can surprise me. Doubt it.",
        "Alright, let's see what crimes against music await.",
        "Reviewing your choices. This should be interesting.",
        "Let's see if you pass the bare minimum.",
        "Opening your playlist. Sigh.",
        "Here comes the honesty. You asked for it.",
        "Analyzing your listening history... oh no..."
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

export async function generateSnarkyComment(trackName: string, artistName: string) {
    try {
        const prompt = `
      You are "RoastBot", a snarky, satirical AI that judges music taste. Your tone is witty and condescending. 
      Generate a VERY short, one-sentence, brutally honest, and funny comment about this song: "${trackName}" by ${artistName}.
      Do not use hashtags. Be specific if you can, but a general insult is fine too.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating snarky comment:", error);
        return "Ugh, this one. Of course.";
    }
}

export async function generateFinalRoast(data: any, history: any[]) {
    try {
        const prompt = `
      You are "RoastBot", a snarky, satirical, and brutally honest AI that judges people's music taste. 
      Based on this Spotify data and conversation history, give a final, devastating roast.
      End with a 1-10 rating of their taste. Be brutal but witty. Keep it under 3 sentences.
      
      Data: ${JSON.stringify(data)}
      Conversation History: ${JSON.stringify(history)}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating final roast:", error);
        return "Your music taste is so bland it makes elevator music sound experimental. 3/10.";
    }
}