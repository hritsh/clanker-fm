import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"
                />
                <h2 className="text-xl font-medium text-white">Loading your questionable taste...</h2>
            </motion.div>
        </div>
    );
}