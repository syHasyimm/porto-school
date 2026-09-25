import { motion, useReducedMotion } from 'motion/react';
import type { PropsWithChildren } from 'react';

export function PageTransition({ children }: PropsWithChildren) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}
