import { Capacitor } from '@capacitor/core'
import { Monitor, Moon, Smartphone, Sun, Trash2 } from 'lucide-react'
import { version } from '../../package.json'
import { useApp } from '../context/AppContext'
import { defaultData } from '../storage/storage'

const THEME_OPTIONS = [
  ['light', 'Light', <Sun key="i" size={22} />],
  ['dark', 'Dark', <Moon key="i" size={22} />],
  ['system', 'Follow system', <Monitor key="i" size={22} />],
]

export default function Settings() {
  const { settings, setTheme, replaceAll, showToast } = useApp()

  const clearAll = () => {
    if (!window.confirm('Delete all tasks, subjects and your streak, and reset settings? This cannot be undone.')) return
    replaceAll(defaultData())
    showToast('All data cleared')
  }

  return (
    <>
      <h1>Settings</h1>

      <div className="settings-grid">
        <section className="card">
          <fieldset className="field">
            <legend>
              <h2>Theme</h2>
            </legend>
            <div className="choices choices--3">
              {THEME_OPTIONS.map(([value, label, icon]) => (
                <label key={value}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="theme"
                    value={value}
                    checked={settings.theme === value}
                    onChange={() => setTheme(value)}
                  />
                  <span className="choice choice--stack">
                    {icon}
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {!Capacitor.isNativePlatform() && (
          <section className="card">
            <h2>Get the Android app</h2>
            <a className="btn btn-primary" href="downloads/duely-noted.apk" download>
              <Smartphone size={20} /> Download for Android
            </a>
            <p className="muted small">Your phone may ask you to allow installs from unknown sources.</p>
          </section>
        )}

        <section className="card">
          <h2>Danger zone</h2>
          <button type="button" className="btn btn-danger" onClick={clearAll}>
            <Trash2 size={20} /> Clear all data
          </button>
        </section>

        <section className="card about">
          <img src="logo.svg" alt="Duely Noted logo" width="72" height="72" />
          <div>
            <h2 className="wordmark">
              <span className="due">Due</span>ly Noted
            </h2>
            <p>Homework, handled.</p>
            <p className="muted small">Version {version}. Your data stays on this device.</p>
          </div>
        </section>
      </div>
    </>
  )
}
