const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || '/data/docs.db';
const db = new Database(dbPath);

// 初始化表
db.exec(`
  CREATE TABLE IF NOT EXISTS docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT '未命名文档',
    content TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 开启 WAL 模式提升并发性能
db.pragma('journal_mode = WAL');

module.exports = db;
