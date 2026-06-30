// FitPunkte App – Main Application Logic

const VERSION = '1.0.0';
const DEFAULT_BUDGET = 21;
const WEEKLY_RESERVE = 35;

// ─── Storage helpers ──────────────────────────────────────────────
const todayKey = () => `fp_log_${new Date().toISOString().slice(0, 10)}`;
const load = (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let settings = load('fp_settings', {
  budget: DEFAULT_BUDGET,
  apiKey: '',
  startWeight: 85.5,
  goalWeight: 81.5,
  goalDate: '2026-09-01'
});

let foodLog   = load(todayKey(), []);
let exLog     = load(`fp_ex_${new Date().toISOString().slice(0, 10)}`, []);
let weightLog = load('fp_weight_log', []);
let pendingFood = null;   // food waiting to be added (from barcode / search)
let scanner   = null;     // html5-qrcode instance

// ─── Startup ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderDate();
  renderDashboard();
  renderSuggestions();
  populateSettings();
  renderWeightHistory();
  renderWeeklyChart();
  renderExerciseLog();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

// ─── Navigation ──────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const screen = document.getElementById(`screen-${name}`);
  if (screen) screen.classList.add('active');
  const btn = document.querySelector(`[data-tab="${name}"]`);
  if (btn) btn.classList.add('active');

  if (name === 'add-food') { renderSuggestions(); clearSearch(); }
  if (name === 'verlauf')  { renderWeightHistory(); renderWeeklyChart(); }
  if (name === 'bewegung') { renderExerciseLog(); }
}

// ─── Dashboard ───────────────────────────────────────────────────
function updateHeaderDate() {
  const d = new Date();
  const opts = { weekday: 'long', day: 'numeric', month: 'long' };
  document.getElementById('header-date').textContent =
    d.toLocaleDateString('de-DE', opts);
}

function totalPoints() {
  return foodLog.reduce((s, e) => s + (e.pts || 0), 0);
}

function renderDashboard() {
  const used   = totalPoints();
  const budget = settings.budget;
  const rem    = budget - used;
  const pct    = Math.min(100, (used / budget) * 100);

  document.getElementById('points-used').textContent    = used;
  document.getElementById('daily-budget-disp').textContent = budget;
  document.getElementById('points-remaining').textContent  =
    rem >= 0 ? `${rem} Punkte übrig` : `${Math.abs(rem)} Punkte überzogen`;
  document.getElementById('points-remaining').style.color =
    rem >= 0 ? 'var(--green-dark)' : 'var(--red)';

  const fill = document.getElementById('progress-fill');
  fill.style.width = `${pct}%`;
  fill.style.background = pct > 100 ? 'var(--red)' : pct > 85 ? 'var(--orange)' : 'var(--green-med)';

  renderMealLog();
}

const MEALS = [
  { id:'fruehstueck', label:'🌅 Frühstück' },
  { id:'snack1',      label:'☕ Snack'       },
  { id:'mittagessen', label:'🍽 Mittagessen' },
  { id:'snack2',      label:'🍎 Snack'       },
  { id:'abendessen',  label:'🌙 Abendessen'  },
  { id:'snack3',      label:'🌃 Abend-Snack' },
];

