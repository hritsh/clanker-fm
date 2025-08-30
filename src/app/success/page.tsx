'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../../components/Loading';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
    const scannerRef = useRef<HTMLDivElement>(null);
    const [finalTransform, setFinalTransform] = useState<string | undefined>(undefined);

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

            // Generate scanning comments with track data
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

            // Generate complete roast experience
            const roastResponse = await fetch('/api/get-roast-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete_roast', roastData: spotifyData }),
            });
            const roastExperience = await roastResponse.json();

            setRoastExperience(roastExperience);
            startScanner(itemsToScan, scanningData.scanningComments);

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

        // Combine items with comments
        const scannableData = items.map((item, index) => ({
            ...item,
            comment: comments[index] || "scanning..."
        }));

        setScannableItems([...scannableData, ...scannableData, ...scannableData]);
        setStep('scanning');
        setIsScanning(true);
        setCurrentItemIndex(0);
    };

    useEffect(() => {
        if (!isScanning || scannableItems.length === 0) return;

        const realItemCount = scannableItems.length / 3;
        const intervalDuration = 2500;

        const interval = setInterval(() => {
            setCurrentItemIndex(prev => {
                const next = prev + 1;
                if (next >= realItemCount * 2) {
                    setIsScanning(false);
                    const finalScrollAmount = (prev * 272);
                    const finalTx = `translateX(calc(-128px - ${finalScrollAmount}px))`;
                    setFinalTransform(finalTx);

                    setTimeout(() => {
                        setStep('ready');
                    }, 2000);
                    return prev;
                }
                return next;
            });
        }, intervalDuration);

        return () => clearInterval(interval);
    }, [isScanning, scannableItems.length]);

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

        // Auto-advance after showing response
        setTimeout(() => {
            if (currentQuestionIndex < (roastExperience?.questions.length || 0) - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setShowResponse(false);
                setSliderValue(50);
            } else {
                setStep('complete');
            }
        }, 3000);
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
                                speed={70}
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
                        <div className="absolute bottom-0 mb-4 w-full max-w-lg min-h-[4rem] p-3 bg-gray-800 rounded-lg flex items-center justify-center">
                            {scannableItems[currentItemIndex] ? (
                                <TypeAnimation
                                    key={`${currentItemIndex}-${scannableItems[currentItemIndex]?.comment}`}
                                    sequence={[scannableItems[currentItemIndex].comment]}
                                    wrapper="p"
                                    speed={80}
                                    className="text-center text-gray-200 text-sm"
                                    cursor={false}
                                />
                            ) : (
                                <p className="text-center text-gray-300 text-sm animate-pulse">scanning...</p>
                            )}
                        </div>
                    </div>

                    <div
                        ref={scannerRef}
                        className="absolute top-16 left-1/2 flex items-center gap-4"
                        style={{
                            transform: isScanning ? `translateX(calc(-${itemWidth / 2}px - ${scrollAmount}px))` : finalTransform,
                            transition: isScanning ? 'transform 2.5s cubic-bezier(0.65, 0, 0.35, 1)' : 'transform 0.5s ease-out',
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
                            speed={70}
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
            const currentQuestion = roastExperience.questions[currentQuestionIndex];
            if (!currentQuestion) {
                setStep('complete');
                return null;
            }

            const hasImageChoices = currentQuestion.choices.some(c => c.imageUrl);

            const onTypingDone = () => {
                setShowChoices(true);
            };

            return (
                <motion.div key={`question-${currentQuestionIndex}`} {...motionProps} className="w-full max-w-4xl flex flex-col items-center gap-6">
                    <div className="p-4 bg-gray-800 rounded-lg text-center text-lg w-full min-h-[6rem] flex items-center justify-center">
                        <TypeAnimation
                            key={currentQuestion.question}
                            sequence={[currentQuestion.question, 500, onTypingDone]}
                            wrapper="p"
                            speed={70}
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
                                sequence={[questionResponses[currentQuestionIndex]]}
                                wrapper="p"
                                speed={70}
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
                                    <span className="w-2/5 text-left">{currentQuestion.choices[0]?.text}</span>
                                    <span className="w-2/5 text-right">{currentQuestion.choices[1]?.text}</span>
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
                            {currentQuestion.choices.map((choice, index) => (
                                hasImageChoices ? (
                                    <div
                                        key={choice.value}
                                        className="flex flex-col items-center gap-2"
                                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                                    >
                                        {choice.imageUrl ? (
                                            <img
                                                src={choice.imageUrl}
                                                alt={choice.text}
                                                className="w-40 h-40 object-cover rounded-md border-2 border-transparent hover:border-green-500 cursor-pointer transition-all"
                                                onClick={() => handleChoice(choice.value)}
                                            />
                                        ) : (
                                            <div
                                                className="w-40 h-40 bg-gray-700 rounded-md border-2 border-transparent hover:border-green-500 cursor-pointer transition-all flex items-center justify-center text-center p-2"
                                                onClick={() => handleChoice(choice.value)}
                                            >
                                                <span>no cover art</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-center w-40 text-gray-300">{choice.text}</p>
                                    </div>
                                ) : (
                                    <button
                                        key={choice.value}
                                        onClick={() => handleChoice(choice.value)}
                                        className="px-5 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                                    >
                                        {choice.text}
                                    </button>
                                )
                            ))}
                        </div>
                    )}
                </motion.div>
            );
        }

        if (step === 'complete' && roastExperience) {
            return (
                <motion.div key="complete" {...motionProps} className="flex flex-col items-center gap-6 max-w-4xl">
                    <div className="space-y-4 w-full">
                        {questionResponses.map((roast, index) => (
                            <div key={index} className="p-4 bg-gray-800 rounded-lg">
                                <p className="text-gray-200 whitespace-pre-wrap">{roast}</p>
                            </div>
                        ))}
                        <div className="p-6 bg-gray-900 rounded-lg border border-green-500/30">
                            <p className="text-gray-200 whitespace-pre-wrap text-lg font-medium">{roastExperience.finalVerdict}</p>
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