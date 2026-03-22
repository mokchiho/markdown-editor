const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/docs - 获取所有文档列表
router.get('/', (req, res) => {
  try {
    const docs = db.prepare('SELECT id, title, created_at, updated_at FROM docs ORDER BY updated_at DESC').all();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/docs/:id - 获取单篇文档
router.get('/:id', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM docs WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: '文档不存在' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/docs - 创建文档
router.post('/', (req, res) => {
  try {
    const { title = '未命名文档', content = '' } = req.body;
    const result = db.prepare('INSERT INTO docs (title, content) VALUES (?, ?)').run(title, content);
    const doc = db.prepare('SELECT * FROM docs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/docs/:id - 更新文档
router.put('/:id', (req, res) => {
  try {
    const { title, content } = req.body;
    const existing = db.prepare('SELECT * FROM docs WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: '文档不存在' });

    db.prepare('UPDATE docs SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(title ?? existing.title, content ?? existing.content, req.params.id);

    const doc = db.prepare('SELECT * FROM docs WHERE id = ?').get(req.params.id);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/docs/:id - 删除文档
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM docs WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: '文档不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
