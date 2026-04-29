import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { audio } from '../audio/AudioDirector';

type Props = {
  id: string;
  children: ReactNode;
  className?: string;
  breathSeed?: number;
  onClick?: () => void;
};

export function Card({ id, children, className = '', breathSeed = 0, onClick }: Props) {
  return (
    <motion.div
      layoutId={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] },
        opacity: { duration: 0.8 },
      }}
      className={`relative rounded-3xl border border-white/5 p-6 overflow-hidden backdrop-blur-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      onPointerEnter={() => audio.playFx('hover')}
      onPointerDown={() => audio.playFx('press')}
      style={{
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))',
        boxShadow:
          '0 0 78px -30px var(--obi-glow), inset 0 0 1px rgba(255,255,255,0.28)',
        borderRadius: 26,
        textShadow: '0 1px 16px rgba(0,0,0,0.32)',
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.02, 0.16, 0.02] }}
        transition={{
          duration: 5 + (breathSeed % 1.5),
          repeat: Infinity,
          ease: 'easeInOut',
          delay: breathSeed,
        }}
        style={{
          borderRadius: 26,
          background:
            'radial-gradient(ellipse at center, var(--obi-glow) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
