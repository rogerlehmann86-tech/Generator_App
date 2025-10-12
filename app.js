// 🔋 Erweiterte Gerätedatenbank mit Kategorien
const deviceDB = {
  "Haushalt": [
    { name: "Kühlschrank", watt: 200, pf: 0.8, startSurge: true, startMult: 3 },
    { name: "Gefrierschrank", watt: 250, pf: 0.8, startSurge: true, startMult: 3 },
    { name: "Waschmaschine", watt: 1000, pf: 0.85, startSurge: true, startMult: 2.5 },
    { name: "Trockner", watt: 1800, pf: 0.85, startSurge: true, startMult: 2 },
    { name: "Mikrowelle", watt: 1200, pf: 0.9 },
    { name: "Toaster", watt: 800, pf: 1.0 },
    { name: "Kaffeemaschine", watt: 1000, pf: 1.0 },
    { name: "Wasserkocher", watt: 2000, pf: 1.0 },
    { name: "Elektroherd (Platte)", watt: 1500, pf: 1.0 },
    { name: "LED Lampe", watt: 10, pf: 1.0 },
    { name: "Fernseher (LED)", watt: 100, pf: 0.95 },
    { name: "Heizlüfter", watt: 1500, pf: 1.0 },
    { name: "Klimagerät (mobil)", watt: 1000, pf: 0.8, startSurge: true, startMult: 4 }
  ],
  "Werkstatt": [
    { name: "Bohrmaschine", watt: 800, pf: 0.85, startSurge: true, startMult: 2.5 },
    { name: "Kreissäge", watt: 1800, pf: 0.8, startSurge: true, startMult: 3 },
    { name: "Winkelschleifer", watt: 1200, pf: 0.85, startSurge: true, startMult: 2.5 },
    { name: "Schweißgerät (Inverter)", watt: 2500, pf: 0.75, startSurge: true, startMult: 2 },
    { name: "Kompressor (klein)", watt: 1500, pf: 0.8, startSurge: true, startMult: 3 },
    { name: "Staubsauger (Industrie)", watt: 1400, pf: 0.85, startSurge: true, startMult: 2.5 },
    { name: "Stichsäge", watt: 700, pf: 0.85, startSurge: true, startMult: 2 },
    { name: "Lötstation", watt: 80, pf: 1.0 }
  ],
  "Garten": [
    { name: "Rasenmäher (elektrisch)", watt: 1600, pf: 0.8, startSurge: true, startMult: 2.5 },
    { name: "Heckenschere", watt: 600, pf: 0.9, startSurge: true, startMult: 2 },
    { name: "Kettensäge (elektrisch)", watt: 1800, pf: 0.85, startSurge: true, startMult: 3 },
    { name: "Laubbläser", watt: 1200, pf: 0.85, startSurge: true, startMult: 2.5 },
    { name: "Hochdruckreiniger", watt: 1500, pf: 0.8, startSurge: true, startMult: 3 }
  ],
  "Camping": [
    { name: "Kühlbox (Kompressor)", watt: 60, pf: 0.9, startSurge: true, startMult: 2 },
    { name: "Ladegerät 12V", watt: 30, pf: 1.0 },
    { name: "LED Beleuchtung", watt: 20, pf: 1.0 },
    { name: "Kleiner Wasserkocher", watt: 750, pf: 1.0 },
    { name: "Mini-Klimaanlage", watt: 300, pf: 0.85, startSurge: true, startMult: 2 }
  ],
  "Büro": [
    { name: "Laptop", watt: 60, pf: 0.95 },
    { name: "Desktop-PC", watt: 300, pf: 0.9 },
    { name: "Monitor", watt: 40, pf: 1.0 },
    { name: "Drucker", watt: 600, pf: 0.8, startSurge: true, startMult: 2 },
    { name: "Netzwerk-Router", watt: 15, pf: 1.0 }
  ]
};

const STORAGE_KEY = "generatorDevices";
let devices = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const mainResult = document.getElementById("mainResult");
const subResult = document.getElementById("subResult");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const categorySelect = document.getElementById("categorySelect");
const presetSelect = document.getElementById("presetSelect");
const deviceList = document.getElementById("deviceList");

