const REGIONS = [
  { key: 'na',    label: 'North America' },
  { key: 'latam', label: 'Latin America' },
  { key: 'br',    label: 'Brazil' },
  { key: 'eu',    label: 'Europe' },
  { key: 'ap',    label: 'Asia Pacific' },
  { key: 'kr',    label: 'Korea' },
  { key: 'pbe',   label: 'PBE' },
];

const BASE = r => `https://valorant.secure.dyn.riotcdn.net/channels/public/x/status/${r}.json`;

function pickText(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const en = arr.find(t => t.locale === 'en_US' && t.content && t.content.trim());
  return (en || arr.find(t => t.content && t.content.trim()) || {}).content || null;
}

function itemTitle(item) {
  return pickText(item.titles) || pickText(item.updates && item.updates[0] && item.updates[0].translations) || item.id || 'Unknown issue';
}

function severityClass(item) {
  if (item.incident_severity === 'critical' || item.incident_severity === 'warning') return 'bad';
  if (item.maintenance_status === 'in_progress') return 'warn';
  return 'warn';
}

function classify(region) {
  const issues = [...(region.incidents || []).map(i => ({ ...i, kind: 'Incident' })),
                  ...(region.maintenances || []).map(m => ({ ...m, kind: 'Maintenance' }))];
  if (issues.length === 0) return { cls: 'ok', badge: 'Operational', issues };
  if (issues.some(i => i.incident_severity === 'critical' || i.incident_severity === 'warning'))
    return { cls: 'bad', badge: 'Incident', issues };
  return { cls: 'warn', badge: 'Maintenance', issues };
}

function render(results) {
  const grid = document.getElementById('regions');
  grid.innerHTML = '';
  let anyBad = false, anyWarn = false;

  for (const { region, error, key, label } of results) {
    const card = document.createElement('div');
    if (error) {
      card.className = 'card bad';
      card.innerHTML = `<h2>${label}</h2><span class="badge bad">Fetch error</span><p class="none">${error}</p>`;
      anyBad = true;
    } else {
      const c = classify(region);
      if (c.cls === 'bad') anyBad = true;
      if (c.cls === 'warn') anyWarn = true;
      card.className = `card ${c.cls}`;
      const issuesHtml = c.issues.length
        ? c.issues.map(i => `
            <div class="issue">
              <div class="kind">${i.kind}${i.incident_severity ? ' · ' + i.incident_severity : ''}${i.maintenance_status ? ' · ' + i.maintenance_status.replace('_', ' ') : ''}</div>
              <div class="title">${itemTitle(i)}</div>
              <div class="time">${i.created_at ? 'Started: ' + new Date(i.created_at).toLocaleString() : ''}</div>
            </div>`).join('')
        : `<p class="none">All systems operational.</p>`;
      card.innerHTML = `<h2>${region.name || label}</h2><span class="badge ${c.cls}">${c.badge}</span>${issuesHtml}`;
    }
    grid.appendChild(card);
  }

  const overall = document.getElementById('overall');
  if (anyBad) { overall.className = 'overall bad'; overall.textContent = '⚠ Some VALORANT servers are experiencing issues or are down.'; }
  else if (anyWarn) { overall.className = 'overall warn'; overall.textContent = '🔧 Some regions have scheduled or ongoing maintenance.'; }
  else { overall.className = 'overall ok'; overall.textContent = '✔ All VALORANT servers are operational.'; }

  document.getElementById('lastUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString();
}

async function load() {
  const results = await Promise.all(REGIONS.map(async ({ key, label }) => {
    try {
      const res = await fetch(BASE(key));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return { region: await res.json(), key, label };
    } catch (e) {
      return { error: e.message, key, label };
    }
  }));
  render(results);
}

document.getElementById('refreshBtn').addEventListener('click', load);
load();
setInterval(load, 300000);
