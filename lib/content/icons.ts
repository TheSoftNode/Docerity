import {
  ArmchairIcon,
  ArrowRightLeftIcon,
  BellIcon,
  BoxIcon,
  BrainIcon,
  ChefHatIcon,
  ClockIcon,
  CloudIcon,
  CodeIcon,
  CoinsIcon,
  CompassIcon,
  ConciergeBellIcon,
  CpuIcon,
  DatabaseIcon,
  FileTextIcon,
  FilterIcon,
  GaugeIcon,
  GitForkIcon,
  GlobeIcon,
  HardDriveIcon,
  KeyIcon,
  LandmarkIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LinkIcon,
  ListIcon,
  LockIcon,
  MapIcon,
  MessageSquareIcon,
  NetworkIcon,
  PackageIcon,
  PenLineIcon,
  PuzzleIcon,
  RadioIcon,
  RecycleIcon,
  RouteIcon,
  RulerIcon,
  ScaleIcon,
  SearchIcon,
  ServerIcon,
  Share2Icon,
  ShieldIcon,
  ShoppingCartIcon,
  SignpostIcon,
  SplitIcon,
  StickyNoteIcon,
  TerminalIcon,
  TimerIcon,
  TrafficConeIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon names that can be stored in the database.
 *
 * A post's icon has to survive a round trip through MongoDB, and a React
 * component cannot. So the document stores a name and this maps it back. The
 * registry is explicit rather than a dynamic import keyed on the stored string,
 * for two reasons: an arbitrary name from the database would be a path into the
 * module graph, and a bundler cannot tree-shake an import it cannot see, so the
 * dynamic version would ship every icon lucide has.
 *
 * Adding an icon means adding it here. That is the intended friction: the
 * picker in the editor is built from this object, so anything absent is not
 * offered and cannot be stored.
 */
export const CONTENT_ICONS = {
  ArmchairIcon,
  ArrowRightLeftIcon,
  BellIcon,
  BoxIcon,
  BrainIcon,
  ChefHatIcon,
  ClockIcon,
  CloudIcon,
  CodeIcon,
  CoinsIcon,
  CompassIcon,
  ConciergeBellIcon,
  CpuIcon,
  DatabaseIcon,
  FileTextIcon,
  FilterIcon,
  GaugeIcon,
  GitForkIcon,
  GlobeIcon,
  HardDriveIcon,
  KeyIcon,
  LandmarkIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LinkIcon,
  ListIcon,
  LockIcon,
  MapIcon,
  MessageSquareIcon,
  NetworkIcon,
  PackageIcon,
  PenLineIcon,
  PuzzleIcon,
  RadioIcon,
  RecycleIcon,
  RouteIcon,
  RulerIcon,
  ScaleIcon,
  SearchIcon,
  ServerIcon,
  Share2Icon,
  ShieldIcon,
  ShoppingCartIcon,
  SignpostIcon,
  SplitIcon,
  StickyNoteIcon,
  TerminalIcon,
  TimerIcon,
  TrafficConeIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
  ZapIcon,
} as const satisfies Record<string, LucideIcon>;

export type ContentIconName = keyof typeof CONTENT_ICONS;

/** Every name, for the editor's picker. Sorted so the list is predictable. */
export const CONTENT_ICON_NAMES = Object.keys(CONTENT_ICONS).sort() as ContentIconName[];

export function isContentIconName(value: unknown): value is ContentIconName {
  return typeof value === "string" && value in CONTENT_ICONS;
}

/**
 * Falls back rather than throwing.
 *
 * A name can go stale: an icon removed from this registry, or one renamed by a
 * lucide major version, leaves documents pointing at something that no longer
 * exists. Rendering a generic icon is the right failure for that, because the
 * alternative is a blank page over a missing decoration.
 */
export function iconFor(name: string | undefined | null): LucideIcon {
  return isContentIconName(name) ? CONTENT_ICONS[name] : FileTextIcon;
}

/**
 * The reverse lookup: a component back to its registered name.
 *
 * Needed because a React component cannot cross the server/client boundary. The
 * static posts in `blog-data.ts` hold icon components directly, so anything
 * handing those to a Client Component has to convert them to names first, and
 * the client resolves them again with `iconFor`.
 *
 * Built once at module load rather than scanned per call: it is a linear search
 * over fifty entries otherwise, run for every icon on the blog index.
 */
const NAME_BY_ICON = new Map<LucideIcon, ContentIconName>(
  (Object.entries(CONTENT_ICONS) as [ContentIconName, LucideIcon][]).map(
    ([name, Icon]) => [Icon, name]
  )
);

/** Falls back to a generic name for an icon that is not in the registry. */
export function nameForIcon(Icon: LucideIcon): ContentIconName {
  return NAME_BY_ICON.get(Icon) ?? "FileTextIcon";
}
