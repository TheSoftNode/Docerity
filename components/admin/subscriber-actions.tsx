"use client";

import { useState, useTransition } from "react";
import { LoaderCircleIcon, MailMinusIcon, MailPlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { removeSubscriber, setSubscription } from "@/app/admin/subscribers/actions";

/**
 * The actions on one row of the mailing list.
 *
 * A client island inside a server-rendered table, so the table stays a table:
 * making the whole page interactive to get two buttons would cost the rows
 * their server render for nothing.
 *
 * Unsubscribing is one press because it is reversible — the button turns into
 * "Resubscribe". Erasing is two, because it is not.
 */
function SubscriberActions({
  email,
  status,
}: {
  email: string;
  status: "subscribed" | "unsubscribed";
}) {
  const [current, setCurrent] = useState(status);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = current === "subscribed" ? "unsubscribed" : "subscribed";
    /* Set locally first so the row answers the press, then put back if the
       server disagrees. The action is the authority; this is only the wait. */
    const previous = current;
    setCurrent(next);
    setError("");

    startTransition(async () => {
      const result = await setSubscription(email, next);
      if (!result.ok) {
        setCurrent(previous);
        setError(result.message);
      }
    });
  }

  function erase() {
    setError("");
    startTransition(async () => {
      const result = await removeSubscriber(email);
      /* Nothing to do on success: the action revalidates this page, so the row
         and the counts above it are re-rendered from the database without it.
         Hiding the row from here as well would only race that. */
      if (!result.ok) setError(result.message);
    });
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Button variant="destructive" size="xs" disabled={pending} onClick={erase}>
          {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
          Erase for good
        </Button>
        <Button
          variant="ghost"
          size="xs"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
        {/* Shown in this branch too, and not only the other one: a refused
            erase leaves the row exactly as it was, so without this the press
            looks like it did nothing. */}
        {error ? (
          <span role="alert" className="text-[0.625rem] text-destructive">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        variant="subtle"
        size="xs"
        disabled={pending}
        onClick={toggle}
        title={
          current === "subscribed"
            ? "Take this address off the list"
            : "Put this address back on the list"
        }
      >
        {current === "subscribed" ? <MailMinusIcon /> : <MailPlusIcon />}
        {current === "subscribed" ? "Unsubscribe" : "Resubscribe"}
      </Button>
      <Button
        variant="subtle-danger"
        size="icon-xs"
        aria-label={`Erase ${email}`}
        title="Erase this address entirely"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        <Trash2Icon />
      </Button>
      {error ? (
        <span role="alert" className="text-[0.625rem] text-destructive">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export { SubscriberActions };
