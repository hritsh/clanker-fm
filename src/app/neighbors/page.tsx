'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CacheManager, CACHE_KEYS } from '../../lib/cache';
import LoadingNeighbors from '../../components/Loading';
import Image from 'next/image';

interface SimilarUser {
    user: {
        id?: string; // Spotify user ID (optional for mock users)
        username: string;
        country: string;
        artists: string[];
        songs: string[];
        genres: string[];
        image?: string | null;
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
    const { data: session, status } = useSession();
    const [neighborData, setNeighborData] = useState<NeighborData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        if (status === 'authenticated') {
            loadNeighbors();
        }
    }, [status]);

    const loadNeighbors = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check cache first
            const cachedNeighbors = CacheManager.get<NeighborData>(CACHE_KEYS.NEIGHBOR_MATCHES('current_user'));
            if (cachedNeighbors) {
                setNeighborData(cachedNeighbors);
                setLoading(false);
                return;
            }

            const response = await fetch('/api/neighbors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), // Empty body since we're getting data from session
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `clanker's algorithm failed`);
            }

            setNeighborData(data);
            // Cache the results
            CacheManager.set(CACHE_KEYS.NEIGHBOR_MATCHES('current_user'), data, 30 * 60 * 1000); // Cache for 30 minutes

        } catch (err) {
            setError(err instanceof Error ? err.message : 'an error occurred');
            setNeighborData(null);
        } finally {
            setLoading(false);
        }
    };

    const getSpotifyProfileUrl = (userId?: string) => {
        return userId ? `https://open.spotify.com/user/${userId}` : null;
    };

    const getCompatibilityColor = (compatibility: number) => {
        if (compatibility >= 80) return 'text-green-400';
        if (compatibility >= 60) return 'text-yellow-400';
        if (compatibility >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getCompatibilityLabel = (compatibility: number) => {
        if (compatibility >= 90) return 'soul mate';
        if (compatibility >= 80) return 'very compatible';
        if (compatibility >= 70) return 'quite compatible';
        if (compatibility >= 60) return 'somewhat compatible';
        if (compatibility >= 40) return 'barely compatible';
        return 'questionable match';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-5xl mx-auto pt-20 pb-24">
                    <div className="terminal-window">
                        <div className="terminal-titlebar">
                            <span className="text-terminal-primary text-sm">NEIGHBORS.EXE</span>
                        </div>
                        <div className="p-6">
                            <h1 className="text-3xl font-bold text-terminal-primary mb-8">find people as delusional as you</h1>
                            <hr className="terminal-hr" />
                            <div className="mt-8">
                                <LoadingNeighbors />
                            </div>
                        </div>
                    </div>
                </div>
                <NavTabs />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto pt-20 pb-24">
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">NEIGHBORS.EXE</span>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-terminal-primary">people as delusional as you</h1>
                        </div>
                        <hr className="terminal-hr" />

                        {/* Error */}
                        {error && (
                            <div className="mt-8 terminal-border p-4 bg-red-900/20 border-red-500">
                                <p className="text-red-400">clanker says: {error}</p>
                            </div>
                        )}

                        {/* Results */}
                        {neighborData && !loading && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-secondary mb-6" title="prepare for disappointment">
                                    victims with similar taste to yours ({neighborData.matches.length} found)
                                </h2>
                                {neighborData.matches.length === 0 ? (
                                    <div className="terminal-border p-8 text-center bg-terminal-primary/5">
                                        <div className="text-6xl mb-4">🏜️</div>
                                        <p className="text-terminal-muted text-lg">no one else has taste this questionable. congrats, you&apos;re unique</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {neighborData.matches.map((match, index) => {
                                            const profileUrl = getSpotifyProfileUrl(match.user.id);
                                            const isRealUser = !!match.user.id;

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative terminal-border border-2 border-terminal-primary p-6 hover:bg-terminal-primary/5 transition-colors group"
                                                >
                                                    {/* Rank Badge */}
                                                    <span
                                                        className={`
                                                            absolute -top-2 -left-2
                                                            text-secondary text-s font-semibold select-none
                                                            border border-terminal-primary
                                                            bg-background
                                                            w-8 h-8 flex items-center justify-center
                                                            opacity-90
                                                            rounded-none
                                                        `}
                                                    >
                                                        #{index + 1}
                                                    </span>

                                                    <div className="flex items-start gap-4 mb-6">
                                                        {/* Profile Image */}
                                                        <div className="flex-shrink-0">
                                                            {isRealUser && match.user.image ? (
                                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-terminal-primary">
                                                                    <Image
                                                                        src={match.user.image}
                                                                        alt={`${match.user.username}'s profile`}
                                                                        width={64}
                                                                        height={64}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-16 h-16 rounded-full bg-terminal-primary/20 border-2 border-terminal-primary flex items-center justify-center">
                                                                    <span className="text-terminal-primary text-xl">
                                                                        👤
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* User Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-2xl">{match.user.country}</span>
                                                                <div className="min-w-0 flex-1">
                                                                    {profileUrl ? (
                                                                        <a
                                                                            href={profileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xl font-bold text-terminal-primary hover:text-terminal-primary/80 underline truncate block"
                                                                            title="view their spotify profile"
                                                                        >
                                                                            {match.user.username}
                                                                        </a>
                                                                    ) : (
                                                                        <h3 className="text-xl font-bold text-terminal-primary truncate">
                                                                            {match.user.username}
                                                                        </h3>
                                                                    )}
                                                                    <p className="text-terminal-muted text-sm">{match.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Compatibility Score */}
                                                        <div className="text-right flex-shrink-0">
                                                            <div className={`text-3xl font-bold ${getCompatibilityColor(match.compatibility)}`}>
                                                                {match.compatibility}%
                                                            </div>
                                                            <div className="text-terminal-muted text-xs">
                                                                {getCompatibilityLabel(match.compatibility)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Common items */}
                                                    <div className="grid md:grid-cols-3 gap-6">
                                                        {match.commonArtists.length > 0 && (
                                                            <div className="bg-terminal-primary/10 p-4 rounded border border-terminal-primary/30">
                                                                <h4 className="font-semibold text-terminal-primary mb-3 flex items-center gap-2">
                                                                    🎤 mutual bad taste
                                                                    <span className="text-xs bg-terminal-primary/20 px-2 py-1 rounded">
                                                                        {match.commonArtists.length}
                                                                    </span>
                                                                </h4>
                                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                    {match.commonArtists.slice(0, 5).map((artist, i) => (
                                                                        <div key={i} className="text-secondary text-sm flex items-center gap-2">
                                                                            <span className="text-terminal-primary">•</span>
                                                                            <span className="truncate">{artist}</span>
                                                                        </div>
                                                                    ))}
                                                                    {match.commonArtists.length > 5 && (
                                                                        <div className="text-terminal-muted text-xs italic">
                                                                            +{match.commonArtists.length - 5} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {match.commonGenres.length > 0 && (
                                                            <div className="bg-terminal-primary/10 p-4 rounded border border-terminal-primary/30">
                                                                <h4 className="font-semibold text-terminal-primary mb-3 flex items-center gap-2">
                                                                    🎵 shared delusions
                                                                    <span className="text-xs bg-terminal-primary/20 px-2 py-1 rounded">
                                                                        {match.commonGenres.length}
                                                                    </span>
                                                                </h4>
                                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                    {match.commonGenres.slice(0, 5).map((genre, i) => (
                                                                        <div key={i} className="text-secondary text-sm capitalize flex items-center gap-2">
                                                                            <span className="text-terminal-primary">•</span>
                                                                            <span className="truncate">{genre}</span>
                                                                        </div>
                                                                    ))}
                                                                    {match.commonGenres.length > 5 && (
                                                                        <div className="text-terminal-muted text-xs italic">
                                                                            +{match.commonGenres.length - 5} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {match.commonSongs.length > 0 && (
                                                            <div className="bg-terminal-primary/10 p-4 rounded border border-terminal-primary/30">
                                                                <h4 className="font-semibold text-terminal-primary mb-3 flex items-center gap-2">
                                                                    🎶 songs you both ruined
                                                                    <span className="text-xs bg-terminal-primary/20 px-2 py-1 rounded">
                                                                        {match.commonSongs.length}
                                                                    </span>
                                                                </h4>
                                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                    {match.commonSongs.slice(0, 5).map((song, i) => (
                                                                        <div key={i} className="text-secondary text-sm flex items-center gap-2">
                                                                            <span className="text-terminal-primary">•</span>
                                                                            <span className="truncate" title={song}>
                                                                                {song.length > 25 ? song.substring(0, 25) + '...' : song}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                    {match.commonSongs.length > 5 && (
                                                                        <div className="text-terminal-muted text-xs italic">
                                                                            +{match.commonSongs.length - 5} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
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