function renderMealLog() {
  const container = document.getElementById('meal-log');
  if (foodLog.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🥗</div>
        <p>Noch nichts eingetragen.</p>
        <p style="font-size:13px;color:var(--text-muted)">Tippe auf ➕ um dein erstes Essen hinzuzufügen!</p>
      </div>`;
    return;
  }

  const grouped = {};
  MEALS.forEach(m => grouped[m.id] = []);
  foodLog.forEach(e => { if (grouped[e.meal] !== undefined) grouped[e.meal].push(e); });

  let html = '';
  MEALS.forEach(({ id, label }) => {
    const entries = grouped[id];
    if (entries.length === 0) return;
    const mealPts = entries.reduce((s, e) => s + (e.pts || 0), 0);
    html += `<div class="meal-section">
      <div class="meal-header">
        <span class="meal-title">${label}</span>
        <span class="meal-pts">${mealPts} Pkt</span>
      </div>`;
    entries.forEach(e => {
      const ptsBadge = e.pts === 0
        ? `<span class="badge badge-zero">✅ 0</span>`
        : `<span class="badge badge-pts">${e.pts} Pkt</span>`;
      html += `<div class="log-entry" data-id="${e.id}">
        <div class="log-entry-info">
          <span class="log-emoji">${e.emoji || '🍽'}</span>
          <div>
            <div class="log-name">${e.name}</div>
            <div class="log-meta">${e.grams}g · ${e.kcal_total ? Math.round(e.kcal_total) + ' kcal' : ''}</div>
          </div>
        </div>
        <div class="log-entry-right">
          ${ptsBadge}
          <button class="del-btn" onclick="deleteEntry('${e.id}')">🗑</button>
        </div>
      </div>`;
    });
    html += '</div>';
  });
  container.innerHTML = html;
}

function deleteEntry(id) {
  foodLog = foodLog.filter(e => e.id !== id);
  save(todayKey(), foodLog);
  renderDashboard();
}

// ─── Search & Add Food ───────────────────────────────────────────
function clearSearch() {
  const inp = document.getElementById('food-search');
  if (inp) inp.value = '';
  document.getElementById('search-results').innerHTML = '';
}

function searchFood(query) {
  const results = searchFoods(query);
  const container = document.getElementById('search-results');
  if (results.length === 0) {
    container.innerHTML = query.length > 0
      ? `<div class="no-results">Kein Ergebnis für „${query}"<br><small>Tipp: Barcode scannen oder Foto machen</small></div>`
      : '';
    return;
  }
  container.innerHTML = results.map(f => foodCard(f, 100)).join('');
}

function renderSuggestions() {
  const used = totalPoints();
  const rem  = settings.budget - used;
  let html = '';

  if (rem > 0) {
    html += `<div class="section-label">💡 Vorschläge für ${rem} übrige Punkte</div>`;
    const fits = FOODS_DB.filter(f => {
      const pFor100 = f.pts;
      return pFor100 <= rem && pFor100 <= 4;
    }).slice(0, 6);
    html += fits.map(f => foodCard(f, 100)).join('');
  }

  html += `<div class="section-label">✅ Null-Punkte – unbegrenzt essen</div>`;
  html += FOODS_DB.filter(f => f.zero).map(f => foodCard(f, 100)).join('');

  document.getElementById('suggestions').innerHTML = html;
}

function foodCard(f, grams) {
  const pts = calcPointsForAmount(f, grams);
  const badge = pts === 0
    ? `<span class="badge badge-zero">✅ 0 Pkt</span>`
    : `<span class="badge badge-pts">${pts} Pkt</span>`;
  return `<div class="food-card" onclick="openAddForm(${f.id}, ${grams})">
    <span class="food-emoji">${f.emoji}</span>
    <div class="food-info">
      <div class="food-name">${f.name}</div>
      <div class="food-meta">${f.cat} · ${f.kcal} kcal/100g</div>
    </div>
    ${badge}
  </div>`;
}

// ─── Add food form modal ─────────────────────────────────────────
function openAddForm(foodId, suggestedGrams, presetData) {
  const food = presetData || FOODS_DB.find(f => f.id === foodId);
  if (!food) return;
  pendingFood = food;

  document.getElementById('add-form-title').textContent = food.name;
  document.getElementById('add-form-product-info').innerHTML = `
    <div class="product-preview">
      <span class="product-emoji">${food.emoji || '🍽'}</span>
      <div>
        <div class="product-name">${food.name}</div>
        <div class="product-meta">
          ${food.kcal} kcal · ${food.prot}g Protein · ${food.fat}g Fett · ${food.sugar}g Zucker / 100g
        </div>
      </div>
    </div>`;

  // Set meal based on time of day
  const h = new Date().getHours();
  let defaultMeal = 'snack1';
  if (h < 10) defaultMeal = 'fruehstueck';
  else if (h < 13) defaultMeal = 'mittagessen';
  else if (h < 16) defaultMeal = 'snack2';
  else if (h < 19) defaultMeal = 'abendessen';
  else defaultMeal = 'snack3';
  document.getElementById('meal-select').value = defaultMeal;

  const amtInput = document.getElementById('amount-input');
  amtInput.value = suggestedGrams || 100;
  updateCalcPoints();

  document.getElementById('add-form-modal').classList.remove('hidden');
}

