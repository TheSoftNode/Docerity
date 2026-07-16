function MentorshipFormatBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{
        backgroundImage:
          "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        color: "var(--foreground)",
        opacity: 0.06,
        maskImage:
          "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
      }}
    />
  );
}

export { MentorshipFormatBackground };
