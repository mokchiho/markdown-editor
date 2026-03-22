<template>
  <div class="layout">
    <!-- 左侧文档列表 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>📄 文档</h2>
        <button class="btn-new" @click="createDoc">+ 新建</button>
      </div>
      <div class="doc-list">
        <div
          v-for="doc in docs"
          :key="doc.id"
          class="doc-item"
          :class="{ active: currentDoc && currentDoc.id === doc.id }"
          @click="selectDoc(doc.id)"
        >
          <span class="doc-title">{{ doc.title }}</span>
          <button class="btn-delete" @click.stop="deleteDoc(doc.id)" title="删除">🗑</button>
        </div>
        <div v-if="docs.length === 0" class="empty-tip">暂无文档，点击新建</div>
      </div>
    </aside>

    <!-- 右侧编辑区 -->
    <main class="editor-area">
      <div v-if="!currentDoc" class="no-doc">
        <p>选择或新建一个文档开始编辑</p>
        <button class="btn-primary" @click="createDoc">新建文档</button>
      </div>
      <Editor v-else :doc="currentDoc" @save="onSave" @update="onUpdate" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { docsApi } from './api/docs.js'
import Editor from './components/Editor.vue'

const docs = ref([])
const currentDoc = ref(null)

async function loadDocs() {
  const res = await docsApi.list()
  docs.value = res.data
}

async function selectDoc(id) {
  const res = await docsApi.get(id)
  currentDoc.value = res.data
}

async function createDoc() {
  const res = await docsApi.create({ title: '新文档', content: '# 新文档\n\n开始写作吧...' })
  currentDoc.value = res.data
  await loadDocs()
}

async function deleteDoc(id) {
  if (!confirm('确定删除此文档？')) return
  await docsApi.delete(id)
  if (currentDoc.value && currentDoc.value.id === id) currentDoc.value = null
  await loadDocs()
}

function onUpdate(doc) {
  currentDoc.value = doc
  // 更新列表中的标题
  const found = docs.value.find(d => d.id === doc.id)
  if (found) found.title = doc.title
}

async function onSave(doc) {
  const res = await docsApi.update(doc.id, { title: doc.title, content: doc.content })
  currentDoc.value = res.data
  await loadDocs()
}

onMounted(loadDocs)
</script>

<style scoped>
.layout { display: flex; height: 100vh; }
.sidebar {
  width: 240px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}
.sidebar-header h2 { font-size: 16px; }
.btn-new {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.doc-list { flex: 1; overflow-y: auto; padding: 8px; }
.doc-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.doc-item:hover { background: #e8e8e8; }
.doc-item.active { background: #d0e8ff; }
.doc-title { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.btn-delete { background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.4; }
.btn-delete:hover { opacity: 1; }
.empty-tip { text-align: center; color: #999; padding: 20px; font-size: 13px; }
.editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.no-doc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #666;
}
.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
}
</style>
