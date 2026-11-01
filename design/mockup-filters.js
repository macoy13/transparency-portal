/**
 * Filter-linked office cards, summary, table, and bridge chips (R0 Mark layout).
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
  const ICON_CHEVRON =
    '<svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  let currentScope = 'all';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function animateValues(root) {
    root.querySelectorAll('.anim-value > span').forEach((el) => {
      el.classList.remove('is-visible');
      void el.offsetWidth;
      el.classList.add('is-visible');
    });
  }

  function officeCard(o, showFullNotes) {
    const rep = o.rep;
    const linesLabel = `${o.lines} records for ${o.printed}`;
    const billsLabel = `Bills by Rep. ${rep.name} (opens in new tab)`;
    const distLabel = `${rep.districtLabel} district page (opens in new tab)`;
    const coverage = showFullNotes
      ? `<details class="ocard-details">
          <summary>Coverage and source details ${ICON_CHEVRON}</summary>
          <div class="ocard-details-body">
            <p>Named projects: ${o.note.nepRecords} in the NEP, ${o.note.houseRecords} in the House bill.${
              o.note.wholeNep ? ` The whole office in the NEP: ${esc(o.note.wholeNep)}.` : ''
            }${
              o.note.unconfirmed > 0
                ? ` Includes ${o.note.unconfirmed} unconfirmed match${o.note.unconfirmed === 1 ? '' : 'es'}.`
                : ''
            }</p>
            <p><a href="enacted.html#${esc(o.gaaHash)}">${esc(o.printed)} budget each year since 2020 →</a></p>
            <p id="neighbour-caveat-${esc(o.id)}"><strong>Neighbouring provinces:</strong> Many enacted-budget lines also name Capiz or Antique, mostly shared roads and the Panay River Basin. Each line is shown in full; its amount is not divided between the provinces.</p>
            <p>An office’s budget is never split across the districts it serves. There is no Iloilo 5th District Engineering Office.</p>
          </div>
        </details>`
      : `<details class="ocard-details">
          <summary>Coverage and source details ${ICON_CHEVRON}</summary>
          <div class="ocard-details-body">
            <p>Showing filtered named projects only (${o.lines} records). Whole-office and unconfirmed notes are hidden while a filter is active.</p>
            <p id="neighbour-caveat-${esc(o.id)}"><strong>Neighbouring provinces:</strong> Many enacted-budget lines also name Capiz or Antique, mostly shared roads and the Panay River Basin. Each line is shown in full; its amount is not divided between the provinces.</p>
          </div>
        </details>`;

    return `<article class="office-card" data-office-id="${esc(o.id)}">
      <header class="ocard-top">
        <div class="ocard-title-row">
          ${ICON_BUILDING}
          <div>
            <p class="ocard-eyebrow">${esc(o.region)}</p>
            <h3 class="office-card-title">${esc(o.printed)}</h3>
          </div>
        </div>
        <span class="records-badge anim-value"><span class="is-visible" aria-label="${esc(linesLabel)}">${o.lines} records</span></span>
      </header>
      <div class="ocard-amounts">
        <div>
          <p class="stat-label">Proposed · NEP <span class="sample-badge">Sample</span></p>
          <p class="ocard-fig num anim-value"><span class="is-visible">${esc(o.nep)}</span></p>
        </div>
        <div>
          <p class="stat-label">House version <span class="sample-badge">Sample</span></p>
          <p class="ocard-fig num anim-value"><span class="is-visible">${esc(o.house)}</span></p>
        </div>
      </div>
      <p class="change-pill anim-value"><span class="is-visible">${esc(o.changeLabel)}</span></p>
      <div class="ocard-bars" role="img" aria-label="NEP ${esc(o.nep)} and House ${esc(o.house)} on a shared scale from zero">
        <div class="mini-bar-row">
          <span class="mini-bar-label">NEP</span>
          <span class="mini-bar-track"><span class="mini-bar-fill mini-bar-nep" style="width:${o.nepPct.toFixed(1)}%"></span></span>
          <span class="mini-bar-val num anim-value"><span class="is-visible">${o.nepB.toFixed(1)}B</span></span>
        </div>
        <div class="mini-bar-row">
          <span class="mini-bar-label">House</span>
          <span class="mini-bar-track"><span class="mini-bar-fill mini-bar-house" style="width:${o.housePct.toFixed(1)}%"></span></span>
          <span class="mini-bar-val num anim-value"><span class="is-visible">${o.houseB.toFixed(1)}B</span></span>
        </div>
        <p class="bar-legend"><span class="swatch swatch-nep"></span> NEP <span class="swatch swatch-house"></span> House · compared, not added</p>
      </div>
      <div class="ocard-rep">
        <p class="ocard-eyebrow">Legislative district representative</p>
        <div class="odistrict">
          <figure class="odistrict-figure">
            ${ICON_USER}
            <img class="odistrict-photo" src="${esc(rep.portrait)}" alt="Portrait of ${esc(rep.name)}" width="40" height="50" loading="lazy" />
          </figure>
          <div>
            <p class="rep-honorific">${esc(rep.honorific)}</p>
            <p class="rep-name">${esc(rep.name)}</p>
            <p class="odistrict-links">
              <a href="${esc(rep.bills)}" target="_blank" rel="noopener" aria-label="${esc(billsLabel)}">Bills ${ICON_EXTERNAL}</a>
              <a href="${esc(rep.districtPage)}" target="_blank" rel="noopener" aria-label="${esc(distLabel)}">District page ${ICON_EXTERNAL}</a>
            </p>
          </div>
        </div>
      </div>
      ${coverage}
      <a class="button button-card" href="explorer.html?office=${encodeURIComponent(o.printed)}" aria-label="View projects for ${esc(o.printed)}">View projects →</a>
    </article>`;
  }

  function renderChips(scope, hostId) {
    const chipHost = document.getElementById(hostId);
    if (!chipHost) return;
    const wired = new Set(data.wiredChips);
    chipHost.innerHTML = data.chipOrder
      .map((g) => {
        const n = scope.chips[g];
        const pressed = scope.activeChip === g;
        const label = data.chipLabels[g];
        const isWired = wired.has(g);
        return `<button type="button" class="chip" data-bridge="${g}" aria-pressed="${pressed}"${
          isWired ? '' : ' disabled'
        }>${esc(label)} <span class="num">(${n})</span>${
          isWired ? '' : ' <span class="chip-demo-note">(demo: not wired)</span>'
        }</button>`;
      })
      .join('');
  }

  function renderTableChips(scope) {
    const host = document.getElementById('table-chips');
    if (!host) return;
    host.innerHTML = `<button type="button" class="chip" aria-pressed="true">All <span class="num">(${scope.tableChips.all})</span></button>`;
  }

  function renderTable(scope) {
    const tbody = document.querySelector('#office-table tbody');
    if (!tbody) return;
    tbody.innerHTML = scope.offices
      .map(
        (o) => `<tr>
          <th scope="row">${esc(o.printed)}</th>
          <td class="num anim-value"><span class="is-visible">${esc(o.nep)}</span></td>
          <td class="num anim-value"><span class="is-visible">${esc(o.house)}</span></td>
          <td class="num anim-value"><span class="is-visible">${o.lines}</span></td>
          <td class="num change-cell anim-value"><span class="is-visible">${esc(o.changeLabel)}</span></td>
        </tr>`,
      )
      .join('');
  }

  function renderSummary(scope) {
    const s = scope.summary;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<span class="is-visible">${esc(val)}</span>`;
    };
    set('summary-records', s.records);
    set('summary-nep', s.nep);
    set('summary-house', s.house);
    const rn = document.getElementById('summary-records-note');
    if (rn) rn.textContent = s.recordsNote;
    const nn = document.getElementById('summary-nep-note');
    if (nn) {
      nn.hidden = !s.nepNote;
      if (s.nepNote) nn.textContent = s.nepNote;
    }
    const hn = document.getElementById('summary-house-note');
    if (hn) {
      hn.hidden = !s.houseNote;
      if (s.houseNote) hn.textContent = s.houseNote;
    }
    const showing = document.getElementById('filter-showing');
    if (showing) {
      showing.innerHTML = `Showing: ${esc(scope.filterLabel)} <span class="sample-badge">Sample</span>`;
    }
  }

  function applyScope(key) {
    const scope = data.scopes[key] ?? data.scopes.all;
    currentScope = key in data.scopes ? key : 'all';
    const grid = document.getElementById('office-grid');
    if (grid) grid.innerHTML = scope.offices.map((o) => officeCard(o, scope.showFullNotes)).join('');
    renderChips(scope, 'bridge-chips');
    renderTableChips(scope);
    renderTable(scope);
    renderSummary(scope);
    animateValues(document);
    bindChips();
  }

  function bindChips() {
    document.querySelectorAll('#bridge-chips .chip:not([disabled])').forEach((btn) => {
      btn.onclick = () => {
        const g = btn.getAttribute('data-bridge');
        if (g === 'all') applyScope('all');
        else if (g === 'increased') applyScope(currentScope === 'increased' ? 'all' : 'increased');
      };
    });
    const clear = document.getElementById('clear-filters');
    if (clear) clear.onclick = () => applyScope('all');
  }

  document.addEventListener('DOMContentLoaded', () => applyScope('all'));
})();
