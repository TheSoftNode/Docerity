"use client";

import { motion } from "framer-motion";

const corners = [
  "top-3 left-3 border-t-2 border-l-2 rounded-tl-lg",
  "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg",
  "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg",
  "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg",
] as const;

function CornerBrackets() {
  return (
    <>
      {corners.map((className, index) => (
        <motion.span
          key={className}
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 + index * 0.06, ease: "easeOut" }}
          className={`pointer-events-none absolute size-5 border-primary/50 ${className}`}
        />
      ))}
    </>
  );
}

export { CornerBrackets };
