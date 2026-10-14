---
name: photo-english-card
description: 把用户随手拍的一张照片变成一张杂志风的英语学习海报（PNG）——大标题 + 照片 + 01 key vocabulary / 02 natural phrases / 03 useful sentence patterns / 04 describe the scene / 05 speak & write 五个板块，中英对照。只要用户发来一张照片并想"用它学英语"就用这个 skill：例如"拍照学英语"、"把这张图做成英语卡片/海报/学习笔记"、"这张照片里的东西英语怎么说"、"帮我做一张雅思口语素材卡"、"make an English study card from this photo"，或者只是丢来一张生活照说"学英语"。即使用户没有说"海报"或"卡片"，只要是"照片 + 学英语/学口语/背单词"的组合，都应该用它。
---

# Photo English Card · 拍照学英语

把一张生活照变成一张可以直接发小红书 / 存相册的英语学习海报。你负责两件事：**看懂照片并写出高质量的学习内容**（一个 JSON），然后**运行渲染脚本**出图。版式、字体、配色都已固定在模板里，不需要自己写 HTML。

## 流程

1. **看照片。** 用你的读图能力打开用户的图片（需要支持图片输入的多模态模型），认真看清里面真实有什么：物体、材质、颜色、动作、场景、氛围。渲染脚本需要照片的本地文件路径：如果用户只在对话里贴了图，先看看对话或附件信息里有没有本地路径，没有就请用户把照片保存到本地并告诉你路径。HEIC 不支持，需要先转成 jpg/png。
2. **写内容 JSON。** 按下面的 schema 和写作原则，保存为 `<照片名>.content.json`，放在照片旁边（或用户指定的目录）。`photo` 字段写相对于这个 JSON 的路径。
3. **渲染。**
   ```bash
   node <本 skill 所在目录>/scripts/render.mjs <照片名>.content.json <照片名>-english-card.png
   ```
   脚本会调用本机的 Chrome / Edge 无头模式，输出 2160px 宽的 PNG（高度随内容自适应），并在终端报告标题字号和哪些行发生了折行。
4. **自己看一眼成品。** 打开输出的 PNG 检查：缩略图有没有裁到对的东西、标题是否够大、有没有难看的折行、中英文是否对齐。有问题就改 JSON 重新渲染——这一步很便宜，值得做。
5. **交付。** 告诉用户图片路径，并用一两句话点出这张卡片里最值得记的 2–3 个表达。

## 内容 JSON

```json
{
  "photo": "bowl.jpg",
  "focus": [0.45, 0.6],
  "palette": "cocoa",
  "title": ["build", "your", "bowl"],
  "subtitle_cn": "一碗自己搭出来的满足",
  "tags": ["food English", "IELTS speaking", "texture, choice & everyday routines"],
  "vocabulary": [
    { "en": "fresh figs", "cn": "新鲜无花果", "crop": [0.24, 0.52, 0.2] },
    { "en": "a creamy base", "cn": "细腻顺滑的底", "emoji": "🥣" }
  ],
  "phrases":  [{ "en": "add a bit of crunch", "cn": "增加一点酥脆口感" }],
  "patterns": [{ "en": "It's simple, but it keeps me going until lunchtime.", "cn": "虽然简单，但能让我一直有精神到午餐时间。" }],
  "scene":    { "en": "This is a colourful yogurt bowl …", "cn": "这是一碗……" },
  "prompts":  [{ "q": "What would you add to your ideal yogurt bowl?", "hints": ["top it with", "add a bit of crunch", "go easy on"] }],
  "tip":      { "en": "Learn the phrase in a real situation, not on its own.", "cn": "学习提示：别只背单词，要记住它在真实情境里怎么用。" }
}
```

完整示例见 `assets/example.content.json`。

| 字段 | 数量 / 长度 | 说明 |
|---|---|---|
| `title` | 2–3 行，每行 1–2 个短词 | 海报大标题，自动小写、自动缩放。行越短字越大，所以要短：`build / your / bowl`、`rainy / day / walk`、`desk / reset` |
| `subtitle_cn` | ≤ 12 个汉字 | 一句有画面感的中文副标题，不是标题的直译 |
| `tags` | 3 个 | 主题 · 用途 · 这张卡练的话题，如 `food English` / `IELTS speaking` / `texture, choice & everyday routines` |
| `focus` | `[x, y]`，0–1 | 照片主体中心的位置。头图会裁成偏竖的形状，这个值决定裁切时保住哪里 |
| `palette` | 可选 | `cocoa`（默认，奶油+棕+砖红，适合食物/咖啡/室内）、`matcha`（绿，植物/户外/茶）、`ocean`（藏蓝+橙，海边/城市/天空）、`berry`（莓红，花/甜品/穿搭）。按照片主色调选 |
| `vocabulary` | 8 条 | 英文 ≤ 3 个词，中文 ≤ 7 个字 |
| `phrases` | 8 条 | 英文 ≤ 32 个字符，中文 ≤ 9 个字（超了会折行） |
| `patterns` | 6 条 | 完整句子，英文 ≤ 70 个字符 |
| `scene` | 英文 50–65 词 | 一段描述 + 中文翻译 |
| `prompts` | 3 条 | 问题 ≤ 55 个字符，每条 3 个 hint |
| `tip` | 1 条 | 英文一句 + 中文一句，尽量短（要排在同一行） |
| `labels` | 可选 | 覆盖板块标题，键为 `vocabulary / phrases / patterns / scene / practice / hint / tip` |

