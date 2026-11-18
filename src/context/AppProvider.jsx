import { SystemBars, SystemBarsStyle } from '@capacitor/core'
import { useEffect, useLayoutEffect, useState } from 'react'
import { KEYS, loadAll, save } from '../storage/storage'
import { dayKey, uid } from '../utils/tasks'
import { AppContext } from './AppContext'

export default function AppProvider({ children }) {
  const [initial] = useState(loadAll)
  const [tasks, setTasks] = useState(initial.tasks)
  const [subjects, setSubjects] = useState(initial.subjects)
  const [settings, setSettings] = useState(initial.settings)
  const [streak, setStreak] = useState(initial.streak)
  const [toast, setToast] = useState(
    initial.problems.length ? { id: 0, message: 'Some saved data was damaged and has been reset. A backup copy was kept.' } : null,
  )
  const [celebration, setCelebration] = useState(0)
  const [now, setNow] = useState(Date.now)

  // Refresh "now" every minute and when the app returns to the foreground, so overdue labels stay correct.
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const timer = setInterval(tick, 60000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Layout effect so a forced theme is applied before the first paint (no flash).
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    // Keep Android status-bar icons readable when the app theme differs from the phone's.
    const style = { light: SystemBarsStyle.Light, dark: SystemBarsStyle.Dark }[settings.theme] ?? SystemBarsStyle.Default
    SystemBars.setStyle({ style }).catch(() => {})
  }, [settings.theme])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!celebration) return
    const timer = setTimeout(() => setCelebration(0), 1600)
    return () => clearTimeout(timer)
  }, [celebration])

  const showToast = (message, undo = null) => setToast({ id: Date.now(), message, undo })

  // Writes happen inside event handlers (not effects) so a failed save can be reported straight away.
  const persist = (key, setter, next) => {
    setter(next)
    if (!save(key, next)) showToast("Couldn't save. Your device storage may be full.")
  }
  const commitTasks = (next) => persist(KEYS.tasks, setTasks, next)
  const commitSubjects = (next) => persist(KEYS.subjects, setSubjects, next)

  const value = {
    tasks,
    subjects,
    settings,
    streak,
    now,
    toast,
    celebration,
    showToast,

    addTask(fields) {
      const stamp = new Date().toISOString()
      commitTasks([...tasks, { id: uid(), ...fields, completed: false, createdAt: stamp, updatedAt: stamp, completedAt: null }])
    },

    updateTask(id, fields) {
      const stamp = new Date().toISOString()
      commitTasks(tasks.map((t) => (t.id === id ? { ...t, ...fields, updatedAt: stamp } : t)))
    },

    toggleTask(id) {
      const stamp = new Date().toISOString()
      const completed = !tasks.find((t) => t.id === id)?.completed
      commitTasks(tasks.map((t) => (t.id === id ? { ...t, completed, completedAt: completed ? stamp : null, updatedAt: stamp } : t)))
      if (!completed) return
      const today = dayKey(Date.now())
      if (!streak.days.includes(today)) persist(KEYS.streak, setStreak, { days: [...streak.days, today].slice(-400) })
      setCelebration(Date.now())
    },

    deleteTask(id) {
      const task = tasks.find((t) => t.id === id)
      if (!task) return
      commitTasks(tasks.filter((t) => t.id !== id))
      showToast(`Deleted "${task.title}"`, { task })
    },

    addSubject(fields) {
      commitSubjects([...subjects, { id: uid(), ...fields }])
    },

    updateSubject(id, fields) {
      commitSubjects(subjects.map((s) => (s.id === id ? { ...s, ...fields } : s)))
    },

    deleteSubject(id) {
      const subject = subjects.find((s) => s.id === id)
      if (!subject) return
      const taskIds = tasks.filter((t) => t.subjectId === id).map((t) => t.id)
      commitSubjects(subjects.filter((s) => s.id !== id))
      if (taskIds.length) commitTasks(tasks.map((t) => (t.subjectId === id ? { ...t, subjectId: null } : t)))
      showToast(`Deleted "${subject.name}"`, { subject, taskIds })
    },

    // Uses the current state (not a snapshot from when the toast appeared), so edits made meanwhile survive.
    undo() {
      const { task, subject, taskIds } = toast?.undo ?? {}
      if (task && !tasks.some((t) => t.id === task.id)) commitTasks([...tasks, task])
      if (subject && !subjects.some((s) => s.id === subject.id)) {
        commitSubjects([...subjects, subject])
        if (taskIds.length) {
          commitTasks(tasks.map((t) => (taskIds.includes(t.id) && t.subjectId === null ? { ...t, subjectId: subject.id } : t)))
        }
      }
      setToast(null)
    },

    dismissToast() {
      setToast(null)
    },

    setTheme(theme) {
      persist(KEYS.settings, setSettings, { ...settings, theme })
    },

    updateSettings(patch) {
      persist(KEYS.settings, setSettings, { ...settings, ...patch })
    },

    replaceAll(data) {
      commitTasks(data.tasks)
      commitSubjects(data.subjects)
      persist(KEYS.settings, setSettings, data.settings)
      persist(KEYS.streak, setStreak, data.streak)
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
