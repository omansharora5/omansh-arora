(() => {
  const root = document.documentElement;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotion() {
    root.classList.toggle('reduced-motion', motionPreference.matches);
  }
  applyMotion();
  motionPreference.addEventListener('change', applyMotion);

  const sections = [...document.querySelectorAll('.main > section[id]')];
  const links = [...document.querySelectorAll('nav a')];
  const previous = document.getElementById('previousSection');
  const next = document.getElementById('nextSection');
  const needle = document.getElementById('dialNeedle');
  const counter = document.getElementById('sectionCounter');
  let active = 0;
  function markSection(index) {
    active = index;
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === sections.length - 1;
  }
  function moveSection(offset) {
    const index = Math.max(0, Math.min(sections.length - 1, active + offset));
    sections[index]?.scrollIntoView({ behavior: root.classList.contains('reduced-motion') ? 'instant' : 'smooth', block: 'start' });
  }
  if (sections.length) {
    markSection(0);
    let scheduled = false;
    function syncScroll() {
      scheduled = false;
      if (needle) {
        const distance = document.documentElement.scrollHeight - innerHeight;
        const progress = distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0;
        needle.setAttribute('transform', `rotate(${progress * 180} 13 125)`);
      }
      const reference = Math.min(innerHeight * .28, 230);
      let index = 0;
      sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= reference) index = i; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 20) index = sections.length - 1;
      if (index !== active) markSection(index);
    }
    addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(syncScroll); }
    }, { passive: true });
    addEventListener('resize', syncScroll);
    motionPreference.addEventListener('change', syncScroll);
    syncScroll();
    previous?.addEventListener('click', () => moveSection(-1));
    next?.addEventListener('click', () => moveSection(1));
  }

  if ('IntersectionObserver' in window) {
    root.classList.add('enhanced');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.remove('pending'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: .05 });
    document.querySelectorAll('.reveal').forEach(item => { item.classList.add('pending'); revealObserver.observe(item); });
  }

  document.querySelectorAll('.process-figure').forEach(figure => {
    figure.querySelectorAll('.flow-step').forEach(step => step.addEventListener('click', () => {
      figure.querySelectorAll('.flow-step').forEach(button => button.setAttribute('aria-pressed', String(button === step)));
      const explanation = figure.querySelector('.flow-explanation');
      explanation.textContent = step.dataset.explanation;
      if (!root.classList.contains('reduced-motion')) {
        explanation.animate([{ opacity: .35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' });
      }
    }));
  });

  const dialog = document.querySelector('dialog.lightbox');
  if (dialog) {
    document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
      const image = dialog.querySelector('img');
      image.src = button.dataset.lightbox;
      image.alt = button.dataset.caption;
      dialog.querySelector('p').textContent = button.dataset.caption;
      dialog.showModal();
    }));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }
})();
