/* Glas-Baukasten · Animationen · Stand 16.11.2026
   Einbinden: <script src="glas.js"></script>, dann Glas.start() (wartet selbst auf die Schriften).
   Erkennt automatisch:
     .g-auf  mit style="--i:N"          versetzter Auftritt (N = Reihenfolge)
     [data-zahl] (+ data-dez, data-suffix)  Zahl zählt hoch, deutsches Format
     .g-ring[data-ring] (+ data-kreise="A,B,C")  Ring füllt sich, Kreise ploppen auf
     .g-balken i[data-h], .g-spur-bahn i[data-w]  Balken/Spuren wachsen (Prozent)
   Optionen: Glas.start({ leisteDemo: true })  klappt .g-leiste kurz auf und zu (für Aufnahmen). */
window.Glas = (() => {
  const leise = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const fmt = (v, dez) => v.toLocaleString('de-DE', { minimumFractionDigits: dez, maximumFractionDigits: dez });
  const reihe = el => { const a = el.closest('.g-auf'); return a ? (+getComputedStyle(a).getPropertyValue('--i') || 0) : 0; };

  function zaehlen(el, verzug) {
    const ziel = parseFloat(el.dataset.zahl), dez = +(el.dataset.dez || 0), suf = el.dataset.suffix || '';
    if (leise) { el.textContent = fmt(ziel, dez) + suf; return; }
    const t0 = performance.now() + verzug;
    (function tick(now) {
      const k = Math.min(1, Math.max(0, (now - t0) / 1200));
      el.textContent = fmt(ziel * easeOut(k), dez) + suf;
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  function ringe() {
    document.querySelectorAll('.g-ring[data-ring]').forEach(r => {
      const wert = +r.dataset.ring, verzug = reihe(r) * 70;
      const kreis = r.querySelector('.g-wert');
      if (leise) kreis.style.transition = 'none'; else kreis.style.transitionDelay = (0.55 + verzug / 1000) + 's';
      requestAnimationFrame(() => kreis.style.strokeDashoffset = 100 - wert);
      const namen = (r.dataset.kreise || '').split(',').map(s => s.trim()).filter(Boolean);
      const groesse = r.getBoundingClientRect().width / 2, abstand = groesse * 1.08;
      namen.forEach((n, i) => {
        const k = document.createElement('div'); k.className = 'g-kreis'; k.textContent = n;
        const a = (-60 + i * (300 / Math.max(1, namen.length))) * Math.PI / 180;   // verteilt rechts herum, Start oben rechts
        k.style.left = (groesse + abstand * Math.cos(a) - 19) + 'px'; k.style.top = (groesse + abstand * Math.sin(a) - 19) + 'px';
        r.appendChild(k);
        setTimeout(() => k.classList.add('g-da'), leise ? 0 : 1750 + verzug + i * 110);
      });
    });
  }

  function wachsen() {
    document.querySelectorAll('.g-balken').forEach(b => b.querySelectorAll('i[data-h]').forEach((el, i) =>
      setTimeout(() => el.style.height = el.dataset.h + '%', leise ? 0 : 900 + reihe(b) * 70 + i * 55)));
    document.querySelectorAll('.g-spuren').forEach(b => b.querySelectorAll('i[data-w]').forEach((el, i) =>
      setTimeout(() => el.style.width = el.dataset.w + '%', leise ? 0 : 900 + reihe(b) * 70 + i * 90)));
  }

  function start(opt = {}) {
    return document.fonts.ready.then(() => new Promise(res => requestAnimationFrame(() => {
      document.body.classList.add('g-los');
      document.querySelectorAll('[data-zahl]').forEach(el => zaehlen(el, reihe(el) * 70 + 380));
      ringe(); wachsen();
      if (opt.leisteDemo) {
        const l = document.querySelector('.g-leiste');
        if (l) { setTimeout(() => l.classList.add('g-offen'), 3300); setTimeout(() => l.classList.remove('g-offen'), 5600); }
      }
      res();
    })));
  }
  return { start };
})();
