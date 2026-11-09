/* Wrenwork AI · shared behavior */
(function () {
  var d = document;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // Footer year
  d.querySelectorAll('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // Header border once the page scrolls
  var header = d.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Fade sections in as they scroll into view
  var rv = Array.prototype.slice.call(d.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    rv.forEach(function (e) { io.observe(e); });
  }

  // Demo: email scan plays once when it scrolls into view
  d.querySelectorAll('[data-scan]').forEach(function (box) {
    var rows = Array.prototype.slice.call(box.querySelectorAll('.mail-row'));
    var count = box.querySelector('[data-count]');
    var threats = rows.filter(function (r) { return r.dataset.kind !== 'ok'; }).length;
    var finish = function () { rows.forEach(function (r) { r.classList.add('done'); }); count.textContent = threats; };
    if (reduce || !('IntersectionObserver' in window)) { finish(); return; }
    var run = async function () {
      var n = 0;
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.add('scan');
        await sleep(520);
        rows[i].classList.remove('scan');
        rows[i].classList.add('done');
        if (rows[i].dataset.kind !== 'ok') { n++; count.textContent = n; }
        await sleep(120);
      }
    };
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { o.disconnect(); run(); }
    }, { threshold: 0.45 });
    o.observe(box);
  });

  // Demo: release steps check off once when they scroll into view
  d.querySelectorAll('[data-ship]').forEach(function (box) {
    var steps = Array.prototype.slice.call(box.querySelectorAll('.ship-step'));
    if (reduce || !('IntersectionObserver' in window)) { steps.forEach(function (s) { s.classList.add('done'); }); return; }
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      steps.forEach(function (s, i) { setTimeout(function () { s.classList.add('done'); }, 250 + i * 480); });
    }, { threshold: 0.45 });
    o.observe(box);
  });

  // Demo: pick a parcel to see its details
  d.querySelectorAll('[data-parcels]').forEach(function (box) {
    var polys = Array.prototype.slice.call(box.querySelectorAll('.parcel'));
    var field = function (k) { return box.querySelector('[data-f="' + k + '"]'); };
    var pick = function (p) {
      polys.forEach(function (q) { q.classList.remove('sel'); });
      p.classList.add('sel');
      ['apn', 'acres', 'miles', 'zone', 'score', 'status'].forEach(function (k) { var f = field(k); if (f && p.dataset[k] !== undefined) f.textContent = p.dataset[k]; });
    };
    polys.forEach(function (p) {
      p.addEventListener('click', function () { pick(p); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p); }
      });
    });
  });

  // Typed headline and the little typist (home page only)
  var h1 = d.querySelector('[data-type]');
  if (!h1) return;
  var guy = h1.querySelector('.guy');
  var perch = h1.querySelector('.perch');

  // Wrap every character in a span so it can be revealed one at a time
  var chars = [];
  var firstAfterPerch = -1;
  (function walk(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c === perch) { firstAfterPerch = chars.length; return; }
      if (c.nodeType === 3) {
        var frag = d.createDocumentFragment();
        Array.from(c.textContent).forEach(function (ch) {
          var s = d.createElement('span');
          s.className = 'ch';
          s.textContent = ch;
          frag.appendChild(s);
          chars.push(s);
        });
        c.parentNode.replaceChild(frag, c);
      } else if (c.nodeType === 1) {
        walk(c);
      }
    });
  })(h1);

  var typing = function (on) { guy.classList.toggle('typing', on && !reduce); };

  var setCaret = function (i) {
    chars.forEach(function (c) { c.classList.remove('cur'); });
    if (i >= 0) chars[i].classList.add('cur');
  };

  async function intro() {
    if (reduce) {
      h1.classList.add('ready');
      chars.forEach(function (c) { c.classList.add('on'); });
      guy.classList.add('in');
      return;
    }
    // Wait briefly for the font so letters don't shift mid-typing
    if (d.fonts && d.fonts.ready) { await Promise.race([d.fonts.ready, sleep(800)]); }
    h1.classList.add('ready');
    await sleep(350);
    // Type the headline with a steady cursor
    for (var i = 0; i < chars.length; i++) {
      chars[i].classList.add('on');
      setCaret(i);
      await sleep(chars[i].textContent === ' ' ? 40 : 55 + Math.random() * 60);
    }
    // Hold, then fade the cursor out
    await sleep(600);
    h1.classList.add('caret-out');
    await sleep(500);
    setCaret(-1);
    // Then he hops onto the u and types for a moment
    guy.classList.add('in');
    await sleep(550);
    typing(true);
    await sleep(1100);
    typing(false);
  }
  intro();

  // Click him and he types for a bit; otherwise he sits still
  var timer = null;
  guy.addEventListener('click', function () {
    if (reduce) return;
    typing(true);
    clearTimeout(timer);
    timer = setTimeout(function () { typing(false); }, 2400);
  });
})();
