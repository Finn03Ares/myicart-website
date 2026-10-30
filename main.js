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
