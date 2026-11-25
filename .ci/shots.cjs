const { chromium, devices } = require("@playwright/test"); const fs = require("fs");
(async () => { const b = await chromium.launch(); const notes = [];
  for (const [name, opts] of [["desk", { viewport: { width: 1440, height: 900 } }], ["laptop", { viewport: { width: 1280, height: 720 } }], ["phone", devices["iPhone 13"]]]) {
    const p = await (await b.newContext(opts)).newPage();
    await p.goto("http://localhost:3000/theo", { waitUntil: "networkidle", timeout: 120000 }); await p.waitForTimeout(1500);
    await p.screenshot({ path: `ci-shots/theo-${name}-first.png` });
    await p.screenshot({ path: `ci-shots/theo-${name}-hero.png`, clip: { x: 0, y: 0, width: opts.viewport ? opts.viewport.width : 390, height: 2000 }, fullPage: true });
    notes.push(name + " overflow " + (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) + " h1 top " + (await p.evaluate(() => Math.round(document.querySelector("main h1").getBoundingClientRect().top))) + " getintouch visible-first-screen " + (await p.evaluate(() => { const a = [...document.querySelectorAll("main a")].find((x) => /Get in touch/.test(x.textContent)); return a ? a.getBoundingClientRect().bottom < innerHeight : false; })));
  }
  fs.writeFileSync("ci-shots/notes.txt", notes.join("\n")); await b.close();
})().catch((e) => { fs.writeFileSync("ci-shots/notes.txt", "ERR " + e.stack); });
