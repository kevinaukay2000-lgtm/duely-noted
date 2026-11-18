// Date and task helpers. `now` is always passed in (ms) so rendering stays pure.
const DAY = 86400000
const NO_DEADLINE = Number.MAX_SAFE_INTEGER

export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' }
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

export const uid = () => crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export function startOfDay(ms, addDays = 0) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + addDays)
  return d.getTime()
}

export function dayKey(ms) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const due = (t) => (t.deadline ? Date.parse(t.deadline) : NO_DEADLINE)

export const isOverdue = (t, now) => !t.completed && due(t) < now

// Not completed and due from now until the end of the 7th day (today included).
export const isUpcoming = (t, now) => !t.completed && due(t) >= now && due(t) < startOfDay(now, 7)

export const isDueToday = (t, now) => due(t) >= startOfDay(now) && due(t) < startOfDay(now, 1)

export const SORTS = {
  deadline: (a, b) => due(a) - due(b),
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || due(a) - due(b),
  created: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
}

export function formatDeadline(iso, now) {
  if (!iso) return 'No deadline'
  const ms = Date.parse(iso)
  const time = new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const days = Math.round((startOfDay(ms) - startOfDay(now)) / DAY)
  if (days === 0) return `Today, ${time}`
  if (days === 1) return `Tomorrow, ${time}`
  if (days === -1) return `Yesterday, ${time}`
  return new Date(ms).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ISO string -> value for <input type="datetime-local"> (local time, minutes precision).
export function toLocalInput(iso) {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

// Longest run of consecutive days with a completion, ever.
export function bestStreak(days) {
  let best = 0
  let run = 0
  let prev = null
  for (const day of [...new Set(days)].sort()) {
    run = prev !== null && dayKey(startOfDay(Date.parse(`${prev}T00:00`), 1)) === day ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return best
}

// Days in a row with a completion. Today counts once done; until then the streak runs to yesterday.
export function currentStreak(days, now) {
  const done = new Set(days)
  let day = done.has(dayKey(now)) ? now : startOfDay(now, -1)
  let count = 0
  while (done.has(dayKey(day))) {
    count++
    day = startOfDay(day, -1)
  }
  return count
}
