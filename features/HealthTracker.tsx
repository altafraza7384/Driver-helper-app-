
import React, { useState, useEffect } from 'react';
import { HealthLog } from '../types';
import { Plus, Heart, Trash2, Edit2, ChevronLeft, Droplets, Activity, Moon } from 'lucide-react';

const HealthTracker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<HealthLog>>({ type: 'Exercise', description: '' });

  useEffect(() => {
    const saved = localStorage.getItem('driver_helper_health');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  const save = () => {
    if (!form.description) return;
    let updated;
    if (editingId) {
      updated = logs.map(l => l.id === editingId ? { ...l, ...form } as HealthLog : l);
    } else {
      const newLog: HealthLog = {
        id: Math.random().toString(36).substring(7),
        description: form.description!,
        type: form.type as any,
        date: new Date().toISOString(),
        value: form.value
      };
      updated = [newLog, ...logs];
    }
    setLogs(updated);
    localStorage.setItem('driver_helper_health', JSON.stringify(updated));
    close();
  };

  const remove = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    localStorage.setItem('driver_helper_health', JSON.stringify(updated));
  };

  const close = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ type: 'Exercise', description: '' });
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'Water': return <Droplets size={18}/>;
        case 'Sleep': return <Moon size={18}/>;
        case 'Exercise': return <Activity size={18}/>;
        default: return <Heart size={18}/>;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm"><ChevronLeft size={20}/></button>
        <h2 className="text-2xl font-bold text-slate-800">Health Log</h2>
      </header>

      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Driver Vitality</p>
                <p className="text-3xl font-black text-rose-500">Good</p>
            </div>
            <button 
                onClick={() => setIsAdding(true)}
                className="bg-rose-500 text-white p-3 rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
            >
                <Plus size={20} />
            </button>
        </div>

        <div className="space-y-4">
            {logs.length > 0 ? logs.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-rose-50 text-rose-500`}>
                            {getIcon(l.type)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{l.description}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{l.type} • {l.value || 'Logged'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(l.id); setForm(l); setIsAdding(true); }} className="p-1.5 text-slate-300 hover:text-rose-500"><Edit2 size={14} /></button>
                        <button onClick={() => remove(l.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 opacity-30">
                    <Heart size={48} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">No logs yet</p>
                </div>
            )}
        </div>
      </section>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Log' : 'Add Log'}</h3>
            <div className="space-y-4">
              <input 
                placeholder="Description (e.g. Morning stretch)" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value as any})}
              >
                <option value="Exercise">Exercise</option>
                <option value="Water">Water</option>
                <option value="Sleep">Sleep</option>
                <option value="Checkup">Checkup</option>
              </select>
              <input 
                placeholder="Value (e.g. 2 Liters, 8 Hours)" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={form.value || ''}
                onChange={e => setForm({...form, value: e.target.value})}
              />
              <div className="flex gap-3 pt-4">
                <button onClick={close} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                <button onClick={save} className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-xl shadow-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTracker;
