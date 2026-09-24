import { test as base, expect, type Page, type BrowserContext } from "@playwright/test";

export const test = base.extend<{ browserDiagnostics: void }>({
  browserDiagnostics: [async ({ browser, context }, use, info) => {
    const unexpected: string[] = [], network: string[] = [];
    const initialize = async (target: BrowserContext) => {
      const observe = (page: Page) => {
        page.on("pageerror", error => unexpected.push(`${page.url()}: ${error.message}`));
        page.on("console", message => {
          if (message.type() !== "error") return;
          // Rejection/offline tests intentionally cause network errors. Their exact
          // responses are asserted in the case; retain these messages as evidence.
          if (/^Failed to load resource:|^net::ERR_/.test(message.text())) network.push(message.text());
          else unexpected.push(`${page.url()}: ${message.text()}`);
        });
      };
      target.pages().forEach(observe); target.on("page", observe);
    };
    // Cases exercising two devices use browser.newContext/newPage as well as the
    // default context. Install diagnostics before either device can navigate.
    const originalNewContext = browser.newContext;
    browser.newContext = async function (options) {
      const created = await originalNewContext.call(this, options);
      await initialize(created);
      return created;
    };
    await initialize(context);
    try { await use(); }
    finally { browser.newContext = originalNewContext; }
    await info.attach("browser-diagnostics", { body: JSON.stringify({ unexpected, network }, null, 2), contentType: "application/json" });
    expect(unexpected, "Unhandled JavaScript and unexpected console errors").toEqual([]);
  }, { auto: true }],
});
export { expect };
