const mongoose = require("mongoose");
const { randomBytes, scryptSync } = require("node:crypto");
const hash = (password) => { const salt = randomBytes(16); const d = scryptSync(password.normalize("NFKC"), salt, 64, { N: 65536, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }); return ["scrypt", 65536, 8, 1, salt.toString("base64url"), d.toString("base64url")].join("$"); };
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  await db.collection("clientaccounts").insertOne({ email: "student@example.com", name: "Ada Student", company: "", passwordHash: hash("student-password-123"), emailVerifiedAt: new Date(), sessionVersion: 1, failedAttempts: 0, lockedUntil: null, disabledAt: null, createdAt: new Date(), updatedAt: new Date() });
  await db.collection("clientaccounts").insertOne({ email: "grace@example.com", name: "Grace Hopper", company: "", passwordHash: hash("grace-password-123"), emailVerifiedAt: new Date(), sessionVersion: 1, failedAttempts: 0, lockedUntil: null, disabledAt: null, createdAt: new Date(), updatedAt: new Date() });
  await db.collection("clientaccounts").insertOne({ email: "linus@example.com", name: "Linus Builder", company: "", passwordHash: hash("linus-password-123"), emailVerifiedAt: new Date(), sessionVersion: 1, failedAttempts: 0, lockedUntil: null, disabledAt: null, createdAt: new Date(), updatedAt: new Date() });
  await db.collection("clientaccounts").insertOne({ email: "margaret@example.com", name: "Margaret Coder", company: "", passwordHash: hash("margaret-password-123"), emailVerifiedAt: new Date(), sessionVersion: 1, failedAttempts: 0, lockedUntil: null, disabledAt: null, createdAt: new Date(), updatedAt: new Date() });
  await db.collection("clientaccounts").insertOne({ email: "alan@example.com", name: "Alan Maker", company: "", passwordHash: hash("alan-password-123"), emailVerifiedAt: new Date(), sessionVersion: 1, failedAttempts: 0, lockedUntil: null, disabledAt: null, createdAt: new Date(), updatedAt: new Date() });
  await db.collection("users").insertOne({ email: "admin@example.com", name: "Theo Admin", role: "owner", passwordHash: hash("admin-password-123"), failedAttempts: 0, lockedUntil: null, disabledAt: null, sessionVersion: 1, createdAt: new Date(), updatedAt: new Date() });
  await db.collection("sitecontents").insertOne({ key: "site", data: { navLinks: [{ label: "Projects", href: "/projects" }, { label: "AI", href: "/ai" }, { label: "Web3", href: "/web3" }, { label: "Mentorship", href: "/mentorship" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" }], footerLinks: [{ label: "Projects", href: "/projects" }, { label: "AI", href: "/ai" }, { label: "Web3", href: "/web3" }, { label: "Mentorship", href: "/mentorship" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" }, { label: "Reviews", href: "/reviews" }, { label: "Write for us", href: "/contribute" }] }, updatedBy: "theo", createdAt: new Date("2026-10-01"), updatedAt: new Date("2026-11-01") });
  console.log("seeded");
  await mongoose.disconnect();
})();
