'use client';
import { useState, useEffect, useRef } from 'react';
import { searchFoods } from '../lib/usda';
import { MEAL_LABELS } from '../lib/constants';

function useDebounce(v, d) {
  const [dv, setDv] = useState(v);
  useEffect(() => { const t = setTimeout(() => setDv(v), d); return () => clearTimeout(t); }, [v, d]);
  return dv;
}

function buildUnits(food) {
  const units = [];
  // Named household serving (e.g. "1 cup", "3 cookies") — shown first
  if (food.householdServing) {
    units.push({ id: 'named', label: food.householdServing, multiplier: () => 1 });
  }
  // Generic serving
  const servingLabel = food.servingLabel && food.servingLabel !== food.householdServing
    ? `serving (${food.servingLabel})`
    : 'serving';
  units.push({ id: 'serving', label: servingLabel, multiplier: () => 1 });
  // Gram and oz options — only if we know the food's weight per serving
  if (food.servingSizeG) {
    units.push({
      id: 'g',
      label: 'grams (g)',
      multiplier: (qty) => qty / food.servingSizeG,
      defaultQty: food.servingSizeG,
    });
    units.push({
      id: 'oz',
      label: 'ounces (oz)',
      multiplier: (qty) => (qty * 28.3495) / food.servingSizeG,
      defaultQty: Math.round((food.servingSizeG / 28.3495) * 10) / 10,
    });
  }
  return units;
}

function ServingPicker({ food, onAdd, onBack }) {
  const units = buildUnits(food);
  const [unitId, setUnitId] = useState(units[0].id);
  const [qty, setQty] = useState(units[0].defaultQty ?? 1);

  const currentUnit = units.find((u) => u.id === unitId) ?? units[0];
  const multiplier = currentUnit.multiplier(qty);
  const s = {
    calories: Math.max(0, Math.round(food.calories * multiplier)),
    protein:  Math.max(0, Math.round(food.protein  * multiplier)),
    carbs:    Math.max(0, Math.round(food.carbs    * multiplier)),
    fat:      Math.max(0, Math.round(food.fat      * multiplier)),
  };

  const step = unitId === 'g' ? 10 : unitId === 'oz' ? 0.5 : 0.25;
  const adj = (d) => setQty((q) => Math.max(step, Math.round((q + d) / step) * step));

  const switchUnit = (id) => {
    const u = units.find((x) => x.id === id);
    setUnitId(id);
    setQty(u.defaultQty ?? 1);
  };

  // Quick-pick presets per unit type
  const presets = unitId === 'g'
    ? [50, 100, 150, 200, 300]
    : unitId === 'oz'
    ? [0.5, 1, 2, 3, 4]
    : [0.5, 1, 1.5, 2, 3];

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {/* Food header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <button onClick={onBack} style={ghostBtn}>‹ Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#fff', lineHeight:1.3 }}>{food.name}</div>
          {food.brand && <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{food.brand}</div>}
        </div>
      </div>

      {/* Per-serving reference */}
      <div style={{ fontSize:12, color:'#6b7280', marginBottom:14 }}>
        Per {food.servingLabel ?? '1 serving'}: {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
      </div>

      {/* Unit selector */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, color:'#9ca3af', fontWeight:500, marginBottom:8 }}>Unit</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {units.map((u) => (
            <button key={u.id} onClick={() => switchUnit(u.id)} style={{
              padding:'7px 14px', borderRadius:10, cursor:'pointer', fontFamily:'inherit',
              fontSize:12, fontWeight:600,
              background: unitId === u.id ? '#ff6b35' : '#1a1a1a',
              color:      unitId === u.id ? '#fff'    : '#9ca3af',
              border:     `1px solid ${unitId === u.id ? '#ff6b35' : '#2a2a2a'}`,
            }}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity input */}
      <div style={{ background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:14, padding:'16px 20px', marginBottom:14 }}>
        <div style={{ fontSize:13, color:'#9ca3af', marginBottom:12, fontWeight:500 }}>Quantity</div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={() => adj(-step)} style={qtyBtn}>−</button>
          <div style={{ flex:1, textAlign:'center' }}>
            <input
              type="number"
              value={qty}
              min={step}
              step={step}
              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setQty(v); }}
              style={{ background:'none', border:'none', color:'#fff', fontSize:32, fontWeight:800,
                textAlign:'center', width:90, outline:'none', fontFamily:'inherit' }}
            />
            <div style={{ fontSize:12, color:'#6b7280' }}>
              {unitId === 'g' ? 'grams' : unitId === 'oz' ? 'oz' : unitId === 'named' ? food.householdServing : 'servings'}
            </div>
          </div>
          <button onClick={() => adj(step)} style={qtyBtn}>+</button>
        </div>
        {/* Presets */}
        <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
          {presets.map((p) => (
            <button key={p} onClick={() => setQty(p)} style={{
              padding:'5px 12px', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
              background: qty === p ? '#ff6b35' : '#2a2a2a',
              color:      qty === p ? '#fff'    : '#9ca3af',
              fontSize:12, fontWeight:600, border:'none',
            }}>
              {unitId === 'g' ? `${p}g` : unitId === 'oz' ? `${p}oz` : `${p}×`}
            </button>
          ))}
        </div>
      </div>

      {/* Nutritional total */}
      <div style={{ background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontSize:13, color:'#9ca3af', marginBottom:12, fontWeight:500 }}>Nutritional total</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:30, fontWeight:800, color:'#ff6b35' }}>{s.calories}</div>
            <div style={{ fontSize:11, color:'#6b7280' }}>kcal</div>
          </div>
          {[{l:'Protein',v:s.protein,c:'#3b82f6'},{l:'Carbs',v:s.carbs,c:'#f59e0b'},{l:'Fat',v:s.fat,c:'#ef4444'}].map((m) => (
            <div key={m.l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:700, color:m.c }}>{m.v}g</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={() => onAdd({ ...food, ...s, servings: qty, unit: currentUnit.label })}>
        + Add to Meal
      </button>
    </div>
  );
}

