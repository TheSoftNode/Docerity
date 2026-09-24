import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, XIcon } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { database } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { unsubscribeByToken } from "@/lib/repositories/subscriber.repository";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/* Reads a token from the query string and writes to the database, so it can be
   neither prerendered nor cached. */
export const dynamic = "force-dynamic";

const logger = createLogger("unsubscribe");

/**
 * One-click unsubscribe.
 *
 * The token is unguessable and identifies the row on its own, so this needs no
 * login and reveals nothing about anybody else. CAN-SPAM and GDPR both expect an
 * exit that does not require an account, and the `unsubscribeToken` field has
 * existed on the model since it was written with nothing reading it.
 *
 * Done in the page rather than a route handler because the outcome is something
 * a person reads. A GET that mutates is not ideal, but a mail client cannot POST
 * from a link, and the alternative is a page with a button that half of people
 * never press.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let removed = false;

  if (token && database.isConfigured) {
    try {
      removed = await unsubscribeByToken(token);
      logger.info("unsubscribe processed", { matched: removed });
    } catch (error) {
      logger.error("unsubscribe failed", error);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-[32rem] text-center">
            <span
              className={`inline-flex size-11 items-center justify-center rounded-full ${
                removed ? "bg-brand-teal/15" : "bg-muted"
              }`}
            >
              {removed ? (
                <CheckIcon className="size-5 text-brand-teal" />
              ) : (
                <XIcon className="size-5 text-muted-foreground" />
              )}
            </span>

            <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
              {removed ? "You are unsubscribed" : "That link did not work"}
            </h1>

            <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
              {removed
                ? "No more explainers will reach you. No hard feelings, and you can subscribe again whenever you like."
                : /*
                     Deliberately vague about why. "That address is not on the
                     list" would confirm whether a given address is subscribed
                     to anyone who tried the URL, and an expired or mistyped
                     token is indistinguishable to the person holding it anyway.
                   */
                  "The link may have been cut short by your mail client, or it may already have been used. Email me and I will take you off the list myself."}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/blog" />}
              >
                Read the explainers
              </Button>
              {!removed ? (
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/contact" />}
                >
                  Get in touch
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
