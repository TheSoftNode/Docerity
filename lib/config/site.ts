export const siteConfig = {
  name: "Docerity",
  url: "https://www.docerity.com",
  tagline: "Engineering · Mentorship · Tech Explainers",
  description:
    "Docerity builds production software, takes on ambitious projects, and mentors the next generation of engineers.",
  email: "thesoftnode@gmail.com",
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    x: "https://x.com",
  },
} as const;

export const navLinks = [
  { label: "Projects", href: "/projects" },
  { label: "AI", href: "/ai" },
  { label: "Web3", href: "/web3" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

/*
  The footer carries more than the header.

  Reviews is deliberately not in `navLinks`: it is reached from the testimonials
  section, which is where somebody is already reading reviews when they want
  more of them.

  This used to claim the header could not hold a seventh item. Measured across
  1024 to 1728, seven fit with room to spare: at the tightest width the nav ends
  59px short of the button. The claim cost two pages their place in the header
  before anybody checked it.
*/
export const footerLinks = [
  ...navLinks,
  { label: "Reviews", href: "/reviews" },
  { label: "Write for us", href: "/contribute" },
] as const;
