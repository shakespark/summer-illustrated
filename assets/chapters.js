// 全书目录，以「页」为单位：短章一章一页，长章拆成几页（02a、02b…），方便分几次读、分几次听。
// 标题是本站自己起的（原书各章只有罗马数字，没有标题）。标题和一句话都不能剧透。
// 每页一行，格式不要改（tools/lint.py 用正则读 id 和 p）。
// id: 页 id，也是文件名 chapters/<id>.html 和 localStorage 键的一部分；n: 章号（0 = 开读之前）；
// p: [起始段号, 结束段号]（source/text/NN.txt 里的段号）；from: 拆开的页才有，这一页开头的 5 个词（听书时找位置用）；
// words: 这一页的原文词数；secs: 本站划分的场景数；slang / tech: 0–2，口语俚语多不多 / 行话（工程、法律、金融）多不多；
// t: 标题；d: 给目录用的一句话（读之前看的，只说开头的处境）；
// when: 这一页开场的时间地点（显示在页头）；recap: 这一页发生了什么（只在后面各页的「前情」和首页已读的故事线里出现）。
window.DS_CHAPTERS = [
  { id: "00", n: 0, t: "开读之前", d: "作者、这本书的写法，和这个站怎么用。" },
  { id: "01", n: 1, p: [1, 153], words: 5253, secs: 6, slang: 2, tech: 1, t: "找一扇通往夏天的门", d: "一个人带着一只猫，在酒吧里喝闷酒", when: "1970 年 12 月 3 日 · 洛杉矶", recap: "工程师 Dan 被未婚妻 Belle 和一个叫 Miles 的人坑了，带着猫 Pete 喝了两周闷酒。他在保险公司签下合同：人和猫一起冷冻睡眠到 2000 年，第二天中午入库。" },
  { id: "02a", n: 2, p: [1, 59], from: "MY CAR WAS parked under", words: 3712, secs: 6, slang: 2, tech: 2, t: "沙漠里的小厂", d: "清醒过来的 Dan 在车里跟自己吵架", when: "1970 年 12 月 3 日傍晚 · 洛杉矶", recap: "清醒后的 Dan 决定冷眠前先找 Miles 问个明白。回忆：战后两人在沙漠办厂造 Hired Girl，Dan 握 51%；Belle 来当秘书，两人订婚，他过户给她一部分股份。" },
  { id: "02b", n: 2, p: [60, 111], from: "Pete was another matter, and", words: 2392, secs: 5, slang: 1, tech: 2, t: "猫的礼仪与新机器", d: "回忆继续：未婚妻和猫处不来", when: "回忆 · 莫哈韦沙漠的工厂", recap: "回忆继续：Belle 和 Pete 处不来，想给它绝育，被 Dan 顶回。Dan 造出通用家务机器 Flexible Frank 的样机，Miles 催一年内投产，Dan 不肯。" },
  { id: "02c", n: 2, p: [112, 254], from: "I PIDDLED ALONG with the", words: 4524, secs: 8, slang: 2, tech: 2, t: "一场股东会", d: "回忆继续：Belle 说 Miles 要开个会", when: "回忆 · 莫哈韦沙漠的工厂", recap: "股东会上 Belle 用 Dan 送的股份和 Miles 一起否决了他，他被解雇，文件上全是他的签名，律师说没法告。当晚他把股票寄给 Ricky 托管，决定不冷眠，去找 Miles。" },
  { id: "03", n: 3, p: [1, 87], words: 3691, secs: 6, slang: 2, tech: 2, t: "上门对质", d: "Dan 开车去 Miles 家，要当面问个明白", when: "1970 年 12 月 3 日晚 · 圣费尔南多谷，Miles 家", recap: "Dan 上门对质。Miles 承认一周前和 Belle 结了婚，也给过她股票。Dan 又猜 Belle 来历不干净，逼得太紧，被 Belle 一针扎倒。" },
  { id: "04", n: 4, p: [1, 163], words: 4704, secs: 7, slang: 2, tech: 1, t: "醒着的木头人", d: "还是那间客厅，这回 Dan 只能听着", when: "1970 年 12 月 3 日深夜 · 圣费尔南多谷", recap: "Dan 中了药，清醒却只能听命。Pete 抓伤两人逃到屋外。Belle 翻出冷眠合同，改了文件，冒充他姐姐，把他送进另一家公司的冷库。猫没带上。" },
  { id: "05a", n: 5, p: [1, 104], from: "I WAS COMPLAINING to the", words: 4676, secs: 7, slang: 2, tech: 1, t: "三十年后的早饭", d: "一串乱梦，梦里他没手没脚", when: "2000 年 12 月 · 洛杉矶", recap: "Dan 醒在 2000 年 12 月的 Sawtelle 冷眠库。送早饭的机器是他那台 Flexible Frank 的后代。他想起 Pete 没跟来，认定它已死；决定先去找如今四十一岁的 Ricky。" },
  { id: "05b", n: 5, p: [105, 179], from: "THE ADDED VOCABULARIES were a", words: 2809, secs: 5, slang: 1, tech: 2, t: "出库那天", d: "补完课，换上新衣服，准备去结账", when: "2000 年 12 月 · 洛杉矶 Sawtelle 冷眠库", recap: "Dan 出库结账才知道：Belle 改填的那家保险公司早被掏空，他一文不剩。司库把他没用的四天食宿折成四百美元。他坐在 Wilshire 街边翻招聘栏的普工一栏。" },
  { id: "06a", n: 6, p: [1, 84], from: "I GOT A JOB the", words: 4549, secs: 7, slang: 2, tech: 1, t: "三十年后的头一份工", d: "出院第二天，身上只有四百美元", when: "2000 年 12 月 15 日 · 大洛杉矶", recap: "Dan 露宿被抓，法官介绍他去废车场看开关。他泡图书馆补课，构思一台听写机；发现 Aladdin 的绘图机像自己的手笔。Belle、Miles、Ricky 都没查到。" },
  { id: "06b", n: 6, p: [85, 142], from: "BUT THE FAILURE of my", words: 1928, secs: 4, slang: 2, tech: 1, t: "回老东家", d: "找人无果，Dan 去老东家求职", when: "2001 年 3 月 5 日 · 大洛杉矶", recap: "Dan 回 Hired Girl 求职，被挂上荣休工程师的名头当活广告。同事 Chuck 劝他没签合同别交出新设计。5 月，一直找他的 Mrs. Schultz 来电：她是 Belle。" },
  { id: "07", n: 7, p: [1, 76], words: 2237, secs: 5, slang: 2, tech: 0, t: "隔了三十年的会面", d: "Dan 去见打来电话的 Belle", when: "2001 年 5 月 3 日 · 大洛杉矶", recap: "Dan 去见 Belle：她老了，糊涂了。Miles 早已去世，遗产留给了 Ricky；Flexible Frank 当年连图纸一起失踪。Ricky 的下落只问出几条模糊线索。" },
  { id: "08a", n: 8, p: [1, 48], from: "THE NEXT MORNING was Friday,", words: 2012, secs: 4, slang: 2, tech: 2, t: "两只信封", d: "见过 Belle 的第二天，Dan 先去查旧档案", when: "2001 年 5 月 4 日，星期五 · 大洛杉矶", recap: "Dan 查不到 Miles 的死亡记录，和总工 McBee 闹僵。会计的公函说他的股票进了一个叫 Heinicke 的信托。调来的两份 1970 年专利，发明人都是 D. B. Davis。" },
  { id: "08b", n: 8, p: [49, 195], from: "AFTER QUITE A LONG time", words: 4837, secs: 8, slang: 2, tech: 2, t: "星期五的啤酒", d: "天黑了，Dan 还坐在办公室里没走", when: "2001 年 5 月 4 日傍晚 · Hired Girl 的办公室", recap: "Chuck 说同名是巧合，酒后漏出一桩机密：时间旅行做成过，但没法用。半夜 Dan 在报上看到 F. V. Heinicke 出了冷眠库，问明是 Frederica Virginia，人已离开。" },
  { id: "09", n: 9, p: [1, 138], words: 4536, secs: 7, slang: 1, tech: 2, t: "天一亮就上路", d: "一夜没睡，天刚亮 Dan 就出了门", when: "2001 年 5 月 5 日清晨 · 大洛杉矶", recap: "Dan 追到 Yuma，查到 Ricky 已结婚。他带十公斤金丝去找 Twitchell，哄出一次演示，又借「排练」站上台子，把教授激怒了。" },
  { id: "10a", n: 10, p: [1, 82], from: "EVEN AS HE stabbed at", words: 2206, secs: 5, slang: 1, tech: 1, t: "松针和碎石", d: "摔在地上，面前站着两个陌生人", when: "接上一章", recap: "Dan 落在博尔德附近山里的天体俱乐部，时间是 1970 年 5 月 3 日。律师 John Sutton 夫妇收留了他；他说自己来自未来，John 不信，但答应替他担保，教他金子该怎么说。" },
  { id: "10b", n: 10, p: [83, 209], from: "THE SUTTONS WERE staying over", words: 4715, secs: 8, slang: 1, tech: 2, t: "一间阁楼", d: "租了间阁楼，从早饭干到累倒", when: "接上一页 · 丹佛", recap: "Dan 在丹佛租阁楼，半年造出 Drafting Dan 和 Protean Pete，查清了 Belle 的底细，把专利和新公司 Aladdin 全交给 John 打理。12 月 2 日夜里他飞往洛杉矶。" },
  { id: "11", n: 11, p: [1, 137], words: 4828, secs: 8, slang: 1, tech: 1, t: "一夜之间的几件事", d: "天黑了，他在街边等一辆车", when: "接上一章 · 洛杉矶", recap: "Dan 拆走 Frank，接住冲出纱门的 Pete，连夜上山见 Ricky：把股票改写、公证后托付给她，约她成年后冷眠相见，并答应娶她。当天他带 Pete 再次入睡。" },
  { id: "12", n: 12, p: [1, 67], words: 3173, secs: 8, slang: 1, tech: 1, t: "还剩几件事", d: "故事接着上一章往下走，把话说完", when: "接上一章", recap: "Dan 2001 年醒来，接出冷眠的 Ricky，两人在 Yuma 结婚。他握着两家公司的股权，只开一间小设计室；想通了世界只有一个，认定未来比过去好。" },
];
// 已经写好的页（主编统一维护）
window.DS_READY = ["00", "01", "02a", "02b", "02c", "03", "04", "05a", "05b", "06a", "06b", "07", "08a", "08b", "09", "10a", "10b", "11", "12"];