// 🔽 Kategorien dynamisch ins Dropdown laden
Object.keys(deviceDB).forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categorySelect.appendChild(opt);
});

// 🔽 Geräte beim Wechsel der Kategorie anzeigen
categorySelect.addEventListener("change", () => {
  presetSelect.innerHTML = `<option value="">Gerät wählen...</option>`;
  const cat = categorySelect.value;
  if (!cat) return;
  deviceDB[cat].forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${d.name} (${d.watt} W)`;
    presetSelect.appendChild(opt);
  });
});

// 📋 Gerät aus Liste übernehmen
presetSelect.addEventListener("change", e => {
  const cat = categorySelect.value;
  const idx = e.target.value;
  if (!cat || idx === "") return;
  const d = deviceDB[cat][idx];
  document.getElementById("name").value = d.name;
  document.getElementById("watt").value = d.watt;
  document.getElementById("pf").value = d.pf;
  document.getElementById("startSurge").checked = d.startSurge ?? false;
  document.getElementById("startMult").value = d.startMult ?? 1.0;
});

// ➕ Gerät hinzufügen
document.getElementById("addDevice").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const watt = parseFloat(document.getElementById("watt").value);
  const pf = parseFloat(document.getElementById("pf").value);
  const startSurge = document.getElementById("startSurge").checked;
  const startMult = parseFloat(document.getElementById("startMult").value);

  if (!name || isNaN(watt) || isNaN(pf)) {
    alert("Bitte alle Felder korrekt ausfüllen!");
    return;
  }

  devices.push({ name, watt, pf, startSurge, startMult });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  renderDevices();
});

// 📄 Geräteliste rendern
function renderDevices() {
  deviceList.innerHTML = "";
  devices.forEach((d, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${d.name} – ${d.watt} W</span>
                    <button data-index="${i}">❌</button>`;
    deviceList.appendChild(li);
  });

  deviceList.querySelectorAll("button").forEach(btn =>
    btn.addEventListener("click", e => {
      devices.splice(e.target.dataset.index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
      renderDevices();
    })
  );

  updateTotals();
}

// 📊 Berechnung der Gesamtleistung + Anzeige
function roundMarketKW(kW) {
  const sizes = [0.65, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.5, 8.0, 10.0, 12.0, 15.0, 20.0];
  for (let s of sizes) if (kW <= s) return s;
  return Math.ceil(kW);
}

function updateTotals() {
  if (devices.length === 0) {
    mainResult.textContent = "–";
    subResult.textContent = "";
    progressFill.style.width = "0%";
    progressFill.style.background = "#ddd";
    progressText.textContent = "– % Auslastung";
    return;
  }

  const totalPower = devices.reduce((sum, d) => sum + d.watt / d.pf, 0);
  const peakPower = Math.max(...devices.map(d => d.startSurge ? d.watt * d.startMult : d.watt), 0);
  const recommended = Math.max(totalPower * 1.2, peakPower);

  const recommendedKW = recommended / 1000;
  const recommendedKVA = recommendedKW / 0.8;
  const marketKW = roundMarketKW(recommendedKW);

  const usage = (recommendedKW / marketKW) * 100;
  const usagePercent = Math.min(usage, 100).toFixed(0);

  mainResult.textContent = `${marketKW.toFixed(1)} kW Generator empfohlen (≈ ${recommendedKVA.toFixed(1)} kVA)`;
  subResult.textContent = `Gesamtverbrauch: ${totalPower.toFixed(0)} W | Reserve eingerechnet`;

  progressFill.style.width = `${usagePercent}%`;
  progressText.textContent = `${usagePercent}% Auslastung`;

  if (usage <= 60) progressFill.style.background = "#28a745";
  else if (usage <= 90) progressFill.style.background = "#ffc107";
  else progressFill.style.background = "#dc3545";
}

// 🔄 Alle löschen
document.getElementById("clearAll").addEventListener("click", () => {
  if (confirm("Alle Geräte wirklich löschen?")) {
    devices = [];
    localStorage.removeItem(STORAGE_KEY);
    renderDevices();
  }
});

renderDevices();
