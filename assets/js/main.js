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
          card.style.display = match ? '' : 'none';
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

    /* Reading progress + TOC + Back to top ─────────── */
    var article = document.querySelector('.post-content');
    if (article) {
      var headings = article.querySelectorAll('h2, h3');
      if (headings.length >= 2) {
        var toc = document.createElement('nav');
        toc.className = 'post-toc';
        toc.setAttribute('aria-label', 'Table of contents');
        var tocTitle = document.createElement('p');
        tocTitle.className = 'post-toc-title';
        tocTitle.textContent = 'In This Article';
        var ol = document.createElement('ol');
        headings.forEach(function (h) {
          if (!h.id) {
            h.id = h.textContent.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .slice(0, 60);
          }
          var li = document.createElement('li');
          if (h.tagName === 'H3') li.classList.add('toc-h3');
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent;
          li.appendChild(a);
          ol.appendChild(li);
        });
        toc.appendChild(tocTitle);
        toc.appendChild(ol);
        var firstH2 = article.querySelector('h2');
        if (firstH2) { article.insertBefore(toc, firstH2); }
        else { article.prepend(toc); }
      }

      var bar = document.createElement('div');
      bar.className = 'reading-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.prepend(bar);

      window.addEventListener('scroll', function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
      }, { passive: true });
    }

    var btt = document.createElement('button');
    btt.className = 'back-to-top';
    btt.setAttribute('aria-label', 'Back to top');
    btt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>';
    document.body.appendChild(btt);
    window.addEventListener('scroll', function () {
      btt.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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
