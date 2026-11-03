const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   LANGUAGE  (English text lives in index.html, Finnish below)
   The page always opens in English. ✏️ If you change an English
   sentence in index.html, update its Finnish version here too.
   ========================================================= */
const FI = {
  nav_about: 'Tietoa', nav_work: 'Työt', nav_skills: 'Taidot', nav_exp: 'Polku', nav_contact: 'Yhteys',
  avail: 'Vapaana uusiin projekteihin',
  lead: '[Roolisi], joka rakentaa yksinkertaisia ja harkittuja asioita verkkoon.',
  rot_pre: 'Teen mielelläni', r1: 'nopeita verkkosivuja', r2: 'selkeitä käyttöliittymiä', r3: 'hyödyllisiä työkaluja',
  cta_work: 'Katso työni', cta_cv: 'Lataa CV',
  loc_l: 'Sijainti', lt_l: 'Paikallinen aika',
  about: 'Olen [Nimesi], [roolisi] kaupungista [kaupunkisi]. Pidän selkeistä käyttöliittymistä, pienistä yksityiskohdista ja koodista, jota on helppo lukea. Tällä hetkellä työstän [mitä rakennat], ja olen aina valmis hyvään projektiin.',
  st1: 'Vuotta kokemusta', st2: 'Valmista projektia', st3: 'Kuppia kahvia',
  lg_l: 'Kielet', lg_v: 'Englanti, suomi', fc_l: 'Painopiste', fc_v: 'Käyttöliittymät ja UX',
  ln_l: 'Opiskelen', op_l: 'Avoin', op_v: 'Freelance-työt ja kokopäivätyö',
  sv_h: 'Mitä teen', sv_i: 'Neljä asiaa, jotka osaan hyvin, ensimmäisestä luonnoksesta julkaisuun.',
  sv1_t: 'Verkkosivut ja web-sovellukset', sv1_d: 'Nopeita, responsiivisia sivuja siistillä ja ylläpidettävällä koodilla.',
  sv2_t: 'UI- ja UX-suunnittelu', sv2_d: 'Selkeät asettelut ja käyttöpolut, prototyypattuna ennen koodia.',
  sv3_t: 'Suorituskyky ja SEO', sv3_d: 'Sivut, jotka latautuvat nopeasti ja löytyvät helposti.',
  sv4_t: 'Saavutettavuus', sv4_d: 'Sivut, jotka toimivat kaikille ja kaikilla laitteilla.',
  work_h: 'Valitut työt', wk_i: 'Muutamia viimeaikaisia töitä. Vie hiiri kortin päälle.', fl_all: 'Kaikki',
  p1: 'Mikä se on, kenelle se on tehty ja mitä rakensit.',
  p2: 'Mikä se on, kenelle se on tehty ja mitä rakensit.',
  p3: 'Mikä se on, kenelle se on tehty ja mitä rakensit.',
  live: 'Avaa sivusto', code: 'Koodi',
  skills_h: 'Taidot', sk_i: 'Työkalut, joita käytän päivittäin, ja missä olen varma.',
  sk1: 'Käyttöliittymä', sk2: 'Palvelinpuoli', sk3: 'Työkalut', also: 'Tunnen myös',
  pr_h: 'Näin työskentelen', pr_i: 'Yksinkertainen prosessi, joka pitää projektit rauhallisina ja aikataulussa.',
  pr1_t: 'Selvitys', pr1_d: 'Käymme läpi tavoitteet, käyttäjät ja laajuuden.',
  pr2_t: 'Suunnittelu', pr2_d: 'Luonnokset ja klikattava prototyyppi.',
  pr3_t: 'Toteutus', pr3_d: 'Siistiä koodia ja viikoittaiset päivitykset.',
  pr4_t: 'Julkaisu', pr4_d: 'Testaus, julkaisu ja tuki sen jälkeen.',
  exp_h: 'Kokemus ja koulutus', ex_i: 'Missä olen työskennellyt ja opiskellut.',
  e1_date: '2024 – nyt', e1_t: '[Työnimike], [Yritys]', e1_d: 'Mitä teit, mitä rakensit ja mikä oli lopputulos.',
  e2_date: '2022 – 2024', e2_t: '[Edellinen rooli], [Yritys]', e2_d: 'Mitä teit, mitä rakensit ja mikä oli lopputulos.',
  e3_t: '[Tutkinto], [Yliopisto]', e3_d: 'Pääaine, opinnäytetyö tai jotain, mistä olet ylpeä.',
  ts_h: 'Kiitosta', ts_i: 'Mitä ihmiset sanovat yhteistyöstä kanssani.',
  t1: 'Valmista tuli etuajassa, ja sivusto näyttää juuri siltä kuin kuvittelimme.',
  t2: 'Selkeää viestintää, huolellisia yksityiskohtia ja ei yllätyksiä.',
  t3: 'Sivumme nopeus kaksinkertaistui. Helppo työskennellä alusta asti.',
  contact_h: 'Rakennetaan jotain yhdessä.',
  ct_p: 'Onko sinulla projekti, kysymys tai haluatko vain sanoa hei? Postilaatikkoni on auki.',
  email_btn: 'Lähetä sähköpostia', copy: 'Kopioi osoite', copied: 'Kopioitu!',
  ft_nav: 'Sivut', ft_con: 'Yhteystiedot', ft_rep: 'Vastaan päivän sisällä',
  built: 'Tehty HTML:llä, CSS:llä ja vähän JavaScriptillä.',
  mail_h: 'Sano hei', mail_note: 'Vastaan yleensä päivän sisällä.',
  f_name: 'Nimesi', f_email: 'Sähköpostisi', f_msg: 'Viesti', send: 'Lähetä viesti',
  sending: 'Lähetetään…', sent: 'Lähetetty. Kiitos, vastaan pian.',
  fail: 'Lähetys epäonnistui. Tarkista yhteys ja yritä uudelleen.',
  noid: 'Lisää ensin Formspree-tunnus index.html-tiedostoon.'
};
const EN = {};
$$('[data-i18n]').forEach(el => EN[el.dataset.i18n] = el.textContent.trim());
Object.assign(EN, {
  copied: 'Copied!', sending: 'Sending…', sent: 'Sent. Thanks, I’ll reply soon.',
  fail: 'Could not send. Check your connection and try again.',
  noid: 'Add your Formspree form ID in index.html first.'
});
let lang = 'en';
const tr = k => (lang === 'fi' ? FI[k] : EN[k]) || EN[k];

