'use client';

import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import ClankerIcon from '../ClankerIcon';

export type Choice = {
    text?: string;
    value: string;
    imageUrl?: string;
};

export type Question = {
    id: string;
    type: 'image_choice' | 'mcq' | 'slider';
    question: string;
    choices: Choice[];
    responses: Record<string, string>;
};

interface QuestionStepProps {
    currentQuestion: Question;
    currentQuestionIndex: number;
    totalQuestions: number;
    showChoices: boolean;
    showResponse: boolean;
    questionResponse: string;
    sliderValue: number;
    selectedChoice?: string;
    onShowChoices: () => void;
    onChoice: (value: string) => void;
    onNextQuestion: () => void;
    onSliderChange: (value: number) => void;
}

export default function QuestionStep({
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    showChoices,
    showResponse,
    questionResponse,
    sliderValue,
    selectedChoice,
    onShowChoices,
    onChoice,
    onNextQuestion,
    onSliderChange
}: QuestionStepProps) {
    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4 }
    };

    const hasImageChoices = currentQuestion.choices.some(c => c?.imageUrl);

    return (
        <motion.div key={`question-${currentQuestionIndex}`} {...motionProps} className="w-full max-w-4xl flex flex-col items-center gap-6">
            <div className="terminal-window w-full">
                <div className="terminal-titlebar">
                    <span className="text-terminal-primary text-sm">QUESTION {currentQuestionIndex + 1} OF {totalQuestions}</span>
                </div>
                <div className="p-4 min-h-[6rem] flex items-center justify-center">
                    <div className="flex">
                        <ClankerIcon />
                        <div className="flex-1 text-center">
                            <TypeAnimation
                                key={currentQuestion.question}
                                sequence={[currentQuestion.question || "what's your favorite genre?", 500, onShowChoices]}
                                wrapper="p"
                                speed={80}
                                className="whitespace-pre-wrap text-terminal-primary"
                                cursor={true}
                                style={{ minHeight: '1.5em' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider input */}
            {showChoices && !showResponse && currentQuestion.type === 'slider' && (
                <div className="flex flex-col items-center gap-6 w-full pt-4">
                    <p className="text-8xl font-black text-terminal-primary tabular-nums">{sliderValue}</p>
                    <div className="w-full max-w-md">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValue}
                            onChange={(e) => onSliderChange(parseInt(e.target.value, 10))}
                            className="w-full h-4 bg-background border-[1px] border-terminal-primary appearance-none cursor-pointer"
                            style={{
                                WebkitAppearance: 'none',
                                appearance: 'none',
                                background: `linear-gradient(to right, var(--terminal-primary) 0%, var(--terminal-primary) ${sliderValue}%, var(--terminal-background) ${sliderValue}%, var(--terminal-background) 100%)`
                            }}
                        />
                        <div className="flex justify-between text-sm text-terminal-primary mt-2">
                            <span className="w-2/5 text-left">{currentQuestion.choices[0]?.text || "not at all"}</span>
                            <span className="w-2/5 text-right">{currentQuestion.choices[1]?.text || "absolutely"}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => onChoice(sliderValue.toString())}
                        className="terminal-btn"
                    >
                        SUBMIT
                    </button>
                </div>
            )}

            {/* Regular choices - Show when showChoices is true OR when showResponse is true (to keep visible) */}
            {(showChoices || showResponse) && currentQuestion.type !== 'slider' && (
                <div className={`mt-6 flex justify-center gap-4 ${hasImageChoices ? 'flex-row flex-wrap items-baseline' : 'flex-col sm:flex-row'}`}>
                    {currentQuestion.choices.map((choice, index) => {
                        if (!choice) return null;

                        const isSelected = selectedChoice === (choice.value || index.toString());
                        const isDisabled = showResponse;
                        const opacity = showResponse ? (isSelected ? 1 : 0.3) : 1;

                        return hasImageChoices ? (
                            <div
                                key={choice.value || index}
                                className="flex flex-col items-center gap-2"
                                style={{ opacity }}
                            >
                                {choice.imageUrl ? (
                                    <div
                                        className={`w-40 h-40 border-[1px] transition-all duration-300 ${
                                            isSelected 
                                                ? 'border-terminal-primary bg-terminal-primary bg-opacity-20' 
                                                : 'border-terminal-primary hover:bg-terminal-primary hover:bg-opacity-20'
                                        } ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
                                        onClick={!isDisabled ? () => onChoice(choice.value || index.toString()) : undefined}
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
                                            className="w-40 h-40 bg-background border-[1px] border-terminal-primary cursor-pointer flex items-center justify-center text-center p-2"
                                            onClick={!isDisabled ? () => onChoice(choice.value || index.toString()) : undefined}
                                            style={{ display: choice.imageUrl ? 'none' : 'flex' }}
                                        >
                                            <span className="text-sm text-terminal-primary">no cover art</span>
                                        </div>
                                    </div>
                                ) : null}
                                <p className="text-xs text-center w-40 text-terminal-primary">{choice.text || `Option ${index + 1}`}</p>
                            </div>
                        ) : (
                            <button
                                key={choice.value || index}
                                onClick={!isDisabled ? () => onChoice(choice.value || index.toString()) : undefined}
                                disabled={isDisabled}
                                className={`terminal-btn w-full transition-all duration-300 ${
                                    isSelected ? 'bg-terminal-primary text-terminal-background' : ''
                                }`}
                                style={{ opacity }}
                            >
                                {choice.text || `Option ${index + 1}`}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Show response after user answers - moved to bottom */}
            {showResponse && questionResponse && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="terminal-window w-full p-4"
                >
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">RESPONSE</span>
                    </div>
                    <div className="p-4">
                        <div className="flex">
                            <ClankerIcon />
                            <div className="flex-1 text-center">
                                <TypeAnimation
                                    sequence={[
                                        questionResponse,
                                        1000,
                                        () => {
                                            setTimeout(() => {
                                                onNextQuestion();
                                            }, 1500);
                                        }
                                    ]}
                                    wrapper="p"
                                    speed={80}
                                    className="text-terminal-primary whitespace-pre-wrap"
                                    cursor={false}
                                    style={{ minHeight: '1.5em' }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}