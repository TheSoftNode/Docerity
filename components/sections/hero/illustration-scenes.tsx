"use client";

import { motion, useReducedMotion } from "framer-motion";

import { container, fadeUp, popIn, drawLine, growBar } from "@/components/sections/hero/illustration-variants";

const sceneExit = { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeInOut" } } as const;

const mentorshipNodes = [
  { cx: 300, cy: 158 },
  { cx: 322, cy: 210 },
  { cx: 268, cy: 218 },
];

function EngineeringScene() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.g
      variants={container}
      initial="hidden"
      animate="visible"
      exit={sceneExit}
    >
      <motion.text
        x="82"
        y="156"
        className="fill-foreground font-mono text-[15px]"
        variants={fadeUp}
      >
        function ship() {"{"}
      </motion.text>

      <motion.text
        x="100"
        y="182"
        className="fill-primary font-mono text-[15px]"
        variants={fadeUp}
      >
        return production.ready();
      </motion.text>
      <motion.rect
        x="354"
        y="170"
        width="2.5"
        height="15"
        className="fill-primary"
        animate={reduceMotion ? undefined : { opacity: [1, 0, 1] }}
        transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.text
        x="82"
        y="208"
        className="fill-foreground font-mono text-[15px]"
        variants={fadeUp}
      >
        {"}"}
      </motion.text>

      <motion.rect
        x="82"
        y="232"
        height="7"
        width="150"
        rx="3.5"
        className="fill-muted-foreground/30"
        style={{ transformOrigin: "82px 0px" }}
        variants={growBar}
      />
      <motion.rect
        x="82"
        y="252"
        height="7"
        width="104"
        rx="3.5"
        className="fill-muted-foreground/30"
        style={{ transformOrigin: "82px 0px" }}
        variants={growBar}
      />
    </motion.g>
  );
}

function MentorshipScene() {
  return (
    <motion.g
      variants={container}
      initial="hidden"
      animate="visible"
      exit={sceneExit}
    >
      <motion.text
        x="82"
        y="156"
        className="fill-foreground font-heading text-[16px] font-medium"
        variants={fadeUp}
      >
        1:1 mentorship, weekly.
      </motion.text>
      <motion.text
        x="82"
        y="178"
        className="fill-muted-foreground font-mono text-xs"
        variants={fadeUp}
      >
        3 engineers · weekly 1:1s
      </motion.text>

      {mentorshipNodes.map((node, index) => (
        <motion.line
          key={index}
          x1="210"
          y1="210"
          x2={node.cx}
          y2={node.cy}
          className="stroke-border"
          strokeWidth={1.5}
          variants={drawLine}
        />
      ))}

      {mentorshipNodes.map((node, index) => (
        <motion.circle
          key={index}
          cx={node.cx}
          cy={node.cy}
          r="6"
          className="fill-foreground/80"
          variants={popIn}
        />
      ))}

      <motion.circle
        cx="210"
        cy="210"
        r="10"
        className="fill-primary"
        variants={popIn}
      />
    </motion.g>
  );
}

function WritingScene() {
  return (
    <motion.g
      variants={container}
      initial="hidden"
      animate="visible"
      exit={sceneExit}
    >
      <motion.text
        x="82"
        y="156"
        className="fill-foreground font-heading text-[16px] font-medium"
        variants={fadeUp}
      >
        Concurrency, explained simply.
      </motion.text>

      <motion.rect
        x="82"
        y="176"
        height="7"
        width="188"
        rx="3.5"
        className="fill-muted-foreground/30"
        style={{ transformOrigin: "82px 0px" }}
        variants={growBar}
      />
      <motion.rect
        x="82"
        y="196"
        height="7"
        width="150"
        rx="3.5"
        className="fill-muted-foreground/30"
        style={{ transformOrigin: "82px 0px" }}
        variants={growBar}
      />
      <motion.rect
        x="82"
        y="216"
        height="7"
        width="172"
        rx="3.5"
        className="fill-muted-foreground/30"
        style={{ transformOrigin: "82px 0px" }}
        variants={growBar}
      />

      <motion.rect
        x="82"
        y="242"
        width="72"
        height="20"
        rx="10"
        className="fill-primary/15 stroke-primary/40"
        strokeWidth={1}
        variants={fadeUp}
      />
      <motion.text
        x="97"
        y="256"
        className="fill-primary font-mono text-[11px]"
        variants={fadeUp}
      >
        6 min read
      </motion.text>
    </motion.g>
  );
}

const scenes = [
  { id: "engineering", Component: EngineeringScene, label: "Engineering" },
  { id: "mentorship", Component: MentorshipScene, label: "Mentorship" },
  { id: "writing", Component: WritingScene, label: "Writing" },
] as const;

export { scenes };
