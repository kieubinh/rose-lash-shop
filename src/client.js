(() => {
  const form = document.getElementById('rose-request-form');
  const modeInput = document.getElementById('rose-request-kind');
  const modeButtons = [...document.querySelectorAll('[data-request-mode]')];
  const bookingFields = document.getElementById('rose-booking-fields');
  const inquiryFields = document.getElementById('rose-inquiry-fields');
  const submitButton = document.getElementById('rose-submit');
  const status = document.getElementById('rose-form-status');
  const date = document.getElementById('rose-date');
  let pending = false;
  let activeId = null;
  let retryId = null;
  let retryPayload = null;
  let measureQueued = false;

  function tellHost(message) {
    if (window.parent !== window) window.parent.postMessage(message, '*');
  }

  function measure() {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => {
      measureQueued = false;
      tellHost({ type: 'rose:height', height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) });
    });
  }

  function showStatus(message, state = '') {
    status.textContent = message;
    status.dataset.state = state;
    measure();
  }

  function setMode(kind) {
    if (pending || (kind !== 'booking' && kind !== 'inquiry')) return;
    modeInput.value = kind;
    bookingFields.hidden = kind !== 'booking';
    inquiryFields.hidden = kind !== 'inquiry';
    for (const field of bookingFields.querySelectorAll('input,select,textarea')) field.disabled = kind !== 'booking';
    for (const field of inquiryFields.querySelectorAll('input,select,textarea')) field.disabled = kind !== 'inquiry';
    for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.requestMode === kind));
    submitButton.textContent = kind === 'booking' ? 'Request appointment ↗' : 'Send inquiry ↗';
    showStatus('');
  }

  function newRequestId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  for (const button of modeButtons) button.addEventListener('click', () => setMode(button.dataset.requestMode));

  form.addEventListener('input', () => {
    if (!pending && status.textContent) showStatus('');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    if (window.parent === window) {
      showStatus('The request form is unavailable in this preview.', 'error');
      return;
    }

    const values = new FormData(form);
    const payload = {
      kind: modeInput.value,
      name: String(values.get('name') || '').trim(),
      email: String(values.get('email') || '').trim(),
      phone: String(values.get('phone') || '').trim(),
      treatment: String(values.get('treatment') || '').trim(),
      date: String(values.get('date') || '').trim(),
      time: String(values.get('time') || '').trim(),
      notes: String(values.get('notes') || '').trim(),
      message: String(values.get('message') || '').trim(),
      website: String(values.get('website') || '').trim()
    };
    const fingerprint = JSON.stringify(payload);
    activeId = fingerprint === retryPayload ? retryId : newRequestId();
    retryPayload = fingerprint;
    retryId = activeId;
    pending = true;
    submitButton.disabled = true;
    for (const button of modeButtons) button.disabled = true;
    showStatus('Sending your request…', 'pending');
    tellHost({ type: 'rose:submit', id: activeId, payload });
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || !event.data || typeof event.data !== 'object') return;
    if (event.data.type === 'rose:measure') {
      measure();
      return;
    }
    if (event.data.type !== 'rose:result' || event.data.id !== activeId) return;
    pending = false;
    submitButton.disabled = false;
    for (const button of modeButtons) button.disabled = false;
    if (event.data.ok) {
      const kind = modeInput.value;
      form.reset();
      setMode(kind);
      retryPayload = null;
      retryId = null;
      showStatus(kind === 'booking' ? 'Request sent. Rose will reply to confirm your appointment.' : 'Inquiry sent. Rose will reply by email.', 'success');
    } else {
      showStatus(typeof event.data.message === 'string' ? event.data.message : 'We could not send your request. Please try again.', 'error');
    }
    activeId = null;
  });

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash && document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    tellHost({ type: 'rose:navigate', hash, top: target.getBoundingClientRect().top + window.scrollY });
  });

  const now = new Date();
  date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  setMode('booking');
  new ResizeObserver(measure).observe(document.body);
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  tellHost({ type: 'rose:ready' });
  measure();
})();
