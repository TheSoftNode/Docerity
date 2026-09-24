"use client";

import { useActionState, useState, useTransition } from "react";
import {
  KeyRoundIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserPlusIcon,
  UserXIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changeOwnPassword,
  changeRole,
  inviteUser,
  removeUser,
  toggleDisabled,
  type UserActionResult,
} from "@/app/admin/users/actions";

export type AccountRow = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "editor";
  disabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const selectClass =
  "h-9 rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Feedback({ state }: { state: UserActionResult | undefined }) {
  if (!state) return null;
  return (
    <p
      role="alert"
      className={cn(
        "rounded-lg px-3 py-2 text-xs",
        state.ok
          ? "bg-brand-teal/10 text-brand-teal"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {state.ok ? state.message : state.message}
    </p>
  );
}

function AccountRowItem({
  account,
  isSelf,
}: {
  account: AccountRow;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function run(action: () => Promise<UserActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <li
      className={cn(
        "rounded-xl border bg-card px-4 py-3.5 transition-opacity",
        account.disabled ? "border-border/60 opacity-70" : "border-border",
        pending && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
            {isSelf ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[0.625rem] uppercase text-primary">
                You
              </span>
            ) : null}
            {account.disabled ? (
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[0.625rem] uppercase text-muted-foreground">
                Disabled
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{account.email}</p>
          <p className="mt-1 font-mono text-[0.6875rem] text-muted-foreground">
            {account.lastLoginAt
              ? `last signed in ${new Date(account.lastLoginAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : "never signed in"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={account.role}
            disabled={pending}
            onChange={(event) =>
              run(() => changeRole(account.id, event.target.value as "owner" | "editor"))
            }
            aria-label={`Role for ${account.name}`}
            className={selectClass}
          >
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>

          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending || isSelf}
            aria-label={
              account.disabled ? `Enable ${account.name}` : `Disable ${account.name}`
            }
            title={isSelf ? "You cannot disable your own account" : undefined}
            onClick={() => run(() => toggleDisabled(account.id, !account.disabled))}
          >
            {account.disabled ? <ShieldCheckIcon /> : <UserXIcon />}
          </Button>

          {confirmingDelete ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => run(() => removeUser(account.id))}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending || isSelf}
              aria-label={`Delete ${account.name}`}
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2Icon />
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function UserAdmin({
  accounts,
  currentUserId,
  isOwner,
}: {
  accounts: AccountRow[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const [inviteState, inviteAction, inviting] = useActionState<
    UserActionResult | undefined,
    FormData
  >(inviteUser, undefined);

  const [passwordState, passwordAction, changingPassword] = useActionState<
    UserActionResult | undefined,
    FormData
  >(changeOwnPassword, undefined);

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      <div className="min-w-0">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
        </h2>
        <ul className="mt-3 space-y-2">
          {accounts.map((account) => (
            <AccountRowItem
              key={account.id}
              account={account}
              isSelf={account.id === currentUserId}
            />
          ))}
        </ul>
      </div>

      <aside className="space-y-6">
        {isOwner ? (
          <form
            action={inviteAction}
            className="space-y-3 rounded-xl border border-border bg-card/40 px-4 py-4"
          >
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Add an account
            </h2>
            <p className="text-xs text-muted-foreground">
              You set the password and pass it on. They can change it from this
              page once they are in.
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">Name</Label>
              <Input id="invite-name" name="name" required className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="off"
                required
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-password">Password</Label>
              <Input
                id="invite-password"
                name="password"
                type="password"
                /* `new-password` rather than off, so a password manager offers
                   to generate one instead of filling in the operator's own. */
                autoComplete="new-password"
                minLength={12}
                required
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">At least 12 characters.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <select id="invite-role" name="role" className={cn(selectClass, "h-9 w-full")}>
                <option value="editor">Editor: writing and moderation</option>
                <option value="owner">Owner: also manages accounts</option>
              </select>
            </div>

            <Feedback state={inviteState} />

            <Button type="submit" size="sm" disabled={inviting} className="w-full">
              {inviting ? <LoaderCircleIcon className="animate-spin" /> : <UserPlusIcon />}
              Create the account
            </Button>
          </form>
        ) : null}

        <form
          action={passwordAction}
          className="space-y-3 rounded-xl border border-border bg-card/40 px-4 py-4"
        >
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Change your password
          </h2>
          <p className="text-xs text-muted-foreground">
            This signs out every device, including this one.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Again</Label>
            <Input
              id="confirm-password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              className="h-9"
            />
          </div>

          <Feedback state={passwordState} />

          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={changingPassword}
            className="w-full"
          >
            {changingPassword ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <KeyRoundIcon />
            )}
            Change it
          </Button>
        </form>
      </aside>
    </div>
  );
}

export { UserAdmin };
