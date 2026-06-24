'use client';
import { useState, useEffect } from 'react';
import { getSuggestions, logInteraction } from '../../lib/ml';
import { getUserProfile, getCheatHistory, addCheatEntry, getLog, saveLog, dateToKey } from '../../lib/storage';
import { calculateDailyCalories } from '../../lib/constants';

const TAG_COLOR = {
  mcdonalds:'#DA291C', kfc:'#F40027', pizzahut:'#EE3124', subway:'#009B77',
  starbucks:'#00704A', burgerking:'#FF791A', dominos:'#006491',
  snacks:'#9b59b6', indian:'#e67e22',
};

function tagLabel(tag) {
  const map = { mcdonalds:"McDonald's", kfc:'KFC', pizzahut:'Pizza Hut', subway:'Subway',
    starbucks:'Starbucks', burgerking:'Burger King', dominos:"Domino's",
    snacks:'Snacks', indian:'Indian' };
  return map[tag] || tag;
}

const REASON_CONFIG = {
  liked:  { label: 'You liked this', icon: '👍', color: '#22c55e', bg: '#14532d22' },
  time:   { label: 'Right time of day', icon: '🕐', color: '#f59e0b', bg: '#3d2e0522' },
  budget: { label: 'Fits your budget', icon: '🎯', color: '#3b82f6', bg: '#1e3a5f22' },
};