/* About text: wrap words so they light up while scrolling */
const scrub = $('.scrub');
let words = [];
function buildScrub() {
  scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' ');
  words = $$('span', scrub);
}
function applyLang() {
  root.lang = lang; root.dataset.lang = lang;
  $$('[data-i18n]').forEach(el => el.textContent = tr(el.dataset.i18n));
  buildScrub(); tick(); onScroll();
}
$('#lang').onclick = () => { lang = lang === 'en' ? 'fi' : 'en'; applyLang(); };

/* =========================================================
   THEME: follows the system, updates live if the system changes.
   The button overrides it until the page is reloaded.d
   ========================================================= */
function setTheme(t) {
  root.classList.add('theming');
  root.dataset.theme = t;
  setTimeout(() => root.classList.remove('theming'), 700);
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => setTheme(e.matches ? 'dark' : 'light'));
$('#theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

/* Hero name: split into letters so they rise one by one */
const h1 = $('.split');
h1.innerHTML = [...h1.textContent].map((c, i) => c === ' ' ? ' ' : `<span style="--i:${i}">${c}</span>`).join('');

/* Local time in the hero */
const clock = $('#clock');
function tick() {
  let s = '--:--';
  try {
    s = new Intl.DateTimeFormat(lang === 'fi' ? 'fi-FI' : 'en-GB',
      { hour: '2-digit', minute: '2-digit', timeZone: clock.dataset.tz }).format(new Date());
  } catch {}
  clock.textContent = s;
}
setInterval(tick, 30000);

/* Tech strip: duplicate the list for a seamless loop */
const mtrack = $('.mtrack');
mtrack.innerHTML += mtrack.innerHTML;

/* =========================================================
   SCROLL ANIMATIONS
   ========================================================= */
function count(el) {
  const to = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now();
  (function step(t) {
    const p = Math.min(1, (t - t0) / 1600);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.classList.contains('stats')) $$('[data-count]', e.target).forEach(count);
  io.unobserve(e.target);
}), { threshold: 0.2 });
$$('.reveal, .card, .sgroup, .stats, .timeline, .steps').forEach(el => io.observe(el));

