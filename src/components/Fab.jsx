import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Fab() {
  return (
    <Link to="/tasks/new" className="fab" aria-label="Add task">
      <Plus size={30} strokeWidth={2.75} />
    </Link>
  )
}
