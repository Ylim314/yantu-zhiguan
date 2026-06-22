import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import { config } from './config.js'
import { seedMistakes, seedPlans, seedProfile, seedSubjects, seedTasks } from './data/seed.js'

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true })

/** SQLite 同步连接适合课程项目的小规模本地数据读写。 */
export const db = new DatabaseSync(config.databasePath)

/** 在事务中执行一组数据库操作，任一操作失败时自动回滚。 */
export function transaction(callback) {
  db.exec('BEGIN')
  try {
    const result = callback()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

/** 创建数据库表和索引，并确保默认演示账号存在。 */
export function initializeDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      target_school TEXT NOT NULL DEFAULT '',
      target_major TEXT NOT NULL DEFAULT '',
      exam_year INTEGER NOT NULL DEFAULT 2027,
      daily_target_hours INTEGER NOT NULL DEFAULT 8,
      avatar TEXT NOT NULL DEFAULT '',
      motto TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      target_hours REAL NOT NULL DEFAULT 0,
      finished_hours REAL NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#2080f0',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, name)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      deadline TEXT NOT NULL DEFAULT '',
      estimated_minutes INTEGER NOT NULL DEFAULT 0,
      actual_minutes INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      chapter TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      solution TEXT NOT NULL DEFAULT '',
      review_count INTEGER NOT NULL DEFAULT 0,
      next_review_date TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      time_range TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_mistakes_user_difficulty ON mistakes(user_id, difficulty);
    CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, date);
  `)

  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin')
  if (!admin) {
    transaction(() => {
      const result = db.prepare(`
        INSERT INTO users (
          username, password_hash, name, target_school, target_major,
          exam_year, daily_target_hours, avatar, motto
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'admin',
        bcrypt.hashSync('123456', 10),
        'admin',
        seedProfile.targetSchool,
        seedProfile.targetMajor,
        seedProfile.examYear,
        seedProfile.dailyTargetHours,
        seedProfile.avatar,
        seedProfile.motto,
      )
      seedUserData(Number(result.lastInsertRowid))
    })
  }
}

/** 为新注册用户复制一套完整的课程演示数据。 */
export function seedUserData(userId) {
  const subjectInsert = db.prepare(`
    INSERT INTO subjects (
      user_id, name, category, target_hours, finished_hours, color, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const taskInsert = db.prepare(`
    INSERT INTO tasks (
      user_id, subject_id, title, type, priority, status, deadline,
      estimated_minutes, actual_minutes, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const mistakeInsert = db.prepare(`
    INSERT INTO mistakes (
      user_id, title, subject_name, chapter, difficulty, reason, solution,
      review_count, next_review_date, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const planInsert = db.prepare(`
    INSERT INTO plans (
      user_id, date, title, subject_name, time_range, status, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const subjectIds = new Map()
  for (const subject of seedSubjects) {
    const result = subjectInsert.run(
      userId,
      subject.name,
      subject.category,
      subject.targetHours,
      subject.finishedHours,
      subject.color,
      subject.description,
    )
    subjectIds.set(subject.name, Number(result.lastInsertRowid))
  }

  for (const task of seedTasks) {
    taskInsert.run(
      userId,
      subjectIds.get(task.subjectName),
      task.title,
      task.type,
      task.priority,
      task.status,
      task.deadline,
      task.estimatedMinutes,
      task.actualMinutes,
      task.description,
    )
  }

  for (const mistake of seedMistakes) {
    mistakeInsert.run(
      userId,
      mistake.title,
      mistake.subjectName,
      mistake.chapter,
      mistake.difficulty,
      mistake.reason,
      mistake.solution,
      mistake.reviewCount,
      mistake.nextReviewDate,
      JSON.stringify(mistake.tags),
    )
  }

  for (const plan of seedPlans) {
    planInsert.run(
      userId,
      plan.date,
      plan.title,
      plan.subjectName,
      plan.timeRange,
      plan.status,
      plan.remark,
    )
  }
}
