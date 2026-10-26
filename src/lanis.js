const MEIN_UNTERRICHT = "https://start.schulportal.hessen.de/meinunterricht.php";

// Liest "Aktuelle Einträge" in "mein Unterricht" und gibt nur Einträge mit Hausaufgabe zurück.
export async function leseLanis(page) {
  await page.goto(MEIN_UNTERRICHT, { waitUntil: "networkidle" });

  const rows = await page.$$eval("tr[data-book]", (trs) =>
    trs.map((tr) => {
      const text = (sel) => tr.querySelector(sel)?.textContent.replace(/\s+/g, " ").trim() ?? "";
      const hw = tr.querySelector(".homework");
      const hwEl = hw?.querySelector(".realHomework")?.cloneNode(true);
      if (hwEl) {
        hwEl.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
        hwEl.querySelectorAll("li, p, div").forEach((b) => b.append("\n"));
      }
      const hwText = hwEl ? hwEl.textContent.replace(/\n+/g, "\n").trim() : "";
      const abgabe = [...tr.querySelectorAll(".dropdown-menu small")]
        .map((s) => s.textContent.replace(/\s+/g, " ").trim())
        .find((t) => t.startsWith("bis "));
      return {
        fach: text(".name"),
        thema: text(".thema"),
        eintragsdatum: text(".datum"),
        hatHausaufgabe: Boolean(hw),
        erledigt: hw ? !hw.querySelector(".done")?.classList.contains("hidden") : false,
        aufgabe: hwText,
        abgabe: abgabe ?? "",
      };
    })
  );

  if (!rows.length) {
    throw new Error("Lanis: keine Kursmappen-Zeilen gefunden. Hat sich die Seitenstruktur geändert?");
  }
  return rows.filter((r) => r.hatHausaufgabe).map((r) => ({ ...r, quelle: "Lanis" }));
}
