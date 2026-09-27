import type { NextConfig } from "next";

/*
  Security headers are set here rather than in `proxy.ts`.

  Both can do it, but proxy runs a function on every matched request, and these
  values never vary by request. Next 16's proxy docs are explicit that it is
  meant to be deployed to the CDN and should not rely on shared modules, so
  static response headers belong in config where they cost nothing.
*/
const securityHeaders = [
  /* Stops a browser from second-guessing a declared Content-Type; the
     mechanism behind "upload a .txt, get it executed as script". */
  { key: "X-Content-Type-Options", value: "nosniff" },

  /* No framing, so the site cannot be loaded invisibly over another page to
     harvest clicks. CSP's frame-ancestors is the modern form; this covers
     clients that predate it. */
  { key: "X-Frame-Options", value: "DENY" },

  /* Send the origin to other sites but the full path within our own, so an
     outbound link never leaks which page someone was reading. */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  /* Features this site never uses. Declaring them off means an injected
     script cannot quietly ask for a microphone. */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },

  /* Two years, including subdomains: browsers refuse plain HTTP for
     docerity.com entirely, which closes the redirect window an attacker on
     the same network could otherwise intercept. */
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  /*
    Cloudinary is the only remote host images may come from.

    Anything editable in the admin that takes a picture accepts either a path
    under /public or an upload, and an upload is delivered from here. Next
    refuses a remote source it has not been told about, so without this the
    first uploaded client logo or headshot would be a runtime error rather than
    a picture.

    Narrow on purpose: `remotePatterns` is what stops the image optimiser being
    an open proxy that will fetch and re-serve anything anybody puts in a URL.
  */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        /*
          API responses are per-request and must never be cached by a CDN or a
          browser. Without this an intermediary can serve one caller's response
          to another.
        */
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
