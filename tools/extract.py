#!/usr/bin/env python3
"""从本机的 epub 解压目录提取每章文本到 source/text/NN.txt（NN = 01–12）。
每行一段，行首 [段号]。`## §k` 是原书的场景分隔（纸质书里是一行空白，下一段开头几个词全大写）。
{L} 表示这一段是书里的信件、文件、广告等「引用的文字」（原书右对齐或夹在空行之间的块）。
*词* 表示原书斜体（强调或内心的话）。"""
import glob, html, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ROM = "I II III IV V VI VII VIII IX X XI XII".split()
CAPS = re.compile(r"^(?:[A-Z][A-Z’'\-]*,? ){1,}[A-Z][A-Z’'\-]+\b")   # 段首至少两个全大写的词
os.makedirs(os.path.join(ROOT, "source/text"), exist_ok=True)
for f in sorted(glob.glob(os.path.join(ROOT, "source/epub/The_Door_Into_Summer_split_*.html"))):
    s = open(f, encoding="utf-8").read()
    m = re.search(r'<p class="calibre2"><span class="bold">(?:<span[^>]*>)?([IVX]+)</span>', s)
    if not m or m.group(1) not in ROM: continue
    k = ROM.index(m.group(1)) + 1
    body = s[m.end():]
    out, sec, n = [], 0, 0
    for cls, p in re.findall(r'<p class="([^"]*)"[^>]*>(.*?)</p>', body, flags=re.S):
        p = re.sub(r'<span class="italic">(.*?)</span>', r"*\1*", p, flags=re.S)
        t = re.sub(r"\s+", " ", html.unescape(re.sub("<[^>]+>", "", p))).replace("\xa0", " ").strip()
        t = re.sub(r"\*\s*\*", "", t)
        t = re.sub(r"(?<=[a-zé])- (?=[a-z])", "-", t)   # epub 里断行留下的「café- society」
        if not t or t == "*": continue
        if (CAPS.match(t.lstrip("“\"*")) and len(t.split()) > 6) or not out:
            sec += 1; out.append(f"## §{sec}")
        n += 1
        out.append(f"[{n}] " + ("{L} " if cls == "calibre10" else "") + t)
    open(os.path.join(ROOT, f"source/text/{k:02d}.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"{k:02d} {n:3d} 段 {sec:2d} 节 {sum(len(x.split()) for x in out if x[0] == '['):5d} 词")