function closeAddForm() {
  document.getElementById('add-form-modal').classList.add('hidden');
  pendingFood = null;
}

function updateCalcPoints() {
  if (!pendingFood) return;
  const grams = parseFloat(document.getElementById('amount-input').value) || 0;
  const pts   = calcPointsForAmount(pendingFood, grams);
  document.getElementById('calculated-points').textContent = pts;
  document.getElementById('calc-kcal').textContent =
    Math.round((pendingFood.kcal * grams) / 100) + ' kcal';
}

function confirmAddFood() {
  if (!pendingFood) return;
  const grams = parseFloat(document.getElementById('amount-input').value) || 0;
  const meal  = document.getElementById('meal-select').value;
  const pts   = calcPointsForAmount(pendingFood, grams);
  const entry = {
    id:        crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name:      pendingFood.name,
    emoji:     pendingFood.emoji || '🍽',
    grams,
    meal,
    pts,
    kcal_total: (pendingFood.kcal * grams) / 100,
    time:      new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    foodId:    pendingFood.id
  };
  foodLog.push(entry);
  save(todayKey(), foodLog);
  closeAddForm();
  renderDashboard();
  showScreen('heute');
  showToast(`${pendingFood.name ? pendingFood.name.split('(')[0].trim() : 'Essen'} hinzugefügt – ${pts} Punkte`);
}

// ─── Barcode Scanner ─────────────────────────────────────────────
function openBarcodeScanner() {
  document.getElementById('barcode-modal').classList.remove('hidden');
  document.getElementById('barcode-status').textContent = 'Kamera wird gestartet...';

  setTimeout(() => {
    scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 260, height: 140 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    }, false);

    scanner.render(async (barcode) => {
      closeBarcodeScanner();
      await fetchAndShowBarcode(barcode);
    }, (err) => {});
  }, 300);
}

function closeBarcodeScanner() {
  if (scanner) {
    try { scanner.clear(); } catch {}
    scanner = null;
  }
  document.getElementById('barcode-modal').classList.add('hidden');
}

async function fetchAndShowBarcode(barcode) {
  showToast('Produkt wird gesucht...', 3000);
  try {
    const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      showToast('Produkt nicht gefunden. Bitte manuell eingeben.');
      return;
    }

    const p = data.product;
    const n = p.nutriments || {};
    const food = {
      id:       -1,
      name:     (p.product_name_de || p.product_name || 'Unbekanntes Produkt').slice(0, 60),
      emoji:    '📦',
      cat:      p.categories ? p.categories.split(',')[0].trim() : 'Fertigprodukt',
      kcal:     parseFloat(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
      prot:     parseFloat(n.proteins_100g || 0),
      fat:      parseFloat(n.fat_100g || 0),
      satFat:   parseFloat(n['saturated-fat_100g'] || 0),
      sugar:    parseFloat(n.sugars_100g || 0),
      pts:      0,
      zero:     false,
      fromBarcode: true,
      barcode,
      brand:    p.brands || '',
      image:    p.image_front_small_url || null
    };
    food.pts = calcPoints(food.kcal, food.prot, food.satFat, food.sugar);

    showBarcodeResult(food);
  } catch (e) {
    showToast('Fehler beim Abrufen. Bitte erneut versuchen.');
  }
}

function showBarcodeResult(food) {
  pendingFood = food;
  const pts = food.pts;

  document.getElementById('barcode-result').innerHTML = `
    <div class="barcode-result-card">
      ${food.image ? `<img src="${food.image}" class="product-image" alt="${food.name}">` : ''}
      <div class="product-preview">
        <span class="product-emoji">📦</span>
        <div>
          <div class="product-name">${food.name}</div>
          ${food.brand ? `<div class="product-brand">${food.brand}</div>` : ''}
          <div class="product-meta">
            ${food.kcal} kcal · ${food.prot}g Protein · ${food.fat}g Fett · ${food.sugar}g Zucker / 100g
          </div>
          <div class="product-pts-badge ${pts === 0 ? 'zero' : pts <= 5 ? 'low' : pts <= 8 ? 'mid' : 'high'}">
            ${pts === 0 ? '✅' : '⚡'} <strong>${pts}</strong> Punkte / 100g
          </div>
        </div>
      </div>
      <button class="btn-primary" onclick="openAddForm(-1, 100, pendingFood)">Menge eingeben & hinzufügen</button>
    </div>`;
  document.getElementById('barcode-result').classList.remove('hidden');
  showScreen('add-food');
}

