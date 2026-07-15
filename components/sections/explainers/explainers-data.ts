import {
  ArrowRightLeftIcon,
  ArmchairIcon,
  ChefHatIcon,
  ConciergeBellIcon,
  GitForkIcon,
  Share2Icon,
  StickyNoteIcon,
  ZapIcon,
} from "lucide-react";

export const pairs = [
  {
    id: "caching",
    concept: {
      label: "Caching",
      caption: "Store it once, reuse it fast",
      Icon: ZapIcon,
    },
    analogy: {
      label: "A sticky note on your monitor",
      caption: "Quick answer, no digging required",
      Icon: StickyNoteIcon,
    },
  },
  {
    id: "load-balancing",
    concept: {
      label: "Load Balancing",
      caption: "Spread traffic across servers",
      Icon: Share2Icon,
    },
    analogy: {
      label: "A host seating restaurant guests",
      caption: "No single table gets overwhelmed",
      Icon: ArmchairIcon,
    },
  },
  {
    id: "api-requests",
    concept: {
      label: "API Requests",
      caption: "One system asking another for data",
      Icon: ArrowRightLeftIcon,
    },
    analogy: {
      label: "A waiter relaying your order",
      caption: "You never talk to the kitchen directly",
      Icon: ConciergeBellIcon,
    },
  },
  {
    id: "concurrency",
    concept: {
      label: "Concurrency",
      caption: "Many tasks making progress at once",
      Icon: GitForkIcon,
    },
    analogy: {
      label: "Multiple chefs sharing one kitchen",
      caption: "Same stove, different dishes",
      Icon: ChefHatIcon,
    },
  },
] as const;
