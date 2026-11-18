// Copies the built APK into the web build so the site can offer it as a download.
// Run only after `vite build`; never run `cap sync` afterwards or the APK gets bundled into the next APK.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'

const source = 'release/duely-noted.apk'
const target = 'dist/downloads/duely-noted.apk'

if (!existsSync(source)) {
  console.error(`Missing ${source}. Build the Android APK first.`)
  process.exit(1)
}
mkdirSync('dist/downloads', { recursive: true })
copyFileSync(source, target)
console.log(`Copied ${source} -> ${target}`)
