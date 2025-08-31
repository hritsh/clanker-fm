'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { redirect } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import Link from 'next/link';
import Loading from '../../components/Loading';
import ClankerIcon from '../../components/ClankerIcon';
import Image from 'next/image';

// Types & constants remain the same
type Choice = {
    text?: string;
    value: string;
    imageUrl?: string;
};

type Question = {
    id: string;
    type: 'image_choice' | 'mcq' | 'slider';
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

const SCANNING_CONSTANTS = {
    TRANSITION_DURATION: 800, // Album cover transition duration (ms)
    COMMENT_DELAY: 500, // Delay before showing comment (ms) - slightly after transition
    TYPING_SPEED: 80, // Comment typing speed
    FINAL_TRANSITION_DELAY: 2000, // Delay before moving to next step (ms)
    BASE_DISPLAY_TIME: 2000, // Base time to display each item (ms)
    TIME_PER_CHARACTER: 40, // Additional time per character in comment (ms)
    MIN_DISPLAY_TIME: 3000, // Minimum time per item (ms)
    MAX_DISPLAY_TIME: 4500, // Maximum time per item (ms)
};

export default function SuccessPage() {
    const { data: session, status } = useSession();
    const [step, setStep] = useState<'intro' | 'fetching' | 'scanning' | 'ready' | 'questions' | 'complete'>('intro');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [introMessage, setIntroMessage] = useState<string | null>(null);
    const [showChoices, setShowChoices] = useState(false);
    const [roastData, setRoastData] = useState<any>(null);
    const [roastExperience, setRoastExperience] = useState<RoastExperience | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [questionResponses, setQuestionResponses] = useState<string[]>([]);
    const [showResponse, setShowResponse] = useState(false);
    const [sliderValue, setSliderValue] = useState(50);

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
    const [canStartCycling, setCanStartCycling] = useState(false);
    const [pendingCommentUpdate, setPendingCommentUpdate] = useState(false);

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

    // Handle intro message logic
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

    // Update scanning comments when they load - mark for next transition
    useEffect(() => {
        if (scanningCommentsLoaded && scanningComments.length > 0 && scannableItems.length > 0) {
            setPendingCommentUpdate(true);
        }
    }, [scanningCommentsLoaded, scanningComments, scannableItems.length]);

    // Calculate dynamic display time based on comment length
    const calculateDisplayTime = (comment: string): number => {
        const baseTime = SCANNING_CONSTANTS.BASE_DISPLAY_TIME;
        const typingTime = comment.length * SCANNING_CONSTANTS.TIME_PER_CHARACTER;
        const totalTime = baseTime + typingTime;

        return Math.max(
            SCANNING_CONSTANTS.MIN_DISPLAY_TIME,
            Math.min(totalTime, SCANNING_CONSTANTS.MAX_DISPLAY_TIME)
        );
    };

    // Main scanning interval - only start after first comment is shown
    useEffect(() => {
        if (!isScanning || scannableItems.length === 0 || !canStartCycling) return;

        const realItemCount = scannableItems.length / 3;
        let timeoutId: NodeJS.Timeout;

        const scheduleNextItem = () => {
            const currentItem = scannableItems[currentItemIndex];

            // If we have a pending comment update, use shorter time to transition quickly
            const displayTime = pendingCommentUpdate
                ? SCANNING_CONSTANTS.TRANSITION_DURATION + 500 // Just enough time for transition + brief pause
                : (currentItem ? calculateDisplayTime(currentItem.comment) : SCANNING_CONSTANTS.MIN_DISPLAY_TIME);

            timeoutId = setTimeout(() => {
                setCurrentItemIndex(prev => {
                    const next = prev + 1;
                    const cyclePosition = next % realItemCount;
                    const cycleNumber = Math.floor(next / realItemCount);

                    // Update comments if pending update and we're transitioning
                    if (pendingCommentUpdate) {
                        const updatedItems = scannableItems.map((item, index) => {
                            const realItemIndex = index % realItemCount;
                            return {
                                ...item,
                                comment: scanningComments[realItemIndex] || item.comment
                            };
                        });
                        setScannableItems(updatedItems);
                        setPendingCommentUpdate(false);
                    }

                    // Update cycles shown
                    if (cyclePosition === 0 && next > 0) {
                        setTotalCyclesShown(cycleNumber);
                    }

                    // Check if we should stop
                    const shouldStop = (
                        totalCyclesShown >= 1 &&
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
            }, displayTime);
        };

        scheduleNextItem();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isScanning, scannableItems, currentItemIndex, totalCyclesShown, scanningCommentsLoaded, roastExperience, canStartCycling, pendingCommentUpdate, scanningComments]);

    // Separate effect to handle comment updates with delay
    useEffect(() => {
        if (!isScanning || scannableItems.length === 0) return;

        // Reset comment display immediately
        setShowComment(false);
        setCurrentComment('');

        // Set up delayed comment display
        const commentTimeout = setTimeout(() => {
            const currentItem = scannableItems[currentItemIndex];
            if (currentItem) {
                setCurrentComment(currentItem.comment);
                setShowComment(true);

                // Start cycling after first comment is shown
                if (!canStartCycling && currentItemIndex === 0) {
                    setCanStartCycling(true);
                }
            }
        }, SCANNING_CONSTANTS.COMMENT_DELAY);

        return () => clearTimeout(commentTimeout);
    }, [currentItemIndex, isScanning, scannableItems, canStartCycling]);

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
                <motion.div key="error" {...motionProps} className="mt-8 terminal-window w-full max-w-4xl">
                    <div className="terminal-titlebar">
                        <span className="text-[#FF0000] text-sm">ERROR.LOG</span>
                    </div>
                    <div className="p-4">
                        <p className="font-bold text-[#FF0000]">error:</p>
                        <p className="mt-2 text-white">{error}</p>
                    </div>
                </motion.div>
            );
        }

        if (step === 'intro') {
            return (
                <motion.div key="intro" {...motionProps} className="flex flex-col items-center gap-6">
                    <div className="terminal-window w-full max-w-3xl">
                        <div className="terminal-titlebar">
                            <span className="text-[#00FF00] text-sm">CLANKER v1.0</span>
                        </div>
                        <div className="p-6">
                            {introMessage ? (
                                <div className="flex">
                                    <ClankerIcon />
                                    <div className="flex-1 text-center">
                                        <TypeAnimation
                                            sequence={[introMessage, 1000, () => setShowChoices(true)]}
                                            wrapper="p"
                                            speed={80}
                                            className="text-[#00FF00]"
                                            cursor={true}
                                            style={{ minHeight: '1.5em' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[#00FF00] animate-pulse text-center">...<span className="animate-blink">_</span></p>
                            )}
                        </div>
                    </div>
                    {showChoices && (
                        <button
                            onClick={handleStartAnalysis}
                            className="terminal-btn"
                        >
                            ANALYZE MY TASTE
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
                <motion.div key="scanning" {...motionProps} className="relative terminal-window w-full">
                    <div className="terminal-titlebar">
                        <span className="text-[#00FF00] text-sm">SCANNER.EXE</span>
                    </div>
                    <div className="p-4 h-96 overflow-hidden">
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
                            <h2 className="text-xl font-bold text-[#00FF00]">SCANNING MUSIC DATA</h2>
                        </div>

                        <div className="absolute inset-0 z-10 w-full flex items-end justify-center pointer-events-none">
                            <div className="absolute bottom-0 mb-4 w-full max-w-2xl min-h-[6rem] p-4 border-[1px] border-[#00FF00] bg-black flex items-center justify-center">
                                {showComment && currentComment ? (
                                    <div className="flex w-full">
                                        <ClankerIcon />
                                        <div className="flex-1 flex items-center justify-center">
                                            <TypeAnimation
                                                key={`comment-${currentItemIndex}`}
                                                sequence={[currentComment]}
                                                wrapper="p"
                                                speed={SCANNING_CONSTANTS.TYPING_SPEED}
                                                className="text-[#00FF00] text-sm text-center"
                                                cursor={false}
                                                style={{ minHeight: '1.5em' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[#00FF00] text-sm text-center"></div>
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
                                        className="flex-shrink-0 w-64 h-64"
                                        style={{
                                            border: isInFocus ? '1px solid #00FF00' : '1px solid #333333',
                                            transform: isInFocus ? 'scale(1)' : 'scale(0.9)',
                                            opacity: isInFocus ? 1 : 0.5,
                                        }}
                                    >
                                        <Image
                                            src={item.imageUrl}
                                            alt={`${item.name} by ${item.artist}`}
                                            width={256}
                                            height={256}
                                            className="w-full h-full object-cover"
                                            style={{
                                                filter: isInFocus ? 'none' : 'brightness(0.5)',
                                            }}
                                            unoptimized
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            );
        }

        if (step === 'ready') {
            return (
                <motion.div key="ready" {...motionProps} className="flex flex-col items-center gap-6">
                    <div className="terminal-window w-full max-w-3xl">
                        <div className="terminal-titlebar">
                            <span className="text-[#00FF00] text-sm">ANALYSIS COMPLETE</span>
                        </div>
                        <div className="p-6">
                            <div className="flex">
                                <ClankerIcon />
                                <div className="flex-1 text-center">
                                    <TypeAnimation
                                        sequence={[roastExperience?.introMessage || "alright, i've seen enough. ready to get roasted?", 1000, () => setShowChoices(true)]}
                                        wrapper="p"
                                        speed={80}
                                        className="text-[#00FF00]"
                                        cursor={true}
                                        style={{ minHeight: '1.5em' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {showChoices && (
                        <button
                            onClick={() => setStep('questions')}
                            className="terminal-btn"
                        >
                            LETS DO THIS
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
                    <div className="terminal-window w-full">
                        <div className="terminal-titlebar">
                            <span className="text-[#00FF00] text-sm">QUESTION {currentQuestionIndex + 1} OF {roastExperience.questions.length}</span>
                        </div>
                        <div className="p-4 min-h-[6rem] flex items-center justify-center">
                            <div className="flex">
                                <ClankerIcon />
                                <div className="flex-1 text-center">
                                    <TypeAnimation
                                        key={currentQuestion.question}
                                        sequence={[currentQuestion.question || "what's your favorite genre?", 500, onTypingDone]}
                                        wrapper="p"
                                        speed={80}
                                        className="whitespace-pre-wrap text-[#00FF00]"
                                        cursor={true}
                                        style={{ minHeight: '1.5em' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Show response after user answers */}
                    {showResponse && questionResponses[currentQuestionIndex] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="terminal-window w-full p-4"
                        >
                            <div className="terminal-titlebar">
                                <span className="text-[#00FF00] text-sm">RESPONSE</span>
                            </div>
                            <div className="p-4">
                                <div className="flex">
                                    <ClankerIcon />
                                    <div className="flex-1 text-center">
                                        <TypeAnimation
                                            sequence={[
                                                questionResponses[currentQuestionIndex],
                                                1000,
                                                () => {
                                                    setTimeout(() => {
                                                        handleNextQuestion();
                                                    }, 1500);
                                                }
                                            ]}
                                            wrapper="p"
                                            speed={80}
                                            className="text-[#00FF00] whitespace-pre-wrap"
                                            cursor={false}
                                            style={{ minHeight: '1.5em' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {showChoices && !showResponse && currentQuestion.type === 'slider' && (
                        <div className="flex flex-col items-center gap-6 w-full pt-4">
                            <p className="text-8xl font-black text-[#00FF00] tabular-nums">{sliderValue}</p>
                            <div className="w-full max-w-md">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
                                    className="w-full h-4 bg-black border-[1px] border-[#00FF00] appearance-none cursor-pointer"
                                    style={{
                                        WebkitAppearance: 'none',
                                        appearance: 'none',
                                        background: `linear-gradient(to right, #00FF00 0%, #00FF00 ${sliderValue}%, black ${sliderValue}%, black 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-sm text-[#00FF00] mt-2">
                                    <span className="w-2/5 text-left">{currentQuestion.choices[0]?.text || "not at all"}</span>
                                    <span className="w-2/5 text-right">{currentQuestion.choices[1]?.text || "absolutely"}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleChoice(sliderValue.toString())}
                                className="terminal-btn"
                            >
                                SUBMIT
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
                                    >
                                        {choice.imageUrl ? (
                                            <div
                                                className="w-40 h-40 border-[1px] border-[#00FF00] cursor-pointer hover:bg-[#00FF00] hover:bg-opacity-20"
                                                onClick={() => handleChoice(choice.value || index.toString())}
                                            >
                                                <img
                                                    src={choice.imageUrl}
                                                    alt={choice.text || 'Choice'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const fallback = target.nextElementSibling as HTMLDivElement;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                                <div
                                                    className="w-40 h-40 bg-black border-[1px] border-[#00FF00] cursor-pointer flex items-center justify-center text-center p-2"
                                                    onClick={() => handleChoice(choice.value || index.toString())}
                                                    style={{ display: choice.imageUrl ? 'none' : 'flex' }}
                                                >
                                                    <span className="text-sm text-[#00FF00]">no cover art</span>
                                                </div>
                                            </div>
                                        ) : null}
                                        <p className="text-xs text-center w-40 text-[#00FF00]">{choice.text || `Option ${index + 1}`}</p>
                                    </div>
                                ) : (
                                    <button
                                        key={choice.value || index}
                                        onClick={() => handleChoice(choice.value || index.toString())}
                                        className="terminal-btn w-full"
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
                    <div className="terminal-window w-full">
                        <div className="terminal-titlebar">
                            <span className="text-[#FF0000] text-sm">FINAL VERDICT</span>
                        </div>
                        <div className="p-4">
                            {/* Album covers display */}
                            {albumCovers.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-3 mb-4 border-b-[1px] border-[#00FF00] pb-4">
                                    {albumCovers.map((cover: any, index: number) => (
                                        <img
                                            key={index}
                                            src={cover}
                                            alt="Album cover"
                                            className="w-16 h-16 object-cover border-[1px] border-[#00FF00]"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4 w-full text-[#00FF00]">
                                {verdictParagraphs.map((paragraph, index) => (
                                    <div key={index} className="flex">
                                        {index === 0 && <ClankerIcon />}
                                        <div className="flex-1 text-center">
                                            <TypeAnimation
                                                sequence={[paragraph]}
                                                wrapper="p"
                                                speed={85}
                                                className="text-[#00FF00] text-base"
                                                cursor={false}
                                                style={{ minHeight: '1.5em' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[#00FF00] text-sm">
                            roast complete. hope you learned something about yourself.
                        </p>
                        <Link
                            href="/home"
                            className="terminal-btn"
                        >
                            GO TO HOME
                        </Link>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
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
                        welcome, <span className="font-bold text-[#00FF00]">{session.user.name}</span>
                    </h1>
                )}
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}