import express from 'express'
import bcrypt from 'bcryptjs'
import { db, seedUserData, transaction } from './db.js'
import { authenticate, createToken } from './auth.js'
import { ApiError, asyncHandler, numeric, requiredText, success } from './http.js'
import { seedProfile } from './data/seed.js'

export const apiRouter = express.Router()

/** 将数据库用户字段转换为前端使用的个人信息结构。 */
function mapUser(row) {
  return {
    name: row.name,
    targetSchool: row.target_school,
    targetMajor: row.target_major,
    examYear: row.exam_year,
    dailyTargetHours: row.daily_target_hours,
    avatar: row.avatar,
    motto: row.motto,
  }
}

/** 科目进度由已学学时和目标学时实时计算，避免冗余字段失去同步。 */
function mapSubject(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    progress: row.target_hours > 0
      ? Math.round((row.finished_hours / row.target_hours) * 100)
      : 0,
    targetHours: row.target_hours,
    finishedHours: row.finished_hours,
    color: row.color,
    description: row.description,
  }
}

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    type: row.type,
    priority: row.priority,
    status: row.status,
    deadline: row.deadline,
    estimatedMinutes: row.estimated_minutes,
    actualMinutes: row.actual_minutes,
    description: row.description,
  }
}

function mapMistake(row) {
  let tags = []
  try {
    tags = JSON.parse(row.tags_json)
  } catch {
    tags = []
  }
  return {
    id: row.id,
    title: row.title,
    subjectName: row.subject_name,
    chapter: row.chapter,
    difficulty: row.difficulty,
    reason: row.reason,
    solution: row.solution,
    reviewCount: row.review_count,
    nextReviewDate: row.next_review_date,
    tags,
  }
}

function mapPlan(row) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    subjectName: row.subject_name,
    timeRange: row.time_range,
    status: row.status,
    remark: row.remark,
  }
}

function getUser(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) throw new ApiError(404, '用户不存在')
  return user
}

function getSubject(userId, subjectId) {
  const subject = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?').get(subjectId, userId)
  if (!subject) throw new ApiError(404, '科目不存在')
  return subject
}

function getTask(userId, taskId) {
  const task = db.prepare(`
    SELECT t.*, s.name AS subject_name
    FROM tasks t
    JOIN subjects s ON s.id = t.subject_id
    WHERE t.id = ? AND t.user_id = ?
  `).get(taskId, userId)
  if (!task) throw new ApiError(404, '任务不存在')
  return task
}

function getMistake(userId, mistakeId) {
  const mistake = db.prepare('SELECT * FROM mistakes WHERE id = ? AND user_id = ?').get(mistakeId, userId)
  if (!mistake) throw new ApiError(404, '错题不存在')
  return mistake
}

function getPlan(userId, planId) {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?').get(planId, userId)
  if (!plan) throw new ApiError(404, '学习计划不存在')
  return plan
}

/** 健康检查无需登录，便于启动脚本和自动化测试确认服务状态。 */
apiRouter.get('/health', (_req, res) => {
  success(res, { status: 'ok', database: 'sqlite' }, '服务运行正常')
})

