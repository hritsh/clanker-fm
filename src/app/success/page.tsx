'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from '../../components/Loading';
import IntroStep from '../../components/roast/IntroStep';
import ScanningStep from '../../components/roast/ScanningStep';
import ReadyStep from '../../components/roast/ReadyStep';
import QuestionStep, { Question } from '../../components/roast/QuestionStep';
import CompleteStep from '../../components/roast/CompleteStep';
import { useRoastAnalysis } from '../../hooks/useRoastAnalysis';
import { useScanningAnimation } from '../../hooks/useScanningAnimation';
import { useVerdictAnimation } from '../../hooks/useVerdictAnimation';

type Step = 'intro' | 'fetching' | 'scanning' | 'ready' | 'questions' | 'complete';

const SCANNING_CONSTANTS = {
    TRANSITION_DURATION: 800,
    COMMENT_DELAY: 500,
    TYPING_SPEED: 80,
    FINAL_TRANSITION_DELAY: 2000,
    BASE_DISPLAY_TIME: 2000,
    TIME_PER_CHARACTER: 40,
    MIN_DISPLAY_TIME: 3000,
    MAX_DISPLAY_TIME: 4500,
};

export default function SuccessPage() {
    const { data: session, status } = useSession();
    const [step, setStep] = useState<Step>('intro');
    const [introMessage, setIntroMessage] = useState<string | null>(null);
    const [showChoices, setShowChoices] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [questionResponses, setQuestionResponses] = useState<string[]>([]);
    const [showResponse, setShowResponse] = useState(false);
    const [sliderValue, setSliderValue] = useState(50);
    const [scanningText, setScanningText] = useState("SCANNING MUSIC DATA");
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]); // Add this to track selected choices

    // Custom hooks
    const {
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
    } = useRoastAnalysis();

    const {
        currentItemIndex,
        isScanning,
        finalTransform,
        currentComment,
        showComment,
        startScanner
    } = useScanningAnimation(
        scannableItems,
        scanningComments,
        scanningCommentsLoaded,
        roastExperience,
        SCANNING_CONSTANTS,
        () => setStep('ready'),
        setScannableItems
    );

    const {
        verdictLines,
        currentLineIndex,
        currentText,
        showCursor,
        getLineStyle
    } = useVerdictAnimation(step, roastExperience);

    // Handle authentication
    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    // Handle intro message
    useEffect(() => {
        if (status === 'authenticated' && step === 'intro') {
            handleIntroMessage();
        }
    }, [status, step]);

    // Animate scanning text dots
    useEffect(() => {
        if (step !== 'scanning') return;

        const interval = setInterval(() => {
            setScanningText(prev => {
                if (prev === "SCANNING MUSIC DATA") return "SCANNING MUSIC DATA.";
                if (prev === "SCANNING MUSIC DATA.") return "SCANNING MUSIC DATA..";
                if (prev === "SCANNING MUSIC DATA..") return "SCANNING MUSIC DATA...";
                return "SCANNING MUSIC DATA";
            });
        }, 500);

        return () => clearInterval(interval);
    }, [step]);

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
        const result = await startAnalysis();

        if (result.success && result.itemsToScan) {
            setStep('scanning');
            startScanner(result.itemsToScan, result.defaultComments);
        }
    };

    const getSliderResponseKey = (value: number): string => {
        if (value <= 25) return "0-25";
        if (value <= 50) return "26-50";
        if (value <= 75) return "51-75";
        return "76-100";
    };

    const handleChoice = (value: string) => {
        const currentQuestion = roastExperience?.questions[currentQuestionIndex];
        if (!currentQuestion) return;

        let responseKey = value;
        if (currentQuestion.type === 'slider') {
            responseKey = getSliderResponseKey(parseInt(value));
        }

        const response = currentQuestion.responses[responseKey] || currentQuestion.responses[value] || "";

        const newAnswers = [...userAnswers, value];
        const newResponses = [...questionResponses, response];
        const newSelectedChoices = [...selectedChoices, value]; // Track the selected choice
        
        setUserAnswers(newAnswers);
        setQuestionResponses(newResponses);
        setSelectedChoices(newSelectedChoices);
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
                        <span className="text-terminal-danger text-sm">ERROR.LOG</span>
                    </div>
                    <div className="p-4">
                        <p className="font-bold text-terminal-danger">error:</p>
                        <p className="mt-2 text-foreground">{error}</p>
                    </div>
                </motion.div>
            );
        }

        if (step === 'intro') {
            return (
                <IntroStep
                    introMessage={introMessage}
                    showChoices={showChoices}
                    onShowChoices={() => setShowChoices(true)}
                    onStartAnalysis={handleStartAnalysis}
                />
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
            return (
                <ScanningStep
                    scannableItems={scannableItems}
                    currentItemIndex={currentItemIndex}
                    isScanning={isScanning}
                    finalTransform={finalTransform}
                    scanningText={scanningText}
                    showComment={showComment}
                    currentComment={currentComment}
                    constants={SCANNING_CONSTANTS}
                />
            );
        }

        if (step === 'ready') {
            return (
                <ReadyStep
                    roastExperience={roastExperience}
                    showChoices={showChoices}
                    onShowChoices={() => setShowChoices(true)}
                    onStartQuestions={() => setStep('questions')}
                />
            );
        }

        if (step === 'questions' && roastExperience) {
            const currentQuestion = roastExperience.questions?.[currentQuestionIndex];

            if (!currentQuestion || !currentQuestion.choices || !Array.isArray(currentQuestion.choices)) {
                setStep('complete');
                return null;
            }

            return (
                <QuestionStep
                    currentQuestion={currentQuestion}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={roastExperience.questions.length}
                    showChoices={showChoices}
                    showResponse={showResponse}
                    questionResponse={questionResponses[currentQuestionIndex] || ''}
                    sliderValue={sliderValue}
                    selectedChoice={selectedChoices[currentQuestionIndex]} // Add this prop
                    onShowChoices={() => setShowChoices(true)}
                    onChoice={handleChoice}
                    onNextQuestion={handleNextQuestion}
                    onSliderChange={setSliderValue}
                />
            );
        }

        if (step === 'complete' && roastExperience && roastData) {
            return (
                <CompleteStep
                    roastData={roastData}
                    verdictLines={verdictLines}
                    currentLineIndex={currentLineIndex}
                    currentText={currentText}
                    showCursor={showCursor}
                    getLineStyle={getLineStyle}
                />
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
            <div className="flex flex-col items-center justify-center text-center gap-8 w-full flex-1">
                {step !== 'complete' && session?.user?.name && (
                    <h1 className="text-4xl font-bold text-foreground">
                        welcome, <span className="font-bold text-terminal-primary">{session.user.name}</span>
                    </h1>
                )}
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}