import { chromium } from "playwright";

const SCHULNUMMER = "6328";
const LOGIN_URL = `https://login.schulportal.hessen.de/?i=${SCHULNUMMER}`;

export async function starteBrowser() {
  const user = process.env.LANIS_USER;
  const pass = process.env.LANIS_PASS;
  if (!user || !pass) {
    throw new Error("LANIS_USER und/oder LANIS_PASS sind nicht gesetzt.");
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: "de-DE" });
  const page = await context.newPage();

  await page.goto(LOGIN_URL, { waitUntil: "networkidle" });
  await page.fill("#username2", user);
  await page.fill("#inputPassword", pass);
  await Promise.all([
    page.waitForURL((u) => !u.href.startsWith(LOGIN_URL), { timeout: 30000 }).catch(() => {}),
    page.click("#tlogin"),
  ]);
  await page.waitForLoadState("networkidle");

  if (await page.locator("#inputPassword").count()) {
    await browser.close();
    throw new Error("Login fehlgeschlagen: Die Login-Seite ist noch sichtbar. Benutzername/Passwort prüfen.");
  }
  return { browser, context, page };
}
