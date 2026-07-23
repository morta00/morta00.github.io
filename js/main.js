(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  initGymboxTabs();
  initEmailButton();

  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();

function initEmailButton() {
  const btn = document.getElementById('email-btn');
  if (!btn) return;

  const email = btn.dataset.email || 'ghnimim@mail.gvsu.edu';
  const original = btn.textContent;

  btn.addEventListener('click', (event) => {
    // Always give visible feedback — mailto often does nothing if no mail app is set
    event.preventDefault();

    const copy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(email);
      }
      const input = document.createElement('input');
      input.value = email;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      return Promise.resolve();
    };

    copy()
      .then(() => {
        btn.textContent = 'Email copied';
        setTimeout(() => {
          btn.textContent = original;
        }, 1800);
      })
      .catch(() => {
        window.location.href = `mailto:${email}`;
      });

    // Also try opening the mail client when available
    window.location.href = `mailto:${email}`;
  });
}

function initGymboxTabs() {
  const video = document.getElementById('gymbox-video');
  const screen = document.getElementById('gymbox-screen');
  const tabs = document.querySelectorAll('#gymbox-tabs .seg-btn');
  const previewImg = document.getElementById('gymbox-preview-img');
  const previewLabel = document.getElementById('gymbox-preview-label');
  const previewDesc = document.getElementById('gymbox-preview-desc');

  if (!video || tabs.length === 0) return;

  let currentSrc = video.getAttribute('src') || '';

  function setPreview(tab) {
    if (!previewImg) return;

    const src = tab.dataset.previewSrc;
    const alt = tab.dataset.previewAlt;
    const label = tab.dataset.previewLabel;
    const desc = tab.dataset.previewDesc;

    if (src) previewImg.src = src;
    if (alt) previewImg.alt = alt;
    if (previewLabel && label) previewLabel.textContent = label;
    if (previewDesc && desc) previewDesc.textContent = desc;
  }

  function setActiveTab(tab) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
  }

  function setGymboxVideo(src, poster) {
    if (!src || src === currentSrc) {
      video.currentTime = 0;
      video.play().catch(() => {});
      return;
    }

    currentSrc = src;
    screen?.classList.add('is-loading');

    video.pause();
    video.removeAttribute('src');
    video.load();

    if (poster) video.poster = poster;

    video.src = src;
    video.load();
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  function activateTab(tab) {
    const src = tab.dataset.src;
    const poster = tab.dataset.poster;
    if (!src) return;

    setActiveTab(tab);
    setPreview(tab);
    setGymboxVideo(src, poster);
  }

  video.addEventListener('loadeddata', () => {
    screen?.classList.remove('is-loading');
  });

  video.addEventListener('canplay', () => {
    screen?.classList.remove('is-loading');
    video.play().catch(() => {});
  });

  video.addEventListener('error', () => {
    screen?.classList.remove('is-loading');
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      activateTab(tab);
    });
  });
}
