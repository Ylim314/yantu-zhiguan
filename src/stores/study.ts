import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Mistake, Plan, Subject, Task, TaskStatus } from '@/types'
import {
  createMistakeApi,
  createPlanApi,
  createSubjectApi,
  createTaskApi,
  deleteMistakeApi,
  deletePlanApi,
  deleteSubjectApi,
  deleteTaskApi,
  getMistakesApi,
  getPlansApi,
  getSubjectsApi,
  getTasksApi,
  incrementMistakeReviewApi,
  updateMistakeApi,
  updatePlanApi,
  updateSubjectApi,
  updateTaskApi,
  updateTaskStatusApi,
} from '@/api/study'

export const useStudyStore = defineStore('study', () => {
  // 学习数据初始为空，登录后通过后端 API 一次性加载。
  const subjectsList = ref<Subject[]>([])
  const tasksList = ref<Task[]>([])
  const mistakesList = ref<Mistake[]>([])
  const plansList = ref<Plan[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  const subjects408 = computed(() => {
    return subjectsList.value.filter(subject => subject.category === '408')
  })

  const totalStudyHours = computed(() => {
    return subjectsList.value.reduce((sum, subject) => sum + subject.finishedHours, 0)
  })

  const totalTargetHours = computed(() => {
    return subjectsList.value.reduce((sum, subject) => sum + subject.targetHours, 0)
  })

  const overallProgress = computed(() => {
    if (totalTargetHours.value <= 0) return 0
    return Math.round(totalStudyHours.value / totalTargetHours.value * 100)
  })

  const todayTasks = computed(() => {
    return tasksList.value
      .filter(task => task.status === '进行中' || task.status === '未开始')
      .slice(0, 5)
  })

  const completedTaskCount = computed(() => {
    return tasksList.value.filter(task => task.status === '已完成').length
  })

  const totalTaskCount = computed(() => tasksList.value.length)

  const taskCompletionRate = computed(() => {
    if (totalTaskCount.value <= 0) return 0
    return Math.round(completedTaskCount.value / totalTaskCount.value * 100)
  })

  const recentMistakes = computed(() => {
    return [...mistakesList.value]
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime())
      .slice(0, 5)
  })

  /** 并行加载四类业务数据，减少登录后的等待时间。 */
  async function fetchAll(force = false) {
    if ((initialized.value && !force) || loading.value) return
    loading.value = true
    try {
      const [subjects, tasks, mistakes, plans] = await Promise.all([
        getSubjectsApi(),
        getTasksApi(),
        getMistakesApi(),
        getPlansApi(),
      ])
      subjectsList.value = subjects
      tasksList.value = tasks
      mistakesList.value = mistakes
      plansList.value = plans
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  function clearStudyData() {
    subjectsList.value = []
    tasksList.value = []
    mistakesList.value = []
    plansList.value = []
    initialized.value = false
  }

  async function addSubject(subject: Subject) {
    const created = await createSubjectApi(subject)
    subjectsList.value.push(created)
    return created
  }

  async function updateSubject(id: number, data: Partial<Subject>) {
    const updated = await updateSubjectApi(id, data)
    const index = subjectsList.value.findIndex(subject => subject.id === id)
    if (index !== -1) subjectsList.value[index] = updated
    // 科目名称变更后，任务接口返回的 subjectName 也需要同步刷新。
    tasksList.value = tasksList.value.map(task =>
      task.subjectId === id ? { ...task, subjectName: updated.name } : task,
    )
    return updated
  }

  async function deleteSubject(id: number) {
    await deleteSubjectApi(id)
    subjectsList.value = subjectsList.value.filter(subject => subject.id !== id)
    tasksList.value = tasksList.value.filter(task => task.subjectId !== id)
  }

  async function addTask(task: Task) {
    const created = await createTaskApi(task)
    tasksList.value.push(created)
    return created
  }

  async function updateTask(id: number, data: Partial<Task>) {
    const updated = await updateTaskApi(id, data)
    const index = tasksList.value.findIndex(task => task.id === id)
    if (index !== -1) tasksList.value[index] = updated
    return updated
  }

  async function deleteTask(id: number) {
    await deleteTaskApi(id)
    tasksList.value = tasksList.value.filter(task => task.id !== id)
  }

  async function updateTaskStatus(id: number, status: TaskStatus) {
    const updated = await updateTaskStatusApi(id, status)
    const index = tasksList.value.findIndex(task => task.id === id)
    if (index !== -1) tasksList.value[index] = updated
    return updated
  }

  async function addMistake(mistake: Mistake) {
    const created = await createMistakeApi(mistake)
    mistakesList.value.push(created)
    return created
  }

  async function updateMistake(id: number, data: Partial<Mistake>) {
    const updated = await updateMistakeApi(id, data)
    const index = mistakesList.value.findIndex(mistake => mistake.id === id)
    if (index !== -1) mistakesList.value[index] = updated
    return updated
  }

  async function deleteMistake(id: number) {
    await deleteMistakeApi(id)
    mistakesList.value = mistakesList.value.filter(mistake => mistake.id !== id)
  }

  async function incrementReviewCount(id: number) {
    const updated = await incrementMistakeReviewApi(id)
    const index = mistakesList.value.findIndex(mistake => mistake.id === id)
    if (index !== -1) mistakesList.value[index] = updated
    return updated
  }

  async function addPlan(plan: Plan) {
    const created = await createPlanApi(plan)
    plansList.value.push(created)
    return created
  }

  async function updatePlan(id: number, data: Partial<Plan>) {
    const updated = await updatePlanApi(id, data)
    const index = plansList.value.findIndex(plan => plan.id === id)
    if (index !== -1) plansList.value[index] = updated
    return updated
  }

  async function deletePlan(id: number) {
    await deletePlanApi(id)
    plansList.value = plansList.value.filter(plan => plan.id !== id)
  }

  function getTaskById(id: number) {
    return tasksList.value.find(task => task.id === id)
  }

  function getMistakeById(id: number) {
    return mistakesList.value.find(mistake => mistake.id === id)
  }

  function getTasksBySubject(subjectName: string) {
    return tasksList.value.filter(task => task.subjectName === subjectName)
  }

  function getMistakesBySubject(subjectName: string) {
    return mistakesList.value.filter(mistake => mistake.subjectName === subjectName)
  }

  return {
    subjectsList,
    tasksList,
    mistakesList,
    plansList,
    loading,
    initialized,
    subjects408,
    totalStudyHours,
    totalTargetHours,
    overallProgress,
    todayTasks,
    completedTaskCount,
    totalTaskCount,
    taskCompletionRate,
    recentMistakes,
    fetchAll,
    clearStudyData,
    addSubject,
    updateSubject,
    deleteSubject,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addMistake,
    updateMistake,
    deleteMistake,
    incrementReviewCount,
    addPlan,
    updatePlan,
    deletePlan,
    getTaskById,
    getMistakeById,
    getTasksBySubject,
    getMistakesBySubject,
  }
})
