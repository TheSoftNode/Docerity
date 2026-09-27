import type { FounderView } from "@/lib/content/blocks/views";

/** The narrative. Measure-capped, because it is the only long prose here. */
function StoryPanel({ founder, story }: { founder: FounderView; story: string[] }) {
  return (
    <div className="max-w-[68ch]">
      <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-primary uppercase">
        {founder.role}
      </p>

      {story.map((paragraph, index) => (
        <p
          key={index}
          className={
            index === 0
              ? "mt-5 text-pretty text-[1.0625rem] leading-[1.8] text-foreground"
              : "mt-5 text-pretty text-[0.9375rem] leading-[1.8] text-muted-foreground"
          }
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export { StoryPanel };