/** 用户注册：写入加密密码，并在同一事务中复制完整初始学习数据。 */
apiRouter.post('/auth/register', asyncHandler(async (req, res) => {
  const username = requiredText(req.body.username, '用户名')
  const password = String(req.body.password ?? '')
  const name = requiredText(req.body.name || username, '姓名')

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    throw new ApiError(400, '用户名需为3-20位字母、数字或下划线')
  }
  if (password.length < 6 || password.length > 50) {
    throw new ApiError(400, '密码长度需为6-50位')
  }
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
    throw new ApiError(409, '用户名已存在')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const userId = transaction(() => {
    const result = db.prepare(`
      INSERT INTO users (
        username, password_hash, name, target_school, target_major,
        exam_year, daily_target_hours, avatar, motto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      username,
      passwordHash,
      name,
      seedProfile.targetSchool,
      seedProfile.targetMajor,
      seedProfile.examYear,
      seedProfile.dailyTargetHours,
      seedProfile.avatar,
      seedProfile.motto,
    )
    const id = Number(result.lastInsertRowid)
    seedUserData(id)
    return id
  })

  const user = getUser(userId)
  success(res, {
    token: createToken(user),
    user: mapUser(user),
  }, '注册成功', 201)
}))

/** 用户登录：bcrypt 校验密码后签发 JWT。 */
apiRouter.post('/auth/login', asyncHandler(async (req, res) => {
  const username = requiredText(req.body.username, '用户名')
  const password = String(req.body.password ?? '')
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new ApiError(401, '用户名或密码错误')
  }

  success(res, {
    token: createToken(user),
    user: mapUser(user),
  }, '登录成功')
}))

apiRouter.use(authenticate)

apiRouter.get('/auth/me', (req, res) => {
  success(res, mapUser(getUser(req.user.id)))
})

/** 修改个人资料时只开放前端表单对应字段，用户名和密码不在此接口修改。 */
apiRouter.put('/profile', (req, res) => {
  const current = getUser(req.user.id)
  const data = {
    name: requiredText(req.body.name ?? current.name, '姓名'),
    targetSchool: String(req.body.targetSchool ?? current.target_school).trim(),
    targetMajor: String(req.body.targetMajor ?? current.target_major).trim(),
    examYear: Math.round(numeric(req.body.examYear, current.exam_year)),
    dailyTargetHours: numeric(req.body.dailyTargetHours, current.daily_target_hours),
    avatar: String(req.body.avatar ?? current.avatar).trim(),
    motto: String(req.body.motto ?? current.motto).trim(),
  }

  db.prepare(`
    UPDATE users
    SET name = ?, target_school = ?, target_major = ?, exam_year = ?,
        daily_target_hours = ?, avatar = ?, motto = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    data.name,
    data.targetSchool,
    data.targetMajor,
    data.examYear,
    data.dailyTargetHours,
    data.avatar,
    data.motto,
    req.user.id,
  )

  success(res, mapUser(getUser(req.user.id)), '个人信息保存成功')
})

/** 科目 API 支持分类与关键词筛选。 */
apiRouter.get('/subjects', (req, res) => {
  const conditions = ['user_id = ?']
  const params = [req.user.id]
  if (req.query.category) {
    conditions.push('category = ?')
    params.push(String(req.query.category))
  }
  if (req.query.keyword) {
    conditions.push('(name LIKE ? OR description LIKE ?)')
    const keyword = `%${String(req.query.keyword)}%`
    params.push(keyword, keyword)
  }

  const rows = db.prepare(`
    SELECT * FROM subjects
    WHERE ${conditions.join(' AND ')}
    ORDER BY id
  `).all(...params)
  success(res, rows.map(mapSubject))
})

apiRouter.post('/subjects', (req, res) => {
  const name = requiredText(req.body.name, '科目名称')
  const result = db.prepare(`
    INSERT INTO subjects (
      user_id, name, category, target_hours, finished_hours, color, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    name,
    requiredText(req.body.category, '科目分类'),
    numeric(req.body.targetHours),
    numeric(req.body.finishedHours),
    String(req.body.color || '#2080f0'),
    String(req.body.description || ''),
  )
  success(res, mapSubject(getSubject(req.user.id, Number(result.lastInsertRowid))), '科目添加成功', 201)
})

apiRouter.put('/subjects/:id', (req, res) => {
  const current = getSubject(req.user.id, Number(req.params.id))
  db.prepare(`
    UPDATE subjects
    SET name = ?, category = ?, target_hours = ?, finished_hours = ?,
        color = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    requiredText(req.body.name ?? current.name, '科目名称'),
    requiredText(req.body.category ?? current.category, '科目分类'),
    numeric(req.body.targetHours, current.target_hours),
    numeric(req.body.finishedHours, current.finished_hours),
    String(req.body.color ?? current.color),
    String(req.body.description ?? current.description),
    current.id,
    req.user.id,
  )
  success(res, mapSubject(getSubject(req.user.id, current.id)), '科目修改成功')
})

apiRouter.delete('/subjects/:id', (req, res) => {
  const subject = getSubject(req.user.id, Number(req.params.id))
  db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(subject.id, req.user.id)
  success(res, null, '科目删除成功')
})

/** 任务 API 支持关键词、科目和状态组合筛选。 */
apiRouter.get('/tasks', (req, res) => {
  const conditions = ['t.user_id = ?']
  const params = [req.user.id]
  if (req.query.keyword) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)')
    const keyword = `%${String(req.query.keyword)}%`
    params.push(keyword, keyword)
  }
  if (req.query.subjectId) {
    conditions.push('t.subject_id = ?')
    params.push(Number(req.query.subjectId))
  }
  if (req.query.subjectName) {
    conditions.push('s.name = ?')
    params.push(String(req.query.subjectName))
  }
  if (req.query.status) {
    conditions.push('t.status = ?')
    params.push(String(req.query.status))
  }

  const rows = db.prepare(`
    SELECT t.*, s.name AS subject_name
    FROM tasks t
    JOIN subjects s ON s.id = t.subject_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.id
  `).all(...params)
  success(res, rows.map(mapTask))
})

