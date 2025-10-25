document.addEventListener("DOMContentLoaded", () => {
  console.log("GeneratorCalc v5.7.2 – Diagramm + Logo + Beschriftung");

  // ---------- Lehmann GT Mietgeräte ----------
  const rentalGenerators = [
    { name: "Honda EU20i", kva: 2.0, kw: 1.6, fuel: "Benzin – Inverter", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/benzin-generator-stromerzeuger-honda-eu20i/" },
    { name: "CGM CX7000t", kva: 7.0, kw: 5.6, fuel: "Benzin – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/benzin-generator-stromerzeuger-cgm-cx7000t/" },
    { name: "CGM S9000Dual", kva: 9.0, kw: 8.0, fuel: "Diesel – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/benzin-generator-stromerzeuger-cgm-s9000dual/" },
    { name: "CGM V18Y", kva: 18.0, kw: 16.0, fuel: "Diesel – stationär – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/diesel-generator-stromerzeuger-cgm-industrial-v18y/" },
    { name: "CGM V60F", kva: 60.0, kw: 48.0, fuel: "Diesel – stationär – AVR-Regelung", link: "https://lehmann-gt.ch/dienstleistungen/mietgeraete/miet-generatoren/diesel-generator-stromerzeuger-cgm-rnt-v60f/" }
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

  // ---------- DOM ----------
  const cat = document.getElementById("category");
  const preset = document.getElementById("presetSelect");
  const nameEl = document.getElementById("name");
  const wattEl = document.getElementById("watt");
  const pfEl = document.getElementById("pf");
  const multEl = document.getElementById("startMult");
  const surgeBox = document.getElementById("startSurge");
  const listEl = document.getElementById("deviceList");
  const resultEl = document.getElementById("resultDisplay");

  // ---------- Dropdowns ----------
  cat.innerHTML = '<option value="">Kategorie auswählen ...</option>';
  Object.keys(categories).forEach(c => {
    const o = document.createElement("option");
    o.value = o.textContent = c;
    cat.appendChild(o);
  });

  cat.addEventListener("change", () => {
    preset.innerHTML = '<option value="">Gerät auswählen ...</option>';
    (categories[cat.value] || []).forEach(d => {
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

      const textWrap = document.createElement("div");
      textWrap.className = "device-text";

      const headerLine = document.createElement("div");
      headerLine.className = "device-header-list";

      const nameSpan = document.createElement("span");
      nameSpan.className = "device-name-list";
      nameSpan.textContent = d.name?.trim() || "Unbenanntes Gerät";

      const wattSpan = document.createElement("span");
      wattSpan.className = "device-watt-list";
      wattSpan.textContent = d.watt ? `${d.watt} W` : "(keine Angabe)";

      headerLine.append(nameSpan, wattSpan);

      const facts = [];
      if (d.useFactors && d.pf && d.pf !== 1) facts.push(`cos φ ${d.pf}`);
      if (d.useFactors && d.startMult && d.startMult !== 1) facts.push(`Iₐ ${d.startMult}`);
      const detailLine = document.createElement("div");
      detailLine.className = "device-details-list";
      detailLine.textContent = facts.join(" | ");

      textWrap.append(headerLine);
      if (facts.length) textWrap.append(detailLine);

      const del = document.createElement("button");
      del.textContent = "✖";
      del.onclick = () => { devices.splice(i, 1); save(); updateAll(); };

      li.append(textWrap, del);
      listEl.append(li);
    });
  }

  // ---------- Gerät hinzufügen ----------
  document.getElementById("addDevice").addEventListener("click", () => {
    const name = nameEl.value.trim() || preset.value || `Gerät ${devices.length + 1}`;
    const watt = parseFloat(wattEl.value);
    const pf = parseFloat(pfEl.value) || 1;
    const mult = parseFloat(multEl.value) || 1;
    const useFactors = surgeBox.checked;
    if (isNaN(watt) || watt <= 0) return alert("Bitte gültige Leistung angeben.");
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
      return sum + (P / (d.pf || 1)) * (d.startMult || 1);
    }, 0);
    const totalKVA = S_total / 1000;
    const totalKW = totalKVA * PF_REF_GEN;
    const kVA_steps = [0.65, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6.5, 8, 10, 12, 15, 20];
    const marketKVA = kVA_steps.find(s => totalKVA < s) ?? Math.ceil(totalKVA);
    const marketKW = marketKVA * PF_REF_GEN;
    const rental = rentalGenerators.find(r => r.kva >= marketKVA) || rentalGenerators.at(-1);
    return { totalKW, totalKVA, marketKVA, marketKW, rental };
  }

  // ---------- Anzeige ----------
  function calculateAndDisplay() {
    if (!devices.length) {
      resultEl.textContent = "Noch keine Geräte hinzugefügt.";
      return;
    }
    const s = computeSummary(devices);
    resultEl.innerHTML = `
      <div class="result-box danger-box">
        <div class="box-content">
          <div class="box-text">
            <h3 class="box-title">Gesamtleistungsbedarf</h3>
            <div class="box-body"><span class="device-need">${s.totalKVA.toFixed(2)} kVA</span></div>
          </div>
        </div>
      </div>

      <!-- Mietgeräte Empfehlung -->
      <a href="${s.rental.link}" target="_blank" class="result-box rent-box linkbox">
        <div class="box-content">
          <div class="box-text">
            <h3 class="box-title">Mietgeräte Empfehlung</h3>
            <div class="box-body">
              <span class="device-name">${s.rental.name}</span>
              <span class="device-spec">${s.rental.kva.toFixed(1)} kVA / ${s.rental.kw.toFixed(1)} kW</span>
              <span class="device-fuel">${s.rental.fuel}</span>
              <span class="click-hint">➡ Mehr Infos auf lehmann-gt.ch</span>
            </div>
          </div>
          <div class="box-right">
            <div class="mini-chart-wrap">
              <canvas id="rentalChart" width="60" height="60"></canvas>
              <div class="chart-caption">Auslastung</div>
            </div>
            <div class="box-logo-wrap"><img src="Bild Generatorvermietung.jpg" alt="Lehmann GT" class="box-logo-large"></div>
          </div>
        </div>
      </a>

      <!-- Marktübliche Empfehlung -->
      <div class="result-box market-box">
        <div class="box-content">
          <div class="box-text">
            <h3 class="box-title">Marktübliche Empfehlung</h3>
            <div class="box-body">
              <span class="device-name">Generatorgröße: ${s.marketKVA.toFixed(1)} kVA (≈ ${s.marketKW.toFixed(1)} kW)</span>
            </div>
          </div>
          <div class="box-right">
            <div class="mini-chart-wrap">
              <canvas id="marketChart" width="60" height="60"></canvas>
              <div class="chart-caption">Auslastung</div>
            </div>
            <div class="box-logo-wrap"><img src="Bild Generatorvermietung.jpg" alt="Lehmann GT" class="box-logo-large"></div>
          </div>
        </div>
      </div>
    `;
    drawMiniChart("rentalChart", s.totalKVA, s.rental.kva);
    drawMiniChart("marketChart", s.totalKVA, s.marketKVA);
  }

  function drawMiniChart(canvasId, used, total) {
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;
    const usage = Math.min(used / total, 1);
    const data = {
      datasets: [{
        data: [usage * 100, 100 - usage * 100],
        backgroundColor: [
          usage < 0.85 ? "#22c55e" : usage < 1 ? "#eab308" : "#dc2626",
          "#e5e7eb"
        ],
        borderWidth: 0
      }]
    };
    new Chart(ctx, {
      type: "doughnut",
      data,
      options: {
        cutout: "70%",
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  }

  function updateAll() { updateList(); calculateAndDisplay(); }
  updateAll();

  // ---------- Tooltip ----------
  document.querySelectorAll(".info-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const p = e.target.closest(".checkline");
      p.classList.toggle("show-tooltip");
    });
  });
  document.addEventListener("click", e => {
    document.querySelectorAll(".checkline").forEach(p => {
      if (!p.contains(e.target)) p.classList.remove("show-tooltip");
    });
  });
});

