import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /*
    `btn-shape` cuts two opposite corners away (see `app/globals.css`).

    Two consequences follow from clipping rather than rounding. The focus
    indicator is an outline drawn *inside* the element via a negative offset,
    because `ring-*` paints outside and the clip erases it, so a keyboard user
    would be left with no indicator at all. `aria-invalid` gets the same
    treatment for the same reason.

    An inset `box-shadow` was tried first and silently produced nothing:
    Tailwind composes `box-shadow` from several custom properties, and the
    colour in an arbitrary `shadow-[...]` value was dropped on the way through.
    `outline` is a plain property with no such composition, but it needs
    `outline-solid` alongside the width, because the base `outline-none` sets
    the style to `none` and a width alone leaves it there.

    The indicator is `--foreground`, not `--ring`. The ring colour is the same
    sapphire as the primary button's fill, so on the site's most-used button
    the focus outline was invisible: present in the computed style and
    impossible to see. Near-white clears 3:1 against both the sapphire fill
    and the dark translucent one.
  */
  "group/button btn-shape rounded-[0.3rem] inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-foreground focus-visible:-outline-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-solid aria-invalid:outline-2 aria-invalid:outline-destructive aria-invalid:-outline-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* The glow is a `drop-shadow` filter, not a box-shadow: `clip-path`
           clips anything painted outside the element, so a box-shadow would
           never appear. A filter is applied after the clip and traces the
           chamfered silhouette. The fill stays flat: white on
           `--brand-primary` already measures 4.21:1, and mixing violet in
           would darken it further. */
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:[filter:drop-shadow(0_8px_18px_color-mix(in_oklch,var(--brand-primary),transparent_55%))]",
        /* Filled rather than bordered. A border on a clipped element stops
           dead at each cut, leaving two bare diagonals and four truncated
           edges, which reads as broken. A translucent fill gives the chamfer
           something to cut instead. */
        outline:
          "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.12] hover:text-foreground aria-expanded:bg-foreground/[0.12] aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 [--btn-chamfer:0.7rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 [--btn-chamfer:0.4rem] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 [--btn-chamfer:0.45rem] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 [--btn-chamfer:0.9rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8 [--btn-chamfer:0.55rem]",
        "icon-xs":
          "size-6 [--btn-chamfer:0.4rem] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 [--btn-chamfer:0.45rem] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9 [--btn-chamfer:0.6rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
