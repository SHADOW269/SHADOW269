/* ── Date ── */
const d = new Date();
document.getElementById('nav-date').textContent =
  String(d.getDate()).padStart(2,'0') + ' / ' +
  String(d.getMonth()+1).padStart(2,'0') + ' / ' + d.getFullYear();


/* ═══ DISCORD STATUS JS ═══ */
(function() {
  const USER_ID = '1051180323058237450';
  let _countdown = 30;
  let _timer;

  const STATUS_META = {
    online:  { label: 'ONLINE',  color: '#23a55a', shadow: '0 0 6px rgba(35,165,90,.8)',  dot: '●', dotClass: 'ds-online',  badgeClass: 'dsb-online'  },
    idle:    { label: 'IDLE',    color: '#f0b232', shadow: '0 0 6px rgba(240,178,50,.8)', dot: '◐', dotClass: 'ds-idle',    badgeClass: 'dsb-idle'    },
    dnd:     { label: 'DND',     color: '#f23f43', shadow: '0 0 6px rgba(242,63,67,.8)',  dot: '⊘', dotClass: 'ds-dnd',     badgeClass: 'dsb-dnd'     },
    offline: { label: 'OFFLINE', color: '#80848e', shadow: 'none',                        dot: '○', dotClass: 'ds-offline', badgeClass: 'dsb-offline' },
  };

  const ACT_ICON = { 0:'🎮', 1:'📡', 2:'🎵', 3:'👁', 4:'💬', 5:'🤝' };

  function setNav(status) {
    const m = STATUS_META[status] || STATUS_META['offline'];
    const dot   = document.getElementById('nav-discord-dot');
    const text  = document.getElementById('nav-discord-text');
    const badge = document.getElementById('ndt-badge');
    if (dot)   { dot.style.background = m.color; dot.style.boxShadow = m.shadow; }
    if (text)  { text.textContent = m.label; text.style.color = m.color; }
    if (badge) { badge.textContent = m.dot + ' ' + m.label; badge.className = 'ndt-badge b-' + status; }
  }

  function updateTooltip(userData, acts) {
    const nameEl   = document.getElementById('ndt-name');
    const handleEl = document.getElementById('ndt-handle');
    const avatarEl = document.getElementById('ndt-avatar');

    if (nameEl)   nameEl.textContent   = userData.displayName || 'SHADOW';
    if (handleEl) handleEl.textContent = '@' + (userData.username || 'shadow269');
    if (avatarEl) {
      if (userData.avatarUrl) {
        avatarEl.innerHTML = '<img src="' + userData.avatarUrl + '" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      } else {
        avatarEl.textContent = (userData.displayName || 'S')[0].toUpperCase();
      }
    }

    // Custom status message (type 4)
    const customAct = acts.find(a => a.type === 4);
    const customEl  = document.getElementById('ndt-custom-status');
    const customTxt = document.getElementById('ndt-custom-text');
    if (customEl && customTxt) {
      if (customAct && customAct.state) {
        const emoji = customAct.emoji ? (customAct.emoji.name || '') + ' ' : '';
        customTxt.textContent = emoji + customAct.state;
        customEl.classList.add('has-content');
      } else {
        customEl.classList.remove('has-content');
      }
    }

    // Activities (all non-custom)
    const ACT_ICON = { 0:'🎮', 1:'📡', 2:'🎵', 3:'👁', 5:'🤝' };
    const mainActs = acts.filter(a => a.type !== 4);
    const listEl   = document.getElementById('ndt-acts-list');
    if (listEl) {
      if (mainActs.length === 0) {
        listEl.innerHTML = '<div class="ndt-no-activity">No current activity</div>';
      } else {
        listEl.innerHTML = mainActs.map(a => {
          const icon   = ACT_ICON[a.type] || '📌';
          const detail = a.details ? '<div class="ndt-act-detail">' + a.details + '</div>' : '';
          const state  = (a.state && a.state !== a.details) ? '<div class="ndt-act-detail">' + a.state + '</div>' : '';
          return '<div class="ndt-act-item">'
            + '<span class="ndt-act-icon">' + icon + '</span>'
            + '<div class="ndt-act-body">'
            + '<div class="ndt-act-name">' + (a.name || 'Unknown') + '</div>'
            + detail + state
            + '</div></div>';
        }).join('');
      }
    }
  }

  function setCardStatus(status) {
    const m = STATUS_META[status] || STATUS_META['offline'];
    const dot   = document.getElementById('dc-status-dot');
    const badge = document.getElementById('dc-status-badge');
    const dotSm = document.getElementById('dc-status-dot-small');
    const txt   = document.getElementById('dc-status-text');
    if (dot)   dot.className = 'discord-status-dot ' + m.dotClass;
    if (badge) badge.className = 'discord-status-badge ' + m.badgeClass;
    if (dotSm) dotSm.textContent = m.dot;
    if (txt)   txt.textContent = m.label;
  }

  function setActivity(acts) {
    const actEl = document.getElementById('dc-activity');
    if (!actEl) return;
    const main = (acts || []).find(a => a.type !== 4) || (acts || [])[0];
    const custom = (acts || []).find(a => a.type === 4);
    if (main) {
      const icon   = ACT_ICON[main.type] || '📌';
      const detail = main.details || '';
      const state  = main.state || '';
      actEl.innerHTML = `
        <span class="da-icon">${icon}</span>
        <div class="da-text">
          <div class="da-name">${main.name || 'Unknown'}</div>
          ${detail ? `<div class="da-detail">${detail}</div>` : ''}
          ${(state && state !== detail) ? `<div class="da-detail" style="opacity:.7">${state}</div>` : ''}
        </div>`;
    } else if (custom && custom.state) {
      actEl.innerHTML = `
        <span class="da-icon">${custom.emoji?.name || '💬'}</span>
        <div class="da-text">
          <div class="da-name" style="font-size:clamp(12px,1vw,16px);color:var(--text2)">${custom.state}</div>
        </div>`;
    } else {
      actEl.innerHTML = `<span class="da-icon">💤</span><div class="da-text"><div class="da-name" style="color:var(--muted);font-family:var(--mono);font-size:13px;letter-spacing:.05em">No current activity</div></div>`;
    }
  }

  function showError(msg) {
    const el = document.getElementById('dc-error');
    if (el) { el.textContent = '⚠ ' + msg; el.style.display = 'block'; }
  }

  function fallback() {
    const dot  = document.getElementById('nav-discord-dot');
    const text = document.getElementById('nav-discord-text');
    if (dot)  { dot.style.background = '#5865F2'; dot.style.boxShadow = '0 0 6px rgba(88,101,242,.7)'; }
    if (text) { text.textContent = 'SHADOW'; text.style.color = '#5865F2'; }
    const badge = document.getElementById('ndt-badge');
    if (badge) { badge.textContent = '○ OFFLINE'; badge.className = 'ndt-badge b-offline'; }
    updateTooltip({ displayName: 'SHADOW', username: 'shadow269', avatarUrl: null }, []);
    setCardStatus('offline');
    setActivity([]);
    const h = document.getElementById('dc-handle');
    if (h) h.textContent = '@shadow269';
    const u = document.getElementById('dc-username');
    if (u) u.textContent = 'SHADOW';
  }

  window.fetchDiscordStatus = async function() {
    clearInterval(_timer);
    _countdown = 30;
    const timerEl = document.getElementById('dc-auto-timer');
    if (timerEl) timerEl.textContent = 'Auto in 30s';
    const errEl = document.getElementById('dc-error');
    if (errEl) errEl.style.display = 'none';

    try {
      const res = await fetch('https://api.lanyard.rest/v1/users/' + USER_ID);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();

      if (!json.success) {
        showError('Not found on Lanyard — join discord.gg/lanyard to enable live status.');
        fallback();
        startTimer();
        return;
      }

      const d    = json.data;
      const user = d.discord_user;

      // Avatar
      const avatarEl = document.getElementById('dc-avatar');
      if (avatarEl) {
        if (user.avatar) {
          avatarEl.innerHTML = '<img src="https://cdn.discordapp.com/avatars/' + USER_ID + '/' + user.avatar + '.png?size=128" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
        } else {
          const n = user.global_name || user.username || 'S';
          avatarEl.textContent = n[0].toUpperCase();
        }
      }

      // Username / handle
      const displayName = user.global_name || user.username || 'SHADOW';
      const usernameEl = document.getElementById('dc-username');
      if (usernameEl) usernameEl.textContent = displayName;
      const handleEl = document.getElementById('dc-handle');
      if (handleEl) handleEl.textContent = '@' + (user.username || 'shadow269');

      // Status (card + nav)
      const status = d.discord_status || 'offline';
      setCardStatus(status);
      setNav(status);

      // Activity
      const acts = d.activities || [];
      setActivity(acts);

      // Update tooltip (avatar, name, custom status, all activities)
      updateTooltip({
        displayName: user.global_name || user.username || 'SHADOW',
        username:    user.username || 'shadow269',
        avatarUrl:   user.avatar ? 'https://cdn.discordapp.com/avatars/' + USER_ID + '/' + user.avatar + '.png?size=80' : null,
      }, acts);

    } catch(e) {
      showError('Could not reach Lanyard API.');
      fallback();
    }

    startTimer();
  };

  function startTimer() {
    _timer = setInterval(() => {
      _countdown--;
      const el = document.getElementById('dc-auto-timer');
      if (el) el.textContent = 'Auto in ' + _countdown + 's';
      if (_countdown <= 0) { clearInterval(_timer); window.fetchDiscordStatus(); }
    }, 1000);
  }

  // Nav already has default text from HTML — no override needed on init

  // Tooltip stays via CSS :hover on .nav-ds-wrap — no JS toggle needed

  window.fetchDiscordStatus();
})();

