
import React, { useState, useEffect } from 'react';
import { IncomeRecord, User } from '../types';
import { db } from '../services/db';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Minus, Download, Tag, Info, Trash2, Edit2, X, Settings2, Wallet } from 'lucide-react';
import { INCOME_CATEGORIES as DEFAULT_INCOME, EXPENSE_CATEGORIES as DEFAULT_EXPENSE, t } from '../constants';

interface Props {
  user: User;
}

const IncomeTracker: React.FC<Props> = ({ user }) => {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, savings: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const lang = user.language;
  
  const [newRecord, setNewRecord] = useState<Partial<IncomeRecord>>({
    type: 'income',
    amount: 0,
    source: '',
    category: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [allRecords, stats] = await Promise.all([
      db.income.getAll(),
      db.income.getSummary()
    ]);
    setRecords(allRecords);
    setSummary(stats);
    setLoading(false);
  };

  const saveRecord = async () => {
    if (!newRecord.amount || !newRecord.source) return;
    
    // Create the individual record object to save.
    const record: IncomeRecord = {
      id: editingId || Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      source: newRecord.source!,
      amount: Number(newRecord.amount),
      type: newRecord.type as 'income' | 'expense',
      category: newRecord.category || (newRecord.type === 'income' ? DEFAULT_INCOME[0] : DEFAULT_EXPENSE[0])
    };
    
    // FIX: Using db.income.saveRecord since saveAll does not exist on the db service.
    await db.income.saveRecord(record);
    await fetchData();
    closeModal();
  };

  const deleteRecord = async (id: string) => {
    // FIX: Using db.income.deleteRecord since saveAll does not exist on the db service.
    await db.income.deleteRecord(id);
    await fetchData();
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewRecord({ type: 'income', amount: 0, source: '', category: '' });
  };

  const chartData = [
    { name: 'Mon', value: 1200 }, { name: 'Tue', value: 900 }, { name: 'Wed', value: 1600 },
    { name: 'Thu', value: 1100 }, { name: 'Fri', value: 2100 }, { name: 'Sat', value: 2400 },
    { name: 'Sun', value: 1800 },
  ];

  return (
    <div className="p-4 space-y-6 md:p-8">
      <header className="flex justify-between items-center px-2 pt-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{t('nav_earnings', lang)}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Manage your road wealth</p>
        </div>
        <div className="flex gap-2">
          <button className="p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm text-slate-500 hover:text-blue-600 transition-all active:scale-95">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* Savings Goal Card */}
      <section className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Net Savings</p>
            <p className="text-4xl font-black tracking-tighter text-emerald-400">₹{summary.savings.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
            <Wallet size={24} className="text-blue-400" />
          </div>
        </div>
      </section>

      {/* Chart Summary */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('weekly_total', lang)}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{summary.income.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              On Track
            </span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? '#2563eb' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Main Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setIsAdding(true); setNewRecord({ type: 'income', category: DEFAULT_INCOME[0] }); }}
          className="bg-emerald-600 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-emerald-600/20 flex flex-col items-center gap-3 active:scale-[0.98] transition-all uppercase text-[10px] tracking-widest border-4 border-white"
        >
          <div className="bg-white/20 p-2 rounded-xl"><Plus size={24} strokeWidth={3} /></div>
          <span>{t('add_income', lang)}</span>
        </button>
        <button 
          onClick={() => { setIsAdding(true); setNewRecord({ type: 'expense', category: DEFAULT_EXPENSE[0] }); }}
          className="bg-rose-500 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-rose-500/20 flex flex-col items-center gap-3 active:scale-[0.98] transition-all uppercase text-[10px] tracking-widest border-4 border-white"
        >
          <div className="bg-white/20 p-2 rounded-xl"><Minus size={24} strokeWidth={3} /></div>
          <span>{t('add_expense', lang)}</span>
        </button>
      </div>

      {/* Recent List */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm pb-10">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{t('history', lang)}</h3>
        <div className="space-y-6">
          {!loading ? (
            records.length > 0 ? (
              records.map(r => (
                <div key={r.id} className="group relative flex justify-between items-center border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${r.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      <Tag size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{r.source}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{r.category}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingId(r.id); setNewRecord({...r}); setIsAdding(true); }} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deleteRecord(r.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <span className={`text-sm font-black tracking-tighter ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.type === 'income' ? '+' : '-'} ₹{r.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <Info className="text-slate-300 mx-auto mb-4" size={32} />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No transactions logged</p>
              </div>
            )) : (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-3xl"></div>)}
              </div>
            )
          }
        </div>
      </section>

      {/* Modal Overlay for Logging */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                {editingId ? <Edit2 size={24} className="text-blue-500" /> : (newRecord.type === 'income' ? <Plus className="text-emerald-500" strokeWidth={3} /> : <Minus className="text-rose-500" strokeWidth={3} />)}
                {editingId ? t('edit', lang) : (newRecord.type === 'income' ? t('add_income', lang) : t('add_expense', lang))}
              </h3>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">{t('source_name', lang)}</label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-500 outline-none text-sm font-black uppercase tracking-widest"
                  value={newRecord.source}
                  onChange={e => setNewRecord({...newRecord, source: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">{t('amount', lang)} (₹)</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-500 outline-none text-xl font-black tabular-nums"
                  value={newRecord.amount || ''}
                  onChange={e => setNewRecord({...newRecord, amount: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">{t('category', lang)}</label>
                <select 
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-500 outline-none text-xs font-black uppercase tracking-widest appearance-none"
                  value={newRecord.category}
                  onChange={e => setNewRecord({...newRecord, category: e.target.value})}
                >
                  {(newRecord.type === 'income' ? DEFAULT_INCOME : DEFAULT_EXPENSE).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button onClick={saveRecord} className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-slate-900/30 border-4 border-white/5">{t('save', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeTracker;
