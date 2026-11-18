# Duely Noted

**Homework, handled.** A friendly task manager for students, with Pip the bookworm as a study buddy.
Runs in the browser and as an Android app. Works fully offline, with no account and no server.

## Features

- **Dashboard**: greeting from Pip, task counts (total, pending, completed, upcoming, overdue), today's progress,
  current and best day streak, the next 5 deadlines, and a "Last 7 days" chart (per day and per subject).
- **My Tasks**: search by title; filter by status, subject and priority; sort by deadline, priority or date created.
  Tick to complete (with a small celebration), tap to edit, delete with a 5-second Undo.
- **Add / Edit task**: title (required, max 80), description (max 500), subject, priority, optional deadline
  (warns if it is in the past).
- **Subjects**: add, rename, recolour and re-icon; deleting one moves its tasks to "No subject" (with Undo).
- **Focus timer**: Pomodoro-style timer on any task. Focus 15/25/45 minutes or custom (1-180);
  break 5/10/15 minutes or custom (1-60). Both lengths are remembered.
- **Settings**: light, dark or follow-system theme; clear all data; Android download link (web only).
- Responsive layouts for phone, tablet, laptop and desktop; accessible labels and contrast in both themes.

## Tech stack

React 19 + Vite, plain JavaScript and CSS (no UI framework, no state library), React Router (HashRouter),
lucide-react icons, Fredoka font bundled via @fontsource, Capacitor 8 for the Android build.

## Getting started

Requires **Node.js 22** or newer.

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run lint` | Run ESLint (must pass with zero errors) |
| `npm run build` | Production web build into `dist/` |
| `npm run cap:sync` | Web build, then copy it into the Android project |
| `npm run build:web` | Web build plus `release/duely-noted.apk` copied to `dist/downloads/` for the download button |

## Android app

A ready-to-install APK is in `release/duely-noted.apk` (debug build). On the phone, allow installs from unknown sources.

To build it yourself you need **JDK 21** and the **Android SDK (API 36)**. Installing Android Studio provides both.

```bash
npm run cap:sync
cd android
gradlew.bat assembleDebug     # Windows
./gradlew assembleDebug       # macOS / Linux
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to `release/duely-noted.apk`
to update the one served by `npm run build:web`.

- Always use `npm run cap:sync` (never `cap sync` straight after `build:web`), or the APK gets bundled inside the next APK.
- Debug builds are signed with each computer's own debug key. If you install a build from a different computer,
  uninstall the old app first.
- Publishing to Google Play needs a signed release build (`.aab`), a privacy policy and the Data safety form.
- App icon and splash screen come from `assets/logo.svg`. To regenerate them:
  `npx @capacitor/assets generate --android --iconBackgroundColor "#2B3A9E" --iconBackgroundColorDark "#2B3A9E" --splashBackgroundColor "#2B3A9E" --splashBackgroundColorDark "#2B3A9E"`
- `android/app/src/main/java/com/duelynoted/app/MainActivity.java` makes the hardware Back button step back through
  the app's screens before closing it.

## Project structure

```
src/
  App.jsx            layout, routes, tab bar / sidebar, toast, celebration, background
  main.jsx           entry point (router, provider, fonts, styles)
  screens/           Home, Tasks, TaskForm, Focus, Subjects, Settings (one file per screen)
  components/        Pip (mascot), TaskCard, EmptyState, Fab, SubjectIcon
  context/           AppContext (hook) + AppProvider (state and actions)
  storage/           localStorage reading, writing and validation
  utils/             date/task helpers, subject colours and icons
  styles/app.css     all styles and theme variables
scripts/copy-apk.js  copies the APK into dist/ for the web download
android/             Capacitor Android project
```

## Data

Everything is stored on the device in `localStorage`, under `dn.tasks`, `dn.subjects`, `dn.settings` and `dn.streak`,
each saved with a `schemaVersion`. If saved data is damaged, the app falls back to defaults, shows a message and keeps
a copy under `<key>.backup`. There is no backup, export or sync: uninstalling the app or clearing its storage deletes
all tasks.

## Known limitations

- The focus timer stops if you leave its screen, and it cannot alert you while the app is in the background.
- No backup / restore of data.
- Only a debug Android build is set up so far.
