document.addEventListener("DOMContentLoaded", () => {
  // Dein gesamter bisheriger JavaScript-Code hier hinein
});
// 📦 Gerätekatalog
const presetDevices = [
  { name: "Bohrmaschine", watt: 800, pf: 0.9 },
  { name: "Winkelschleifer", watt: 1200, pf: 0.85 },
  { name: "Kühlschrank", watt: 150, pf: 0.8 },
  { name: "Heizlüfter", watt: 2000, pf: 1 },
  { name: "Wasserkocher", watt: 1800, pf: 1 },
  { name: "Kettensäge", watt: 1600, pf: 0.9 },
  { name: "Betonmischer", watt: 1100, pf: 0.85 },
  { name: "Lichtanlage", watt: 300, pf: 0.95 },
  { name: "Kompressor", watt: 1500, pf: 0.85 },
  { name: "Staubsauger", watt: 1000, pf: 0.9 }
];

const presetSelect = document.getElementById('presetSelect');
const deviceListEl = document.getElementById('deviceList');
const resultDisplay = document.getElementById('resultDisplay');

// 📋 Presets laden
presetDevices.forEach(d => {
  const opt = document.createElement('option');
  opt.value = d.name;
  opt.textContent = `${d.name} (${d.watt} W)`;
  presetSelect.appendChild(opt);
});

let devices = JSON.parse(localStorage.getItem("devices") || "[]");

// 🔁 Anzeige aktualisieren
function updateList() {
  deviceListEl.innerHTML = "";
  devices.forEach((dev, i) => {
    const li = document.createElement('li');
    li.textContent = `${dev.name}: ${dev.watt} W (PF ${dev.pf})`;
    const del = document.createElement('button');
    del.textContent = "✖";
    del.onclick = () => {
      devices.splice(i, 1);
      saveDevices();
      updateAll();
    };
    li.appendChild(del);
    deviceListEl.appendChild(li);
  });
}

// 💾 LocalStorage
function saveDevices() {
  localStorage.setItem("devices", JSON.stringify(devices));
}

// ➕ Gerät hinzufügen
document.getElementById('addDevice').onclick = () => {
  const name = document.getElementById('name').value || presetSelect.value;
  const watt = parseFloat(document.getElementById('watt').value);
  const pf = parseFloat(document.getElementById('pf').value);
  const startSurge = document.getElementById('startSurge').checked;
  const startMult = parseFloat(document.getElementById('startMult').value);

  if (!name || isNaN(watt) || watt <= 0) return alert("Bitte gültige Werte eingeben!");

  const totalWatt = startSurge ? watt * startMult : watt;
  devices.push({ name, watt: totalWatt, pf });
  saveDevices();
  updateAll();

  document.getElementById('name').value = '';
  document.getElementById('watt').value = '';
};

// 🗑️ Liste löschen
document.getElementById('clearDevices').onclick = () => {
  if (confirm("Alle Geräte löschen?")) {
    devices = [];
    saveDevices();
    updateAll();
  }
};

// 📊 Berechnung
function calculate() {
  if (devices.length === 0) {
    resultDisplay.textContent = "Noch keine Geräte hinzugefügt.";
    return;
  }

  const totalW = devices.reduce((sum, d) => sum + d.watt, 0);
  const recommendedW = Math.ceil(totalW * 1.2); // +20% Reserve
  const kW = (recommendedW / 1000).toFixed(2);
  const avgPF = devices.reduce((s, d) => s + d.pf, 0) / devices.length;
  const kVA = (recommendedW / (avgPF * 1000)).toFixed(2);
  const marketKW = (Math.ceil(kW * 2) / 2).toFixed(1); // auf 0.5 kW gerundet

  resultDisplay.innerHTML = `
    Gesamtleistung: ${totalW} W<br>
    Empfohlen: ${recommendedW} W<br>
    ≈ ${kW} kW / ${kVA} kVA<br><br>
    💡 Marktübliche Generatorgröße: <strong>${marketKW} kW</strong> empfohlen
  `;
}

// 📤 CSV-Export
document.getElementById('exportCSV').onclick = () => {
  if (devices.length === 0) return alert("Keine Daten zum Exportieren.");
  const csv = ["Name;Leistung (W);Leistungsfaktor"];
  devices.forEach(d => csv.push(`${d.name};${d.watt};${d.pf}`));
  const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "generator_leistungsdaten.csv";
  link.click();
};

// 🔄 Alles aktualisieren
function updateAll() {
  updateList();
  calculate();
}

updateAll();

