"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}*#";
const FRAME_MS = 32;

/**
 * Text that decodes itself on mount, character by character.
 *
 * Only ever used on monospace labels. In a proportional face the substituted
 * glyphs are different widths, so the line would jitter as it resolves; in
 * mono every glyph occupies the same cell and the text holds still.
 *
 * The final string renders on the server, so the markup matches on hydration
 * and the effect simply scrambles briefly before settling.
 */
function ScrambleText({
  text,
  className,
  duration = 900,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduceMotion) return;
    const totalFrames = Math.max(1, Math.round(duration / FRAME_MS));
    let frame = 0;

    const id = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;

      if (progress >= 1) {
        window.clearInterval(id);
        setDisplay(text);
        return;
      }

      setDisplay(
        text
          .split("")
          .map((char, index) =>
            char === " " || index / text.length < progress
              ? char
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
    }, FRAME_MS);

    return () => window.clearInterval(id);
  }, [text, duration, reduceMotion]);

  return <span className={className}>{display}</span>;
}

export { ScrambleText };
