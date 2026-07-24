/* ============================================================
   TDV Tech — Portfolio JavaScript v2
   Charge les sections depuis sections/ via fetch(), puis
   initialise toutes les interactions après injection.
   ============================================================ */

'use strict';

// Ordre des sections à injecter dans #app
var SECTIONS = [
  'sections/hero/hero.html',
  'sections/about/about.html',
  'sections/projects/projects.html',
  'sections/skills/skills.html',
  'sections/experience/experience.html',
  'sections/education/education.html',
  'sections/timeline/timeline.html',
  'sections/contact/contact.html'
];

var app        = document.getElementById('app');
var footerRoot = document.getElementById('footer-root');

// Charge un fichier HTML et l'insère dans un conteneur
function loadHTML(path, container) {
  return fetch(path)
    .then(function(res) {
      if (!res.ok) throw new Error('Erreur chargement : ' + path);
      return res.text();
    })
    .then(function(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html.trim();
      container.appendChild(tmp.firstElementChild);
    });
}

// Charge toutes les sections en séquence, puis initialise
function loadAll() {
  var chain = Promise.resolve();
  SECTIONS.forEach(function(path) {
    chain = chain.then(function() { return loadHTML(path, app); });
  });
  chain = chain.then(function() {
    return loadHTML('sections/footer/footer.html', footerRoot);
  });
  chain.then(init).catch(function(err) {
    console.error('Chargement échoué :', err);
  });
}

loadAll();

/* ── Initialisation des interactions ─────────────────────── */
function init() {

  /* 1. Navbar sticky */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* 2. Mobile menu toggle */
  var toggle   = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  toggle.addEventListener('click', function() {
    var open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });

  /* 3. Scroll Reveal (classe .fade-up) */
  var revealEls = document.querySelectorAll('.fade-up');
  var revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(function(el) { revealObs.observe(el); });

  /* 4. Active nav link au scroll */
  var allSections = document.querySelectorAll('section[id]');
  var navItems    = document.querySelectorAll('.nav-link');

  var secObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navItems.forEach(function(link) {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { threshold: 0.35 });

  allSections.forEach(function(s) { secObs.observe(s); });

  /* 5. Skill bar animation */
  var bars = document.querySelectorAll('.skill-fill');
  var barObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width;
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  bars.forEach(function(bar) {
    bar.style.width = '0%';
    barObs.observe(bar);
  });
}
