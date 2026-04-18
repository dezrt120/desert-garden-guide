/* Desert Garden Guide — Main JS */

(function () {
  'use strict';

  /* Dark mode ─────────────────────────────────────────── */
  var html = document.documentElement;

  function applyTheme(isDark) {
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  var saved  = localStorage.getItem('dgg-theme');
  var system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : system);

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isDark = html.getAttribute('data-theme') === 'dark';
        applyTheme(!isDark);
        localStorage.setItem('dgg-theme', isDark ? 'light' : 'dark');
      });
    });

    /* Newsletter form ───────────────────────────────── */
    var nlForm = document.querySelector('.nl-form');
    if (nlForm) {
      nlForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = nlForm.querySelector('.nl-input');
        if (input && input.value) {
          nlForm.innerHTML = '<p style="font-family:var(--font-ui);letter-spacing:.08em;color:#EDE5D4;font-size:.85rem;">Thanks! We\'ll be in touch when the desert blooms.</p>';
        }
      });
    }

    /* Category filter ──────────────────────────────── */
    var filterBtns = document.querySelectorAll('.cat-filter-btn');
    if (filterBtns.length) {
      function filterCards(cat) {
        document.querySelectorAll('#blog-grid .post-card').forEach(function (card) {
          var match = cat === 'all' || card.getAttribute('data-category') === cat;
          card.hidden = !match;
        });
        filterBtns.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-cat') === cat);
        });
      }

      // Activate filter from URL param (?cat=water-wise)
      var urlCat = new URLSearchParams(window.location.search).get('cat');
      if (urlCat) filterCards(urlCat);

      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterCards(btn.getAttribute('data-cat'));
          // Update URL without reload so links are shareable
          var url = new URL(window.location.href);
          var cat = btn.getAttribute('data-cat');
          if (cat === 'all') { url.searchParams.delete('cat'); }
          else { url.searchParams.set('cat', cat); }
          history.replaceState(null, '', url.toString());
        });
      });
    }

    /* Scroll fade-in ────────────────────────────────── */
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in').forEach(function (el) {
        obs.observe(el);
      });
    } else {
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
    }
  });
})();
