// Visitor-local dates. No network service, storage, or scheduled backend job.
export function seasonForDate(date = new Date()) {
  const month = date.getMonth() + 1, day = date.getDate();
  if (month === 10 && day >= 20) return 'halloween';
  if (month === 12 && day <= 26) return 'christmas';
  if ((month === 12 && day >= 27) || (month === 1 && day <= 2)) return 'new-year';
  return 'default';
}

export function iconForDate(date = new Date()) {
  return new URL(`./icons/remix-${seasonForDate(date)}.svg`, import.meta.url).href;
}

export function refreshSeasonalIcons(date = new Date()) {
  document.documentElement.dataset.iconSeason = seasonForDate(date);
  const href = iconForDate(date);
  for (const node of document.querySelectorAll('[data-remix-icon]')) {
    const attribute = node.tagName === 'LINK' ? 'href' : 'src';
    if (node.getAttribute(attribute) !== href) node.setAttribute(attribute, href);
  }
}

// One timer, rescheduled against local midnight (including DST changes).
// Returning from sleep/BFCache also refreshes without reloading media or jobs.
function scheduleMidnight() {
  clearTimeout(midnightTimer);
  const now = new Date();
  refreshSeasonalIcons(now);
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  midnightTimer = setTimeout(scheduleMidnight, next - now + 1000);
}
let midnightTimer;
if (typeof document !== 'undefined') {
  scheduleMidnight();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleMidnight(); });
  window.addEventListener('pageshow', scheduleMidnight);
}
