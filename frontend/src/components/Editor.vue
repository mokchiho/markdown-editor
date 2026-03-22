<template>
  <div class="editor-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <input class="title-input" v-model="localTitle" placeholder="文档标题" @blur="saveTitle" @keydown.enter="saveTitle" />
      <div class="toolbar-actions">
        <span class="save-status">{{ saveStatus }}</span>
        <button class="btn-action" @click="downloadMd" title="下载为 .md">⬇ 下载</button>
        <button class="btn-action btn-save" @click="save">💾 保存</button>
      </div>
    </div>

    <!-- 编辑 + 预览 -->
    <div class="panes">
      <div class="pane pane-editor">
        <div class="pane-label">编辑</div>
        <div ref="editorRef" class="cm-host"></div>
      </div>
      <div class="pane pane-preview">
        <div class="pane-label">预览</div>
        <div class="preview-content" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { marked } from 'marked'
import { docsApi } from '../api/docs.js'

const props = defineProps({ doc: Object })
const emit = defineEmits(['save', 'update'])

const editorRef = ref(null)
const localTitle = ref(props.doc?.title || '')
const saveStatus = ref('')
let view = null
let debounceTimer = null

const renderedHtml = computed(() => {
  if (!props.doc?.content) return '<p style="color:#999">预览区域</p>'
  return marked(props.doc.content)
})

// 初始化 CodeMirror
onMounted(() => {
  const state = EditorState.create({
    doc: props.doc?.content || '',
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            const content = update.state.doc.toString()
            emit('update', { ...props.doc, content, title: localTitle.value })
            autoSave(content)
          }, 800)
        }
      }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '14px' },
        '.cm-content': { padding: '16px' },
        '.cm-gutters': { background: '#f5f5f5', borderRight: '1px solid #ddd' }
      })
    ]
  })

  view = new EditorView({ state, parent: editorRef.value })
})

onUnmounted(() => {
  view?.destroy()
  clearTimeout(debounceTimer)
})

watch(() => props.doc, (newDoc) => {
  localTitle.value = newDoc?.title || ''
  if (view && newDoc) {
    const current = view.state.doc.toString()
    if (current !== newDoc.content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: newDoc.content }
      })
    }
  }
}, { deep: true })

async function autoSave(content) {
  saveStatus.value = '自动保存中...'
  try {
    await docsApi.update(props.doc.id, { title: localTitle.value, content })
    saveStatus.value = '已自动保存'
    emit('update', { ...props.doc, content, title: localTitle.value })
  } catch {
    saveStatus.value = '保存失败'
  }
  setTimeout(() => { saveStatus.value = '' }, 2000)
}

function saveTitle() {
  emit('update', { ...props.doc, title: localTitle.value })
}

function save() {
  const content = view?.state.doc.toString() || props.doc.content
  emit('save', { ...props.doc, content, title: localTitle.value })
}

function downloadMd() {
  const content = view?.state.doc.toString() || props.doc.content
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${localTitle.value || '文档'}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.editor-container { display: flex; flex-direction: column; height: 100vh; }
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}
.title-input {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 4px 8px;
  border-radius: 4px;
}
.title-input:focus { background: #f0f0f0; }
.toolbar-actions { display: flex; align-items: center; gap: 8px; }
.save-status { font-size: 12px; color: #888; min-width: 70px; }
.btn-action {
  background: #eee;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-save { background: #4CAF50; color: white; border-color: #388E3C; }
.panes { display: flex; flex: 1; overflow: hidden; }
.pane { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.pane-editor { border-right: 1px solid #ddd; }
.pane-label {
  padding: 6px 16px;
  font-size: 12px;
  color: #888;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}
.cm-host { flex: 1; overflow: hidden; }
.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 32px;
  line-height: 1.7;
  font-size: 15px;
}
.preview-content :deep(h1) { font-size: 2em; margin: 0.5em 0; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.preview-content :deep(h2) { font-size: 1.5em; margin: 0.5em 0; }
.preview-content :deep(h3) { font-size: 1.2em; margin: 0.5em 0; }
.preview-content :deep(pre) { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
.preview-content :deep(code) { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
.preview-content :deep(blockquote) { border-left: 4px solid #ddd; padding-left: 16px; color: #666; margin: 1em 0; }
.preview-content :deep(table) { border-collapse: collapse; width: 100%; }
.preview-content :deep(th), .preview-content :deep(td) { border: 1px solid #ddd; padding: 8px; }
.preview-content :deep(th) { background: #fafafa; }
</style>
