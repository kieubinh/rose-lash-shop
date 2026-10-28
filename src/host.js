(() => {
  const frame = document.getElementById('rose-studio-frame');
  let inFlight = false;

  function reply(message) {
    if (frame.contentWindow) frame.contentWindow.postMessage(message, '*');
  }

  frame.addEventListener('load', () => reply({ type: 'rose:measure' }));

  window.addEventListener('message', async (event) => {
    if (event.source !== frame.contentWindow || !event.data || typeof event.data !== 'object') return;
    const message = event.data;

    if (message.type === 'rose:ready') {
      reply({ type: 'rose:measure' });
      return;
    }
    if (message.type === 'rose:height') {
      if (Number.isFinite(message.height) && message.height >= 300 && message.height <= 12000) {
        frame.style.height = `${Math.ceil(message.height)}px`;
      }
      return;
    }
    if (message.type === 'rose:navigate') {
      if (typeof message.hash !== 'string' || !/^#[a-z0-9-]{1,40}$/i.test(message.hash)) return;
      if (!Number.isFinite(message.top) || message.top < 0 || message.top > 12000) return;
      const top = window.scrollY + frame.getBoundingClientRect().top + message.top;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reducedMotion ? 'instant' : 'smooth' });
      history.replaceState(null, '', message.hash);
      return;
    }
    if (message.type !== 'rose:submit') return;
    if (typeof message.id !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(message.id)) return;
    if (!message.payload || typeof message.payload !== 'object' || Array.isArray(message.payload)) return;
    if (inFlight) {
      reply({ type: 'rose:result', id: message.id, ok: false, message: 'Please wait for your current request.' });
      return;
    }

    inFlight = true;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...message.payload, requestId: message.id }),
        cache: 'no-store'
      });
      const result = await response.json().catch(() => ({}));
      reply({
        type: 'rose:result',
        id: message.id,
        ok: response.ok && result.ok === true,
        message: typeof result.message === 'string' && result.message.length <= 200
          ? result.message
          : 'We could not send your request. Please try again.'
      });
    } catch {
      reply({ type: 'rose:result', id: message.id, ok: false, message: 'We could not send your request. Please try again.' });
    } finally {
      inFlight = false;
    }
  });
})();
