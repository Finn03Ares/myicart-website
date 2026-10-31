// Where the early-access form sends sign-ups.
// Paste your Formspree form URL here, e.g. 'https://formspree.io/f/abcdwxyz'.
// Until it's set, the form opens the visitor's email app instead so no sign-up is lost.
const SIGNUP_ENDPOINT = '';
const FALLBACK_EMAIL = 'hello.icartau@gmail.com';

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
links.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

// Early-access form
const form = document.getElementById('signup-form');
const status = form.querySelector('.form-status');

function setStatus(text, kind) {
  status.textContent = text;
  status.className = 'form-status' + (kind ? ' ' + kind : '');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim();

  if (data.get('company')) return; // bot filled the hidden field
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setStatus('Please enter a valid email address.', 'err');
    form.email.focus();
    return;
  }
  if (!data.get('consent')) {
    setStatus('Please tick the box so we can email you about the launch.', 'err');
    return;
  }

  if (!SIGNUP_ENDPOINT) {
    const body = `Please add me to the iCart early-access list.\n\nEmail: ${email}\nSuburb: ${data.get('suburb') || '-'}\nHousehold size: ${data.get('household') || '-'}`;
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent('iCart early access')}&body=${encodeURIComponent(body)}`;
    setStatus('Your email app should open with your details. Just hit send.', 'ok');
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setStatus('Sending…');
  try {
    data.delete('company');
    const res = await fetch(SIGNUP_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    setStatus("Done. You're on the list.", 'ok');
  } catch {
    setStatus('Something went wrong. Please try again in a moment.', 'err');
  } finally {
    button.disabled = false;
  }
});

// "Have a go" demo: pick meals, and the shopping list combines their ingredients.
// Amounts are for 4 people; baking makes a fixed batch, so it doesn't scale.
const MEALS = [
  { id: 'bolognese', name: 'Spaghetti bolognese', note: '30 min', items: [['Beef mince', 500, 'g'], ['Spaghetti', 500, 'g'], ['Tinned tomatoes', 2, 'tins'], ['Brown onion', 1, ''], ['Garlic', 2, 'cloves'], ['Carrot', 1, '']] },
  { id: 'tacos', name: 'Beef tacos', note: '20 min', items: [['Beef mince', 500, 'g'], ['Taco shells', 12, ''], ['Cos lettuce', 1, ''], ['Tomatoes', 2, ''], ['Grated cheese', 150, 'g'], ['Brown onion', 1, '']] },
  { id: 'stirfry', name: 'Chicken stir-fry', note: '25 min', items: [['Chicken thigh', 600, 'g'], ['Rice', 300, 'g'], ['Broccoli', 1, 'head'], ['Capsicum', 1, ''], ['Garlic', 2, 'cloves'], ['Soy sauce', 3, 'tbsp']] },
  { id: 'soup', name: 'Pumpkin soup', note: '40 min', items: [['Pumpkin', 1000, 'g'], ['Brown onion', 1, ''], ['Garlic', 2, 'cloves'], ['Chicken stock', 1000, 'ml'], ['Cream', 100, 'ml']] },
  { id: 'banana', name: 'Banana bread', note: 'Makes 1 loaf', fixed: true, items: [['Bananas', 3, ''], ['Self-raising flour', 250, 'g'], ['Butter', 100, 'g'], ['Eggs', 2, ''], ['Brown sugar', 150, 'g']] },
  { id: 'anzac', name: 'Anzac biscuits', note: 'Makes 20', fixed: true, items: [['Rolled oats', 150, 'g'], ['Plain flour', 150, 'g'], ['Butter', 125, 'g'], ['Golden syrup', 2, 'tbsp'], ['Desiccated coconut', 90, 'g'], ['Brown sugar', 150, 'g']] },
];

// Example shelf prices, roughly what a Brisbane supermarket charges. [pack size, pack price]
// Items sold by weight use a 1 kg "pack" and are charged for the exact amount (byWeight).
const PRICES = {
  'Beef mince': [500, 7.00], 'Spaghetti': [500, 1.60], 'Tinned tomatoes': [1, 1.10], 'Brown onion': [1, 0.60],
  'Garlic': [10, 1.00], 'Carrot': [1, 0.40], 'Taco shells': [12, 3.00], 'Cos lettuce': [1, 2.50], 'Tomatoes': [1, 0.90],
  'Grated cheese': [250, 4.00], 'Chicken thigh': [1000, 15.00, true], 'Rice': [1000, 2.40], 'Broccoli': [1, 2.50],
  'Capsicum': [1, 1.50], 'Soy sauce': [16, 2.50], 'Pumpkin': [1000, 3.90, true], 'Chicken stock': [1000, 2.20],
  'Cream': [300, 2.60], 'Bananas': [1, 0.45], 'Self-raising flour': [1000, 1.80], 'Butter': [250, 5.50],
  'Eggs': [12, 6.00], 'Brown sugar': [1000, 2.80], 'Rolled oats': [750, 2.20], 'Plain flour': [1000, 1.50],
  'Golden syrup': [25, 4.20], 'Desiccated coconut': [250, 2.00],
};

function costOf(name, qty) {
  const [size, price, byWeight] = PRICES[name];
  return byWeight ? price * qty / size : Math.ceil(qty / size - 1e-9) * price;
}

const money = n => '$' + n.toFixed(2);

const demoState = { people: 4, picked: new Set(['bolognese', 'tacos', 'banana', 'anzac']), ticked: new Set() };
const mealBox = document.getElementById('meal-options');
const itemList = document.getElementById('demo-items');
const summary = document.getElementById('demo-summary');
const peopleOut = document.getElementById('people-count');
const minus = document.getElementById('people-minus');
const plus = document.getElementById('people-plus');
let shownItems = new Set();

function formatQty(qty, unit) {
  if (unit === 'g' && qty >= 1000) return `${+(qty / 1000).toFixed(1)} kg`;
  if (unit === 'ml' && qty >= 1000) return `${+(qty / 1000).toFixed(1)} L`;
  if (unit === 'g' || unit === 'ml') return `${qty} ${unit}`;
  return unit ? `${qty} ${unit}` : `× ${qty}`;
}

function roundQty(qty, unit) {
  if (unit === 'g' || unit === 'ml') return Math.max(10, Math.round(qty / (qty >= 200 ? 50 : 10)) * (qty >= 200 ? 50 : 10));
  if (unit === 'tbsp') return Math.max(1, Math.round(qty * 2) / 2);
  return Math.max(1, Math.ceil(qty));
}

function renderMeals() {
  mealBox.innerHTML = '';
  for (const meal of MEALS) {
    const label = document.createElement('label');
    label.className = 'meal-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'meal-' + meal.id;
    input.checked = demoState.picked.has(meal.id);
    input.addEventListener('change', () => {
      input.checked ? demoState.picked.add(meal.id) : demoState.picked.delete(meal.id);
      renderList();
    });
    const span = document.createElement('span');
    span.innerHTML = `<b></b><small></small>`;
    span.querySelector('b').textContent = meal.name;
    span.querySelector('small').textContent = meal.note;
    label.append(input, span);
    mealBox.append(label);
  }
}

function renderList() {
  const combined = new Map();
  let separately = 0;
  for (const meal of MEALS) {
    if (!demoState.picked.has(meal.id)) continue;
    const scale = meal.fixed ? 1 : demoState.people / 4;
    for (const [name, qty, unit] of meal.items) {
      separately += costOf(name, roundQty(qty * scale, unit));
      const key = name + '|' + unit;
      const entry = combined.get(key) || { name, unit, qty: 0, meals: 0 };
      entry.qty += qty * scale;
      entry.meals += 1;
      combined.set(key, entry);
    }
  }

  itemList.innerHTML = '';
  const nowShown = new Set();
  let total = 0;
  if (!combined.size) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Pick a meal to start your list.';
    itemList.append(li);
  }
  for (const [key, entry] of [...combined].sort((a, b) => b[1].meals - a[1].meals || a[1].name.localeCompare(b[1].name))) {
    nowShown.add(key);
    const li = document.createElement('li');
    if (!shownItems.has(key)) li.className = 'new';
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = demoState.ticked.has(key);
    box.addEventListener('change', () => {
      box.checked ? demoState.ticked.add(key) : demoState.ticked.delete(key);
      renderSummary(combined.size);
    });
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = entry.name;
    if (entry.meals > 1) {
      const shared = document.createElement('small');
      shared.className = 'shared';
      shared.textContent = `Used in ${entry.meals} meals`;
      name.append(shared);
    }
    const amount = roundQty(entry.qty, entry.unit);
    const qty = document.createElement('span');
    qty.className = 'qty';
    qty.textContent = formatQty(amount, entry.unit);
    const price = document.createElement('span');
    price.className = 'price';
    const cost = costOf(entry.name, amount);
    total += cost;
    price.textContent = money(cost);
    label.append(box, name, qty, price);
    li.append(label);
    itemList.append(li);
  }
  shownItems = nowShown;
  renderTotals(total, separately);
  for (const key of demoState.ticked) if (!nowShown.has(key)) demoState.ticked.delete(key);
  renderSummary(combined.size);
}

function renderTotals(total, separately) {
  const meals = demoState.picked.size;
  document.getElementById('demo-totals').hidden = !meals;
  if (!meals) return;
  document.getElementById('demo-total').textContent = money(total);
  document.getElementById('demo-per-label').textContent = `Across ${meals} ${meals === 1 ? 'meal' : 'meals'}`;
  document.getElementById('demo-per').textContent = `about ${money(total / meals)} each`;
  const saving = separately - total;
  document.getElementById('demo-saving-row').hidden = saving < 0.5;
  document.getElementById('demo-saving').textContent = money(saving);
}

function renderSummary(total) {
  const meals = demoState.picked.size;
  const done = [...demoState.ticked].length;
  summary.textContent = total
    ? `${meals} ${meals === 1 ? 'meal' : 'meals'} · ${done ? `${done} of ${total} ticked` : `${total} items`}`
    : '';
}

function setPeople(n) {
  demoState.people = Math.min(8, Math.max(1, n));
  peopleOut.textContent = demoState.people;
  minus.disabled = demoState.people === 1;
  plus.disabled = demoState.people === 8;
  renderList();
}

minus.addEventListener('click', () => setPeople(demoState.people - 1));
plus.addEventListener('click', () => setPeople(demoState.people + 1));
renderMeals();
setPeople(4);
