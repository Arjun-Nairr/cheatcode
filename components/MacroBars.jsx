export default function MacroBars({ consumed, targets }) {
  const bars = [
    { label:'Protein', consumed:consumed.protein, target:targets.protein, color:'#3b82f6', bg:'#1e3a5f' },
    { label:'Carbs',   consumed:consumed.carbs,   target:targets.carbs,   color:'#f59e0b', bg:'#3d2e05' },
    { label:'Fat',     consumed:consumed.fat,      target:targets.fat,     color:'#ef4444', bg:'#3d1010' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {bars.map((b) => {
        const pct  = b.target > 0 ? Math.min((b.consumed / b.target) * 100, 100) : 0;
        const over = b.consumed > b.target;
        return (
          <div key={b.label}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:13, fontWeight:600, color:'#9ca3af' }}>{b.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color: over ? '#ef4444' : '#fff' }}>
                {b.consumed}g <span style={{ color:'#6b7280', fontWeight:400 }}>/ {b.target}g</span>
              </span>
            </div>
            <div style={{ height:8, borderRadius:4, background:b.bg, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background: over ? '#ef4444' : b.color,
                borderRadius:4, transition:'width .4s ease' }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}
