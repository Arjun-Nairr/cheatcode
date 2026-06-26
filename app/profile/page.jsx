'use client';
import { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../../lib/storage';
import { ACTIVITY_MULTIPLIERS, calculateDailyCalories, calculateMacros } from '../../lib/constants';

const ACTIVITY_LABELS = {
  sedentary:   'Sedentary (desk job, no exercise)',
  light:       'Light (1–3× / week)',
  moderate:    'Moderate (3–5× / week)',
  active:      'Active (6–7× / week)',
  very_active: 'Very active (2× per day)',
};
const GOAL_LABELS = {
  lose:     'Lose weight',
  maintain: 'Maintain',
  gain:     'Gain muscle',
};

export default function Profile() {
  const [form, setForm]     = useState(null);
  const [saved, setSaved]   = useState(false);

  useEffect(() => { setForm(getUserProfile()); }, []);

  if (!form) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    saveUserProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dailyCal = calculateDailyCalories(form);
  const macros   = calculateMacros(dailyCal, form.weight);

  return (
    <div className="page-scroll">
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:800, color:'#fff' }}>Profile ⚙️</div>
        <div style={{ fontSize:13, color:'#9ca3af', marginTop:2 }}>Your stats power the calorie calculator</div>
      </div>

      {/* Summary card */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, color:'#9ca3af', fontWeight:500, marginBottom:6 }}>Daily targets based on your stats</div>
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:36, fontWeight:800, color:'#ff6b35', lineHeight:1 }}>{dailyCal}</div>
            <div style={{ fontSize:11, color:'#6b7280' }}>kcal / day</div>
          </div>
          {[{l:'Protein',v:macros.protein,c:'#3b82f6'},{l:'Carbs',v:macros.carbs,c:'#f59e0b'},{l:'Fat',v:macros.fat,c:'#ef4444'}].map((m) => (
            <div key={m.l}>
              <div style={{ fontSize:22, fontWeight:700, color:m.c }}>{m.v}g</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:14 }}>Personal Info</div>

        <div style={row}>
          <label style={lbl}>Name</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name"/>
        </div>
        <div style={row}>
          <label style={lbl}>Age</label>
          <input className="input" type="number" min="10" max="100" value={form.age}
            onChange={(e) => set('age', +e.target.value)} onFocus={(e) => e.target.select()} placeholder="18"/>
        </div>
        <div style={row}>
          <label style={lbl}>Gender</label>
          <div style={{ display:'flex', gap:8 }}>
            {['male','female'].map((g) => (
              <button key={g} onClick={() => set('gender', g)} style={{
                flex:1, padding:'10px 0', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit',
                background: form.gender===g ? '#ff6b35' : '#1a1a1a',
                color: form.gender===g ? '#fff' : '#9ca3af', fontWeight:600, fontSize:13,
                border: `1px solid ${form.gender===g ? '#ff6b35' : '#2a2a2a'}` }}>
                {g.charAt(0).toUpperCase()+g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={row}>
          <label style={lbl}>Height (cm)</label>
          <input className="input" type="number" min="100" max="250" value={form.height}
            onChange={(e) => set('height', +e.target.value)} onFocus={(e) => e.target.select()}/>
        </div>
        <div style={row}>
          <label style={lbl}>Weight (kg)</label>
          <input className="input" type="number" min="30" max="300" value={form.weight}
            onChange={(e) => set('weight', +e.target.value)} onFocus={(e) => e.target.select()}/>
        </div>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:14 }}>Goal</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {Object.entries(GOAL_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => set('goal', key)} style={{
              padding:'12px 16px', borderRadius:12, border:'none', cursor:'pointer',
              background: form.goal===key ? '#1a1a10' : '#1a1a1a',
              color: form.goal===key ? '#ff6b35' : '#9ca3af', fontWeight:600, fontSize:13,
              textAlign:'left', fontFamily:'inherit',
              border: `1px solid ${form.goal===key ? '#ff6b35' : '#2a2a2a'}` }}>
              {form.goal===key ? '● ' : '○ '}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:14 }}>Activity Level</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => set('activityLevel', key)} style={{
              padding:'12px 16px', borderRadius:12, border:'none', cursor:'pointer',
              background: form.activityLevel===key ? '#1a1a10' : '#1a1a1a',
              color: form.activityLevel===key ? '#ff6b35' : '#9ca3af', fontWeight:600, fontSize:13,
              textAlign:'left', fontFamily:'inherit',
              border: `1px solid ${form.activityLevel===key ? '#ff6b35' : '#2a2a2a'}` }}>
              {form.activityLevel===key ? '● ' : '○ '}{label}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave}
        style={{ background: saved ? '#22c55e' : '#ff6b35' }}>
        {saved ? '✓ Saved!' : 'Save Profile'}
      </button>
    </div>
  );
}

const row = { marginBottom:12 };
const lbl = { display:'block', fontSize:12, color:'#9ca3af', fontWeight:500, marginBottom:6 };
