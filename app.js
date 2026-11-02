/* ĐỜN KẾT — logic game (không cần thư viện ngoài) */
(function () {
  "use strict";
  var CFG = window.DONKET_CONFIG;
  var T = CFG.secondsPerQuestion;
  var RING = 2 * Math.PI * 19; // chu vi vòng đếm giờ

  /* ---------- icon nhạc cụ ---------- */
  var ICONS = {
    kim: '<circle cx="17" cy="31" r="10"/><circle cx="17" cy="31" r="2.5"/><path d="M24 24 L40 8"/><path d="M38 6l4 4"/>',
    tranh: '<path d="M5 33 L39 9 L44 15 L10 40 Z"/><path d="M9 34 L40 12.5 M12 36.5 L42 15"/><circle cx="20" cy="27" r="1"/><circle cx="28" cy="22" r="1"/>',
    tyba: '<path d="M13 41c-7-6-5-16 3-21 4-2.5 9-2.5 11 0s2 7-1 11c-4 7-9 13-13 10z"/><path d="M26 21 L39 8"/><path d="M37 6l4 4"/><path d="M15 33l6-6"/>',
    co: '<path d="M26 5 V37"/><rect x="21" y="36" width="10" height="7" rx="2"/><path d="M24 11h4"/><path d="M6 31 Q24 22 43 29"/>',
    sen: '<path d="M16 21 L24 25.5 V34.5 L16 39 L8 34.5 V25.5 Z"/><circle cx="16" cy="30" r="2.2"/><path d="M22 23.5 L39 8"/><path d="M37 6l4 4"/>',
    bau: '<rect x="4" y="29" width="40" height="7" rx="3.5"/><path d="M36 29 V13"/><circle cx="36" cy="10" r="3"/><path d="M8 29 L36 15"/>',
    sao: '<path d="M6 32 L42 16" stroke-width="5"/><circle cx="16" cy="27.5" r=".6"/><circle cx="22" cy="24.8" r=".6"/><circle cx="28" cy="22.2" r=".6"/><circle cx="34" cy="19.5" r=".6"/>',
    songlang: '<ellipse cx="24" cy="33" rx="14" ry="6"/><path d="M13 31c2-9 20-9 22 0"/><path d="M24 25 V17"/><circle cx="24" cy="14" r="3"/>',
    guitar: '<circle cx="15" cy="34" r="8"/><circle cx="22" cy="27" r="5.5"/><circle cx="16" cy="33" r="2"/><path d="M25 24 L40 9"/><path d="M38 7l4 4"/>',
    tam: '<circle cx="15" cy="33" r="7.5"/><path d="M20.5 27.5 L41 7"/><path d="M39 5l4 4"/><path d="M12 33h6"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' + (ICONS[name] || ICONS.kim) + '</svg>';
  }

  /* ---------- tiện ích ---------- */
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fmt(s) { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function initials(n) { var p = n.trim().split(/\s+/); return ((p.length > 1 ? p[p.length - 1][0] : p[0][0]) || "?").toUpperCase(); }
  function cleanName(s) {
    return String(s || "").replace(/[\u0000-\u001F\u007F<>{}\[\]\\`]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  }
  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  var BY_ID = {};
  CFG.instruments.forEach(function (it) { BY_ID[it.id] = it; });
  var TOTAL_INS = CFG.instruments.length;

  /* ---------- trạng thái ---------- */
  var S = {
    name: cleanName(store.get("donket_name", "")),
    qs: [], i: 0, score: 0, correct: 0, tries: 0, deadline: 0, tick: null, done: false, results: []
  };

  /* ---------- màn hình ---------- */
  function show(id) {
    $$(".screen").forEach(function (el) { el.hidden = el.id !== id; });
    window.scrollTo(0, 0);
  }

  /* ---------- người chơi ---------- */
  function renderPlayer() {
    var has = !!S.name;
    $("#playerBox").hidden = !has;
    $("#nameForm").hidden = has;
    $("#greetBox").hidden = !has;
    $("#btnStart").disabled = !has;
    if (has) {
      $("#playerName").textContent = S.name;
      $("#playerAvatar").textContent = initials(S.name);
      $("#greetName").textContent = S.name;
      $("#greetAvatar").textContent = initials(S.name);
      var best = bestOf(S.name);
      $("#greetSub").textContent = best == null ? "Chưa chơi" : "Điểm cao nhất: " + best + " điểm";
    }
    $("#colCount").textContent = collected().length + "/" + TOTAL_INS;
  }
  function bestOf(name) {
    var b = store.get("donket_best", {});
    return Object.prototype.hasOwnProperty.call(b, name.toLowerCase()) ? b[name.toLowerCase()] : null;
  }
  function setName(n) { S.name = n; store.set("donket_name", n); renderPlayer(); }

  $("#nameForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = $("#nameInput").value;
    var n = cleanName(raw);
    var err = $("#nameError");
    if (!n) { err.textContent = "Bạn hãy nhập tên nhé."; $("#nameInput").focus(); return; }
    if (n.length < 2) { err.textContent = "Tên cần ít nhất 2 ký tự."; $("#nameInput").focus(); return; }
    err.textContent = "";
    setName(n);
    $("#nameInput").blur();
  });
  $("#nameInput").addEventListener("input", function () { $("#nameError").textContent = ""; });

  function switchPlayer() {
    stopAll();
    setName("");
    $("#nameInput").value = "";
    show("screen-home");
    setTimeout(function () { $("#nameInput").focus(); }, 50);
  }
  $("#btnSwitch").addEventListener("click", function () {
    if (!$("#screen-game").hidden && !confirmLeave()) return;
    switchPlayer();
  });
  $("#btnNextPlayer").addEventListener("click", switchPlayer);
  function confirmLeave() { return window.confirm("Bạn đang chơi dở. Thoát lượt chơi này?"); }

  /* ---------- âm thanh ---------- */
  var audio = new Audio();
  audio.preload = "auto";
  var audioOk = true;
  var SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

  function unlockAudio() {
    // Gọi trong sự kiện click để trình duyệt di động cho phép tự phát âm thanh về sau
    try { audio.src = SILENT; var p = audio.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function warm(src) { if (src && window.fetch) { try { fetch(src, { cache: "force-cache" }).catch(function () {}); } catch (e) {} } }

  function setStatus(txt, err) { var s = $("#audioStatus"); s.textContent = txt; s.classList.toggle("err", !!err); }
  function playCurrent() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { setStatus("Chạm để nghe"); $("#btnPlay").classList.remove("playing"); });
  }
  $("#btnPlay").addEventListener("click", function () {
    if (!audioOk) { audio.load(); }
    if (audio.paused) { if (audio.ended) audio.currentTime = 0; playCurrent(); } else audio.pause();
  });
  audio.addEventListener("play", function () { $("#btnPlay").classList.add("playing"); setStatus("Đang phát âm thanh…"); });
  audio.addEventListener("pause", function () {
    $("#btnPlay").classList.remove("playing");
    if (audioOk && audio.src.indexOf("data:") !== 0) setStatus(audio.ended ? "Chạm để nghe lại" : "Đã tạm dừng — chạm để nghe tiếp");
  });
  audio.addEventListener("timeupdate", function () {
    var d = audio.duration;
    $("#tCur").textContent = fmt(audio.currentTime);
    $("#seekFill").style.width = (isFinite(d) && d > 0 ? (audio.currentTime / d) * 100 : 0) + "%";
  });
  audio.addEventListener("loadedmetadata", function () { $("#tDur").textContent = fmt(audio.duration); });
  audio.addEventListener("error", function () {
    if (!audio.src || audio.src.indexOf("data:") === 0) return;
    audioOk = false;
    $("#btnPlay").classList.remove("playing");
    setStatus("Không tải được âm thanh — chạm để thử lại", true);
  });
  // tua khi chạm thanh tiến trình
  $(".seek").addEventListener("click", function (e) {
    var r = this.getBoundingClientRect(); var d = audio.duration;
    if (isFinite(d) && d > 0) audio.currentTime = Math.max(0, Math.min(d, ((e.clientX - r.left) / r.width) * d));
  });

  /* ---------- tạo bộ câu hỏi ---------- */
  function buildQuestions() {
    var n = Math.min(CFG.questionCount, TOTAL_INS);
    var order = shuffle(CFG.instruments).slice(0, n);
    var k = Math.min(CFG.optionsPerQuestion, TOTAL_INS);
    return order.map(function (ans) {
      var others = shuffle(CFG.instruments.filter(function (x) { return x.id !== ans.id; })).slice(0, k - 1);
      return { ans: ans, opts: shuffle(others.concat([ans])), src: pick(ans.audio) };
    });
  }

  /* ---------- bắt đầu ---------- */
  $("#btnStart").addEventListener("click", startGame);
  $("#btnAgain").addEventListener("click", startGame);

  function startGame() {
    if (!S.name) { show("screen-home"); return; }
    unlockAudio();
    S.qs = buildQuestions(); S.i = 0; S.score = 0; S.correct = 0; S.results = [];
    $("#qTotal").textContent = S.qs.length;
    $("#scoreChip").textContent = "0 điểm";
    show("screen-loading");
    var first = S.qs[0].src, t0 = Date.now(), finished = false;
    var probe = new Audio(); probe.preload = "auto";
    function go() {
      if (finished) return; finished = true;
      probe.removeAttribute("src");
      setTimeout(function () { loadQuestion(); }, Math.max(0, 600 - (Date.now() - t0)));
    }
    probe.addEventListener("canplaythrough", go);
    probe.addEventListener("error", go);
    probe.src = first;
    setTimeout(go, 3000);
    S.qs.slice(1, 3).forEach(function (q) { warm(q.src); });
  }

  function loadQuestion() {
    var q = S.qs[S.i];
    S.tries = CFG.triesPerQuestion; S.done = false;
    $("#qNum").textContent = S.i + 1;
    $("#qProgress").style.width = ((S.i) / S.qs.length) * 100 + "%";
    updateTries();
    $("#feedback").hidden = true;
    show("screen-game");

    // lựa chọn
    var box = $("#options"); box.innerHTML = "";
    q.opts.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.dataset.id = it.id;
      b.innerHTML = '<span class="opt-ic">' + icon(it.icon) + '</span><span class="opt-name">' + esc(it.name) + '</span>';
      b.addEventListener("click", function () { answer(b, it); });
      box.appendChild(b);
    });

    // âm thanh
    audioOk = true;
    $("#seekFill").style.width = "0%"; $("#tCur").textContent = "0:00"; $("#tDur").textContent = "0:00";
    setStatus("Đang tải âm thanh…");
    audio.src = q.src;
    audio.load();
    playCurrent();
    var nxt = S.qs[S.i + 2]; if (nxt) warm(nxt.src);

    // đồng hồ
    S.deadline = Date.now() + T * 1000;
    clearInterval(S.tick);
    renderTimer(T);
    S.tick = setInterval(function () {
      var left = Math.max(0, (S.deadline - Date.now()) / 1000);
      renderTimer(left);
      if (left <= 0) { clearInterval(S.tick); if (!S.done) finishQuestion(false, 0, true); }
    }, 200);
  }

  function renderTimer(left) {
    var el = $("#timer");
    $("#timerText").textContent = Math.ceil(left) + "s";
    $("#timerRing").style.strokeDashoffset = (RING * (1 - left / T)).toFixed(2);
    el.classList.toggle("warn", left <= 15 && left > 5);
    el.classList.toggle("danger", left <= 5);
  }
  function updateTries() {
    var c = $("#triesChip");
    c.textContent = "Còn " + S.tries + " lượt";
    c.classList.toggle("low", S.tries <= 1);
  }

  /* ---------- trả lời ---------- */
  function answer(btn, it) {
    if (S.done || btn.disabled) return;
    var q = S.qs[S.i];
    if (it.id === q.ans.id) {
      var used = CFG.triesPerQuestion - S.tries; // số lần sai trước đó
      var base = CFG.pointsByTry[Math.min(used, CFG.pointsByTry.length - 1)];
      var left = Math.max(0, (S.deadline - Date.now()) / 1000);
      var pts = Math.round(base * (0.5 + 0.5 * left / T));
      finishQuestion(true, pts, false);
    } else {
      btn.disabled = true;
      btn.classList.add("wrong", "shake");
      btn.insertAdjacentHTML("beforeend", '<span class="mark">✕</span>');
      if (navigator.vibrate) { try { navigator.vibrate(80); } catch (e) {} }
      S.tries--; updateTries();
      if (S.tries <= 0) finishQuestion(false, 0, false);
      else toast("Chưa đúng rồi, nghe kỹ lại nhé!");
    }
  }

  function finishQuestion(ok, pts, timeout) {
    S.done = true;
    clearInterval(S.tick);
    clearTimeout(toastT); $("#toast").hidden = true;
    var q = S.qs[S.i];
    $$(".opt").forEach(function (b) {
      b.disabled = true;
      if (b.dataset.id === q.ans.id) { b.classList.add("right"); b.insertAdjacentHTML("beforeend", '<span class="mark">✓</span>'); }
    });
    S.results.push({ id: q.ans.id, ok: ok });
    if (ok) {
      S.score += pts; S.correct++;
      var col = collected(); if (col.indexOf(q.ans.id) < 0) { col.push(q.ans.id); store.set("donket_collected", col); }
      var chip = $("#scoreChip"); chip.textContent = S.score + " điểm";
      chip.classList.remove("bump"); void chip.offsetWidth; chip.classList.add("bump");
    }
    var fb = $("#feedback");
    fb.classList.toggle("miss", !ok);
    $("#fbIcon").innerHTML = icon(q.ans.icon);
    $("#fbTitle").textContent = ok ? "Chính xác! +" + pts + " điểm" : (timeout ? "Hết giờ! Đáp án là" : "Hết lượt! Đáp án là");
    $("#fbName").textContent = q.ans.name + (q.ans.alt ? " (" + q.ans.alt + ")" : "");
    $("#fbDesc").textContent = q.ans.desc;
    $("#btnNext").textContent = S.i + 1 >= S.qs.length ? "Xem kết quả →" : "Câu tiếp theo →";
    fb.hidden = false;
    $("#qProgress").style.width = ((S.i + 1) / S.qs.length) * 100 + "%";
    setTimeout(function () {
      try { fb.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
      $("#btnNext").focus({ preventScroll: true });
    }, 60);
  }

  $("#btnNext").addEventListener("click", function () {
    audio.pause();
    S.i++;
    if (S.i >= S.qs.length) endGame(); else loadQuestion();
  });

  function stopAll() { clearInterval(S.tick); try { audio.pause(); } catch (e) {} }

  /* ---------- kết thúc ---------- */
  function endGame() {
    stopAll();
    var name = S.name, score = S.score, correct = S.correct, n = S.qs.length;
    // điểm cao nhất
    var best = store.get("donket_best", {}); var key = name.toLowerCase();
    if (!(key in best) || score > best[key]) best[key] = score;
    store.set("donket_best", best);
    // bảng xếp hạng trên máy
    var entry = { name: name, score: score, correct: correct, t: Date.now() };
    var local = store.get("donket_scores", []); local.push(entry);
    local.sort(byScore); store.set("donket_scores", local.slice(0, 100));

    $("#resName").textContent = name;
    $("#resScore").textContent = score;
    $("#resCorrect").textContent = correct + "/" + n;
    $("#resBest").textContent = best[key];
    $("#resTitle").textContent = correct >= n ? "Tri âm Đờn ca!" : correct >= Math.ceil(n * 0.7) ? "Đôi tai tinh tường!" : correct >= Math.ceil(n * 0.4) ? "Khá lắm!" : "Cùng nghe thêm nhé!";
    $("#resReview").innerHTML = S.results.map(function (r) {
      return '<span class="' + (r.ok ? "" : "x") + '">' + (r.ok ? "✓ " : "✕ ") + esc(BY_ID[r.id].name) + "</span>";
    }).join("");
    $("#resRank").textContent = "…";
    show("screen-result");
    renderPlayer();

    submitRemote(entry).then(function () { return computeRank(entry); }).then(function (r) {
      $("#resRank").textContent = r ? "#" + r : "—";
    });
  }
  function byScore(a, b) { return b.score - a.score || a.t - b.t; }

  /* ---------- bảng xếp hạng chung (Supabase, tuỳ chọn) ---------- */
  var SB = CFG.supabaseUrl && CFG.supabaseAnonKey ? { url: CFG.supabaseUrl.replace(/\/+$/, ""), key: CFG.supabaseAnonKey, table: CFG.supabaseTable || "scores" } : null;
  function sbHeaders(extra) {
    var h = { apikey: SB.key, Authorization: "Bearer " + SB.key, "Content-Type": "application/json" };
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  function withTimeout(p, ms) {
    return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms); })]);
  }
  function submitRemote(e) {
    if (!SB) return Promise.resolve();
    var body = JSON.stringify({ name: e.name, score: e.score, correct: e.correct });
    return withTimeout(fetch(SB.url + "/rest/v1/" + SB.table + "", { method: "POST", headers: sbHeaders({ Prefer: "return=minimal" }), body: body }), 6000)
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .catch(function () {
        // lưu lại để gửi sau (mạng chập chờn ở sự kiện)
        var q = store.get("donket_pending", []); q.push(e); store.set("donket_pending", q.slice(-20));
      });
  }
  function flushPending() {
    if (!SB) return;
    var q = store.get("donket_pending", []); if (!q.length) return;
    store.set("donket_pending", []);
    q.forEach(function (e) { submitRemote(e); });
  }
  function fetchTop(limit) {
    if (!SB) return Promise.reject(new Error("no-remote"));
    var u = SB.url + "/rest/v1/" + SB.table + "?select=name,score,correct,created_at&order=score.desc,created_at.asc&limit=" + limit;
    return withTimeout(fetch(u, { headers: sbHeaders({}) }), 6000).then(function (r) {
      if (!r.ok) throw new Error(r.status); return r.json();
    });
  }
  function computeRank(e) {
    if (SB) {
      var u = SB.url + "/rest/v1/" + SB.table + "?select=id&score=gt." + e.score;
      return withTimeout(fetch(u, { method: "HEAD", headers: sbHeaders({ Prefer: "count=exact" }) }), 6000)
        .then(function (r) {
          var cr = r.headers.get("content-range"); // vd: */12
          var n = cr ? parseInt(cr.split("/")[1], 10) : NaN;
          if (isNaN(n)) throw new Error("x"); return n + 1;
        }).catch(function () { return localRank(e); });
    }
    return Promise.resolve(localRank(e));
  }
  function localRank(e) {
    var l = store.get("donket_scores", []);
    for (var i = 0; i < l.length; i++) if (l[i].t === e.t && l[i].name === e.name) return i + 1;
    return null;
  }

  function openLeaderboard() {
    openModal("modal-lb");
    var list = $("#lbList"), note = $("#lbNote");
    list.innerHTML = '<li class="lb-empty">Đang tải…</li>';
    note.textContent = "";
    fetchTop(20).then(function (rows) {
      note.textContent = "Top 20 người chơi tại sự kiện";
      draw(rows.map(function (r) { return { name: r.name, score: r.score, correct: r.correct }; }));
    }).catch(function () {
      note.textContent = SB ? "Không kết nối được máy chủ — đang hiển thị điểm trên thiết bị này." : "Điểm của những người đã chơi trên thiết bị này.";
      draw(store.get("donket_scores", []).slice(0, 20));
    });
    function draw(rows) {
      if (!rows.length) { list.innerHTML = '<li class="lb-empty">Chưa có ai chơi. Bạn là người đầu tiên!</li>'; return; }
      list.innerHTML = rows.map(function (r) {
        var me = S.name && r.name && r.name.toLowerCase() === S.name.toLowerCase();
        return '<li class="' + (me ? "me" : "") + '"><span class="lb-name">' + esc(r.name) +
          '<br><span class="lb-sub">Đúng ' + (r.correct | 0) + "/" + CFG.questionCount + '</span></span><span class="lb-score">' + (r.score | 0) + "</span></li>";
      }).join("");
    }
  }

  /* ---------- bộ sưu tập ---------- */
  function collected() { var c = store.get("donket_collected", []); return Array.isArray(c) ? c.filter(function (id) { return BY_ID[id]; }) : []; }
  function openCollection() {
    var have = collected();
    $("#colGrid").innerHTML = CFG.instruments.map(function (it) {
      var ok = have.indexOf(it.id) >= 0;
      return '<div class="col-card' + (ok ? "" : " locked") + '"><div class="ci">' + icon(it.icon) + "</div>" +
        "<h4>" + (ok ? esc(it.name) : "??? ") + "</h4>" +
        (ok && it.alt ? '<span class="alt">' + esc(it.alt) + "</span>" : "") +
        "<p>" + (ok ? esc(it.desc) : "Chưa mở khoá") + "</p></div>";
    }).join("");
    openModal("modal-col");
  }

  /* ---------- modal ---------- */
  var lastFocus = null;
  function openModal(id) { lastFocus = document.activeElement; var m = $("#" + id); m.hidden = false; var c = m.querySelector("[data-close]"); if (c) c.focus(); }
  function closeModals() { $$(".modal").forEach(function (m) { m.hidden = true; }); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $$("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () { if (b.dataset.open === "lb") openLeaderboard(); else openCollection(); });
  });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", closeModals); });
  $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m) closeModals(); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModals();
    // phím tắt 1-8 khi đang chơi
    if (!$("#screen-game").hidden && !S.done && /^[1-9]$/.test(e.key) && document.activeElement.tagName !== "INPUT") {
      var b = $$(".opt")[+e.key - 1]; if (b) b.click();
    }
  });

  /* ---------- khởi động ---------- */
  renderPlayer();
  flushPending();
  window.addEventListener("online", flushPending);
})();
