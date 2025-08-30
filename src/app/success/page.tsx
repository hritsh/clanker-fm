'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../../components/Loading';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Timing and animation constants
const SCANNING_CONSTANTS = {
    ITEM_DISPLAY_DURATION: 4500, // Total time per item (ms)
    TRANSITION_DURATION: 2500, // Album cover transition duration (ms)
    COMMENT_DELAY: 3000, // Delay before showing comment (ms) - slightly after transition
    TYPING_SPEED: 90, // Comment typing speed
    FINAL_TRANSITION_DELAY: 2000, // Delay before moving to next step (ms)
};

type Choice = {
    text: string;
    value: string;
    imageUrl?: string;
};

type Question = {
    id: string;
    type: 'slider' | 'image_choice' | 'mcq';
    question: string;
    choices: Choice[];
    responses: Record<string, string>;
};

type RoastExperience = {
    introMessage: string;
    questions: Question[];
    finalVerdict: string;
};

type ScannableItem = {
    name: string;
    artist: string;
    imageUrl: string;
    comment: string;
}

export default function SuccessPage() {
    const { data: session, status } = useSession();
    const [step, setStep] = useState<'intro' | 'fetching' | 'scanning' | 'ready' | 'questions' | 'complete'>('intro');
    const [roastData, setRoastData] = useState<any>(null);
    const [roastExperience, setRoastExperience] = useState<RoastExperience | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [questionResponses, setQuestionResponses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sliderValue, setSliderValue] = useState(50);
    const [showChoices, setShowChoices] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [introMessage, setIntroMessage] = useState('');

    // Scanning state
    const [scannableItems, setScannableItems] = useState<ScannableItem[]>([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [scanningComments, setScanningComments] = useState<string[]>([]);
    const [scanningCommentsLoaded, setScanningCommentsLoaded] = useState(false);
    const [hasCompletedFirstCycle, setHasCompletedFirstCycle] = useState(false);
    const scannerRef = useRef<HTMLDivElement>(null);
    const [finalTransform, setFinalTransform] = useState<string | undefined>(undefined);
    const [totalCyclesShown, setTotalCyclesShown] = useState(0);
    const [currentComment, setCurrentComment] = useState('');
    const [showComment, setShowComment] = useState(false);

    const defaultScanningComments = [
        "scanning your atrocious taste...",
        "what fresh hell is this",
        "found some questionable life choices",
        "oh dear, this explains everything",
        "your spotify wrapped must be embarrassing",
        "i've seen middle schoolers with better taste",
        "this is worse than i thought",
        "someone needs to stage an intervention"
    ];

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        if (status === 'authenticated' && step === 'intro') {
            handleIntroMessage();
        }
    }, [status, step]);

    const handleIntroMessage = async () => {
        try {
            const response = await fetch('/api/get-roast-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'intro' }),
            });
            const data = await response.json();
            setIntroMessage(data.introMessage);
        } catch (err) {
            setIntroMessage("hey there. i'm clanker, and i'm about to judge your music taste.");
        }
    };

    const handleStartAnalysis = async () => {
        setStep('fetching');
        setIsLoading(true);
        setError(null);

        try {
            // Fetch Spotify data
            const spotifyResponse = await fetch('/api/get-roast-data');
            const spotifyData = await spotifyResponse.json();

            if (spotifyData.error) {
                setError(spotifyData.error);
                return;
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

            // Start scanning immediately with default comments
            startScanner(itemsToScan, defaultScanningComments);

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

        } catch (err) {
            setError("failed to fetch your spotify data.");
        } finally {
            setIsLoading(false);
        }
    };

    const startScanner = (items: any[], comments: string[]) => {
        if (items.length < 1) {
            setStep('ready');
            return;
        }

        // Create exactly 3 cycles of items
        const scannableData = items.map((item, index) => ({
            ...item,
            comment: comments[index] || "scanning..."
        }));

        const tripleItems = [...scannableData, ...scannableData, ...scannableData];
        setScannableItems(tripleItems);
        setStep('scanning');
        setIsScanning(true);
        setCurrentItemIndex(0);
        setTotalCyclesShown(0);
    };

    // Update scanning comments when they load
    useEffect(() => {
        if (scanningCommentsLoaded && scanningComments.length > 0 && scannableItems.length > 0) {
            const realItemCount = scannableItems.length / 3;
            const updatedItems = scannableItems.map((item, index) => ({
                ...item,
                comment: scanningComments[index % realItemCount] || item.comment
            }));
            setScannableItems(updatedItems);
        }
    }, [scanningCommentsLoaded, scanningComments]);

    useEffect(() => {
        if (!isScanning || scannableItems.length === 0) return;

        const realItemCount = scannableItems.length / 3;

        const interval = setInterval(() => {
            setCurrentItemIndex(prev => {
                const next = prev + 1;
                const cyclePosition = next % realItemCount;
                const cycleNumber = Math.floor(next / realItemCount);

                // Update cycles shown
                if (cyclePosition === 0 && next > 0) {
                    setTotalCyclesShown(cycleNumber);
                }

                // Check if we should stop
                const shouldStop = (
                    // At least one full cycle complete
                    totalCyclesShown >= 1 &&
                    // Have the roast data ready
                    scanningCommentsLoaded &&
                    roastExperience &&
                    next > realItemCount
                );

                if (shouldStop) {
                    setIsScanning(false);
                    const finalScrollAmount = (prev * 272);
                    const finalTx = `translateX(calc(-128px - ${finalScrollAmount}px))`;
                    setFinalTransform(finalTx);

                    setTimeout(() => {
                        setStep('ready');
                    }, SCANNING_CONSTANTS.FINAL_TRANSITION_DELAY);
                    return prev;
                }

                // Fallback stop condition - prevent infinite loop
                if (next >= realItemCount * 3) {
                    setIsScanning(false);
                    const finalScrollAmount = (prev * 272);
                    const finalTx = `translateX(calc(-128px - ${finalScrollAmount}px))`;
                    setFinalTransform(finalTx);

                    setTimeout(() => {
                        setStep('ready');
                    }, SCANNING_CONSTANTS.FINAL_TRANSITION_DELAY);
                    return prev;
                }

                return next;
            });
        }, SCANNING_CONSTANTS.ITEM_DISPLAY_DURATION);

        return () => clearInterval(interval);
    }, [isScanning, scannableItems.length, totalCyclesShown, scanningCommentsLoaded, roastExperience]);

    // Separate effect to handle comment updates with delay
    useEffect(() => {
        if (!isScanning || scannableItems.length === 0) return;

        // Reset comment display immediately
        setShowComment(false);
        setCurrentComment('');

        // Set up delayed comment display - much shorter delay
        const commentTimeout = setTimeout(() => {
            const currentItem = scannableItems[currentItemIndex];
            if (currentItem) {
                setCurrentComment(currentItem.comment);
                setShowComment(true);
            }
        }, 500); // Much shorter delay - only 500ms instead of 3200ms

        return () => clearTimeout(commentTimeout);
    }, [currentItemIndex, isScanning, scannableItems]);

    const getSliderResponseKey = (value: number): string => {
        if (value <= 25) return "0-25";
        if (value <= 50) return "26-50";
        if (value <= 75) return "51-75";
        return "76-100";
    };

    const handleChoice = (value: string) => {
        const currentQuestion = roastExperience?.questions[currentQuestionIndex];
        if (!currentQuestion) return;

        // Get the response for this choice
        let responseKey = value;
        if (currentQuestion.type === 'slider') {
            responseKey = getSliderResponseKey(parseInt(value));
        }

        const response = currentQuestion.responses[responseKey] || currentQuestion.responses[value] || "";

        const newAnswers = [...userAnswers, value];
        const newResponses = [...questionResponses, response];
        setUserAnswers(newAnswers);
        setQuestionResponses(newResponses);
        setShowChoices(false);
        setShowResponse(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (roastExperience?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowResponse(false);
            setSliderValue(50);
        } else {
            setStep('complete');
        }
    };

    const renderContent = () => {
        const motionProps = {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            transition: { duration: 0.4 }
        };

        if (status === 'loading') {
            return <Loading />;
        }

        if (error) {
            return (
                <motion.div key="error" {...motionProps} className="mt-8 p-4 bg-gray-800 border border-red-500/50 rounded-lg text-left text-sm max-w-4xl w-full">
                    <p className="font-bold text-red-400">error:</p>
                    <p className="mt-2 text-gray-300">{error}</p>
                </motion.div>
            );
        }

        if (step === 'intro') {
            return (
                <motion.div key="intro" {...motionProps} className="flex flex-col items-center gap-6">
                    <div className="p-6 bg-gray-800 rounded-lg text-center w-full max-w-3xl">
                        {introMessage ? (
                            <TypeAnimation
                                sequence={[introMessage, 1000, () => setShowChoices(true)]}
                                wrapper="p"
                                speed={80}
                                className="text-gray-200 text-lg"
                                cursor={true}
                            />
                        ) : (
                            <p className="text-gray-300 animate-pulse">...</p>
                        )}
                    </div>
                    {showChoices && (
                        <button
                            onClick={handleStartAnalysis}
                            className="px-8 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            analyze my taste
                        </button>
                    )}
                </motion.div>
            );
        }

        if (step === 'fetching') {
            return (
                <motion.div key="fetching" {...motionProps}>
                    <Loading />
                </motion.div>
            );
        }

        if (step === 'scanning') {
            const itemWidth = 256;
            const gap = 16;
            const scrollAmount = (currentItemIndex * (itemWidth + gap));

            return (
                <motion.div key="scanning" {...motionProps} className="relative w-full h-96 overflow-hidden">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <h2 className="text-xl font-semibold text-green-500">scanning your music history</h2>
                    </div>

                    <div className="absolute inset-0 z-10 w-full flex items-end justify-center pointer-events-none">
                        <div className="absolute bottom-0 mb-4 w-full max-w-2xl min-h-[6rem] p-4 bg-gray-800 rounded-lg flex items-center justify-center">
                            {showComment && currentComment ? (
                                <TypeAnimation
                                    key={`comment-${currentItemIndex}`}
                                    sequence={[currentComment]}
                                    wrapper="p"
                                    speed={80}
                                    className="text-center text-gray-200 text-sm leading-relaxed"
                                    cursor={false}
                                />
                            ) : (
                                <div className="text-center text-gray-300 text-sm"></div>
                            )}
                        </div>
                    </div>

                    <div
                        ref={scannerRef}
                        className="absolute top-16 left-1/2 flex items-center gap-4"
                        style={{
                            transform: isScanning ? `translateX(calc(-${itemWidth / 2}px - ${scrollAmount}px))` : finalTransform,
                            transition: isScanning ? `transform ${SCANNING_CONSTANTS.TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` : 'transform 0.5s ease-out',
                        }}
                    >
                        {scannableItems.map((item, index) => {
                            const isInFocus = index === currentItemIndex;
                            return (
                                <div
                                    key={index}
                                    className="flex-shrink-0 w-64 h-64 rounded-lg transition-all duration-500"
                                    style={{
                                        boxShadow: isInFocus ? '0 0 0 2px #1DB954' : 'none',
                                        transform: isInFocus ? 'scale(1)' : 'scale(0.9)',
                                        opacity: isInFocus ? 1 : 0.5,
                                    }}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={`${item.name} by ${item.artist}`}
                                        className="w-full h-full object-cover rounded-lg"
                                        style={{
                                            filter: isInFocus ? 'blur(0px)' : 'blur(4px)',
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            );
        }

        if (step === 'ready') {
            return (
                <motion.div key="ready" {...motionProps} className="flex flex-col items-center gap-6">
                    <div className="p-6 bg-gray-800 rounded-lg text-center w-full max-w-3xl">
                        <TypeAnimation
                            sequence={[roastExperience?.introMessage || "alright, i've seen enough. ready to get roasted?", 1000, () => setShowChoices(true)]}
                            wrapper="p"
                            speed={80}
                            className="text-gray-200 text-lg"
                            cursor={true}
                        />
                    </div>
                    {showChoices && (
                        <button
                            onClick={() => setStep('questions')}
                            className="px-8 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            let&apos;s do this
                        </button>
                    )}
                </motion.div>
            );
        }

        if (step === 'questions' && roastExperience) {
            const currentQuestion = roastExperience.questions?.[currentQuestionIndex];

            // If no question or malformed question, skip to complete
            if (!currentQuestion || !currentQuestion.choices || !Array.isArray(currentQuestion.choices)) {
                setStep('complete');
                return null;
            }

            const hasImageChoices = currentQuestion.choices.some(c => c?.imageUrl);

            const onTypingDone = () => {
                setShowChoices(true);
            };

            return (
                <motion.div key={`question-${currentQuestionIndex}`} {...motionProps} className="w-full max-w-4xl flex flex-col items-center gap-6">
                    <div className="p-4 bg-gray-800 rounded-lg text-center text-lg w-full min-h-[6rem] flex items-center justify-center">
                        <TypeAnimation
                            key={currentQuestion.question}
                            sequence={[currentQuestion.question || "what's your favorite genre?", 500, onTypingDone]}
                            wrapper="p"
                            speed={80}
                            className="whitespace-pre-wrap text-gray-200"
                            cursor={true}
                        />
                    </div>

                    {/* Show response after user answers */}
                    {showResponse && questionResponses[currentQuestionIndex] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-900 rounded-lg border border-green-500/30 w-full"
                        >
                            <TypeAnimation
                                sequence={[
                                    questionResponses[currentQuestionIndex],
                                    1000,
                                    () => {
                                        // Auto-advance after 1.5 seconds
                                        setTimeout(() => {
                                            handleNextQuestion();
                                        }, 1500);
                                    }
                                ]}
                                wrapper="p"
                                speed={80}
                                className="text-gray-200 whitespace-pre-wrap"
                                cursor={false}
                            />
                        </motion.div>
                    )}

                    {showChoices && !showResponse && currentQuestion.type === 'slider' && (
                        <div className="flex flex-col items-center gap-6 w-full pt-4">
                            <p className="text-8xl font-black text-green-500 tabular-nums" style={{ textShadow: '0 0 25px rgba(29, 185, 84, 0.4)' }}>
                                {sliderValue}
                            </p>
                            <div className="w-full max-w-md">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
                                    className="w-full h-4 bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="flex justify-between text-sm text-gray-400 mt-2">
                                    <span className="w-2/5 text-left">{currentQuestion.choices[0]?.text || "not at all"}</span>
                                    <span className="w-2/5 text-right">{currentQuestion.choices[1]?.text || "absolutely"}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleChoice(sliderValue.toString())}
                                className="px-12 py-4 text-xl font-bold text-black rounded-full bg-green-500 shadow-lg hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300"
                            >
                                submit
                            </button>
                        </div>
                    )}

                    {showChoices && !showResponse && currentQuestion.type !== 'slider' && (
                        <div className={`mt-6 flex justify-center gap-4 ${hasImageChoices ? 'flex-row flex-wrap items-baseline' : 'flex-col sm:flex-row'}`}>
                            {currentQuestion.choices.map((choice, index) => {
                                if (!choice) return null;

                                return hasImageChoices ? (
                                    <div
                                        key={choice.value || index}
                                        className="flex flex-col items-center gap-2"
                                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                                    >
                                        {choice.imageUrl ? (
                                            <img
                                                src={choice.imageUrl}
                                                alt={choice.text || 'Choice'}
                                                className="w-40 h-40 object-cover rounded-md border-2 border-transparent hover:border-green-500 cursor-pointer transition-all"
                                                onClick={() => handleChoice(choice.value || index.toString())}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const fallback = target.nextElementSibling as HTMLDivElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-40 h-40 bg-gray-700 rounded-md border-2 border-transparent hover:border-green-500 cursor-pointer transition-all flex items-center justify-center text-center p-2"
                                            onClick={() => handleChoice(choice.value || index.toString())}
                                            style={{ display: choice.imageUrl ? 'none' : 'flex' }}
                                        >
                                            <span className="text-sm">no cover art</span>
                                        </div>
                                        <p className="text-xs text-center w-40 text-gray-300">{choice.text || `Option ${index + 1}`}</p>
                                    </div>
                                ) : (
                                    <button
                                        key={choice.value || index}
                                        onClick={() => handleChoice(choice.value || index.toString())}
                                        className="px-5 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                                    >
                                        {choice.text || `Option ${index + 1}`}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            );
        }

        if (step === 'complete' && roastExperience && roastData) {
            // Split the final verdict into smaller paragraphs for better readability
            const verdictParagraphs = roastExperience.finalVerdict
                .split(/(?<=\.)\s+(?=[A-Z])/g)
                .filter(p => p.trim().length > 0);

            // Get top album covers for display
            const albumCovers = roastData.topTracks?.items
                ?.slice(0, 6)
                ?.map((track: any) => track.album?.images?.[0]?.url)
                ?.filter(Boolean) || [];

            return (
                <motion.div key="complete" {...motionProps} className="flex flex-col items-center gap-6 max-w-4xl">
                    {/* Album covers display */}
                    {albumCovers.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-3 mb-4">
                            {albumCovers.map((cover: any, index: number) => (
                                <motion.img
                                    key={index}
                                    src={cover}
                                    alt="Album cover"
                                    className="w-16 h-16 object-cover rounded-lg shadow-lg"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="space-y-4 w-full">
                        <div className="p-6 bg-gray-900 rounded-lg border border-red-500/30">
                            <h2 className="text-2xl font-bold text-red-400 mb-4 text-center">final verdict</h2>
                            <div className="space-y-4">
                                {verdictParagraphs.map((paragraph, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.5 }}
                                    >
                                        <TypeAnimation
                                            sequence={[paragraph]}
                                            wrapper="p"
                                            speed={85}
                                            className="text-gray-200 text-base leading-relaxed"
                                            cursor={false}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            roast complete. hope you learned something about yourself.
                        </p>
                        <Link
                            href="/dashboard"
                            className="px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            go to dashboard
                        </Link>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-black to-gray-900">
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <div className="flex flex-col items-center justify-center text-center gap-8 w-full flex-1">
                {step !== 'complete' && session?.user?.name && (
                    <h1 className="text-4xl font-bold text-white">
                        welcome, <span className="font-bold text-green-500">{session.user.name}</span>
                    </h1>
                )}
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}