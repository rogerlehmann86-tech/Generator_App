document.addEventListener("DOMContentLoaded", () => {
  console.log("GeneratorCalc v5.4.1 – Fix Geräteanzeige + Stabilität");

  // ---------- Lehmann GT Mietgeräte ----------
  const rentalGenerators = [
    { id: "lgtm-eu20i", name: "Honda EU20i", kva: 2.0, kw: 1.6, volt: "230 V", fuel: "Benzin – Inverter", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/benzin-generator-stromerzeuger-honda-eu20i/" },
    { id: "lgtm-cx7000t", name: "CGM CX7000t", kva: 7.0, kw: 5.6, volt: "230 V / 380 V", fuel: "Benzin – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/benzin-generator-stromerzeuger-cgm-cx7000t/" },
    { id: "lgtm-s9000dual", name: "CGM S9000Dual", kva: 9.0, kw: 8.0, volt: "230 V / 380 V", fuel: "Diesel – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/benzin-generator-stromerzeuger-cgm-s9000dual/" },
    { id: "lgtm-v18y", name: "CGM V18Y", kva: 18.0, kw: 16.0, volt: "230 V / 380 V", fuel: "Diesel – stationär – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/diesel-generator-stromerzeuger-cgm-industrial-v18y/" },
    { id: "lgtm-v60f", name: "CGM V60F", kva: 60.0, kw: 48.0, volt: "230 V / 380 V", fuel: "Diesel – stationär – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/diesel-generator-stromerzeuger-cgm-rnt-v60f/" }
  ];

  // ---------- Gerätekategorien ----------
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

  // ---------- DOM-Elemente ----------
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

  // ---------- Dropdowns initialisieren ----------
  cat.innerHTML = '<option value="">Kategorie auswählen ...</option>';
  Object.keys(categories).forEach(c => {
    const o = document.createElement("option");
    o.value = o.textContent = c;
    cat.appendChild(o);
  });

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

  preset.addEventListener("change", () => {
    const d = (categories[cat.value] || []).find(x => x.name === preset.value);
    if (!d) return;
    nameEl.value = d.name;
    wattEl.value = d.watt;
    pfEl.value = d.pf ?? "";
    multEl.value = d.startMult ?? "";
    surgeBox.checked = !!d.startSurge;
  });

  // ---------- Geräteverwaltung ----------
  let devices = [];
  try { devices = JSON.parse(localStorage.getItem("devices") || "[]"); } catch {}
  const save = () => localStorage.setItem("devices", JSON.stringify(devices));

 function updateList() {
  listEl.innerHTML = "";
  devices.forEach((d, i) => {
    const li = document.createElement("li");
    li.className = "device-item";

    const name = d.name?.trim() || "Unbenanntes Gerät";
    const watt = d.watt ? `${d.watt} W` : "(keine Angabe)";

    // Hauptzeile (Name + Watt)
    const mainLine = document.createElement("div");
    mainLine.className = "device-main";
    mainLine.textContent = `${name}: ${watt}`;

    // Zusatzzeile (cos φ, Iₐ)
    const facts = [];
    if (d.useFactors && d.pf && d.pf !== 1) facts.push(`cos φ ${d.pf}`);
    if (d.useFactors && d.startMult && d.startMult !== 1) facts.push(`Iₐ ${d.startMult}`);

    const detailLine = document.createElement("div");
    detailLine.className = "device-details";
    detailLine.textContent = facts.join("  |  ");

    const del = document.createElement("button");
    del.textContent = "✖";
    del.onclick = () => { devices.splice(i, 1); save(); updateAll(); };

    const textWrap = document.createElement("div");
    textWrap.className = "device-text";
    textWrap.appendChild(mainLine);
    if (facts.length) textWrap.appendChild(detailLine);

    li.appendChild(textWrap);
    li.appendChild(del);
    listEl.appendChild(li);
  });
}



  // ---------- Gerät hinzufügen ----------
  document.getElementById("addDevice").addEventListener("click", () => {
    const name = nameEl.value.trim() || preset.value || `Gerät ${devices.length + 1}`;
    const watt = parseFloat(wattEl.value);
    const pf = parseFloat(pfEl.value) || 1;
    const mult = parseFloat(multEl.value) || 1;
    const useFactors = surgeBox.checked;
    if (isNaN(watt) || watt <= 0)
      return alert("Bitte gültige Leistung angeben.");

    devices.push({ name, watt, pf, startMult: mult, useFactors });
    save();
    updateAll();

    nameEl.value = wattEl.value = pfEl.value = multEl.value = "";
    surgeBox.checked = false;
    cat.value = "";
    preset.innerHTML = '<option value="">Gerät auswählen ...</option>';
  });

  document.getElementById("clearDevices").addEventListener("click", () => {
    if (!confirm("Alle Geräte wirklich löschen?")) return;
    devices = [];
    save();
    updateAll();
  });

  // ---------- Berechnung ----------
  function computeSummary(devs) {
    const PF_REF_GEN = 0.8;
    const S_total = devs.reduce((sum, d) => {
      const P = d.watt || 0;
      if (!d.useFactors) return sum + P;
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
    const rental = rentalGenerators.find(r => r.kva >= marketKVA) || rentalGenerators[rentalGenerators.length - 1];
    return { totalKW, totalKVA, marketKVA, marketKW, usagePercent, rental };
  }

  // ---------- Diagramm ----------
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

  // ---------- Anzeige ----------
  function calculateAndDisplay() {
    if (!devices.length) {
      resultEl.textContent = "Noch keine Geräte hinzugefügt.";
      if (chart) chart.destroy();
      chart = null;
      return;
    }

    const s = computeSummary(devices);

    resultEl.innerHTML = `
      <div class="result-box rent-box">
        <div class="box-header">
          <span class="box-title">Mietgeräte Empfehlung</span>
          <img src="Lehmann-GT_GmbH_Logo_highres.jpg" alt="Lehmann GT" class="box-logo">
        </div>
        <div class="box-body">
          <span class="device-name">${s.rental.name}</span>
          <span class="device-spec">(${s.rental.kva.toFixed(1)} kVA / ${s.rental.kw.toFixed(1)} kW)</span>
          <a href="${s.rental.link}" target="_blank" class="box-link">➡ Zum Mietgerät</a>
        </div>
      </div>

      <div class="result-box market-box">
        <div class="box-header">
          <span class="box-title">Marktübliche Empfehlung</span>
        </div>
        <div class="box-body">
          <span class="device-spec">Generatorgröße: ${s.marketKVA.toFixed(1)} kVA (≈ ${s.marketKW.toFixed(1)} kW)</span><br>
          <span class="device-need">Gesamtleistungsbedarf: ${s.totalKW.toFixed(1)} kW</span>
        </div>
      </div>
    `;

    renderChart(s.usagePercent);
  }

  function updateAll() { updateList(); calculateAndDisplay(); }
  updateAll();
});


