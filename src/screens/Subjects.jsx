import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import SubjectIcon from '../components/SubjectIcon'
import { useApp } from '../context/AppContext'
import { SUBJECT_COLORS, SUBJECT_ICONS } from '../utils/subjects'
import { plural } from '../utils/tasks'

const BLANK = { name: '', color: SUBJECT_COLORS[0].value, icon: 'book' }

export default function Subjects() {
  const { subjects, tasks, addSubject, updateSubject, deleteSubject } = useApp()
  // null = form closed, 'new' = adding, otherwise the id being edited.
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')

  const open = (subject) => {
    setEditing(subject ? subject.id : 'new')
    setForm(subject ? { name: subject.name, color: subject.color, icon: subject.icon } : BLANK)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const close = () => setEditing(null)

  const submit = (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Please enter a subject name.')
      return
    }
    if (subjects.some((s) => s.id !== editing && s.name.toLowerCase() === name.toLowerCase())) {
      setError(`You already have a subject called "${name}".`)
      return
    }
    if (editing === 'new') addSubject({ ...form, name })
    else updateSubject(editing, { ...form, name })
    close()
  }

  const remove = (id) => {
    if (editing === id) close()
    deleteSubject(id)
  }

  return (
    <>
      <div className="screen-head">
        <h1>Subjects</h1>
        {editing === null && subjects.length > 0 && (
          <button type="button" className="btn btn-primary btn-small" onClick={() => open(null)}>
            <Plus size={20} /> Add
          </button>
        )}
      </div>

      {editing !== null && (
        <form className="card subject-form" onSubmit={submit} noValidate>
          <h2>{editing === 'new' ? 'New subject' : 'Edit subject'}</h2>
          <div className="field">
            <label className="field-label" htmlFor="subject-name">
              Name
            </label>
            <input
              id="subject-name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
                setError('')
              }}
              maxLength={30}
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'subject-error' : undefined}
              placeholder="e.g. Geography"
            />
            {error && (
              <span id="subject-error" className="error" role="alert">
                {error}
              </span>
            )}
          </div>

          <fieldset className="field">
            <legend className="field-label">Color</legend>
            <div className="choices choices--wrap">
              {SUBJECT_COLORS.map((c) => (
                <label key={c.value}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="color"
                    value={c.value}
                    checked={form.color === c.value}
                    onChange={() => setForm({ ...form, color: c.value })}
                    aria-label={c.name}
                  />
                  <span className="swatch" style={{ background: c.value }} />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field-label">Icon</legend>
            <div className="choices choices--wrap">
              {Object.entries(SUBJECT_ICONS).map(([key, { label }]) => (
                <label key={key}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="icon"
                    value={key}
                    checked={form.icon === key}
                    onChange={() => setForm({ ...form, icon: key })}
                    aria-label={label}
                  />
                  <span className="icon-choice" style={{ '--subject': form.color }}>
                    <SubjectIcon icon={key} size={22} />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing === 'new' ? 'Add subject' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {subjects.length ? (
        <ul className="subject-list">
          {subjects.map((s) => (
            <li key={s.id} className="card subject-row" style={{ '--subject': s.color }}>
              <span className="subject-badge">
                <SubjectIcon icon={s.icon} size={22} />
              </span>
              <span className="subject-name">
                {s.name}
                <small className="muted">{plural(tasks.filter((t) => t.subjectId === s.id).length, 'task')}</small>
              </span>
              <button type="button" className="icon-btn" onClick={() => open(s)} aria-label={`Edit ${s.name}`}>
                <Pencil size={20} />
              </button>
              <button type="button" className="icon-btn" onClick={() => remove(s.id)} aria-label={`Delete ${s.name}`}>
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        editing === null && (
          <EmptyState
            title="No subjects yet"
            text="Subjects help you group homework by class."
            action={
              <button type="button" className="btn btn-primary" onClick={() => open(null)}>
                Add a subject
              </button>
            }
          />
        )
      )}
    </>
  )
}
