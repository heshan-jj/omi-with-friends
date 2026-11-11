import { test, expect, type Page } from "@playwright/test";
import type { View } from "../lib/protocol";
async function state(page: Page) {
  return page.evaluate(
    () => (window as unknown as { omiTestState: View }).omiTestState,
  );
}
async function observe(page: Page) {
  await page.addInitScript(() => {
    const Native = window.WebSocket;
    window.WebSocket = class extends Native {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        this.addEventListener("message", (e) => {
          try {
            const message = JSON.parse(e.data);
            if (message.type === "state")
              (window as unknown as { omiTestState: unknown }).omiTestState =
                message.state;
          } catch {}
        });
      }
    };
  });
}
test("home, invite validation, rules, and responsive layout", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A table for your friends." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create a private table" }),
  ).toBeEnabled();
  await page
    .locator(".motion-preview")
    .evaluate((el) =>
      Promise.all(
        el
          .getAnimations({ subtree: true })
          .map((a) => a.finished.catch(() => {})),
      ),
    );
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "How to play" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Your name").fill("Heshan");
  await page.getByLabel("Room code or invite link").fill("wrong");
  await page.getByRole("button", { name: "Join table", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "8-character" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Room code or invite link").fill("");
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Create a private table" }).click();
  await expect(page).toHaveURL(/\/room\/[a-z0-9]{8}$/);
  await expect(
    page.getByRole("button", { name: "Take seat 1, Team 1" }),
  ).toBeVisible();
});
test("four friends play a private hand, preserve hidden cards, and reconnect", async ({
  browser,
}) => {
  const code = Math.random().toString(36).slice(2, 10).padEnd(8, "0");
  const contexts = await Promise.all(
    [0, 1, 2, 3].map((i) =>
      browser.newContext({
        viewport: { width: 1280, height: 900 },
        reducedMotion: i === 2 ? "reduce" : "no-preference",
      }),
    ),
  );
  const pages = await Promise.all(contexts.map((c) => c.newPage()));
  const errors: string[] = [];
  for (const p of pages) {
    p.on("pageerror", (e) => errors.push(e.message));
    await observe(p);
  }
  try {
    for (let i = 0; i < 4; i++) {
      await pages[i].goto(`/room/${code}`);
      await pages[i]
        .getByLabel("Your name", { exact: true })
        .fill(["Heshan", "Amal", "Nimali", "Kasun"][i]);
      await pages[i]
        .getByRole("button", {
          name: `Take seat ${i + 1}, Team ${(i % 2) + 1}`,
        })
        .click();
      await expect(
        pages[i].getByRole("button", { name: "Ready to play" }),
      ).toBeVisible();
    }
    await pages[0].screenshot({
      path: "test-results/lobby-desktop.png",
      fullPage: true,
    });
    for (const p of pages)
      await p.getByRole("button", { name: "Ready to play" }).click();
    await pages[0].getByRole("button", { name: "Start game" }).click();
    await expect.poll(async () => (await state(pages[0]))?.phase).toBe("trump");
    const first = await state(pages[0]);
    expect(first.hand).toHaveLength(4);
    expect(first).not.toHaveProperty("hands");
    expect(JSON.stringify(first)).not.toContain('"key"');
    await expect(
      pages[first.caller].getByRole("heading", {
        name: "Choose the trump suit",
      }),
    ).toBeVisible();
    const callerPage = pages[first.caller];
    await expect(callerPage.locator(".hand-label")).toContainText(
      "Choose trump",
    );
    await expect(
      pages[(first.caller + 1) % 4].locator(".hand-label"),
    ).toContainText("4 more cards after trump is chosen");
    await expect(
      callerPage.getByRole("status", { name: "Trump suit" }),
    ).toContainText("Not chosen yet");
    const away = first.caller === 3 ? 2 : 3;
    await pages[away].goto("about:blank");
    await expect.poll(async () => (await state(pages[0])).paused).toBe(true);
    await expect(
      callerPage.getByRole("heading", { name: "Game paused" }),
    ).toBeVisible();
    await expect(callerPage.locator(".table-status")).toContainText(
      ["Heshan", "Amal", "Nimali", "Kasun"][away],
    );
    await expect(
      callerPage.getByRole("button", { name: "hearts", exact: true }),
    ).toBeDisabled();
    await callerPage.screenshot({
      path: "test-results/paused-trump-desktop.png",
      fullPage: true,
    });
    await callerPage.setViewportSize({ width: 390, height: 844 });
    await callerPage.screenshot({
      path: "test-results/paused-trump-mobile.png",
      fullPage: true,
    });
    expect(
      await callerPage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await callerPage.setViewportSize({ width: 1280, height: 900 });
    await pages[away].goto(`/room/${code}`);
    await expect.poll(async () => (await state(pages[away]))?.you).toBe(away);
    await expect.poll(async () => (await state(pages[0])).paused).toBe(false);
    await callerPage
      .getByRole("button", { name: "hearts", exact: true })
      .click();
    await expect.poll(async () => (await state(pages[0])).phase).toBe("play");
    expect((await state(pages[0])).hand).toHaveLength(8);
    for (const p of pages)
      await expect(p.getByRole("status", { name: "Trump suit" })).toContainText(
        "hearts",
      );
    const hearts = (await state(pages[0])).hand.filter(
      (c) => c.suit === "hearts",
    ).length;
    await expect(pages[0].locator(".hand-card .card-trump-label")).toHaveCount(
      hearts,
    );
    await expect(pages[0].locator(".hand-card").last()).toHaveCSS(
      "opacity",
      "1",
    );
    expect(
      await pages[2].evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
    await pages[0].screenshot({
      path: "test-results/table-desktop.png",
      fullPage: true,
    });
    await pages[1].setViewportSize({ width: 390, height: 844 });
    await pages[1].screenshot({
      path: "test-results/table-mobile.png",
      fullPage: true,
    });
    expect(
      await pages[1].evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // Reload the same browser session; it must reclaim the original seat and hand.
    const handBefore = (await state(pages[2])).hand;
    await pages[2].reload();
    await expect.poll(async () => (await state(pages[2]))?.you).toBe(2);
    expect((await state(pages[2])).hand).toEqual(handBefore);
    // Drop a socket and hold the table, then restore the same credential.
    await pages[3].goto("about:blank");
    await expect.poll(async () => (await state(pages[0])).paused).toBe(true);
    await expect(
      pages[0].getByRole("heading", { name: "Game paused" }),
    ).toBeVisible();
    await pages[3].goto(`/room/${code}`);
    await expect.poll(async () => (await state(pages[3]))?.you).toBe(3);
    await expect.poll(async () => (await state(pages[0])).paused).toBe(false);
    // Complete all eight tricks through real browser controls.
    for (let played = 0; played < 32; played++) {
      await expect
        .poll(async () => (await state(pages[0])).phase, { timeout: 10000 })
        .toBe("play");
      const v = await state(pages[0]);
      const p = pages[v.turn];
      await expect.poll(async () => (await state(p)).turn).toBe(v.turn);
      await p.locator(".hand-card:not([disabled])").first().click();
      await expect
        .poll(async () => {
          const n = await state(pages[0]);
          return (
            n.turn !== v.turn ||
            n.phase !== "play" ||
            n.trick.length !== v.trick.length
          );
        })
        .toBe(true);
      expect(
        await pages[1].evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await expect
      .poll(async () => (await state(pages[0])).phase, { timeout: 10000 })
      .toBe("hand-end");
    const done = await state(pages[0]);
    expect(done.tricks[0] + done.tricks[1]).toBe(8);
    expect(done.hand).toHaveLength(0);
    expect(done.result).not.toBeNull();
    await pages[0].getByRole("button", { name: "Deal next round" }).click();
    await expect.poll(async () => (await state(pages[0])).handNumber).toBe(2);
    expect((await state(pages[0])).scores).toEqual(done.scores);
    expect(errors).toEqual([]);
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});

test("Enter in the invite field joins the supplied room", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Your name").fill("Heshan");
  await page
    .getByLabel("Room code or invite link")
    .fill("http://127.0.0.1:3000/room/enter123");
  await page.getByLabel("Room code or invite link").press("Enter");
  await expect(page).toHaveURL("/room/enter123");
  await expect(
    page.getByRole("button", { name: "Take seat 1, Team 1" }),
  ).toBeVisible();
});
