// Builds index.html from today's "Free Food & Refreshments" events on SBEngaged.
// Node 22, no dependencies. Usage: node build.mjs
import { writeFileSync } from 'node:fs';

const FEED = process.env.FEED_URL || 'https://sbengaged.stonybrook.edu/ical/stonybrook/ical_stonybrook.ics';
const TAG = 'Free Food & Refreshments';
const TZ = 'America/New_York';
const OUT = new URL('./index.html', import.meta.url);

const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts });
const nyDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const timeFmt = fmt({ hour: 'numeric', minute: '2-digit' });
const shortDayFmt = fmt({ month: 'short', day: 'numeric' });
const headingFmt = fmt({ weekday: 'long', month: 'long', day: 'numeric' });
const updatedFmt = fmt({ year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const unescape = (s) => s.replace(/\\([\\;,])/g, '$1');
const parseUtc = (s) => {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s || '');
  return m ? new Date(Date.UTC(m[1], m[2] - 1, m[3], m[4], m[5], m[6])) : null;
};

async function download() {
  const res = await fetch(FEED, { redirect: 'follow' });
  if (!res.ok) { await res.body?.cancel(); throw new Error(`Download failed: HTTP ${res.status}`); }
  const text = await res.text();
  if (!text.includes('BEGIN:VEVENT')) throw new Error('Feed contains no BEGIN:VEVENT');
  return text;
}

function parse(text) {
  const lines = text.replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n');
  const events = [];
  let ev = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { ev = { categories: [] }; continue; }
    if (line === 'END:VEVENT') { if (ev) events.push(ev); ev = null; continue; }
    if (!ev) continue;
    // NAME, optional ;PARAMS (quoted values may contain : or ;), then :VALUE
    const m = /^([A-Za-z-]+)((?:;(?:[^":;]|"[^"]*")*)*):(.*)$/.exec(line);
    if (!m) continue;
    const [, name, params, value] = m;
    switch (name.toUpperCase()) {
      case 'CATEGORIES': ev.categories.push(line); break;
      case 'SUMMARY': ev.name = unescape(value).trim(); break;
      case 'LOCATION': ev.location = unescape(value).trim(); break;
      case 'URL': ev.url = value.trim(); break;
      case 'DTSTART': ev.start = parseUtc(value.trim()); break;
      case 'DTEND': ev.end = parseUtc(value.trim()); break;
      case 'ORGANIZER': ev.host = unescape((/CN="([^"]*)"/i.exec(params) || /CN=([^;]*)/i.exec(params) || [])[1] || '').trim(); break;
    }
  }
  return events;
}

function cleanLocation(loc) {
  if (!loc || /^sign in to download the location$/i.test(loc)) return '';
  return loc.replace(/,\s*United States$/i, '').trim();
}

function render(events, now) {
  const today = nyDay(now);
  const items = events.map((e) => {
    const time = (nyDay(e.start) === today ? '' : shortDayFmt.format(e.start) + ', ') + timeFmt.format(e.start);
    const name = e.url ? `<a href="${esc(e.url)}">${esc(e.name || 'Untitled event')}</a>` : esc(e.name || 'Untitled event');
    const loc = cleanLocation(e.location);
    const where = loc ? esc(loc) : e.url ? `<a href="${esc(e.url)}">Location on SBEngaged</a>` : 'Location not listed';
    const parts = [`<time datetime="${e.start.toISOString()}">${time}</time>`, name, where];
    if (e.host) parts.push(esc(e.host));
    return `<li>${parts.join(' — ')}</li>`;
  });
  const list = items.length ? `<ul>\n${items.join('\n')}\n</ul>` : '<p>No free food listed today.</p>';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Food Finders</title>
</head>
<body>
<header>
<h1>Food Finders</h1>
<p>Free food for ${headingFmt.format(now)}</p>
</header>
<main>
${list}
</main>
<footer>
<p>Last updated <time datetime="${now.toISOString()}">${updatedFmt.format(now)}</time></p>
<p>Listed from events tagged Free Food &amp; Refreshments on SBEngaged.</p>
</footer>
</body>
</html>
`;
}

try {
  const now = new Date();
  const today = nyDay(now);
  const all = parse(await download());
  const events = all
    .filter((e) => e.start && e.categories.some((c) => c.includes(TAG)))
    .filter((e) => {
      const end = e.end && e.end > e.start ? new Date(e.end - 1) : e.start; // an event ending at midnight doesn't run the next day
      return nyDay(e.start) <= today && nyDay(end) >= today;
    })
    .sort((a, b) => a.start - b.start);
  writeFileSync(OUT, render(events, now));
  console.log(`Parsed ${all.length} events; ${events.length} free-food event(s) today (${today}). Wrote index.html.`);
} catch (err) {
  console.error(`Error: ${err.message}. index.html was not changed.`);
  process.exitCode = 1;
}