function ReasonChips({ reasons }) {
  if (!reasons?.length) return null;
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
      {reasons.map((r) => {
        const cfg = REASON_CONFIG[r];
        if (!cfg) return null;
        return (
          <div key={r} style={{ display:'inline-flex', alignItems:'center', gap:4,
            background: cfg.bg, border:`1px solid ${cfg.color}44`,
            borderRadius:20, padding:'3px 9px', fontSize:11, fontWeight:600, color: cfg.color }}>
            <span>{cfg.icon}</span><span>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CheatHistory() {
  const [history, setHistory] = useState([]);
  useEffect(() => { setHistory(getCheatHistory()); }, []);
  if (!history.length) return null;

  const grouped = history.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:12 }}>Cheat History 🧾</div>
      {Object.entries(grouped).slice(0, 5).map(([date, items]) => {
        const d = new Date(date);
        const label = date === dateToKey(new Date()) ? 'Today'
          : d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
        return (
          <div key={date} className="card" style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#9ca3af', fontWeight:600, marginBottom:8 }}>{label}</div>
            {items.map((item, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding: i > 0 ? '8px 0 0' : '0', borderTop: i > 0 ? '1px solid #222' : 'none' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{item.name}</div>
                  <div style={{ fontSize:11, color:'#6b7280', marginTop:1 }}>{tagLabel(item.tag)}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:'#ff6b35' }}>{item.calories} kcal</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function CheatMeal() {
  const [cheatBudget, setCheatBudget] = useState(500);
  const [actualRemaining, setActualRemaining] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [hadThis, setHadThis] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTag, setActiveTag] = useState('all');
  const [historyKey, setHistoryKey] = useState(0);
  const [overrideGate, setOverrideGate] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    const dailyCal = calculateDailyCalories(profile);
    const budget = Math.round(dailyCal * 0.3);

    const todayLog = getLog(dateToKey(new Date()));
    const consumed = Object.values(todayLog).flat().reduce((s, f) => s + (f.calories || 0), 0);
    const remaining = dailyCal - consumed;

    setCheatBudget(budget);
    setActualRemaining(remaining);
    setOverrideGate(false);
    setSuggestions(getSuggestions({ remainingCalories: budget, hour: new Date().getHours() }));
  }, [refreshKey]);

  const handleFeedback = (id, type) => {
    logInteraction(id, type);
    setFeedback((prev) => ({ ...prev, [id]: type }));
  };

  const handleHadThis = (item) => {
    addCheatEntry(item);
    const dk = dateToKey(new Date());
    const todayLog = getLog(dk);
    const snacks = [...(todayLog.snacks || []), { ...item, logId: Date.now() }];
    saveLog(dk, { ...todayLog, snacks });
    setHadThis((prev) => ({ ...prev, [item.id]: true }));
    setHistoryKey((k) => k + 1);
  };

  const allTags = ['all', ...Array.from(new Set(suggestions.map((s) => s.tag)))];
  const displayed = activeTag === 'all' ? suggestions : suggestions.filter((s) => s.tag === activeTag);

  return (
    <div className="page-scroll">
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:800, color:'#fff' }}>Cheat Meal 🔥</div>
        <div style={{ fontSize:13, color:'#9ca3af', marginTop:2 }}>AI-picked based on your history & habits</div>
      </div>

      {/* Budget card */}
      <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:13, color:'#9ca3af', fontWeight:500 }}>Cheat budget</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#ff6b35', lineHeight:1.1 }}>{cheatBudget} <span style={{ fontSize:14, color:'#9ca3af', fontWeight:400 }}>kcal</span></div>
          <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>
            {actualRemaining !== null && `${actualRemaining} kcal left today · `}~30% of daily goal
          </div>
        </div>
        <button onClick={() => setRefreshKey((k) => k+1)} style={{
          background:'#ff6b35', border:'none', borderRadius:14, padding:'10px 18px',
          color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          Refresh ↻
        </button>
      </div>

      {/* Calorie gate */}
      {actualRemaining !== null && actualRemaining < cheatBudget && !overrideGate ? (
        <div className="card" style={{ textAlign:'center', padding:'28px 20px', marginBottom:20, border:'1px solid #ef444444' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🙅</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:8 }}>Maybe skip today</div>
          <div style={{ fontSize:13, color:'#9ca3af', lineHeight:1.6, marginBottom:20 }}>
            You only have <span style={{ color:'#ef4444', fontWeight:700 }}>{actualRemaining} kcal</span> left today,
            but your cheat budget is <span style={{ color:'#ff6b35', fontWeight:700 }}>{cheatBudget} kcal</span>.
            {actualRemaining <= 0
              ? " You're already at your limit."
              : " A cheat meal would push you over your goal."}
          </div>
          <button onClick={() => setOverrideGate(true)} style={{
            background:'#1a1a1a', border:'1px solid #3a3a3a', borderRadius:12,
            padding:'11px 24px', color:'#9ca3af', fontWeight:600, fontSize:13,
            cursor:'pointer', fontFamily:'inherit' }}>
            I'll risk it anyway →
          </button>
        </div>
      ) : (
        <>
          {/* Tag filter */}
      {allTags.length > 1 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {allTags.map((t) => (
            <button key={t} onClick={() => setActiveTag(t)} style={{
              padding:'5px 13px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit',
              background: activeTag===t ? (t==='all' ? '#ff6b35' : (TAG_COLOR[t]||'#ff6b35')) : '#1a1a1a',
              color: activeTag===t ? '#fff' : '#9ca3af', fontSize:12, fontWeight:600,
              border: `1px solid ${activeTag===t ? 'transparent' : '#2a2a2a'}` }}>
              {t==='all' ? 'All' : tagLabel(t)}
            </button>
          ))}
        </div>
      )}

      {/* Suggestion cards */}
      {displayed.length === 0 ? (
        <div style={{ color:'#6b7280', textAlign:'center', paddingTop:40, fontSize:14 }}>No suggestions available right now.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {displayed.map((item, idx) => {
            const fb = feedback[item.id];
            const had = hadThis[item.id];
            const tagColor = TAG_COLOR[item.tag] || '#ff6b35';
            return (
              <div key={item.id} className="card" style={{ position:'relative', overflow:'hidden' }}>
                {idx < 3 && (
                  <div style={{ position:'absolute', top:12, right:12,
                    background: idx===0 ? '#fbbf24' : idx===1 ? '#9ca3af' : '#cd7c2c',
                    borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:800, color:'#000' }}>
                    #{idx+1}
                  </div>
                )}

                <div style={{ display:'inline-block', background: tagColor+'22', border:`1px solid ${tagColor}44`,
                  borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600, color:tagColor, marginBottom:6 }}>
                  {tagLabel(item.tag)}
                </div>

                <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:6, paddingRight:40 }}>{item.name}</div>

                <ReasonChips reasons={item.reasons}/>

                <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:22, fontWeight:800, color:'#ff6b35' }}>{item.calories}</div>
                    <div style={{ fontSize:10, color:'#6b7280' }}>kcal</div>
                  </div>
                  {[{l:'Protein',v:item.protein,c:'#3b82f6'},{l:'Carbs',v:item.carbs,c:'#f59e0b'},{l:'Fat',v:item.fat,c:'#ef4444'}].map((m) => (
                    <div key={m.l} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:16, fontWeight:700, color:m.c }}>{m.v}g</div>
                      <div style={{ fontSize:10, color:'#6b7280' }}>{m.l}</div>
                    </div>
                  ))}
                </div>

                {/* Action row */}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleFeedback(item.id, 'thumbsup')}
                    style={{ flex:1, padding:'8px 0', borderRadius:10, cursor:'pointer',
                      background: fb==='thumbsup' ? '#14532d' : '#1a1a1a',
                      color: fb==='thumbsup' ? '#22c55e' : '#6b7280',
                      fontWeight:700, fontSize:13, fontFamily:'inherit',
                      border: `1px solid ${fb==='thumbsup' ? '#22c55e' : '#2a2a2a'}` }}>
                    👍
                  </button>
                  <button onClick={() => handleFeedback(item.id, 'thumbsdown')}
                    style={{ flex:1, padding:'8px 0', borderRadius:10, cursor:'pointer',
                      background: fb==='thumbsdown' ? '#2b0d0d' : '#1a1a1a',
                      color: fb==='thumbsdown' ? '#ef4444' : '#6b7280',
                      fontWeight:700, fontSize:13, fontFamily:'inherit',
                      border: `1px solid ${fb==='thumbsdown' ? '#ef4444' : '#2a2a2a'}` }}>
                    👎
                  </button>
                  <button onClick={() => !had && handleHadThis(item)}
                    style={{ flex:2, padding:'8px 0', borderRadius:10, cursor: had ? 'default' : 'pointer',
                      background: had ? '#1a1a10' : '#ff6b3522',
                      color: '#ff6b35',
                      fontWeight:700, fontSize:13, fontFamily:'inherit',
                      border: `1px solid ${had ? '#ff6b35' : '#ff6b3544'}` }}>
                    {had ? '✓ Logged' : 'Had this!'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

          <CheatHistory key={historyKey}/>
        </>
      )}
    </div>
  );
}
