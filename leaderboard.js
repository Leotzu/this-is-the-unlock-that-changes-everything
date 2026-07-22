(function () {
  const data = window.SLOP_DATA;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function fmt(n) {
    return n.toLocaleString("en-US");
  }

  // Official methodology: (Likes × 1.0) + (Comments × 2.0) + (Reposts × 3.0)
  function engagementScore(ex) {
    return ex.likes + ex.comments * 2 + ex.reposts * 3;
  }

  function initials(name) {
    return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  }

  function avatarStyle(i) {
    const hue = (215 + i * 47) % 360;
    return `background: linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${(hue + 40) % 360}, 60%, 30%));`;
  }

  function rankBadge(rank) {
    const medal = { 1: "gold", 2: "silver", 3: "bronze" }[rank];
    return medal
      ? `<div class="rank-badge ${medal}">${rank}</div>`
      : `<div class="rank-plain">${rank}</div>`;
  }

  function preview(c) {
    const first = c.exhibit.paragraphs[0].text.replace(/\n+/g, " ");
    return first.length > 58 ? first.slice(0, 58).trimEnd() + "…" : first;
  }

  const barsIcon = `
    <svg class="bars" width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
      <rect x="0" y="8" width="3.5" height="6" rx="1" fill="#4d8dff"/>
      <rect x="6" y="4" width="3.5" height="10" rx="1" fill="#4d8dff"/>
      <rect x="12" y="0" width="3.5" height="14" rx="1" fill="#4d8dff"/>
    </svg>`;

  // Red (maximum slop) through orange to yellow (merely impressive slop)
  function slopColor(score) {
    const hue = Math.max(0, Math.min(70, (100 - score) * 3));
    return `hsl(${hue}, 88%, 55%)`;
  }

  function gaugeIcon(score) {
    const color = slopColor(score);
    const rad = (score / 100) * Math.PI; // needle angle, 0 = left, 100 = right
    const x = 14 - 9.5 * Math.cos(rad);
    const y = 14 - 9.5 * Math.sin(rad);
    return `
      <svg class="gauge" width="30" height="18" viewBox="0 0 28 17" aria-hidden="true">
        <path d="M2.5 14 A 11.5 11.5 0 0 1 25.5 14" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
        <line x1="14" y1="14" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="14" cy="14" r="1.9" fill="${color}"/>
      </svg>`;
  }

  const chevronIcon = `
    <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
      <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  // ----- Header -----
  document.getElementById("week-of").textContent = data.weekOf;

  document.getElementById("stat-cards").innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📈</div>
      <div class="stat-body">
        <div class="s-label">Total Posts Analyzed</div>
        <div class="s-value">${fmt(data.stats.postsAnalyzed)}</div>
        <div class="s-delta">▲ ${data.stats.postsDeltaPct}% vs last week</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✨</div>
      <div class="stat-body">
        <div class="s-label">Average Slop Index</div>
        <div class="s-value">${data.stats.avgSlopIndex.toFixed(1)}</div>
        <div class="s-delta">▲ ${data.stats.avgSlopDeltaPct} vs last week</div>
      </div>
    </div>`;

  // ----- Table -----
  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = data.contestants
    .map((c, i) => `
      <tr data-index="${i}">
        <td>${rankBadge(c.rank)}</td>
        <td>
          <div class="poster">
            <div class="avatar" style="${avatarStyle(i)}">${esc(initials(c.name))}</div>
            <div>
              <div class="p-name">${esc(c.name)}</div>
              <div class="p-sub">in · ${esc(c.headline)}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="preview-box">
            <span>${esc(preview(c))}</span>
            <button class="plus-btn" aria-label="Expand post and judges' notes">${chevronIcon}</button>
          </div>
        </td>
        <td class="eng-cell"><span class="eng-value">${fmt(engagementScore(c.exhibit))}</span>${barsIcon}</td>
        <td class="slop-cell">${gaugeIcon(c.slopIndex)}<span class="slop-value" style="color: ${slopColor(c.slopIndex)}">${c.slopIndex.toFixed(1)}</span></td>
      </tr>`)
    .join("");

  // ----- Exhibit modal -----
  const backdrop = document.getElementById("modal-backdrop");
  const content = document.getElementById("modal-content");

  function openExhibit(i) {
    const c = data.contestants[i];
    const notes = [];
    const paragraphs = c.exhibit.paragraphs
      .map((p) => {
        const text = esc(p.text);
        if (!p.note) return `<p>${text}</p>`;
        notes.push(p.note);
        return `<p><mark>${text}</mark><sup class="note-ref">${notes.length}</sup></p>`;
      })
      .join("");

    content.innerHTML = `
      <div class="exhibit-label">Prized Exhibit — Rank ${c.rank} of ${data.contestants.length}</div>
      <div class="post-card">
        <div class="post-head">
          <div class="avatar" style="${avatarStyle(i)}">${esc(initials(c.name))}</div>
          <div class="post-author">
            <div class="a-name">${esc(c.name)}</div>
            <div class="a-headline">${esc(c.headline)}</div>
            <div class="a-meta">${c.exhibit.postedAgo} · 🌐 · ${esc(c.platform)}</div>
          </div>
        </div>
        <div class="post-body">${paragraphs}</div>
        <div class="post-engagement">
          👏💡❤️ ${fmt(c.exhibit.likes)} · ${fmt(c.exhibit.comments)} comments · ${fmt(c.exhibit.reposts)} reposts
          · Engagement Score: ${fmt(engagementScore(c.exhibit))}
        </div>
      </div>
      <div class="notes-section">
        <div class="notes-kicker">From the Judges' Table</div>
        <h4>Official Tasting Notes</h4>
        <ol class="notes-list">
          ${notes.map((n) => `<li>${esc(n)}</li>`).join("")}
        </ol>
        <div class="analysis-chips">
          ${c.exhibit.analysis.map((a) => `<span class="chip">${esc(a)}</span>`).join("")}
        </div>
        <span class="original-link">
          View original post — available once the live ingestion pipeline ships. The slop, however, is timeless.
        </span>
      </div>`;

    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#exhibit-${c.rank}`);
  }

  function closeExhibit() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname);
  }

  // Deep link: /#exhibit-3 opens that rank's exhibit directly
  const hashMatch = location.hash.match(/^#exhibit-(\d+)$/);
  if (hashMatch) {
    const idx = data.contestants.findIndex((c) => c.rank === Number(hashMatch[1]));
    if (idx !== -1) openExhibit(idx);
  }

  tbody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-index]");
    if (row) openExhibit(Number(row.dataset.index));
  });

  document.getElementById("modal-close").addEventListener("click", closeExhibit);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeExhibit();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !backdrop.hidden) closeExhibit();
  });
})();
