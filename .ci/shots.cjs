const { chromium, devices } = require("@playwright/test");
const fs = require("fs");
const BASE = "http://localhost:3000";
const notes = [];
const log = (s) => { notes.push(s); console.log(s); };
(async () => {
  fs.mkdirSync("ci-shots", { recursive: true });
  const browser = await chromium.launch();
  try {
    const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await p.goto(BASE + "/", { waitUntil: "load" }); await p.waitForTimeout(1500);
    log("header: " + (await p.locator("header nav a").allInnerTexts()).join(" | "));
    log("footer: " + (await p.locator("footer a").allInnerTexts()).slice(0, 12).join(" | "));
    await p.screenshot({ path: "ci-shots/d-header.jpg", type: "jpeg", quality: 60 });
    const m = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
    await m.goto(BASE + "/", { waitUntil: "load" }); await m.waitForTimeout(1200);
    await m.getByRole("button", { name: /menu/i }).first().click(); await m.waitForTimeout(800);
    await m.screenshot({ path: "ci-shots/m-menu.jpg", type: "jpeg", quality: 60 });
    log("phone menu has Academy: " + (await m.getByRole("link", { name: /^Academy$/ }).count()));
    const a = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await a.goto(BASE + "/admin/login", { waitUntil: "load" });
    await a.getByLabel("Email").fill("admin@example.com");
    await a.getByLabel("Password").fill("admin-password-123");
    await a.getByRole("button", { name: /sign in/i }).click(); await a.waitForTimeout(3000);
    await a.goto(BASE + "/admin/content/site", { waitUntil: "load" }); await a.waitForTimeout(1500);
    const values = await a.locator("input").evaluateAll((els) => els.map((e) => e.value));
    log("editor has /academy: " + values.includes("/academy"));
    await a.screenshot({ path: "ci-shots/a-site-settings.jpg", type: "jpeg", quality: 60, fullPage: true });
  } catch (e) { log("ERROR " + e.message.slice(0, 400)); }
  fs.writeFileSync("ci-shots/notes.txt", notes.join("\n"));
  await browser.close();
})();