// ─── Photo Recognition ───────────────────────────────────────────
function openCamera() {
  const apiKey = settings.apiKey;
  if (!apiKey) {
    document.getElementById('photo-result').innerHTML = `
      <div class="api-key-notice">
        <div style="font-size:32px">📷</div>
        <p><strong>Foto-Erkennung benötigt einen Claude API Key</strong></p>
        <p style="font-size:13px">Gehe zu ⚙️ Einstellungen → Claude API Key eingeben</p>
        <p style="font-size:12px;color:var(--text-muted)">API Key erhältlich unter: console.anthropic.com</p>
      </div>`;
    document.getElementById('photo-result').classList.remove('hidden');
    return;
  }
  document.getElementById('photo-input').click();
}

async function handlePhotoUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    const mimeType = file.type || 'image/jpeg';

    document.getElementById('photo-result').innerHTML = `
      <div class="photo-loading">
        <div class="spinner"></div>
        <p>KI analysiert dein Essen...</p>
      </div>`;
    document.getElementById('photo-result').classList.remove('hidden');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
              { type: 'text', text: `Analysiere das Essen auf diesem Foto. Antworte NUR mit einem JSON-Objekt, kein anderer Text. Format:
{"name":"Name des Essens auf Deutsch","kcal_100g":Zahl,"prot_100g":Zahl,"fat_100g":Zahl,"satfat_100g":Zahl,"sugar_100g":Zahl,"portion_g":Zahl,"emoji":"passendes Emoji"}
Wenn du das Essen nicht erkennen kannst, antworte mit {"error":"nicht erkannt"}.` }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const data = await response.json();
      const text = data.content[0].text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('no json');
      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.error) {
        document.getElementById('photo-result').innerHTML = `
          <div class="api-key-notice">
            <div style="font-size:32px">🤔</div>
            <p>Essen konnte nicht erkannt werden.</p>
            <p style="font-size:13px">Bitte manuell suchen oder Barcode scannen.</p>
          </div>`;
        return;
      }

      const food = {
        id: -2,
        name:   parsed.name || 'Unbekannt',
        emoji:  parsed.emoji || '🍽',
        cat:    'Foto-Erkennung',
        kcal:   parsed.kcal_100g   || 0,
        prot:   parsed.prot_100g   || 0,
        fat:    parsed.fat_100g    || 0,
        satFat: parsed.satfat_100g || 0,
        sugar:  parsed.sugar_100g  || 0,
        pts:    0,
        zero:   false,
        fromPhoto: true
      };
      food.pts = calcPoints(food.kcal, food.prot, food.satFat, food.sugar);
      const pts = food.pts;

      const imgSrc = e.target.result;
      document.getElementById('photo-result').innerHTML = `
        <div class="barcode-result-card">
          <img src="${imgSrc}" class="photo-preview-img" alt="Foto">
          <div class="product-preview">
            <span class="product-emoji">${food.emoji}</span>
            <div>
              <div class="product-name">${food.name}</div>
              <div class="product-meta">
                ~${food.kcal} kcal · ${food.prot}g Protein · ${food.fat}g Fett / 100g
              </div>
              <div class="product-pts-badge ${pts === 0 ? 'zero' : pts <= 5 ? 'low' : pts <= 8 ? 'mid' : 'high'}">
                ${pts === 0 ? '✅' : '⚡'} <strong>${pts}</strong> Punkte / 100g
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px">
                📸 KI-Schätzung – Werte können abweichen
              </div>
            </div>
          </div>
          <button class="btn-primary" onclick="openAddForm(-2, ${parsed.portion_g || 100}, pendingFood)">
            Menge eingeben & hinzufügen
          </button>
        </div>`;
      pendingFood = food;

    } catch (err) {
      document.getElementById('photo-result').innerHTML = `
        <div class="api-key-notice">
          <p>⚠️ Fehler bei der Erkennung.</p>
          <p style="font-size:13px">${err.message}</p>
        </div>`;
    }
  };
  reader.readAsDataURL(file);
  input.value = '';
}

