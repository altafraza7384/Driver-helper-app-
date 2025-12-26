
import React, { useState, useEffect } from 'react';
import { CarCheck } from '../types';
import { Plus, Wrench, CheckCircle2, Clock, Trash2, Edit2, ChevronLeft } from 'lucide-react';

const CarCheckPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<CarCheck[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CarCheck>>({ type: 'Maintenance', status: 'Pending', item: '' });

  useEffect(() => {
    const saved = localStorage.getItem('driver_helper_car');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const save = () => {
    if (!form.item) return;
    let updated;
    if (editingId) {
      updated = items.map(i => i.id === editingId ? { ...i, ...form } as CarCheck : i);
    } else {
      const newItem: CarCheck = {
        id: Math.random().toString(36).substring(7),
        item: form.item!,
        type: form.type as any,
        status: form.status as any,
        date: new Date().toISOString(),
        cost: form.cost
      };
      updated = [newItem, ...items];
    }
    setItems(updated);
    localStorage.setItem('driver_helper_car', JSON.stringify(updated));
    close();
  };

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('driver_helper_car', JSON.stringify(updated));
  };

  const close = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ type: 'Maintenance', status: 'Pending', item: '' });
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm"><ChevronLeft size={20}/></button>
        <h2 className="text-2xl font-bold text-slate-800">Car Check</h2>
      </header>

      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Health Score</p>
                <p className="text-3xl font-black text-blue-600">85%</p>
            </div>
            <button 
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
            >
                <Plus size={20} />
            </button>
        </div>

        <div className="space-y-4">
            {items.length > 0 ? items.map(i => (
                <div key={i.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${i.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                            {i.status === 'Completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{i.item}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{i.type} • {new Date(i.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(i.id); setForm(i); setIsAdding(true); }} className="p-1.5 text-slate-300 hover:text-blue-500"><Edit2 size={14} /></button>
                        <button onClick={() => remove(i.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 opacity-30">
                    <Wrench size={48} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">No logs yet</p>
                </div>
            )}
        </div>
      </section>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Log' : 'New Check'}</h3>
            <div className="space-y-4">
              <input 
                placeholder="Check Item (e.g. Engine Oil)" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={form.item}
                onChange={e => setForm({...form, item: e.target.value})}
              />
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value as any})}
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Daily Check">Daily Check</option>
                <option value="Repair">Repair</option>
              </select>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value as any})}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button onClick={close} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                <button onClick={save} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarCheckPage;
