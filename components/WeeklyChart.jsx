'use client';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { getLog, dateToKey } from '../lib/storage';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, padding:'8px 12px' }}>
      <div style={{ fontSize:12, color:'#9ca3af', marginBottom:2 }}>{d.fullLabel}</div>
      <div style={{ fontSize:15, fontWeight:700, color: d.over ? '#ef4444' : '#ff6b35' }}>{d.consumed} kcal</div>
      {d.consumed > 0 && <div style={{ fontSize:11, color:'#6b7280' }}>target {d.target}</div>}
    </div>
  );
}

export default function WeeklyChart({ target }) {
  const days = getLast7Days();
  const today = dateToKey(new Date());

  const data = days.map((d) => {
    const dk = dateToKey(d);
    const log = getLog(dk);
    const consumed = Object.values(log).flat().reduce((s, f) => s + (f.calories || 0), 0);
    const isToday = dk === today;
    return {
      label: DAYS[d.getDay()],
      fullLabel: isToday ? 'Today' : d.toLocaleDateString('en-GB', { day:'numeric', month:'short' }),
      consumed,
      target,
      over: consumed > target,
      isToday,
    };
  });

  const maxVal = Math.max(...data.map(d => d.consumed), target) * 1.15;

  return (
    <div className="card" style={{ overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>This Week</div>
        <div style={{ fontSize:11, color:'#6b7280' }}>
          {data.reduce((s,d) => s + d.consumed, 0).toLocaleString()} kcal total
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="30%" margin={{ top:4, right:12, left:-20, bottom:0 }}>
          <XAxis dataKey="label" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} domain={[0, maxVal]}
            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} width={32}/>
          <Tooltip content={<CustomTooltip/>} cursor={{ fill:'#ffffff08' }}/>
          <ReferenceLine y={target} stroke="#ff6b35" strokeDasharray="4 3" strokeWidth={1.5}/>
          <Bar dataKey="consumed" radius={[5,5,0,0]}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.over ? '#ef4444' : entry.isToday ? '#ff6b35' : '#3a3a3a'}
                opacity={entry.consumed === 0 ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', gap:16, marginTop:10 }}>
        {[['#ff6b35','Today'],['#3a3a3a','Past days'],['#ef4444','Over target']].map(([c,l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
            <span style={{ fontSize:10, color:'#6b7280' }}>{l}</span>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:12, height:1.5, background:'#ff6b35', opacity:0.6 }}/>
          <span style={{ fontSize:10, color:'#6b7280' }}>Target</span>
        </div>
      </div>
    </div>
  );
}
