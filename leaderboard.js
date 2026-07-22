(function () {
  const data = window.SLOP_DATA;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function tier(score) {
    if (score >= 98) return "Michelin Slop ★★★";
    if (score >= 95) return "Grand Cru";
    if (score >= 92) return "Vintage Reserve";
    return "Table Slop";
  }

  function movementLabel(c) {
    switch (c.movement) {
      case "up": return `<span class="movement up">▲ ${c.movementAmount}</span>`;
      case "down": return `<span class="movement down">▼ ${c.movementAmount}</span>`;
      case "new": return `<span class="movement new">NEW</span>`;
      default: return `<span class="movement steady">—</span>`;
    }
  }

  function initials(name) {
    return name.split(/\s+/).map(w => w[0]).slice(0, 2).join("");
  }

  // ----- Stats bar -----
  const stats = [
    [data.stats.postsAppraised.toLocaleString("en-US"), "Posts Appraised"],
    [data.stats.emDashesCatalogued.toLocaleString("en-US"), "Em-Dashes Catalogued"],
    [data.stats.letThatSinkIns.toLocaleString("en-US"), "Things Let Sink In"],
    [data.stats.repostsSolicited.toLocaleString("en-US"), "Reposts Solicited"],
  ];
  document.getElementById("stats-bar").innerHTML = stats
    .map(([v, l]) => `<div class="stat"><div class="value">${v}</div><div class="label">${l}</div></div>`)
    .join("");

  document.getElementById("last-appraisal").textContent = new Date(data.lastAppraisal)
    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ----- Table -----
  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = data.contestants
    .map((c, i) => `
      <tr class="rank-${c.rank}">
        <td>
          <div class="rank-cell">
            <span class="rank-num">${c.rank}</span>
            ${movementLabel(c)}
          </div>
        </td>
        <td class="contestant">
          <div class="name">${esc(c.name)}</div>
          <div class="headline">${esc(c.headline)}</div>
        </td>
        <td><span class="platform-badge">${c.platform === "X" ? "𝕏" : "in"} ${esc(c.platform)}</span></td>
        <td><span class="signature">“${esc(c.signature)}”</span></td>
        <td class="score-cell">
          <span class="score">${c.slopIndex.toFixed(1)}</span>
          <span class="tier">${tier(c.slopIndex)}</span>
        </td>
        <td class="exhibit-cell">
          <button class="view-exhibit" data-index="${i}">View Exhibit 🏆</button>
        </td>
      </tr>`)
    .join("");

  // ----- Exhibit modal -----
  const backdrop = document.getElementById("modal-backdrop");
  const content = document.getElementById("modal-content");

  function openExhibit(c) {
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
          <div class="avatar">${esc(initials(c.name))}</div>
          <div class="post-author">
            <div class="p-name">${esc(c.name)}</div>
            <div class="p-headline">${esc(c.headline)}</div>
            <div class="p-meta">${c.exhibit.postedAgo} · 🌐 · ${esc(c.platform)}</div>
          </div>
        </div>
        <div class="post-body">${paragraphs}</div>
        <div class="post-engagement">
          👏💡❤️ ${c.exhibit.reactions} · ${c.exhibit.comments} comments · ${c.exhibit.reposts} reposts
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
  }

  function closeExhibit() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-exhibit");
    if (btn) openExhibit(data.contestants[Number(btn.dataset.index)]);
  });

  document.getElementById("modal-close").addEventListener("click", closeExhibit);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeExhibit();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !backdrop.hidden) closeExhibit();
  });
})();