export default function FoodSearch({ mealType, onAdd, onClose }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [picked, setPicked]   = useState(null);
  const inputRef = useRef(null);
  const dq = useDebounce(query, 500);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (!dq.trim()) { setResults([]); return; }
    setLoading(true); setError(null);
    searchFoods(dq).then(setResults).catch(() => setError('Could not reach food database.')).finally(() => setLoading(false));
  }, [dq]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>{picked ? 'Set Serving Size' : 'Add Food'}</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>Adding to {MEAL_LABELS[mealType]} · USDA database</div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#9ca3af', fontSize:22, cursor:'pointer', padding:4 }}>✕</button>
          </div>
          {!picked && <input ref={inputRef} className="input" placeholder="Search e.g. chicken breast, oats..." value={query} onChange={(e) => setQuery(e.target.value)}/>}
        </div>
        <div className="modal-body">
          {picked ? (
            <ServingPicker food={picked} onAdd={(f) => { onAdd(f); setPicked(null); }} onBack={() => setPicked(null)}/>
          ) : (
            <>
              {loading && <div style={{ textAlign:'center', padding:'24px 0' }}><div className="spinner"/><div style={{ color:'#9ca3af', fontSize:13, marginTop:10 }}>Searching...</div></div>}
              {error && <div style={{ color:'#ef4444', fontSize:13, textAlign:'center', padding:'16px 0' }}>{error}</div>}
              {!loading && !error && results.length === 0 && query && <div style={{ color:'#9ca3af', fontSize:13, textAlign:'center', padding:'24px 0' }}>No results for "{query}"</div>}
              {!loading && !query && <div style={{ color:'#6b7280', fontSize:13, textAlign:'center', padding:'24px 0' }}>Search 300,000+ foods from the USDA database</div>}
              {results.map((food) => (
                <button key={food.id} onClick={() => setPicked(food)}
                  style={{ display:'block', width:'100%', background:'none', border:'1px solid #2a2a2a',
                    borderRadius:12, padding:'12px 14px', marginBottom:8, cursor:'pointer', textAlign:'left', color:'#fff', fontFamily:'inherit' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor='#ff6b35'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor='#2a2a2a'}>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{food.name}</div>
                  {food.brand && <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>{food.brand}</div>}
                  <div style={{ fontSize:12, color:'#9ca3af', display:'flex', gap:12 }}>
                    <span style={{ color:'#ff6b35', fontWeight:700 }}>{food.calories} kcal</span>
                    <span>P {food.protein}g</span><span>C {food.carbs}g</span><span>F {food.fat}g</span>
                    {food.servingLabel && <span style={{ color:'#4b5563' }}>/ {food.servingLabel}</span>}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ghostBtn = { background:'none', border:'none', color:'#ff6b35', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', padding:0 };
const qtyBtn   = { width:44, height:44, borderRadius:12, border:'1px solid #2a2a2a', background:'#1a1a1a', color:'#fff', fontSize:22, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center' };
