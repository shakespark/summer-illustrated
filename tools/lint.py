#!/usr/bin/env python3
"""章节页结构检查：python3 tools/lint.py chapters/NN.html chapters/NNa.html …
长章拆成几页（02a、02b…），每页的段落范围读 assets/chapters.js 里的 p: [起, 止]。
查：小节标题和顺序、读前/读后分界、场景地图（开头几个词是否照抄、是否覆盖原书的分隔）、词条（.en 重复、.loc 是否在原文对应段落里、
是否放在对应的场景下、顺序）、引用块数量、图片、页面里的 <style>/<script>/写死的颜色、直引号，以及剧透（后面章节才出现的名字）。"""
import collections, glob, html, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
norm = lambda s: re.sub(r"\s+", " ", html.unescape(s).replace("*", "").replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')).strip()

# 每页的段落范围和开头几个词（chapters.js，每页一行）
PAGES = {m.group(1): (int(m.group(2)), int(m.group(3)), m.group(4)) for m in re.finditer(
    r'id: "(\d\d[a-z]?)", n: \d+, p: \[(\d+), (\d+)\](?:, from: "([^"]*)")?', open(os.path.join(ROOT, "assets/chapters.js"), encoding="utf-8").read())}
# 剧透检查用的名单：每个专有名词第一次出现在第几章第几段（从原文自动统计）
first, cnt, lower = {}, collections.Counter(), set()
for f in sorted(glob.glob(os.path.join(ROOT, "source/text/*.txt"))):
    k = int(os.path.basename(f)[:2])
    for line in open(f, encoding="utf-8").read().replace("*", "").splitlines():
        pm = re.match(r"\[(\d+)\] ", line)
        if not pm: continue
        lower.update(re.findall(r"\b[a-z]{3,}\b", line))
        for m in re.finditer(r"(?:(?<=[a-z,;] )|(?<=Mr\. )|(?<=Mrs\. )|(?<=Dr\. )|(?<=Miss ))([A-Z][a-z]{2,}(?: [A-Z][a-z]{2,})*)", line):
            cnt[m.group(1)] += 1; first.setdefault(m.group(1), (k, int(pm.group(1))))
STOP = set("""January February March April May June July August September October November December Monday Tuesday Wednesday Thursday Friday
Saturday Sunday John God Lord Mrs English French Chinese Federal America United States Tech Daniel Dan Davis Dan Darkin Gentry Angeles Inc
Insurance Company Assurance Company Christmas Italy Edinburgh Newton Columbus Nobel Prize Leonardo Vinci Colorado Virginia Ford Uncle Sam
General Motors Pont Dallas Albuquerque Nebraska Vincent Mark One Grandma Pappy Saturday Sleeper Sleepers Mac Great Los Angeles Los Angeles County""".split())
NAMES = {w: k for w, k in first.items() if cnt[w] >= 2 and w.lower() not in lower and not all(x in STOP for x in w.split())}
# 首次出现的位置按整词重新找一遍（Mojave Desert 在前、单独的 Mojave 在后时，Mojave 算前一处）
LINES = [(int(os.path.basename(f)[:2]), int(m.group(1)), line.replace("*", "")) for f in sorted(glob.glob(os.path.join(ROOT, "source/text/*.txt")))
         for line in open(f, encoding="utf-8") for m in [re.match(r"\[(\d+)\] ", line)] if m]
for w in NAMES:
    rx = re.compile(rf"\b{re.escape(w)}\b")
    NAMES[w] = next(((k, p) for k, p, line in LINES if rx.search(line)), NAMES[w])
# 中文里的剧透词：(正则, 从第几章的页面起才允许出现)
ZH_SPOIL = [(r"时间旅行|时间机器|时光机|穿越|回到过去|回到 ?19[67]\d", 8), (r"2001 ?年", 6), (r"僵尸药|zombie", 4)]

bad = 0
for path in sys.argv[1:]:
    t = open(path, encoding="utf-8").read(); errs = []
    pid = re.search(r"(\d\d[a-z]?)\.html$", path).group(1); nn = pid[:2]; N = int(nn)
    src = os.path.join(ROOT, f"source/text/{nn}.txt")
    paras, book_secs = {}, []
    for line in (open(src, encoding="utf-8").read().splitlines() if os.path.exists(src) else []):
        m = re.match(r"\[(\d+)\] (?:\{L\} )?(.*)$", line)
        if line.startswith("## §"): book_secs.append(None)
        elif m:
            paras[int(m.group(1))] = norm(m.group(2))
            if book_secs and book_secs[-1] is None: book_secs[-1] = int(m.group(1))
    if N and pid not in PAGES: errs.append(f"chapters.js 里没有 {pid} 这一页")
    P0, P1, FROM = PAGES.get(pid, (1, max(paras) if paras else 0, None))
    paras = {k: v for k, v in paras.items() if P0 <= k <= P1}          # 只看这一页的段落
    book_secs = [p for p in book_secs if P0 <= p <= P1]
    last_p = P1
    if f'<body data-page="{pid}">' not in t: errs.append(f'<body> 应写成 <body data-page="{pid}">')
    if FROM and not paras.get(P0, "").startswith(norm(FROM)): errs.append(f"chapters.js 里 {pid} 的 from 不是第 {P0} 段的开头")

    # 小节标题、顺序、读前/读后分界
    if N:
        pre = ["这一章在做什么", "人物", "场景地图", "背景：作者默认你知道的事", "书里的世界", "词与短语"]
        post = ["值得停下来的句子", "检查一下理解"]
        opt = {"这一章的行话，先用中文过一遍": "词与短语", "留给后面的问题": None}
        pos = [t.find(f"<h2>{s}</h2>") for s in pre + post]
        for s, k in zip(pre + post, pos):
            if k < 0: errs.append(f"缺少小节：{s}")
        if -1 not in pos and pos != sorted(pos): errs.append("小节顺序不对，应为：" + " → ".join(pre + post))
        for s in re.findall(r"<h2>(.*?)</h2>", t):
            if s not in pre + post and s not in opt: errs.append(f"多出来的小节标题：{s}（标题一个字都不能改）")
        gate = t.find('<section class="after">')
        if gate < 0: errs.append('缺少读后分界 <section class="after">')
        else:
            if t.find("<h2>词与短语</h2>") > gate or 0 <= t.find("<h2>值得停下来的句子</h2>") < gate: errs.append("读后分界的位置不对：应在「词与短语」之后、「值得停下来的句子」之前")
            if re.search(r'<blockquote class="quote">|<details class="check">', t[:gate]): errs.append("引用块和理解检查只能放在读后部分")
            if "</section>" not in t[gate:]: errs.append("<section class=\"after\"> 没有闭合")

    # 场景地图
    scenes = [(int(k), int(p), norm(re.sub(r"<span.*?</span>|<[^>]+>", "", b)).strip("… ").strip())
              for k, p, b in re.findall(r'<li data-sec="(\d+)" data-p="(\d+)"><b>(.*?)</b>', t, flags=re.S)]
    if N:
        if [k for k, _, _ in scenes] != list(range(1, len(scenes) + 1)) or len(scenes) < 3: errs.append(f"场景地图应是 3 个以上、从 1 连续编号的场景，实际是 {[k for k, _, _ in scenes]}")
        ps = [p for _, p, _ in scenes]
        if ps and (ps[0] != P0 or ps != sorted(set(ps)) or ps[-1] > P1): errs.append(f"场景的起始段号应从 {P0} 开始递增、不超过 {P1}，实际是 {ps}")
        for k, p, b in scenes:
            if not paras.get(p, "").startswith(b): errs.append(f"场景 {k} 的开头几个词不是第 {p} 段的开头：{b!r}")
            if not 3 <= len(b.split()) <= 7: errs.append(f"场景 {k} 的开头应照抄 4–6 个词：{b!r}")
        for p in book_secs:
            if p not in ps: errs.append(f"原书在第 {p} 段前有场景分隔（## §），场景地图里要有一个场景从这一段开始")
        heads = [int(k) for k in re.findall(r'<h3 class="sec-head" id="s(\d+)">', t)]
        if heads != [k for k, _, _ in scenes]: errs.append(f"词条的场景小标题应有 s1–s{len(scenes)}，实际是 {heads}")
        bounds = {k: (p, (ps[i + 1] if i + 1 < len(ps) else last_p + 1)) for i, (k, p, _) in enumerate(scenes)}
        cur = 0
        for m in re.finditer(r'<h3 class="sec-head" id="s(\d+)">|<div class="loc" data-p="(\d+)">', t):
            if m.group(1): cur = int(m.group(1))
            elif cur in bounds and not bounds[cur][0] <= int(m.group(2)) < bounds[cur][1]: errs.append(f"第 {m.group(2)} 段的词条放在了场景 {cur}（第 {bounds[cur][0]}–{bounds[cur][1] - 1} 段）下面")

    # 词条
    ens = re.findall(r'<div class="en">(.*?)</div>', t)
    for e in sorted({e for e in ens if ens.count(e) > 1}): errs.append(f".en 重复：{e}")
    locs = re.findall(r'<div class="loc" data-p="(\d+)">(.*?)</div>', t)
    if len(locs) != len(ens): errs.append(f"词条 {len(ens)} 条，但 .loc 只有 {len(locs)} 个")
    last = 0
    for p, loc in locs:
        s = norm(re.sub(r"<[^>]+>", "", loc)).strip("… ").strip()
        n = len(s.split()); p = int(p)
        if paras and s not in paras.get(p, ""):
            where = [k for k, v in paras.items() if s in v]
            errs.append(f".loc 不在第 {p} 段：{s!r}" + (f"（在第 {where[0]} 段）" if where else f"（这一页的第 {P0}–{P1} 段里都找不到）"))
        if n > 9: errs.append(f".loc 太长（{n} 词）：{s!r}")
        if p < last: errs.append(f"词条顺序：第 {p} 段的词条排在第 {last} 段之后：{s!r}")
        last = max(last, p)
    traps = len(re.findall(r'class="entry trap"', t))
    words = sum(len(v.split()) for v in paras.values())
    if N and paras and not words / 1000 * 13 <= len(ens) <= 180: errs.append(f"词条 {len(ens)} 条，这一页 {words} 词，应在 {int(words / 1000 * 13) + 1}–180 条之间")
    if N and ens and traps * 3 < len(ens): errs.append(f"trap 只有 {traps}/{len(ens)}，应占三分之一以上")

    # 引用、图、样式
    q = len(re.findall(r'<blockquote class="quote">', t))
    if q > 3: errs.append(f"引用块 {q} 处，超过 3 处")
    imgs = re.findall(r'<img[^>]+src="([^"]+)"', t)
    for i in imgs:
        if not re.fullmatch(r"\.\./assets/img/\d\d-[a-z0-9-]+\.jpg", i) or not os.path.exists(os.path.join(os.path.dirname(path), i)): errs.append(f"图片不存在，或不是 ../assets/img/NN-名字.jpg：{i}")
    svgs = len(re.findall(r"<svg\b", t))
    need = (3, 2) if N else (2, 1)
    if len(set(imgs)) < need[0] or svgs < need[1]: errs.append(f"图不够：照片 {len(set(imgs))}，SVG {svgs}（至少照片 {need[0]} 张、SVG {need[1]} 张）")
    if re.search(r"\.epub|split_0\d\d|filepos|source/", t): errs.append("页面里出现了原书材料的路径或文件名")
    if re.search(r"<svg(?![^>]*class=\"diagram\")", t): errs.append("有 SVG 没用 class=\"diagram\"")
    if re.search(r"<style|<script(?![^>]*src=)", t): errs.append("页面里有 <style> 或内联 <script>")
    for m in set(re.findall(r'(?:fill|stroke)="(#[0-9a-fA-F]+|[a-z]+)"', t)) - {"none", "currentColor"}: errs.append(f"SVG 里写死了颜色：{m}")
    if re.search(r'style="', t): errs.append('有内联 style="…"')
    text = html.unescape(re.sub(r"<[^>]+>", " ", t))
    if '"' in text: errs.append('正文里有英文直引号 "，中文引号用「」，英文引号用弯引号 “ ”')

    # 剧透：这一页不能出现后面章节才登场的名字和设定
    here = (N, P1) if N else (1, 10 ** 6)
    for w, k in sorted(NAMES.items(), key=lambda x: x[1]):
        if k > here and re.search(rf"\b{re.escape(w)}\b", text): errs.append(f"剧透：{w} 到第 {k[0]} 章第 {k[1]} 段才出现" + ("（在后面的页里）" if k[0] == N else ""))
    for pat, k in ZH_SPOIL:
        m = re.search(pat, text)
        if m and N < k: errs.append(f"剧透：「{m.group(0)}」第 {k} 章以前的页面不能提")

    print(("✗" if errs else "✓"), path, f"场景 {len(scenes)} 词条 {len(ens)}（trap {traps}） 照片 {len(set(imgs))} SVG {svgs} 引用 {q} 检查题 {len(re.findall('class=.check.', t))}")
    for e in errs: print("    " + e)
    bad += bool(errs)
sys.exit(1 if bad else 0)
