# 📸 Photo English Card · 拍照学英语

> 随手拍一张照片，让 AI 智能体把它变成一张杂志风的英语学习海报。
> Turn any everyday photo into a magazine-style English study card — vocabulary, phrases, sentence patterns, a scene description and speaking prompts, all built around what's actually in your photo.

这是一个 **Agent Skill**（`SKILL.md` 格式）。装进你常用的编程智能体之后，只要发一张照片说"拍照学英语"，它就会：

1. 看懂照片里真实有什么
2. 写出围绕这张照片的学习内容（中英对照）
3. 调用本地浏览器把内容渲染成一张 2160px 宽的 PNG 海报

## 海报里有什么

| 板块 | 内容 |
|---|---|
| 标题区 | 手写感大标题 + 中文副标题 + 主题标签 + 你的照片 |
| **01 · key vocabulary** | 8 个带搭配的词汇，每个配一张**从你照片里裁出来的**圆形小图 |
| **02 · natural phrases** | 8 个母语者在这个场景下真会说的地道短语 |
| **03 · useful sentence patterns** | 6 个第一人称口语句型，可直接套用 |
| **04 · describe the scene** | 一段看图描述范文（雅思 Part 2 / 看图写作思路） |
| **05 · speak & write** | 3 道由浅入深的口语 / 写作练习，提示用本卡学过的表达 |
| study tip | 一句学习提示 |

内容设计上会让 01、02 里的表达在 03、04、05 中反复出现，同一个表达在三种语境里各见一次，更容易记住。四套配色（cocoa / matcha / ocean / berry）会按照片的主色调自动选用。

## 支持的智能体

任何**能读取本地文件、能执行命令行、并且模型支持图片输入**的智能体都可以使用。已适配的工具：

| 智能体 | 说明 |
|---|---|
| **Claude Code** | 原生支持 Agent Skills，自动触发 |
| **Codex** (OpenAI Codex CLI) | 支持 Agent Skills，自动触发 |
| **Kimi Code** | 放入 skills 目录，或对话中让它读取 `SKILL.md` |
| **ZCode** | 放入 skills 目录，或对话中让它读取 `SKILL.md` |
| **WorkBuddy** | 放入 skills 目录，或对话中让它读取 `SKILL.md` |
| **Harness** | 放入 skills 目录，或对话中让它读取 `SKILL.md` |
| **DeepSeek**（各类接入 DeepSeek 模型的智能体） | 见下方注意事项 |
| 其他（Cursor、Gemini CLI、OpenCode…） | 同上：放入 skills 目录，或让它读取 `SKILL.md` |

> ⚠️ **模型需要能看图。** 这个 skill 的核心是"看懂你的照片"，所以底层模型必须支持图片输入。如果你用的模型是纯文本模型（例如部分 DeepSeek 模型），请在该工具里切换到多模态模型后再使用。

## 环境要求

- **Node.js 18+**（渲染脚本零依赖，不需要 `npm install`）
- **Chrome / Edge / Chromium** 任意一个（用于无头渲染出图）
- 中文字体推荐 **Noto Serif SC / 思源宋体**；没有的话会自动回退到系统宋体

## 安装

把整个仓库放进你所用智能体的 skills 目录即可。

**Claude Code**

```bash
git clone https://github.com/AdenXie/photo-english-card.git ~/.claude/skills/photo-english-card
```

**Codex**

```bash
git clone https://github.com/AdenXie/photo-english-card.git ~/.codex/skills/photo-english-card
```

**Kimi Code / ZCode / WorkBuddy / Harness / 其他智能体**

把仓库克隆到该工具的 skills 目录（具体路径以各工具文档为准）。如果你的工具还不支持 skills，克隆到任意位置也能用：

```bash
git clone https://github.com/AdenXie/photo-english-card.git
```

然后在对话里告诉它：

```text
请先阅读 <克隆路径>/photo-english-card/SKILL.md，然后按照里面的流程，用这张照片做一张英语学习卡片：<照片路径>
```

## 使用方法

在支持 skills 的智能体里，直接发照片并说出你的需求即可，例如：

- `拍照学英语`（附上照片）
- `把这张图做成英语学习卡片`
- `这张照片里的东西英语怎么说？帮我做成海报`
- `用这张图帮我做一张雅思口语素材卡`
- `Make an English study card from this photo: ./photos/lunch.jpg`

也可以附加要求：

- **难度 / 目标**：`按四六级难度`、`给小学生用`、`托福口语`（默认雅思 6–7 / CEFR B2）
- **配色**：`用绿色那套配色`
- **其他语言**：`做成日语学习卡片`（板块结构不变，内容换成目标语言）

出图后，智能体会自己检查一遍成品（缩略图有没有裁对、有没有难看的折行），有问题会自动修正后重新渲染。

### 手动渲染

如果你想自己改内容再出图，可以直接编辑内容 JSON 后运行：

```bash
node scripts/render.mjs path/to/photo.content.json path/to/output.png
```

| 参数 | 作用 |
|---|---|
| `--scale 1` | 输出 1080px 宽的小图，适合快速预览（默认 `2`） |
| `--keep-html` | 在 PNG 旁保留一份自包含的 HTML，方便调试版式 |

找不到浏览器时，设置环境变量 `CARD_BROWSER` 指向 Chrome / Edge 的可执行文件。

内容 JSON 的完整格式见 [`SKILL.md`](SKILL.md)，示例见 [`assets/example.content.json`](assets/example.content.json)。

## 目录结构

```text
photo-english-card/
├── SKILL.md                    # skill 说明：流程、内容格式、写作原则
├── scripts/render.mjs          # 渲染脚本（Node，无依赖，驱动无头 Chrome/Edge）
└── assets/
    ├── template.html           # 海报模板
    ├── example.content.json    # 内容示例
    └── fonts/                  # Fraunces 字体（SIL OFL 1.1）
```

## 致谢与许可

- 灵感来自小红书用户 **@捡来的松果** 分享的"拍照学英语"海报
- 英文字体 [Fraunces](https://github.com/undercasetype/Fraunces)，SIL Open Font License 1.1（见 `assets/fonts/OFL.txt`）
- 代码以 [MIT License](LICENSE) 发布
