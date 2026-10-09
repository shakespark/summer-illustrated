# 状态（2026-10-09）

全书 12 章、19 页（含「开读之前」）都已写完，lint / overlap / check 全过。长章按用户要求拆页（方便配 Audible 听）：
02a–c、05a–b、06a–b、08a–b、10a–b；其余一章一页。线上目录 `summer`，localStorage 前缀 `ds-`（用户 2026-10-09 确认）。

## 还可以做的
- 事实核查：各章作者在报告里列了「拿不准的事实」（年份、出处、数字），没有逐条对外核实过。读到不对的地方直接改页面。
- trap（「每个字都认识」）标签在 08b、11、12 偏宽（占八成以上），可以收紧。
- 第 1 章没有拆页（约 5250 词，听 33 分钟）；要拆的话在 chapters.js 加两行、把 01.html 拆成 01a / 01b。
- 手机宽度下 SVG 固定 560px 宽、横向滚动（共享样式的既定做法）。

本地预览：`python3 -m http.server 8800`。检查：`python3 tools/lint.py chapters/*.html && python3 tools/overlap.py chapters/*.html && node tools/check.mjs`。
