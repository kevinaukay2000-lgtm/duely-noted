import { Check, Clock, Flag, Timer, Trash2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PRIORITY_LABELS, formatDeadline, isOverdue } from '../utils/tasks'
import SubjectIcon from './SubjectIcon'

export default function TaskCard({ task }) {
  const { subjects, now, toggleTask, deleteTask } = useApp()
  const subject = subjects.find((s) => s.id === task.subjectId)
  const overdue = isOverdue(task, now)

  return (
    <article
      className={`task-card${task.completed ? ' is-done' : ''}${overdue ? ' is-overdue' : ''}`}
      style={{ '--subject': subject?.color ?? 'var(--no-subject)' }}
    >
      <label className="check">
        <input
          type="checkbox"
          className="sr-only"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          aria-label={`Done: ${task.title}`}
        />
        <span className="check-box">
          <Check size={20} strokeWidth={3} />
        </span>
      </label>

      <Link to={`/tasks/${task.id}`} className="task-main">
        <span className="subject-badge">
          <SubjectIcon icon={subject?.icon} size={18} />
        </span>
        <span className="task-text">
          <span className="task-title">{task.title}</span>
          <span className="task-meta">
            <span>{subject?.name ?? 'No subject'}</span>
            <span>
              <Clock size={14} /> {formatDeadline(task.deadline, now)}
            </span>
            <span className={`priority priority--${task.priority}`}>
              <Flag size={14} /> {PRIORITY_LABELS[task.priority]}
              <span className="sr-only"> priority</span>
            </span>
            {overdue && (
              <span className="overdue-tag">
                <TriangleAlert size={14} /> Overdue
              </span>
            )}
          </span>
        </span>
      </Link>

      {!task.completed && (
        <Link to={`/focus/${task.id}`} className="icon-btn" aria-label={`Focus on ${task.title}`}>
          <Timer size={20} />
        </Link>
      )}

      <button type="button" className="icon-btn" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>
        <Trash2 size={20} />
      </button>
    </article>
  )
}
