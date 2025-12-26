
import React, { useState, useEffect } from 'react';
import { Alarm, User } from '../types';
import { t } from '../constants';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Clock, 
  Bell, 
  Moon, 
  Sun, 
  Coffee, 
  Smartphone,
  X,
  Check
} from 'lucide-react';

interface Props {
  user: User;
  onBack: () => void;
}

const AlarmManager: React.FC<Props> = ({ user, onBack }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlarm, setNewAlarm] = useState<Partial<Alarm>>({
    type: 'wake',
    time: '08:00',
    enabled: true,
    label: ''
  });
  const lang = user.language;

  useEffect(() => {
    const saved = localStorage.getItem('driver_helper_alarms');
    if (saved) setAlarms(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('driver_helper_alarms', JSON.stringify(alarms));
  }, [alarms]);

  const addAlarm = () => {
    const alarm: Alarm = {
      id: Math.random().toString(36).substring(7),
      type: newAlarm.type as any,
      time: newAlarm.time!,
      date: newAlarm.date,
      enabled: true,
      label: newAlarm.label || t(newAlarm.type!, lang)
    };
    setAlarms([...alarms, alarm]);
    setIsAdding(false);
    setNewAlarm({ type: 'wake', time: '08:00', enabled: true, label: '' });
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const getTypeIcon = (type: Alarm['type']) => {
    switch (type) {
      case 'wake': return <Sun size={20} className="text-amber-500" />;
      case 'sleep': return <Moon size={20} className="text-indigo-500" />;
      case 'rest': return <Coffee size={20} className="text-emerald-500" />;
      case 'screentime': return <Smartphone size={20} className="text-rose-500" />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <div className="p-4 space-y-6 md:p-8 md:max-w-3xl md:mx-auto min-h-screen bg-[#fcfdfe]">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm transition-all active:scale-90">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('alarms', lang)}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Manage your routines</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {alarms.length > 0 ? alarms.map(alarm => (
          <div key={alarm.id} className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md ${!alarm.enabled && 'opacity-60'}`}>
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl bg-slate-50`}>
                {getTypeIcon(alarm.type)}
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{alarm.time}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alarm.label}</span>
                  {alarm.date && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{alarm.date}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleAlarm(alarm.id)}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${alarm.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${alarm.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
              <button 
                onClick={() => deleteAlarm(alarm.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-300">
            <Clock size={64} className="mb-4 opacity-20" />
            <p className="font-black text-[10px] uppercase tracking-widest">No alarms set yet.</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 border-4 border-white"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* Add Alarm Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{t('add_alarm', lang)}</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-2">
                {(['wake', 'sleep', 'rest', 'screentime'] as const).map(type => (
                  <button 
                    key={type}
                    onClick={() => setNewAlarm({...newAlarm, type})}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${newAlarm.type === type ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-md' : 'bg-slate-50 border-transparent text-slate-400'}`}
                  >
                    {getTypeIcon(type)}
                    <span className="text-[7px] font-black uppercase tracking-tighter mt-2">{t(type === 'wake' ? 'wake_up' : type === 'sleep' ? 'sleep_time' : type === 'rest' ? 'rest_break' : 'screen_time', lang)}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Time</label>
                <input 
                  type="time" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-xl font-black tabular-nums transition-all"
                  value={newAlarm.time}
                  onChange={e => setNewAlarm({...newAlarm, time: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold transition-all"
                  value={newAlarm.date || ''}
                  onChange={e => setNewAlarm({...newAlarm, date: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Label</label>
                <input 
                  type="text" 
                  placeholder="Custom label..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold transition-all"
                  value={newAlarm.label}
                  onChange={e => setNewAlarm({...newAlarm, label: e.target.value})}
                />
              </div>

              <button 
                onClick={addAlarm}
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                {t('save', lang)} <Check size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmManager;