/* ── Hamburger ── */
const hamburger = document.getElementById('nav-hamburger');
const drawer = document.getElementById('nav-drawer');
if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    drawer.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Scroll reveal ── */
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) forwards';
      fadeObs.unobserve(e.target);
    }
  });
});
document.querySelectorAll('main .fade-up').forEach(el => {
  el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; el.style.animation = 'none';
  fadeObs.observe(el);
});

/* ── Active nav ── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObs.observe(s));

/* ══════════════════════════════════════════════════════
   CERT MODAL
   ─────────────────────────────────────────────────────
   To show your actual certificate images, set the 'img'
   field to the path or URL of each certificate image.
   
   Examples:
     img: 'certs/crtom.jpg'           ← relative path
     img: 'https://i.imgur.com/xxx.jpg' ← hosted URL
   
   The modal will display the image full-size and allow
   zooming. If no image is set, a styled placeholder shows.
══════════════════════════════════════════════════════ */
const certData = {
  crtom: {
    title: 'Certified Red Team Operations Management',
    sub: 'Red Team Leaders · Jan 2026',
    id: 'c87309042f132211',
    verifyUrl: 'https://courses.redteamleaders.com/exam-completion/c87309042f132211',
    img: 'https://media.licdn.com/dms/image/v2/D562DAQGVmb5zYluPUA/profile-treasury-document-images_800/B56ZuDu7BHLAAc-/1/1767441675633?e=1776297600&v=beta&t=qXTs6Jy3QJBHVZBGnGMTmnfngB4qaHFYDehI63yx0Oc',
  },
  crpo: {
    title: 'Certified Ransomware Protection Officer (CRPO)',
    sub: 'ICTTF · Dec 2025',
    id: '64d63660ac9488bbf50f3e76',
    verifyUrl: 'https://mycourse.app/UEAaccDGytinG2z4Y',
    img: 'https://media.licdn.com/dms/image/v2/D562DAQHqJxdqTq44MQ/profile-treasury-document-images_800/B56ZtwFrhqJcAk-/1/1767112113776?e=1776297600&v=beta&t=YGqZ7v91SIDdISwlisbi3BGXEB1wyZcA_hY970jyU0k',
  },
  iso27001: {
    title: 'ISO/IEC 27001:2022 Information Security Associate',
    sub: 'SkillFront · Dec 2025',
    id: '14571241056365',
    verifyUrl: 'https://www.skillfront.com/Badges/14571241056365',
    img: 'https://media.licdn.com/dms/image/v2/D562DAQGFy6_b5fExIw/profile-treasury-document-cover-images_1920/B56ZtMG6R5K8BM-/0/1766508446968?e=1775746800&v=beta&t=z6z0dQgG9A4YCiCgU2A-85g_4tHa0RdBSKhYEs-G5fw',
  },
  aws: {
    title: 'AWS Security Specialty – Domain 1 Review',
    sub: 'AWS Training Online · Dec 2025',
    id: '0056e6e1-4262-42b6-a1a0-231feb648aa8',
    verifyUrl: 'https://skillbuilder.aws/0056e6e1-4262-42b6-a1a0-231feb648aa8',
    img: 'https://media.licdn.com/dms/image/v2/D562DAQE4_SmAmtsLgQ/profile-treasury-document-images_800/B56Zt1Sa4rHYAg-/1/1767199323324?e=1776297600&v=beta&t=g0DM2tvP8-Mw-HKYE6vAw6sgxstgGLdTb2Vq4p6XUss',
  },
  ceh: {
    title: 'Certified Ethical Hacker (CEH)',
    sub: 'CyberSapiens EdTech · Dec 2025',
    id: 'S1711',
    verifyUrl: null,
    img: 'https://media.licdn.com/dms/image/v2/D562DAQHaMIPd8eoVyA/profile-treasury-document-cover-images_480/B56Zs129obG4BI-/0/1766135161731?e=1775746800&v=beta&t=IUCu6DsL2ZcHjtiwfFFpA8RLy7jIdw9WAVGlUfFo_34',
  },
  datacom: {
    title: 'Datacom Cyber Security Operations Job Simulation',
    sub: 'Forage · Dec 2025',
    id: 'NQzgatgizSKMQr7Wk',
    verifyUrl: 'https://www.theforage.com/completion-certificates/gCW7Xki5Y3vNpBmnn/yTszJTvkHFBH6zAn3_gCW7Xki5Y3vNpBmnn_TGvbzJm2TdGfXbpCs_1765730772553_completion_certificate.pdf',
    img: 'https://media.licdn.com/dms/image/v2/D562DAQE3P-MvuFZl3w/profile-treasury-document-cover-images_1280/B56ZtKqrQHHAAw-/0/1766484261985?e=1775746800&v=beta&t=kBMVt0oZTaxtdvlPOb3JVgInkecFgMEEPAdhx1wAQWw',
  },
  remarkskill: {
    title: 'REMARKSKILL Ethical Hacking Workshop',
    sub: 'Remarkskill Education · Mar 2025',
    id: null,
    verifyUrl: null,
    img: 'https://media.licdn.com/dms/image/v2/D562DAQGWf664LHQWEw/profile-treasury-image-shrink_800_800/B56ZvrCYHOHAAY-/0/1769174828892?e=1775746800&v=beta&t=jJqXSKZPgK5m2uXHDw_hJKN2_1LdeZi3mNXS88gLBz4',
  },
  business: {
    title: 'Foundations of Business and Entrepreneurship',
    sub: 'SkillFront · Dec 2025',
    id: '29350474202896',
    verifyUrl: 'https://www.skillfront.com/Badges/29350474202896',
    img: 'https://media.licdn.com/dms/image/v2/D562DAQEaUR3baGftyQ/profile-treasury-document-images_800/B56ZtKflOqLAAc-/1/1766481354117?e=1776297600&v=beta&t=BpthmPdoeLjsSVluC29cC9f_hEL02Jszsb1UAKiRmQs',
  },
};

