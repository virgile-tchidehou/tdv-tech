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
  'sections/roadmap/roadmap.html',
  'sections/contact/contact.html'
];

var app        = document.getElementById('app');
var footerRoot = document.getElementById('footer-root');

// Charge un fichier HTML et l'insère dans un conteneur
function loadHTML(path, container) {
  return fetch(path)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + path);
      return res.text();
    })
    .then(function(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html.trim();
      var node = tmp.firstElementChild;
      if (!node) throw new Error('Contenu vide ou invalide — ' + path);
      container.appendChild(node);
    });
}

// Affiche un message d'erreur lisible dans #app si un fetch échoue
function showLoadError(err) {
  console.error('[TDV] Chargement échoué :', err);
  if (app && app.children.length === 0) {
    var box = document.createElement('div');
    box.style.cssText = 'max-width:640px;margin:120px auto;padding:0 24px;font-family:system-ui,sans-serif;color:#94a3b8;text-align:center';
    box.innerHTML = '<h1 style="color:#f8fafc;font-size:1.6rem;margin-bottom:1rem">Contenu indisponible</h1>'
      + '<p>Une erreur est survenue au chargement des sections (' + (err && err.message ? err.message : err) + ').</p>'
      + '<p style="margin-top:1rem"><a href="mailto:tchidehoudodjivirgile@gmail.com" style="color:#00f0ff">Contactez-moi</a></p>';
    app.appendChild(box);
  }
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
  chain.then(init).catch(showLoadError);
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

  /* 6. Hero typed role rotation */
  initHeroType();

  /* 7. About animated counters */
  initCounters();

  /* 8. About — reveal photo / compteur + mot à mot */
  initAboutAnimations();

  /* 9. Roadmap — spine animée + étapes en cascade */
  initRoadmap();

  /* 10. Contact — prompt en typing */
  initContactPrompt();
}

/* Contact — prompt terminal en typing (vanilla). */
function initContactPrompt() {
  var el = document.getElementById('contactPrompt');
  if (!el) return;
  var text = "$ connect --with virgile --status open";
  var i = 0;
  function tick() {
    el.textContent = text.slice(0, i);
    if (i <= text.length) {
      i++;
      setTimeout(tick, 55 + Math.random() * 45);
    }
  }
  tick();
}

/* Roadmap — spine qui se dessine + steps qui pop au scroll.
   Vanilla, a11y-aware (prefers-reduced-motion géré en CSS). */
function initRoadmap() {
  var track = document.querySelector('.roadmap-track');
  if (!track) return;
  var steps = track.querySelectorAll('.roadmap-step');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    track.classList.add('drawn');
    steps.forEach(function(s) { s.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // dessiner la spine dès que la section entre
      if (el === track) { track.classList.add('drawn'); return; }
      // staggered reveal des steps
      var idx = Array.prototype.indexOf.call(steps, el);
      el.style.transitionDelay = (idx * 0.12) + 's';
      el.classList.add('visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.25 });

  obs.observe(track);
  steps.forEach(function(s) { obs.observe(s); });
}

/* Typing effect for hero role — vanilla, no deps */
function initHeroType() {
  var el = document.querySelector('.hero-typed');
  if (!el) return;
  var words;
  try { words = JSON.parse(el.getAttribute('data-words') || '[]'); }
  catch (e) { words = []; }
  if (!words.length) return;
  var i = 0, char = 0, deleting = false;
  (function tick() {
    var full = words[i];
    el.textContent = full.substring(0, char);
    if (!deleting && char < full.length) { char++; setTimeout(tick, 70); }
    else if (!deleting && char === full.length) { deleting = true; setTimeout(tick, 1500); }
    else if (deleting && char > 0) { char--; setTimeout(tick, 35); }
    else { deleting = false; i = (i + 1) % words.length; setTimeout(tick, 350); }
  })();
}

/* Animated number counters (About) — vanilla, a11y-aware */
function initCounters() {
  var els = document.querySelectorAll('.counter-val');
  if (!els.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var node = entry.target;
      var target = parseInt(node.getAttribute('data-target'), 10) || 0;
      if (reduce) { node.textContent = target + '+'; obs.unobserve(node); return; }
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(eased * target) + '+';
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(node);
    });
  }, { threshold: 0.5 });
  els.forEach(function(el) { obs.observe(el); });
}

/* About — photo reveal, compteur en cascade, et révélation mot à mot du statement.
   Vanilla, a11y-aware (prefers-reduced-motion géré en CSS). */
function initAboutAnimations() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* split chaque nœud texte en .reveal-word, en préservant les enfants (span/em/strong) */
  function splitWords(node) {
    var kids = Array.prototype.slice.call(node.childNodes);
    kids.forEach(function(child) {
      if (child.nodeType === 3) { // text node
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function(tok) {
          if (tok.trim() === '') { frag.appendChild(document.createTextNode(tok)); return; }
          var span = document.createElement('span');
          span.className = 'reveal-word';
          span.textContent = tok;
          frag.appendChild(span);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitWords(child); // descendre dans les éléments inline
      }
    });
  }

  document.querySelectorAll('.js-word-reveal').forEach(function(block) {
    splitWords(block);
    var words = block.querySelectorAll('.reveal-word');
    words.forEach(function(w, i) { w.style.transitionDelay = (i * 0.022) + 's'; });
  });

  if (reduce) {
    document.querySelectorAll('.profile-reveal, .stagger-counters, .js-word-reveal')
      .forEach(function(el) {
        el.classList.add('visible');
        el.classList.add('word-revealed');
      });
    return;
  }

  var extra = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.classList.contains('profile-reveal') || el.classList.contains('stagger-counters')) {
        el.classList.add('visible');
      }
      if (el.classList.contains('js-word-reveal')) {
        el.classList.add('word-revealed');
      }
      extra.unobserve(el);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.profile-reveal, .stagger-counters, .js-word-reveal')
    .forEach(function(el) { extra.observe(el); });
}
