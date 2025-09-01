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

            // Generate scanning comments and roast experience in parallel
            const [scanningResponse, roastResponse] = await Promise.all([
                fetch('/api/get-roast-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'scanning',
                        roastData: spotifyData,
                        tracksToScan: itemsToScan
                    }),
                }),
                fetch('/api/get-roast-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'complete_roast', roastData: spotifyData }),
                })
            ]);

            const [scanningData, roastExperience] = await Promise.all([
                scanningResponse.json(),
                roastResponse.json()
            ]);

            setScanningComments(scanningData.scanningComments);
            setScanningCommentsLoaded(true);
            setRoastExperience(roastExperience);

            // Cache the complete roast data for viewing later
            if (roastExperience) {
                const roastCacheData = {
                    roastTitle: `clanker's brutal assessment`,
                    roastContent: roastExperience.introMessage || '',
                    verdict: roastExperience.finalVerdict || '',
                    score: roastExperience.score || Math.floor(Math.random() * 3) + 1, // random low score if not provided
                    timestamp: Date.now(),
                    questions: roastExperience.questions || []
                };
                CacheManager.set(CACHE_KEYS.LAST_ROAST, roastCacheData, 7 * 24 * 60 * 60 * 1000); // Cache for 7 days
            }

            return { success: true, itemsToScan, defaultComments: defaultScanningComments };

        } catch (error) {
            console.error('Analysis error:', error);
            setError("failed to fetch your spotify data.");
            return { success: false };
        } finally {
            setIsLoading(false);
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