# 盛夏之门 · 英文伴读

陪读英文原版 *The Door into Summer*（Robert A. Heinlein，1957）的伴读站：短章一章一页、长章拆成几页（02a、02b…，方便配着 Audible 听），读前给人物、场景地图、背景、「书里的世界」和图，
读时查词与短语，读后是句子讲解和理解检查。小说，所以**不剧透**是第一条规矩。

- 线上地址：https://t.miaowuao.cn/summer/ ，仓库 shakespark/summer-illustrated，推送 main 即部署（见 `~/tutorials-deploy`）。
- 本站不是译本。原书的 epub 和提取的文本在 `source/`，版权归原作者与出版方，`.gitignore` 排除，不入库、不部署。
- 编写规范：`AUTHORING.md`；样板：`chapters/01.html`。

## 目录

```
index.html            首页：目录、进度、我的故事线（只揭开已读的章）、我的词本
ideas.html            书里的点子，后来怎样了：1956 年的设想 对 真实的 2000 年和今天；每条按阅读进度揭开（data-after=页id）
chapters/00.html      开读之前（作者、读法、本站用法）
chapters/<页id>.html   正文十二章，共 18 页：01、02a–c、03、04、05a–b、06a–b、07、08a–b、09、10a–b、11、12
assets/style.css      共享样式（颜色 token 与其它教程站一致）
assets/ds.js          共享脚本：顶栏、章头、前情、读前/读后分界、场景打勾、词条记下、页脚备案号
assets/chapters.js    全书目录数据（标题、一句话、开场时间地点、前情用的 recap）和已写好的页的列表；以页为单位，每页一行，lint 读其中的段号范围
assets/img/           图片（来自维基共享资源，出处见 CREDITS.md）
tools/extract.py      从 source/epub 提取每章文本到 source/text
tools/lint.py         章节页结构检查 + 剧透检查（本书的规则在这里；通用部分用 ~/tutorials-deploy/scripts/lint_common.py）
tools/overlap.py      与原书长片段重合检查（转调 ~/tutorials-deploy/scripts/overlap.py）
tools/check.mjs       浏览器质检（浅/深 × 400/1100；转调 ~/tutorials-deploy/scripts/check.mjs）
tools/fetch_img.py    取图（转调 ~/tutorials-deploy/scripts/fetch_img.py）
```

localStorage 键一律带 `ds-` 前缀：`ds-done-N`、`ds-sec-N-场景号`、`ds-after-N`、`ds-star-NN-词条`、`ds-theme`。
首页卡片的进度写法：`data-progress="ds-done-:13"`。

## 本地预览与检查

```sh
python3 -m http.server 8800          # 然后打开 http://localhost:8800/
python3 tools/lint.py chapters/*.html
python3 tools/overlap.py chapters/*.html index.html
node tools/check.mjs --shots source/shots
```
