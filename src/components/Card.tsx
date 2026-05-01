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
          'linear-gradient(145deg, rgba(255,244,224,0.075), rgba(255,244,224,0.018))',
        boxShadow:
          '0 22px 64px -58px rgba(0,0,0,0.82), inset 0 0 0 1px rgba(255,238,205,0.10)',
        borderRadius: 26,
        textShadow: '0 1px 12px rgba(0,0,0,0.26)',
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.015, 0.045, 0.015] }}
        transition={{
          duration: 7 + (breathSeed % 1.5),
          repeat: Infinity,
          ease: 'easeInOut',
          delay: breathSeed,
        }}
        style={{
          borderRadius: 26,
          background:
            'linear-gradient(145deg, rgba(255,244,224,0.16), transparent 58%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
