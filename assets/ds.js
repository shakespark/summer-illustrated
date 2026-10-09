// 盛夏之门 · 英文伴读：共享脚本。注入顶栏、章头、前情、章末导航、页脚；接管场景地图的打勾、读前/读后分界、词条的"记下"和筛选。
// 全站以「页」为单位（长章拆成 02a、02b… 几页），页 id 见 chapters.js。
// localStorage 键一律带 ds- 前缀（全站各教程同一个域名）：ds-done-页id、ds-sec-页id-场景号、ds-after-页id、ds-star-页id-词条、ds-theme。
(() => {
  const CH = window.DS_CHAPTERS || [], READY = new Set(window.DS_READY || []);
  const ROOT = document.currentScript.src.replace(/assets\/ds\.js.*$/, "");
  const SITE = "盛夏之门 · 英文伴读";
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
    keys(prefix) { try { return Object.keys(localStorage).filter((k) => k.startsWith(prefix)); } catch { return []; } },
  };
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) k === "class" ? (el.className = v) : k.startsWith("on") ? (el[k] = v) : el.setAttribute(k, v);
    el.append(...kids.filter((x) => x != null));
    return el;
  };
  const byId = (id) => CH.find((c) => c.id === id);
  const chHref = (id) => `${ROOT}chapters/${id}.html`;
  const LAST = Math.max(0, ...CH.map((c) => c.n));
  const sibs = (c) => CH.filter((x) => x.n === c.n); // 同一章的各页
  const split = (c) => sibs(c).length > 1;
  const unit = (c) => (split(c) ? "这一页" : "这一章");
  const chLabel = (c) => (c.n === 0 ? "开读之前" : `第 ${c.n} 章` + (split(c) ? `（${sibs(c).indexOf(c) + 1}/${sibs(c).length}）` : ""));
  const chTitle = (c) => (c.n === 0 ? chLabel(c) : `${chLabel(c)} · ${c.t}`);
  const minutes = (words) => Math.max(5, Math.round(words / 90 / 5) * 5); // 按边读边查的速度估
  const listen = (words) => Math.max(1, Math.round(words / 160)); // 有声书朗读大约每分钟 160 词
  const isDone = (id) => LS.get(`ds-done-${id}`) === "1";
  const secDone = (id, k) => LS.get(`ds-sec-${id}-${k}`) === "1";
  const LEVEL = { slang: ["口语俚语不多", "有一些口语俚语", "口语俚语密集"], tech: ["几乎没有行话", "有一些行话", "行话密集"] };
  const badges = (c) => [
    c.words ? h("span", { class: "badge" }, `约 ${c.words} 词 · 读 ${minutes(c.words)} 分钟 · 听 ${listen(c.words)} 分钟`) : null,
    c.slang == null ? null : h("span", { class: `badge l${c.slang}` }, LEVEL.slang[c.slang]),
    c.tech == null ? null : h("span", { class: `badge l${c.tech}` }, LEVEL.tech[c.tech]),
  ];

  const saved = LS.get("ds-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  function themeBtn() {
    return h("button", { class: "btn", "aria-label": "切换深色/浅色", onclick() {
      const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      const next = dark ? "light" : "dark";
      document.documentElement.dataset.theme = next; LS.set("ds-theme", next);
    } }, "深/浅");
  }

  function mountChrome() {
    const c = byId(document.body.dataset.page);
    document.body.prepend(h("div", { class: "topbar" }, h("div", { class: "topbar-inner" },
      h("a", { class: "home", href: `${ROOT}index.html` }, SITE),
      h("span", { class: "crumb" }, c ? chTitle(c) : document.body.hasAttribute("data-ideas") ? "书里的点子，后来怎样了" : ""),
      themeBtn())));
    document.body.append(h("footer", { class: "site-footer" },
      h("a", { href: "https://beian.miit.gov.cn/", target: "_blank", rel: "noopener" }, "京ICP备18057656号-1")));
    if (!c) return;
    const main = document.querySelector("main"), n = c.n, id = c.id, i = CH.indexOf(c);
    document.title = `${chTitle(c)} · 盛夏之门 英文伴读`;
    // 前情：只列前面各页的一句话，这一页和后面的事一个字不提
    const before = CH.slice(0, i).filter((x) => x.n > 0 && x.recap);
    const recap = before.length ? h("details", { class: "recap" },
      h("summary", {}, "前情：到这里为止发生了什么", h("small", {}, "隔了几天再读时点开；没读过前面的不要点")),
      h("ol", {}, ...before.map((x) => h("li", {}, h("b", {}, chLabel(x)), h("span", {}, x.when ? h("span", { class: "when" }, x.when) : null, x.recap))))) : null;
    // 听书：拆开的页告诉读者这一页在这一章录音里的位置，从哪句听起、听到哪句为止
    let audio = null;
    if (split(c)) {
      const S = sibs(c), k = S.indexOf(c), total = S.reduce((a, x) => a + x.words, 0), pre = S.slice(0, k).reduce((a, x) => a + x.words, 0);
      const nxt = S[k + 1];
      audio = h("p", { class: "listen" }, ...[h("b", {}, "听书"),
        `这一页是第 ${n} 章录音的第 ${k + 1} / ${S.length} 段。`,
        k === 0 ? "从这一章开头听起，" : ["大约从这一章的第 ", h("b", {}, `${listen(pre)} 分钟`), `（全章 ${Math.round((100 * pre) / total)}% 处）听起，开头是 `, h("i", {}, `${c.from} …`), "，"],
        nxt ? ["听到 ", h("i", {}, `${nxt.from} …`), " 这句之前停下，"] : "听到这一章结束，",
        `约 ${listen(c.words)} 分钟。分钟数按每分钟 160 词估，朗读版本不同会有出入，以开头那几个词为准。`].flat(2));
    }
    main.prepend(h("div", { class: "chapter-head" },
      h("div", { class: "kicker" }, n === 0 ? "BEFORE YOU START" : `CHAPTER ${n} / ${LAST}${c.when ? "　·　" + c.when : ""}`),
      h("h1", {}, n === 0 ? chLabel(c) : `${chLabel(c)}　${c.t}`),
      h("div", { class: "badges" }, ...badges(c)), audio), ...(recap ? [recap] : []));
    const prev = CH[i - 1], next = CH[i + 1];
    const done = h("button", { class: "btn" });
    const paint = () => { done.textContent = isDone(id) ? `✓ 已读完${unit(c)}` : `标记：${unit(c)}读完了`; done.setAttribute("aria-pressed", isDone(id)); };
    done.onclick = () => { LS.set(`ds-done-${id}`, isDone(id) ? null : "1"); paint(); };
    paint();
    main.append(h("div", { class: "chapter-end" }, done, h("div", { class: "nav" },
      prev ? h("a", { class: "btn", href: chHref(prev.id) }, `← ${chLabel(prev)}`) : null,
      h("a", { class: "btn", href: `${ROOT}index.html` }, "目录"),
      next && READY.has(next.id) ? h("a", { class: "btn primary", href: chHref(next.id) }, `${chLabel(next)} →`) : null,
      !next ? h("a", { class: "btn primary", href: `${ROOT}ideas.html` }, "书里的点子，后来怎样了 →") : null)));
  }

  // 读前 / 读后分界：<section class="after"> 里是会透露这一章情节的内容，默认收起，读完点一下才展开（记在 ds-after-页id）
  function wireGate() {
    const after = document.querySelector("section.after");
    if (!after) return;
    const c = byId(document.body.dataset.page), n = c.id, key = `ds-after-${n}`;
    const open = () => { document.body.classList.remove("after-locked"); LS.set(key, "1"); };
    if (!LS.get(key) && !isDone(n)) document.body.classList.add("after-locked");
    after.before(h("div", { class: "gate" },
      h("b", {}, "读前部分到这里。下面是读后部分"),
      h("span", {}, `下面的句子讲解、理解检查会说到${unit(c)}的情节。先去读原书${split(c) ? "的这一段" : "这一章"}。`),
      h("button", { class: "btn primary", onclick: open }, `${unit(c)}我读完了，展开`)));
  }

  // 场景地图：<ol class="secmap"><li data-sec="1" data-p="段号"><b>开头几个词</b><span class="what">一句话</span></li>…</ol>
  // 每个场景前面加一个"读过了"的勾，并链到词条里对应的 #sK
  function wireSecmap() {
    const n = document.body.dataset.page;
    for (const li of document.querySelectorAll(".secmap li[data-sec]")) {
      const k = li.dataset.sec, key = `ds-sec-${n}-${k}`;
      const box = h("input", { type: "checkbox", "aria-label": `场景 ${k} 读过了` });
      box.checked = secDone(n, k); li.classList.toggle("done", box.checked);
      box.onchange = () => { LS.set(key, box.checked ? "1" : null); li.classList.toggle("done", box.checked); };
      li.prepend(box, h("span", { class: "k" }, k));
      if (document.getElementById(`s${k}`)) li.append(h("a", { class: "jump", href: `#s${k}` }, "词条 ↓"));
    }
  }
  const secProgress = (c) => {
    if (!c.secs) return null;
    const k = Array.from({ length: c.secs }, (_, i) => i + 1).filter((i) => secDone(c.id, i)).length;
    return k && !isDone(c.id) ? h("span", { class: "sp" }, `　已读 ${k} / ${c.secs} 个场景`) : null;
  };

  // 词条：<div class="entry [trap]"><div class="en">…</div><div class="loc" data-p="段号">原句里的 4–7 个词</div><div class="zh">…</div><div class="note">…</div></div>
  function wireEntries() {
    const entries = [...document.querySelectorAll(".entry")];
    if (!entries.length) return;
    const n = document.body.dataset.page;
    const first = entries[0];
    const count = h("span", { class: "count" });
    const mk = (label, cls) => h("button", { class: "btn", "aria-pressed": String(!cls), onclick(e) {
      document.body.classList.remove("only-traps", "only-starred");
      if (cls) document.body.classList.add(cls);
      bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
    } }, label);
    const bar = h("div", { class: "toolbar" }, mk("全部", ""), mk("只看「每个字都认识」", "only-traps"), mk("只看我记下的", "only-starred"), count);
    (first.previousElementSibling?.matches("h3.sec-head") ? first.previousElementSibling : first).before(bar, h("p", { class: "empty-note" }, "还没有记下任何词条。回到「全部」，点词条右边的「记下」。"));
    const refresh = () => {
      const k = entries.filter((e) => e.classList.contains("starred")).length;
      document.body.classList.toggle("none-starred", k === 0);
      count.textContent = `共 ${entries.length} 条 · 已记下 ${k}`;
    };
    for (const e of entries) {
      const en = e.querySelector(".en"), text = en.textContent.trim();
      const key = `ds-star-${n}-${text}`;
      if (e.classList.contains("trap")) en.append(h("span", { class: "tag" }, "每个字都认识"));
      const btn = h("button", { class: "btn star" });
      const paint = () => { btn.textContent = e.classList.contains("starred") ? "已记下" : "记下"; };
      if (LS.get(key)) e.classList.add("starred");
      btn.onclick = () => {
        const on = e.classList.toggle("starred");
        LS.set(key, on ? JSON.stringify({ zh: e.querySelector(".zh")?.textContent.trim() || "" }) : null);
        paint(); refresh();
      };
      paint(); en.after(btn);
    }
    refresh();
  }

  // 首页：目录、进度、我的故事线（只揭开已标记读完的章）、我的词本
  function mountHome() {
    const toc = document.getElementById("toc");
    if (!toc) return;
    for (const [i, c] of CH.entries()) {
      const ready = READY.has(c.id);
      toc.append(h("li", {}, h("a", Object.assign({ class: (isDone(c.id) ? "done " : "") + (ready ? "" : "todo") }, ready ? { href: chHref(c.id) } : {}),
        h("span", { class: "n" }, isDone(c.id) ? "✓" : c.n === 0 ? "序" : c.id.replace(/^0/, "")),
        h("span", { class: "t" }, c.n === 0 ? chLabel(c) : c.t || chLabel(c)),
        h("span", { class: "b" }, ...(ready ? badges(c) : [h("span", { class: "badge" }, "待写")])),
        // 一句话会带出前一页的结局，所以只对「读到这儿了」的页显示：第 1 章，或者前一页已标记读完
        c.d && (i < 2 || isDone(CH[i - 1].id) || isDone(c.id)) ? h("span", { class: "d" }, c.d, secProgress(c)) : null)));
    }
    const body = CH.filter((c) => c.n > 0);
    const doneN = body.filter((c) => isDone(c.id)).length;
    const p = document.getElementById("progress");
    if (p) p.append(h("div", { class: "progress" }, Object.assign(h("i"), { style: `width:${(100 * doneN) / body.length}%` })), h("p", { class: "lede" }, `已读完 ${doneN} / ${body.length} 页（全书 ${LAST} 章，长章拆成了几页）`));
    const sl = document.getElementById("storyline");
    if (sl) for (const c of body) {
      const seen = isDone(c.id) && c.recap;
      sl.append(h("li", { class: seen ? "seen" : "hid" }, h("b", {}, chLabel(c)),
        seen && c.when ? h("span", { class: "when" }, c.when) : null, seen ? c.recap : `读完${unit(c)}并标记后，这里才揭开`));
    }
    const wb = document.getElementById("wordbook");
    if (wb) {
      const keys = LS.keys("ds-star-").sort();
      if (!keys.length) wb.append(h("p", { class: "lede" }, "还是空的。在章节页里点词条右边的「记下」，它们会汇总到这里。"));
      for (const k of keys) {
        const m = k.match(/^ds-star-(\d\d[a-z]?)-(.*)$/), c = m && byId(m[1]); if (!c) continue;
        let zh = ""; try { zh = JSON.parse(LS.get(k)).zh; } catch {}
        wb.append(h("div", {}, h("b", {}, m[2]), h("span", {}, zh), h("a", { href: chHref(c.id) }, chLabel(c))));
      }
    }
  }

  // 「书里的点子，后来怎样了」（ideas.html）：<div class="idea" data-after="页id" data-v="hit|half|wip|miss|blind|sum">
  // 每条挂在它首次出现的那一页上，那一页标记读完才揭开；ds-ideas-all = 1 时全部揭开
  function mountIdeas() {
    const ideas = [...document.querySelectorAll(".idea[data-after]")];
    if (!ideas.length) return;
    const V = { hit: "猜中了", half: "猜对一半", wip: "还在路上", miss: "没成", blind: "没想到" };
    const btn = document.getElementById("ideas-all"), count = document.getElementById("ideas-count");
    for (const el of ideas) {
      if (V[el.dataset.v]) el.querySelector("h3").prepend(h("span", { class: `verdict v-${el.dataset.v}` }, V[el.dataset.v]));
      const c = byId(el.dataset.after);
      el.append(h("p", { class: "stub" }, "读完 ", h("a", { href: chHref(c.id) }, chLabel(c)), " 并标记后，这一条才揭开。"));
    }
    const paint = () => {
      const all = LS.get("ds-ideas-all") === "1";
      let open = 0;
      for (const el of ideas) { const on = all || isDone(el.dataset.after); el.classList.toggle("locked", !on); open += on; }
      count.textContent = `已揭开 ${open} / ${ideas.length} 条`;
      btn.textContent = all ? "恢复按阅读进度显示" : "我读完全书了，全部揭开";
    };
    btn.onclick = () => { LS.set("ds-ideas-all", LS.get("ds-ideas-all") === "1" ? null : "1"); paint(); };
    paint();
  }

  document.addEventListener("DOMContentLoaded", () => { mountChrome(); wireGate(); wireSecmap(); wireEntries(); mountHome(); mountIdeas(); });
  window.DS = { h, LS, ROOT, chHref, chLabel, isDone };
})();
