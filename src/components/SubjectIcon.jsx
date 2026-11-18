import { createElement } from 'react'
import { BookOpen } from 'lucide-react'
import { SUBJECT_ICONS } from '../utils/subjects'

export default function SubjectIcon({ icon, size = 20 }) {
  return createElement(SUBJECT_ICONS[icon]?.Icon ?? BookOpen, { size })
}
