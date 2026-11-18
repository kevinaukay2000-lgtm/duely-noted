import { ArrowLeft, Check, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import Pip from '../components/Pip'
import SubjectIcon from '../components/SubjectIcon'
import { useApp } from '../context/AppContext'
import { TIMER_LIMITS } from '../storage/storage'
import { plural } from '../utils/tasks'

const MINUTE = 60000
const MODES = {
  focus: { label: 'Focus', presets: [15, 25, 45], fallback: 25, setting: 'focusMinutes' },
  break: { label: 'Break', presets: [5, 10, 15], fallback: 5, setting: 'breakMinutes' },
}
const maxFor = (mode) => TIMER_LIMITS[MODES[mode].setting]
const isValidMinutes = (n, mode) => Number.isInteger(n) && n >= 1 && n <= maxFor(mode)

// Two soft notes when a session ends. Web Audio needs no sound files and works offline.
function chime(ctx) {
  if (!ctx) return
  for (const [freq, delay] of [
    [660, 0],
    [880, 0.25],
  ]) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = ctx.currentTime + delay
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.65)
  }
}

export default function Focus() {
  const { id } = useParams()
  const { tasks, subjects, settings, toggleTask, updateSettings } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const task = tasks.find((t) => t.id === id)
  // Per-mode state, keyed 'focus' / 'break'. Lengths start from what the user picked last time.
  const saved = {
    focus: settings.focusMinutes ?? MODES.focus.fallback,
    break: settings.breakMinutes ?? MODES.break.fallback,
  }
  const [lengths, setLengths] = useState(saved)
  const [custom, setCustom] = useState(() => ({
    focus: !MODES.focus.presets.includes(saved.focus),
    break: !MODES.break.presets.includes(saved.break),
  }))
  const [customText, setCustomText] = useState(() => ({ focus: String(saved.focus), break: String(saved.break) }))
  const [mode, setMode] = useState('focus')
  // While running, endsAt is the source of truth, so a locked phone or hidden tab can't make the clock drift.
  const [endsAt, setEndsAt] = useState(null)
  const [left, setLeft] = useState(saved.focus * MINUTE)
  const [sessions, setSessions] = useState(0)
  const audio = useRef(null)

  const length = lengths[mode] * MINUTE
  const running = endsAt !== null

  useEffect(() => {
    if (!endsAt) return
    let done = false // the interval and visibilitychange can both fire at the finish line
    const tick = () => {
      if (done) return
      const remaining = endsAt - Date.now()
      if (remaining > 0) {
        setLeft(remaining)
        return
      }
      done = true
      chime(audio.current)
      const next = mode === 'focus' ? 'break' : 'focus'
      if (mode === 'focus') setSessions((n) => n + 1)
      setEndsAt(null)
      setMode(next)
      setLeft(lengths[next] * MINUTE)
    }
    const timer = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [endsAt, mode, lengths])

  useEffect(() => {
    const ref = audio
    return () => ref.current?.close().catch(() => {})
  }, [])

  if (!task) {
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

  const goBack = () => (location.key === 'default' ? navigate('/tasks', { replace: true }) : navigate(-1))

  const toggleRun = () => {
    if (running) {
      setLeft(endsAt - Date.now())
      setEndsAt(null)
      return
    }
    // Audio may only start after a tap, so the context is created here rather than when the timer ends.
    try {
      audio.current ??= new (window.AudioContext || window.webkitAudioContext)()
      audio.current.resume().catch(() => {})
    } catch {
      // No Web Audio: the timer still works, just silently.
    }
    setEndsAt(Date.now() + left)
  }

  const switchMode = (next) => {
    setEndsAt(null)
    setMode(next)
    setLeft(lengths[next] * MINUTE)
  }

  const pickLength = (minutes) => {
    setLengths({ ...lengths, [mode]: minutes })
    setLeft(minutes * MINUTE)
    updateSettings({ [MODES[mode].setting]: minutes }) // remembered for next time
  }

  // Typing applies valid values straight away; anything else just shows a hint and blocks Start.
  const onCustomChange = (e) => {
    setCustomText({ ...customText, [mode]: e.target.value })
    const minutes = Number(e.target.value)
    if (isValidMinutes(minutes, mode)) pickLength(minutes)
  }
  const customValid = !custom[mode] || isValidMinutes(Number(customText[mode]), mode)

  const finishTask = () => {
    toggleTask(task.id)
    goBack()
  }

  const subject = subjects.find((s) => s.id === task.subjectId)
  const secs = Math.ceil(left / 1000)
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  const [mood, message] =
    mode === 'break'
      ? running
        ? ['sleepy', 'Break time. Stretch and grab some water.']
        : ['cheering', sessions ? `Nice focus! Take a ${lengths.break}-minute break.` : 'Take a short break, then dive back in.']
      : running
        ? ['happy', 'Pip is reading along with you.']
        : left < length
          ? ['sleepy', 'Paused. Pip will wait for you.']
          : ['happy', 'Pick a length and press Start.']

  return (
    <div className={`focus${mode === 'break' ? ' focus--break' : ''}`}>
      <div className="screen-head">
        <button type="button" className="icon-btn" onClick={goBack} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1>Focus</h1>
      </div>

      <section className="card focus-card" style={{ '--subject': subject?.color ?? 'var(--no-subject)' }}>
        <div className="focus-task">
          <span className="subject-badge">
            <SubjectIcon icon={subject?.icon} size={18} />
          </span>
          <div>
            <strong>{task.title}</strong>
            <span className="muted small">{subject?.name ?? 'No subject'}</span>
          </div>
        </div>

        <fieldset className="field">
          <legend className="sr-only">Timer mode</legend>
          <div className="choices choices--2">
            {Object.entries(MODES).map(([value, { label }]) => (
              <label key={value}>
                <input
                  type="radio"
                  className="sr-only"
                  name="mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => switchMode(value)}
                />
                <span className="choice">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="focus-ring">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle className="ring-track" cx="100" cy="100" r="88" />
            <circle className="ring-fill" cx="100" cy="100" r="88" pathLength="1" style={{ strokeDashoffset: 1 - left / length }} />
          </svg>
          <div className="focus-center">
            <Pip mood={mood} size={92} />
            <span className="focus-clock" role="timer" aria-label={`${Math.floor(secs / 60)} minutes ${secs % 60} seconds left`}>
              {clock}
            </span>
          </div>
        </div>

        <p className="focus-message" aria-live="polite">
          {message}
        </p>

        <div className="focus-controls">
          <button type="button" className="icon-btn" onClick={() => switchMode(mode)} aria-label="Reset timer">
            <RotateCcw size={22} />
          </button>
          <button type="button" className="btn btn-primary focus-main" onClick={toggleRun} disabled={!running && !customValid}>
            {running ? <Pause size={22} /> : <Play size={22} />}
            {running ? 'Pause' : left < length ? 'Resume' : 'Start'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')}
            aria-label={mode === 'focus' ? 'Skip to break' : 'Skip break'}
          >
            <SkipForward size={22} />
          </button>
        </div>

        {/* Length picker for whichever mode is showing: focus 15/25/45, break 5/10/15, or a custom number. */}
        {!running && (
          <fieldset className="field">
            <legend className="field-label">{MODES[mode].label} length</legend>
            <div className="choices choices--4">
              {MODES[mode].presets.map((minutes) => (
                <label key={minutes}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="length"
                    value={minutes}
                    checked={!custom[mode] && lengths[mode] === minutes}
                    onChange={() => {
                      setCustom({ ...custom, [mode]: false })
                      pickLength(minutes)
                    }}
                  />
                  <span className="choice">{minutes} min</span>
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  className="sr-only"
                  name="length"
                  value="custom"
                  checked={custom[mode]}
                  onChange={() => {
                    setCustom({ ...custom, [mode]: true })
                    setCustomText({ ...customText, [mode]: String(lengths[mode]) })
                  }}
                />
                <span className="choice">Custom</span>
              </label>
            </div>
            {custom[mode] && (
              <div className="custom-length">
                <label htmlFor="custom-minutes">Minutes</label>
                <input
                  id="custom-minutes"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={maxFor(mode)}
                  step="1"
                  value={customText[mode]}
                  onChange={onCustomChange}
                  aria-invalid={customValid ? undefined : true}
                  aria-describedby="custom-hint"
                />
                <span id="custom-hint" className={customValid ? 'muted small' : 'error'}>
                  {customValid
                    ? `Any length from 1 to ${maxFor(mode)} minutes`
                    : `Enter a whole number from 1 to ${maxFor(mode)}.`}
                </span>
              </div>
            )}
          </fieldset>
        )}

        {sessions > 0 && <p className="muted small">{plural(sessions, 'focus session')} done</p>}

        {!task.completed && (
          <button type="button" className="btn btn-ghost" onClick={finishTask}>
            <Check size={20} /> Mark task done
          </button>
        )}
      </section>
    </div>
  )
}
