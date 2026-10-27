/* Rose V4/V5 enhancements. Intentionally does not send, alter or confirm bookings. */
(() => {
  'use strict';

  const root = document.getElementById('rose-v2');
  if (!root) return;

  // V5: filter the four explicitly labelled concept products without changing inventory.
  const filters = Array.from(root.querySelectorAll('[data-edit-filter]'));
  const cards = Array.from(root.querySelectorAll('[data-shop-product]'));
  const count = document.getElementById('rose-edit-count');

  function selectFilter(group) {
    if (!filters.some(button => button.dataset.editFilter === group)) return;
    let shown = 0;

    for (const card of cards) {
      const visible = group === 'all' || card.dataset.editGroup === group;
      card.hidden = !visible;
      if (visible) shown += 1;
    }

    for (const button of filters) {
      button.setAttribute('aria-pressed', String(button.dataset.editFilter === group));
    }
    if (count) {
      count.textContent = group === 'all'
        ? 'Showing all ' + cards.length + ' concept products'
        : 'Showing ' + shown + ' of ' + cards.length + ' concept products';
    }
  }

  for (const button of filters) {
    button.addEventListener('click', () => selectFilter(button.dataset.editFilter));
  }
  if (filters.length && cards.length) selectFilter('all');

  // V4: the mobile shortcut is suppressed while the enquiry form is in view.
  const booking = document.getElementById('booking');
  if (booking && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === booking) {
          root.classList.toggle('rose-booking-in-view', entry.isIntersecting);
        }
      }
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    observer.observe(booking);
  }

  // Prevent the CTA from covering fields when an on-screen keyboard is open.
  function syncKeyboard() {
    const active = document.activeElement;
    const editing = Boolean(active && /^(INPUT|SELECT|TEXTAREA)$/.test(active.tagName));
    const viewport = window.visualViewport;
    const keyboardRaised = Boolean(viewport && window.innerHeight - viewport.height > 160);
    root.classList.toggle('rose-keyboard-open', editing && keyboardRaised);
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncKeyboard, { passive: true });
  }
  document.addEventListener('focusin', syncKeyboard);
  document.addEventListener('focusout', syncKeyboard);

  // The native product dialog already provides Escape, focus return and backdrop closing.
  // Suppress the sticky CTA behind that dialog without changing the original dialog code.
  const dialog = document.getElementById('rose-product-dialog');
  if (dialog && 'MutationObserver' in window) {
    const syncDialog = () => {
      root.classList.toggle('rose-product-dialog-open', dialog.open);
    };
    new MutationObserver(syncDialog).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    syncDialog();
  }
})();
