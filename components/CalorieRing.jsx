const SIZE = 200, STROKE = 18, R = (SIZE - STROKE) / 2, CIRC = 2 * Math.PI * R, CX = SIZE / 2;

export default function CalorieRing({ consumed, total }) {
  const pct  = total > 0 ? Math.min(consumed / total, 1) : 0;
  const remaining = total - consumed;
  const over  = remaining < 0;
  const color = over ? '#ef4444' : '#ff6b35';

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto' }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={CX} cy={CX} r={R} fill="none" stroke="#2a2a2a" strokeWidth={STROKE}/>
        <circle cx={CX} cy={CX} r={R} fill="none" stroke={color} strokeWidth={STROKE}
          strokeDasharray={`${CIRC * pct} ${CIRC}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .4s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:2 }}>
        <span style={{ fontSize:38, fontWeight:800, color:'#fff', lineHeight:1 }}>{Math.abs(remaining)}</span>
        <span style={{ fontSize:12, color:'#9ca3af' }}>{over ? 'over budget' : 'remaining'}</span>
        <span style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{consumed} / {total} kcal</span>
      </div>
    </div>
  );
}
