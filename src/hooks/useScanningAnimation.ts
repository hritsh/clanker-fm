import { useState, useEffect } from 'react';
import { ScannableItem } from './useRoastAnalysis';

interface ScanningConstants {
    TRANSITION_DURATION: number;
    COMMENT_DELAY: number;
    TYPING_SPEED: number;
    FINAL_TRANSITION_DELAY: number;
    BASE_DISPLAY_TIME: number;
    TIME_PER_CHARACTER: number;
    MIN_DISPLAY_TIME: number;
    MAX_DISPLAY_TIME: number;
}

export const useScanningAnimation = (
    scannableItems: ScannableItem[],
    scanningComments: string[],
    scanningCommentsLoaded: boolean,
    roastExperience: any,
    constants: ScanningConstants,
    onComplete: () => void,
    setScannableItems: (items: ScannableItem[]) => void
) => {
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [finalTransform, setFinalTransform] = useState<string | undefined>(undefined);
    const [totalCyclesShown, setTotalCyclesShown] = useState(0);
    const [currentComment, setCurrentComment] = useState('');
    const [showComment, setShowComment] = useState(false);
    const [canStartCycling, setCanStartCycling] = useState(false);
    const [pendingCommentUpdate, setPendingCommentUpdate] = useState(false);

    // Calculate dynamic display time based on comment length
    const calculateDisplayTime = (comment: string): number => {
        const baseTime = constants.BASE_DISPLAY_TIME;
        const typingTime = comment.length * constants.TIME_PER_CHARACTER;
        const totalTime = baseTime + typingTime;

        return Math.max(
            constants.MIN_DISPLAY_TIME,
            Math.min(totalTime, constants.MAX_DISPLAY_TIME)
        );
    };

    const startScanner = (items: any[], comments: string[]) => {
        if (items.length < 1) {
            onComplete();
            return;
        }

        // Create exactly 3 cycles of items
        const scannableData = items.map((item, index) => ({
            ...item,
            comment: comments[index] || "scanning..."
        }));

        const tripleItems = [...scannableData, ...scannableData, ...scannableData];
        setScannableItems(tripleItems);
        setIsScanning(true);
        setCurrentItemIndex(0);
        setTotalCyclesShown(0);
    };

    // Update scanning comments when they load
    useEffect(() => {
        if (scanningCommentsLoaded && scanningComments.length > 0 && scannableItems.length > 0) {
            setPendingCommentUpdate(true);
        }
    }, [scanningCommentsLoaded, scanningComments, scannableItems.length]);

    // Main scanning interval - only start after first comment is shown
    useEffect(() => {
        if (!isScanning || scannableItems.length === 0 || !canStartCycling) return;

        const realItemCount = scannableItems.length / 3;
        let timeoutId: ReturnType<typeof setTimeout>;

        const scheduleNextItem = () => {
            const currentItem = scannableItems[currentItemIndex];

            // If we have a pending comment update, use shorter time to transition quickly
            const displayTime = pendingCommentUpdate
                ? constants.TRANSITION_DURATION + 500 // Just enough time for transition + brief pause
                : (currentItem ? calculateDisplayTime(currentItem.comment) : constants.MIN_DISPLAY_TIME);

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
                            onComplete();
                        }, constants.FINAL_TRANSITION_DELAY);
                        return prev;
                    }

                    if (next >= realItemCount * 3) {
                        setIsScanning(false);
                        const finalScrollAmount = (prev * 272);
                        const finalTx = `translateX(calc(-128px - ${finalScrollAmount}px))`;
                        setFinalTransform(finalTx);

                        setTimeout(() => {
                            onComplete();
                        }, constants.FINAL_TRANSITION_DELAY);
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
        }, constants.COMMENT_DELAY);

        return () => clearTimeout(commentTimeout);
    }, [currentItemIndex, isScanning, scannableItems, canStartCycling]);

    return {
        currentItemIndex,
        isScanning,
        finalTransform,
        currentComment,
        showComment,
        startScanner
    };
};