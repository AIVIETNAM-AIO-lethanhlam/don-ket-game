/* ĐỜN KẾT — dựng lại giao diện & luồng chơi của trang mẫu don-ket.vercel.app
   (HTML/JS thuần, dùng chung file CSS gốc assets/css/donket.css). */
(function () {
  "use strict";
  var C = window.DONKET_CONFIG;
  var TOTAL = C.TOTAL_QUESTIONS, QT = C.QUESTION_TIME_SECONDS, MAXA = C.MAX_ATTEMPTS_PER_QUESTION, UNLOCK_Q = C.UNLOCK_AFTER_QUESTION;
  var INSTR = C.INSTRUMENTS.slice().sort(function (a, b) { return a.order_index - b.order_index; });
  var BY_ID = {}; INSTR.forEach(function (i) { BY_ID[i.id] = i; });
  var app = document.getElementById("app");
  var modalRoot = document.getElementById("modal-root");

  /* ================= tiện ích ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cn() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mk(store) {
    return {
      get: function (k, d) { try { var v = store.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} },
      del: function (k) { try { store.removeItem(k); } catch (e) {} }
    };
  }
  var LS = mk(window.localStorage), SS = mk(window.sessionStorage);
  function nameKey(n) { var t = String(n || ""); try { t = t.normalize("NFC"); } catch (e) {} return t.toLowerCase().replace(/\s+/g, " ").trim(); }
  function fmtDur(e) {
    if (e == null || !isFinite(e) || e < 0) return "--:--";
    var t = Math.floor(e), a = Math.floor(t / 60);
    return String(a).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
  }
  function viNum(n) { try { return Number(n).toLocaleString("vi-VN"); } catch (e) { return String(n); } }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function confetti(o) { if (window.confetti && !reduced()) { try { window.confetti(o); } catch (e) {} } }

  /* ================= icon (lucide) ================= */
  var ICON = {
    "volume-2": '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>',
    "volume-x": '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line>',
    play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>',
    pause: '<rect x="14" y="3" width="5" height="18" rx="1"></rect><rect x="5" y="3" width="5" height="18" rx="1"></rect>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    trophy: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path>',
    "circle-check": '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>',
    "circle-x": '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>',
    "music-2": '<circle cx="8" cy="18" r="4"></circle><path d="M12 18V2l7 4"></path>',
    library: '<path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path>',
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
    "arrow-left": '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
    medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="M11 12 5.12 2.2"></path><path d="m13 12 5.88-9.8"></path><path d="M8 7h8"></path><circle cx="12" cy="17" r="5"></circle><path d="M12 18v-2h-.5"></path>',
    "clock-alert": '<path d="M12 6v6l4 2"></path><path d="M20 12v5"></path><path d="M20 21h.01"></path><path d="M21.25 8.2A10 10 0 1 0 16 21.16"></path>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle>',
    "user-round": '<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
    "maximize-2": '<path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path>',
    "settings-2": '<path d="M14 17H5"></path><path d="M19 7h-9"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>',
    crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path><path d="M5 21h14"></path>',
    radio: '<path d="M16.247 7.761a6 6 0 0 1 0 8.478"></path><path d="M19.075 4.933a10 10 0 0 1 0 14.134"></path><path d="M4.925 19.067a10 10 0 0 1 0-14.134"></path><path d="M7.753 16.239a6 6 0 0 1 0-8.478"></path><circle cx="12" cy="12" r="2"></circle>'
  };
  function icon(n, cls, o) {
    o = o || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="' + (o.fill || "none") + '" stroke="currentColor" stroke-width="' + (o.sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-' + n + " " + (cls || "") + '" aria-hidden="true">' + ICON[n] + "</svg>";
  }

  /* ================= nút LotusButton ================= */
  function btnCls(variant, size, extra) {
    var t = ["inline-flex", "items-center", "justify-center", "gap-2", "rounded-full", "border-2"];
    if (variant === "primary") t.push("border-white/80");
    t.push("font-semibold", "tracking-wide", "transition", "focus-ring");
    var sz = size === "md" ? ["h-10", "px-5", "text-sm"] : ["h-12", "px-7", "text-base"];
    var ex = (extra || "").split(/\s+/).filter(Boolean);
    var has = function (re) { return ex.some(function (x) { return re.test(x); }); };
    if (has(/^(h-|size-)/)) sz = sz.filter(function (x) { return !/^h-/.test(x); });
    if (has(/^(px-|size-)/) && has(/^px-/)) sz = sz.filter(function (x) { return !/^px-/.test(x); });
    t = t.concat(sz);
    if (variant === "primary") t.push("bg-lotus-pink", "text-white", has(/^shadow-/) ? "" : "shadow-[0_12px_28px_-12px_rgba(239,139,197,0.5)]", "hover:bg-lotus-pink/90", "disabled:bg-lotus-pink/55", "disabled:saturate-75", "disabled:opacity-100");
    if (variant === "secondary") t.push("border-white/70", "bg-paper-soft/90", "text-ink", has(/^shadow-/) ? "" : "shadow-[0_8px_20px_-12px_rgba(39,108,107,0.28)]", "hover:bg-paper-soft");
    return t.concat(ex).filter(Boolean).join(" ") + " dk-lift";
  }
  function btn(o) {
    var c = btnCls(o.variant || "primary", o.size || "lg", o.cls);
    var attrs = o.attrs || "";
    if (o.href) return '<a class="' + c + '" href="' + o.href + '" ' + attrs + ">" + o.html + "</a>";
    return '<button type="' + (o.type || "button") + '" class="' + c + '" ' + (o.disabled ? "disabled " : "") + attrs + ">" + o.html + "</button>";
  }
  function headerBtn(o) {
    o.variant = "secondary"; o.size = "md";
    o.cls = "shadow-[0_6px_16px_-10px_rgba(39,108,107,0.3)] " + (o.iconOnly ? "size-10 shrink-0 px-0" : "px-3.5 sm:px-4");
    return btn(o);
  }
  function badge(cls, html) {
    return '<span data-slot="badge" class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3 ' + cls + '">' + html + "</span>";
  }
  function skel(cls) { return '<div data-slot="skeleton" class="animate-pulse rounded-md bg-accent ' + cls + '"></div>'; }
  function folkCard(cls, inner) { return '<div class="paper-card p-5 sm:p-7 ' + cls + '">' + inner + "</div>"; }
  function page(inner, cls) { return '<div class="flex flex-1 flex-col ' + (cls || "") + '">' + inner + "</div>"; }

  /* ================= cài đặt âm thanh (lưu trên máy) ================= */
  var UI_DEF = { volume: 30, muted: false, sfxMuted: false, sfxSuccessVolume: 30, sfxFailVolume: 30, sfxLeaderboardVolume: 30, bgmVolume: 20, bgmMuted: false, leaderboardScale: 1 };
  var UI = Object.assign({}, UI_DEF, LS.get("don-ket-ui-v1", {}));
  function saveUI() { LS.set("don-ket-ui-v1", UI); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ================= âm thanh ================= */
  var actx = null;
  function getCtx() {
    if (actx) return actx;
    var A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    try { actx = new A(); } catch (e) { actx = null; }
    return actx;
  }
  function resume() { var c = getCtx(); if (c && c.state === "suspended") { try { c.resume(); } catch (e) {} } }
  function wire(el) {
    // dùng GainNode để chỉnh âm lượng (iPhone bỏ qua thuộc tính volume)
    var c = getCtx(); if (!c || el._gain) return el._gain;
    try { var s = c.createMediaElementSource(el), g = c.createGain(); s.connect(g); g.connect(c.destination); el._gain = g; el.volume = 1; } catch (e) { el._gain = null; }
    return el._gain;
  }
  function setVol(el, v) { var g = el._gain; if (g) g.gain.value = v; else el.volume = clamp(v, 0, 1); }

  var sfxEls = {};
  function playSfx(kind, factor) {
    if (factor == null) factor = 0.7;
    if (UI.sfxMuted) return;
    var v = kind === "success" ? UI.sfxSuccessVolume : kind === "fail" ? UI.sfxFailVolume : UI.sfxLeaderboardVolume;
    if (v <= 0) return;
    var vol = clamp((v / 100) * factor, 0, 1);
    try {
      var el = sfxEls[kind];
      if (!el) { el = sfxEls[kind] = new Audio(C.SFX[kind]); el.preload = "auto"; el.setAttribute("playsinline", "true"); wire(el); }
      resume(); setVol(el, vol); el.pause(); el.currentTime = 0;
      var p = el.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  /* nhạc nền: phát ở trang chủ & bảng xếp hạng (nếu có file audio/nhac_nen.mp3) */
  var bgm = { el: null, want: false, unlocked: false, broken: false };
  function bgmEl() {
    if (!bgm.el) {
      bgm.el = new Audio(); bgm.el.loop = true; bgm.el.preload = "none"; bgm.el.setAttribute("playsinline", "true");
      bgm.el.addEventListener("error", function () { bgm.broken = true; });
      bgm.el.src = C.BGM_SRC;
    }
    return bgm.el;
  }
  function bgmApply() {
    if (bgm.broken) return;
    var on = bgm.want && bgm.unlocked && !UI.bgmMuted && UI.bgmVolume > 0;
    var el = bgmEl();
    if (on) { wire(el); setVol(el, UI.bgmVolume / 100); var p = el.play(); if (p && p.catch) p.catch(function () {}); }
    else el.pause();
  }
  ["pointerdown", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, function () { resume(); if (!bgm.unlocked) { bgm.unlocked = true; bgmApply(); } }, { passive: true });
  });

  /* trình phát nhạc cụ (useInstrumentAudio) */
  function Player(onChange, preload) {
    var el = new Audio(); el.preload = preload || "auto"; el.setAttribute("playsinline", "true"); el.playsInline = true;
    var self = { el: el, status: "idle", volume: UI.volume, src: null, wantPlay: false };
    function set(s) { self.status = s; onChange && onChange(self); }
    el.addEventListener("loadstart", function () { if (self.src) set("loading"); });
    el.addEventListener("canplay", function () { if (self.status === "loading") set("ready"); });
    el.addEventListener("loadedmetadata", function () { if (self.status === "loading" && !self.wantPlay) set("ready"); });
    el.addEventListener("playing", function () { self.wantPlay = false; set("playing"); });
    el.addEventListener("pause", function () { if (self.status === "playing") set(el.ended ? "ended" : "paused"); });
    el.addEventListener("ended", function () { set("ended"); });
    el.addEventListener("error", function () { self.wantPlay = false; if (self.src) set("error"); });
    el.addEventListener("timeupdate", function () { onChange && onChange(self, true); });
    el.addEventListener("loadedmetadata", function () { onChange && onChange(self, true); });
    self.load = function (src) { self.src = src; if (!src) { el.removeAttribute("src"); set("idle"); return; } el.src = src; el.load(); set("loading"); };
    self.play = function () {
      if (!self.src) return Promise.resolve(false);
      self.wantPlay = true; if (self.status === "ready" || self.status === "paused" || self.status === "ended") {} else onChange && onChange(self);
      wire(el); resume(); setVol(el, self.volume / 100);
      if (el.ended) el.currentTime = 0;
      var p = el.play();
      return p && p.then ? p.then(function () { return true; }, function () { self.wantPlay = false; onChange && onChange(self); return false; }) : Promise.resolve(true);
    };
    self.pause = function () { el.pause(); };
    self.stop = function () { el.pause(); try { el.currentTime = 0; } catch (e) {} if (self.status === "playing" || self.status === "paused") set("ready"); };
    self.setVolume = function (v) { self.volume = clamp(Math.round(v), 0, 100); setVol(el, self.volume / 100); };
    self.seek = function (t) { try { el.currentTime = t; } catch (e) {} };
    self.destroy = function () { el.pause(); el.removeAttribute("src"); try { el.load(); } catch (e) {} self.src = null; onChange = null; };
    return self;
  }

  /* ================= thông báo (sonner) ================= */
  var ERR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>';
  function toast(msg, type) {
    var box = document.getElementById("toaster");
    var t = document.createElement("div");
    t.className = "dk-toast" + (type ? " dk-toast-" + type : "");
    t.setAttribute("role", "status");
    t.innerHTML = (type === "error" ? ERR_SVG : "") + '<div class="dk-toast-title"></div>';
    t.lastChild.textContent = msg;
    box.appendChild(t);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(function () { t.classList.add("dk-out"); setTimeout(function () { t.remove(); }, 300); }, 4000);
  }
  toast.error = function (m) { toast(m, "error"); };
  toast.message = function (m) { toast(m, ""); };

  /* ================= máy chủ (Supabase) ================= */
  var SB = C.supabaseUrl && C.supabaseAnonKey ? { url: C.supabaseUrl.replace(/\/+$/, ""), key: C.supabaseAnonKey } : null;
  function sbFetch(path, opt, ms) {
    opt = opt || {};
    var h = { apikey: SB.key, Authorization: "Bearer " + SB.key, "Content-Type": "application/json" };
    for (var k in (opt.headers || {})) h[k] = opt.headers[k];
    opt.headers = h;
    return Promise.race([
      fetch(SB.url + "/rest/v1/" + path, opt),
      new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms || 7000); })
    ]);
  }
  function pgQuote(v) { return encodeURIComponent('"' + String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"'); }

  function registerName(n) {
    var key = nameKey(n);
    var local = LS.get("don-ket-names-v1", []); if (!Array.isArray(local)) local = [];
    function localTaken() { return local.indexOf(key) >= 0 || LS.get("don-ket-scores-v1", []).some(function (s) { return nameKey(s.name) === key; }); }
    function remember() { local.push(key); LS.set("don-ket-names-v1", local.slice(-2000)); }
    if (!SB) { if (localTaken()) return Promise.resolve("taken"); remember(); return Promise.resolve("ok"); }
    return sbFetch(C.supabasePlayersTable, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name: n, name_key: key }) })
      .then(function (r) { if (r.status === 409) return "taken"; if (!r.ok) throw new Error(r.status); remember(); return "ok"; })
      .catch(function () { if (localTaken()) return "taken"; remember(); return "offline"; });
  }
  function submitScore(e) {
    var all = LS.get("don-ket-scores-v1", []); all.push(e); LS.set("don-ket-scores-v1", all.slice(-500));
    if (!SB) return Promise.resolve();
    var body = JSON.stringify({ name: e.name, score: e.score, correct: e.correct, duration_seconds: e.duration });
    return sbFetch(C.supabaseTable, { method: "POST", headers: { Prefer: "return=minimal" }, body: body })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .catch(function () { var q = LS.get("don-ket-pending-v1", []); q.push(e); LS.set("don-ket-pending-v1", q.slice(-50)); });
  }
  function flushPending() {
    if (!SB) return;
    var q = LS.get("don-ket-pending-v1", []); if (!q.length) return;
    LS.set("don-ket-pending-v1", []);
    q.forEach(function (e) {
      sbFetch(C.supabaseTable, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name: e.name, score: e.score, correct: e.correct, duration_seconds: e.duration }) })
        .then(function (r) { if (!r.ok) throw 0; }).catch(function () { var p = LS.get("don-ket-pending-v1", []); p.push(e); LS.set("don-ket-pending-v1", p); });
    });
  }
  function localBoard() {
    var best = {};
    LS.get("don-ket-scores-v1", []).forEach(function (s) {
      var k = s.name, b = best[k];
      if (!b || s.score > b.score || (s.score === b.score && (s.duration || 1e9) < (b.duration || 1e9))) best[k] = s;
    });
    var rows = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.score - a.score || (a.duration || 1e9) - (b.duration || 1e9); });
    var rank = 0, prev = null;
    return rows.map(function (r, i) { if (!prev || prev.score !== r.score || prev.duration !== r.duration) rank = i + 1; prev = r; return { name: r.name, score: r.score, correct: r.correct, duration_seconds: r.duration, rank: rank }; });
  }
  function toRows(list) {
    var me = G.player ? G.player.name : null;
    return list.map(function (r) { return { userId: r.name, displayName: r.name, totalScore: r.score | 0, correctCount: r.correct | 0, rank: r.rank | 0, totalDurationSeconds: r.duration_seconds, isCurrentUser: !!me && r.name === me }; });
  }
  function apiLeaderboard(limit) {
    if (!SB) return Promise.resolve(toRows(localBoard().slice(0, limit)));
    return sbFetch(C.supabaseLeaderboardView + "?select=name,score,correct,duration_seconds,rank&order=rank.asc,created_at.asc&limit=" + limit)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(toRows);
  }
  function apiMyRank(name) {
    if (!SB) { var l = toRows(localBoard()); var m = l.filter(function (r) { return r.displayName === name; })[0]; return Promise.resolve(m || null); }
    return sbFetch(C.supabaseLeaderboardView + "?select=name,score,correct,duration_seconds,rank&name=eq." + pgQuote(name))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) { return rows.length ? toRows(rows)[0] : null; });
  }

  /* ================= trạng thái người chơi & lượt chơi (theo phiên) ================= */
  var G = { player: SS.get("don-ket-player", null), game: SS.get("don-ket-game", null) };
  function saveG() { SS.set("don-ket-player", G.player); SS.set("don-ket-game", G.game); }
  function newGame() {
    var g1 = shuffle(INSTR.filter(function (i) { return i.unlock_group === 1; }));
    var g2 = shuffle(INSTR.filter(function (i) { return i.unlock_group === 2; }));
    var order = g1.concat(g2);
    var qs = order.map(function (ins, i) {
      var n = i + 1;
      var pool = n <= UNLOCK_Q ? INSTR.filter(function (x) { return x.unlock_group === 1; }) : INSTR;
      return { question_number: n, instrument_id: ins.id, choice_instrument_ids: shuffle(pool).map(function (x) { return x.id; }), status: "waiting", attempt_count: 0, selected_instrument_ids: [], question_started_at: null, score_awarded: 0 };
    });
    G.game = { attempt: { status: "in_progress", current_question: 1, total_score: 0, correct_count: 0, wrong_count: 0, timeout_count: 0, started_at: new Date().toISOString(), completed_at: null }, questions: qs, submitted: false };
    saveG();
  }
  function curQ() { return G.game ? G.game.questions[G.game.attempt.current_question - 1] : null; }
  function finished(q) { return q && ["correct", "failed", "timeout"].indexOf(q.status) >= 0; }
  function remaining(q) {
    if (!q || !q.question_started_at) return null;
    return clamp(Math.floor(QT - (Date.now() - new Date(q.question_started_at).getTime()) / 1000), 0, QT);
  }
  function endSession() { G.player = null; G.game = null; saveG(); }
  function deviceUnlocked() { return LS.get("don-ket-device-collection-v1", false) === true; }

  /* ================= header + cài đặt âm thanh ================= */
  function siteHeader(right, subtitle) {
    return '<header class="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:py-5"><a class="group focus-ring flex min-w-0 items-center gap-2 rounded-xl sm:gap-2.5" aria-label="Về trang chủ" href="#/"><span class="inline-flex shrink-0 items-center justify-center self-center"><img alt="" width="44" height="44" class="block size-9 object-contain sm:size-11" src="brand/don_ket_logo_96.png"></span><span class="inline-flex min-w-0 translate-y-[2px] flex-col justify-center leading-none sm:translate-y-[3px]"><span class="font-display text-xl font-bold tracking-tight text-ink transition group-hover:text-river-purple sm:text-2xl">Đờn Kết</span>' +
      (subtitle ? '<span class="mt-0.5 hidden truncate text-xs leading-none text-ink-soft sm:inline">' + esc(subtitle) + "</span>" : "") +
      "</span></a>" + (right || "") + "</header>";
  }
  var popOpen = null; // "bgm" | "scale"
  function pill(label, active, act, aria) {
    return '<button type="button" data-act="' + act + '"' + (aria != null ? ' aria-pressed="' + aria + '"' : "") + ' class="focus-ring inline-flex shrink-0 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ' +
      (active ? "border-white/90 bg-white text-ink shadow-sm" : "border-white/70 bg-white/85 text-ink-soft hover:bg-white hover:text-ink") + '">' + label + "</button>";
  }
  function volRow(label, ic, val, muted, key) {
    var l = muted ? 0 : val;
    return '<div class="flex items-center gap-2 rounded-full border border-lotus-pink/30 bg-lotus-pastel/45 px-2.5 py-1.5"><span class="inline-flex size-6 shrink-0 items-center justify-center">' + ic + '</span><label class="flex min-w-0 flex-1 items-center gap-2"><span class="sr-only">' + label + '</span><input type="range" min="0" max="100" step="1" value="' + l + '" aria-label="' + label + '" data-vol="' + key + '" class="audio-volume-slider h-1.5 w-full min-w-0 cursor-pointer" style="background:' + track(l) + '"><span class="w-8 shrink-0 text-right text-[11px] tabular-nums text-lotus-pink">' + l + "%</span></label></div>";
  }
  function track(p) { return "linear-gradient(to right, var(--lotus-pink) 0%, var(--lotus-pink) " + p + "%, var(--lotus-pastel) " + p + "%, var(--lotus-pastel) 100%)"; }
  function bgmControl() {
    var A = UI.bgmMuted || UI.bgmVolume <= 0, B = UI.sfxMuted;
    var O = A && (B || (UI.sfxSuccessVolume <= 0 && UI.sfxFailVolume <= 0 && UI.sfxLeaderboardVolume <= 0));
    var h = '<div class="relative" data-pop="bgm">' + headerBtn({ iconOnly: true, attrs: 'aria-label="Cài đặt âm thanh" aria-pressed="' + O + '" data-act="toggle-bgm"', html: icon(O ? "volume-x" : "volume-2", "size-4") });
    if (popOpen === "bgm") {
      h += '<div role="dialog" aria-label="Cài đặt âm thanh" class="absolute top-full right-0 z-50 mt-2 w-[min(17.5rem,calc(100vw-1.5rem))] space-y-3 rounded-2xl border border-white/80 bg-paper-soft/95 p-3.5 shadow-[0_12px_28px_-14px_rgba(39,108,107,0.4)] backdrop-blur-sm">' +
        '<div class="flex items-center justify-between gap-2"><p class="font-display text-sm font-semibold text-ink">Âm thanh</p>' + pill("Mặc định", false, "audio-default") + "</div>" +
        '<div class="space-y-2.5 rounded-lg border border-ink/8 bg-paper/70 p-3"><div class="flex items-center justify-between gap-2"><p class="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">Nhạc nền</p>' +
        pill(A ? "Tắt" : "Bật", !A, "bgm-toggle", !A).replace('data-act="bgm-toggle"', 'data-act="bgm-toggle" aria-label="' + (A ? "Bật nhạc nền" : "Tắt nhạc nền") + '"') + "</div>" +
        volRow("Nhạc nền", icon("music-2", "size-3.5 text-jade-dark"), UI.bgmVolume, A, "bgm") + "</div>" +
        '<div class="space-y-2.5 rounded-lg border border-ink/8 bg-paper/70 p-3"><div class="flex items-center justify-between gap-2"><p class="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">Hiệu ứng</p>' +
        pill(B ? "Tắt" : "Bật", !B, "sfx-toggle", !B).replace('data-act="sfx-toggle"', 'data-act="sfx-toggle" aria-label="' + (B ? "Bật hiệu ứng" : "Tắt hiệu ứng") + '"') + "</div>" +
        volRow("Thành công", icon("circle-check", "size-3.5 text-correct"), UI.sfxSuccessVolume, B, "success") +
        volRow("Sai / hết giờ", icon("circle-x", "size-3.5 text-wrong"), UI.sfxFailVolume, B, "fail") +
        volRow("Bảng xếp hạng", icon("trophy", "size-3.5 text-gold"), UI.sfxLeaderboardVolume, B, "leaderboard") + "</div></div>";
    }
    return h + "</div>";
  }
  function scaleControl() {
    var u = UI.leaderboardScale, p = ((u - 0.75) / (1.35 - 0.75)) * 100;
    var h = '<div class="relative hidden md:block" data-pop="scale">' + headerBtn({ iconOnly: true, attrs: 'aria-label="Tuỳ chỉnh hiển thị" aria-pressed="' + (popOpen === "scale") + '" data-act="toggle-scale"', html: icon("settings-2", "size-4") });
    if (popOpen === "scale") {
      h += '<div role="dialog" aria-label="Tuỳ chỉnh hiển thị" class="absolute top-full right-0 z-50 mt-2 w-[min(17.5rem,calc(100vw-1.5rem))] space-y-3 rounded-2xl border border-white/80 bg-paper-soft/95 p-3.5 shadow-[0_12px_28px_-14px_rgba(39,108,107,0.4)] backdrop-blur-sm"><div class="flex items-center justify-between gap-2"><p class="font-display text-sm font-semibold text-ink">Tuỳ chỉnh hiển thị</p><button type="button" data-act="scale-default" class="focus-ring inline-flex shrink-0 items-center justify-center rounded-full border border-white/90 bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-sm transition hover:bg-white">Mặc định</button></div>' +
        '<div class="space-y-2.5 rounded-lg border border-ink/8 bg-paper/70 p-3"><p class="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">Cỡ thành phần</p><div class="flex items-center gap-2 rounded-full border border-lotus-pink/30 bg-lotus-pastel/45 px-2.5 py-1.5"><span class="inline-flex size-6 shrink-0 items-center justify-center">' + icon("maximize-2", "size-3.5 text-jade-dark") + '</span><label class="flex min-w-0 flex-1 items-center gap-2"><span class="sr-only">Cỡ thành phần</span><input type="range" min="0.75" max="1.35" step="0.05" value="' + u + '" aria-label="Cỡ thành phần" data-scale="1" class="audio-volume-slider h-1.5 w-full min-w-0 cursor-pointer" style="background:' + track(p) + '"><span class="w-8 shrink-0 text-right text-[11px] tabular-nums text-lotus-pink">' + Math.round(100 * u) + "%</span></label></div></div></div>";
    }
    return h + "</div>";
  }
  function refreshPop(which) {
    var el = $('[data-pop="' + which + '"]'); if (!el) return;
    var tmp = document.createElement("div"); tmp.innerHTML = which === "bgm" ? bgmControl() : scaleControl();
    el.replaceWith(tmp.firstChild);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]"); var act = a && a.getAttribute("data-act");
    if (act === "toggle-bgm" || act === "toggle-scale") { var w = act === "toggle-bgm" ? "bgm" : "scale"; var prev = popOpen; popOpen = popOpen === w ? null : w; if (prev && prev !== w) refreshPop(prev); refreshPop(w); return; }
    if (act === "audio-default") { UI.bgmVolume = 20; UI.bgmMuted = false; UI.sfxSuccessVolume = 30; UI.sfxFailVolume = 30; UI.sfxLeaderboardVolume = 30; UI.sfxMuted = false; saveUI(); bgmApply(); refreshPop("bgm"); return; }
    if (act === "bgm-toggle") { var A = UI.bgmMuted || UI.bgmVolume <= 0; if (A && UI.bgmVolume <= 0) { UI.bgmVolume = 20; UI.bgmMuted = false; } else UI.bgmMuted = !A; saveUI(); bgmApply(); refreshPop("bgm"); return; }
    if (act === "sfx-toggle") { UI.sfxMuted = !UI.sfxMuted; saveUI(); refreshPop("bgm"); return; }
    if (act === "scale-default") { UI.leaderboardScale = 1; saveUI(); applyScale(); refreshPop("scale"); return; }
    if (popOpen && !e.target.closest('[data-pop="' + popOpen + '"]')) { var p = popOpen; popOpen = null; refreshPop(p); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popOpen) { var p = popOpen; popOpen = null; refreshPop(p); } });
  document.addEventListener("input", function (e) {
    var t = e.target, k = t.getAttribute && t.getAttribute("data-vol");
    if (k) {
      var v = Number(t.value);
      if (k === "bgm") { UI.bgmVolume = v; UI.bgmMuted = v <= 0; bgmApply(); }
      else { if (k === "success") UI.sfxSuccessVolume = v; else if (k === "fail") UI.sfxFailVolume = v; else UI.sfxLeaderboardVolume = v; if (v > 0) UI.sfxMuted = false; }
      saveUI(); t.style.background = track(v); t.nextElementSibling.textContent = v + "%";
      return;
    }
    if (t.getAttribute && t.getAttribute("data-scale")) {
      UI.leaderboardScale = clamp(Math.round(100 * Number(t.value)) / 100, 0.75, 1.35); saveUI();
      t.style.background = track(((UI.leaderboardScale - 0.75) / 0.6) * 100); t.nextElementSibling.textContent = Math.round(100 * UI.leaderboardScale) + "%"; applyScale();
    }
  });
  document.addEventListener("pointerup", function (e) {
    var k = e.target.getAttribute && e.target.getAttribute("data-vol");
    if (k && k !== "bgm" && Number(e.target.value) > 0) playSfx(k, 0.85);
  });
  function applyScale() { var z = $("#dk-zoom"); if (z) z.style.zoom = UI.leaderboardScale; }

  /* ================= hộp thoại ================= */
  function dialogCls(extra) {
    return "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none dk-dialog " + extra;
  }
  function openModal(html) { modalRoot.innerHTML = html; document.body.style.overflow = "hidden"; }
  function closeModal() { modalRoot.innerHTML = ""; document.body.style.overflow = ""; }

  /* ================= ROUTER ================= */
  var cleanup = null;
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    closeModal(); popOpen = null;
    var p = (location.hash.replace(/^#/, "") || "/").split("?")[0];
    bgm.want = p === "/" || p === "/leaderboard"; bgmApply();
    window.scrollTo(0, 0);
    if (p === "/play") return pagePlay();
    if (p === "/result") return pageResult();
    if (p === "/leaderboard") return pageLeaderboard();
    if (p === "/collection") return pageCollection();
    return pageHome();
  }
  function go(p) { if (location.hash === "#" + p) route(); else location.hash = p; }
  window.addEventListener("hashchange", route);

  /* ================= TRANG CHỦ ================= */
  function pageHome() {
    var busy = false;
    function render() {
      var f = G.player, a = G.game ? G.game.attempt : null;
      var T = a && a.status === "completed", P = a && a.status === "in_progress";
      var body = "";
      if (f) {
        body += '<div class="flex items-center justify-center gap-3 rounded-[24px] bg-jade/12 px-4 py-3"><div class="min-w-0 text-center sm:text-left"><p class="truncate font-semibold text-ink">Xin chào, ' + esc(f.name) + "</p>" +
          (T ? badge("bg-gold/90 text-ink", "Đã hoàn thành") : P ? badge("bg-background-blue text-white", "Đang chơi") : badge("bg-paper text-ink-soft", "Chưa chơi")) + "</div></div>";
      }
      if (P && a) {
        var pct = (a.current_question / TOTAL) * 100;
        body += '<div class="space-y-2 rounded-[24px] border border-background-blue/20 bg-paper/80 p-4"><div class="flex items-center justify-between text-sm text-ink-soft"><span>Tiến trình: câu ' + a.current_question + "/" + TOTAL + '</span><span class="font-semibold text-ink">' + a.total_score + ' điểm</span></div><div data-slot="progress" class="relative w-full overflow-hidden rounded-full bg-primary/20 h-2"><div data-slot="progress-indicator" class="h-full w-full flex-1 bg-primary transition-all" style="transform:translateX(-' + (100 - pct) + '%)"></div></div></div>';
      }
      if (T) body += '<p class="rounded-[24px] bg-gold/15 px-4 py-3 text-center text-sm text-ink">Bạn đã hoàn thành lượt chơi. Chơi lại với cùng tên hoặc bắt đầu với tên khác.</p>';
      else body += '<section aria-label="Luật chơi" class="relative overflow-hidden rounded-[24px] border border-river-purple/25 bg-gradient-to-br from-lotus-light/35 via-paper-soft/90 to-jade/15 p-4 shadow-[0_10px_28px_-18px_rgba(155,123,234,0.45)] sm:p-5"><div aria-hidden="true" class="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-lotus-pink/20 blur-2xl"></div><div aria-hidden="true" class="pointer-events-none absolute -bottom-12 -left-6 size-24 rounded-full bg-jade/25 blur-2xl"></div><ul class="relative grid gap-2.5 text-sm text-ink"><li class="rounded-2xl border border-white/70 bg-paper-soft/85 px-3 py-3 leading-relaxed backdrop-blur-[2px]">Cùng lắng nghe và khám phá <strong class="font-semibold text-river-purple">10 nhạc cụ</strong>.</li><li class="rounded-2xl border border-white/70 bg-paper-soft/85 px-3 py-3 leading-relaxed backdrop-blur-[2px]">Mỗi câu được thử tối đa <strong class="font-semibold text-jade-dark">3 lần</strong>.</li><li class="rounded-2xl border border-lotus-pink/30 bg-lotus-light/25 px-3 py-3 leading-relaxed backdrop-blur-[2px] ring-1 ring-lotus-pink/15">Đoán càng sớm, điểm càng cao: lần 1 nhận <strong class="font-semibold text-lotus-pink">40 điểm</strong>, lần 2 nhận <strong class="font-semibold text-lotus-pink">30 điểm</strong>, lần 3 nhận <strong class="font-semibold text-lotus-pink">20 điểm</strong> và cộng thêm <strong class="font-semibold text-lotus-pink">2 điểm</strong> cho mỗi giây còn lại.</li></ul></section>';
      if (f) {
        if (T) body += '<div class="flex flex-col gap-3">' + btn({ cls: "w-full", disabled: busy, attrs: 'data-h="replay"', html: icon("play", "size-5") + "Chơi lại" }) + btn({ variant: "secondary", cls: "w-full", disabled: busy, attrs: 'data-h="end"', html: "Bắt đầu với tên khác" }) + btn({ variant: "secondary", cls: "w-full", attrs: 'data-h="result"', html: "Xem kết quả" }) + "</div>";
        else body += '<div class="flex flex-col gap-3">' + btn({ cls: "w-full", disabled: busy, attrs: 'data-h="continue"', html: icon("play", "size-5") + "Tiếp tục chơi" }) + btn({ variant: "secondary", cls: "w-full", disabled: busy, attrs: 'data-h="end"', html: "Đổi tên / người khác" }) + "</div>";
      } else {
        var val = ($("#player-name") || {}).value || "";
        body += '<form class="space-y-3" id="dk-form" novalidate><div class="space-y-2 text-left"><label for="player-name" class="block text-sm font-semibold text-ink">Nhập tên để bắt đầu</label><input id="player-name" maxlength="40" required minlength="2" placeholder="Tên của bạn" autocomplete="off" class="focus-ring w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink placeholder:text-ink-soft/60" value="' + esc(val) + '"></div>' +
          btn({ type: "submit", cls: "w-full", disabled: busy || val.trim().length < 2, attrs: 'id="dk-start"', html: icon("play", "size-5") + (busy ? "Đang bắt đầu…" : "Bắt đầu chơi") }) + "</form>";
      }
      body += '<div class="grid gap-3 border-t border-jade/20 pt-5 sm:grid-cols-2">' + btn({ variant: "secondary", cls: "w-full", href: "#/leaderboard", html: icon("trophy", "size-5") + "Bảng xếp hạng" }) + btn({ variant: "secondary", cls: "w-full", href: "#/collection", html: icon("library", "size-5") + "Bộ sưu tập" }) + "</div>";
      app.innerHTML = page(siteHeader('<div class="flex items-center gap-2">' + bgmControl() + "</div>") +
        '<main class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pb-16 pt-2">' + folkCard("space-y-6",
          '<div class="space-y-3 text-center"><p class="text-xs font-semibold tracking-[0.18em] text-river-purple uppercase">Thanh Âm Việt</p><h1 class="font-display text-4xl font-bold text-ink sm:text-5xl">Đờn Kết</h1><p class="mx-auto max-w-xl text-base leading-relaxed text-ink-soft">Nghe âm thanh, chọn đúng nhạc cụ Đờn ca tài tử Nam Bộ.</p></div>' + body) + "</main>");
      bind();
    }
    function bind() {
      var inp = $("#player-name");
      if (inp) inp.addEventListener("input", function () { var b = $("#dk-start"); if (b) b.disabled = busy || inp.value.trim().length < 2; });
      var form = $("#dk-form");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault(); if (busy) return;
        var n = inp.value.replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim();
        if (n.length < 2 || n.length > 40) { toast.error("Tên cần từ 2–40 ký tự"); return; }
        busy = true; render();
        registerName(n).then(function (res) {
          busy = false;
          if (res === "taken") { render(); toast.error("Tên “" + n + "” đã có người dùng. Bạn hãy đặt tên khác nhé"); var i2 = $("#player-name"); if (i2) { i2.focus(); i2.select(); } return; }
          G.player = { id: "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: n };
          newGame(); go("/play");
        });
      });
      $$("[data-h]").forEach(function (b) {
        b.addEventListener("click", function () {
          var h = b.getAttribute("data-h");
          if (h === "continue") go("/play");
          else if (h === "replay") { newGame(); go("/play"); }
          else if (h === "end") { endSession(); render(); }
          else if (h === "result") go("/result");
        });
      });
    }
    render();
  }

  /* ================= TRANG CHƠI ================= */
  function timerHtml(rem) {
    var r = rem == null ? QT : rem, i = clamp(r / QT, 0, 1), s = 2 * Math.PI * 38.5, c = rem != null, u = c && r <= 5, d = c && r > 5 && r <= 15;
    return '<div class="relative inline-flex items-center justify-center' + (u ? " animate-pulse" : "") + '" role="timer" aria-live="polite" aria-label="' + (rem == null ? "Chưa bắt đầu — " + QT + " giây" : "Còn " + r + " giây") + '" id="dk-timer"><svg width="84" height="84" class="-rotate-90" aria-hidden="true"><circle cx="42" cy="42" r="38.5" fill="none" stroke-width="7" class="stroke-lotus-pastel"></circle><circle cx="42" cy="42" r="38.5" fill="none" stroke-width="7" stroke-dasharray="' + s + '" stroke-dashoffset="' + s * (1 - i) + '" stroke-linecap="round" class="transition-[stroke-dashoffset] duration-200 ' + (c ? (u ? "stroke-wrong" : d ? "stroke-warning" : "stroke-lotus-light") : "stroke-lotus-light") + '"></circle></svg><span class="absolute font-display text-xl font-bold tabular-nums ' + (c ? (u ? "text-wrong" : d ? "text-warning" : "text-lotus-pink") : "text-lotus-pink") + '">' + r + "s</span></div>";
  }
  function viewStatus(pl) { var s = pl.status; if (s === "idle") return "ready"; if (s === "loading" && !pl.wantPlay) return "ready"; return s; }
  function audioPanel(st, vol, disabled) {
    var playing = st === "playing", loading = st === "loading" && st !== "ready", err = st === "error", ended = st === "ended";
    var h = '<div class="rounded-[24px] border border-lotus-light/35 bg-lotus-pastel/45 px-4 py-4 sm:px-5 sm:py-5" id="dk-audio"><div class="flex flex-col items-center gap-3"><div class="relative">';
    if (playing) h += '<span aria-hidden="true" class="absolute inset-[-8px] rounded-full border-2 border-lotus-light/70 dk-ring1"></span><span aria-hidden="true" class="absolute inset-[-14px] rounded-full border border-lotus-pastel dk-ring2"></span>';
    h += '<button type="button" id="dk-playbtn" ' + (disabled || loading ? "disabled " : "") + 'aria-label="' + (playing ? "Tạm dừng" : "Phát âm thanh") + '" class="focus-ring relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white text-white shadow-[0_12px_28px_-12px_rgba(239,139,197,0.45)] transition bg-lotus-pink hover:bg-lotus-pink/90 hover:-translate-y-0.5 active:translate-y-0.5 disabled:translate-y-0 disabled:bg-lotus-light disabled:text-white/80 disabled:saturate-75">' +
      (loading ? '<span class="text-[11px] font-medium text-white">…</span>' : playing ? icon("pause", "size-7 text-white", { sw: 2.25 }) : icon("play", "size-7 translate-x-0.5 text-white", { sw: 2.25 })) + "</button></div>" +
      '<p class="text-sm font-medium text-ink-soft">' + (err ? "Không phát được âm thanh" : loading ? "Đang tải…" : playing ? "Đang phát âm thanh..." : ended ? "Nghe lại" : "Chạm để nghe") + "</p>" +
      (err ? '<button type="button" id="dk-retry" class="text-xs font-semibold text-lotus-pink underline underline-offset-2">Thử lại</button>' : "") +
      '<label class="flex w-full max-w-xs items-center gap-2 text-xs text-ink-soft">' + icon("volume-2", "size-4 shrink-0 text-lotus-pink") + '<input type="range" min="0" max="100" step="1" value="' + vol + '" id="dk-vol" class="audio-volume-slider h-2 w-full flex-1 cursor-pointer" aria-label="Điều chỉnh âm lượng" style="background:' + track(vol) + '"><span class="w-9 shrink-0 text-right tabular-nums text-lotus-pink">' + vol + "%</span></label></div></div>";
    return h;
  }
  var OPT_BG = ["bg-jade/14", "bg-jade/10"];
  function optCls(p, pending) {
    var border = "border-white/80", bg = "bg-paper-soft/92", extra = "";
    if (p === "correct") { border = "border-correct/70"; bg = "bg-correct/10"; extra = "ring-2 ring-correct/35"; }
    else if (p === "wrong") { border = "border-wrong/65"; bg = "bg-wrong/10"; }
    else if (pending) { border = "border-jade/55"; bg = "bg-jade/10"; extra = "ring-2 ring-jade/30"; }
    if (p === "disabled" && !pending) extra += " pointer-events-none opacity-70";
    if (p === "idle") extra += " hover:border-jade/50 dk-can";
    return "relative flex min-h-[100px] flex-col items-center gap-1.5 rounded-[20px] border " + border + " " + bg + " p-2.5 text-center shadow-[0_8px_20px_-14px_rgba(39,108,107,0.28)] transition focus-ring sm:min-h-[110px] sm:p-3 dk-opt " + extra;
  }

  function pagePlay() {
    if (!G.player) return go("/");
    if (!G.game) newGame();
    if (G.game.attempt.status === "completed") return go("/result");
    var S = { submitting: false, continuing: false, pending: null, revealOpen: false, unlockOpen: false, retry: 0, shake: null };
    var player = Player(function (pl, tick) { if (tick) return; renderAudio(); });
    player.setVolume(UI.muted ? 0 : UI.volume);
    var loadedFor = null, tickId = null;

    function ensureAudio() {
      var q = curQ(); var src = BY_ID[q.instrument_id].audio_url + (S.retry ? "?r=" + S.retry : "");
      if (loadedFor !== src) { loadedFor = src; player.load(src); }
    }
    function canSelect(q) { return !!q && !!q.question_started_at && !S.submitting && !S.continuing && !finished(q); }
    function renderAudio() {
      var q = curQ(), el = $("#dk-audio"); if (!el) return;
      var tmp = document.createElement("div");
      tmp.innerHTML = audioPanel(viewStatus(player), player.volume, S.submitting || finished(q) || S.continuing);
      el.replaceWith(tmp.firstChild); bindAudio();
    }
    function render() {
      var a = G.game.attempt, q = curQ();
      ensureAudio();
      var ex = Math.max(0, MAXA - q.attempt_count), eb = finished(q), cs = canSelect(q);
      var ins = q.choice_instrument_ids.map(function (id) { return BY_ID[id]; });
      var wrongIds = q.selected_instrument_ids.filter(function (id) { return id !== q.instrument_id; });
      var opts = ins.map(function (e, d) {
        var h = wrongIds.indexOf(e.id) >= 0, m = eb && q.instrument_id === e.id, g = S.pending === e.id;
        var p = m ? "correct" : h ? "wrong" : cs ? "idle" : "disabled";
        var dis = !cs || h || eb;
        return '<button type="button" data-opt="' + e.id + '" ' + (dis ? "disabled " : "") + 'class="' + optCls(p, g && !h && !m) + (S.shake === e.id ? " dk-shake" : "") + '" aria-label="' + esc(e.name) + '" aria-disabled="' + dis + '">' +
          '<div class="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl sm:h-16 ' + OPT_BG[d % 2] + '"><img alt="" width="112" height="112" class="h-12 w-auto object-contain sm:h-14" src="' + e.image_url + '"></div>' +
          '<span class="line-clamp-2 text-xs font-semibold text-ink sm:text-sm">' + esc(e.name) + "</span>" +
          (p === "correct" ? '<span class="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-correct text-white shadow-sm">' + icon("check", "size-3.5") + '<span class="sr-only">Đúng</span></span>' : "") +
          (p === "wrong" ? '<span class="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-wrong text-white shadow-sm">' + icon("x", "size-3.5") + '<span class="sr-only">Sai</span></span>' : "") +
          "</button>";
      }).join("");
      app.innerHTML = page(siteHeader("") + '<main class="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 sm:pb-16">' + folkCard("space-y-4 sm:space-y-5",
        '<div class="flex items-center justify-between gap-3"><div class="min-w-0"><p class="font-display text-lg font-bold text-ink sm:text-xl">Câu ' + q.question_number + "/" + TOTAL + "</p>" + badge("mt-1 rounded-full bg-gold/25 text-ink", a.total_score + " điểm") + '</div><div class="flex shrink-0 items-center gap-2 sm:gap-3">' + badge("rounded-full bg-jade/20 text-jade-dark", "Còn " + ex + " lượt") + timerHtml(eb ? null : remaining(q)) + "</div></div>" +
        '<div class="h-3 w-full overflow-hidden rounded-full bg-lotus-pastel" role="progressbar" aria-valuenow="' + q.question_number + '" aria-valuemin="1" aria-valuemax="' + TOTAL + '" aria-label="Tiến độ câu hỏi"><div class="h-full rounded-full bg-lotus-light transition-[width] duration-300" style="width:' + (q.question_number / TOTAL) * 100 + '%"></div></div>' +
        audioPanel(viewStatus(player), player.volume, S.submitting || eb || S.continuing) +
        '<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">' + opts + "</div>") + "</main>");
      S.shake = null;
      bindAudio();
      $$("[data-opt]").forEach(function (b) { b.addEventListener("click", function () { select(b.getAttribute("data-opt")); }); });
      startTick();
    }
    function bindAudio() {
      var b = $("#dk-playbtn");
      if (b) b.addEventListener("click", function () {
        if (player.status === "playing") return player.pause();
        playQ();
      });
      var r = $("#dk-retry"); if (r) r.addEventListener("click", function () { S.retry++; render(); });
      var v = $("#dk-vol");
      if (v) v.addEventListener("input", function () { var n = Number(v.value); UI.volume = n; UI.muted = n <= 0; saveUI(); player.setVolume(n); v.style.background = track(n); v.nextElementSibling.textContent = n + "%"; });
    }
    function playQ() {
      var q = curQ(); if (!q || S.submitting || finished(q)) return;
      if (!q.question_started_at) { q.status = "playing"; q.question_started_at = new Date().toISOString(); saveG(); render(); }
      player.play().then(function (ok) { if (!ok) toast.error("Không phát được âm thanh."); });
    }
    function startTick() {
      stopTick();
      var q = curQ();
      if (!q.question_started_at || finished(q)) return;
      tickId = setInterval(function () {
        var q2 = curQ(), r = remaining(q2), t = $("#dk-timer");
        if (t) { var tmp = document.createElement("div"); tmp.innerHTML = timerHtml(r); t.replaceWith(tmp.firstChild); }
        if (r <= 0 && !finished(q2)) timeout();
      }, 200);
    }
    function stopTick() { if (tickId) { clearInterval(tickId); tickId = null; } }
    function timeout() {
      var q = curQ(); if (finished(q)) return;
      stopTick(); q.status = "timeout"; q.score_awarded = 0; G.game.attempt.timeout_count++; saveG();
      player.stop(); playSfx("fail"); S.revealOpen = true; render(); showReveal();
    }
    function select(id) {
      var q = curQ(); if (!canSelect(q)) return;
      var a = G.game.attempt;
      if (id === q.instrument_id) {
        var pts = C.POINTS_BY_ATTEMPT[Math.min(q.attempt_count, C.POINTS_BY_ATTEMPT.length - 1)] + C.POINTS_PER_SECOND_LEFT * (remaining(q) || 0);
        q.attempt_count++; q.selected_instrument_ids.push(id); q.status = "correct"; q.score_awarded = pts;
        a.total_score += pts; a.correct_count++; saveG(); stopTick();
        player.stop(); playSfx("success");
        confetti({ particleCount: 48, spread: 50, origin: { y: 0.7 }, colors: ["#62bcae", "#ef8bc5", "#276c6b", "#f7b6dc"] });
        S.revealOpen = true; render(); showReveal();
      } else {
        q.attempt_count++; q.selected_instrument_ids.push(id); S.shake = id;
        if (q.attempt_count >= MAXA) { q.status = "failed"; q.score_awarded = 0; a.wrong_count++; saveG(); stopTick(); player.stop(); playSfx("fail"); S.revealOpen = true; render(); showReveal(); }
        else { saveG(); render(); toast.message("Chưa chính xác, hãy nghe kỹ lại nhé"); }
      }
    }
    function showReveal() {
      var q = curQ(), o = BY_ID[q.instrument_id], h = q.score_awarded || 0;
      var title = q.status === "correct" ? "Chính xác!" : q.status === "timeout" ? "Hết giờ" : "Chưa chính xác";
      var last = q.question_number === TOTAL;
      openModal('<div data-slot="dialog-overlay" class="fixed inset-0 z-50 bg-black/50 dk-overlay"></div><div role="dialog" aria-modal="true" data-slot="dialog-content" class="' + dialogCls("max-h-[90vh] overflow-y-auto border-jade/30 bg-paper-soft sm:max-w-md") + '"><div data-slot="dialog-header" class="flex flex-col gap-2 text-center sm:text-left"><h2 data-slot="dialog-title" class="leading-none font-semibold font-display text-2xl text-ink">' + title + '</h2><p data-slot="dialog-description" class="font-display text-base text-ink-soft">' + esc(o.name) + "</p></div>" +
        '<div class="flex flex-col items-center gap-4"><div class="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-[24px] bg-jade/10"><img alt="' + esc(o.name) + '" width="220" height="220" class="h-36 w-auto object-contain" src="' + o.image_url + '"></div>' +
        (q.status === "correct" && h > 0 ? '<p class="font-display text-3xl font-bold text-correct dk-pop">+' + h + "</p>" : '<p class="font-display text-2xl font-bold text-ink-soft">+' + h + "</p>") +
        '<p class="text-sm leading-relaxed text-ink">' + esc(o.fact) + '</p><p class="text-sm text-ink-soft">Tổng điểm: <span class="font-semibold text-ink tabular-nums">' + G.game.attempt.total_score + "</span></p></div>" +
        '<div data-slot="dialog-footer" class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">' + btn({ cls: "w-full", attrs: 'id="dk-next"', html: last ? "Xem kết quả" : "Câu tiếp theo" }) + "</div></div>");
      $("#dk-next").addEventListener("click", function () {
        if (S.continuing) return;
        player.stop();
        if (q.question_number === UNLOCK_Q) { S.revealOpen = false; closeModal(); showUnlock(); return; }
        cont();
      });
    }
    function showUnlock() {
      S.unlockOpen = true;
      confetti({ particleCount: 48, spread: 62, startVelocity: 28, gravity: 0.85, origin: { y: 0.55 }, colors: ["#ef8bc5", "#c8b8ed", "#8fdcc7", "#f2c86b", "#f7b6dc"], scalar: 0.9 });
      var g2 = INSTR.filter(function (i) { return i.unlock_group === 2; });
      openModal('<div data-slot="dialog-overlay" class="fixed inset-0 z-50 bg-black/50 dk-overlay"></div><div role="dialog" aria-modal="true" data-slot="dialog-content" class="' + dialogCls("overflow-hidden border-gold/50 bg-paper-soft sm:max-w-lg") + '">' +
        '<div aria-hidden="true" class="pointer-events-none absolute -top-6 left-8 size-20 rounded-full bg-lotus-light/50 blur-md dk-blob1"></div><div aria-hidden="true" class="pointer-events-none absolute top-10 -right-4 size-24 rounded-full bg-cloud-lilac/45 blur-md dk-blob2"></div>' +
        '<div data-slot="dialog-header" class="flex flex-col gap-2 text-center sm:text-left relative"><h2 data-slot="dialog-title" class="leading-none font-semibold font-display text-2xl text-ink">Bạn đã mở khóa chặng Di sản!</h2><p data-slot="dialog-description" class="text-sm text-ink-soft">Ba nhạc cụ cuối đã hé lộ — tiếp tục khám phá câu 8–10.</p></div>' +
        '<div class="relative grid grid-cols-3 gap-3">' + g2.map(function (e, a) { return '<div class="paper-card flex flex-col items-center gap-2 p-3 dk-reveal" style="animation-delay:' + (0.2 + 0.18 * a) + 's"><div class="relative flex h-20 w-full items-center justify-center rounded-xl bg-jade/10"><img alt="' + esc(e.name) + '" width="80" height="80" class="h-16 w-auto object-contain" src="' + e.image_url + '"></div><p class="text-center text-xs font-semibold text-ink">' + esc(e.name) + "</p></div>"; }).join("") + "</div>" +
        '<div data-slot="dialog-footer" class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">' + btn({ cls: "w-full", attrs: 'id="dk-unlock-next"', html: "Tiếp tục khám phá" }) + "</div></div>");
      $("#dk-unlock-next").addEventListener("click", function () { S.unlockOpen = false; cont(); });
    }
    function cont() {
      var a = G.game.attempt;
      closeModal(); S.revealOpen = false;
      if (a.current_question >= TOTAL) {
        a.status = "completed"; a.completed_at = new Date().toISOString(); saveG();
        LS.set("don-ket-device-collection-v1", true);
        if (!G.game.submitted) {
          G.game.submitted = true; saveG();
          var dur = Math.floor((new Date(a.completed_at) - new Date(a.started_at)) / 1000);
          G.game.pendingSubmit = submitScore({ name: G.player.name, score: a.total_score, correct: a.correct_count, duration: dur, t: Date.now() });
        }
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 }, colors: ["#ef8bc5", "#62bcae", "#f7b6dc", "#276c6b"] });
        go("/result"); return;
      }
      a.current_question++; saveG(); render();
      var nq = curQ(); new Audio().src = BY_ID[nq.instrument_id].audio_url;
    }
    var onVis = function () { if (tickId) { var q = curQ(); if (remaining(q) <= 0 && !finished(q)) timeout(); } };
    document.addEventListener("visibilitychange", onVis);
    cleanup = function () { stopTick(); player.destroy(); document.removeEventListener("visibilitychange", onVis); };
    render();
    var q0 = curQ();
    if (finished(q0)) showReveal(); // tải lại trang khi đang xem đáp án
  }

  /* ================= TRANG KẾT QUẢ ================= */
  function pageResult() {
    if (!G.player || !G.game) return go("/");
    var a = G.game.attempt;
    if (a.status !== "completed") return go(a.status === "in_progress" ? "/play" : "/");
    var rank = null, rankLoading = true, alive = true;
    var homeBtn = headerBtn({ href: "#/", html: icon("house", "size-4") + "Về trang chủ" });
    var dur = Math.floor((new Date(a.completed_at) - new Date(a.started_at)) / 1000);
    var collected = []; var seen = {};
    G.game.questions.forEach(function (q) { if (q.status === "correct" && !seen[q.instrument_id]) { seen[q.instrument_id] = 1; collected.push(BY_ID[q.instrument_id]); } });
    collected.sort(function (e, t) { return e.unlock_group !== t.unlock_group ? t.unlock_group - e.unlock_group : t.order_index - e.order_index; });
    function rankCard() {
      if (rankLoading) return skel("h-14 w-full rounded-2xl");
      if (rank == null) return '<p class="rounded-2xl border border-jade/15 bg-paper px-4 py-3 text-center text-sm text-ink-soft">Chưa lấy được thứ hạng</p>';
      var i = rank === 1 ? { wrap: "border-[#e8c56a]/55 bg-[#fff6dd]", iconWrap: "bg-[#f2c86b] text-[#5c4810]", label: "text-[#8a6a18]", number: "text-[#7a5c12]", title: "Vàng", I: "trophy" }
        : rank === 2 ? { wrap: "border-[#c5ced8]/70 bg-[#f1f4f7]", iconWrap: "bg-[#b8c4d0] text-[#3d4a58]", label: "text-[#5a6a7a]", number: "text-[#3d4a58]", title: "Bạc", I: "trophy" }
          : rank === 3 ? { wrap: "border-[#d4a07a]/55 bg-[#fff0e6]", iconWrap: "bg-[#d4926a] text-[#5c3a22]", label: "text-[#8a5638]", number: "text-[#6e452c]", title: "Đồng", I: "trophy" }
            : { wrap: "border-river-purple/25 bg-river-purple/10", iconWrap: "bg-river-purple text-white", label: "text-river-purple", number: "text-ink", title: "Thứ hạng", I: "medal" };
      return '<div class="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 dk-up ' + i.wrap + '"><div class="flex items-center gap-2.5"><span class="inline-flex size-10 items-center justify-center rounded-full shadow-sm ' + i.iconWrap + '">' + icon(i.I, "size-5") + '</span><div class="text-left"><p class="text-[11px] font-semibold tracking-wide ' + i.label + '">' + i.title + '</p><p class="text-sm font-medium text-ink-soft">Thứ hạng</p></div></div><p class="font-display text-3xl font-bold tabular-nums ' + i.number + '">#' + rank + "</p></div>";
    }
    function stat(label, value, ic, wrap, iconWrap, valueClass) {
      return '<div class="flex items-center gap-3 rounded-2xl border px-3.5 py-3 ' + wrap + '"><span class="inline-flex size-9 shrink-0 items-center justify-center rounded-full ' + iconWrap + '">' + ic + '</span><div class="min-w-0 flex-1 text-left"><p class="text-xs text-ink-soft">' + label + '</p><p class="font-display text-xl font-bold tabular-nums leading-tight ' + valueClass + '">' + value + "</p></div></div>";
    }
    function render() {
      var prev = collected.slice(0, 4);
      app.innerHTML = page('<div class="relative z-10 flex min-h-dvh flex-1 flex-col">' + siteHeader(homeBtn, G.player.name) +
        '<main class="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center overflow-y-auto px-4 py-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-8"><div class="paper-card my-auto w-full space-y-4 border-jade/12 bg-paper-soft/95 p-5 sm:space-y-5 sm:p-6">' +
        '<section class="space-y-3.5 text-center"><div class="space-y-1.5"><p class="text-[11px] font-semibold tracking-[0.18em] text-jade-dark uppercase">Hoàn thành</p><h1 class="font-display text-xl font-bold text-ink sm:text-2xl">Tuyệt vời, bạn đã hoàn thành!</h1></div><div id="dk-rank">' + rankCard() + '</div><div class="flex items-baseline justify-center gap-2"><p class="font-display text-4xl font-bold tabular-nums tracking-tight text-ink sm:text-5xl" id="dk-score">0</p><span class="text-sm font-medium tracking-wide text-ink-soft">điểm</span></div></section>' +
        '<div class="grid grid-cols-2 gap-2.5">' +
        stat("Đúng", a.correct_count, icon("circle-check", "size-3.5"), "border-jade/25 bg-jade/10", "bg-jade/25 text-jade-dark", "text-jade-dark") +
        stat("Sai", a.wrong_count, icon("circle-x", "size-3.5"), "border-lotus-pink/25 bg-lotus-pastel/70", "bg-lotus-light text-lotus-pink", "text-lotus-pink") +
        stat("Hết giờ", a.timeout_count, icon("clock-alert", "size-3.5"), "border-gold/40 bg-gold/15", "bg-gold/35 text-ink", "text-ink") +
        stat("Thời gian", fmtDur(dur), icon("timer", "size-3.5"), "border-river-purple/25 bg-river-purple/10", "bg-river-purple/20 text-river-purple", "text-river-purple") + "</div>" +
        '<section class="space-y-2.5 text-left"><div class="flex items-baseline justify-between gap-2"><h2 class="font-display text-base font-semibold text-ink">Bộ sưu tập</h2><p class="text-sm tabular-nums text-ink-soft">' + collected.length + "/" + TOTAL + "</p></div>" +
        (prev.length === 0 ? '<p class="py-3 text-center text-sm text-ink-soft">Chưa có nhạc cụ.</p>' : '<div class="grid grid-cols-4 gap-2">' + prev.map(function (e) { return '<div class="relative flex flex-col items-center gap-1 rounded-2xl bg-paper px-1 py-2">' + (e.unlock_group === 2 ? '<span class="absolute top-1 right-1 text-[9px] font-semibold text-jade-dark">Mới</span>' : "") + '<div class="flex h-12 w-full items-center justify-center"><img alt="" width="56" height="56" class="h-11 w-auto object-contain" src="' + e.image_url + '"></div><p class="w-full truncate text-center text-[10px] text-ink">' + esc(e.name) + "</p></div>"; }).join("") + "</div>") +
        '<a class="block text-center text-sm font-medium text-jade-dark underline-offset-2 hover:underline" href="#/collection">Xem đủ bộ sưu tập</a></section>' +
        '<div class="flex flex-col gap-2.5 pt-1">' + btn({ size: "md", cls: "h-11 w-full", attrs: 'data-r="replay"', html: icon("play", "size-4") + "Chơi lại" }) + btn({ variant: "secondary", size: "md", cls: "h-11 w-full", attrs: 'data-r="end"', html: icon("user-round", "size-4") + "Bắt đầu với tên khác" }) + btn({ variant: "secondary", size: "md", cls: "h-11 w-full", href: "#/leaderboard", html: icon("trophy", "size-4") + "Xem bảng xếp hạng" }) + "</div>" +
        "</div></main></div>", "relative min-h-dvh");
      $$("[data-r]").forEach(function (b) { b.addEventListener("click", function () { if (b.getAttribute("data-r") === "replay") { newGame(); go("/play"); } else { endSession(); go("/"); } }); });
    }
    render();
    // đếm điểm tăng dần
    var target = a.total_score, el = $("#dk-score"), key = "dk-celebrated-" + a.completed_at;
    if (SS.get(key, false) || reduced()) el.textContent = target;
    else {
      SS.set(key, true); playSfx("leaderboard", 0.75);
      setTimeout(function () { confetti({ particleCount: 22, spread: 42, startVelocity: 22, gravity: 0.95, ticks: 100, origin: { y: 0.32 }, colors: ["#f2c86b", "#c5ced8", "#d4926a", "#62bcae", "#ef8bc5"] }); }, 200);
      var t0 = performance.now();
      (function step(t) { var n = Math.min(1, (t - t0) / 800); if (el.isConnected) el.textContent = Math.round(target * (1 - Math.pow(1 - n, 3))); if (n < 1) requestAnimationFrame(step); })(t0);
    }
    Promise.resolve(G.game.pendingSubmit).then(function () { return apiMyRank(G.player.name); }).then(function (r) { rank = r ? r.rank : null; }, function () { rank = null; }).then(function () {
      rankLoading = false; if (!alive) return; var x = $("#dk-rank"); if (x) x.innerHTML = rankCard();
    });
    cleanup = function () { alive = false; };
  }

  /* ================= BẢNG XẾP HẠNG ================= */
  function titleName(e) {
    var t = (e || "").trim();
    return t ? t.split(/\s+/).map(function (w) { return w ? w.charAt(0).toLocaleUpperCase("vi-VN") + w.slice(1).toLocaleLowerCase("vi-VN") : w; }).join(" ") : "Người Chơi";
  }
  function podiumName(e) {
    var a = titleName(e), r = a.split(/\s+/).filter(Boolean);
    if (r.length <= 2) return a;
    return r.slice(0, -1).map(function (x) { return x.charAt(0).toLocaleUpperCase("vi-VN"); }).join("") + " " + r[r.length - 1];
  }
  var AV = INSTR.filter(function (i) { return !!i.image_url; });
  function avatarFor(name) {
    var t = (name || "").trim(), r = t ? t.charAt(0).toLocaleUpperCase("vi-VN") : "?", a = 0;
    for (var i = 0; i < r.length; i++) a = (31 * a + r.charCodeAt(i)) >>> 0;
    return { imageUrl: AV[a % AV.length].image_url, initial: r };
  }
  function pageLeaderboard() {
    var rows = null, loading = true, err = false, status = "reconnecting", alive = true, hl = null, deltas = {}, myRank = null, canPlay = !(G.game && G.game.attempt.status === "completed");
    var right = '<div class="flex items-center gap-2">' + scaleControl() + bgmControl() + headerBtn({ href: "#/", html: icon("house", "size-4") + "Trang chủ" }) + "</div>";
    function skeleton() {
      var col = function (big) { return '<div class="flex flex-col items-center gap-2">' + skel(big ? "size-7 rounded-md" : "h-5 w-4 rounded-md") + skel(big ? "size-24 rounded-full sm:size-28" : "size-[4.75rem] rounded-full sm:size-[5.25rem]") + skel(big ? "h-5 w-20 rounded-md" : "h-4 w-16 rounded-md") + skel(big ? "h-8 w-16 rounded-md" : "h-8 w-14 rounded-md") + "</div>"; };
      var list = ""; for (var i = 0; i < 7; i++) list += '<div class="flex items-center gap-2 sm:gap-2.5">' + skel("h-5 w-6 rounded-md sm:w-7") + '<div class="relative min-w-0 flex-1 py-2 pl-7 sm:pl-8">' + skel("h-11 w-full rounded-r-full sm:h-12") + skel("absolute top-1/2 left-0 size-14 -translate-y-1/2 rounded-full sm:size-16") + "</div></div>";
      return '<div class="space-y-6" aria-hidden="true"><div class="grid grid-cols-3 items-end gap-2 px-1 py-3 sm:gap-5">' + col(false) + col(true) + col(false) + '</div><div class="space-y-3">' + list + "</div></div>";
    }
    function avatar(rootCls, imgCls, fbCls, row) {
      var av = avatarFor(titleName(row.displayName));
      var pos = /(^|\s)absolute(\s|$)/.test(rootCls) ? "" : "relative ";
      return '<span data-slot="avatar" class="' + pos + 'flex shrink-0 overflow-hidden rounded-full ' + rootCls + '"><img data-slot="avatar-image" class="aspect-square size-full ' + imgCls + '" alt="" src="' + av.imageUrl + '" onerror="this.nextElementSibling.style.display=\'\';this.remove()"><span data-slot="avatar-fallback" class="flex size-full items-center justify-center rounded-full ' + fbCls + '" style="display:none">' + esc(av.initial) + "</span></span>";
    }
    function podium(row, place) {
      var p = place === 1, hi = row.userId === hl || row.isCurrentUser, d = deltas[row.userId];
      var top = p ? '<span class="relative inline-flex items-center justify-center"><span aria-hidden="true" class="absolute inset-[-6px] rounded-full bg-gold/35 blur-md dk-glow"></span><span aria-hidden="true" class="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(242,200,107,0.9)] dk-spark1"></span><span aria-hidden="true" class="absolute -bottom-0.5 -left-1 size-1 rounded-full bg-gold dk-spark2"></span><span class="relative inline-flex dk-crown">' + icon("crown", "size-7 text-gold drop-shadow-[0_2px_8px_rgba(242,200,107,0.65)] sm:size-8", { fill: "currentColor" }) + "</span></span>"
        : '<span class="font-display text-lg font-bold tabular-nums leading-none sm:text-xl ' + (place === 2 ? "text-river-purple" : "text-[#d4926a]") + '" aria-label="Hạng ' + place + '">' + place + "</span>";
      return '<article class="flex w-full flex-col items-center gap-2 text-center ' + (p ? "z-[1] " : "") + (hi ? "drop-shadow-[0_0_12px_rgba(239,139,197,0.35)] " : "") + (d ? "dk-rise" : "dk-up") + '">' + top +
        '<div class="relative rounded-full border-[3px] border-white bg-paper-soft shadow-[0_10px_24px_-12px_rgba(39,108,107,0.35)] ' + (p ? "size-24 ring-[3px] ring-gold/75 sm:size-28" : "size-[4.75rem] ring-2 sm:size-[5.25rem]") + (place === 2 ? " ring-river-purple/45" : "") + (place === 3 ? " ring-[#d4926a]/50" : "") + '">' +
        avatar("size-full bg-lotus-pastel/70", "object-contain p-2 sm:p-2.5", "bg-gradient-to-br from-lotus-pastel via-paper-soft to-jade/30 font-display text-lg text-ink sm:text-xl", row) +
        (row.isCurrentUser ? '<span class="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-lotus-pastel px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-lotus-pink uppercase shadow-sm ring-2 ring-white">Bạn</span>' : "") + "</div>" +
        '<div class="flex w-full flex-col items-center gap-1 px-0.5"><p title="' + esc(titleName(row.displayName)) + '" class="max-w-full truncate font-semibold text-ink ' + (p ? "text-base sm:text-lg" : "text-sm sm:text-base") + (row.isCurrentUser ? " mt-3" : "") + '">' + esc(podiumName(row.displayName)) + "</p></div>" +
        '<p class="font-display text-2xl font-bold tabular-nums leading-none sm:text-3xl' + (p ? " text-gold" : "") + (place === 2 ? " text-[#8b97a5]" : "") + (place === 3 ? " text-[#d4926a]" : "") + '">' + viNum(row.totalScore) + "</p></article>";
    }
    function listRow(e) {
      var n = titleName(e.displayName), hi = hl === e.userId, d = deltas[e.userId];
      return '<div class="flex items-center gap-2 sm:gap-2.5 ' + (hi ? "drop-shadow-[0_0_10px_rgba(239,139,197,0.28)] " : "") + (d ? "dk-rise" : "dk-up") + '"><span class="flex w-6 shrink-0 items-center justify-center sm:w-7"><span class="font-display text-lg font-bold tabular-nums text-jade-dark sm:text-xl">' + e.rank + '</span></span><div class="relative min-w-0 flex-1 py-2 pl-7 sm:pl-8"><div class="flex h-11 min-w-0 items-stretch overflow-hidden rounded-r-full border border-white/70 border-l-0 shadow-[0_6px_18px_-12px_rgba(39,108,107,0.28)] sm:h-12' + (e.isCurrentUser ? " ring-2 ring-lotus-pink/45 ring-offset-1 ring-offset-paper-soft" : "") + '"><div class="flex min-w-0 flex-1 items-center gap-1.5 truncate py-1 pr-2 pl-9 sm:pl-10 ' + (e.isCurrentUser ? "bg-jade/28" : "bg-jade/20") + '"><p title="' + esc(n) + '" class="truncate text-sm font-semibold tracking-wide text-ink sm:text-base">' + esc(n) + "</p>" + (e.isCurrentUser ? '<span class="shrink-0 rounded-full bg-lotus-pastel px-1.5 py-0.5 text-[9px] font-semibold text-lotus-pink uppercase">Bạn</span>' : "") + '</div><div class="flex shrink-0 items-center justify-end px-3.5 sm:min-w-[5.25rem] sm:px-4 ' + (e.isCurrentUser ? "bg-lotus-pink/35" : "bg-lotus-pink/25") + '"><p class="font-display text-base font-bold tabular-nums text-lotus-pink sm:text-lg">' + viNum(e.totalScore) + "</p></div></div>" +
        avatar("absolute top-1/2 left-0 size-14 -translate-y-1/2 border-2 border-white bg-lotus-pastel/80 shadow-md sm:size-16", "object-contain p-1.5 sm:p-2", "bg-gradient-to-br from-lotus-pastel to-jade/20 text-base font-semibold text-ink", e) + "</div></div>";
    }
    function statusIcon() {
      var a = status === "subscribed", lbl = a ? "Đang cập nhật trực tiếp" : status === "error" ? "Tạm mất kết nối" : "Đang kết nối lại...";
      return '<span role="status" aria-label="' + lbl + '" title="' + lbl + '" class="inline-flex size-8 items-center justify-center rounded-full bg-paper/80">' + icon("radio", "size-4 " + (a ? "text-correct" : status === "error" ? "text-wrong" : "text-warning")) + "</span>";
    }
    function body() {
      var h = "";
      if (err && rows === null) h += '<div class="space-y-3 rounded-[24px] border border-wrong/20 bg-wrong/10 px-4 py-8 text-center"><p class="font-display text-lg font-semibold text-ink">Chưa thể tải bảng xếp hạng</p>' + btn({ size: "md", cls: "mx-auto", attrs: 'data-l="retry"', html: "Thử lại" }) + "</div>";
      if (err && rows !== null) h += '<div class="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-wrong/10 px-3 py-2.5 text-sm text-wrong"><p>Tạm mất kết nối — đang hiển thị dữ liệu gần nhất.</p><button type="button" data-l="retry" class="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all outline-none border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 gap-1.5 px-3 rounded-full">Thử lại</button></div>';
      if (loading && rows === null) h += skeleton();
      else if (rows && rows.length === 0) h += '<div class="space-y-4 rounded-[24px] bg-paper/90 px-4 py-12 text-center"><p class="font-display text-xl font-semibold text-ink">Chưa có tên nào trên bảng xếp hạng</p><p class="text-sm text-ink-soft">Hãy trở thành người đầu tiên hoàn thành hành trình!</p>' + (canPlay ? btn({ size: "md", cls: "mx-auto", href: "#/", html: icon("play", "size-4") + "Bắt đầu chơi" }) : "") + "</div>";
      else if (rows) {
        var W = rows.slice(0, 3), X = rows.slice(3, 10);
        h += '<div class="space-y-6"><div class="space-y-3 py-3"><div class="grid grid-cols-3 items-end gap-2 sm:gap-5 sm:px-2"><div class="flex justify-center pb-0">' + (W[1] ? podium(W[1], 2) : "") + '</div><div class="flex justify-center pb-0">' + podium(W[0], 1) + '</div><div class="flex justify-center pb-0">' + (W[2] ? podium(W[2], 3) : "") + "</div></div>" +
          (rows.length === 1 ? '<p class="mx-auto max-w-sm text-center text-sm leading-relaxed text-ink-soft">Bạn đang dẫn đầu hành trình!<br>Các vị trí tiếp theo vẫn đang chờ người chinh phục.</p>' : "") + "</div>" +
          (X.length ? '<div class="space-y-2.5">' + X.map(listRow).join("") + "</div>" : "") + "</div>";
      }
      return h;
    }
    function render() {
      app.innerHTML = page(siteHeader(right) + '<main class="mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center px-4 pb-16 sm:px-4"><div class="mx-auto w-full origin-top" id="dk-zoom" style="zoom:' + UI.leaderboardScale + '"><div class="paper-card p-5 sm:p-7 relative mx-auto w-full max-w-[820px] space-y-5 rounded-[30px] border-white/75 bg-paper-soft/[0.95] p-4 sm:space-y-6 sm:p-6"><div class="relative space-y-1 text-center"><h1 class="font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl">Bảng Xếp Hạng</h1><p class="text-sm text-ink-soft">Cập nhật trực tiếp</p><div class="absolute top-0 right-0" id="dk-status">' + statusIcon() + '</div></div><div id="dk-board">' + body() + "</div></div></div></main>");
      bindBody();
    }
    function bindBody() { $$('[data-l="retry"]').forEach(function (b) { b.addEventListener("click", function () { load(false); }); }); }
    function paint() { var b = $("#dk-board"); if (b) { b.innerHTML = body(); bindBody(); } var s = $("#dk-status"); if (s) s.innerHTML = statusIcon(); }
    function load(silent) {
      return apiLeaderboard(10).then(function (list) {
        if (!alive) return;
        if (rows) {
          var prev = {}, changed = false, d = {};
          rows.forEach(function (r) { prev[r.userId] = r; });
          list.forEach(function (r) { var t = prev[r.userId]; if (!t) { d[r.userId] = "new"; changed = true; } else if (r.rank < t.rank) { d[r.userId] = "up"; changed = true; } else if (r.rank > t.rank) { d[r.userId] = "down"; changed = true; } else if (r.totalScore !== t.totalScore || r.correctCount !== t.correctCount) changed = true; });
          if (rows.length !== list.length) changed = true;
          if (changed) {
            playSfx("leaderboard", 0.72);
            hl = Object.keys(d)[0] || null; deltas = d;
            setTimeout(function () { hl = null; deltas = {}; }, 2000);
            var me = list.filter(function (r) { return r.isCurrentUser; })[0];
            if (me && myRank !== null && me.rank !== myRank) toast.message(me.rank < myRank ? "Thứ hạng của bạn đã tăng!" : "Thứ hạng của bạn đã giảm");
            else toast.message("Bảng xếp hạng vừa được cập nhật");
            if (me) myRank = me.rank;
          }
        } else { var m = list.filter(function (r) { return r.isCurrentUser; })[0]; myRank = m ? m.rank : null; }
        var changedAny = !rows || JSON.stringify(rows) !== JSON.stringify(list);
        rows = list; err = false; loading = false; status = SB ? "subscribed" : "subscribed";
        if (changedAny) paint(); else { var s = $("#dk-status"); if (s) s.innerHTML = statusIcon(); }
      }).catch(function () { if (!alive) return; err = true; loading = false; status = "error"; paint(); });
    }
    render(); load(true);
    var poll = setInterval(function () { if (!document.hidden) load(true); }, 5000);
    cleanup = function () { alive = false; clearInterval(poll); };
  }

  /* ================= BỘ SƯU TẬP ================= */
  function pageCollection() {
    var L = deviceUnlocked();
    var tracks = C.COLLECTION_TRACKS, sel = tracks[0].id, autoplay = false, alive = true;
    var mp = Player(function (pl, tick) { if (!alive) return; if (!tick && autoplay && pl.status === "ready") { autoplay = false; pl.play(); } paintMusic(tick); });
    mp.el.preload = "metadata"; mp.setVolume(UI.volume);
    var sheetPlayer = null, sheetIns = null;
    function selTrack() { return tracks.filter(function (t) { return t.id === sel; })[0]; }
    function musicHtml() {
      var m = selTrack(), el = mp.el, x = isFinite(el.duration) && el.duration > 0 ? el.duration : 0, cur = el.currentTime || 0, p = x > 0 ? Math.min(100, (cur / x) * 100) : 0;
      var isPlaying = mp.status === "playing", isLoading = mp.status === "loading" && mp.wantPlay, hasErr = mp.status === "error", ended = mp.status === "ended";
      var f = fmtDur(cur) + " / " + fmtDur(x > 0 ? x : null);
      return '<section class="paper-card space-y-4 p-4" id="dk-music"><div class="space-y-1"><h2 class="font-display text-xl font-semibold text-ink">Nhạc bộ sưu tập</h2><p class="text-sm text-ink-soft">Ba bài Đờn ca tài tử — chọn bài rồi nhấn phát.</p></div><ul class="space-y-2">' +
        tracks.map(function (e) {
          var i = e.id === m.id, n = i && isPlaying;
          return '<li><button type="button" data-track="' + e.id + '" class="focus-ring flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ' + (i ? "border-river-purple/35 bg-lotus-light/20" : "border-transparent bg-paper/70 hover:bg-paper") + '"><span class="flex size-10 shrink-0 items-center justify-center rounded-full ' + (i ? "bg-lotus-pink text-white" : "bg-ink/10 text-ink") + '" aria-hidden="true">' + (n ? icon("pause", "size-4") : icon("play", "size-4 translate-x-0.5")) + '</span><span class="min-w-0 flex-1"><span class="block truncate font-medium text-ink">' + esc(e.title) + '</span><span class="block text-xs text-ink-soft">' + (i ? (hasErr ? "Không phát được" : isLoading ? "Đang tải…" : n ? "Đang phát" : ended ? "Đã phát xong" : "Đã chọn") : "Chạm để chọn") + "</span></span>" +
            (!i || hasErr || isLoading ? "" : '<span class="shrink-0 text-[11px] tabular-nums text-lotus-pink sm:text-xs" data-mtime="1">' + f + "</span>") + "</button></li>";
        }).join("") + '</ul><div class="space-y-3 border-t border-ink/10 pt-3"><div class="space-y-1.5"><div class="flex items-center justify-between gap-2 text-[11px] tabular-nums text-ink-soft sm:text-xs"><span data-mcur="1">' + fmtDur(cur) + "</span><span>" + fmtDur(x > 0 ? x : null) + '</span></div><input type="range" min="0" max="' + (x > 0 ? x : 1) + '" step="0.1" value="' + (x > 0 ? cur : 0) + '" ' + (x <= 0 || hasErr || isLoading ? "disabled " : "") + 'id="dk-seek" class="audio-volume-slider h-2 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" aria-label="Tiến trình phát nhạc" style="background:' + track(p) + '"></div><label class="flex w-full items-center gap-2 text-xs text-ink-soft">' + icon("volume-2", "size-4 shrink-0 text-lotus-pink") + '<input type="range" min="0" max="100" step="1" value="' + mp.volume + '" id="dk-mvol" class="audio-volume-slider h-2 w-full flex-1 cursor-pointer" aria-label="Điều chỉnh âm lượng" style="background:' + track(mp.volume) + '"><span class="w-9 shrink-0 text-right tabular-nums text-lotus-pink">' + mp.volume + "%</span></label></div></section>";
    }
    var seeking = false;
    function paintMusic(tick) {
      var sec = $("#dk-music"); if (!sec) return;
      if (tick) {
        if (seeking) return;
        var el = mp.el, x = isFinite(el.duration) && el.duration > 0 ? el.duration : 0, cur = el.currentTime || 0, p = x > 0 ? Math.min(100, (cur / x) * 100) : 0;
        var s = $("#dk-seek"); if (s && x > 0) { s.max = x; s.value = cur; s.disabled = false; s.style.background = track(p); var lab = s.previousElementSibling.lastElementChild; lab.textContent = fmtDur(x); }
        var mc = $('[data-mcur="1"]'); if (mc) mc.textContent = fmtDur(cur);
        var mt = $('[data-mtime="1"]'); if (mt) mt.textContent = fmtDur(cur) + " / " + fmtDur(x > 0 ? x : null);
        return;
      }
      var tmp = document.createElement("div"); tmp.innerHTML = musicHtml(); sec.replaceWith(tmp.firstChild); bindMusic();
    }
    function bindMusic() {
      $$("[data-track]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-track");
          if (id === sel) { if (mp.status === "playing") mp.pause(); else { if (!mp.src) mp.load(selTrack().audio_url); mp.play(); } }
          else { sel = id; autoplay = true; mp.load(selTrack().audio_url); paintMusic(); }
        });
      });
      var s = $("#dk-seek");
      if (s) { s.addEventListener("input", function () { seeking = true; mp.seek(Number(s.value)); }); s.addEventListener("change", function () { seeking = false; }); }
      var v = $("#dk-mvol");
      if (v) v.addEventListener("input", function () { var n = Number(v.value); mp.setVolume(n); v.style.background = track(n); v.nextElementSibling.textContent = n + "%"; });
    }
    function render() {
      var H = L ? TOTAL : 0;
      var cards = INSTR.map(function (e, i) {
        var s = e.unlock_group === 2, a = !L && s, n = L, l = !!(L && e.fact && n), r = !a;
        return '<article ' + (l ? 'role="button" tabindex="0" data-ins="' + e.id + '" aria-label="Xem đầy đủ thông tin ' + esc(e.name) + '" ' : a ? 'aria-label="Nhạc cụ đang khóa" ' : "") + 'class="paper-card flex flex-col p-3 sm:p-4 dk-up' + (a ? " opacity-80" : "") + (l ? " cursor-pointer focus-ring outline-none transition-shadow hover:shadow-md dk-card-lift" : "") + '" style="animation-delay:' + 0.04 * i + 's">' +
          '<div class="relative mb-3 flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-jade/10 sm:h-32"><img alt="' + (a ? "Nhạc cụ đang khóa" : esc(e.name)) + '" width="140" height="140" class="h-24 w-auto object-contain' + (a ? " scale-105 brightness-75 contrast-75 blur-[3px] saturate-50" : "") + '" src="' + e.image_url + '">' +
          (a ? '<div class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-cloud-lilac/25 backdrop-blur-[1px]">' + icon("lock", "size-6 text-locked-mauve") + '<span class="px-2 text-center text-[10px] font-medium text-ink-soft">' + (L ? "Hoàn thành câu " + UNLOCK_Q + " để mở khóa" : "Hoàn thành lượt chơi để mở khóa") + "</span></div>" : "") + "</div>" +
          '<div class="mb-2 flex items-start justify-between gap-1"><h2 class="font-display text-sm font-semibold text-ink sm:text-base">' + (r ? esc(e.name) : "???") + "</h2></div>" +
          (l ? '<div><p class="line-clamp-4 text-xs leading-relaxed text-ink-soft sm:text-sm">' + esc(e.fact) + '</p><span class="mt-1.5 inline-block text-[11px] font-semibold text-jade-dark">Xem đầy đủ</span></div>'
            : '<p class="text-xs text-ink-soft/80 sm:text-sm">' + (a ? (s ? "Hoàn thành câu " + UNLOCK_Q + " để mở khóa." : "Hoàn thành một lượt chơi trên thiết bị để mở khóa.") : L ? "Hoàn thành câu hỏi để xem chi tiết." : "Hoàn thành một lượt chơi để xem chi tiết.") + "</p>") + "</article>";
      }).join("");
      app.innerHTML = page(siteHeader(headerBtn({ attrs: 'data-c="back"', html: icon("arrow-left", "size-4") + "Trở lại" })) +
        '<main class="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">' + folkCard("space-y-5",
          '<div class="space-y-2"><h1 class="font-display text-3xl font-bold text-ink">Bộ sưu tập nhạc cụ</h1><p class="text-sm text-ink-soft">Đã thu thập ' + H + "/" + TOTAL + " nhạc cụ" + (L ? "" : " · 3 nhạc cụ cuối mở sau câu " + UNLOCK_Q) + "</p></div>" + musicHtml() +
          (L ? "" : '<p class="rounded-2xl border border-river-purple/20 bg-lotus-light/15 px-4 py-3 text-sm text-ink-soft">Xem trước 7 nhạc cụ đầu. Hoàn thành một lượt chơi để xem chi tiết và mở đủ 10 loại nhạc cụ.</p>') +
          '<div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">' + cards + "</div>") + "</main>");
      bindMusic();
      $('[data-c="back"]').addEventListener("click", function () { if (history.length > 1) history.back(); else go("/"); });
      $$("[data-ins]").forEach(function (c) {
        var open = function () { openSheet(BY_ID[c.getAttribute("data-ins")]); };
        c.addEventListener("click", open);
        c.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } });
      });
    }
    function openSheet(e) {
      mp.pause(); sheetIns = e;
      var r = matchMedia("(min-width: 768px)").matches;
      sheetPlayer = Player(function () { paintSheetAudio(); });
      sheetPlayer.setVolume(UI.volume); sheetPlayer.load(e.audio_url);
      openModal('<div class="fixed inset-0 z-50 bg-ink/45 dk-overlay" data-sclose="1"></div><div role="dialog" aria-modal="true" aria-labelledby="dk-sheet-t" class="fixed z-50 flex max-h-[min(96dvh,900px)] w-full max-w-lg flex-col gap-0 overflow-hidden bg-paper-soft outline-none ' + (r ? "top-1/2 left-1/2 max-h-[min(90dvh,860px)] rounded-[28px] border border-jade/20 shadow-2xl dk-sheet-desktop" : "inset-x-0 bottom-0 mx-auto rounded-t-[28px] border border-jade/20 border-b-0 shadow-2xl dk-sheet-mobile") + '">' +
        (r ? "" : '<div class="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-ink/15" aria-hidden="true"></div>') +
        '<div class="relative flex items-start justify-between gap-3 px-5 pr-12 pb-2 sm:px-6 ' + (r ? "pt-5" : "pt-3") + '"><div class="min-w-0 space-y-1"><h2 id="dk-sheet-t" class="font-display text-3xl font-bold text-ink sm:text-4xl">' + esc(e.name) + '</h2><p class="sr-only">Thông tin chi tiết về ' + esc(e.name) + '</p></div><button type="button" aria-label="Đóng" data-sclose="1" class="absolute right-4 rounded-full bg-jade/10 p-2 text-ink opacity-80 transition-opacity hover:opacity-100 focus-ring ' + (r ? "top-4" : "top-3") + '">' + icon("x", "size-4") + "</button></div>" +
        '<div class="overflow-y-auto overscroll-contain px-5 sm:px-6 ' + (r ? "pb-5" : "pb-[max(1.25rem,env(safe-area-inset-bottom))]") + '"><div class="flex flex-col gap-5 pb-3"><div class="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-[26px] bg-jade/10 sm:h-72"><img alt="' + esc(e.name) + '" width="360" height="360" class="h-56 w-auto object-contain sm:h-64" src="' + e.image_url + '"></div><div id="dk-sheet-audio"></div><p class="text-base leading-relaxed text-ink whitespace-pre-wrap sm:text-lg">' + esc(e.fact) + "</p></div></div></div>");
      paintSheetAudio();
      $$("[data-sclose]").forEach(function (b) { b.addEventListener("click", closeSheet); });
    }
    function paintSheetAudio() {
      var box = $("#dk-sheet-audio"); if (!box || !sheetPlayer) return;
      box.innerHTML = audioPanel(viewStatus(sheetPlayer), sheetPlayer.volume, false);
      var b = $("#dk-playbtn", box); if (b) b.addEventListener("click", function () { if (sheetPlayer.status === "playing") sheetPlayer.pause(); else sheetPlayer.play(); });
      var rt = $("#dk-retry", box); if (rt) rt.addEventListener("click", function () { sheetPlayer.load(sheetIns.audio_url); sheetPlayer.play(); });
      var v = $("#dk-vol", box); if (v) v.addEventListener("input", function () { var n = Number(v.value); sheetPlayer.setVolume(n); v.style.background = track(n); v.nextElementSibling.textContent = n + "%"; });
    }
    function closeSheet() { if (sheetPlayer) { sheetPlayer.destroy(); sheetPlayer = null; } closeModal(); }
    var onKey = function (ev) { if (ev.key === "Escape" && sheetPlayer) closeSheet(); };
    document.addEventListener("keydown", onKey);
    mp.load(selTrack().audio_url);
    render();
    cleanup = function () { alive = false; mp.destroy(); if (sheetPlayer) sheetPlayer.destroy(); document.removeEventListener("keydown", onKey); };
  }

  /* ================= MÀN HÌNH TẢI TÀI NGUYÊN ================= */
  function boot(done) {
    if (SS.get("don-ket-boot-v2", false) === "1" || SS.get("don-ket-boot-v2", false) === 1) return done();
    var root = document.getElementById("boot-root");
    var phase = "pending", n = 0;
    function draw() {
      root.innerHTML = '<div class="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 dk-boot" id="dk-boot" style="background:linear-gradient(165deg, color-mix(in srgb, var(--lotus-pastel) 88%, white) 0%, color-mix(in srgb, var(--background-mint) 55%, white) 48%, color-mix(in srgb, var(--cloud-lilac) 35%, white) 100%)" aria-busy="' + (phase !== "done") + '" aria-live="polite"><div class="flex w-full max-w-xs flex-col items-center gap-6"><div class="relative ' + (phase === "loading" ? "dk-float" : "") + '"><div aria-hidden="true" class="absolute inset-0 -z-10 scale-150 rounded-full bg-lotus-pink/20 blur-2xl"></div><img src="brand/don_ket_logo_256.png" alt="Đờn Kết" width="112" height="112" class="size-24 object-contain drop-shadow-md sm:size-28"></div><div class="space-y-1.5 text-center"><p class="text-[11px] font-semibold tracking-[0.2em] text-river-purple uppercase">Thanh Âm Việt</p><h1 class="font-display text-3xl font-bold text-ink">Đờn Kết</h1></div><div class="w-full space-y-2"><div class="h-2.5 overflow-hidden rounded-full bg-lotus-pastel/80 shadow-inner ring-1 ring-white/60" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + n + '" aria-label="Tiến trình tải"><div class="h-full rounded-full dk-bar" id="dk-bootbar" style="width:' + n + '%;background:linear-gradient(90deg, var(--lotus-pastel) 0%, var(--lotus-light) 40%, color-mix(in srgb, var(--jade) 55%, white) 72%, color-mix(in srgb, var(--cloud-lilac) 70%, white) 100%)"></div></div><p class="text-center text-xs text-ink-soft" id="dk-boottxt">' + txt() + "</p></div></div></div>";
    }
    function txt() { return phase === "done" ? "Sẵn sàng…" : phase === "pending" ? "Vui lòng đợi một chút…" : "Đang tải tài nguyên… " + n + "%"; }
    function upd() { var b = $("#dk-bootbar"), t = $("#dk-boottxt"); if (b) b.style.width = n + "%"; if (t) t.textContent = txt(); }
    draw();
    var list = [["brand/don_ket_logo_256.png", "image"], ["brand/don_ket_logo_96.png", "image"], [C.BACKGROUNDS.mobile, "image"], [C.BACKGROUNDS.desktop, "image"], [C.SFX.success, "audio"], [C.SFX.fail, "audio"], [C.SFX.leaderboard, "audio"]];
    INSTR.forEach(function (t) { list.push([t.image_url, "image"], [t.audio_url, "audio"]); });
    var total = list.length, cnt = 0, idx = 0, t0 = performance.now();
    function one(it) {
      return it[1] === "image" ? new Promise(function (res) { var im = new Image(); im.decoding = "async"; im.onload = im.onerror = function () { res(); }; im.src = it[0]; })
        : fetch(it[0], { cache: "force-cache" }).then(function (r) { if (r.ok) return r.blob(); }).catch(function () {});
    }
    function worker() { if (idx >= list.length) return Promise.resolve(); var it = list[idx++]; return one(it).then(function () { cnt++; n = Math.min(100, Math.round((cnt / total) * 100)); upd(); return worker(); }); }
    setTimeout(function () { phase = "loading"; draw(); }, 0);
    var ws = []; for (var i = 0; i < Math.min(8, list.length); i++) ws.push(worker());
    Promise.all(ws).then(function () {
      var l = performance.now() - t0;
      return new Promise(function (r) { setTimeout(r, Math.max(0, 700 - l)); });
    }).then(function () {
      SS.set("don-ket-boot-v2", "1"); n = 100; phase = "done"; upd();
      var el = $("#dk-boot"); if (el) el.classList.remove("dk-float");
      done();
      setTimeout(function () { var b = $("#dk-boot"); if (b) { b.classList.add("dk-hide"); setTimeout(function () { root.innerHTML = ""; }, 400); } }, reduced() ? 100 : 380);
    });
  }

  /* ================= khởi động ================= */
  flushPending();
  window.addEventListener("online", flushPending);
  route();
  boot(function () {});
})();
