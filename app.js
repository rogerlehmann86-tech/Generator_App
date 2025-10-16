document.addEventListener("DOMContentLoaded", () => {
  console.log("App gestartet (v4.6)");

  // --- Assets ---
  const LOGO_BASE64 = "data:image/png;base64,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";

  // ---------- Daten ----------
  const categories = {
    "Werkzeuge": [
      { name: "Bohrmaschine", watt: 800, pf: 0.9, startSurge: true, startMult: 2.5 },
      { name: "Winkelschleifer", watt: 1200, pf: 0.85, startSurge: true, startMult: 2.5 },
      { name: "Kettensäge", watt: 1600, pf: 0.9, startSurge: true, startMult: 2.5 }
    ],
    "Haushalt": [
      { name: "Kühlschrank", watt: 150, pf: 0.8, startSurge: true, startMult: 3 },
      { name: "Wasserkocher", watt: 1800, pf: 1 },
      { name: "Staubsauger", watt: 1000, pf: 0.9, startSurge: true, startMult: 2.5 }
    ],
    "Baumaschinen": [
      { name: "Betonmischer", watt: 1100, pf: 0.85, startSurge: true, startMult: 2 },
      { name: "Kompressor", watt: 1500, pf: 0.85, startSurge: true, startMult: 3 },
      { name: "Heizlüfter", watt: 2000, pf: 1 }
    ],
    "Camping": [
      { name: "Kühlbox", watt: 60, pf: 0.9, startSurge: true, startMult: 2 },
      { name: "LED Lampe", watt: 10, pf: 1 },
      { name: "Laptop", watt: 60, pf: 0.95 }
    ]
  };

  // ---------- DOM ----------
  const catSelect = document.getElementById("category");
  const presetSelect = document.getElementById("presetSelect");
  const deviceListEl = document.getElementById("deviceList");
  const resultDisplay = document.getElementById("resultDisplay");
  const chartCanvas = document.getElementById("loadChart");

  // ---------- Init Kategorien ----------
  Object.keys(categories).forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    catSelect.appendChild(o);
  });

  catSelect.addEventListener("change", () => {
    presetSelect.innerHTML = '<option value="">Gerät auswählen...</option>';
    const list = categories[catSelect.value] || [];
    list.forEach(dev => {
      const opt = document.createElement("option");
      opt.value = dev.name;
      opt.textContent = `${dev.name} (${dev.watt} W)`;
      presetSelect.appendChild(opt);
    });
  });

  presetSelect.addEventListener("change", () => {
    const cat = catSelect.value;
    const selName = presetSelect.value;
    const dev = (categories[cat] || []).find(d => d.name === selName);
    if (dev) {
      document.getElementById("name").value = dev.name;
      document.getElementById("watt").value = dev.watt;
      document.getElementById("pf").value = dev.pf ?? "";
      document.getElementById("startSurge").checked = dev.startSurge ?? false;
      document.getElementById("startMult").value = dev.startMult ?? "";
      presetSelect.value = "";
    }
  });

  // ---------- LocalStorage ----------
  let devices = [];
  try {
    devices = JSON.parse(localStorage.getItem("devices") || "[]");
    if (!Array.isArray(devices)) devices = [];
  } catch { devices = []; }

  const saveDevices = () => {
    try { localStorage.setItem("devices", JSON.stringify(devices)); }
    catch (e) { console.warn("LocalStorage nicht verfügbar:", e); }
  };

  function updateList() {
    deviceListEl.innerHTML = "";
    devices.forEach((d, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${d.name}: ${d.watt} W (PF ${d.pf}) ${d.startSurge ? `(Start x${d.startMult})` : ""}</span>`;
      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.onclick = () => {
        devices.splice(i, 1);
        saveDevices();
        updateAll();
      };
      li.appendChild(btn);
      deviceListEl.appendChild(li);
    });
  }

  document.getElementById("addDevice").addEventListener("click", () => {
    const nameField = document.getElementById("name").value.trim();
    const wattField = parseFloat(document.getElementById("watt").value);
    const pfFieldRaw = document.getElementById("pf").value;
    const pfField = pfFieldRaw === "" ? 1 : (parseFloat(pfFieldRaw) || 1);
    const startSurgeChecked = document.getElementById("startSurge").checked;
    const startMultRaw = document.getElementById("startMult").value;
    const startMultField = startMultRaw === "" ? 1 : (parseFloat(startMultRaw) || 1);

    if (!nameField || isNaN(wattField) || wattField <= 0) {
      return alert("Bitte Gerätname und gültige Watt-Zahl angeben.");
    }

    const deviceObj = {
      name: nameField,
      watt: wattField,
      pf: pfField,
      startSurge: !!startSurgeChecked,
      startMult: startMultField
    };

    devices.push(deviceObj);
    saveDevices();
    updateAll();

    document.getElementById("name").value = "";
    document.getElementById("watt").value = "";
    document.getElementById("pf").value = "";
    document.getElementById("startSurge").checked = false;
    document.getElementById("startMult").value = "";
  });

  document.getElementById("clearDevices").addEventListener("click", () => {
    if (!confirm("Alle Geräte wirklich löschen?")) return;
    devices = [];
    saveDevices();
    updateAll();
  });

  // ---------- Helpers ----------
  function roundMarketKW(kWval) {
    const sizes = [0.65,0.8,1,1.5,2,2.5,3,4,5,6.5,8,10,12,15,20];
    for (let s of sizes) if (kWval <= s) return s;
    return Math.ceil(kWval);
  }

  function computeSummary(devs) {
    const totalActiveW = devs.reduce((s, d) => s + d.watt, 0);
    const largestSurgeW = devs.reduce((max, d) => {
      const surge = d.startSurge ? d.watt * d.startMult : d.watt;
      return Math.max(max, surge);
    }, 0);
    const reserveFactor = 1.2;
    const recommendedW = Math.max(Math.ceil(totalActiveW * reserveFactor), Math.ceil(largestSurgeW));
    const avgPF = devs.length ? devs.reduce((s, d) => s + (d.pf || 1), 0) / devs.length : 1;
    const kW = recommendedW / 1000;
    const kVA = kW / (avgPF || 0.8);
    const marketKW = roundMarketKW(kW);
    const usagePercent = marketKW ? (kW / marketKW) * 100 : 0;
    return { totalActiveW, largestSurgeW, reserveFactor, recommendedW, avgPF, kW, kVA, marketKW, usagePercent };
  }

  // ---------- Chart ----------
  let loadChart = null;
  function renderChart(usagePercent) {
    const used = Math.min(100, Math.max(0, usagePercent));
    const remaining = Math.max(0, 100 - used);
    let color;
    if (used >= 85) color = "#dc2626";
    else if (used >= 60) color = "#facc15";
    else color = "#16a34a";

    const data = {
      labels: ["Auslastung", "Rest"],
      datasets: [{ data: [used, remaining], backgroundColor: [color, "#e9efff"], borderWidth: 0 }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: { legend: { display: false } }
    };

    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx, width, height, data } = chart;
        const currentUsed = Math.round(data.datasets[0].data[0]);
        ctx.save();
        const fontSize = (height / 6) | 0;
        ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#0b3b66";
        const text = `${currentUsed}%`;
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        ctx.fillText(text, textX, textY);
        ctx.restore();
      }
    };

    if (loadChart) { loadChart.data = data; loadChart.options = options; loadChart.update(); }
    else {
      loadChart = new Chart(chartCanvas, { type: 'doughnut', data, options, plugins: [centerTextPlugin] });
    }

    chartCanvas.style.height = "220px";
    chartCanvas.style.width = "100%";
  }

  // ---------- Ergebnis & Anzeige ----------
  function calculateAndDisplay() {
    if (!devices.length) {
      resultDisplay.textContent = "Noch keine Geräte hinzugefügt.";
      if (loadChart) loadChart.destroy();
      loadChart = null;
      return;
    }

    const s = computeSummary(devices);

    resultDisplay.innerHTML = `
      <strong>${s.marketKW.toFixed(1)} kW Generator empfohlen</strong>
      <div style="margin-top:8px; font-size:0.95rem; color:#334155;">
        Gesamtverbrauch: ${s.totalActiveW} W | Empfehlung: ${s.recommendedW} W
        <br>≈ ${s.kW.toFixed(2)} kW / ${s.kVA.toFixed(2)} kVA
      </div>
    `;

    renderChart(s.usagePercent);

    const desc = document.getElementById("chartDesc");
    if (desc) {
      desc.textContent =
        `Auslastung des empfohlenen Generators (${s.marketKW.toFixed(1)} kW): ` +
        `${Math.round(s.usagePercent)} % belegt, ${Math.round(100 - s.usagePercent)} % Reserve.`;
    }
  }

  // ---------- PDF-Export ----------
  document.getElementById("exportPDF").addEventListener("click", async () => {
    if (!devices.length) return alert("Keine Daten zum Exportieren.");
    if (!window.jspdf || !window.jspdf.jsPDF) return alert("PDF-Bibliothek (jsPDF) nicht geladen.");

    const s = computeSummary(devices);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header Hintergrund (blau)
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 25, "F");

    // Weißes Logo (35 mm breit)
    try {
      doc.addImage(LOGO_BASE64, "PNG", 10, 4, 35, 17);
    } catch(e) {
      console.warn("Logo konnte nicht eingebettet werden:", e);
    }

    // Titel
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Generator Leistungsrechner", 50, 14);

    // Tabelle
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 35;
    doc.text("Geräteliste:", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text("Name", 14, y);
    doc.text("Leistung (W)", 90, y);
    doc.text("PF", 140, y);
    doc.text("Startfaktor", 165, y);
    y += 3;
    doc.line(14, y, 190, y);
    y += 5;

    devices.forEach(d => {
      doc.text(String(d.name), 14, y);
      doc.text(String(d.watt), 90, y);
      doc.text(String(d.pf), 140, y);
      doc.text(d.startSurge ? "x" + d.startMult : "-", 165, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    // Berechnungsteil
    y += 10;
    doc.setFontSize(12);
    doc.text("Berechnung:", 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Gesamtverbrauch: ${s.totalActiveW} W`, 14, y); y += 6;
    doc.text(`Empfohlene Leistung: ${s.recommendedW} W`, 14, y); y += 6;
    doc.text(`≈ ${s.kW.toFixed(2)} kW / ${s.kVA.toFixed(2)} kVA`, 14, y); y += 6;
    doc.text(`Empfohlener Generator: ${s.marketKW.toFixed(1)} kW`, 14, y);

    // Footer
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Erstellt mit GeneratorCalc © 2025 Lehmann GT", 14, y);

    doc.save("generator_daten.pdf");
  });

  // ---------- Bootstrap ----------
  function updateAll() {
    updateList();
    calculateAndDisplay();
  }
  updateAll();

window.addEventListener("resize", () => {
  // Chart neu skalieren
  const chart = document.getElementById("loadChart");
  if (chart) chart.style.width = "100%";

  // Grid-Layout neu berechnen (Box-Autopassung)
  document.querySelectorAll(".grid-container").forEach(el => {
    el.style.gridAutoRows = "auto";
    el.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
  });
});

});
