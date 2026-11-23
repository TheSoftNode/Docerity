"use client";

import { useEffect, useState } from "react";

/**
 * True while the reader is scrolling down a page, past the top.
 *
 * On a phone the floating header sits over the text it follows, so it steps
 * aside on the way down and comes back the moment the reader scrolls up,
 * which is when they are looking for it. Small movements are ignored, so a
 * thumb resting on the screen doesn't make it flicker. The state is also set
 * on <html> as data-nav-hidden, for the strips that stick under the header.
 */
function useHideOnScroll({ enabled = true, offset = 120, slack = 6 } = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (y <= offset) setHidden(false);
      else if (delta > slack) setHidden(true);
      else if (delta < -slack) setHidden(false);
      if (Math.abs(delta) > slack || y <= offset) last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, offset, slack]);

  useEffect(() => {
    const root = document.documentElement;
    if (hidden) root.dataset.navHidden = "";
    else delete root.dataset.navHidden;
    return () => {
      delete root.dataset.navHidden;
    };
  }, [hidden]);

  return hidden;
}

export { useHideOnScroll };
