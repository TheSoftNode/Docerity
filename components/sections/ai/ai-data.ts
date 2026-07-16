import {
  ClipboardCheckIcon,
  EyeIcon,
  MessageCircleIcon,
  RouteIcon,
  SearchCodeIcon,
  type LucideIcon,
} from "lucide-react";

export const projects = [
  {
    slug: "smart-llm-router",
    name: "SmartLLMRouter",
    stat: "90% cost optimization",
    description:
      "A 3-tier fallback system (GPT-4o → Gemini-2.0 → rule-based) processing millions of social media posts, routing each one by complexity instead of sending everything to the most expensive model.",
    tags: ["GPT-4o", "Gemini", "Cost routing"],
    Icon: RouteIcon,
  },
  {
    slug: "production-rag",
    name: "Production RAG system",
    stat: "Real-time across 3 platforms",
    description:
      "MongoDB Atlas Vector Search over 1536-dim embeddings, with hybrid search combining cosine similarity and metadata filtering — powers real-time intent analysis across Twitter, Facebook, and TikTok.",
    tags: ["RAG", "Vector search", "MongoDB Atlas"],
    Icon: SearchCodeIcon,
  },
  {
    slug: "multimodal-vision-pipeline",
    name: "Multi-modal vision pipeline",
    stat: "2,800+ LOC production service",
    description:
      "GPT-4o Vision, DALL-E 3, and custom computer vision (blur detection, exposure analysis) behind quality gates and platform-specific optimization for LinkedIn, Instagram, Twitter, and Facebook.",
    tags: ["GPT-4o Vision", "DALL-E 3", "Computer vision"],
    Icon: EyeIcon,
  },
  {
    slug: "whatsapp-ai-assistant",
    name: "WhatsApp AI assistant",
    stat: "9-container production deployment",
    description:
      "A conversational assistant that turns a message or product photo into published social content — intent detection, image analysis, and multi-turn context memory, deployed across Nginx, FastAPI webhooks, and Celery workers for parallel processing.",
    tags: ["Conversational AI", "FastAPI", "Celery"],
    Icon: MessageCircleIcon,
  },
] as const;

export const capabilities: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "LLM integration & routing",
    description:
      "Multi-provider setups (GPT-4o, Claude, Gemini) with complexity-based routing so cost scales with actual difficulty, not worst-case.",
    Icon: RouteIcon,
  },
  {
    title: "RAG & vector search",
    description:
      "Production retrieval systems with real embeddings and hybrid search, not a demo that falls over past a few hundred documents.",
    Icon: SearchCodeIcon,
  },
  {
    title: "Multi-modal pipelines",
    description:
      "Vision, image generation, and text working together behind real quality gates, tuned per platform.",
    Icon: EyeIcon,
  },
  {
    title: "Model evaluation & RLHF",
    description:
      "Designed training samples and evaluation rubrics, and annotated model responses across 150+ technical tasks — I know what makes training data actually improve a model.",
    Icon: ClipboardCheckIcon,
  },
];

export const models = [
  "GPT-4o",
  "Claude 3.5",
  "Gemini",
  "DALL-E 3",
  "Stability AI",
  "OpenAI Assistants API",
  "MongoDB Atlas Vector Search",
] as const;
