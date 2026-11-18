import Pip from './Pip'

export default function EmptyState({ mood = 'sleepy', title, text, action }) {
  return (
    <section className="card empty">
      <Pip mood={mood} size={112} />
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
      {action}
    </section>
  )
}
