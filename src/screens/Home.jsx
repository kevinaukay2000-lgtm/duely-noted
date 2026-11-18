import { CalendarClock, CircleCheck, Flame, Hourglass, ListTodo, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import Fab from '../components/Fab'
import Pip from '../components/Pip'
import SubjectIcon from '../components/SubjectIcon'
import TaskCard from '../components/TaskCard'
import { useApp } from '../context/AppContext'
import {
  SORTS,
  bestStreak,
  currentStreak,
  dayKey,
  isDueToday,
  isOverdue,
  isUpcoming,
  plural,
  startOfDay,
} from '../utils/tasks'

export default function Home() {
  const { tasks, subjects, streak, now } = useApp()
  const pending = tasks.filter((t) => !t.completed)
  const overdue = pending.filter((t) => isOverdue(t, now)).length
  const upcoming = pending.filter((t) => isUpcoming(t, now)).length
  const dueToday = tasks.filter((t) => isDueToday(t, now))
  const doneToday = dueToday.filter((t) => t.completed).length
  const upNext = pending.filter((t) => t.deadline).sort(SORTS.deadline).slice(0, 5)
  const streakDays = currentStreak(streak.days, now)
  const streakSafe = streak.days.includes(dayKey(now))

  // Last 7 days (today included): completions per day and per subject.
  const doneThisWeek = tasks.filter((t) => t.completedAt && Date.parse(t.completedAt) >= startOfDay(now, -6))
  const week = [-6, -5, -4, -3, -2, -1, 0].map((offset) => {
    const start = startOfDay(now, offset)
    const end = startOfDay(now, offset + 1)
    return {
      start,
      label: offset === 0 ? 'Today' : new Date(start).toLocaleDateString([], { weekday: 'short' }),
      count: doneThisWeek.filter((t) => Date.parse(t.completedAt) >= start && Date.parse(t.completedAt) < end).length,
    }
  })
  const maxDay = Math.max(1, ...week.map((d) => d.count))
  const bySubject = [...subjects, { id: null, name: 'No subject', color: 'var(--no-subject)', icon: null }]
    .map((s) => ({ ...s, count: doneThisWeek.filter((t) => t.subjectId === s.id).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
  const maxSubject = Math.max(1, ...bySubject.map((s) => s.count))

  const hour = new Date(now).getHours()
  const greeting = `Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}!`
  const [mood, message] = !tasks.length
    ? ['sleepy', 'No tasks yet, so Pip is taking a nap. Add your first one!']
    : overdue
      ? ['worried', `${plural(overdue, 'task')} overdue. Let's catch up together!`]
      : !pending.length
        ? ['happy', 'All done! Pip is proud of you.']
        : ['happy', `${plural(pending.length, 'task')} to go. You've got this!`]

  const counts = [
    ['Total', tasks.length, <ListTodo key="i" size={20} />],
    ['Pending', pending.length, <Hourglass key="i" size={20} />],
    ['Completed', tasks.length - pending.length, <CircleCheck key="i" size={20} />],
    ['Upcoming', upcoming, <CalendarClock key="i" size={20} />],
    ['Overdue', overdue, <TriangleAlert key="i" size={20} />],
  ]

  return (
    <>
      <section className="card hero">
        <Pip mood={mood} size={104} />
        <div>
          <h1>{greeting}</h1>
          <p>{message}</p>
          {!tasks.length && (
            <Link to="/tasks/new" className="btn btn-primary">
              Add your first task
            </Link>
          )}
        </div>
      </section>

      {tasks.length > 0 && (
        <>
          <section className="stats" aria-label="Task counts">
            {counts.map(([label, value, icon]) => (
              <div key={label} className={`stat stat--${label.toLowerCase()}${label === 'Overdue' && value ? ' is-alert' : ''}`}>
                {icon}
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </section>

          <div className="home-columns">
            <div className="home-side">
              <section className="card">
                <h2>Today's progress</h2>
                {dueToday.length ? (
                  <>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Tasks due today that are done"
                      aria-valuemin={0}
                      aria-valuemax={dueToday.length}
                      aria-valuenow={doneToday}
                    >
                      <span style={{ width: `${(doneToday / dueToday.length) * 100}%` }} />
                    </div>
                    <p className="muted">
                      {doneToday} of {plural(dueToday.length, 'task')} due today done
                    </p>
                  </>
                ) : (
                  <p className="muted">Nothing due today.</p>
                )}
              </section>

              <section className="card streak">
                <Flame size={32} className="streak-flame" />
                <div>
                  <h2>{streakDays}-day streak</h2>
                  <p className="muted">
                    {streakSafe ? 'You completed a task today. Nice!' : 'Complete a task today to keep it going.'}
                  </p>
                  <p className="muted small">Best streak: {plural(bestStreak(streak.days), 'day')}</p>
                </div>
              </section>
            </div>

            <section className="up-next">
              <div className="section-head">
                <h2>Up next</h2>
                <Link to="/tasks" className="link-btn">
                  See all
                </Link>
              </div>
              {upNext.length ? (
                <ul className="task-list">
                  {upNext.map((t) => (
                    <li key={t.id}>
                      <TaskCard task={t} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="card muted">No deadlines coming up. Enjoy the free time!</p>
              )}
            </section>

            <section className="card week">
              <h2>Last 7 days</h2>
              <p className="muted">{plural(doneThisWeek.length, 'task')} completed</p>
              <ol className="day-bars" aria-label="Tasks completed per day">
                {week.map((d) => (
                  <li key={d.start} className={d.label === 'Today' ? 'is-today' : undefined}>
                    <span className="sr-only">{`${d.label}: ${plural(d.count, 'task')}`}</span>
                    <span className="day-track" aria-hidden="true">
                      <span className="day-count">{d.count}</span>
                      <span className="day-bar" style={{ height: `${(d.count / maxDay) * 64}px` }} />
                    </span>
                    <span className="day-label" aria-hidden="true">
                      {d.label}
                    </span>
                  </li>
                ))}
              </ol>

              <h3>By subject</h3>
              {bySubject.length ? (
                <ul className="subject-bars">
                  {bySubject.map((s) => (
                    <li key={s.id ?? 'none'} style={{ '--subject': s.color }}>
                      <span className="subject-badge">
                        <SubjectIcon icon={s.icon} size={16} />
                      </span>
                      <span className="subject-bar-name">{s.name}</span>
                      <span className="subject-bar-track" aria-hidden="true">
                        <span style={{ width: `${(s.count / maxSubject) * 100}%` }} />
                      </span>
                      <span className="subject-bar-count">{s.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Finish a task and your subjects will show up here.</p>
              )}
            </section>
          </div>
        </>
      )}

      <Fab />
    </>
  )
}
