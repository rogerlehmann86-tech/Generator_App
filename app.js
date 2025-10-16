document.addEventListener("DOMContentLoaded", () => {
  console.log("GeneratorCalc v4.7.9 (Empfehlung im Vordergrund)");

  const categories = {
    "Werkzeuge": [
      { name: "Bohrmaschine", watt: 800, pf: 0.9, startSurge: true, startMult: 2.5 },
      { name: "Winkelschleifer", watt: 1200, pf: 0.85, startSurge: true, startMult: 2.5 }
    ],
    "Haushalt": [
      { name: "Kühlschrank", watt: 150, pf: 0.8, startSurge: true, startMult: 3 },
      { name: "Wasserkocher", watt: 1800, pf: 1 }
    ],
    "Baumaschinen": [
      { name: "Kompressor", watt: 1500, pf: 0.85, startSurge: true, startMult: 3 }
    ],
    "Camping": [
      { name: "Kühlbox", watt: 60, pf: 0.9, startSurge: true, startMult: 2 }
    ]
  };

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
  });

  preset.addEventListener("change", () => {
    const d = (categories[cat.value] || []).find(x => x.name === preset.value);
    if (!d) return;
    nameEl.value = d.name;
    wattEl.value = d.watt;
    pfEl.value = d.pf ?? "";
    multEl.value = d.startMult ?? "";
    surgeBox.checked = (d.pf && d.pf < 1) || (d.startMult && d.startMult > 1);
    preset.value = "";
  });

  let devices = [];
  try { devices = JSON.parse(localStorage.getItem("devices") || "[]") || []; }
  catch { devices = []; }
  const save = () => localStorage.setItem("devices", JSON.stringify(devices));

  function updateList() {
    listEl.innerHTML = "";
    devices.forEach((d, i) => {
      const parts = [];
      if (d.pf !== "" && Number(d.pf) !== 1) parts.push(`<em>cos φ ${d.pf}</em>`);
      if (d.startMult !== "" && Number(d.startMult) !== 1) parts.push(`<em>Iₐ ${d.startMult}</em>`);
      const extra = parts.length ? ` (${parts.join(", ")})` : "";
      const li = document.createElement("li");
      li.innerHTML = `<span>${d.name}: ${d.watt} W${extra}</span>`;
      const del = document.createElement("button");
      del.textContent = "✖";
      del.onclick = () => { devices.splice(i, 1); save(); updateAll(); };
      li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  document.getElementById("addDevice").addEventListener("click", () => {
    const name = nameEl.value.trim();
    const watt = parseFloat(wattEl.value);
    const pf = pfEl.value === "" ? 1 : (parseFloat(pfEl.value) || 1);
    const mult = multEl.value === "" ? 1 : (parseFloat(multEl.value) || 1);
    if (!name || isNaN(watt) || watt <= 0) return alert("Bitte Gerätename und gültige Leistung angeben.");
    if (pf < 1 || mult > 1) surgeBox.checked = true;
    devices.push({ name, watt, pf, startSurge: surgeBox.checked, startMult: mult });
    save(); updateAll();
    nameEl.value = wattEl.value = pfEl.value = multEl.value = "";
    surgeBox.checked = false;
  });

  document.getElementById("clearDevices").addEventListener("click", () => {
    if (!confirm("Alle Geräte wirklich löschen?")) return;
    devices = []; save(); updateAll();
  });

  // --------- Berechnung (ohne Reserve, nächste Marktgröße) ---------
  function computeSummary(devs) {
    const PF_REF_GEN = 0.8;

    const S_total = devs.reduce((sum, d) => {
      const P = Number(d.watt) || 0;
      const PF = (Number(d.pf) || 1);
      const M = (Number(d.startMult) || 1);
      const S_i = PF > 0 ? (P / PF) * M : P * M;
      return sum + S_i;
    }, 0);

    const totalKVA = S_total / 1000;
    const totalKW = totalKVA * PF_REF_GEN;

    const kVA_steps = [0.65, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6.5, 8, 10, 12, 15, 20];
    const marketKVA = kVA_steps.find(s => totalKVA < s) ?? Math.ceil(totalKVA);
    const marketKW = marketKVA * PF_REF_GEN;

    const usagePercent = (totalKVA / marketKVA) * 100;

    return { totalKW, totalKVA, marketKVA, marketKW, usagePercent };
  }

  // --------- Chart ---------
  let chart = null;
  function renderChart(usagePercent) {
    const used = Math.min(100, Math.max(0, usagePercent));
    const remaining = Math.max(0, 100 - used);
    const color = used >= 85 ? "#dc2626" : used >= 60 ? "#facc15" : "#16a34a";
    const data = { datasets: [{ data: [used, remaining], backgroundColor: [color, "#e9efff"], borderWidth: 0 }] };
    const options = { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } };
    const centerTextPlugin = {
      id: "centerText",
      afterDraw: (c) => {
        const { ctx, width, height } = c;
        ctx.save();
        const fs = (height / 6) | 0;
        ctx.font = `${fs}px ui-sans-serif, system-ui`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#0b3b66";
        const t = `${Math.round(used)}%`;
        ctx.fillText(t, Math.round((width - ctx.measureText(t).width) / 2), height / 2);
        ctx.restore();
      }
    };
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, { type: "doughnut", data, options, plugins: [centerTextPlugin] });
  }

  // --------- Anzeige (Empfehlung vordergrund, Bedarf hintergrund) ---------
  function calculateAndDisplay() {
    if (!devices.length) {
      resultEl.textContent = "Noch keine Geräte hinzugefügt.";
      if (chart) chart.destroy();
      chart = null;
      return;
    }

    const s = computeSummary(devices);

    resultEl.innerHTML = `
      <div style="font-size:1.3rem; color:#0b3b66; font-weight:700; margin-bottom:6px;">
        ⚡ Empfohlener Generator: ${s.marketKVA.toFixed(1)} kVA (≈ ${s.marketKW.toFixed(1)} kW)
      </div>
      <div style="font-size:0.95rem; color:#666;">
        Gesamtleistungsbedarf: ${s.totalKW.toFixed(1)} kW
      </div>
    `;

    renderChart(s.usagePercent);
  }

  // --------- PDF ---------
  document.getElementById("exportPDF").addEventListener("click", () => {
    if (!devices.length) return alert("Keine Daten zum Exportieren.");
    const { jsPDF } = window.jspdf;
    const s = computeSummary(devices);
    const doc = new jsPDF();

    doc.setFillColor(0, 85, 165); doc.rect(0, 0, 210, 25, "F");
    try { doc.addImage(document.getElementById("pdfLogo"), "JPEG", 10, 4, 35, 17); } catch {}
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text("Generator Leistungsrechner", 50, 14);
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    doc.text(`Empfohlener Generator: ${s.marketKVA.toFixed(1)} kVA (≈ ${s.marketKW.toFixed(1)} kW)`, 14, 40);
    doc.setFontSize(11).setTextColor(100);
    doc.text(`Gesamtleistungsbedarf: ${s.totalKW.toFixed(1)} kW`, 14, 48);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text("Erstellt mit GeneratorCalc © 2025 Lehmann GT", 14, 270);
    doc.save("generator_daten.pdf");
  });

  function updateAll(){ updateList(); calculateAndDisplay(); }
  updateAll();
});