function openCertModal(key) {
  const cert = certData[key];
  if (!cert) return;

  document.getElementById('modal-title').textContent = cert.title;
  document.getElementById('modal-sub').textContent = cert.sub;

  const idRow = document.getElementById('modal-id-row');
  idRow.innerHTML = cert.id ? `Credential ID: <strong>${cert.id}</strong>` : '';

  const openBtn = document.getElementById('modal-open-btn');
  const verifyBtn = document.getElementById('modal-verify-btn');

  if (cert.img) {
    openBtn.href = cert.img;
    openBtn.style.display = '';
  } else {
    openBtn.style.display = 'none';
  }

  if (cert.verifyUrl) {
    verifyBtn.href = cert.verifyUrl;
    verifyBtn.style.display = '';
  } else {
    verifyBtn.style.display = 'none';
  }

  const container = document.getElementById('modal-img-container');
  const hintEl = document.getElementById('modal-hint');

  if (cert.img) {
    // Show loading spinner, then image
    container.innerHTML = `<div class="cert-img-loading"><div class="cert-spinner"></div><span>Loading certificate…</span></div>`;
    hintEl.textContent = '';

    const img = new Image();
    img.onload = () => {
      container.innerHTML = '';
      container.appendChild(img);
    };
    img.onerror = () => {
      container.innerHTML = `<div class="cert-no-preview">
        <span class="cert-icon">⬡</span>
        <strong style="color:var(--text2);display:block;margin-bottom:8px;font-size:14px">${cert.title}</strong>
        <span>Image could not be loaded.<br>Check the file path in <code style="color:var(--cyan)">certData['${key}'].img</code></span>
      </div>`;
    };
    img.src = cert.img;
    img.alt = cert.title;
    img.style.cssText = 'max-width:100%;max-height:70vh;object-fit:contain;display:block;border:1px solid var(--border);box-shadow:0 0 40px rgba(0,200,255,0.08);';
  } else {
    // Styled placeholder — no image configured yet
    container.innerHTML = `<div class="cert-no-preview">
      <span class="cert-icon">⬡</span>
      <strong style="color:var(--text2);display:block;margin-bottom:12px;font-size:15px;letter-spacing:.02em">${cert.title}</strong>
      <span style="color:var(--muted);font-size:11px;line-height:2">
        ${cert.sub}<br>
        ${cert.id ? `Credential ID: <span style="color:var(--cyan)">${cert.id}</span><br>` : ''}
        <br>
        <span style="color:var(--border2)">────────────────────────────────</span><br>
        <span style="color:var(--muted)">To display your certificate image here,<br>set <code style="color:var(--cyan)">certData['${key}'].img</code> to your certificate URL or file path.</span>
      </span>
    </div>`;
    hintEl.textContent = cert.verifyUrl ? 'Click "Verify" to confirm this credential externally.' : '';
  }

  document.getElementById('cert-modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertModal() {
  document.getElementById('cert-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('cert-modal-overlay')) closeCertModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCertModal(); });

/* ══════════════════════════════════
   GITHUB API
═══════════════════════════════════ */
async function fetchGitHub() {
  const username = 'shadow269';
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    ]);
    if (!userRes.ok) throw new Error('User fetch failed');
    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    document.getElementById('gh-repos').textContent = user.public_repos ?? '—';
    document.getElementById('gh-followers').textContent = user.followers ?? '—';
    document.getElementById('gh-following').textContent = user.following ?? '—';

    const totalStars = Array.isArray(repos) ? repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0) : 0;
    document.getElementById('gh-stars').textContent = totalStars;

    const langMap = {};
    if (Array.isArray(repos)) repos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
    const sorted = Object.entries(langMap).sort((a,b) => b[1]-a[1]).slice(0,6);
    const total = sorted.reduce((a,b) => a+b[1], 0);
    const colors = ['#00c8ff','#ff6b00','#28c840','#ffc01e','#ff375f','#a855f7'];
    const langsEl = document.getElementById('gh-langs');
    if (sorted.length) {
      langsEl.innerHTML = sorted.map(([lang, count], i) => {
        const pct = Math.round((count/total)*100);
        return `<div class="stat-bar-row">
          <div class="stat-bar-meta">
            <span class="stat-bar-name"><span class="lang-dot" style="background:${colors[i%colors.length]}"></span>${lang}</span>
            <span class="stat-bar-pct">${pct}%</span>
          </div>
          <div class="stat-bar-track"><div class="stat-bar-fill" style="background:${colors[i%colors.length]};box-shadow:0 0 8px ${colors[i%colors.length]}66" data-pct="${pct}"></div></div>
        </div>`;
      }).join('');
      setTimeout(() => {
        document.querySelectorAll('.stat-bar-fill').forEach(el => { el.style.width = el.dataset.pct + '%'; });
      }, 400);
    } else {
      langsEl.innerHTML = '<div style="font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.08em;">No language data available</div>';
    }
  } catch(err) {
    ['gh-repos','gh-stars','gh-followers','gh-following'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<span style="font-size:14px;color:var(--muted)">—</span>';
    });
    document.getElementById('gh-langs').innerHTML = '<div style="font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.08em;">Could not load GitHub data</div>';
  }
}
fetchGitHub();

