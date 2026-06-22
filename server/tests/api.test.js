import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const databasePath = path.join(testDir, '..', 'data', `yantu-test-${Date.now()}.db`)
process.env.DATABASE_PATH = databasePath
process.env.JWT_SECRET = 'test-secret-only'

let server
let baseUrl
let db

before(async () => {
  const [{ createApp }, databaseModule] = await Promise.all([
    import('../app.js'),
    import('../db.js'),
  ])
  db = databaseModule.db
  server = createApp().listen(0)
  await new Promise(resolve => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api`
})

after(async () => {
  await new Promise(resolve => server.close(resolve))
  db.close()
  for (const suffix of ['', '-shm', '-wal']) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true })
  }
})

/** 测试辅助函数：发送 JSON 请求并解析统一响应结构。 */
async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json()
  return { response, body }
}

function auth(token) {
  return { Authorization: `Bearer ${token}` }
}

test('全栈 API 支持认证、多用户隔离、筛选和完整 CRUD', async () => {
  const health = await request('/health')
  assert.equal(health.response.status, 200)
  assert.equal(health.body.data.database, 'sqlite')

  const unauthorized = await request('/subjects')
  assert.equal(unauthorized.response.status, 401)

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: '123456' }),
  })
  assert.equal(login.response.status, 200)
  const adminToken = login.body.data.token
  assert.ok(adminToken)

  const initialSubjects = await request('/subjects', { headers: auth(adminToken) })
  const initialTasks = await request('/tasks', { headers: auth(adminToken) })
  const initialMistakes = await request('/mistakes', { headers: auth(adminToken) })
  const initialPlans = await request('/plans', { headers: auth(adminToken) })
  assert.equal(initialSubjects.body.data.length, 7)
  assert.equal(initialTasks.body.data.length, 15)
  assert.equal(initialMistakes.body.data.length, 10)
  assert.equal(initialPlans.body.data.length, 10)

  const filteredTasks = await request('/tasks?status=已完成&subjectName=数据结构', {
    headers: auth(adminToken),
  })
  assert.equal(filteredTasks.response.status, 200)
  assert.ok(filteredTasks.body.data.every(item =>
    item.status === '已完成' && item.subjectName === '数据结构',
  ))

  const createSubject = await request('/subjects', {
    method: 'POST',
    headers: auth(adminToken),
    body: JSON.stringify({
      name: '复试准备',
      category: '拓展',
      targetHours: 40,
      finishedHours: 5,
      color: '#2080f0',
      description: 'API 自动化测试科目',
    }),
  })
  assert.equal(createSubject.response.status, 201)
  const subjectId = createSubject.body.data.id
  assert.equal(createSubject.body.data.progress, 13)

  const updateSubject = await request(`/subjects/${subjectId}`, {
    method: 'PUT',
    headers: auth(adminToken),
    body: JSON.stringify({ finishedHours: 10 }),
  })
  assert.equal(updateSubject.body.data.progress, 25)

  const createTask = await request('/tasks', {
    method: 'POST',
    headers: auth(adminToken),
    body: JSON.stringify({
      title: '准备复试自我介绍',
      subjectId,
      type: '背诵',
      priority: '高',
      status: '未开始',
      deadline: '2026-08-01',
      estimatedMinutes: 60,
      actualMinutes: 0,
      description: '验证任务新增与外键关联',
    }),
  })
  assert.equal(createTask.response.status, 201)
  const taskId = createTask.body.data.id
  assert.equal(createTask.body.data.subjectName, '复试准备')

  const updateTaskStatus = await request(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: auth(adminToken),
    body: JSON.stringify({ status: '已完成' }),
  })
  assert.equal(updateTaskStatus.body.data.status, '已完成')

  const createMistake = await request('/mistakes', {
    method: 'POST',
    headers: auth(adminToken),
    body: JSON.stringify({
      title: '测试错题',
      subjectName: '复试准备',
      chapter: '综合能力',
      difficulty: '简单',
      reason: '表达不够完整',
      solution: '按结构重新组织答案',
      reviewCount: 0,
      nextReviewDate: '2026-06-12',
      tags: ['API', '测试'],
    }),
  })
  assert.equal(createMistake.response.status, 201)
  const mistakeId = createMistake.body.data.id

  const reviewMistake = await request(`/mistakes/${mistakeId}/review`, {
    method: 'PATCH',
    headers: auth(adminToken),
  })
  assert.equal(reviewMistake.body.data.reviewCount, 1)
  assert.deepEqual(reviewMistake.body.data.tags, ['API', '测试'])

  const createPlan = await request('/plans', {
    method: 'POST',
    headers: auth(adminToken),
    body: JSON.stringify({
      date: '2026-06-12',
      title: '复试模拟',
      subjectName: '复试准备',
      timeRange: '19:00-20:00',
      status: '未开始',
      remark: '验证计划新增',
    }),
  })
  assert.equal(createPlan.response.status, 201)
  const planId = createPlan.body.data.id

  const updatePlan = await request(`/plans/${planId}`, {
    method: 'PUT',
    headers: auth(adminToken),
    body: JSON.stringify({ status: '已完成' }),
  })
  assert.equal(updatePlan.body.data.status, '已完成')

  const updateProfile = await request('/profile', {
    method: 'PUT',
    headers: auth(adminToken),
    body: JSON.stringify({ targetSchool: '目标院校测试' }),
  })
  assert.equal(updateProfile.body.data.targetSchool, '目标院校测试')

  const username = `u${String(Date.now()).slice(-10)}`
  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password: 'abcdef',
      name: '测试用户',
    }),
  })
  assert.equal(register.response.status, 201)
  const studentToken = register.body.data.token

  const studentSubjects = await request('/subjects', { headers: auth(studentToken) })
  assert.equal(studentSubjects.body.data.length, 7)
  assert.ok(!studentSubjects.body.data.some(item => item.name === '复试准备'))

  await request(`/mistakes/${mistakeId}`, {
    method: 'DELETE',
    headers: auth(adminToken),
  })
  await request(`/plans/${planId}`, {
    method: 'DELETE',
    headers: auth(adminToken),
  })
  await request(`/tasks/${taskId}`, {
    method: 'DELETE',
    headers: auth(adminToken),
  })
  await request(`/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: auth(adminToken),
  })

  const finalSubjects = await request('/subjects', { headers: auth(adminToken) })
  assert.equal(finalSubjects.body.data.length, 7)
})
