'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CacheManager, CACHE_KEYS } from '../../lib/cache';
import Loading from '../../components/Loading';
import { getUserByUsername } from '../../lib/database';

interface SimilarUser {
    user: {
        username: string;
        country: string;
        artists: string[];
        songs: string[];
        genres: string[];
    };
    compatibility: number;
    commonArtists: string[];
    commonSongs: string[];
    commonGenres: string[];
    description: string;
}

interface NeighborData {
    username: string;
    matches: SimilarUser[];
}

export default function NeighborsPage() {
    const { status } = useSession();
    const [username, setUsername] = useState('');
    const [neighborData, setNeighborData] = useState<NeighborData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [inputError, setInputError] = useState(false);

    // On mount, check for cached username and cached neighbors
    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
        const cachedUsername = CacheManager.get<string>('neighbor_username');
        if (cachedUsername) {
            setUsername(cachedUsername);
            // Try to load cached neighbors for this username
            const cachedNeighbors = CacheManager.get<NeighborData>(CACHE_KEYS.NEIGHBOR_MATCHES(cachedUsername));
            if (cachedNeighbors) {
                setNeighborData(cachedNeighbors);
                setHasSearched(true);
            }
        }
    }, [status]);

    const handleSearch = async () => {
        if (!username.trim()) {
            setError('clanker needs a username, obviously');
            setInputError(true);
            return;
        }

        // Check if username exists in mock data
        if (getUserByUsername(username.trim())) {
            setError('username already exists. pick another one, clanker insists');
            setInputError(true);
            return;
        }

        setLoading(true);
        setError(null);
        setInputError(false);
        setHasSearched(true);

        try {
            // Get user's music data from cache (from home page)
            const userStats = CacheManager.get<any>(CACHE_KEYS.USER_STATS);
            if (!userStats) {
                setError('clanker needs your music data first. visit the home page to load your stats');
                setLoading(false);
                return;
            }

            const userMusicData = {
                artists: userStats.topArtists.items.map((item: any) => item.name),
                songs: userStats.topTracks.items.map((item: any) => `${item.name} - ${item.artist}`),
                genres: userStats.topGenres.items.map((item: any) => item.name)
            };

            // Check cache before fetching
            const cacheKey = CACHE_KEYS.NEIGHBOR_MATCHES(username);
            const cachedNeighbors = CacheManager.get<NeighborData>(cacheKey);
            if (cachedNeighbors) {
                setNeighborData(cachedNeighbors);
                CacheManager.set('neighbor_username', username);
                setLoading(false);
                return;
            }

            const response = await fetch('/api/neighbors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, userMusicData }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `clanker's algorithm failed`);
            }

            setNeighborData(data); // Do NOT cache here, cache after displaying
            CacheManager.set('neighbor_username', username); // Cache the username
        } catch (err) {
            setError(err instanceof Error ? err.message : 'an error occurred');
            setNeighborData(null);
        } finally {
            setLoading(false);
        }
    };

    // Cache neighbor data after showing results
    useEffect(() => {
        if (neighborData && hasSearched && username) {
            const cacheKey = CACHE_KEYS.NEIGHBOR_MATCHES(username);
            CacheManager.set(cacheKey, neighborData);
        }
    }, [neighborData, hasSearched, username]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto pt-20 pb-24">
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">NEIGHBORS.EXE</span>
                    </div>
                    <div className="p-4">
                        <h1 className="text-3xl font-bold text-terminal-primary mb-8">find people as delusional as you</h1>
                        <hr className="terminal-hr" />

                        {/* Username Input - hide after results */}
                        {!neighborData && (
                            <div className="mt-8">
                                <div className={`terminal-border p-6 ${inputError ? 'border-red-500' : ''}`}>
                                    <h2 className="text-xl font-bold text-terminal-primary mb-4" title="clanker doubts this will go well">find your music twin</h2>
                                    <p className="text-terminal-muted mb-4">
                                        enter a username to see who has similar questionable taste to yours
                                    </p>
                                    <p className="text-terminal-muted text-sm mb-4">
                                        clanker will compare your stats with his database of equally delusional users
                                    </p>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                                setInputError(false);
                                                setError(null);
                                            }}
                                            onKeyPress={handleKeyPress}
                                            placeholder="pick any username (clanker will check availability)"
                                            className={`flex-1 px-4 py-2 bg-background border ${inputError ? 'border-red-500' : 'border-terminal-primary'} text-foreground rounded focus:outline-none focus:ring-2 focus:ring-terminal-primary`}
                                            disabled={loading}
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={loading || !username.trim()}
                                            className="px-6 py-2 bg-terminal-primary text-background rounded hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                            title="clanker will judge accordingly"
                                        >
                                            {loading ? 'scanning...' : 'find victims'}
                                        </button>
                                    </div>
                                    {inputError && (
                                        <div className="mt-2 text-red-400 text-sm">
                                            username already exists. pick another one, clanker insists
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="mt-8">
                                <Loading />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-8 terminal-border p-4 bg-red-900/20">
                                <p className="text-red-400">clanker says: {error}</p>
                            </div>
                        )}

                        {/* Results */}
                        {neighborData && !loading && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-terminal-primary mb-6" title="prepare for disappointment">
                                    victims with similar taste to {neighborData.username}
                                </h2>
                                {neighborData.matches.length === 0 ? (
                                    <div className="terminal-border p-6 text-center">
                                        <p className="text-terminal-muted">no one else has taste this questionable. congrats, you&apos;re unique</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {neighborData.matches.map((match, index) => (
                                            <div
                                                key={index}
                                                className="relative terminal-border border-2 border-terminal-primary p-6"
                                            >
                                                {/* Rank Square */}
                                                <span
                                                    className={`
                                                        absolute -top-1 -left-1
                                                        text-terminal-primary text-s font-semibold select-none
                                                        border border-terminal-primary
                                                        bg-background
                                                        w-8 h-8 flex items-center justify-center
                                                        opacity-90
                                                        rounded-none
                                                `}
                                                >
                                                    #{index + 1}
                                                </span>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">{match.user.country}</span>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-terminal-primary">
                                                                {match.user.username}
                                                            </h3>
                                                            <p className="text-terminal-muted">{match.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-terminal-primary">
                                                            {match.compatibility}%
                                                        </div>
                                                        <div className="text-terminal-muted text-sm">compatible</div>
                                                    </div>
                                                </div>

                                                {/* Common items */}
                                                <div className="grid md:grid-cols-3 gap-4 mt-4">
                                                    {match.commonArtists.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-foreground mb-2">mutual bad taste</h4>
                                                            <div className="space-y-1">
                                                                {match.commonArtists.slice(0, 3).map((artist, i) => (
                                                                    <div key={i} className="text-terminal-muted text-sm">
                                                                        • {artist}
                                                                    </div>
                                                                ))}
                                                                {match.commonArtists.length > 3 && (
                                                                    <div className="text-terminal-muted text-sm">
                                                                        + {match.commonArtists.length - 3} more embarrassments
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {match.commonGenres.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-foreground mb-2">shared delusions</h4>
                                                            <div className="space-y-1">
                                                                {match.commonGenres.slice(0, 3).map((genre, i) => (
                                                                    <div key={i} className="text-terminal-muted text-sm capitalize">
                                                                        • {genre}
                                                                    </div>
                                                                ))}
                                                                {match.commonGenres.length > 3 && (
                                                                    <div className="text-terminal-muted text-sm">
                                                                        + {match.commonGenres.length - 3} more questionable choices
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {match.commonSongs.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-foreground mb-2">songs you both ruined</h4>
                                                            <div className="space-y-1">
                                                                {match.commonSongs.slice(0, 2).map((song, i) => (
                                                                    <div key={i} className="text-terminal-muted text-sm">
                                                                        • {song.length > 30 ? song.substring(0, 30) + '...' : song}
                                                                    </div>
                                                                ))}
                                                                {match.commonSongs.length > 2 && (
                                                                    <div className="text-terminal-muted text-sm">
                                                                        + {match.commonSongs.length - 2} more overplayed tracks
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}