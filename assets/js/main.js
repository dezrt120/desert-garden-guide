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

    /* Hero collage cycling ──────────────────────────── */
    var collage = document.querySelector('.dgg-collage');
    if (collage) {
      var PHOTOS = [
        { src: '/wp-content/uploads/2025/07/saguaro-cactus-sonoran-desert-golden-hour.jpg',                              alt: 'Saguaro cacti at golden hour',                   label: 'Sonoran Desert',    credit: 'Photo via Pexels',              url: 'https://www.pexels.com' },
        { src: '/wp-content/uploads/2025/07/saguaro-hillside-brittlebush-bloom.jpg',                                     alt: 'Saguaro hillside with brittlebush in bloom',     label: 'Desert in Bloom',   credit: 'Photo via Pexels',              url: 'https://www.pexels.com' },
        { src: '/wp-content/uploads/2025/07/minimalist-cactus-white-wall.jpg',                                           alt: 'Minimalist cactus against a white wall',         label: 'Desert Minimal',    credit: 'Photo via Pexels',              url: 'https://www.pexels.com' },
        { src: '/wp-content/uploads/2025/07/desert-zen-garden-native-plants.jpg',                                        alt: 'Desert zen garden with native plants',           label: 'Desert Zen',        credit: 'Photo via Pexels',              url: 'https://www.pexels.com' },
        { src: '/wp-content/uploads/2026/04/desert-companion-planting-what-grows-well-together-featured.jpg',            alt: 'Desert garden with succulents and cacti',        label: 'Companion Plants',  credit: 'Việt Anh Nguyễn · Pexels',    url: 'https://www.pexels.com/photo/desert-garden-with-diverse-succulents-and-cacti-31970503/' },
        { src: '/wp-content/uploads/2026/04/how-to-grow-vegetables-in-the-desert-a-seasonal-guide-featured.jpg',         alt: 'Desert garden landscape with diverse cacti',     label: 'Desert Vegetables', credit: 'Grigoriy · Pexels',             url: 'https://www.pexels.com/photo/desert-garden-landscape-with-diverse-cacti-29054934/' },
        { src: '/wp-content/uploads/2026/04/the-best-desert-trees-for-shade-and-beauty-featured.jpg',                   alt: 'Desert trees for shade and beauty',              label: 'Desert Trees',      credit: 'Yigithan Bal · Pexels',         url: 'https://www.pexels.com/photo/two-green-cactus-plants-at-daytime-764998/' },
      ];

      function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
      }
      shuffle(PHOTOS);

      function applyPhoto(slot, photo) {
        var img = slot.querySelector('img');
        var label = slot.querySelector('.dgg-photo-label');
        var cred = slot.querySelector('.dgg-credit');
        img.src = photo.src;
        img.alt = photo.alt;
        if (label) label.textContent = photo.label;
        cred.textContent = photo.credit;
        cred.href = photo.url;
      }

      var slots = Array.from(collage.querySelectorAll('.dgg-photo'));
      slots.forEach(function (slot, i) {
        var cred = document.createElement('a');
        cred.className = 'dgg-credit';
        cred.target = '_blank';
        cred.rel = 'noopener noreferrer';
        slot.appendChild(cred);
        slot._idx = i;
        applyPhoto(slot, PHOTOS[i]);

        setTimeout(function () {
          setInterval(function () {
            slot._idx = (slot._idx + slots.length) % PHOTOS.length;
            var img = slot.querySelector('img');
            img.style.opacity = '0';
            setTimeout(function () {
              applyPhoto(slot, PHOTOS[slot._idx]);
              img.style.opacity = '1';
            }, 420);
          }, 7000);
        }, i * 2400);
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