// ─── Exercise / Steps ────────────────────────────────────────────
function updateSteps(val) {
  document.getElementById('steps-count').textContent = parseInt(val).toLocaleString('de-DE');
  const pct = Math.min(100, (val / 10000) * 100);
  document.getElementById('steps-progress').style.width = `${pct}%`;
  const kcalWalk = Math.round(val * 0.04);
  document.getElementById('steps-kcal').textContent = kcalWalk;
  save(`fp_steps_${new Date().toISOString().slice(0, 10)}`, parseInt(val));
}

function setStepsManual() {
  const val = prompt('Schritte heute:', document.getElementById('steps-slider').value);
  if (val && !isNaN(val)) {
    document.getElementById('steps-slider').value = val;
    updateSteps(val);
  }
}

function addActivity() {
  document.getElementById('activity-picker-modal').classList.remove('hidden');
}

function closeActivityPicker() {
  document.getElementById('activity-picker-modal').classList.add('hidden');
}

function pickActivity(id) {
  closeActivityPicker();
  const act = ACTIVITIES.find(a => a.id === id);
  if (!act) return;
  const mins = parseInt(prompt(`${act.emoji} ${act.name}\nWie viele Minuten?`, '30'));
  if (!mins || isNaN(mins)) return;
  const kcal = Math.round(act.kcalPerMin * mins);
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    actId: id, name: act.name, emoji: act.emoji,
    mins, kcal,
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  };
  exLog.push(entry);
  save(`fp_ex_${new Date().toISOString().slice(0, 10)}`, exLog);
  renderExerciseLog();
  showToast(`${act.emoji} ${act.name} (${mins} Min) gespeichert!`);
}

function deleteExEntry(id) {
  exLog = exLog.filter(e => e.id !== id);
  save(`fp_ex_${new Date().toISOString().slice(0, 10)}`, exLog);
  renderExerciseLog();
}

function renderExerciseLog() {
  const container = document.getElementById('exercise-log-list');
  if (exLog.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Noch keine Aktivität heute</p></div>';
    return;
  }
  const totalKcal = exLog.reduce((s, e) => s + e.kcal, 0);
  container.innerHTML = `
    <div class="ex-total">🔥 ${totalKcal} kcal heute verbrannt</div>` +
    exLog.map(e => `
    <div class="log-entry">
      <div class="log-entry-info">
        <span class="log-emoji">${e.emoji}</span>
        <div>
          <div class="log-name">${e.name}</div>
          <div class="log-meta">${e.mins} Min · ~${e.kcal} kcal · ${e.time}</div>
        </div>
      </div>
      <button class="del-btn" onclick="deleteExEntry('${e.id}')">🗑</button>
    </div>`).join('');
}

function renderActivityPicker() {
  const grid = document.getElementById('activity-grid');
  grid.innerHTML = ACTIVITIES.map(a => `
    <button class="activity-item" onclick="pickActivity('${a.id}')">
      <div class="activity-emoji">${a.emoji}</div>
      <div class="activity-name">${a.name}</div>
      <div class="activity-kcal">~${a.kcalPerMin * 30} kcal/30min</div>
    </button>`).join('');
}

// ─── Weight Log ──────────────────────────────────────────────────
function saveWeight() {
  const val = parseFloat(document.getElementById('weight-input').value);
  if (!val || isNaN(val)) { showToast('Bitte ein gültiges Gewicht eingeben'); return; }
  const today = new Date().toISOString().slice(0, 10);
  weightLog = weightLog.filter(e => e.date !== today);
  weightLog.push({ date: today, weight: val });
  weightLog.sort((a, b) => a.date.localeCompare(b.date));
  save('fp_weight_log', weightLog);
  renderWeightHistory();
  showToast(`⚖️ ${val} kg gespeichert`);
  document.getElementById('weight-input').value = '';
}

