/* Utilitaires : échappement, mini-markdown, coloration syntaxique, helpers DOM. */
(function () {
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Markdown en ligne : `code`, **gras**, *italique*
  function md(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  }
  // Texte brut pour la synthèse vocale
  function plain(s) {
    return String(s || '').replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
  }

  const KW = {
    java: 'public private protected class interface enum record extends implements static final void return new if else for while switch case default try catch finally throw throws import package var this super null true false int long boolean String',
    js: 'const let var function return if else for while async await import export from default new class extends this null undefined true false try catch throw typeof of in',
    python: 'def return if elif else for while in import from as class with try except finally raise lambda None True False and or not pass yield async await self',
    bash: 'if then else fi for do done case esac function export echo cd sudo in',
    yaml: 'true false null yes no',
    hcl: 'resource variable output module provider data locals terraform true false null for_each count depends_on',
    sql: 'SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE JOIN ON GROUP BY ORDER AND OR NOT NULL',
    json: 'true false null',
    groovy: 'pipeline agent stages stage steps sh post always success failure environment def when parallel',
    docker: 'FROM RUN COPY ADD WORKDIR ENV EXPOSE CMD ENTRYPOINT ARG USER LABEL HEALTHCHECK AS VOLUME'
  };
  const HASH_COMMENT = new Set(['bash', 'yaml', 'python', 'hcl', 'docker', 'ini', 'text', 'properties', 'conf', 'shell', 'sh']);

  function highlight(src, lang) {
    lang = (lang || 'text').toLowerCase();
    if (['ts', 'tsx', 'jsx', 'javascript', 'typescript', 'node'].includes(lang)) lang = 'js';
    if (lang === 'sh' || lang === 'shell' || lang === 'powershell') lang = 'bash';
    if (lang === 'dockerfile') lang = 'docker';
    if (lang === 'kotlin' || lang === 'csharp' || lang === 'cs') lang = 'java';
    if (lang === 'jenkinsfile') lang = 'groovy';
    const kw = KW[lang] ? new Set(KW[lang].split(' ')) : new Set();
    const comment = HASH_COMMENT.has(lang) ? '#[^\\n]*' : (lang === 'sql' ? '--[^\\n]*' : '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/');
    const re = new RegExp('(' + comment + ')|("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`[^`]*`)|(\\b\\d+(?:\\.\\d+)?\\b)|(@?[A-Za-z_][\\w-]*)', 'g');
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += '<span class="tok-c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tok-s">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="tok-n">' + esc(m[3]) + '</span>';
      else if (m[4]) {
        const w = m[4];
        if (kw.has(w) || (lang === 'sql' && kw.has(w.toUpperCase()))) out += '<span class="tok-k">' + esc(w) + '</span>';
        else if (w[0] === '@') out += '<span class="tok-a">' + esc(w) + '</span>';
        else out += esc(w);
      }
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  function codeBlock(code) {
    if (!code) return '';
    const src = typeof code === 'string' ? code : code.src;
    const lang = typeof code === 'string' ? 'text' : (code.lang || 'text');
    return `<div class="code"><div class="code-head"><span>${esc(lang)}</span><button class="copy" data-copy>Copier</button></div><pre><code>${highlight(src, lang)}</code></pre></div>`;
  }

  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function toast(msg) {
    const el = h(`<div class="toast">${esc(msg)}</div>`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function stars(n) { return '★'.repeat(n || 0); }

  // "~80-100h" → 90 ; "~40h" → 40
  function parseHours(s) {
    const nums = String(s || '').match(/\d+/g);
    if (!nums) return 0;
    return nums.length > 1 ? (Number(nums[0]) + Number(nums[1])) / 2 : Number(nums[0]);
  }
  function parseCost(s) { const m = String(s || '').match(/\d+/); return m ? Number(m[0]) : 0; }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function fmtMin(m) { return m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min'; }
  function fmtDate(ts) { return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type || 'application/json' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function normalize(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  // Copie des blocs de code (délégation globale)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const code = b.closest('.code').querySelector('pre').innerText;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
      .then(() => { b.textContent = 'Copié ✓'; setTimeout(() => (b.textContent = 'Copier'), 1500); })
      .catch(() => toast('Copie impossible : sélectionnez le texte manuellement'));
  });

  window.U = { esc, md, plain, highlight, codeBlock, h, toast, stars, parseHours, parseCost, shuffle, fmtMin, fmtDate, download, normalize };
})();
