import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { starteBrowser } from "./login.js";
import { leseLanis } from "./lanis.js";

const AUSGABE = fileURLToPath(new URL("../hausaufgaben.txt", import.meta.url));

// "22.10.2026" -> Date; Fallback: sehr spät, damit Einträge ohne Datum hinten landen.
function parseDatum(s) {
  const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : new Date(8640000000000000);
}

// Abgabefrist ("bis Do, 29.10. um 08:45 Uhr") hat kein Jahr: Jahr vom Eintragsdatum nehmen.
function faelligkeit(e) {
  const m = e.abgabe.match(/(\d{2})\.(\d{2})\.\s*um\s*(\d{2}):(\d{2})/);
  if (m) {
    const jahr = parseDatum(e.eintragsdatum).getFullYear();
    return { datum: new Date(jahr, +m[2] - 1, +m[1], +m[3], +m[4]), text: `${e.abgabe} (Abgabe)` };
  }
  return { datum: parseDatum(e.eintragsdatum), text: `keine Frist angegeben (Eintrag vom ${e.eintragsdatum})` };
}

const { browser, page } = await starteBrowser();
let eintraege;
try {
  eintraege = await leseLanis(page);
} finally {
  await browser.close();
}

const sortiert = eintraege
  .map((e) => ({ ...e, f: e.frist ?? faelligkeit(e) }))
  .sort((a, b) => a.f.datum - b.f.datum);

const block = (e) =>
  [
    `Fach: ${e.fach}`,
    `Aufgabe: ${e.aufgabe || "(kein Text hinterlegt)"}`,
    `Fälligkeit: ${e.f.text}`,
    `Status: ${e.erledigt ? "erledigt" : "offen"}`,
    `Quelle: ${e.quelle}`,
  ].join("\n");

const offen = sortiert.filter((e) => !e.erledigt);
const erledigt = sortiert.filter((e) => e.erledigt);
const stand = new Date().toLocaleString("de-DE");
const text =
  `Hausaufgaben (Stand ${stand})\n\n` +
  `=== OFFEN (${offen.length}) ===\n\n${offen.map(block).join("\n\n") || "Keine."}\n\n` +
  `=== ERLEDIGT (${erledigt.length}) ===\n\n${erledigt.map(block).join("\n\n") || "Keine."}\n`;

await writeFile(AUSGABE, text, "utf8");
console.log(`hausaufgaben.txt geschrieben: ${offen.length} offen, ${erledigt.length} erledigt.`);
