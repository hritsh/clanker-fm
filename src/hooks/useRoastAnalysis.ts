import { useState } from 'react';
import { CacheManager, CACHE_KEYS } from '../lib/cache';

export interface ScannableItem {
    name: string;
    artist: string;
    imageUrl: string;
    comment: string;
}

export const useRoastAnalysis = () => {
    const [roastData, setRoastData] = useState<any>(null);
    const [roastExperience, setRoastExperience] = useState<any>(null);
    const [scanningComments, setScanningComments] = useState<string[]>([]);
    const [scanningCommentsLoaded, setScanningCommentsLoaded] = useState(false);
    const [scannableItems, setScannableItems] = useState<ScannableItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const defaultScanningComments = [
        "scanning your atrocious taste...",
        "this is worse than i thought...",
        "finding some questionable life choices...",
        "what fresh hell is this...",
        "oh dear, this explains everything...",
        "your spotify wrapped must be embarrassing...",
        "i've seen middle schoolers with better taste...",
        "someone needs to stage an intervention..."
    ];

    const startAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch Spotify data
            const spotifyResponse = await fetch('/api/get-roast-data');
            const spotifyData = await spotifyResponse.json();

            if (spotifyData.error) {
                setError(spotifyData.error);
                return { success: false };
            }

            setRoastData(spotifyData);

            // Prepare tracks for scanning
            const topTracks = spotifyData.topTracks?.items || [];
            const recentlyPlayed = spotifyData.recentlyPlayed?.items || [];

            const validItems = [...topTracks, ...recentlyPlayed.map((item: any) => item.track)]
                .map((item: any) => ({
                    name: item.name,
                    artist: item.artists?.[0]?.name || 'Unknown Artist',
                    imageUrl: item.album?.images?.[0]?.url || '',
                }))
                .filter(item => item.imageUrl);

            const uniqueItems = Array.from(
                new Map(validItems.map(item => [item.imageUrl, item])).values()
            );
            const shuffledItems = uniqueItems.sort(() => 0.5 - Math.random());
            const itemsToScan = shuffledItems.slice(0, 8);

            // First, get scanning comments quickly
            const scanningResponse = await fetch('/api/get-roast-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'scanning',
                    roastData: spotifyData,
                    tracksToScan: itemsToScan
                }),
            });

            const scanningData = await scanningResponse.json();
            setScanningComments(scanningData.scanningComments);
            setScanningCommentsLoaded(true);

            // Now start the roast analysis in the background while scanning comments show
            const roastResponse = fetch('/api/get-roast-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete_roast', roastData: spotifyData }),
            });

            // Return early so scanning can start immediately
            setIsLoading(false);

            // Handle roast response in the background
            roastResponse.then(async (response) => {
                const roastExperience = await response.json();
                setRoastExperience(roastExperience);

                // Cache the complete roast data for viewing later
                if (roastExperience) {
                    // Parse the verdict lines to extract detailed data
                    const verdictLines = roastExperience.finalVerdict?.split('\n') || [];

                    const findLine = (keyword: string) => {
                        return verdictLines.find((line: string) => line.toLowerCase().includes(keyword.toLowerCase())) || '';
                    };

                    const findNextNLines = (startKeyword: string, n: number) => {
                        const startIndex = verdictLines.findIndex((line: string) => line.toLowerCase().includes(startKeyword.toLowerCase()));
                        if (startIndex === -1) return [];
                        const items: string[] = [];
                        for (let i = startIndex + 1; i < verdictLines.length && items.length < n; i++) {
                            const line = verdictLines[i].trim();
                            if (!line || (line.includes(':') && !line.startsWith('"'))) break;
                            items.push(line.replace(/^[-•\s]+/, ''));
                        }
                        return items;
                    };

                    // Get album covers
                    const albumCovers = roastData?.topTracks?.items
                        ?.slice(0, 6)
                        ?.map((track: any) => track.album?.images?.[0]?.url)
                        ?.filter(Boolean) || [];

                    const roastCacheData = {
                        roastTitle: `clanker's brutal assessment`,
                        roastContent: roastExperience.introMessage || '',
                        verdict: roastExperience.finalVerdict || '',
                        score: roastExperience.score || Math.floor(Math.random() * 3) + 1,
                        timestamp: Date.now(),
                        questions: roastExperience.questions || [],
                        // Add parsed data for the export card
                        varietyScore: findLine('variety score:').match(/(\d+)%/)?.[1] || '0',
                        mostReplayed: findLine('most replayed track:').replace('most replayed track: ', ''),
                        diagnosis: findLine('diagnosis:').replace('diagnosis: ', ''),
                        basicnessIndex: findLine('basickness index:').match(/(\d+)%/)?.[1] || '0',
                        overallRating: findLine('overall taste rating:').match(/(\d+)\/10/)?.[1] || roastExperience.score?.toString() || '0',
                        tracksOfConcern: findNextNLines('tracks raising the most concern:', 5),
                        emotionalSupportArtists: findNextNLines('artists you treat like emotional support animals:', 5),
                        psLine: findLine('p.s.:').replace('p.s.:', '').trim(),
                        // Fix the album covers path - use spotifyData instead of roastData
                        albumCovers: spotifyData?.topTracks?.items
                            ?.slice(0, 6)
                            ?.map((track: any) => track.album?.images?.[0]?.url)
                            ?.filter(Boolean) || []
                    };
                    CacheManager.set(CACHE_KEYS.LAST_ROAST, roastCacheData, 7 * 24 * 60 * 60 * 1000); // Cache for 7 days
                }
            }).catch(error => {
                console.error('Roast analysis error:', error);
                setError("failed to complete roast analysis.");
            });

            return { success: true, itemsToScan, defaultComments: defaultScanningComments };

        } catch (error) {
            console.error('Analysis error:', error);
            setError("failed to fetch your spotify data.");
            return { success: false };
        }
    };

    return {
        roastData,
        roastExperience,
        scanningComments,
        scanningCommentsLoaded,
        scannableItems,
        setScannableItems,
        error,
        isLoading,
        startAnalysis,
        defaultScanningComments
    };
};