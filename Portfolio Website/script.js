(function(){
  var root = document.documentElement;

  // theme toggle (remembers choice per-browser)
  var themeBtn = document.getElementById('themeToggle');
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch(e){}
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  function currentTheme(){
    var attr = root.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (themeBtn){
    themeBtn.addEventListener('click', function(){
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(e){}
    });
  }

  // scrollspy: highlight the nav link for the section in view
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.links a'));
  var sections = links.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function(s){ obs.observe(s); });
  }

  // copy-to-clipboard buttons
  function fallbackCopy(text){
    try{
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }catch(e){}
  }
  document.querySelectorAll('.copy-btn').forEach(function(b){
    b.addEventListener('click', function(){
      var text = b.getAttribute('data-copy');
      var reset = function(){ setTimeout(function(){ b.textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ b.textContent = 'Copied'; reset(); }).catch(function(){ fallbackCopy(text); b.textContent = 'Copied'; reset(); });
      } else { fallbackCopy(text); b.textContent = 'Copied'; reset(); }
    });
  });

  // live demo of the auth project's login flow
  var ids = new Set(['arkadeep08','admin','testuser']);
  var input = document.getElementById('uid');
  var out = document.getElementById('consoleOut');
  var checkBtn = document.getElementById('checkBtn');
  var createBtn = document.getElementById('createBtn');
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function run(action){
    if (!input || !out) return;
    var raw = (input.value || '').trim();
    var id = escapeHtml(raw);
    out.innerHTML = '<span class="warn">sending request…</span>';
    setTimeout(function(){
      if (!raw){
        out.innerHTML = 'POST /users  <span class="err">400</span>\n{\n  "error": "id is required"\n}';
        return;
      }
      if (action === 'check'){
        var exists = ids.has(raw);
        out.innerHTML = 'POST /users/check  <span class="ok">200</span>\n{\n  "id": "'+id+'",\n  "exists": '+exists+'\n}';
      } else {
        if (ids.has(raw)){
          out.innerHTML = 'POST /users  <span class="err">409</span>\n{\n  "error": "id already taken"\n}';
        } else {
          ids.add(raw);
          out.innerHTML = 'POST /users  <span class="ok">201</span>\n{\n  "id": "'+id+'",\n  "created": true\n}';
        }
      }
    }, 350);
  }
  if (checkBtn) checkBtn.addEventListener('click', function(){ run('check'); });
  if (createBtn) createBtn.addEventListener('click', function(){ run('create'); });
  if (input) input.addEventListener('keydown', function(e){ if (e.key === 'Enter') run('check'); });
})();
