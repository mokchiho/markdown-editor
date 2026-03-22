# 📝 在线 Markdown 编辑器

Vue3 + Express + SQLite + Docker Compose 一键部署的在线 Markdown 编辑器。

## 功能

- 📄 **文档管理** — 创建、编辑、删除文档
- ✏️ **实时预览** — 左侧编辑，右侧即时渲染 Markdown
- 💾 **自动保存** — 编辑后 0.8 秒自动保存到 SQLite
- ⬇️ **下载 MD** — 一键下载当前文档为 `.md` 文件

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/mokchiho/markdown-editor.git
cd markdown-editor

# 一键启动
sudo docker compose up -d
```

然后浏览器打开 **http://localhost:8080**

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + CodeMirror 6 + marked |
| 后端 | Node.js + Express + SQLite |
| 部署 | Docker Compose |

## 项目结构

```
markdown-editor/
├── docker-compose.yml
├── backend/              # Express API (端口 3000)
│   ├── routes/docs.js    # CRUD 接口
│   └── db.js             # SQLite
└── frontend/            # Vue3 SPA (端口 8080)
    └── src/
        ├── App.vue       # 文档列表
        └── components/Editor.vue  # 编辑+预览
```
