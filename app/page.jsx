'use client';
import { useState, useEffect, useCallback } from 'react';
import CalorieRing from '../components/CalorieRing';
import MacroBars from '../components/MacroBars';
import WeeklyChart from '../components/WeeklyChart';
import FoodSearch from '../components/FoodSearch';
import { MEAL_TYPES, MEAL_LABELS, MEAL_ICONS, calculateDailyCalories, calculateMacros } from '../lib/constants';
import { getUserProfile, getLog, saveLog, dateToKey, getTrackingStreak } from '../lib/storage';

function offsetDate(base, days) { const d = new Date(base); d.setDate(d.getDate() + days); return d; }
function formatDate(date) {
  const tk = dateToKey(new Date());
  const key = dateToKey(date);
  if (key === tk) return 'Today';
  if (key === dateToKey(offsetDate(new Date(), -1))) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

export default function Dashboard() {
  const [date, setDate]     = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [log, setLog]       = useState({ breakfast:[], lunch:[], dinner:[], snacks:[] });
  const [search, setSearch] = useState(null);
  const [streak, setStreak] = useState(0);

  const load = useCallback(() => {
    setProfile(getUserProfile());
    setLog(getLog(dateToKey(date)));
    setStreak(getTrackingStreak());
  }, [date]);
  useEffect(load, [load]);

  const changeDate = (dir) => {
    const next = offsetDate(date, dir);
    if (dateToKey(next) <= dateToKey(new Date())) setDate(next);
  };
  const handleAdd = (mealType, food) => {
    const dk = dateToKey(date);
    const updated = { ...log, [mealType]: [...log[mealType], { ...food, logId: Date.now() }] };
    setLog(updated); saveLog(dk, updated); setSearch(null);
  };
  const handleRemove = (mealType, logId) => {
    const dk = dateToKey(date);
    const updated = { ...log, [mealType]: log[mealType].filter((f) => f.logId !== logId) };
    setLog(updated); saveLog(dk, updated);
  };

  if (!profile) return null;
  const dailyCal  = calculateDailyCalories(profile);
  const macros    = calculateMacros(dailyCal, profile.weight);
  const allItems  = MEAL_TYPES.flatMap((m) => log[m]);
  const consumed  = {
    calories: allItems.reduce((s,i) => s+(i.calories||0), 0),
    protein:  allItems.reduce((s,i) => s+(i.protein ||0), 0),
    carbs:    allItems.reduce((s,i) => s+(i.carbs   ||0), 0),
    fat:      allItems.reduce((s,i) => s+(i.fat     ||0), 0),
  };
  const isToday   = dateToKey(date) === dateToKey(new Date());
  const remaining = dailyCal - consumed.calories;

  return (
    <div className="page-scroll">
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:800, color:'#fff' }}>Hey, {profile.name.split(' ')[0]} 👋</div>
        <div style={{ fontSize:13, color:'#9ca3af', marginTop:2 }}>Let's track your meals</div>
      </div>

      {/* Date nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14,
        padding:'10px 16px', marginBottom:20 }}>
        <button onClick={() => changeDate(-1)} style={navBtn}>‹</button>
        <span style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{formatDate(date)}</span>
        <button onClick={() => changeDate(1)} disabled={isToday}
          style={{ ...navBtn, color: isToday ? '#3a3a3a' : '#fff' }}>›</button>
      </div>

      <div className="dashboard-grid">
        {/* Left */}
        <div className="dashboard-left">
          <div className="card" style={{ textAlign:'center', padding:'24px 20px' }}>
            <CalorieRing consumed={consumed.calories} total={dailyCal}/>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:16,
              background: remaining<0 ? '#2b0d0d' : '#1a1a10',
              border:`1px solid ${remaining<0 ? '#ef4444' : '#ff6b35'}`,
              borderRadius:20, padding:'6px 14px' }}>
              <span style={{ fontSize:13, fontWeight:700, color: remaining<0 ? '#ef4444' : '#ff6b35' }}>
                {remaining<0 ? `${Math.abs(remaining)} kcal over` : `${remaining} kcal left`}
              </span>
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:14 }}>Macros</div>
            <MacroBars consumed={consumed} targets={macros}/>
          </div>
          <WeeklyChart target={dailyCal}/>
        </div>

        {/* Right — meals */}
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:12 }}>Meals</div>
          {MEAL_TYPES.map((mt) => {
            const items = log[mt] || [];
            const mealCal = items.reduce((s,i) => s+(i.calories||0), 0);
            return (
              <div key={mt} className="card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: items.length ? 12 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:18 }}>{MEAL_ICONS[mt]}</span>
                    <span style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{MEAL_LABELS[mt]}</span>
                    {mealCal > 0 && <span style={{ fontSize:12, color:'#ff6b35', fontWeight:600 }}>{mealCal} kcal</span>}
                  </div>
                  <button onClick={() => setSearch({ mealType: mt })} style={{
                    background:'#ff6b35', border:'none', borderRadius:10,
                    width:32, height:32, color:'#fff', fontSize:20,
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>+</button>
                </div>
                {items.length === 0
                  ? <div style={{ fontSize:13, color:'#3a3a3a', fontStyle:'italic', marginTop:4 }}>Nothing logged yet — tap + to add</div>
                  : items.map((item, idx) => (
                    <div key={item.logId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'8px 0', borderTop: idx===0 ? '1px solid #2a2a2a' : '1px solid #222' }}>
                      <div style={{ flex:1, minWidth:0, marginRight:8 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize:11, color:'#6b7280', marginTop:1 }}>
                          {item.servings && item.servings !== 1 ? `${item.servings}× · ` : ''}
                          <span style={{ color:'#ff6b35', fontWeight:600 }}>{item.calories} kcal</span>
                          {' · '}P {item.protein}g · C {item.carbs}g · F {item.fat}g
                        </div>
                      </div>
                      <button onClick={() => handleRemove(mt, item.logId)}
                        style={{ background:'none', border:'none', color:'#3a3a3a', cursor:'pointer', fontSize:14, padding:4, flexShrink:0 }}
                        onMouseEnter={(e) => e.currentTarget.style.color='#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color='#3a3a3a'}>✕</button>
                    </div>
                  ))
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary strip */}
      {isToday && (
        <div style={{ display:'flex', gap:12, marginTop:20 }}>
          {/* Streak */}
          <div className="card" style={{ flex:1, textAlign:'center', padding:'16px 12px' }}>
            <div style={{ fontSize:28 }}>{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱'}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#ff6b35', lineHeight:1.1, marginTop:4 }}>{streak}</div>
            <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>day streak</div>
          </div>
          {/* Motivational message */}
          <div className="card" style={{ flex:3, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            {(() => {
              const pct = dailyCal > 0 ? consumed.calories / dailyCal : 0;
              if (consumed.calories === 0) return <>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Start logging 💪</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>Tap + on any meal to add your first food today.</div>
              </>;
              if (remaining < 0) return <>
                <div style={{ fontSize:15, fontWeight:700, color:'#ef4444' }}>Over budget</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>You're {Math.abs(remaining)} kcal over. Keep it light for the rest of the day.</div>
              </>;
              if (pct >= 0.9) return <>
                <div style={{ fontSize:15, fontWeight:700, color:'#f59e0b' }}>Almost there!</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>Only {remaining} kcal left — you're nearly at your goal.</div>
              </>;
              if (pct >= 0.5) return <>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Halfway through 🎯</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{remaining} kcal remaining. Keep it up!</div>
              </>;
              return <>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Good start!</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{consumed.calories} kcal logged · {remaining} kcal still to go.</div>
              </>;
            })()}
          </div>
        </div>
      )}

      {search && <FoodSearch mealType={search.mealType} onAdd={(food) => handleAdd(search.mealType, food)} onClose={() => setSearch(null)}/>}
    </div>
  );
}

const navBtn = { background:'none', border:'none', color:'#fff', fontSize:24, cursor:'pointer', padding:'0 8px', fontFamily:'inherit' };
