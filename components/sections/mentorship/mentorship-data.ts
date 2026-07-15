export const checkpoints = [
  {
    label: "Foundations",
    detail: "Solid fundamentals, real code",
    x: 60,
    y: 200,
  },
  {
    label: "Code Reviews",
    detail: "Honest, weekly feedback",
    x: 360,
    y: 145,
  },
  {
    label: "System Design",
    detail: "Thinking in whole systems",
    x: 640,
    y: 90,
  },
  {
    label: "Leadership",
    detail: "Ready to mentor others",
    x: 920,
    y: 40,
  },
] as const;

export const pathD =
  "M 60,200 C 220,200 220,145 360,145 C 500,145 500,90 640,90 C 780,90 780,40 920,40";

// Sampled along the same bezier curve above (checkpoints + curve midpoints) so
// the traveling dot follows the visual path closely via simple interpolation.
export const dotPath = {
  x: [60, 217.5, 360, 500, 640, 780, 920],
  y: [200, 172.5, 145, 117.5, 90, 65, 40],
  times: [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1],
};
