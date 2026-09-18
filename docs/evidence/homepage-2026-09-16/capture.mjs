// Screenshot runner over the Chrome DevTools Protocol. No dependencies (Node ≥ 22 for WebSocket).
// Usage: node capture.mjs <plan.json> <outDir>
// plan: [{ name, url, width, height, scrollY?, scrollTo?, eval?, reducedMotion?, dark?, mobile?, waitMs?, settleMs?, fullPage? }]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const [,, planPath, outDir] = process.argv;
const plan = JSON.parse(readFileSync(planPath, "utf8"));
mkdirSync(outDir, { recursive: true });
const port = 9333 + Math.floor(Math.random() * 200);
const profile = join(tmpdir(), `cdp-profile-${port}`);
const chrome = spawn(process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--disable-gpu",
  "--force-device-scale-factor=1", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getTarget() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json/list`); const t = (await r.json()).find((x) => x.type === "page"); if (t) return t; } catch {}
    await sleep(200);
  }
  throw new Error("chrome did not start");
}
const target = await getTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map(); const consoleErrors = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method === "Runtime.exceptionThrown") consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text);
  else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
};
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + JSON.stringify(m.error))) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
await send("Page.enable"); await send("Runtime.enable");
const results = [];
for (const shot of plan) {
  const { name, url, width = 1440, height = 900, scrollY = 0, scrollTo, reducedMotion = false, dark = false, waitMs = 1200, fullPage = false, eval: evalExpr, mobile = false } = shot;
  consoleErrors.length = 0;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [
    { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" },
    { name: "prefers-color-scheme", value: dark ? "dark" : "light" },
  ] });
  await send("Page.navigate", { url });
  await sleep(600);
  for (let i = 0; i < 60; i++) { if ((await evaluate("document.readyState")) === "complete") break; await sleep(100); }
  await sleep(waitMs);
  if (scrollTo) await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(scrollTo)});if(el){el.scrollIntoView({block:'start',behavior:'instant'});}return window.scrollY})()`);
  if (scrollY) await evaluate(`window.scrollTo({top:${scrollY},behavior:'instant'}); window.scrollY`);
  if (evalExpr) await evaluate(evalExpr);
  await sleep(shot.settleMs ?? 700);
  const metrics = await evaluate("({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth, sh:document.documentElement.scrollHeight, y:window.scrollY})");
  const params = { format: "png", captureBeyondViewport: false };
  if (fullPage) { params.captureBeyondViewport = true; params.clip = { x: 0, y: 0, width, height: Math.min(metrics.sh, 12000), scale: 1 }; }
  const { data } = await send("Page.captureScreenshot", params);
  const file = join(outDir, `${name}.png`);
  writeFileSync(file, Buffer.from(data, "base64"));
  results.push({ name, file, ...metrics, overflow: metrics.sw > metrics.cw, consoleErrors: [...consoleErrors] });
  console.log(`${name}: y=${metrics.y} scrollW=${metrics.sw} clientW=${metrics.cw} docH=${metrics.sh}${metrics.sw > metrics.cw ? "  ** HORIZONTAL OVERFLOW **" : ""}${consoleErrors.length ? `  ** ${consoleErrors.length} console error(s) **` : ""}`);
  for (const e of consoleErrors) console.log("   console: " + String(e).slice(0, 300));
}
ws.close(); chrome.kill();
writeFileSync(join(outDir, "_results.json"), JSON.stringify(results, null, 2));
