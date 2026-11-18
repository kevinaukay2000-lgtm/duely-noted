// All localStorage access lives here. Every read and write is guarded so bad data can never crash the app.
export const SCHEMA_VERSION = 1

export const KEYS = {
  tasks: 'dn.tasks',
  subjects: 'dn.subjects',
  settings: 'dn.settings',
  streak: 'dn.streak',
}

export const PRIORITIES = ['low', 'medium', 'high']
export const THEMES = ['light', 'dark', 'system']

export function defaultData() {
  return {
    tasks: [],
    subjects: [
      { id: 'math', name: 'Math', color: '#2B3A9E', icon: 'calculator' },
      { id: 'science', name: 'Science', color: '#1F7A4D', icon: 'flask' },
      { id: 'english', name: 'English', color: '#B8500F', icon: 'book' },
      { id: 'history', name: 'History', color: '#7B3FBF', icon: 'landmark' },
    ],
    settings: { theme: 'system' },
    streak: { days: [] },
  }
}

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v, max) => typeof v === 'string' && v.length <= max
const isId = (v) => isText(v, 64) && v.length > 0
const isDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v))
const isDateOrNull = (v) => v === null || isDate(v)

export const isTask = (t) =>
  isObject(t) &&
  isId(t.id) &&
  isText(t.title, 80) &&
  t.title.trim() !== '' &&
  isText(t.description, 500) &&
  (t.subjectId === null || isId(t.subjectId)) &&
  PRIORITIES.includes(t.priority) &&
  isDateOrNull(t.deadline) &&
  typeof t.completed === 'boolean' &&
  isDate(t.createdAt) &&
  isDate(t.updatedAt) &&
  isDateOrNull(t.completedAt)

export const isSubject = (s) =>
  isObject(s) &&
  isId(s.id) &&
  isText(s.name, 30) &&
  s.name.trim() !== '' &&
  /^#[0-9a-f]{6}$/i.test(s.color) &&
  isText(s.icon, 32)

// Upper limits (minutes) for the focus timer's remembered lengths.
export const TIMER_LIMITS = { focusMinutes: 180, breakMinutes: 60 }
const isMinutes = (v, max) => v === undefined || (Number.isInteger(v) && v >= 1 && v <= max)
const isSettings = (s) =>
  isObject(s) &&
  THEMES.includes(s.theme) &&
  // Optional: the last focus and break lengths the user picked.
  isMinutes(s.focusMinutes, TIMER_LIMITS.focusMinutes) &&
  isMinutes(s.breakMinutes, TIMER_LIMITS.breakMinutes)
const isStreak = (s) => isObject(s) && Array.isArray(s.days) && s.days.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))

// Tasks pointing at a subject that no longer exists move to "No subject".
const linkSubjects = (tasks, subjects) =>
  tasks.map((t) => (t.subjectId === null || subjects.some((s) => s.id === t.subjectId) ? t : { ...t, subjectId: null }))

function read(key, isValid, fallback, problems) {
  let raw = null
  try {
    raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const stored = JSON.parse(raw)
    if (stored?.schemaVersion !== SCHEMA_VERSION || !isValid(stored.data)) throw new Error(`Invalid ${key}`)
    return stored.data
  } catch {
    problems.push(key)
    // Keep the damaged copy, then replace it so the warning doesn't repeat on every launch.
    try {
      if (raw !== null) localStorage.setItem(`${key}.backup`, raw)
    } catch {
      // Storage itself is unusable; the app still runs on defaults.
    }
    save(key, fallback)
    return fallback
  }
}

export function loadAll() {
  const problems = []
  const d = defaultData()
  const subjects = read(KEYS.subjects, (v) => Array.isArray(v) && v.every(isSubject), d.subjects, problems)
  const tasks = read(KEYS.tasks, (v) => Array.isArray(v) && v.every(isTask), d.tasks, problems)
  return {
    tasks: linkSubjects(tasks, subjects),
    subjects,
    settings: read(KEYS.settings, isSettings, d.settings, problems),
    streak: read(KEYS.streak, isStreak, d.streak, problems),
    problems,
  }
}

export function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }))
    return true
  } catch {
    return false
  }
}

