/**
 * Filter-linked office cards, summary, table, and bridge chips (R0 demo).
 */
(function () {
  const data = window.MOCKUP_OFFICE_DATA;
  if (!data) return;

  const ICON_BUILDING =
    '<svg class="office-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';
  const ICON_USER =
    '<svg class="odistrict-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const ICON_EXTERNAL =
    '<svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

  let currentScope = '';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function animateValues(root) {
    root.querySelectorAll('.office-card-value > span, .filter-value > span').forEach((el) => {
      el.classList.remove('is-visible');
      void el.offsetWidth;
      el.classList.add('is-visible');
    });
  }

  function groupChips(office) {
    return data.chipOrder
      .filter((g) => office.groups[g] > 0)
      .map((g) => {
        const label = data.chipLabels[g];
        const n = office.groups[g];
        const text = `${n} ${label.charAt(0).toLowerCase() + label.slice(1)}`;
        return `<span class="ocard-group-chip"><span class="status-dot g-${g}" aria-hidden="true"></span>${esc(text)}</span>`;
      })
      .join('');
  }

  function noteHtml(o) {
    const n = o.note;
    let html = `Named projects: ${n.nepRecords} in the NEP, ${n.houseRecords} in the House bill.`;
    html += ` The whole office in the NEP: ${esc(n.wholeNep)}.`;
    if (n.unconfirmed > 0) {
      html += ` Includes ${n.unconfirmed} unconfirmed match${n.unconfirmed === 1 ? '' : 'es'} (${esc(n.unconfirmedPhp)}).`;
    }
    if (n.held > 0) {
      html += ` ${n.held} line${n.held === 1 ? '' : 's'} whose two versions name different offices ${n.held === 1 ? 'is' : 'are'} not in these figures.`;
    }
    html += ` <a href="enacted.html#${esc(o.gaaHash)}">Its budget each year since 2020 →</a>`;
    return html;
  }

  function officeCard(o) {
    const rep = o.rep;
    const leadership = rep.leadership ? `<p class="rep-leadership">${esc(rep.leadership)}</p>` : '';
    return `<article class="office-card ocard" data-office-id="${esc(o.id)}">
      <header class="office-card-head ocard-head">
        <div class="ocard-head-main">
          ${ICON_BUILDING}
          <div>
            <p class="label ocard-kind">DPWH ${esc(o.kind)} · ${esc(o.region)}</p>
            <h3 class="office-card-title">${esc(o.printed)}</h3>
          </div>
        </div>
        <span class="tag tier tier-${o.tier}">${esc(o.tierText)}</span>
      </header>
      <dl class="office-card-figures ocard-figs">
        <div>
          <dt class="label">In this portal <span class="sample-badge">Sample</span></dt>
          <dd class="office-card-value"><span class="is-visible"><a class="ocard-lines" href="explorer.html?office=${encodeURIComponent(o.printed)}">${o.lines} line${o.lines === 1 ? '' : 's'} →</a></span></dd>
        </div>
        <div>
          <dt class="label">NEP <span class="sample-badge">Sample</span></dt>
          <dd class="num office-card-value"><span class="is-visible">${esc(o.nep)}</span></dd>
        </div>
        <div>
          <dt class="label">House bill <span class="sample-badge">Sample</span></dt>
          <dd class="num office-card-value"><span class="is-visible">${esc(o.house)}</span></dd>
        </div>
        <div>
          <dt class="label">Change <span class="sample-badge">Sample</span></dt>
          <dd class="num office-change office-card-value"><span class="is-visible">${esc(o.change)}</span></dd>
        </div>
      </dl>
      <p class="ocard-groups">${groupChips(o)}</p>
      <p class="ocard-note">${noteHtml(o)}</p>
      <div class="ocard-districts">
        <p class="label">Legislative district it serves</p>
        <ul>
          <li class="odistrict">
            <figure class="odistrict-figure">
              ${ICON_USER}
              <img class="odistrict-photo" src="${esc(rep.portrait)}" alt="Portrait of ${esc(rep.name)}" width="40" height="50" loading="lazy" />
            </figure>
            <div>
              <p class="rep-honorific">${esc(rep.honorific)}</p>
              <p class="rep-name">${esc(rep.name)}</p>
              ${leadership}
              <p class="odistrict-links small">
                <a href="${esc(rep.bills)}" target="_blank" rel="noopener">Bills ${ICON_EXTERNAL}</a>
                <a href="${esc(rep.districtPage)}" target="_blank" rel="noopener">District page ${ICON_EXTERNAL}</a>
              </p>
            </div>
          </li>
        </ul>
      </div>
    </article>`;
  }

  function renderChips(scope) {
    const chipHost = document.getElementById('bridge-chips');
    if (!chipHost) return;
    chipHost.innerHTML = data.chipOrder
      .concat(['toggle'])
      .filter((g) => g !== 'toggle')
      .map((g) => {
        const n = scope.chips[g];
        const pressed = scope.activeChip === g;
        const label = data.chipLabels[g];
        return `<button type="button" class="chip" data-bridge="${g}" aria-pressed="${pressed}">${esc(label)} <span class="num">(${n})</span></button>`;
      })
      .join('');
  }

  function renderTable(scope) {
    const tbody = document.querySelector('#office-table tbody');
    if (!tbody) return;
    tbody.innerHTML = scope.offices
      .map(
        (o) => `<tr>
          <td>${esc(o.printed)}</td>
          <td class="num filter-value"><span class="is-visible">${esc(o.nep)}</span></td>
          <td class="num filter-value"><span class="is-visible">${esc(o.house)}</span></td>
          <td class="num filter-value"><span class="is-visible">${o.lines}</span></td>
          <td class="num filter-value"><span class="is-visible">${esc(o.change)}</span></td>
        </tr>`,
      )
      .join('');
  }

  function renderSummary(scope) {
    const s = scope.summary;
    const map = {
      'summary-records': s.records,
      'summary-nep': s.nep,
      'summary-house': s.house,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<span class="is-visible">${esc(val)}</span>`;
    });
    const note = document.getElementById('summary-records-note');
    if (note) note.textContent = s.note;
    const scopeNote = document.getElementById('office-scope-note');
    if (scopeNote) scopeNote.textContent = scope.scopeNote;
    const showing = document.getElementById('filter-showing');
    if (showing) showing.textContent = scope.filterLabel;
  }

  function applyScope(key) {
    const scope = data.scopes[key] ?? data.scopes[''];
    currentScope = key in data.scopes ? key : '';
    const grid = document.getElementById('office-grid');
    if (grid) {
      grid.innerHTML = scope.offices.map(officeCard).join('');
    }
    renderChips(scope);
    renderTable(scope);
    renderSummary(scope);
    animateValues(document);
    bindChips();
  }

  function bindChips() {
    document.querySelectorAll('#bridge-chips .chip').forEach((btn) => {
      btn.onclick = () => {
        const g = btn.getAttribute('data-bridge');
        if (g === 'increased') {
          applyScope(currentScope === 'increased' ? '' : 'increased');
        } else if (g === 'unchanged' && currentScope === 'increased') {
          applyScope('');
        } else {
          applyScope(currentScope === 'increased' ? 'increased' : '');
        }
      };
    });
  }

  document.addEventListener('DOMContentLoaded', () => applyScope(''));
})();
