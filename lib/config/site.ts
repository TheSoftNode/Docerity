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
  { label: "Work", href: "/work" },
  { label: "AI", href: "/ai" },
  { label: "Web3", href: "/web3" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

/*
  The footer carries one more than the header.

  Reviews is deliberately not in `navLinks`: the header is already six items
  wide and a seventh pushes the row into the primary button at the widths the
  layout tests cover. The page is reached from the testimonials section, which
  is where somebody is already reading reviews when they want more of them.
*/
export const footerLinks = [...navLinks, { label: "Reviews", href: "/reviews" }] as const;
