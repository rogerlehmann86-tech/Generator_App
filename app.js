let devices = [];

const list = document.getElementById("devices");
const output = document.getElementById("output");
const addBtn = document.getElementById("addDevice");
const chartCanvas = document.getElementById("chart");
let chartCtx = chartCanvas.getContext("2d");

addBtn.addEventListener("click", () => {
  const name = document.getElementById("deviceName").value.trim();
  const watt = parseFloat(document.getElementById("devicePower").value);
  const pf = parseFloat(document.getElementById("devicePF").value);
  const startMult = parseFloat(document.getElementById("deviceStart").value);

  if (!name || isNaN(watt) || watt <= 0) return alert("Bitte gültige Werte eingeben.");

  const device = { name, watt, pf: pf || 1, startMult: startMult || 1, startSurge: startMult > 1 };
  devices.push(device);
  renderList();
  calculate();
  saveLocal();
});

function renderList() {
  list.innerHTML = "";
  devices.forEach((d, i) => {
    const li = document.createElement("li");
    li.textContent = `${d.name} – ${d.watt}W, PF ${d.pf}, Startfaktor ${d.startMult}`;
    li.onclick = () => { devices.splice(i, 1); renderList(); calculate(); saveLocal(); };
    list.appendChild(li);
  });
}

function calculate() {
  if (!devices.length) { output.innerHTML = ""; chartCtx.clearRect(0,0,chartCanvas.width,chartCanvas.height); return; }
  const totalActiveW = devices.reduce((s, d) => s + d.watt, 0);
  const largestSurgeW = devices.reduce((m, d) => Math.max(m, d.watt * d.startMult), 0);
  const recommendedW = Math.max(Math.ceil(totalActiveW * 1.2), largestSurgeW);
  const avgPF = devices.reduce((s, d) => s + d.pf, 0) / devices.length;
  const kW = recommendedW / 1000;
  const kVA = kW / (avgPF || 0.8);

  function roundMarketKW(val) {
    const sizes = [0.65, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6.5, 8, 10, 12, 15, 20];
    for (let s of sizes) if (val <= s) return s;
    return Math.ceil(val);
  }
  const marketKW = roundMarketKW(kW);

  output.innerHTML = `
    <strong>Gesamtleistung:</strong> ${totalActiveW} W<br>
    <strong>Empfohlene Generatorleistung:</strong> ${recommendedW} W<br>
    <strong>≈ ${kW.toFixed(2)} kW / ${kVA.toFixed(2)} kVA</strong><br>
    <strong>Marktübliche Generatorgröße:</strong> ${marketKW.toFixed(1)} kW Generator empfohlen
  `;

  // Diagramm zeichnen
  const percent = Math.min(100, (totalActiveW / (marketKW * 1000)) * 100);
  chartCtx.clearRect(0,0,chartCanvas.width,chartCanvas.height);
  chartCtx.fillStyle = percent > 85 ? "#ef4444" : "#22c55e";
  chartCtx.fillRect(0, 50, percent * 3, 50);
  chartCtx.fillStyle = "#000";
  chartCtx.fillText(`${percent.toFixed(1)}% Auslastung`, 10, 45);
}

// PDF Export
document.getElementById("exportCSV").textContent = "⬇️ PDF exportieren";
document.getElementById("exportCSV").addEventListener("click", () => {
  if (!devices.length) return alert("Keine Daten zum Exportieren.");

  const totalActiveW = devices.reduce((s, d) => s + d.watt, 0);
  const largestSurgeW = devices.reduce((m, d) => Math.max(m, d.watt * d.startMult), 0);
  const recommendedW = Math.max(Math.ceil(totalActiveW * 1.2), largestSurgeW);
  const avgPF = devices.reduce((s, d) => s + d.pf, 0) / devices.length;
  const kW = recommendedW / 1000;
  const kVA = kW / (avgPF || 0.8);
  const marketKW = Math.ceil(kW);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = new Date().toLocaleString("de-CH");
  doc.setFontSize(16);
  doc.text("Generator Leistungsrechner", 14, 20);
  doc.setFontSize(10);
  doc.text(`Exportdatum: ${date}`, 14, 26);
  let y = 35;
  doc.setFontSize(12);
  doc.text("Geräteliste", 14, y);
  y += 6;
  doc.setFontSize(10);
  devices.forEach(d => { doc.text(`${d.name} (${d.watt}W, PF ${d.pf}, Start ${d.startMult})`, 14, y); y += 6; });
  y += 8;
  doc.setFontSize(12);
  doc.text("Berechnungsergebnis", 14, y); y += 6;
  doc.setFontSize(10);
  doc.text(`Gesamtleistung: ${totalActiveW} W`, 14, y); y += 5;
  doc.text(`Empfohlene Generatorleistung: ${recommendedW} W`, 14, y); y += 5;
  doc.text(`≈ ${kW.toFixed(2)} kW / ${kVA.toFixed(2)} kVA`, 14, y); y += 5;
  doc.text(`Marktübliche Größe: ${marketKW.toFixed(1)} kW Generator empfohlen`, 14, y);
  doc.save("generator_berechnung.pdf");
});

function saveLocal() { localStorage.setItem("devices", JSON.stringify(devices)); }
function loadLocal() {
  const saved = localStorage.getItem("devices");
  if (saved) { devices = JSON.parse(saved); renderList(); calculate(); }
}
loadLocal();
