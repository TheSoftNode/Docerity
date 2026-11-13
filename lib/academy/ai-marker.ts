import "server-only";

import { ai } from "@/lib/config/env";
import { cleanGrade, gradeTool, markingPrompt, type Grade, type HandIn } from "@/lib/academy/assignments";
import type { Lesson } from "@/lib/academy/types";
import { createLogger } from "@/lib/core/logger";

const logger = createLogger("academy.ai-marker");

export type AiMark = { grade: Grade; needsHuman: boolean; model: string };

/**
 * Marks one hand-in with Claude. Returns null whenever it can't (no key,
 * timeout, an error, a reply without the grade), and the hand-in then waits
 * for a person: a student is never told "error" because the AI hiccuped.
 */
export async function markWithAi(lesson: Lesson, work: HandIn): Promise<AiMark | null> {
  if (!ai.isConfigured || !lesson.rubric?.length) return null;
  const { system, user } = markingPrompt(lesson, work);
  const tool = gradeTool(lesson.rubric);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(`${ai.baseUrl}/v1/messages`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": ai.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ai.model,
        max_tokens: 2000,
        system,
        tools: [tool],
        tool_choice: { type: "tool", name: tool.name },
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!response.ok) {
      logger.warn("ai marking refused", { status: response.status, body: (await response.text()).slice(0, 300) });
      return null;
    }
    const body = (await response.json()) as { content?: { type: string; name?: string; input?: unknown }[] };
    const call = body.content?.find((block) => block.type === "tool_use" && block.name === tool.name);
    if (!call?.input) return null;
    const input = call.input as { needs_human?: unknown };
    return { grade: cleanGrade(lesson.rubric, call.input), needsHuman: input.needs_human === true, model: ai.model };
  } catch (error) {
    logger.warn("ai marking failed", { error: String(error) });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
