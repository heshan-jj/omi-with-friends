"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export const CARD_EASE = [0.16, 1, 0.3, 1] as const;
export type TableSide = "north" | "south" | "east" | "west";
const seats = {
  north: { x: 0, y: -155, rotate: -8 },
  south: { x: 0, y: 175, rotate: 8 },
  east: { x: 210, y: 0, rotate: 24 },
  west: { x: -210, y: 0, rotate: -24 },
};
const slots = {
  north: { x: 0, y: -65 },
  south: { x: 0, y: 65 },
  east: { x: 84, y: 0 },
  west: { x: -84, y: 0 },
};

export function AnimatedNumber({
  value,
  reduce,
}: {
  value: number;
  reduce: boolean;
}) {
  return (
    <span className="animated-number">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? false : { y: 12, opacity: 0, scale: 1.15 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: reduce ? 0 : -10, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.24, ease: CARD_EASE }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function TrickMotionCard({
  id,
  side,
  winner,
  winning,
  reduce,
  children,
}: {
  id: string;
  side: TableSide;
  winner: TableSide | null;
  winning: boolean;
  reduce: boolean;
  children: ReactNode;
}) {
  const target = winner ? seats[winner] : { x: 0, y: 0, rotate: 0 };
  return (
    <motion.div
      layoutId={reduce ? undefined : id}
      className={`trick-card from-${side} ${winning ? "winning-card" : ""}`}
      initial={reduce ? false : { ...seats[side], opacity: 0, scale: 0.72 }}
      animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: winning ? 1.07 : 1 }}
      exit={
        reduce
          ? { opacity: 0 }
          : {
              x: target.x - slots[side].x,
              y: target.y - slots[side].y,
              rotate: target.rotate,
              scale: 0.2,
              opacity: 0,
            }
      }
      transition={{
        duration: reduce ? 0 : 0.4,
        ease: CARD_EASE,
        layout: { duration: 0.42, ease: CARD_EASE },
      }}
    >
      {children}
    </motion.div>
  );
}

export function WinCelebration({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  return (
    <div className="win-celebration" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => {
        const x = ((i * 73) % 281) - 140;
        const height = 85 + ((i * 37) % 100);
        return (
          <motion.i
            key={i}
            className={`celebration-piece piece-${i % 4}`}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
            animate={{
              x: [0, x * 0.65, x],
              y: [0, -height, -height * 0.25],
              opacity: [0, 1, 1, 0],
              rotate: (i % 2 ? 1 : -1) * (150 + i * 13),
              scale: [0.4, 1, 0.7],
            }}
            transition={{
              duration: 1.15,
              delay: (i % 8) * 0.025,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}
