import { BookOpen, House, ListTodo, Settings as SettingsIcon, X } from 'lucide-react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Pip from './components/Pip'
import { useApp } from './context/AppContext'
import Focus from './screens/Focus'
import Home from './screens/Home'
import Settings from './screens/Settings'
import Subjects from './screens/Subjects'
import TaskForm from './screens/TaskForm'
import Tasks from './screens/Tasks'

const TABS = [
  ['/', 'Home', <House key="i" size={24} />],
  ['/tasks', 'Tasks', <ListTodo key="i" size={24} />],
  ['/subjects', 'Subjects', <BookOpen key="i" size={24} />],
  ['/settings', 'Settings', <SettingsIcon key="i" size={24} />],
]

// Background stripes: 7 vertical wavy edges in a 1000×1000 box. Shape k fills everything left of edge k,
// drawn right-to-left so each stripe sits on (and casts its shadow onto) the one to its right.
const WAVE_EDGES = [7, 6, 5, 4, 3, 2, 1].map((k) => {
  const x = k * 125
  const swing = k % 2 ? 26 : 34 // alternate the swing so the stripes feel hand-drawn
  const ys = [-60, 220, 500, 780, 1060]
  const xs = ys.map((_, i) => x + (i % 2 ? swing : -swing))
  const curves = ys.slice(1).map((y, i) => {
    const mid = (ys[i] + y) / 2
    return `C${xs[i]} ${mid} ${xs[i + 1]} ${mid} ${xs[i + 1]} ${y}`
  })
  return { k, d: `M-300 -60H${xs[0]}${curves.join('')}H-300Z` }
})

export default function App() {
  const { toast, undo, dismissToast, celebration } = useApp()
  const { pathname } = useLocation()
  // The task form and focus timer get the whole phone screen (no bottom bar).
  const fullScreen = pathname.startsWith('/tasks/') || pathname.startsWith('/focus/')

  return (
    <div className={`app${fullScreen ? '' : ' has-tabs'}`}>
      {/* Decorative tilted stripes, peach → lavender from left to right; colours come from theme variables. */}
      <div className="bg-waves" aria-hidden="true">
        <svg className="waves" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <filter id="wave-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="6" dy="0" stdDeviation="6" style={{ floodColor: 'var(--wave-shadow)' }} />
            </filter>
          </defs>
          <rect x="0" y="0" width="1000" height="1000" style={{ fill: 'var(--wave-8)' }} />
          {WAVE_EDGES.map(({ k, d }) => (
            <path key={k} d={d} filter="url(#wave-shadow)" style={{ fill: `var(--wave-${k})` }} />
          ))}
        </svg>
      </div>

      <header className="app-header">
        <img src="logo.svg" alt="" width="36" height="36" />
        <span className="wordmark">
          <span className="due">Due</span>ly Noted
        </span>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskForm />} />
          <Route path="/focus/:id" element={<Focus />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Always rendered: it's the sidebar on laptops/desktops; CSS hides it on phone/tablet full-screen views. */}
      <nav className="tab-bar" aria-label="Main">
        {TABS.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className="tab">
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            <span>{toast.message}</span>
            {toast.undo && (
              <button type="button" className="toast-action" onClick={undo}>
                Undo
              </button>
            )}
            <button type="button" className="icon-btn" onClick={dismissToast} aria-label="Dismiss">
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {celebration > 0 && (
        <div className="celebration" key={celebration} aria-hidden="true">
          <svg className="celebration-check" viewBox="186 192 272 240" width="120" height="106">
            <path d="M232 318 L300 386 L412 238" stroke="#2B3A9E" strokeWidth="82" pathLength="1" />
            <path d="M232 318 L300 386 L412 238" stroke="#FF8A3D" strokeWidth="54" pathLength="1" />
          </svg>
          <Pip mood="cheering" size={120} />
        </div>
      )}
    </div>
  )
}
