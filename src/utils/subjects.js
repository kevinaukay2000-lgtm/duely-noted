import {
  Atom,
  BookOpen,
  Calculator,
  Code,
  Dumbbell,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Music,
  Palette,
  PenLine,
} from 'lucide-react'

// Dark enough that a white icon on top stays readable.
export const SUBJECT_COLORS = [
  { value: '#2B3A9E', name: 'Indigo' },
  { value: '#B8500F', name: 'Orange' },
  { value: '#1F7A4D', name: 'Green' },
  { value: '#0B6FA4', name: 'Blue' },
  { value: '#7B3FBF', name: 'Purple' },
  { value: '#C2185B', name: 'Pink' },
  { value: '#B3261E', name: 'Red' },
  { value: '#00796B', name: 'Teal' },
]

export const SUBJECT_ICONS = {
  book: { label: 'Book', Icon: BookOpen },
  calculator: { label: 'Calculator', Icon: Calculator },
  flask: { label: 'Flask', Icon: FlaskConical },
  atom: { label: 'Atom', Icon: Atom },
  globe: { label: 'Globe', Icon: Globe },
  landmark: { label: 'Landmark', Icon: Landmark },
  languages: { label: 'Languages', Icon: Languages },
  pen: { label: 'Pen', Icon: PenLine },
  palette: { label: 'Palette', Icon: Palette },
  music: { label: 'Music', Icon: Music },
  code: { label: 'Code', Icon: Code },
  dumbbell: { label: 'Sport', Icon: Dumbbell },
}
