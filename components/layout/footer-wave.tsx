function FooterWave() {
  return (
    <svg
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
      className="block h-[70px] w-full sm:h-[100px]"
      aria-hidden
    >
      <path
        d="M0,110 L0,70 C 240,0 480,110 720,55 C 960,0 1200,110 1440,50 L1440,110 Z"
        className="fill-card"
      />
    </svg>
  );
}

export { FooterWave };
