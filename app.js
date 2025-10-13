document.addEventListener("DOMContentLoaded", () => {
  console.log("App gestartet (embedding-safe)");

  // Kategorien & Geräte (erweiterbar)
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

  // DOM refs
  const catSelect = document.getElementById("category");
  const presetSelect = document.getElementById("presetSelect");
  const deviceListEl = document.getElementById("deviceList");
  const resultDisplay = document.getElementById("resultDisplay");
  const chartCanvas = document.getElementById("loadChart");

  // fülle Kategorien
  Object.keys(categories).forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    catSelect.appendChild(o);
  });

  // wenn Kategorie gewählt → Presets füllen
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

  // wenn Preset gewählt → Felder füllen; danach Auswahl zurücksetzen (damit nochmal möglich)
  presetSelect.addEventListener("change", () => {
    const cat = catSelect.value;
    const selName = presetSelect.value;
    const dev = (categories[cat] || []).find(d => d.name === selName);
    if (dev) {
      document.getElementById("name").value = dev.name;
      document.getElementById("watt").value = dev.watt;
      document.getElementById("pf").value = dev.pf ?? 1;
      document.getElementById("startSurge").checked = dev.startSurge ?? false;
      document.getElementById("startMult").value = dev.startMult ?? 1.0;
      // wichtig: zurücksetzen, damit das selbe Preset erneut gewählt werden kann
      presetSelect.value = "";
    }
  });

  // LocalStorage (robust)
  let devices = [];
  try {
    devices = JSON.parse(localStorage.getItem("devices") || "[]");
    if (!Array.isArray(devices)) devices = [];
  } catch {
    devices = [];
  }

  const saveDevices = () => {
    try {
      localStorage.setItem("devices", JSON.stringify(devices));
    } catch (e) {
      console.warn("LocalStorage nicht verfügbar:", e);
    }
  };

  // Liste rendern
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

  // Gerät hinzufügen
  document.getElementById("addDevice").addEventListener("click", () => {
    const nameField = document.getElementById("name").value.trim();
    const wattField = parseFloat(document.getElementById("watt").value);
    const pfField = parseFloat(document.getElementById("pf").value) || 1;
    const startSurgeChecked = document.getElementById("startSurge").checked;
    const startMultField = parseFloat(document.getElementById("startMult").value) || 1;

    if (!nameField || isNaN(wattField) || wattField <= 0) {
      return alert("Bitte Gerätname und gültige Watt-Zahl angeben.");
    }

    // speichere Basisdaten (watt als Basis, Startfaktor separat)
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

    // Felder leeren (Preset bleibt zurückgesetzt)
    document.getElementById("name").value = "";
    document.getElementById("watt").value = "";
    document.getElementById("pf").value = "1";
    document.getElementById("startSurge").checked = false;
    document.getElementById("startMult").value = "1.0";
  });

  // Liste löschen
  document.getElementById("clearDevices").addEventListener("click", () => {
    if (!confirm("Alle Geräte wirklich löschen?")) return;
    devices = [];
    saveDevices();
    updateAll();
  });

  // Chart initialisieren / updaten
  let loadChart = null;
  function renderChart(usagePercent) {
    // usagePercent in [0..100]
    const used = Math.min(100, Math.max(0, usagePercent));
    const remaining = Math.max(0, 100 - used);

    // Farbe nach Schwellen
    let color;
    if (used >= 85) color = "#dc3545"; // rot
    else if (used >= 60) color = "#ffc107"; // gelb
    else color = "#28a745"; // grün

    const data = {
      labels: ["Auslastung", "Rest"],
      datasets: [{
        data: [used, remaining],
        backgroundColor: [color, "#e9f2ff"],
        hoverBackgroundColor: [color, "#e9f2ff"],
        borderWidth: 0
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} %`
          }
        }
      }
    };

    // create/destroy
    if (loadChart) {
      loadChart.data = data;
      loadChart.options = options;
      loadChart.update();
    } else {
      loadChart = new Chart(chartCanvas, {
        type: 'doughnut',
        data,
        options,
        plugins: [{
          id: 'centerText',
          afterDraw: chart => {
            const {ctx, width, height} = chart;
            ctx.restore();
            const fontSize = (height / 6).toFixed(0);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#0b3b66";
            const text = `${Math.round(used)}%`;
            const textX = Math.round((width - ctx.measureText(text).width) / 2);
            const textY = height / 2;
            ctx.fillText(text, textX, textY);
            ctx.save();
          }
        }]
      });
    }

    // set canvas height for visual consistency
    chartCanvas.style.height = "220px";
    chartCanvas.style.width = "100%";
  }

  // Berechnung & Anzeige
  function calculateAndDisplay() {
    if (!devices.length) {
      resultDisplay.textContent = "Noch keine Geräte hinzugefügt.";
      if (loadChart) loadChart.destroy();
      loadChart = null;
      return;
    }

    // Gesamtwirkleistung: sum(watt)
    const totalActiveW = devices.reduce((s, d) => s + d.watt, 0);
    // größte Startspitze berechnen (falls Geräte Startspitze haben)
    const largestSurgeW = devices.reduce((max, d) => {
      const surge = d.startSurge ? d.watt * d.startMult : d.watt;
      return Math.max(max, surge);
    }, 0);

    // empfohlene Leistung: max(total*reserve, largest surge)
    const reserveFactor = 1.2; // 20% Reserve
    const recommendedW = Math.max(Math.ceil(totalActiveW * reserveFactor), Math.ceil(largestSurgeW));

    // Durchschnittlicher PF für kVA-Berechnung
    const avgPF = devices.reduce((s, d) => s + (d.pf || 1), 0) / devices.length;
    const kW = (recommendedW / 1000);
    const kVA = (kW / (avgPF || 0.8));

    // marktübliche Rundung (Beispiel-Skala)
    function roundMarketKW(kWval) {
      const sizes = [0.65,0.8,1,1.5,2,2.5,3,4,5,6.5,8,10,12,15,20];
      for (let s of sizes) if (kWval <= s) return s;
      return Math.ceil(kWval);
    }
    const marketKW = roundMarketKW(kW);

    // Auslastung gegenüber Marktgröße in %
    const usagePercent = (kW / marketKW) * 100;

    // UI Ausgabe (kompakt)
    resultDisplay.innerHTML = `
      <strong>${marketKW.toFixed(1)} kW Generator empfohlen</strong>
      <div style="margin-top:8px; font-size:0.95rem; color:#333;">
        Gesamtverbrauch: ${totalActiveW} W | Empfehlung: ${recommendedW} W
        <br>≈ ${kW.toFixed(2)} kW / ${kVA.toFixed(2)} kVA (PF≈${avgPF.toFixed(2)})
      </div>
    `;

    renderChart(usagePercent);
  }

  // Export CSV
  document.getElementById("exportCSV").addEventListener("click", () => {
    if (!devices.length) return alert("Keine Daten zum Exportieren.");
    const lines = ["Name;Leistung (W);PF;StartX"];
    devices.forEach(d => lines.push(`${d.name};${d.watt};${d.pf};${d.startSurge ? d.startMult : "-"}`));
    const blob = new Blob([lines.join("\n")], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generator_daten.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // zentrale Aktualisierung
  function updateAll() {
    updateList();
    calculateAndDisplay();
  }

  // initial
  updateAll();

  // Reaktion auf Resize (Chart neu zeichnen falls nötig)
  window.addEventListener("resize", () => {
    if (loadChart) loadChart.resize();
  });
});

