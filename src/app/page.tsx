'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Library } from '@/components/library/Library';
import { Practice } from '@/components/practice/Practice';
import { BookDetail } from '@/components/book/BookDetail';
import { Capture } from '@/components/capture/Capture';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { useEffect, useState } from 'react';

export default function Home() {
    const { currentView, onboarding, hydrateFromServer } = useStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch — zustand persist loads from localStorage
    useEffect(() => {
        setMounted(true);
    }, []);

    // Hydrate from MongoDB on mount
    useEffect(() => {
        if (mounted && onboarding.completed) {
            hydrateFromServer();
        }
    }, [mounted, onboarding.completed, hydrateFromServer]);

    if (!mounted) {
        return <div className="app-shell" />;
    }

    const view = !onboarding.completed ? 'onboarding' : currentView;

    return (
        <div className="app-shell">
            <AnimatePresence mode="wait">
                {view === 'onboarding' && (
                    <motion.div
                        key="onboarding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Onboarding />
                    </motion.div>
                )}

                {view === 'library' && (
                    <motion.div
                        key="library"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Library />
                    </motion.div>
                )}

                {view === 'practice' && (
                    <motion.div
                        key="practice"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Practice />
                    </motion.div>
                )}

                {view === 'book-detail' && (
                    <motion.div
                        key="book-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <BookDetail />
                    </motion.div>
                )}

                {view === 'capture' && (
                    <motion.div
                        key="capture"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Capture />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