function renderWeightHistory() {
  const container = document.getElementById('weight-history');
  if (weightLog.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Noch keine Einträge</p>';
    return;
  }
  const last = weightLog.slice(-7).reverse();
  const start = settings.startWeight;
  const goal  = settings.goalWeight;
  const current = last[0].weight;
  const lost  = (start - current).toFixed(1);
  const toGo  = (current - goal).toFixed(1);

  container.innerHTML = `
    <div class="weight-summary">
      <div class="weight-stat">
        <div class="stat-val">${current} kg</div>
        <div class="stat-lbl">Aktuell</div>
      </div>
      <div class="weight-stat">
        <div class="stat-val ${parseFloat(lost) > 0 ? 'green' : 'orange'}">${lost > 0 ? '−' : '+'}${Math.abs(lost)} kg</div>
        <div class="stat-lbl">Abgenommen</div>
      </div>
      <div class="weight-stat">
        <div class="stat-val">${toGo} kg</div>
        <div class="stat-lbl">Noch bis Ziel</div>
      </div>
    </div>
    <div class="weight-list">
      ${last.map(e => `
        <div class="weight-entry">
          <span>${new Date(e.date).toLocaleDateString('de-DE', {weekday:'short', day:'numeric', month:'short'})}</span>
          <strong>${e.weight} kg</strong>
        </div>`).join('')}
    </div>`;
}

// ─── Weekly Chart ────────────────────────────────────────────────
function renderWeeklyChart() {
  const container = document.getElementById('weekly-chart');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const log = load(`fp_log_${key}`, []);
    const pts = log.reduce((s, e) => s + (e.pts || 0), 0);
    days.push({ date: d, pts, key });
  }
  const max = Math.max(...days.map(d => d.pts), settings.budget);

  container.innerHTML = `
    <div class="week-bars">
      ${days.map(d => {
        const pct = max > 0 ? (d.pts / max) * 100 : 0;
        const over = d.pts > settings.budget;
        const today = d.key === new Date().toISOString().slice(0, 10);
        return `<div class="week-day ${today ? 'today' : ''}">
          <div class="bar-wrap">
            <div class="bar-fill ${over ? 'over' : ''}" style="height:${pct}%"></div>
          </div>
          <div class="bar-pts">${d.pts}</div>
          <div class="bar-day">${d.date.toLocaleDateString('de-DE', {weekday:'short'})}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="budget-line-label">Budget: ${settings.budget} Pkt</div>`;
}

// ─── Settings ────────────────────────────────────────────────────
function populateSettings() {
  document.getElementById('s-budget').value       = settings.budget;
  document.getElementById('s-api-key').value      = settings.apiKey;
  document.getElementById('s-start-weight').value = settings.startWeight;
  document.getElementById('s-goal-weight').value  = settings.goalWeight;
  document.getElementById('s-goal-date').value    = settings.goalDate;
}

function saveSettings() {
  settings.budget      = parseInt(document.getElementById('s-budget').value) || DEFAULT_BUDGET;
  settings.apiKey      = document.getElementById('s-api-key').value.trim();
  settings.startWeight = parseFloat(document.getElementById('s-start-weight').value) || 85.5;
  settings.goalWeight  = parseFloat(document.getElementById('s-goal-weight').value) || 81.5;
  settings.goalDate    = document.getElementById('s-goal-date').value;
  save('fp_settings', settings);
  renderDashboard();
  showToast('✅ Einstellungen gespeichert');
}

function clearTodayLog() {
  if (confirm('Alle heutigen Einträge löschen?')) {
    foodLog = [];
    save(todayKey(), foodLog);
    renderDashboard();
    showToast('Heute gelöscht');
  }
}

// ─── Toast ───────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), dur);
}

// Bootstrap activity picker on load
window.addEventListener('load', () => {
  renderActivityPicker();

  // Load saved steps
  const savedSteps = load(`fp_steps_${new Date().toISOString().slice(0, 10)}`, 0);
  if (savedSteps) {
    document.getElementById('steps-slider').value = savedSteps;
    updateSteps(savedSteps);
  }
});