apiRouter.get('/tasks/:id', (req, res) => {
  success(res, mapTask(getTask(req.user.id, Number(req.params.id))))
})

apiRouter.post('/tasks', (req, res) => {
  const subject = getSubject(req.user.id, Number(req.body.subjectId))
  const result = db.prepare(`
    INSERT INTO tasks (
      user_id, subject_id, title, type, priority, status, deadline,
      estimated_minutes, actual_minutes, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    subject.id,
    requiredText(req.body.title, '任务标题'),
    requiredText(req.body.type, '任务类型'),
    requiredText(req.body.priority, '优先级'),
    requiredText(req.body.status, '任务状态'),
    String(req.body.deadline || ''),
    Math.round(numeric(req.body.estimatedMinutes)),
    Math.round(numeric(req.body.actualMinutes)),
    String(req.body.description || ''),
  )
  success(res, mapTask(getTask(req.user.id, Number(result.lastInsertRowid))), '任务添加成功', 201)
})

apiRouter.put('/tasks/:id', (req, res) => {
  const current = getTask(req.user.id, Number(req.params.id))
  const subject = getSubject(req.user.id, Number(req.body.subjectId ?? current.subject_id))
  db.prepare(`
    UPDATE tasks
    SET subject_id = ?, title = ?, type = ?, priority = ?, status = ?,
        deadline = ?, estimated_minutes = ?, actual_minutes = ?,
        description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    subject.id,
    requiredText(req.body.title ?? current.title, '任务标题'),
    requiredText(req.body.type ?? current.type, '任务类型'),
    requiredText(req.body.priority ?? current.priority, '优先级'),
    requiredText(req.body.status ?? current.status, '任务状态'),
    String(req.body.deadline ?? current.deadline),
    Math.round(numeric(req.body.estimatedMinutes, current.estimated_minutes)),
    Math.round(numeric(req.body.actualMinutes, current.actual_minutes)),
    String(req.body.description ?? current.description),
    current.id,
    req.user.id,
  )
  success(res, mapTask(getTask(req.user.id, current.id)), '任务修改成功')
})

apiRouter.patch('/tasks/:id/status', (req, res) => {
  const task = getTask(req.user.id, Number(req.params.id))
  db.prepare(`
    UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(requiredText(req.body.status, '任务状态'), task.id, req.user.id)
  success(res, mapTask(getTask(req.user.id, task.id)), '任务状态更新成功')
})

apiRouter.delete('/tasks/:id', (req, res) => {
  const task = getTask(req.user.id, Number(req.params.id))
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(task.id, req.user.id)
  success(res, null, '任务删除成功')
})

/** 错题 API 支持关键词、科目和难度筛选。 */
apiRouter.get('/mistakes', (req, res) => {
  const conditions = ['user_id = ?']
  const params = [req.user.id]
  if (req.query.keyword) {
    conditions.push('(title LIKE ? OR chapter LIKE ? OR reason LIKE ?)')
    const keyword = `%${String(req.query.keyword)}%`
    params.push(keyword, keyword, keyword)
  }
  if (req.query.subjectName) {
    conditions.push('subject_name = ?')
    params.push(String(req.query.subjectName))
  }
  if (req.query.difficulty) {
    conditions.push('difficulty = ?')
    params.push(String(req.query.difficulty))
  }

  const rows = db.prepare(`
    SELECT * FROM mistakes
    WHERE ${conditions.join(' AND ')}
    ORDER BY id
  `).all(...params)
  success(res, rows.map(mapMistake))
})

apiRouter.get('/mistakes/:id', (req, res) => {
  success(res, mapMistake(getMistake(req.user.id, Number(req.params.id))))
})

apiRouter.post('/mistakes', (req, res) => {
  const result = db.prepare(`
    INSERT INTO mistakes (
      user_id, title, subject_name, chapter, difficulty, reason, solution,
      review_count, next_review_date, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    requiredText(req.body.title, '错题标题'),
    requiredText(req.body.subjectName, '科目名称'),
    String(req.body.chapter || ''),
    requiredText(req.body.difficulty, '错题难度'),
    String(req.body.reason || ''),
    String(req.body.solution || ''),
    Math.round(numeric(req.body.reviewCount)),
    String(req.body.nextReviewDate || ''),
    JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []),
  )
  success(res, mapMistake(getMistake(req.user.id, Number(result.lastInsertRowid))), '错题添加成功', 201)
})

