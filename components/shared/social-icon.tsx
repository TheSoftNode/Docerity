import { LinkIcon } from "lucide-react";

import { GithubIcon, LinkedinIcon, XIcon } from "@/components/shared/social-icons";

/**
 * The mark for a social link, chosen by its name.
 *
 * Matched rather than picked from the icon registry, which carries interface
 * icons and no brand marks: asking somebody to choose "CodeIcon" to mean GitHub
 * is a worse answer than recognising the word they already typed.
 *
 * Anything unrecognised gets a generic link icon, so adding a platform is still
 * a working link today and a mark here whenever one is drawn.
 */
const MARKS: Record<string, typeof GithubIcon> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  twitter: XIcon,
};

function SocialIcon({ label, className }: { label: string; className?: string }) {
  const Mark = MARKS[label.trim().toLowerCase()];
  if (Mark) return <Mark className={className} />;
  return <LinkIcon className={className} />;
}

export { SocialIcon };
