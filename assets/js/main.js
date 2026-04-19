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

    /* Reading progress bar ──────────────────────────── */
    var progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);

    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });

    /* Back to top ───────────────────────────────────── */
    var bttBtn = document.createElement('button');
    bttBtn.id = 'back-to-top';
    bttBtn.setAttribute('aria-label', 'Back to top');
    bttBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(bttBtn);

    bttBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
      bttBtn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });

    /* Table of contents ─────────────────────────────── */
    var postContent = document.querySelector('article.post-content');
    if (postContent) {
      var headings = postContent.querySelectorAll('h2, h3');
      if (headings.length >= 2) {
        // Assign stable IDs to any headings that don't have one
        headings.forEach(function (h, i) {
          if (!h.id) {
            h.id = 'toc-' + i + '-' + h.textContent.trim()
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
        });

        // Build list items
        var items = '';
        headings.forEach(function (h) {
          var isH3 = h.tagName === 'H3';
          items += '<li class="' + (isH3 ? 'toc-h3' : 'toc-h2') + '">' +
            '<a href="#' + h.id + '">' + h.textContent + '</a></li>';
        });

        var tocBox = document.createElement('nav');
        tocBox.className = 'toc-box';
        tocBox.setAttribute('aria-label', 'Table of contents');
        tocBox.innerHTML =
          '<button class="toc-heading" aria-expanded="true">' +
            'In this article' +
            '<svg class="toc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>' +
          '</button>' +
          '<ul class="toc-list">' + items + '</ul>';

        postContent.insertBefore(tocBox, postContent.firstChild);

        // Collapse / expand toggle
        tocBox.querySelector('.toc-heading').addEventListener('click', function () {
          var collapsed = tocBox.classList.toggle('collapsed');
          this.setAttribute('aria-expanded', String(!collapsed));
        });

        // Scroll spy — highlight the heading currently in view
        if ('IntersectionObserver' in window) {
          var tocLinks = tocBox.querySelectorAll('a');
          var headingObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                tocLinks.forEach(function (link) {
                  link.classList.toggle('toc-active', link.getAttribute('href') === '#' + entry.target.id);
                });
              }
            });
          }, { rootMargin: '-15% 0px -75% 0px' });

          headings.forEach(function (h) { headingObserver.observe(h); });
        }
      }
    }
  });
})();
