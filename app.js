const C = INVITE, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const T = new Date(`${C.date}T${C.time}:00${C.offset}`), E = new Date(+T + C.hours * 36e5);

// Populate text content cleanly with animated word spans
$$('[data-t="name-cover"]').forEach(el => {
  el.innerHTML = C.name.split(' ').map((w, i) => `<span class="nm-word nm-${i + 1}">${w}</span>`).join('');
});
$$('[data-t="name"]').forEach(el => el.textContent = C.name);
$$('[data-t="intro"]').forEach(el => el.textContent = C.intro);
$$('[data-t="venue"]').forEach(el => el.textContent = C.venue);

// Dynamic image sources
$$('[data-img]').forEach(e => e.style.setProperty('--img', `url(${C.photos[e.dataset.img]})`));
const pi = new Image();
pi.onerror = () => { const p = $('#portrait'); if (p) p.style.display = 'none'; };
pi.src = C.photos.portrait;

// Date, Time, Guest
const dayEl = $('#dayL');
if (dayEl) {
  dayEl.textContent = T.toLocaleDateString('en-GB', { timeZone: C.timeZone, weekday: 'long' });
}
$('#dateL').textContent = T.toLocaleDateString('en-GB', {
  timeZone: C.timeZone,
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
$('#timeL').textContent = C.timeLabel;
$('#guest').textContent = new URLSearchParams(location.search).get('to') || 'Guest';
document.title = `${C.name} · Sweet Seventeen`;

// Google Calendar + Maps URLs
const z = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
$('#cal').href = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
  action: 'TEMPLATE',
  text: `${C.name}'s Sweet Seventeen`,
  dates: `${z(T)}/${z(E)}`,
  details: C.description,
  location: C.venue
});
const q = encodeURIComponent(C.mapsQuery);
$('#mapl').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
$('#map').src = `https://maps.google.com/maps?q=${q}&output=embed`;

// Countdown timer
const p = n => String(n).padStart(2, '0');
(function tick() {
  const s = Math.max(0, Math.floor((T - Date.now()) / 1e3));
  const v = {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60
  };
  for (const k in v) {
    const el = $('#' + k);
    if (!el) continue;
    const t = p(v[k]);
    if (el.textContent !== t) {
      const seen = el.dataset.r;
      el.textContent = t;
      el.dataset.r = '1';
      if (seen) {
        el.animate(
          [
            { transform: 'translateY(-30%) scale(0.92)', opacity: 0 },
            { transform: 'translateY(6%) scale(1.03)', opacity: 0.95, offset: 0.7 },
            { transform: 'none', opacity: 1 }
          ],
          { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
      }
    }
  }
  setTimeout(tick, 1e3);
})();

// Cover + Music with two-stage cinematic curtain opening
const au = $('#au'), mb = $('#music');
au.src = C.music;
const play = () => au.play().then(() => mb.classList.add('on')).catch(() => {});
$('#open').onclick = () => {
  const cover = $('#cover');
  cover.classList.add('opening');
  setTimeout(() => {
    document.body.classList.remove('locked');
    cover.classList.add('open');
    play();
    setTimeout(reveal, 250);
  }, 350);
};
mb.onclick = () => au.paused ? play() : (au.pause(), mb.classList.remove('on'));

// Wishes + RSVP
const ok = /^https:/.test(C.scriptUrl), wl = $('#wl');
const card = w => {
  const d = document.createElement('blockquote');
  const n = document.createElement('b');
  const t = document.createElement('p');
  n.textContent = w.name;
  t.textContent = `“${w.message}”`;
  d.append(n, t);
  return d;
};

async function load() {
  if (!ok) return;
  try {
    const r = await (await fetch(C.scriptUrl)).json();
    const j = JSON.stringify(r);
    if (r.length && j !== load.j) {
      load.j = j;
      wl.replaceChildren(...r.map((w, i) => {
        const c = card(w);
        c.style.animationDelay = (i * 70) + 'ms';
        return c;
      }));
    }
  } catch {}
}
load();
setInterval(load, 20000);

const f = $('#f'), msg = t => $('#msg').textContent = t;
f.onsubmit = async e => {
  e.preventDefault();
  const d = new FormData(f);
  if (d.get('website')) return;
  if (!ok) return msg('RSVP is not connected yet. Set scriptUrl in config.js.');
  const b = f.querySelector('.btn');
  b.disabled = true;
  msg('Sending…');
  try {
    await fetch(C.scriptUrl, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) });
    if (d.get('message').trim()) {
      const emptyEl = wl.querySelector('.wishes-empty');
      if (emptyEl) emptyEl.remove();
      wl.prepend(card({ name: d.get('name'), message: d.get('message').trim() }));
    }
    f.reset();
    msg('Thank you! Your RSVP has been received.');
  } catch {
    msg('Could not send. Check your connection and try again.');
  }
  b.disabled = false;
};

