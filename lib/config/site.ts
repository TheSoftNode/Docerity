export const siteConfig = {
  name: "Docerity",
  url: "https://docerity.dev",
  tagline: "Engineering · Mentorship · Tech Explainers",
  description:
    "Docerity builds production software, takes on ambitious projects, and mentors the next generation of engineers.",
  email: "hello@docerity.dev",
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    x: "https://x.com",
  },
} as const;

export const navLinks = [
  { label: "Work", href: "/work" },
  { label: "AI", href: "/ai" },
  { label: "Web3", href: "/web3" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "Blog", href: "/blog" },
] as const;
