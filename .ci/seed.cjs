const mongoose = require("mongoose");
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const c = mongoose.connection.collection("projects");
  const base = { published: true, featured: false, tags: ["Next.js", "TypeScript"], groups: ["Full-stack"], preview: "dashboard", body: [], gallery: [], results: [], contributions: [] };
  const rows = [
    ["uri-social", "URI Social", "professional", "Live", "CTO: architecture, releases and standards; wrote about half the code", "/work/eep.webp", "Uri"],
    ["smartguard", "SmartGuard", "professional", "Live", "Senior software engineer: own the product end to end", "/projects/hitoai.webp", "SmartComply"],
    ["qwikpass", "QwikPass", "professional", "In progress", "Lead engineer: the Firebase backend and the Flutter apps", "", "Coretrix Technologies"],
    ["metapilot", "MetaPilot", "hackathon", "Live", "Full-stack and smart contracts", "/work/metapilot.webp", ""],
    ["stacktip", "StackTip", "hackathon", "Live", "Full-stack and Clarity contracts", "/work/stacktip.webp", ""],
    ["docmeet", "DocMeet", "prototype", "Discontinued", "Sole engineer: designed and built the app", "/projects/docmeet.webp", ""],
  ];
  let i = 0;
  for (const [slug, name, showcase, status, role, src, client] of rows) {
    await c.insertOne({ ...base, slug, name, showcase, status, role, client, category: "Product", sortOrder: ++i,
      description: "A short description of what this project does and who it is for, long enough to wrap onto a second and third line in the card.",
      media: src ? { type: "image", src, alt: name + " screenshot", publicId: "" } : undefined, createdAt: new Date(), updatedAt: new Date() });
  }
  console.log("seeded", i); await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
