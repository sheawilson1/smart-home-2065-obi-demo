import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function PresenceGlow() {
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 1.2 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 1.2 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed z-50"
      style={{
        x: springX,
        y: springY,
        width: 280,
        height: 280,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background:
            'radial-gradient(circle, var(--obi-glow) 0%, transparent 60%)',
          opacity: 0.06,
          filter: 'blur(42px)',
        }}
      />
    </motion.div>
  );
}