const bar = $('.progress'), nav = $('.nav'), blobs = $('.blobs'), topBtn = $('.top');
let last = 0;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  blobs.style.setProperty('--sy', y);
  nav.classList.toggle('hide', y > last && y > 120);
  topBtn.classList.toggle('show', y > 700);
  last = y;
  const r = scrub.getBoundingClientRect();
  const t = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.1)));
  const n = Math.round(t * words.length);
  words.forEach((w, i) => w.classList.toggle('on', i < n));
}
addEventListener('scroll', onScroll, { passive: true });
topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

/* Soft light that follows the mouse (desktop only) */
const glow = $('.glow');
if (!reduce && matchMedia('(hover: hover)').matches) {
  let gx = 0, gy = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { tx = e.clientX; ty = e.clientY; } });
  (function loop() {
    gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08;
    glow.style.transform = `translate3d(${gx - 208}px, ${gy - 208}px, 0)`;
    requestAnimationFrame(loop);
  })();
}

/* Project cards: gentle 3D tilt following the mouse */
$$('.card').forEach(c => {
  c.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--rx', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
    c.style.setProperty('--ry', (0.5 - (e.clientY - r.top) / r.height) * 8 + 'deg');
  });
  c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
});

/* Project filter chips */
$$('.chipbtn').forEach(b => b.onclick = () => {
  $$('.chipbtn').forEach(x => x.classList.toggle('on', x === b));
  $$('.card').forEach(c => {
    c.style.setProperty('--d', '0s');
    if (b.dataset.f === 'all' || c.dataset.cat === b.dataset.f) {
      c.classList.remove('gone');
      requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('off')));
    } else {
      c.classList.add('off');
      setTimeout(() => { if (c.classList.contains('off')) c.classList.add('gone'); }, 450);
    }
  });
});

/* =========================================================
   EMAIL
   ========================================================= */
$('#copyMail').onclick = async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(b.dataset.email); b.textContent = tr('copied'); }
  catch { b.textContent = b.dataset.email; }
  setTimeout(() => b.textContent = tr('copy'), 2000);
};

const dlg = $('#mailModal'), form = $('form', dlg), msg = $('.status', dlg);
const close = () => {
  dlg.classList.add('closing');
  dlg.addEventListener('animationend', () => { dlg.classList.remove('closing'); dlg.close(); }, { once: true });
};
$('#openMail').onclick = () => { msg.textContent = ''; dlg.showModal(); };
$$('[data-close]', dlg).forEach(b => b.onclick = close);
dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });

form.onsubmit = async e => {
  e.preventDefault();
  if (form.action.includes('YOUR_FORM_ID')) { msg.textContent = tr('noid'); return; }
  const btn = $('[type=submit]', form);
  btn.disabled = true; msg.textContent = tr('sending');
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error();
    form.reset(); msg.textContent = tr('sent');
    setTimeout(close, 1800);
  } catch { msg.textContent = tr('fail'); }
  btn.disabled = false;
};

applyLang();