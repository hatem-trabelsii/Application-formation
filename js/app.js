/* ArchiPath Academy — application monopage (routeur par hash, aucune dépendance). */
(function () {
  const A = window.ACADEMY;
  const { esc, md, h, toast, stars, parseHours, parseCost, fmtMin, fmtDate } = U;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const app = $('#app');

  /* ================= Préparation des données ================= */
  A.courses.sort((a, b) => a.phase - b.phase || (a.kind === b.kind ? (a.order || 0) - (b.order || 0) : a.kind === 'cert' ? -1 : 1));
  const byId = {};
  A.courses.forEach(c => {
    byId[c.id] = c;
    c.lessons = [];
    c.modules.forEach((m, mi) => m.lessons.forEach((l, li) => {
      l.id = `${mi + 1}-${li + 1}`;
      l.module = m.title;
      l.moduleIndex = mi;
      l.minutes = LessonPlayer.estimateMinutes(l);
      c.lessons.push(l);
    }));
    c.labs = (c.labs || []).map((lab, i) => Object.assign(lab, { id: 'lab' + (i + 1) }));
    c.quiz = c.quiz || [];
    c.flashcards = c.flashcards || [];
    c.minutes = c.lessons.reduce((s, l) => s + l.minutes, 0);
  });
  const phaseOf = c => A.phases[c.phase - 1];

  function currentPhase() {
    const today = new Date().toISOString().slice(0, 10);
    if (today < A.phases[0].start) return A.phases[0];
    return A.phases.find(p => today >= p.start && today <= p.end) || A.phases[A.phases.length - 1];
  }
  function courseProgress(c) {
    const total = c.lessons.length;
    const done = c.lessons.filter(l => Store.isLessonDone(c.id, l.id)).length;
    return { done, total, pct: total ? Math.round(100 * done / total) : 0 };
  }
  function phaseStats(p) {
    const cs = A.courses.filter(c => c.phase === p.n);
    const acquired = cs.filter(c => Store.isAcquired(c.id)).length;
    let done = 0, total = 0;
    cs.forEach(c => { const pr = courseProgress(c); done += pr.done; total += pr.total; });
    return { courses: cs, acquired, done, total, pct: total ? Math.round(100 * done / total) : 0 };
  }
  function dueCards(courseFilter) {
    const out = [];
    A.courses.forEach(c => {
      if (courseFilter && c.id !== courseFilter) return;
      c.flashcards.forEach((_, i) => { const k = c.id + '#' + i; if (Store.isDue(k)) out.push(k); });
    });
    return out;
  }
  function vendorClass(v) { return ({ AWS: 'aws', Azure: 'azure', PMI: 'pmi' })[v] || ''; }
  function thumbStyle(c) {
    const col = phaseOf(c).color;
    const g = { AWS: '#ff9900', Azure: '#0078d4', PMI: '#be185d' }[c.vendor] || '#1c1d1f';
    return `background: linear-gradient(135deg, ${c.kind === 'cert' ? g : '#1f2937'} 0%, ${col} 110%)`;
  }
  function courseTags(c) {
    const t = [];
    if (c.kind === 'cert') {
      t.push(`<span class="tag ${vendorClass(c.vendor)}">${esc(c.vendor)}</span>`);
      t.push(`<span class="tag lvl-${(c.level || '').toLowerCase()}">${esc(c.level)}</span>`);
      t.push(`<span class="tag tag-code">${esc(c.code)}</span>`);
    } else {
      t.push(`<span class="tag">${esc(c.category)}</span>`);
    }
    return `<div class="tags">${t.join('')}</div>`;
  }
  function courseMeta(c) {
    const parts = [];
    if (c.kind === 'cert') parts.push(`<span>⏱ ${esc(c.hours)}</span><span>💶 ${esc(c.cost)}</span>`);
    else parts.push(`<span>📚 ${esc(c.hours)}</span>`);
    parts.push(`<span class="stars" title="Priorité ${c.priority}/5">${stars(c.priority)}</span>`);
    return `<div class="meta">${parts.join('')}</div>`;
  }
  function progressBar(pct, thick) { return `<div class="progress${thick ? ' thick' : ''}"><span style="width:${pct}%"></span></div>`; }

  function courseCard(c) {
    const pr = courseProgress(c);
    const acq = Store.isAcquired(c.id);
    return `<a class="course-card" href="#/cours/${c.id}">
      <div class="thumb" style="${thumbStyle(c)}">
        <span class="t-icon">${c.icon}</span>
        ${c.code ? `<span class="t-code">${esc(c.code)}</span>` : ''}
        <span class="t-phase">Phase ${c.phase}</span>
        ${acq ? `<span class="t-done">✓ ${c.kind === 'cert' ? 'Obtenue' : 'Maîtrisée'}</span>` : ''}
      </div>
      <div class="body">
        <h3>${esc(c.title)}</h3>
        <div class="sub">${esc(c.subtitle)}</div>
        ${courseTags(c)}
        ${courseMeta(c)}
        <div class="foot">
          <div class="meta small"><span>🎬 ${c.lessons.length} leçons · ${fmtMin(c.minutes)}</span><span>🧪 ${c.labs.length} labs</span><span>❓ ${c.quiz.length} Q</span></div>
          ${pr.done ? `${progressBar(pr.pct)}<div class="progress-label"><span>${pr.pct}% terminé</span><span>${pr.done}/${pr.total}</span></div>` : ''}
        </div>
      </div>
    </a>`;
  }

  /* ================= Vues ================= */
  let cleanup = null;
  // opts.inner : re-rendu à l'intérieur d'une même vue (quiz, cartes, lab) — on conserve ses minuteurs et écouteurs
  function setView(html, opts = {}) {
    if (cleanup && !opts.inner) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    app.innerHTML = html;
    if (!opts.keepScroll) window.scrollTo(0, 0);
    updateNav();
  }

  /* ---------- Accueil ---------- */
  function viewHome() {
    const cp = currentPhase();
    const today = new Date();
    const end = new Date(cp.end + 'T23:59:59');
    const start = new Date(cp.start);
    const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000));
    const phaseCourses = A.courses.filter(c => c.phase === cp.n);
    const phaseHours = phaseCourses.reduce((s, c) => s + parseHours(c.hours), 0);
    const weeks = Math.max(1, (end - start) / (7 * 86400000));
    const totalLessons = A.courses.reduce((s, c) => s + c.lessons.length, 0);
    const doneLessons = A.courses.reduce((s, c) => s + courseProgress(c).done, 0);
    const minutesDone = A.courses.reduce((s, c) => s + c.lessons.filter(l => Store.isLessonDone(c.id, l.id)).reduce((a, l) => a + l.minutes, 0), 0);
    const certs = A.courses.filter(c => c.kind === 'cert');
    const certsDone = certs.filter(c => Store.isAcquired(c.id)).length;
    const due = dueCards().length;
    const quizScores = A.courses.map(c => Store.bestQuiz(c.id)).filter(x => x != null);
    const avgQuiz = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null;
    const budget = certs.reduce((s, c) => s + parseCost(c.cost), 0);

    const last = Store.state.last && byId[Store.state.last.courseId];
    const lastLesson = last && last.lessons.find(l => l.id === Store.state.last.lessonId);
    const nextUp = (() => {
      for (const c of phaseCourses) { const l = c.lessons.find(l => !Store.isLessonDone(c.id, l.id)); if (l) return { c, l }; }
      return null;
    })();
    const resume = lastLesson ? { c: last, l: lastLesson } : nextUp;

    setView(`
      <div class="container">
        <section class="hero" style="--phase:${cp.color}">
          <span class="pill">${cp.icon} Phase ${cp.n} en cours · ${esc(cp.period)}</span>
          <h1>${esc(cp.title)}</h1>
          <p>${esc(cp.summary)}</p>
          <div class="btn-row">
            ${resume ? `<a class="btn" href="#/apprendre/${resume.c.id}/${resume.l.id}">▶ ${lastLesson ? 'Reprendre' : 'Commencer'} : ${esc(resume.l.title)}</a>` : ''}
            <a class="btn secondary" href="#/roadmap/${cp.n}">Voir la roadmap</a>
          </div>
          <p class="small" style="margin:14px 0 0">⏳ ${daysLeft} jours restants dans la phase · charge estimée ≈ <b>${Math.round(phaseHours / weeks)} h/semaine</b> pour ${Math.round(phaseHours)} h de programme.</p>
        </section>

        <div class="grid stats" style="margin-top:20px">
          <div class="card stat"><div class="v">${Math.round(100 * doneLessons / Math.max(1, totalLessons))}%</div><div class="l">Parcours global (${doneLessons}/${totalLessons} leçons)</div></div>
          <div class="card stat"><div class="v">${fmtMin(minutesDone)}</div><div class="l">De vidéo suivie</div></div>
          <div class="card stat"><div class="v">${certsDone}/${certs.length}</div><div class="l">Certifications obtenues</div></div>
          <a class="card stat" href="#/revisions" style="color:inherit;text-decoration:none"><div class="v">${due}</div><div class="l">Cartes à réviser aujourd'hui</div></a>
          <div class="card stat"><div class="v">${avgQuiz == null ? '—' : avgQuiz + '%'}</div><div class="l">Moyenne des meilleurs quiz</div></div>
          <div class="card stat"><div class="v">${budget.toLocaleString('fr-FR')} €</div><div class="l">Budget examens du parcours</div></div>
        </div>

        ${resume ? `
        <div class="section-title"><h2>Continuer mon apprentissage</h2></div>
        <a class="card resume-card" href="#/apprendre/${resume.c.id}/${resume.l.id}" style="color:inherit;text-decoration:none">
          <div class="thumb" style="${thumbStyle(resume.c)}"><span class="t-icon">${resume.c.icon}</span></div>
          <div style="flex:1;min-width:0">
            <div class="muted small">${esc(resume.c.title)} · ${esc(resume.l.module)}</div>
            <h3 style="margin:4px 0 8px">${esc(resume.l.title)}</h3>
            ${progressBar(courseProgress(resume.c).pct)}
            <div class="progress-label"><span>${courseProgress(resume.c).pct}% du cours</span><span>${resume.l.minutes} min</span></div>
          </div>
        </a>` : ''}

        <div class="section-title"><h2>La roadmap en 5 phases</h2><a href="#/roadmap">Détail ›</a></div>
        <div class="timeline">
          ${A.phases.map(p => { const st = phaseStats(p); return `
            <a class="tl-item ${p.n === cp.n ? 'current' : ''}" style="--c:${p.color}" href="#/catalogue?phase=${p.n}">
              <div class="p-n">${p.icon} Phase ${p.n}${p.n === cp.n ? ' · en cours' : ''}</div>
              <h4>${esc(p.title)}</h4>
              <div class="muted small">${esc(p.period)}</div>
              <div style="margin-top:10px">${progressBar(st.pct)}</div>
              <div class="progress-label"><span>${st.pct}% leçons</span><span>${st.acquired}/${st.courses.length} acquis</span></div>
            </a>`; }).join('')}
        </div>

        <div class="section-title"><h2>Formations de la phase ${cp.n}</h2><a href="#/catalogue?phase=${cp.n}">Tout voir ›</a></div>
        <div class="grid courses">${phaseCourses.map(courseCard).join('')}</div>

        <div class="section-title"><h2>Comment apprendre « par cœur » ici</h2></div>
        <div class="grid stats">
          <div class="card"><b>🎬 1. Regarder</b><p class="muted small">Chaque leçon est une vidéo narrée (diaporama + voix + sous-titres). Vitesse réglable, plein écran, raccourcis clavier.</p></div>
          <div class="card"><b>📖 2. Lire & noter</b><p class="muted small">L'onglet Théorie reprend tout le contenu, avec les exemples de code à copier. Prenez vos notes sous la vidéo.</p></div>
          <div class="card"><b>🧪 3. Pratiquer</b><p class="muted small">Les labs guidés, étape par étape, avec indices et solutions, sur votre poste ou un compte cloud gratuit.</p></div>
          <div class="card"><b>🧠 4. Mémoriser</b><p class="muted small">Flashcards à répétition espacée (Leitner) + quiz type examen avec explications. Revenez chaque jour.</p></div>
        </div>
      </div>`);
  }

  /* ---------- Catalogue ---------- */
  function viewCatalog(params) {
    const f = { phase: params.get('phase') || 'all', kind: params.get('kind') || 'all', vendor: params.get('vendor') || 'all', status: params.get('status') || 'all' };
    const chip = (key, val, label) => `<button class="chip ${f[key] === val ? 'active' : ''}" data-k="${key}" data-v="${val}">${label}</button>`;
    let list = A.courses.filter(c =>
      (f.phase === 'all' || String(c.phase) === f.phase) &&
      (f.kind === 'all' || c.kind === f.kind) &&
      (f.vendor === 'all' || (f.vendor === 'other' ? c.kind === 'tech' : c.vendor === f.vendor)) &&
      (f.status === 'all' || (f.status === 'progress' ? courseProgress(c).done > 0 && !Store.isAcquired(c.id) : f.status === 'done' ? Store.isAcquired(c.id) : courseProgress(c).done === 0)));
    setView(`
      <div class="container">
        <h1>Catalogue des formations</h1>
        <p class="muted">${A.courses.length} formations · ${A.courses.filter(c => c.kind === 'cert').length} certifications et ${A.courses.filter(c => c.kind === 'tech').length} technologies, réparties sur 5 phases (avril 2026 → février 2028).</p>
        <div class="filters">
          ${chip('phase', 'all', 'Toutes phases')}
          ${A.phases.map(p => chip('phase', String(p.n), `${p.icon} Phase ${p.n}`)).join('')}
        </div>
        <div class="filters">
          ${chip('kind', 'all', 'Tout')}${chip('kind', 'cert', '🎓 Certifications')}${chip('kind', 'tech', '🛠 Technologies')}
          <span class="sep"></span>
          ${chip('vendor', 'all', 'Tous éditeurs')}${chip('vendor', 'AWS', 'AWS')}${chip('vendor', 'Azure', 'Azure')}${chip('vendor', 'PMI', 'PMI')}
          <span class="sep"></span>
          ${chip('status', 'all', 'Tous statuts')}${chip('status', 'todo', 'Non commencées')}${chip('status', 'progress', 'En cours')}${chip('status', 'done', 'Acquises')}
        </div>
        ${list.length ? `<div class="grid courses">${list.map(courseCard).join('')}</div>` : `<div class="empty"><div class="e-icon">🔍</div>Aucune formation ne correspond à ces filtres.</div>`}
      </div>`);
    $$('.chip', app).forEach(b => b.addEventListener('click', () => {
      const p = new URLSearchParams(params);
      p.set(b.dataset.k, b.dataset.v);
      if (b.dataset.v === 'all') p.delete(b.dataset.k);
      location.hash = '#/catalogue' + (p.toString() ? '?' + p : '');
    }));
  }

  /* ---------- Page cours ---------- */
  function viewCourse(id) {
    const c = byId[id]; if (!c) return notFound();
    const p = phaseOf(c);
    const pr = courseProgress(c);
    const acq = Store.isAcquired(c.id);
    const firstTodo = c.lessons.find(l => !Store.isLessonDone(c.id, l.id)) || c.lessons[0];
    const ex = c.exam;
    const dueHere = dueCards(c.id).length;
    const best = Store.bestQuiz(c.id);

    setView(`
      <div class="band" style="--phase:${p.color}">
        <div class="container">
          <div>
            <div class="crumbs"><a href="#/catalogue">Catalogue</a> › <a href="#/catalogue?phase=${p.n}">Phase ${p.n} · ${esc(p.title)}</a> › ${c.kind === 'cert' ? 'Certifications' : 'Technologies'}</div>
            <h1>${c.icon} ${esc(c.title)}</h1>
            <div class="subtitle">${esc(c.subtitle)}</div>
            ${courseTags(c)}
            <div class="meta" style="margin-top:8px">
              <span class="stars">${stars(c.priority)}</span><span>Priorité ${c.priority}/5</span>
              <span>🎬 ${c.lessons.length} leçons vidéo (${fmtMin(c.minutes)})</span>
              <span>🧪 ${c.labs.length} labs</span><span>❓ ${c.quiz.length} questions</span><span>🧠 ${c.flashcards.length} flashcards</span>
            </div>
            <div class="meta" style="margin-top:6px"><span>📅 ${esc(p.period)}</span><span>${c.kind === 'cert' ? '⏱ Préparation' : '📚 Volume'} ${esc(c.hours)}</span>${c.cost ? `<span>💶 Examen ${esc(c.cost)}</span>` : ''}<span>🇫🇷 Français</span></div>
          </div>
          <div class="spacer"></div>
        </div>
      </div>
      <div class="container course-layout">
        <div>
          <div class="box">
            <h2>Ce que vous apprendrez</h2>
            <ul class="learn-grid">${c.outcomes.map(o => `<li>${md(o)}</li>`).join('')}</ul>
          </div>

          ${ex ? `<div class="box" style="--phase:${p.color}">
            <h2>🎯 L'examen ${esc(c.code || '')}</h2>
            <div class="kv">
              ${ex.duration ? `<div><b>${esc(ex.duration)}</b><span>Durée</span></div>` : ''}
              ${ex.questions ? `<div><b>${esc(ex.questions)}</b><span>Questions</span></div>` : ''}
              ${ex.passing ? `<div><b>${esc(ex.passing)}</b><span>Score requis</span></div>` : ''}
              ${c.cost ? `<div><b>${esc(c.cost)}</b><span>Prix indicatif</span></div>` : ''}
            </div>
            ${(ex.domains || []).map(([d, w]) => `<div class="domain"><div class="d-head"><span>${esc(d)}</span><b>${esc(w)}</b></div>${progressBar(parseInt(w, 10) || 0)}</div>`).join('')}
            ${ex.notes ? `<div class="callout warn">${md(ex.notes)}</div>` : ''}
          </div>` : ''}

          <div class="section-title" style="margin-top:0"><h2>Contenu du cours</h2><span class="muted small">${c.modules.length} sections · ${c.lessons.length} leçons · ${fmtMin(c.minutes)}</span></div>
          <div class="accordion">
            ${c.modules.map((m, mi) => `
              <div class="acc-item ${mi === 0 ? 'open' : ''}">
                <button class="acc-head"><span><span class="chev">›</span>${esc(m.title)}</span><span class="muted small nowrap">${m.lessons.length} leçons · ${fmtMin(m.lessons.reduce((s, l) => s + l.minutes, 0))}</span></button>
                <div class="acc-body">
                  ${m.lessons.map(l => `<a class="acc-row" href="#/apprendre/${c.id}/${l.id}"><span>${Store.isLessonDone(c.id, l.id) ? '<span class="done">✔</span>' : '▶'}</span><span>${esc(l.title)}</span><span class="dur">${l.minutes} min</span></a>`).join('')}
                </div>
              </div>`).join('')}
          </div>

          ${c.labs.length ? `<div class="section-title"><h2>🧪 Travaux pratiques</h2></div>
          <div class="accordion">${c.labs.map(lab => `<a class="acc-row" href="#/lab/${c.id}/${lab.id}"><span>${Store.isLabDone(c.id, lab.id) ? '<span class="done">✔</span>' : '🧪'}</span><span><b>${esc(lab.title)}</b><br><span class="muted small">${esc(lab.goal)}</span></span><span class="dur">${lab.minutes || 30} min · ${lab.steps.length} étapes</span></a>`).join('')}</div>` : ''}

          <div class="section-title"><h2>Prérequis</h2></div>
          <ul>${(c.prerequisites || ['Aucun']).map(x => `<li>${md(x)}</li>`).join('')}</ul>

          <div class="section-title"><h2>Description</h2></div>
          <p>${md(c.description || c.subtitle)}</p>

          ${(c.resources || []).length ? `<div class="section-title"><h2>📚 Ressources officielles</h2></div>
          <ul class="link-list">${c.resources.map(r => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)} ↗</a></li>`).join('')}</ul>` : ''}
        </div>

        <aside>
          <div class="side-card">
            <a class="thumb" style="${thumbStyle(c)}" href="#/apprendre/${c.id}/${firstTodo.id}"><span class="t-icon">${c.icon}</span><span class="play">▶</span></a>
            <div class="inner">
              ${progressBar(pr.pct, true)}
              <div class="progress-label" style="margin-top:0"><span>${pr.pct}% terminé</span><span>${pr.done}/${pr.total} leçons</span></div>
              <a class="btn block" href="#/apprendre/${c.id}/${firstTodo.id}">${pr.done ? '▶ Continuer le cours' : '▶ Commencer le cours'}</a>
              <div class="btn-row">
                <a class="btn ghost small" style="flex:1" href="#/quiz/${c.id}">❓ Quiz${best != null ? ` (${best}%)` : ''}</a>
                <a class="btn ghost small" style="flex:1" href="#/flashcards/${c.id}">🧠 Cartes${dueHere ? ` (${dueHere})` : ''}</a>
              </div>
              <button class="btn ${acq ? 'ok' : 'secondary'} block" id="acq">${acq ? '✓ ' + (c.kind === 'cert' ? 'Certification obtenue' : 'Technologie maîtrisée') : (c.kind === 'cert' ? '🎓 Marquer la certification obtenue' : '🛠 Marquer comme maîtrisée')}</button>
              ${acq ? `<div class="muted small" style="text-align:center">le ${fmtDate(Store.state.status[c.id].date)}</div>` : ''}
              <div><b>Ce cours comprend :</b>
                <ul>
                  <li>🎬 ${fmtMin(c.minutes)} de vidéo narrée</li>
                  <li>📖 Théorie complète + exemples de code</li>
                  <li>🧪 ${c.labs.length} labs pratiques guidés</li>
                  <li>❓ ${c.quiz.length} questions type examen</li>
                  <li>🧠 ${c.flashcards.length} flashcards de mémorisation</li>
                  <li>📝 Prise de notes par leçon</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>`);
    $$('.acc-head', app).forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
    $('#acq').addEventListener('click', () => { Store.setAcquired(c.id, !acq); viewCourse(id); });
  }

  /* ---------- Lecture d'une leçon ---------- */
  function viewLearn(cid, lid, tab) {
    const c = byId[cid]; if (!c) return notFound();
    const idx = c.lessons.findIndex(l => l.id === lid);
    if (idx < 0) return notFound();
    const l = c.lessons[idx];
    const prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
    const p = phaseOf(c);
    Store.setLast(c.id, l.id);
    const pr = courseProgress(c);
    const done = Store.isLessonDone(c.id, l.id);

    setView(`
      <div class="learn" style="--phase:${p.color}">
        <div class="learn-top">
          <a href="#/cours/${c.id}" title="Retour au cours">←</a>
          <span class="title">${c.icon} ${esc(c.title)}</span>
          <div class="prog"><div class="progress"><span style="width:${pr.pct}%"></span></div><span>${pr.done}/${pr.total} leçons</span></div>
        </div>
        <div class="learn-main">
          <div id="player"></div>
          <div class="lesson-actions">
            <h2>${esc(l.title)}</h2>
            ${prev ? `<a class="btn ghost small" href="#/apprendre/${c.id}/${prev.id}">◀ Précédente</a>` : ''}
            <button class="btn small ${done ? 'ok' : 'secondary'}" id="markDone">${done ? '✓ Terminée' : 'Marquer comme terminée'}</button>
            ${next ? `<a class="btn small" href="#/apprendre/${c.id}/${next.id}">Suivante ▶</a>` : `<a class="btn small" href="#/quiz/${c.id}">Quiz final ▶</a>`}
          </div>
          <div class="tabs">
            ${[['theorie', '📖 Théorie'], ['points', '💡 Points clés'], ['notes', '📝 Notes'], ['videos', '🎥 Vidéos & ressources'], ['pratique', '🧪 Pratique']].map(([k, t]) => `<button class="tab" data-tab="${k}">${t}</button>`).join('')}
          </div>
          <div class="tab-body" id="tabBody"></div>
        </div>
        <aside class="learn-side">
          <h3>Contenu du cours</h3>
          ${c.modules.map((m, mi) => `
            <div class="side-mod-head">Section ${mi + 1} : ${esc(m.title)}<small>${m.lessons.filter(x => Store.isLessonDone(c.id, x.id)).length}/${m.lessons.length} | ${fmtMin(m.lessons.reduce((s, x) => s + x.minutes, 0))}</small></div>
            ${m.lessons.map(x => `<div class="side-lesson ${x.id === l.id ? 'current' : ''}" data-go="${x.id}">
              <input type="checkbox" data-lid="${x.id}" ${Store.isLessonDone(c.id, x.id) ? 'checked' : ''} title="Terminée">
              <div>${esc(x.title)}<small>▶ ${x.minutes} min</small></div></div>`).join('')}`).join('')}
          <div class="side-mod-head">Consolider</div>
          <div class="side-extra">
            ${c.labs.map(lab => `<a href="#/lab/${c.id}/${lab.id}">${Store.isLabDone(c.id, lab.id) ? '✔' : '🧪'} ${esc(lab.title)}</a>`).join('')}
            <a href="#/quiz/${c.id}">❓ Quiz du cours (${c.quiz.length} questions)</a>
            <a href="#/flashcards/${c.id}">🧠 Flashcards (${c.flashcards.length})</a>
          </div>
        </aside>
      </div>`);

    const player = new LessonPlayer($('#player'), {
      course: c, lesson: l, module: l.module, phaseColor: p.color, nextLesson: next,
      onEnd: () => { if (!Store.isLessonDone(c.id, l.id)) { Store.setLessonDone(c.id, l.id, true); refreshSide(); setDoneBtn(true); toast('Leçon terminée ✓'); } },
      onNext: () => { location.hash = `#/apprendre/${c.id}/${next.id}`; }
    });
    cleanup = () => player.destroy();
    const ua = navigator.userActivation;
    if (Store.setting('autoplay') && ua && ua.hasBeenActive) setTimeout(() => player.play(), 300);

    function setDoneBtn(d) { const b = $('#markDone'); b.textContent = d ? '✓ Terminée' : 'Marquer comme terminée'; b.className = 'btn small ' + (d ? 'ok' : 'secondary'); }
    function refreshSide() {
      $$('.side-lesson input', app).forEach(i => { i.checked = Store.isLessonDone(c.id, i.dataset.lid); });
      const np = courseProgress(c);
      $('.learn-top .progress span').style.width = np.pct + '%';
      $('.learn-top .prog span:last-child').textContent = `${np.done}/${np.total} leçons`;
    }
    $('#markDone').addEventListener('click', () => { const d = !Store.isLessonDone(c.id, l.id); Store.setLessonDone(c.id, l.id, d); setDoneBtn(d); refreshSide(); });
    $$('.side-lesson', app).forEach(el => el.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT') { Store.setLessonDone(c.id, e.target.dataset.lid, e.target.checked); if (e.target.dataset.lid === l.id) setDoneBtn(e.target.checked); refreshSide(); return; }
      location.hash = `#/apprendre/${c.id}/${el.dataset.go}`;
    }));

    const renderTab = k => {
      $$('.tab', app).forEach(t => t.classList.toggle('active', t.dataset.tab === k));
      const body = $('#tabBody');
      if (k === 'theorie') {
        body.innerHTML = `<div class="theory">
          ${l.intro ? `<p class="muted">${md(l.intro)}</p>` : ''}
          ${l.sections.map(s => `<h2>${md(s.h)}</h2>${s.p ? `<p>${md(s.p)}</p>` : ''}${(s.bullets || []).length ? `<ul>${s.bullets.map(b => `<li>${md(b)}</li>`).join('')}</ul>` : ''}${U.codeBlock(s.code)}${s.note ? `<div class="callout">${md(s.note)}</div>` : ''}`).join('')}
        </div>`;
      } else if (k === 'points') {
        body.innerHTML = (l.keypoints || []).length ? `<ul class="keypoints">${l.keypoints.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : `<p class="muted">Pas de points clés pour cette leçon.</p>`;
      } else if (k === 'notes') {
        body.innerHTML = `<p class="muted small">Vos notes sont enregistrées automatiquement dans ce navigateur. Retrouvez-les toutes dans <a href="#/notes">Mes notes</a>.</p>
          <textarea id="noteArea" placeholder="Écrivez ici ce que vous retenez, vos questions, vos commandes favorites…">${esc(Store.note(c.id, l.id))}</textarea>
          <div class="muted small" id="noteSaved"></div>`;
        const ta = $('#noteArea');
        ta.addEventListener('input', () => { Store.setNote(c.id, l.id, ta.value); $('#noteSaved').textContent = 'Enregistré ✓ ' + new Date().toLocaleTimeString('fr-FR'); });
      } else if (k === 'videos') {
        renderVideosTab(body, c, l);
      } else if (k === 'pratique') {
        body.innerHTML = `
          ${l.practice ? `<h2>Exercice rapide</h2><div class="callout">${md(l.practice)}</div>` : ''}
          <h2>Labs du cours</h2>
          ${c.labs.length ? c.labs.map(lab => `<a class="search-hit" href="#/lab/${c.id}/${lab.id}"><b>${Store.isLabDone(c.id, lab.id) ? '✔' : '🧪'} ${esc(lab.title)}</b><div class="muted small">${esc(lab.goal)}</div></a>`).join('') : '<p class="muted">Aucun lab pour ce cours.</p>'}
          <h2 style="margin-top:24px">S'auto-évaluer</h2>
          <div class="btn-row"><a class="btn" href="#/quiz/${c.id}">❓ Quiz du cours</a><a class="btn ghost" href="#/flashcards/${c.id}">🧠 Flashcards</a></div>`;
      }
    };
    $$('.tab', app).forEach(t => t.addEventListener('click', () => renderTab(t.dataset.tab)));
    renderTab(tab || 'theorie');
  }

  function youtubeId(url) {
    const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function renderVideosTab(body, c, l) {
    const key = c.id + '/' + l.id;
    const url = Store.videoUrl(c.id, l.id);
    const q = encodeURIComponent(`${c.searchTerm || c.title} ${l.title}`);
    const qEn = encodeURIComponent(`${c.searchTermEn || c.searchTerm || c.title} ${l.searchEn || l.title} tutorial`);
    const yt = url && youtubeId(url);
    body.innerHTML = `
      <h2>Ma vidéo pour cette leçon</h2>
      <p class="muted small">Ajoutez une vidéo externe (YouTube, cours en ligne) ou un fichier vidéo de votre ordinateur : elle sera rattachée à cette leçon et conservée dans ce navigateur.</p>
      <div id="myVideo">${yt ? `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe></div>` : url ? `<p>🔗 <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></p>` : ''}</div>
      <div class="form-row">
        <input type="url" id="vUrl" placeholder="https://www.youtube.com/watch?v=…" value="${esc(url)}" style="flex:1;min-width:240px">
        <button class="btn small" id="vSave">Enregistrer le lien</button>
        ${url ? '<button class="btn ghost small" id="vDel">Retirer</button>' : ''}
      </div>
      <div class="form-row">
        <label class="btn ghost small" style="min-width:0">📁 Choisir un fichier vidéo local<input type="file" id="vFile" accept="video/*" hidden></label>
        <span class="muted small" id="vFileInfo"></span>
      </div>
      <div id="localVideo"></div>

      <h2 style="margin-top:26px">Trouver des vidéos complémentaires</h2>
      <ul class="link-list">
        <li>▶ <a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">YouTube (FR) : « ${esc(c.searchTerm || c.title)} ${esc(l.title)} »</a></li>
        <li>▶ <a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${qEn}">YouTube (EN) : tutoriels en anglais</a></li>
        <li>🎓 <a target="_blank" rel="noopener" href="https://www.udemy.com/courses/search/?q=${encodeURIComponent(c.searchTermEn || c.title)}">Cours Udemy correspondants</a></li>
      </ul>
      ${(c.resources || []).length ? `<h2 style="margin-top:26px">Documentation officielle</h2><ul class="link-list">${c.resources.map(r => `<li>📚 <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a></li>`).join('')}</ul>` : ''}`;
    $('#vSave').addEventListener('click', () => { Store.setVideoUrl(c.id, l.id, $('#vUrl').value.trim()); toast('Lien enregistré'); renderVideosTab(body, c, l); });
    const del = $('#vDel'); if (del) del.addEventListener('click', () => { Store.setVideoUrl(c.id, l.id, ''); renderVideosTab(body, c, l); });
    let objUrl = null;
    const showLocal = blob => {
      if (objUrl) URL.revokeObjectURL(objUrl);
      if (!blob) { $('#localVideo').innerHTML = ''; return; }
      objUrl = URL.createObjectURL(blob);
      $('#localVideo').innerHTML = `<div class="video-embed"><video controls src="${objUrl}"></video></div><button class="btn ghost small" id="vFileDel">Retirer le fichier</button>`;
      $('#vFileInfo').textContent = (blob.name || 'Vidéo locale') + ' · ' + Math.round(blob.size / 1048576) + ' Mo';
      $('#vFileDel').addEventListener('click', async () => { await VideoDB.del(key); $('#vFileInfo').textContent = ''; showLocal(null); });
    };
    VideoDB.get(key).then(showLocal).catch(() => {});
    $('#vFile').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      try { await VideoDB.put(key, f); showLocal(f); toast('Vidéo enregistrée localement'); }
      catch (err) { toast('Impossible d\'enregistrer ce fichier (quota navigateur ?)'); }
    });
  }

  /* ---------- Lab ---------- */
  function viewLab(cid, labId) {
    const c = byId[cid]; if (!c) return notFound();
    const lab = c.labs.find(x => x.id === labId); if (!lab) return notFound();
    const st = Store.labState(c.id, lab.id);
    setView('');   // termine proprement la vue précédente (ex. lecteur vidéo) avant les re-rendus internes
    const render = () => {
      const n = lab.steps.filter((_, i) => st.steps[i]).length;
      const pct = Math.round(100 * n / lab.steps.length);
      setView(`
        <div class="container" style="max-width:900px;--phase:${phaseOf(c).color}">
          <div class="crumbs muted small"><a href="#/cours/${c.id}">${c.icon} ${esc(c.title)}</a> › Travaux pratiques</div>
          <h1>🧪 ${esc(lab.title)}</h1>
          <p class="muted">${md(lab.goal)}</p>
          <div class="meta" style="margin-bottom:12px"><span>⏱ ~${lab.minutes || 30} min</span><span>${lab.steps.length} étapes</span>${lab.env ? `<span>🖥 ${esc(lab.env)}</span>` : ''}</div>
          ${lab.warning ? `<div class="callout warn">${md(lab.warning)}</div>` : ''}
          ${progressBar(pct, true)}<div class="progress-label"><span>${n}/${lab.steps.length} étapes</span><span>${pct}%</span></div>
          <div style="margin-top:18px">
            ${lab.steps.map((s, i) => `
              <div class="lab-step ${st.steps[i] ? 'done' : ''}">
                <input type="checkbox" data-i="${i}" ${st.steps[i] ? 'checked' : ''}>
                <div class="content"><span class="n">Étape ${i + 1}</span> — ${md(s.t)}
                  ${s.cmd ? U.codeBlock({ lang: s.lang || 'bash', src: s.cmd }) : ''}
                  ${s.hint ? `<details class="hint"><summary>💡 Indice</summary><p>${md(s.hint)}</p></details>` : ''}
                  ${s.check ? `<div class="muted small">✅ Vérification : ${md(s.check)}</div>` : ''}
                </div>
              </div>`).join('')}
          </div>
          ${lab.solution ? `<details class="hint card" style="margin-top:12px"><summary>🔓 Afficher la solution complète</summary>${U.codeBlock(lab.solution)}</details>` : ''}
          ${lab.cleanup ? `<div class="callout" style="margin-top:12px">🧹 <b>Nettoyage :</b> ${md(lab.cleanup)}</div>` : ''}
          <div class="btn-row" style="margin-top:20px">
            <button class="btn ${st.done ? 'ok' : ''}" id="labDone">${st.done ? '✓ Lab terminé' : 'Valider le lab'}</button>
            <a class="btn ghost" href="#/cours/${c.id}">Retour au cours</a>
          </div>
        </div>`, { keepScroll: true, inner: true });
      $$('.lab-step input', app).forEach(i => i.addEventListener('change', () => { st.steps[i.dataset.i] = i.checked; Store.save(); render(); }));
      $('#labDone').addEventListener('click', () => { st.done = st.done ? null : Date.now(); Store.save(); if (st.done) toast('Bravo, lab validé !'); render(); });
    };
    render();
    window.scrollTo(0, 0);
  }

  /* ---------- Quiz ---------- */
  function viewQuiz(cid) {
    const c = byId[cid]; if (!c) return notFound();
    const hist = Store.quizResults(c.id);
    const isCert = !!c.exam;
    setView(`
      <div class="container quiz-wrap">
        <div class="crumbs muted small"><a href="#/cours/${c.id}">${c.icon} ${esc(c.title)}</a> › Quiz</div>
        <h1>❓ Quiz — ${esc(c.title)}</h1>
        <p class="muted">${c.quiz.length} questions${isCert ? ` inspirées du format de l'examen ${esc(c.code)} (${esc(c.exam.questions || '')}, ${esc(c.exam.duration || '')}).` : '.'} Les propositions sont mélangées à chaque tentative.</p>
        <div class="grid stats">
          <div class="card"><h3>🎓 Mode entraînement</h3><p class="muted small">Correction immédiate et explication après chaque question.</p><button class="btn block" data-mode="train">Commencer</button></div>
          <div class="card"><h3>⏱ Mode examen</h3><p class="muted small">Chronomètre (≈ 1 min 30 / question), correction à la fin, seuil de réussite 72 %.</p><button class="btn secondary block" data-mode="exam">Commencer</button></div>
        </div>
        ${hist.length ? `<div class="section-title"><h2>Historique</h2></div>
          <table class="list"><tr><th>Date</th><th>Mode</th><th>Score</th></tr>
          ${hist.slice().reverse().slice(0, 10).map(r => `<tr><td>${fmtDate(r.date)}</td><td>${r.mode === 'exam' ? 'Examen' : 'Entraînement'}</td><td><b>${Math.round(100 * r.score / r.total)}%</b> (${r.score}/${r.total})</td></tr>`).join('')}</table>` : ''}
      </div>`);
    $$('[data-mode]', app).forEach(b => b.addEventListener('click', () => runQuiz(c, b.dataset.mode)));
  }

  function runQuiz(c, mode) {
    const qs = U.shuffle(c.quiz).map(q => {
      const order = U.shuffle(q.options.map((_, i) => i));
      return { q: q.q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer), explain: q.explain };
    });
    const answers = new Array(qs.length).fill(null);
    let i = 0;
    let deadline = mode === 'exam' ? Date.now() + qs.length * 90000 : null;
    let tick = null;

    const finish = () => {
      clearInterval(tick);
      const score = qs.reduce((s, q, k) => s + (answers[k] === q.answer ? 1 : 0), 0);
      const pct = Math.round(100 * score / qs.length);
      Store.addQuizResult(c.id, { date: Date.now(), score, total: qs.length, mode });
      const ok = pct >= 72;
      setView(`
        <div class="container quiz-wrap">
          <div class="card" style="text-align:center">
            <div class="score-ring" style="background: conic-gradient(${ok ? 'var(--ok)' : 'var(--bad)'} ${pct * 3.6}deg, var(--surface-2) 0)"><div>${pct}%</div></div>
            <h2>${ok ? '🎉 Réussi !' : '💪 Encore un effort'}</h2>
            <p class="muted">${score}/${qs.length} bonnes réponses · seuil conseillé : 72 %${pct < 72 ? ' — revoyez les explications ci-dessous puis les flashcards.' : ''}</p>
            <div class="btn-row" style="justify-content:center"><button class="btn" id="again">Recommencer</button><a class="btn ghost" href="#/flashcards/${c.id}">🧠 Réviser les flashcards</a><a class="btn ghost" href="#/cours/${c.id}">Retour au cours</a></div>
          </div>
          <div class="section-title"><h2>Correction détaillée</h2></div>
          ${qs.map((q, k) => `<div class="review-item ${answers[k] === q.answer ? 'ok' : 'ko'}">
            <b>${k + 1}. ${md(q.q)}</b>
            <div class="small" style="margin-top:6px">${answers[k] === q.answer ? '✅' : '❌'} Votre réponse : ${answers[k] == null ? '<i>aucune</i>' : md(q.options[answers[k]])}</div>
            ${answers[k] !== q.answer ? `<div class="small">✔ Bonne réponse : <b>${md(q.options[q.answer])}</b></div>` : ''}
            ${q.explain ? `<div class="explain">${md(q.explain)}</div>` : ''}
          </div>`).join('')}
        </div>`);
      $('#again').addEventListener('click', () => runQuiz(c, mode));
    };

    const render = () => {
      const q = qs[i];
      const answered = answers[i] != null;
      const reveal = mode === 'train' && answered;
      setView(`
        <div class="container quiz-wrap">
          <div class="q-head"><span>${c.icon} ${esc(c.title)} · ${mode === 'exam' ? 'Examen' : 'Entraînement'}</span><span id="timer"></span><span>Question ${i + 1}/${qs.length}</span></div>
          ${progressBar(Math.round(100 * i / qs.length))}
          <div class="card" style="margin-top:14px">
            <div class="q-text">${md(q.q)}</div>
            ${q.options.map((o, k) => {
              let cls = '';
              if (reveal) cls = k === q.answer ? 'correct' : (k === answers[i] ? 'wrong' : '');
              else if (answers[i] === k) cls = 'selected';
              return `<button class="opt ${cls}" data-k="${k}"><span class="letter">${'ABCDEF'[k]}</span><span>${md(o)}</span></button>`;
            }).join('')}
            ${reveal && q.explain ? `<div class="explain">${answers[i] === q.answer ? '✅ <b>Correct.</b> ' : '❌ <b>Incorrect.</b> '}${md(q.explain)}</div>` : ''}
            <div class="btn-row" style="justify-content:space-between;margin-top:10px">
              <button class="btn ghost" id="prevQ" ${i === 0 ? 'disabled' : ''}>◀ Précédente</button>
              ${i < qs.length - 1 ? `<button class="btn" id="nextQ" ${mode === 'train' && !answered ? 'disabled' : ''}>Suivante ▶</button>` : `<button class="btn ok" id="endQ">Terminer ✓</button>`}
            </div>
          </div>
          <p class="muted small" style="text-align:center">Raccourcis : touches <kbd>A</kbd>–<kbd>D</kbd> pour répondre, <kbd>Entrée</kbd> pour continuer.</p>
        </div>`, { keepScroll: true, inner: true });
      $$('.opt', app).forEach(b => b.addEventListener('click', () => {
        if (mode === 'train' && answered) return;
        answers[i] = Number(b.dataset.k); render();
      }));
      $('#prevQ').addEventListener('click', () => { i--; render(); });
      const nx = $('#nextQ'); if (nx) nx.addEventListener('click', () => { i++; render(); });
      const en = $('#endQ'); if (en) en.addEventListener('click', () => {
        const missing = answers.filter(a => a == null).length;
        if (missing && !confirm(`${missing} question(s) sans réponse. Terminer quand même ?`)) return;
        finish();
      });
      updTimer();
    };
    const updTimer = () => {
      const t = $('#timer'); if (!t || !deadline) return;
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      t.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      if (s === 0) finish();
    };
    if (deadline) tick = setInterval(updTimer, 1000);
    const onKey = e => {
      if (!qs[i] || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const k = 'abcdef'.indexOf(e.key.toLowerCase());
      if (k >= 0 && k < qs[i].options.length) { const b = $$('.opt', app)[k]; if (b) b.click(); }
      else if (e.key === 'Enter') { const b = $('#nextQ') || $('#endQ'); if (b && !b.disabled) b.click(); }
    };
    document.addEventListener('keydown', onKey);
    render();
    cleanup = () => { clearInterval(tick); document.removeEventListener('keydown', onKey); };
    window.scrollTo(0, 0);
  }

  /* ---------- Flashcards ---------- */
  function viewRevisions() {
    const due = dueCards();
    const rows = A.courses.map(c => {
      const keys = c.flashcards.map((_, i) => c.id + '#' + i);
      const seen = keys.filter(k => Store.card(k));
      const mastered = seen.filter(k => Store.card(k).box >= 5).length;
      const d = keys.filter(k => Store.isDue(k)).length;
      return { c, total: keys.length, seen: seen.length, mastered, due: d };
    });
    const boxes = [0, 1, 2, 3, 4, 5, 6].map(b => Object.values(Store.state.cards).filter(x => x.box === b).length);
    const maxB = Math.max(1, ...boxes);
    setView(`
      <div class="container">
        <h1>🧠 Révisions — mémoriser par cœur</h1>
        <p class="muted">Système de Leitner : chaque carte réussie monte d'une boîte et revient de plus en plus tard (1, 2, 4, 8, 16, 32 jours). Une carte ratée redescend en boîte 1. 10 minutes par jour suffisent.</p>
        <div class="grid stats">
          <div class="card stat"><div class="v">${due.length}</div><div class="l">Cartes dues aujourd'hui</div>
            <button class="btn block" style="margin-top:10px" id="revAll" ${due.length ? '' : 'disabled'}>Réviser maintenant</button></div>
          <div class="card stat"><div class="v">${Object.keys(Store.state.cards).length}</div><div class="l">Cartes étudiées / ${A.courses.reduce((s, c) => s + c.flashcards.length, 0)}</div></div>
          <div class="card stat"><div class="v">${Object.values(Store.state.cards).filter(x => x.box >= 5).length}</div><div class="l">Cartes maîtrisées (boîte ≥ 5)</div></div>
          <div class="card stat"><div class="l">Répartition par boîte (1 → 6)</div><div class="boxes" style="margin-top:8px">${boxes.slice(1).map(b => `<span style="height:${Math.max(4, 100 * b / maxB)}%" title="${b} cartes"></span>`).join('')}</div></div>
        </div>
        <div class="section-title"><h2>Par formation</h2></div>
        <table class="list">
          <tr><th>Formation</th><th>Étudiées</th><th>Maîtrisées</th><th>Dues</th><th></th></tr>
          ${rows.map(r => `<tr><td>${r.c.icon} <a href="#/cours/${r.c.id}">${esc(r.c.title)}</a> <span class="muted small">· P${r.c.phase}</span></td><td>${r.seen}/${r.total}</td><td>${r.mastered}</td><td>${r.due ? `<b>${r.due}</b>` : '0'}</td><td><a class="btn small ${r.due ? '' : 'ghost'}" href="#/flashcards/${r.c.id}">${r.seen < r.total || r.due ? 'Étudier' : 'Revoir'}</a></td></tr>`).join('')}
        </table>
      </div>`);
    const b = $('#revAll'); if (b) b.addEventListener('click', () => runCards(due, 'Révision du jour', '#/revisions'));
  }

  function viewFlashcards(cid) {
    const c = byId[cid]; if (!c) return notFound();
    const keys = c.flashcards.map((_, i) => c.id + '#' + i);
    const due = keys.filter(k => Store.isDue(k));
    const fresh = keys.filter(k => !Store.card(k)).slice(0, Store.setting('newPerSession') || 10);
    const queue = due.concat(fresh);
    setView(`
      <div class="container" style="max-width:900px">
        <div class="crumbs muted small"><a href="#/cours/${c.id}">${c.icon} ${esc(c.title)}</a> › Flashcards</div>
        <h1>🧠 Flashcards — ${esc(c.title)}</h1>
        <div class="grid stats">
          <div class="card stat"><div class="v">${due.length}</div><div class="l">À réviser</div></div>
          <div class="card stat"><div class="v">${keys.filter(k => !Store.card(k)).length}</div><div class="l">Nouvelles</div></div>
          <div class="card stat"><div class="v">${keys.filter(k => Store.card(k) && Store.card(k).box >= 5).length}/${keys.length}</div><div class="l">Maîtrisées</div></div>
        </div>
        <div class="btn-row" style="margin:20px 0">
          <button class="btn" id="go" ${queue.length ? '' : 'disabled'}>▶ Session : ${due.length} à revoir + ${fresh.length} nouvelles</button>
          <button class="btn ghost" id="all">Parcourir toutes les cartes (${keys.length})</button>
        </div>
        ${!queue.length ? '<div class="callout">🎉 Rien à réviser pour le moment sur ce cours. Revenez demain, ou parcourez toutes les cartes librement.</div>' : ''}
        <div class="section-title"><h2>Liste des cartes</h2></div>
        <table class="list"><tr><th>Question</th><th>Réponse</th><th>Boîte</th></tr>
          ${c.flashcards.map(([f, b], i) => { const s = Store.card(c.id + '#' + i); return `<tr><td>${md(f)}</td><td class="muted">${md(b)}</td><td>${s ? s.box : '—'}</td></tr>`; }).join('')}
        </table>
      </div>`);
    $('#go').addEventListener('click', () => runCards(queue, c.title, '#/flashcards/' + c.id));
    $('#all').addEventListener('click', () => runCards(U.shuffle(keys), c.title + ' (toutes)', '#/flashcards/' + c.id));
  }

  function cardContent(key) {
    const [cid, i] = key.split('#');
    const c = byId[cid];
    return c && c.flashcards[i] ? { c, front: c.flashcards[i][0], back: c.flashcards[i][1] } : null;
  }
  function runCards(queue, title, back) {
    queue = queue.filter(cardContent);
    let pos = 0, flipped = false, reviewed = 0;
    const render = () => {
      if (pos >= queue.length) {
        setView(`<div class="container" style="max-width:700px;text-align:center"><div class="card"><div style="font-size:50px">🏁</div><h2>Session terminée</h2><p class="muted">${reviewed} cartes révisées. Les cartes réussies reviendront plus tard, au bon moment pour les ancrer durablement.</p><a class="btn" href="${back}">Retour</a></div></div>`);
        return;
      }
      const k = queue[pos], cc = cardContent(k);
      const st = Store.card(k);
      setView(`
        <div class="container">
          <div class="q-head" style="max-width:700px;margin:0 auto 12px"><span>${cc.c.icon} ${esc(title)}</span><span>${pos + 1}/${queue.length}${st ? ` · boîte ${st.box}` : ' · nouvelle'}</span></div>
          <div class="fc-stage">
            <div class="fc ${flipped ? 'flipped' : ''}" id="fc">
              <div class="fc-face"><span class="lbl">Question · ${esc(cc.c.title)}</span><div class="txt">${md(cc.front)}</div><div class="muted small" style="position:absolute;bottom:14px">Cliquez ou <kbd>Espace</kbd> pour retourner</div></div>
              <div class="fc-face fc-back"><span class="lbl">Réponse</span><div class="txt">${md(cc.back)}</div></div>
            </div>
          </div>
          <div class="fc-rate ${flipped ? '' : 'hidden'}">
            <button class="r1" data-r="1">✗ Je ne savais pas <kbd>1</kbd></button>
            <button class="r2" data-r="2">~ Difficile <kbd>2</kbd></button>
            <button class="r3" data-r="3">✓ Je savais <kbd>3</kbd></button>
          </div>
          <p class="muted small" style="text-align:center;margin-top:16px"><a href="${back}">Quitter la session</a></p>
        </div>`, { keepScroll: true, inner: true });
      $('#fc').addEventListener('click', flip);
      $$('.fc-rate button', app).forEach(b => b.addEventListener('click', () => rate(Number(b.dataset.r))));
    };
    const flip = () => { flipped = !flipped; $('#fc').classList.toggle('flipped', flipped); $('.fc-rate').classList.toggle('hidden', !flipped); };
    const rate = r => {
      const k = queue[pos];
      Store.rateCard(k, r);
      reviewed++;
      if (r === 1) queue.push(k); // revient en fin de session
      pos++; flipped = false; render();
    };
    const onKey = e => {
      if (e.code === 'Space') { e.preventDefault(); if ($('#fc')) flip(); }
      else if (flipped && ['1', '2', '3'].includes(e.key)) rate(Number(e.key));
    };
    document.addEventListener('keydown', onKey);
    render();
    cleanup = () => document.removeEventListener('keydown', onKey);
  }

  /* ---------- Roadmap (reprend la maquette fournie) ---------- */
  function viewRoadmap(n) {
    const p = A.phases[(Number(n) || currentPhase().n) - 1];
    const st = phaseStats(p);
    const item = c => {
      const done = Store.isAcquired(c.id);
      const pr = courseProgress(c);
      return `<div class="rm-item ${done ? 'done' : ''}">
        <button class="rm-check" data-id="${c.id}" title="${done ? 'Décocher' : 'Marquer comme acquis'}">${done ? '✓' : ''}</button>
        <div style="flex:1;min-width:0">
          <h4>${c.kind === 'tech' ? c.icon + ' ' : ''}${esc(c.title)}</h4>
          ${courseTags(c)}
          ${courseMeta(c)}
          <details><summary>Détails</summary>
            <p class="small">${md(c.subtitle)}</p>
            <ul>${c.outcomes.slice(0, 5).map(o => `<li>${md(o)}</li>`).join('')}</ul>
            <div class="small muted">Progression des leçons : ${pr.done}/${pr.total}</div>
            <a class="btn small" href="#/cours/${c.id}" style="margin-top:8px">Ouvrir la formation ›</a>
          </details>
        </div></div>`;
    };
    setView(`
      <div class="rm-tabs">${A.phases.map(x => `<a class="rm-tab ${x.n === p.n ? 'active' : ''}" style="--c:${x.color}" href="#/roadmap/${x.n}">Phase ${x.n} · ${esc(x.title)}</a>`).join('')}</div>
      <div class="rm-wrap" style="--c:${p.color}">
        <div class="rm-head">
          <h2>${esc(p.title)}</h2>
          <div class="muted small">📅 ${esc(p.period)}</div>
          <p class="small">${esc(p.summary)}</p>
          <div style="display:flex;align-items:center;gap:10px">${`<div style="flex:1">${progressBar(Math.round(100 * st.acquired / st.courses.length))}</div>`}<span class="small">${st.acquired}/${st.courses.length}</span></div>
        </div>
        <div class="rm-sec">Certifications</div>
        ${st.courses.filter(c => c.kind === 'cert').map(item).join('')}
        <div class="rm-sec">Technologies</div>
        ${st.courses.filter(c => c.kind === 'tech').map(item).join('')}
        <div class="milestone">🏁 <b>Milestone</b> — ${esc(p.milestone)}</div>
        <p class="muted small" style="text-align:center;margin-top:30px">Votre progression est enregistrée automatiquement dans ce navigateur.</p>
      </div>`);
    $$('.rm-check', app).forEach(b => b.addEventListener('click', () => { Store.setAcquired(b.dataset.id, !Store.isAcquired(b.dataset.id)); viewRoadmap(p.n); }));
  }

  /* ---------- Notes ---------- */
  function viewNotes() {
    const items = [];
    A.courses.forEach(c => c.lessons.forEach(l => { const n = Store.note(c.id, l.id); if (n) items.push({ c, l, n }); }));
    setView(`
      <div class="container" style="max-width:900px">
        <h1>📝 Mes notes</h1>
        <div class="btn-row" style="margin-bottom:18px"><button class="btn ghost small" id="exportNotes" ${items.length ? '' : 'disabled'}>⬇ Exporter en Markdown</button></div>
        ${items.length ? items.map(x => `<div class="card note-card"><div class="muted small">${x.c.icon} ${esc(x.c.title)} · ${esc(x.l.module)}</div><a href="#/apprendre/${x.c.id}/${x.l.id}"><b>${esc(x.l.title)}</b></a><pre>${esc(x.n)}</pre></div>`).join('')
          : `<div class="empty"><div class="e-icon">📝</div>Aucune note pour l'instant. Ouvrez une leçon et utilisez l'onglet « Notes » sous la vidéo.</div>`}
      </div>`);
    const b = $('#exportNotes');
    if (b) b.addEventListener('click', () => {
      let out = '# Mes notes — ArchiPath Academy\n';
      let cur = null;
      items.forEach(x => { if (cur !== x.c.id) { out += `\n## ${x.c.title}\n`; cur = x.c.id; } out += `\n### ${x.l.title}\n\n${x.n}\n`; });
      U.download('mes-notes.md', out, 'text/markdown');
    });
  }

  /* ---------- Recherche ---------- */
  function viewSearch(q) {
    const nq = U.normalize(q).trim();
    const hl = s => { const t = esc(s); if (!nq) return t; const i = U.normalize(s).indexOf(nq); return i < 0 ? t : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + nq.length)) + '</mark>' + esc(s.slice(i + nq.length)); };
    const courses = A.courses.filter(c => U.normalize([c.title, c.subtitle, c.code, c.category, c.vendor, c.description].join(' ')).includes(nq));
    const lessons = [];
    A.courses.forEach(c => c.lessons.forEach(l => {
      const text = [l.title, ...l.sections.map(s => [s.h, s.p, ...(s.bullets || [])].join(' '))].join(' ');
      const nt = U.normalize(text);
      const i = nt.indexOf(nq);
      if (nq && i >= 0) lessons.push({ c, l, snippet: text.slice(Math.max(0, i - 60), i + 100) });
    }));
    const cards = [];
    A.courses.forEach(c => c.flashcards.forEach(([f, b]) => { if (nq && U.normalize(f + ' ' + b).includes(nq)) cards.push({ c, f, b }); }));
    setView(`
      <div class="container" style="max-width:960px">
        <h1>Résultats pour « ${esc(q)} »</h1>
        ${courses.length ? `<div class="section-title"><h2>Formations (${courses.length})</h2></div><div class="grid courses">${courses.map(courseCard).join('')}</div>` : ''}
        ${lessons.length ? `<div class="section-title"><h2>Leçons (${lessons.length})</h2></div>${lessons.slice(0, 60).map(x => `<a class="search-hit" href="#/apprendre/${x.c.id}/${x.l.id}"><div class="muted small">${x.c.icon} ${esc(x.c.title)}</div><b>${hl(x.l.title)}</b><div class="small muted">…${hl(U.plain(x.snippet))}…</div></a>`).join('')}` : ''}
        ${cards.length ? `<div class="section-title"><h2>Flashcards (${cards.length})</h2></div>${cards.slice(0, 40).map(x => `<a class="search-hit" href="#/flashcards/${x.c.id}"><div class="muted small">${x.c.icon} ${esc(x.c.title)}</div><b>${hl(x.f)}</b><div class="small">${hl(x.b)}</div></a>`).join('')}` : ''}
        ${!courses.length && !lessons.length && !cards.length ? `<div class="empty"><div class="e-icon">🔍</div>Aucun résultat. Essayez « VPC », « pipeline », « pod », « IAM »…</div>` : ''}
      </div>`);
  }

  /* ---------- Paramètres ---------- */
  function viewSettings() {
    const synth = window.speechSynthesis;
    const voices = synth ? synth.getVoices() : [];
    const fr = voices.filter(v => /^fr/i.test(v.lang));
    const list = fr.length ? fr : voices;
    const cur = Store.setting('voice');
    const auto = LessonPlayer.pickVoice('');
    setView(`
      <div class="container" style="max-width:820px">
        <h1>⚙️ Paramètres</h1>
        <div class="box">
          <h2>Lecteur vidéo</h2>
          ${LessonPlayer.ttsAvailable ? '' : '<div class="callout warn">La synthèse vocale n\'est pas disponible dans ce navigateur : les vidéos défilent en mode silencieux avec sous-titres.</div>'}
          <div class="form-row"><label>Voix de narration</label>
            <select id="sVoice"><option value="">Automatique${auto ? ' (' + esc(auto.name) + ')' : ''}</option>${list.map(v => `<option ${v.name === cur ? 'selected' : ''} value="${esc(v.name)}">${esc(v.name)} — ${esc(v.lang)}</option>`).join('')}</select>
            <button class="btn ghost small" id="sTest">▶ Tester</button></div>
          ${!fr.length && LessonPlayer.ttsAvailable ? '<p class="muted small">Aucune voix française détectée. Sous Windows : Paramètres › Heure et langue › Voix › ajouter une voix française. Chrome et Edge proposent aussi des voix en ligne de bonne qualité.</p>' : ''}
          <div class="form-row"><label>Vitesse par défaut</label><select id="sRate">${[0.75, 1, 1.25, 1.5, 1.75, 2].map(r => `<option ${r === Store.setting('rate') ? 'selected' : ''} value="${r}">${r}×</option>`).join('')}</select></div>
          <div class="form-row"><label>Lecture automatique</label><input type="checkbox" id="sAuto" ${Store.setting('autoplay') ? 'checked' : ''}> <span class="muted small">démarre la vidéo à l'ouverture d'une leçon</span></div>
          <div class="form-row"><label>Nouvelles cartes / session</label><select id="sNew">${[5, 10, 15, 20, 30].map(r => `<option ${r === Store.setting('newPerSession') ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        </div>
        <div class="box">
          <h2>Apparence</h2>
          <div class="form-row"><label>Thème</label><select id="sTheme">${[['auto', 'Automatique (système)'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, l]) => `<option value="${v}" ${Store.setting('theme') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        </div>
        <div class="box">
          <h2>Sauvegarde de la progression</h2>
          <p class="muted small">Tout est stocké localement dans ce navigateur (aucun compte, aucun serveur). Exportez régulièrement un fichier de sauvegarde pour changer d'ordinateur ou de navigateur.</p>
          <div class="btn-row">
            <button class="btn" id="sExport">⬇ Exporter ma progression</button>
            <label class="btn ghost">⬆ Importer<input type="file" id="sImport" accept="application/json" hidden></label>
            <button class="btn danger" id="sReset">Tout réinitialiser</button>
          </div>
        </div>
        <div class="box">
          <h2>Raccourcis clavier</h2>
          <ul>
            <li>Lecteur : <kbd>Espace</kbd> lecture/pause · <kbd>←</kbd> <kbd>→</kbd> diapo précédente/suivante · <kbd>F</kbd> plein écran · <kbd>M</kbd> voix on/off</li>
            <li>Quiz : <kbd>A</kbd>–<kbd>D</kbd> répondre · <kbd>Entrée</kbd> question suivante</li>
            <li>Flashcards : <kbd>Espace</kbd> retourner · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> noter</li>
            <li>Partout : <kbd>/</kbd> rechercher</li>
          </ul>
        </div>
      </div>`);
    $('#sVoice').addEventListener('change', e => Store.setSetting('voice', e.target.value));
    $('#sTest').addEventListener('click', () => {
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance('Bonjour ! Je suis la voix de vos formations. Bon apprentissage sur le cloud.');
      u.lang = 'fr-FR'; const v = LessonPlayer.pickVoice(Store.setting('voice')); if (v) u.voice = v; u.rate = Store.setting('rate');
      synth.speak(u);
    });
    $('#sRate').addEventListener('change', e => Store.setSetting('rate', Number(e.target.value)));
    $('#sAuto').addEventListener('change', e => Store.setSetting('autoplay', e.target.checked));
    $('#sNew').addEventListener('change', e => Store.setSetting('newPerSession', Number(e.target.value)));
    $('#sTheme').addEventListener('change', e => { Store.setSetting('theme', e.target.value); applyTheme(); });
    $('#sExport').addEventListener('click', () => U.download(`archipath-progression-${new Date().toISOString().slice(0, 10)}.json`, Store.exportJSON()));
    $('#sImport').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { Store.importJSON(t); applyTheme(); toast('Progression importée ✓'); viewSettings(); }).catch(err => toast('Import impossible : ' + err.message));
    });
    $('#sReset').addEventListener('click', () => { if (confirm('Effacer toute la progression, les notes et les cartes ? Cette action est irréversible.')) { Store.reset(); applyTheme(); toast('Progression réinitialisée'); viewSettings(); } });
    if (synth && !voices.length) synth.onvoiceschanged = () => { synth.onvoiceschanged = null; if (location.hash === '#/parametres') viewSettings(); };
  }

  function notFound() {
    setView(`<div class="container"><div class="empty"><div class="e-icon">🧭</div><h2>Page introuvable</h2><a class="btn" href="#/">Retour à l'accueil</a></div></div>`);
  }

  /* ================= Coque : thème, nav, routeur ================= */
  function applyTheme() {
    const t = Store.setting('theme');
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const b = $('#themeBtn'); if (b) b.textContent = dark ? '☀️' : '🌙';
  }
  function updateNav() {
    const hash = location.hash || '#/';
    $$('.nav a[data-nav]').forEach(a => {
      const k = a.dataset.nav;
      a.classList.toggle('active', k === '/' ? (hash === '#/' || hash === '#') : hash.startsWith('#' + k));
    });
    const n = dueCards().length;
    $('#dueBadge').textContent = n;
    $('#dueBadge').classList.toggle('hidden', !n);
    $('#nav').classList.remove('open');
  }

  function route() {
    const hash = location.hash || '#/';
    const [path, qs] = hash.slice(1).split('?');
    const params = new URLSearchParams(qs || '');
    const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
    switch (seg[0]) {
      case undefined: return viewHome();
      case 'catalogue': return viewCatalog(params);
      case 'cours': return viewCourse(seg[1]);
      case 'apprendre': return viewLearn(seg[1], seg[2], params.get('tab'));
      case 'lab': return viewLab(seg[1], seg[2]);
      case 'quiz': return viewQuiz(seg[1]);
      case 'revisions': return viewRevisions();
      case 'flashcards': return viewFlashcards(seg[1]);
      case 'roadmap': return viewRoadmap(seg[1]);
      case 'notes': return viewNotes();
      case 'parametres': return viewSettings();
      case 'recherche': return viewSearch(params.get('q') || '');
      default: return notFound();
    }
  }

  // Événements globaux
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = $('#searchInput').value.trim();
    if (q) location.hash = '#/recherche?q=' + encodeURIComponent(q);
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); $('#searchInput').focus(); }
  });
  $('#themeBtn').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    Store.setSetting('theme', dark ? 'light' : 'dark');
    applyTheme();
  });
  $('#menuBtn').addEventListener('click', () => $('#nav').classList.toggle('open'));
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  window.addEventListener('hashchange', route);
  applyTheme();
  route();
})();