### 词汇缩略图：`crop` 还是 `emoji`

每个词左边有一个圆形小图。**优先用 `crop`** ——直接从用户自己的照片里裁出这个东西，这是这张卡片最打动人的地方（"这就是我碗里那颗无花果"）。

- `crop: [cx, cy, w]`：圆心的 x、y 和裁切宽度，都是相对照片宽高的 0–1 比例。`w` 取物体宽度的 1.2–1.5 倍，留一点余量——你估的坐标不会完全准，裁得太紧容易裁偏。
- 第一个词常常是整体（"yogurt bowl"），给它一个大的 `w`（0.6–0.8）框住主体即可。
- 照片里指不出具体位置的抽象词（"toppings"、"a cosy corner"）用 `emoji` 代替。
- 渲染后务必检查每个缩略图裁到的是不是那个东西，偏了就调坐标重渲。

## 写作原则

这张卡片的价值不在排版，而在内容是否真的能让人开口。下面这些原则比字数限制重要。

**只教照片里真实存在的东西。** 逐项确认每个词汇在照片里都看得到。原版海报就犯过这个错：碗里放的是香蕉片，词汇表却写了 "sliced kiwi"。学习者是对着自己的照片记单词的，一个不存在的东西会毁掉整张卡的可信度。看不清是什么就不要猜，换一个确定的。

**词汇要带搭配，不要光秃秃的名词。** `fresh figs`、`crunchy cereal`、`a drizzle of chocolate` 比 `fig`、`cereal`、`chocolate` 有用得多——形容词 + 名词的组合才是能直接搬进句子里的单位。8 个词里尽量覆盖：整体名称、主要物体、材质/质感、一两个细节。

**短语要是可迁移的地道语块。** 02 板块不是再列 8 个名词，而是母语者在这个场景下真正会说的动词短语和表达：`load up on…`、`go easy on…`、`throw together…`、`keep me going`。判断标准：换一个场景这个短语还能用吗？能，就是好短语。

**板块之间要循环复现。** 这是整张卡的设计核心：01 的词和 02 的短语，要在 03 的句子和 04 的段落里再次出现，05 的 hints 又指回 02、03 的表达。同一个表达被看到三次、在三种语境里，才记得住。写完后检查一遍：02 的 8 个短语里至少有 5 个在 03/04/05 中被用到。

**句型要是"我"会说的话。** 03 的句子以第一人称、口语语气为主，像雅思口语 Part 1 的自然回答：有习惯（I usually…）、有偏好（I like having…）、有评价（…works really well with…）、有假设或让步（I'd probably… if… / It's simple, but…）。六句用六种不同的句式骨架，让学习者能套着造句。

**场景描述示范"怎么把一张图说成一段话"。** 04 用第三人称，结构是：这是什么 → 有哪些细节 → 给人什么感觉/适合什么场合。对应雅思 Part 2 和看图写作的套路。

**练习题从这张图走向学习者自己的生活。** 05 的三个题目由近到远：①就这张图的话题问个人偏好；②扩展到相关的日常话题；③一个稍抽象、需要描述+评价的题。hints 给的是本卡学过的表达，不是答案。

**中文是意译，不是词典释义。** `a guilt-free treat` → "没什么负担的小奖励"，而不是"无罪恶感的款待"。读起来要像中文母语者说的话。

**默认难度是雅思 6–7 / CEFR B2**，默认英式拼写（colourful）。用户说明了水平或目标（四六级、托福、日常口语、给孩子学）就相应调整词汇难度、`tags` 和题型；用户要学的是其他语言时，板块结构不变，把英文内容换成目标语言，并用 `labels` 改板块标题。

## 排查

- **找不到浏览器**：设置环境变量 `CARD_BROWSER` 指向 Chrome / Edge / Chromium 可执行文件。
- **脚本提示某些行折行**：缩短那一条的英文或中文释义。
- **标题字号 < 110px**：标题某一行太长，拆行或换更短的词。
- **想微调版式**：`--keep-html` 会在 PNG 旁边留下一份自包含的 HTML 方便调试；模板在 `assets/template.html`。`--scale 1` 可以输出 1080px 宽的小图用于快速预览。