// Gallery Marquee
const mk = (list, cls) => {
  const r = document.createElement('div');
  r.className = 'row ' + cls;
  r.append(...[...list, ...list].map(s => Object.assign(new Image(), {
    src: s,
    alt: C.name,
    loading: 'lazy',
    width: 720,
    height: 1080
  })));
  return r;
};
$('#gal').append(mk(C.gallery, ''), mk([...C.gallery].reverse(), 'r'));

// Gallery Lightbox
const lb = document.createElement('div');
lb.id = 'lb';
lb.innerHTML = '<img alt="">';
document.body.append(lb);
$('#gal').onclick = e => {
  if (e.target.tagName === 'IMG') {
    lb.firstChild.src = e.target.src;
    lb.classList.add('on');
  }
};
lb.onclick = () => lb.classList.remove('on');

// Motion is enabled by default for the full luxury cinematic experience; add ?motion=off to disable
const RM = /motion=off/.test(location.search);
document.documentElement.classList.toggle('rm', RM);

$$('main section, footer section').forEach(s => {
  [...s.querySelectorAll('h2, p, .orn, .cd div, .venue-card, .frame-card, .map-frame, form > *, #gal, .flower, .arch')]
    .forEach((e, i) => {
      e.classList.add('rv');
      e.style.setProperty('--d', (i * 70) + 'ms');
    });
});

function reveal() {
  if (RM) {
    $$('.rv').forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
  $$('.rv').forEach(e => io.observe(e));
}

// Ambient motion & gold dust particles
if (!RM) {
  const px = $$('.flower');
  let tk = 0;
  addEventListener('scroll', () => tk || (tk = requestAnimationFrame(() => {
    tk = 0;
    const h = innerHeight;
    px.forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.bottom < -100 || r.top > h + 100) return;
      e.style.transform = `translateY(${(r.top + r.height / 2 - h / 2) / h * -18}px)`;
    });
  })), { passive: true });

  // Ambient floating gold dust & interactive sparkle trails
  const cv = $('#dust'), cx = cv.getContext('2d');
  let W, H;
  const rs = () => {
    W = cv.width = innerWidth * Math.min(devicePixelRatio, 2);
    H = cv.height = innerHeight * Math.min(devicePixelRatio, 2);
  };
  rs();
  addEventListener('resize', rs);

  // Background ambient stardust
  const P = Array.from({ length: 30 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.8 + 0.8,
    s: Math.random() * 3.5e-5 + 1.8e-5,
    p: Math.random() * 6,
    isSparkle: Math.random() < 0.25
  }));

  // Interactive touch / pointer sparkles
  const touchParticles = [];
  function addSparkle(clientX, clientY) {
    const scale = W / innerWidth;
    for (let i = 0; i < 2; i++) {
      touchParticles.push({
        x: (clientX + (Math.random() - 0.5) * 24) * scale,
        y: (clientY + (Math.random() - 0.5) * 24) * scale,
        vx: (Math.random() - 0.5) * 1.2 * scale,
        vy: (Math.random() - 0.5) * 1.2 * scale - 0.6 * scale,
        r: (Math.random() * 2 + 1.2) * scale,
        life: 1,
        decay: Math.random() * 0.025 + 0.03
      });
    }
  }

  addEventListener('pointermove', e => {
    if (Math.random() < 0.65) addSparkle(e.clientX, e.clientY);
  }, { passive: true });

  addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) {
      addSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  function drawDiamond(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(224, 206, 158, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  (function f(t) {
    cx.clearRect(0, 0, W, H);
    const k = W / innerWidth;

    // 1. Draw ambient floating stardust
    for (const q of P) {
      q.y -= q.s * 16;
      if (q.y < -0.02) {
        q.y = 1.02;
        q.x = Math.random();
      }
      const alpha = 0.22 + 0.22 * Math.sin(t / 900 + q.p);
      const px = (q.x + Math.sin(t / 3000 + q.p) * 0.02) * W;
      const py = q.y * H;

      if (q.isSparkle && alpha > 0.25) {
        drawDiamond(cx, px, py, q.r * k * 2.2, alpha * 1.2);
      } else {
        cx.fillStyle = `rgba(196,162,101,${alpha})`;
        cx.beginPath();
        cx.arc(px, py, q.r * k, 0, Math.PI * 2);
        cx.fill();
      }
    }

    // 2. Draw interactive touch/cursor sparkles
    for (let i = touchParticles.length - 1; i >= 0; i--) {
      const tp = touchParticles[i];
      tp.x += tp.vx;
      tp.y += tp.vy;
      tp.life -= tp.decay;
      if (tp.life <= 0) {
        touchParticles.splice(i, 1);
        continue;
      }
      drawDiamond(cx, tp.x, tp.y, tp.r * (tp.life + 0.2), tp.life * 0.85);
    }

    requestAnimationFrame(f);
  })(0);
}