apiRouter.put('/mistakes/:id', (req, res) => {
  const current = getMistake(req.user.id, Number(req.params.id))
  db.prepare(`
    UPDATE mistakes
    SET title = ?, subject_name = ?, chapter = ?, difficulty = ?, reason = ?,
        solution = ?, review_count = ?, next_review_date = ?, tags_json = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    requiredText(req.body.title ?? current.title, '错题标题'),
    requiredText(req.body.subjectName ?? current.subject_name, '科目名称'),
    String(req.body.chapter ?? current.chapter),
    requiredText(req.body.difficulty ?? current.difficulty, '错题难度'),
    String(req.body.reason ?? current.reason),
    String(req.body.solution ?? current.solution),
    Math.round(numeric(req.body.reviewCount, current.review_count)),
    String(req.body.nextReviewDate ?? current.next_review_date),
    JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(current.tags_json)),
    current.id,
    req.user.id,
  )
  success(res, mapMistake(getMistake(req.user.id, current.id)), '错题修改成功')
})

apiRouter.patch('/mistakes/:id/review', (req, res) => {
  const mistake = getMistake(req.user.id, Number(req.params.id))
  db.prepare(`
    UPDATE mistakes
    SET review_count = review_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(mistake.id, req.user.id)
  success(res, mapMistake(getMistake(req.user.id, mistake.id)), '复盘次数更新成功')
})

apiRouter.delete('/mistakes/:id', (req, res) => {
  const mistake = getMistake(req.user.id, Number(req.params.id))
  db.prepare('DELETE FROM mistakes WHERE id = ? AND user_id = ?').run(mistake.id, req.user.id)
  success(res, null, '错题删除成功')
})

/** 学习计划 API 支持日期、科目与状态筛选。 */
apiRouter.get('/plans', (req, res) => {
  const conditions = ['user_id = ?']
  const params = [req.user.id]
  for (const [queryKey, columnName] of [
    ['date', 'date'],
    ['subjectName', 'subject_name'],
    ['status', 'status'],
  ]) {
    if (req.query[queryKey]) {
      conditions.push(`${columnName} = ?`)
      params.push(String(req.query[queryKey]))
    }
  }

  const rows = db.prepare(`
    SELECT * FROM plans
    WHERE ${conditions.join(' AND ')}
    ORDER BY date, time_range, id
  `).all(...params)
  success(res, rows.map(mapPlan))
})

apiRouter.get('/plans/:id', (req, res) => {
  success(res, mapPlan(getPlan(req.user.id, Number(req.params.id))))
})

apiRouter.post('/plans', (req, res) => {
  const result = db.prepare(`
    INSERT INTO plans (
      user_id, date, title, subject_name, time_range, status, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    requiredText(req.body.date, '计划日期'),
    requiredText(req.body.title, '计划标题'),
    requiredText(req.body.subjectName, '科目名称'),
    requiredText(req.body.timeRange, '时间段'),
    requiredText(req.body.status, '计划状态'),
    String(req.body.remark || ''),
  )
  success(res, mapPlan(getPlan(req.user.id, Number(result.lastInsertRowid))), '计划添加成功', 201)
})

apiRouter.put('/plans/:id', (req, res) => {
  const current = getPlan(req.user.id, Number(req.params.id))
  db.prepare(`
    UPDATE plans
    SET date = ?, title = ?, subject_name = ?, time_range = ?, status = ?,
        remark = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    requiredText(req.body.date ?? current.date, '计划日期'),
    requiredText(req.body.title ?? current.title, '计划标题'),
    requiredText(req.body.subjectName ?? current.subject_name, '科目名称'),
    requiredText(req.body.timeRange ?? current.time_range, '时间段'),
    requiredText(req.body.status ?? current.status, '计划状态'),
    String(req.body.remark ?? current.remark),
    current.id,
    req.user.id,
  )
  success(res, mapPlan(getPlan(req.user.id, current.id)), '计划修改成功')
})

apiRouter.delete('/plans/:id', (req, res) => {
  const plan = getPlan(req.user.id, Number(req.params.id))
  db.prepare('DELETE FROM plans WHERE id = ? AND user_id = ?').run(plan.id, req.user.id)
  success(res, null, '计划删除成功')
})
