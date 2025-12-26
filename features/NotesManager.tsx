
import React, { useState, useEffect, useRef } from 'react';
import { Note, User } from '../types';
import { Plus, Trash2, Edit2, Mic, Square, Play, Pause, X, Clock, Save, FileText as FileTextIcon } from 'lucide-react';
import { t } from '../constants';

interface Props {
  user: User;
}

const NotesManager: React.FC<Props> = ({ user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [form, setForm] = useState<Partial<Note>>({ content: '', reminderDate: '' });
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({});
  const lang = user.language;
  
  const timerRef = useRef<any>(null);
  const playbackIntervalRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('driver_helper_notes');
    if (saved) setNotes(JSON.parse(saved));
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const save = () => {
    if (!form.content && !form.audioUrl) return;
    let updated;
    if (editingId) {
      updated = notes.map(n => n.id === editingId ? { ...n, ...form } as Note : n);
    } else {
      const newNote: Note = { id: Math.random().toString(36).substring(7), content: form.content || '', audioUrl: form.audioUrl, reminderDate: form.reminderDate, timestamp: Date.now() };
      updated = [newNote, ...notes];
    }
    setNotes(updated);
    localStorage.setItem('driver_helper_notes', JSON.stringify(updated));
    close();
  };

  const remove = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('driver_helper_notes', JSON.stringify(updated));
  };

  const close = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ content: '', reminderDate: '' });
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    if (recordingTime > 1) setForm(prev => ({ ...prev, audioUrl: "mock_blob_url" }));
  };

  const toggleAudio = (noteId: string) => {
    if (playingId === noteId) {
      setPlayingId(null);
      clearInterval(playbackIntervalRef.current);
    } else {
      clearInterval(playbackIntervalRef.current);
      setPlayingId(noteId);
      playbackIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => {
          const current = prev[noteId] || 0;
          if (current >= 100) {
            setPlayingId(null);
            clearInterval(playbackIntervalRef.current);
            return { ...prev, [noteId]: 0 };
          }
          return { ...prev, [noteId]: current + 4 };
        });
      }, 100);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('notes_header', lang)}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{t('notes_sub', lang)}</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-amber-500 text-white p-4 rounded-3xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"><Plus size={24} strokeWidth={3}/></button>
      </header>

      <div className="space-y-4">
        {notes.length > 0 ? notes.map(n => (
          <div key={n.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-xl hover:border-amber-200">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.timestamp).toLocaleDateString()}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingId(n.id); setForm(n); setIsAdding(true); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={16}/></button>
                <button onClick={() => remove(n.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
            {n.content && <p className="text-slate-700 text-sm font-bold leading-relaxed mb-6">{n.content}</p>}
            {n.audioUrl && (
              <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-3xl mb-4 border border-amber-100 shadow-sm">
                <button onClick={() => toggleAudio(n.id)} className="bg-amber-500 text-white p-3 rounded-2xl active:scale-90 transition-all">{playingId === n.id ? <Pause size={18} fill="white" stroke="none" /> : <Play size={18} fill="white" stroke="none" />}</button>
                <div className="flex-1 h-2 bg-amber-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-100 ease-linear rounded-full" style={{ width: `${audioProgress[n.id] || 0}%` }}></div>
                </div>
              </div>
            )}
            {n.reminderDate && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 w-fit">
                <Clock size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">{new Date(n.reminderDate).toLocaleString()}</span>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-24 text-slate-200">
            <FileTextIcon size={64} className="mx-auto mb-6 opacity-50" />
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Add your first note</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{editingId ? t('edit_note', lang) : t('new_note', lang)}</h3>
              <button onClick={close} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <textarea autoFocus className="w-full min-h-[160px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:border-amber-400 outline-none resize-none text-sm font-bold transition-all" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
            <div className={`mt-6 flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border-2 transition-all ${isRecording ? 'border-red-200' : 'border-slate-100'}`}>
              <button onClick={isRecording ? stopRecording : startRecording} className={`p-5 rounded-full shadow-lg transition-all active:scale-90 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 text-amber-600'}`}>{isRecording ? <Square size={24}/> : <Mic size={24}/>}</button>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{isRecording ? `Recording... ${recordingTime}s` : (form.audioUrl ? 'Audio Attached' : 'Record voice note')}</p>
              </div>
            </div>
            <button onClick={save} className="w-full mt-8 py-5 bg-amber-500 text-white font-black rounded-3xl shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all uppercase text-[10px] tracking-widest">{t('save_note', lang)}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManager;
