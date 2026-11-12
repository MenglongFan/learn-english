# 0004 - 技术栈选 Astro，部署 GitHub Pages

内容驱动站（365 课 markdown 批量内容）+ 浏览器轻交互的组合是 Astro 的主场：Content Collections 原生支持批量 markdown，默认构建产物零 JS，交互组件（生词收藏/每日小测/SRS 队列）以岛屿形式按需水合。

否决的替代方案：纯手写静态 HTML（内容-模板耦合，365 页规模下不可持续）；Next.js SSG（对单用户内容站过度设计，bundle 重）。

部署目标 GitHub Pages，与用户既有个人站保持一致，构建产物为纯静态文件。

## Consequences

- 引入 Node 工具链与构建步骤，内容作者需在本地跑 `astro build` 后才能预览。
- 交互组件限制在岛屿内，不做全局 SPA 化。
