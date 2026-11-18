import { Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import Fab from '../components/Fab'
import TaskCard from '../components/TaskCard'
import { useApp } from '../context/AppContext'
import { PRIORITY_LABELS, SORTS, isOverdue, isUpcoming, plural } from '../utils/tasks'

const STATUS_TESTS = {
  pending: (t) => !t.completed,
  completed: (t) => t.completed,
  upcoming: isUpcoming,
  overdue: isOverdue,
}

export default function Tasks() {
  const { tasks, subjects, now } = useApp()
  // Filters live in the URL so they survive opening a task and pressing Back.
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? 'all'
  const subject = params.get('subject') ?? 'all'
  const priority = params.get('priority') ?? 'all'
  const sort = params.get('sort') ?? 'deadline'

  const setParam = (key) => (e) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(key, e.target.value)
        return next
      },
      { replace: true },
    )

  const needle = q.trim().toLowerCase()
  const statusTest = STATUS_TESTS[status]
  const sorter = SORTS[sort] ?? SORTS.deadline
  const visible = tasks
    .filter(
      (t) =>
        t.title.toLowerCase().includes(needle) &&
        (!statusTest || statusTest(t, now)) &&
        (subject === 'all' || t.subjectId === (subject === 'none' ? null : subject)) &&
        (priority === 'all' || t.priority === priority),
    )
    .sort((a, b) => a.completed - b.completed || sorter(a, b))

  return (
    <>
      <h1>My Tasks</h1>

      {!tasks.length ? (
        <EmptyState
          title="No tasks yet"
          text="Pip is snoozing until there's homework to track."
          action={
            <Link to="/tasks/new" className="btn btn-primary">
              Add a task
            </Link>
          }
        />
      ) : (
        <>
          <label className="search">
            <Search size={20} />
            <span className="sr-only">Search tasks by title</span>
            <input type="search" value={q} onChange={setParam('q')} placeholder="Search by title" />
          </label>

          <div className="filters">
            <label>
              Status
              <select value={status} onChange={setParam('status')}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>
            <label>
              Subject
              <select value={subject} onChange={setParam('subject')}>
                <option value="all">All</option>
                <option value="none">No subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select value={priority} onChange={setParam('priority')}>
                <option value="all">All</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select value={sort} onChange={setParam('sort')}>
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
                <option value="created">Date created</option>
              </select>
            </label>
          </div>

          <p className="muted" aria-live="polite">
            Showing {plural(visible.length, 'task')}
          </p>

          {visible.length ? (
            <ul className="task-list">
              {visible.map((t) => (
                <li key={t.id}>
                  <TaskCard task={t} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              mood="worried"
              title="Nothing matches"
              text="Try a different search or filter."
              action={
                <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </button>
              }
            />
          )}
        </>
      )}

      <Fab />
    </>
  )
}
