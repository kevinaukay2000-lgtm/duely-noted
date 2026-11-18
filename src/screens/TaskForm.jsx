import { ArrowLeft, Clock, Flag, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PRIORITY_LABELS, toLocalInput } from '../utils/tasks'

export default function TaskForm() {
  const { id } = useParams()
  const { tasks, subjects, now, addTask, updateTask } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const task = id ? tasks.find((t) => t.id === id) : null
  const [form, setForm] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    subjectId: task?.subjectId ?? '',
    priority: task?.priority ?? 'medium',
    deadline: task?.deadline ? toLocalInput(task.deadline) : '',
  }))
  const [error, setError] = useState('')

  // Opened directly (no history to go back to): fall back to the task list.
  const goBack = () => (location.key === 'default' ? navigate('/tasks', { replace: true }) : navigate(-1))
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const deadlineInPast = form.deadline !== '' && Date.parse(form.deadline) < now

  if (id && !task) {
    return (
      <EmptyState
        mood="worried"
        title="Task not found"
        text="It may have been deleted."
        action={
          <Link to="/tasks" className="btn btn-primary">
            Back to tasks
          </Link>
        }
      />
    )
  }

  const submit = (e) => {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setError('Please give your task a title.')
      return
    }
    const fields = {
      title: title.slice(0, 80),
      description: form.description.trim().slice(0, 500),
      subjectId: subjects.some((s) => s.id === form.subjectId) ? form.subjectId : null,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    }
    if (task) updateTask(task.id, fields)
    else addTask(fields)
    goBack()
  }

  return (
    <form className="task-form" onSubmit={submit} noValidate>
      <div className="screen-head">
        <button type="button" className="icon-btn" onClick={goBack} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1>{task ? 'Edit task' : 'New task'}</h1>
      </div>

      <div className="field">
        <div className="field-label">
          <label htmlFor="task-title">Title</label>
          <span className="counter">{form.title.length}/80</span>
        </div>
        <input
          id="task-title"
          value={form.title}
          onChange={(e) => {
            set('title')(e)
            setError('')
          }}
          maxLength={80}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'title-error' : undefined}
          placeholder="e.g. Finish chapter 4 questions"
        />
        {error && (
          <span id="title-error" className="error" role="alert">
            {error}
          </span>
        )}
      </div>

      <div className="field">
        <div className="field-label">
          <label htmlFor="task-description">Description</label>
          <span className="counter">{form.description.length}/500</span>
        </div>
        <textarea
          id="task-description"
          value={form.description}
          onChange={set('description')}
          maxLength={500}
          rows={4}
          placeholder="Notes, page numbers, links…"
        />
      </div>

      <label className="field">
        <span className="field-label">Subject</span>
        <select value={form.subjectId} onChange={set('subjectId')}>
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="field">
        <legend className="field-label">Priority</legend>
        <div className="choices choices--3">
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                className="sr-only"
                name="priority"
                value={value}
                checked={form.priority === value}
                onChange={set('priority')}
              />
              <span className={`choice priority--${value}`}>
                <Flag size={18} /> {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="task-deadline">
          <Clock size={16} /> Deadline
        </label>
        <input id="task-deadline" type="datetime-local" value={form.deadline} onChange={set('deadline')} />
        {deadlineInPast && (
          <span className="warn" role="status">
            <TriangleAlert size={16} /> This deadline is in the past. You can still save it.
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={goBack}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {task ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
