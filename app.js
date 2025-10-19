document.addEventListener("DOMContentLoaded", () => {
  console.log("GeneratorCalc v5.0 – Stabil mit PDF-Infofeld");

  // -------- Kategorien & Presets --------
  const categories = {
    "Werkzeuge": [
      { name: "Bohrmaschine", watt: 800, pf: 0.9, startSurge: true, startMult: 2.5 },
      { name: "Winkelschleifer", watt: 1200, pf: 0.85, startSurge: true, startMult: 2.5 },
      { name: "Stichsäge", watt: 700, pf: 0.9, startSurge: true, startMult: 2.2 },
      { name: "Bohrhammer", watt: 1500, pf: 0.85, startSurge: true, startMult: 2.5 }
    ],
    "Haushalt": [
      { name: "Kühlschrank", watt: 150, pf: 0.8, startSurge: true, startMult: 3 },
      { name: "Gefriertruhe", watt: 200, pf: 0.8, startSurge: true, startMult: 3 },
      { name: "Wasserkocher", watt: 1800, pf: 1.0, startSurge: false, startMult: 1 },
      { name: "Mikrowelle", watt: 1200, pf: 0.9, startSurge: true, startMult: 1.2 }
    ],
    "Baumaschinen": [
      { name: "Kompressor", watt: 1500, pf: 0.85, startSurge: true, startMult: 3 },
      { name: "Betonmischer", watt: 1100, pf: 0.9, startSurge: true, startMult: 2.5 },
      { name: "Trennschleifer", watt: 2000, pf: 0.85, startSurge: true, startMult: 2.5 }
    ],
    "Camping": [
      { name: "Kühlbox", watt: 60, pf: 0.9, startSurge: true, startMult: 2 },
      { name: "Wasserpumpe", watt: 100, pf: 0.85, startSurge: true, startMult: 2.5 },
      { name: "Lichtsystem", watt: 50, pf: 0.95, startSurge: false, startMult: 1 }
    ]
  };

  // -------- DOM Referenzen --------
  const cat = document.getElementById("category");
  const preset = document.getElementById("presetSelect");
  const nameEl = document.getElementById("name");
  const wattEl = document.getElementById("watt");
  const pfEl = document.getElementById("pf");
  const multEl = document.getElementById("startMult");
  const surgeBox = document.getElementById("startSurge");
  const listEl = document.getElementById("deviceList");
  const resultEl = document.getElementById("resultDisplay");
  const chartCanvas = document.getElementById("loadChart");

  // -------- Kategorie Dropdown füllen --------
  cat.innerHTML = '<option value="">Kategorie auswählen ...</option>';
  Object.keys(categories).forEach(c => {
    const o = document.createElement("option");
    o.value = o.textContent = c;
    cat.appendChild(o);
  });

  // -------- Kategorieänderung → Geräte laden --------
  cat.addEventListener("change", () => {
    preset.innerHTML = '<option value="">Gerät auswählen ...</option>';
    const list = categories[cat.value] || [];
    list.forEach(d => {
      const o = document.createElement("option");
      o.value = d.name;
      o.textContent = `${d.name} (${d.watt} W)`;
      preset.appendChild(o);
    });
    nameEl.value = wattEl.value = pfEl.value = multEl.value = "";
    surgeBox.checked = false;
  });

  // -------- Gerätauswahl → Werte übernehmen --------
  preset.addEventListener("change", () => {
    const d = (categories[cat.value] || []).find(x => x.name === preset.value);
    if (!d) return;
    nameEl.value = d.name;
    wattEl.value = d.watt;
    pfEl.value = d.pf ?? "";
    multEl.value = d.startMult ?? "";
    surgeBox.checked = !!d.startSurge;
    pfEl.placeholder = "cos φ";
    multEl.placeholder = "Iₐ";
  });

  // -------- Geräteverwaltung --------
  let devices = [];
  try { devices = JSON.parse(localStorage.getItem("devices") || "[]"); } catch {}
  const save = () => localStorage.setItem("devices", JSON.stringify(devices));

  function updateList() {
    listEl.innerHTML = "";
    devices.forEach((d, i) => {
      const li = document.createElement("li");
      li.className = "device-item";
      let info = `${d.name}: ${d.watt} W`;
      const facts = [];
      if (d.useFactors && d.pf && d.pf != 1) facts.push(`cos φ ${d.pf}`);
      if (d.useFactors && d.startMult && d.startMult != 1) facts.push(`Iₐ ${d.startMult}`);
      if (facts.length) info += ` (${facts.join(", ")})`;
      const span = document.createElement("span");
      span.innerHTML = info;
      const del = document.createElement("button");
      del.textContent = "✖";
      del.onclick = () => { devices.splice(i, 1); save(); updateAll(); };
      li.appendChild(span);
      li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  // -------- Geräte hinzufügen --------
  document.getElementById("addDevice").addEventListener("click", () => {
    const name = nameEl.value.trim();
    const watt = parseFloat(wattEl.value);
    const pf = parseFloat(pfEl.value) || 1;
    const mult = parseFloat(multEl.value) || 1;
    const useFactors = surgeBox.checked;
    if (!name || isNaN(watt) || watt <= 0)
      return alert("Bitte Gerätename und gültige Leistung angeben.");

    devices.push({ name, watt, pf, startMult: mult, useFactors });
    save();
    updateAll();
    nameEl.value = wattEl.value = pfEl.value = multEl.value = "";
    surgeBox.checked = false;
  });

  document.getElementById("clearDevices").addEventListener("click", () => {
    if (!confirm("Alle Geräte wirklich löschen?")) return;
    devices = []; save(); updateAll();
  });

  // -------- Berechnung --------
  function computeSummary(devs) {
    const PF_REF_GEN = 0.8;
    const S_total = devs.reduce((sum, d) => {
      const P = d.watt || 0;
      if (!d.useFactors) return sum + P; // Ohne Kennwerte
      const PF = d.pf || 1;
      const M = d.startMult || 1;
      return sum + (P / PF) * M;
    }, 0);

    const totalKVA = S_total / 1000;
    const totalKW = totalKVA * PF_REF_GEN;
    const kVA_steps = [0.65, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6.5, 8, 10, 12, 15, 20];
    const marketKVA = kVA_steps.find(s => totalKVA < s) ?? Math.ceil(totalKVA);
    const marketKW = marketKVA * PF_REF_GEN;
    const usagePercent = (totalKVA / marketKVA) * 100;
    return { totalKW, totalKVA, marketKVA, marketKW, usagePercent };
  }

  // -------- Diagramm --------
  let chart = null;
  function renderChart(usagePercent) {
    const used = Math.min(100, Math.max(0, usagePercent));
    const remain = Math.max(0, 100 - used);
    const color = used >= 85 ? "#dc2626" : used >= 60 ? "#facc15" : "#16a34a";
    const data = { datasets: [{ data: [used, remain], backgroundColor: [color, "#e9efff"], borderWidth: 0 }] };
    const options = { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } };
    const plugin = {
      id: "centerText",
      afterDraw: c => {
        const { ctx, width, height } = c;
        ctx.save();
        ctx.font = `${height / 6}px system-ui`;
        ctx.fillStyle = "#0b3b66";
        ctx.textBaseline = "middle";
        const txt = `${Math.round(used)}%`;
        ctx.fillText(txt, (width - ctx.measureText(txt).width) / 2, height / 2);
        ctx.restore();
      }
    };
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, { type: "doughnut", data, options, plugins: [plugin] });
  }

  // -------- Anzeige --------
  function calculateAndDisplay() {
    if (!devices.length) {
      resultEl.textContent = "Noch keine Geräte hinzugefügt.";
      if (chart) chart.destroy();
      chart = null;
      return;
    }
    const s = computeSummary(devices);
    resultEl.innerHTML = `
      <div style="font-size:1.25rem;color:#0b3b66;font-weight:700;">⚡ Empfohlener Generator: ${s.marketKVA.toFixed(1)} kVA (≈ ${s.marketKW.toFixed(1)} kW)</div>
      <div style="font-size:.95rem;color:#555;">Gesamtleistungsbedarf: ${s.totalKW.toFixed(1)} kW</div>
    `;
    renderChart(s.usagePercent);
  }

  // -------- Helper für Infofeldanzeige --------
  function hasActiveFactorDevice(devs) {
    return devs.some(d => d.useFactors && ((d.pf && d.pf !== 1) || (d.startMult && d.startMult !== 1)));
  }

  // -------- PDF Export (mit fester Info-Box, nur wenn nötig) --------
  document.getElementById("exportPDF").addEventListener("click", () => {
    if (!devices.length) return alert("Keine Daten zum Exportieren.");
    const { jsPDF } = window.jspdf;
    const s = computeSummary(devices);
    const doc = new jsPDF("p", "mm", "a4");
    const BLUE = { r: 0, g: 85, b: 165 };
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const contentW = pageW - marginX * 2;

    const addImageScaled = (img, x, y, maxW, maxH) => {
      const p = doc.getImageProperties(img);
      const scale = Math.min(maxW / p.width, maxH / p.height);
      const w = p.width * scale;
      const h = p.height * scale;
      const xPos = x === "center" ? (pageW - w) / 2 : x;
      doc.addImage(img, "PNG", xPos, y, w, h);
      return h;
    };

    // Header
    doc.setFillColor(BLUE.r, BLUE.g, BLUE.b);
    doc.rect(0, 0, pageW, 25, "F");
    try { doc.addImage(document.getElementById("pdfLogo"), "JPEG", 10, 4, 35, 17); } catch {}
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Generator Leistungsrechner", 50, 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text(`⚡ Empfohlener Generator: ${s.marketKVA.toFixed(1)} kVA (≈ ${s.marketKW.toFixed(1)} kW)`, marginX, 38);
    doc.setFontSize(11);
    doc.text(`Gesamtleistungsbedarf: ${s.totalKW.toFixed(1)} kW`, marginX, 46);
    doc.setDrawColor(BLUE.r, BLUE.g, BLUE.b);
    doc.line(marginX, 50, pageW - marginX, 50);

    // Geräteliste
    let y = 58;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BLUE.r, BLUE.g, BLUE.b);
    doc.text("Geräteliste", marginX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    devices.forEach(d => {
      if (y > pageH - 40) { doc.addPage(); y = 25; }
      doc.text(`• ${d.name}: ${d.watt} W`, marginX + 4, y);
      y += 5;
      if (d.useFactors && ((d.pf && d.pf !== 1) || (d.startMult && d.startMult !== 1))) {
        const extras = [];
        if (d.pf && d.pf !== 1) extras.push(`cos φ ${d.pf}`);
        if (d.startMult && d.startMult !== 1) extras.push(`Iₐ ${d.startMult}`);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(90, 90, 90);
        doc.text(`(${extras.join(", ")})`, marginX + 12, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 6;
      }
    });
    doc.line(marginX, y + 2, pageW - marginX, y + 2);
    y += 10;

    // Diagramm
    try {
      const chartImg = chartCanvas.toDataURL("image/png", 1.0);
      const maxH = 90, maxW = 140;
      if (y + maxH + 20 > pageH) { doc.addPage(); y = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(BLUE.r, BLUE.g, BLUE.b);
      doc.text("Auslastungsdiagramm", marginX, y);
      y += 4 + addImageScaled(chartImg, "center", y + 4, maxW, maxH) + 14;
    } catch {}

    // Infofeld nur wenn nötig
    if (hasActiveFactorDevice(devices)) {
      const boxH = 52;
      const boxX = marginX - 2;
      const boxW = contentW + 4;
      const pad = 6;
      if (y + boxH > pageH - 20) { doc.addPage(); y = 25; }
      doc.setDrawColor(BLUE.r, BLUE.g, BLUE.b);
      doc.setFillColor(238, 243, 250);
      doc.roundedRect(boxX, y, boxW, boxH, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(BLUE.r, BLUE.g, BLUE.b);
      doc.text("Hinweis zu Kennwerten:", boxX + pad, y + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(
        "cos φ (Leistungsfaktor) beschreibt das Verhältnis zwischen Wirkleistung und Scheinleistung. Je kleiner cos φ, desto größer muss die Generator-Scheinleistung dimensioniert werden.\n\nIₐ (Anlaufstromfaktor) ist das Verhältnis von Anlauf- zu Betriebsstrom. Motoren haben beim Start oft einen deutlich höheren Strombedarf (Iₐ > 1).",
        boxW - pad * 2
      );
      doc.text(lines, boxX + pad, y + 18);
      y += boxH + 6;
    }

    // Footer
    doc.setDrawColor(BLUE.r, BLUE.g, BLUE.b);
    doc.line(marginX, pageH - 12, pageW - marginX, pageH - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Erstellt mit GeneratorCalc © 2025 Lehmann GT", marginX, pageH - 6);

    doc.save("generator_bericht.pdf");
  });

  // -------- Alles aktualisieren --------
  function updateAll() { updateList(); calculateAndDisplay(); }
  updateAll();
});

