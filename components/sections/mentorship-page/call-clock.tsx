"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Where the call's timer starts, in seconds: well into a session. */
const START = 42 * 60 + 10;

/**
 * The running timer on the call tile. Decoration: it ticks only while the
 * tab is visible, and stands still under reduced motion.
 */
function CallClock() {
  const reduceMotion = useReducedMotion() ?? false;
  const [seconds, setSeconds] = useState(START);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const minutes = Math.floor(seconds / 60) % 60;
  return (
    <span className="tabular-nums">
      {String(minutes).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}

export { CallClock };