/* ══════════════════════════════════
   LEETCODE API
═══════════════════════════════════ */
async function fetchLeetCode() {
  const username = 'SHADOW2669';
  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.status !== 'success') throw new Error('bad status');

    const totalEl = document.getElementById('lc-total');
    totalEl.textContent = data.totalSolved;

    document.getElementById('lc-easy').textContent   = data.easySolved;
    document.getElementById('lc-medium').textContent = data.mediumSolved;
    document.getElementById('lc-hard').textContent   = data.hardSolved;

    const easyTotal = 850, medTotal = 1800, hardTotal = 800;
    const barsWrap = document.getElementById('lc-bars');
    barsWrap.style.display = 'flex';

    function setBar(fillId, numId, solved, total) {
      document.getElementById(numId).textContent = `${solved} / ${total}`;
      setTimeout(() => {
        document.getElementById(fillId).style.width = Math.min(100, (solved / total) * 100) + '%';
      }, 500);
    }
    setBar('lc-bar-easy', 'lc-bar-easy-num', data.easySolved, easyTotal);
    setBar('lc-bar-med',  'lc-bar-med-num',  data.mediumSolved, medTotal);
    setBar('lc-bar-hard', 'lc-bar-hard-num', data.hardSolved, hardTotal);

  } catch (err) {
    const totalEl = document.getElementById('lc-total');
    totalEl.innerHTML = '<span class="err-badge">⚠ API Offline</span>';
    ['lc-easy','lc-medium','lc-hard'].forEach(id => document.getElementById(id).textContent = '—');
  }
}
fetchLeetCode();

