"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Three ways to hand a file to an upload: pick it, drop it, or paste it.
 *
 * Paste is the one that matters. Almost everything going into this site is a
 * screenshot, and the shortest path from a screenshot to the page was: take it,
 * find where the system put it, open a file picker, navigate to it, choose it.
 * Cmd-Shift-4 then Cmd-V is the whole job.
 *
 * Paste has no natural target on a page with several upload fields, so a zone
 * claims the clipboard while the pointer is over it or while it holds focus,
 * and a single document listener hands the image to whichever zone claimed it.
 * Listening on the zone alone would not work: a paste goes to the focused
 * element, and hovering an area is not focusing it.
 */

/* Which zone the next paste belongs to. A module-level ref rather than context
   because there is exactly one clipboard, and the winner is whichever zone the
   person last pointed at or focused. */
let activeZone: string | null = null;

function ImageDrop({
  onFile,
  disabled = false,
  className,
  children,
  /** Said out loud once per zone, because paste-to-upload is not discoverable. */
  hint = "Drop a file here, or paste a screenshot",
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  const [over, setOver] = useState(false);

  /*
    The callback in a ref, so the document listener is attached once.

    `onFile` is an inline arrow at every call site, which makes it a new
    function on every render; as an effect dependency it tore the listener down
    and rebuilt it each time, and this component re-renders whenever the
    pointer arms it.
  */
  const handler = useRef(onFile);

  /* Assigned in an effect rather than during render, which is the rule: a ref
     written while rendering is a side effect, and React may render without
     committing. */
  useEffect(() => {
    handler.current = onFile;
  }, [onFile]);
  /* Rendered, not just tracked: the zone says it is ready for a paste, which
     is the only way somebody discovers that pasting works at all. */
  const [armed, setArmed] = useState(false);

  function claim() {
    /* Guarded, because `onMouseMove` calls this on every pixel. Assigning the
       module variable is cheap, but the setState is not, and React only bails
       out after it has been called. */
    if (activeZone === id) return;
    activeZone = id;
    setArmed(true);
  }

  function release() {
    if (activeZone === id) activeZone = null;
    setArmed(false);
  }

  useEffect(() => {
    if (disabled) return;

    function onPaste(event: ClipboardEvent) {
      if (activeZone !== id) return;

      /* `getAsFile` on the item rather than `clipboardData.files`, because a
         screenshot copied from a browser or a design tool arrives as an item
         with no file list behind it. */
      const item = Array.from(event.clipboardData?.items ?? []).find((entry) =>
        entry.type.startsWith("image/")
      );
      if (!item) return;

      const file = item.getAsFile();
      if (!file) return;

      event.preventDefault();
      handler.current(file);
    }

    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("paste", onPaste);
      if (activeZone === id) activeZone = null;
    };
  }, [id, disabled]);

  /* Cleared on unmount as well, so a removed gallery row cannot keep the
     clipboard pointed at something that is no longer on the page. Inlined
     rather than calling `release`, which is redefined on every render. */
  useEffect(
    () => () => {
      if (activeZone === id) activeZone = null;
    },
    [id]
  );

  return (
    <div
      /*
        Focusable, so the keyboard reaches it too: tab to the area, paste. The
        role is `group` rather than `button`, because it is a region that
        accepts a file and not something that does one thing when pressed.
      */
      tabIndex={disabled ? -1 : 0}
      role="group"
      aria-label={hint}
      onMouseEnter={claim}
      /*
        `mousemove` as well as `mouseenter`.

        Enter fires once, on the crossing, and there are ways to end up inside
        an element without one: the pointer already resting there when the
        element mounts or the layout shifts under it, and a synthetic move in a
        test. Move fires whenever the pointer is genuinely over the zone, which
        is the condition actually being tracked.
      */
      onMouseMove={claim}
      onMouseLeave={() => {
        if (!document.activeElement?.closest(`[data-drop="${id}"]`)) release();
      }}
      onFocus={claim}
      onBlur={release}
      data-drop={id}
      data-armed={armed ? "true" : "false"}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={cn(
        "rounded-lg outline-none transition-colors",
        /* Visible while a file is over it and while it holds focus, so both
           the pointer and the keyboard get the same confirmation. */
        over && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        !disabled && "focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      {children}
      <p
        className={cn(
          "mt-1.5 text-[0.6875rem] transition-colors",
          over || armed ? "text-primary" : "text-muted-foreground"
        )}
      >
        {over ? "Drop to upload" : armed ? "Ready: press \u2318V to paste" : hint}
      </p>
    </div>
  );
}

export { ImageDrop };
