// Pip: an original bookworm mascot drawn from simple shapes. Moods: happy, cheering, worried, sleepy.
const INK = '#1E2350'
const BODY = '#FF8A3D'
const OUTLINE = '#C4561A'

function Face({ mood }) {
  if (mood === 'sleepy') {
    return (
      <g fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round">
        <path d="M50 47 Q54 50 58 47" />
        <path d="M67 47 Q71 50 75 47" />
        <circle cx="62.5" cy="58" r="2.4" fill={INK} stroke="none" />
      </g>
    )
  }
  if (mood === 'cheering') {
    return (
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round">
        <path d="M50 48 Q54 42 58 48" />
        <path d="M67 48 Q71 42 75 48" />
        <path d="M55 55 Q62.5 67 70 55 Z" fill="#7A1F2B" strokeLinejoin="round" />
      </g>
    )
  }
  return (
    <g>
      <circle cx="54.5" cy="46" r="2.8" fill={INK} />
      <circle cx="71.5" cy="46" r="2.8" fill={INK} />
      <circle cx="55.5" cy="45" r="0.9" fill="#fff" />
      <circle cx="72.5" cy="45" r="0.9" fill="#fff" />
      {mood === 'worried' ? (
        <g fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round">
          <path d="M46 35 L57 31.5" />
          <path d="M68 31.5 L79 35" />
          <path d="M56 60 Q59 57 62.5 60 Q66 63 69 60" />
        </g>
      ) : (
        <path d="M56 56 Q62.5 62.5 69 56" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      )}
    </g>
  )
}

export default function Pip({ mood = 'happy', size = 96 }) {
  return (
    <svg
      className={`pip pip--${mood}`}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`Pip the bookworm, ${mood}`}
    >
      <g className="pip-body">
        {/* body segments rising out of the book */}
        <g fill={BODY} stroke={OUTLINE} strokeWidth="2">
          <circle cx="58" cy="94" r="11" />
          <circle cx="64" cy="82" r="11.5" />
          <circle cx="59" cy="70" r="12" />
        </g>
        {/* antennae */}
        <g stroke={OUTLINE} strokeWidth="2.2" strokeLinecap="round">
          <line x1="54" y1="28" x2="47" y2="14" />
          <line x1="71" y1="28" x2="78" y2="14" />
        </g>
        <circle cx="47" cy="13" r="3.6" fill="#FFC23D" />
        <circle cx="78" cy="13" r="3.6" fill="#FFC23D" />
        {/* head */}
        <circle cx="62.5" cy="47" r="21" fill={BODY} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="53" cy="36" r="5" fill="#fff" opacity="0.3" />
        <ellipse cx="46" cy="55" rx="4" ry="2.6" fill="#FF5E7A" opacity="0.45" />
        <ellipse cx="79" cy="55" rx="4" ry="2.6" fill="#FF5E7A" opacity="0.45" />
        <Face mood={mood} />
        {/* bookworm glasses */}
        <g fill="#fff" fillOpacity="0.25" stroke="#2B3A9E" strokeWidth="2.4">
          <circle cx="54.5" cy="46" r="7.5" />
          <circle cx="71.5" cy="46" r="7.5" />
        </g>
        <line x1="62" y1="46" x2="64" y2="46" stroke="#2B3A9E" strokeWidth="2.4" />
      </g>

      {/* open book */}
      <path d="M6 101 Q33 93 60 103 Q87 93 114 101 L114 111 Q87 103 60 113 Q33 103 6 111 Z" fill="#2B3A9E" />
      <path d="M11 99 Q35 91 60 100 L60 108 Q35 99 11 106 Z" fill="#FFF8EE" stroke="#2B3A9E" strokeWidth="1.5" />
      <path d="M109 99 Q85 91 60 100 L60 108 Q85 99 109 106 Z" fill="#FFF8EE" stroke="#2B3A9E" strokeWidth="1.5" />

      {mood === 'worried' && <path className="pip-sweat" d="M86 28 Q91 36 86 39 Q81 36 86 28 Z" fill="#7CC4FF" />}
      {mood === 'sleepy' && (
        <g className="pip-z" fill="currentColor" fontFamily="Fredoka, sans-serif" fontWeight="700">
          <text x="88" y="30" fontSize="11">z</text>
          <text x="97" y="19" fontSize="15">z</text>
        </g>
      )}
      {mood === 'cheering' && (
        <g className="pip-sparkles" fill="#FFC23D">
          <path d="M20 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
          <path d="M100 24 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5 Z" />
          <circle cx="98" cy="62" r="3" fill="#FF8A3D" />
          <circle cx="24" cy="66" r="2.5" fill="#7CC4FF" />
        </g>
      )}
    </svg>
  )
}