/* ══════════════════════════════════
   MONKEYTYPE API
═══════════════════════════════════ */
async function fetchMonkeytype() {
  const username = 'SHADOW2669';
  try {
    const res = await fetch(`https://api.monkeytype.com/users/${username}/profile`);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const data = json.data;
    if (!data) throw new Error('no data');

    const stats = data.typingStats;
    document.getElementById('mt-tests').textContent = stats.completedTests.toLocaleString();

    let maxWpm = 0, bestAcc = 0;
    const timeModes = data.personalBests?.time || {};
    const modeData = [];

    for (const dur in timeModes) {
      const best = timeModes[dur];
      if (best && best.length > 0) {
        const wpm = Math.round(best[0].wpm);
        const acc = Math.round(best[0].acc);
        if (wpm > maxWpm) { maxWpm = wpm; bestAcc = acc; }
        modeData.push({ key: `${dur}s`, wpm, acc });
      }
    }

    document.getElementById('mt-wpm').textContent = maxWpm || '—';

    const pct = bestAcc || 0;
    document.getElementById('mt-acc-pct').textContent = pct ? pct + '%' : '—';
    document.getElementById('mt-acc-val').textContent = pct ? pct + '% Accuracy' : 'N/A';
    document.getElementById('mt-acc-sub').textContent = `Best run — ${maxWpm} WPM`;

    const circumference = 2 * Math.PI * 35;
    setTimeout(() => {
      const offset = circumference - (pct / 100) * circumference;
      document.getElementById('acc-ring').style.strokeDasharray = circumference;
      document.getElementById('acc-ring').style.strokeDashoffset = offset;
    }, 600);

    const modesEl = document.getElementById('mt-modes');
    modeData.sort((a,b) => parseInt(a.key) - parseInt(b.key));
    modeData.forEach(m => {
      const div = document.createElement('div');
      div.className = 'mt-mode';
      div.innerHTML = `<div class="mt-mode-val">${m.wpm}</div><div class="mt-mode-key">${m.key} WPM</div>`;
      modesEl.appendChild(div);
    });
    if (!modeData.length) {
      modesEl.innerHTML = '<span class="loading-pulse">No mode data</span>';
    }

  } catch (err) {
    document.getElementById('mt-wpm').innerHTML = '<span class="err-badge">⚠ Offline</span>';
    document.getElementById('mt-tests').innerHTML = '—';
    document.getElementById('mt-acc-val').textContent = 'Could not load data';
  }
}
fetchMonkeytype();