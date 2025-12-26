
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { ChevronLeft, Star, Mic, AlertCircle, X, Square, Send, Volume2 } from 'lucide-react';
import { t } from '../constants';

interface Driver {
  id: string;
  name: string;
  rating: number;
  distance: number;
  time: string;
  avatar: string;
  status: 'online' | 'offline';
  offset: { x: number; y: number };
}

interface Props {
  user: User;
  onBack?: () => void;
}

const INITIAL_DRIVERS: Driver[] = [
  { id: '1', name: 'Suresh Verma', rating: 4.5, distance: 1.5, time: '5 MIN AWAY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh', status: 'online', offset: { x: 30, y: 25 } },
  { id: '2', name: 'Manoj Gupta', rating: 4.7, distance: 1.9, time: '7 MIN AWAY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manoj', status: 'online', offset: { x: 65, y: 35 } },
  { id: '3', name: 'Amit Singh', rating: 4.8, distance: 1.2, time: '3 MIN AWAY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit', status: 'online', offset: { x: 80, y: 20 } },
  { id: '4', name: 'Ravi Kumar', rating: 4.9, distance: 0.8, time: '2 MIN AWAY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi', status: 'online', offset: { x: 25, y: 80 } },
];

const SOSHub: React.FC<Props> = ({ user, onBack }) => {
  const [isAlerting, setIsAlerting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [showToast, setShowToast] = useState<string | null>(null);
  const lang = user.language;

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setLocation({ lat: 28.6139, lng: 77.2090 })
      );
    }

    const moveInterval = setInterval(() => {
      setDrivers(prev => prev.map(d => ({
        ...d,
        offset: { x: d.offset.x + (Math.random() - 0.5) * 0.5, y: d.offset.y + (Math.random() - 0.5) * 0.5 },
        distance: Math.max(0.1, d.distance + (Math.random() - 0.5) * 0.05)
      })));
    }, 3000);

    let alertTimer: any;
    if (isAlerting && countdown > 0) {
      alertTimer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }

    return () => {
      clearInterval(moveInterval);
      clearInterval(alertTimer);
    };
  }, [isAlerting, countdown]);

  const handleSOSClick = () => {
    setIsAlerting(true);
    setCountdown(5);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecordingAndSend = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    setShowToast("Emergency Voice Alert Broadcasted!");
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#fcfdfe] overflow-hidden">
      <div className="bg-[#2a68f0] px-5 py-5 flex items-center gap-6 shadow-xl z-10">
        <button onClick={onBack} className="text-white hover:bg-white/10 p-2 rounded-2xl transition-all active:scale-90">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-black text-white tracking-widest uppercase">{t('sos_hub', lang)}</h1>
      </div>

      <div className="relative h-72 w-full bg-slate-100 overflow-hidden shadow-inner border-b border-slate-200">
        {location ? (
          <iframe title="Map" width="100%" height="100%" style={{ border: 0 }} src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`} loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Gps Status: Searching...</p>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none">
          {drivers.map(d => (
            <div key={d.id} className="absolute transition-all duration-[3000ms] ease-linear" style={{ top: `${d.offset.y}%`, left: `${d.offset.x}%` }}>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Live: Connected</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-32 overflow-y-auto no-scrollbar bg-slate-50/50">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('connected_drivers', lang)}</h2>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
            {drivers.length} {t('responsive', lang)}
          </span>
        </div>

        <div className="space-y-4">
          {drivers.sort((a, b) => a.distance - b.distance).map((driver) => (
            <div key={driver.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-100">
                    <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base leading-none uppercase tracking-tight">{driver.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-600">{driver.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 leading-none">{driver.distance.toFixed(1)} km</p>
                <p className="text-[9px] font-black text-blue-500 mt-2 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block">{driver.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isRecording && (
        <div className="fixed inset-0 bg-blue-600/95 backdrop-blur-2xl z-[150] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
          <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center border-[12px] border-white/30 animate-pulse mb-12">
            <Mic size={80} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{t('recording_alert', lang)}</h2>
          <p className="text-white/80 font-black text-6xl mb-12 tabular-nums">{recordingTime}s</p>
          <div className="flex gap-4">
            <button onClick={() => setIsRecording(false)} className="bg-white/10 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs border border-white/20">{t('cancel', lang)}</button>
            <button onClick={stopRecordingAndSend} className="bg-white text-blue-600 px-12 py-5 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center gap-2">{t('broadcast', lang)} <Send size={20}/></button>
          </div>
        </div>
      )}

      {!isAlerting ? (
        <div className="fixed bottom-24 left-0 right-0 px-8 flex justify-between items-center z-50 max-w-4xl mx-auto">
          <button onClick={handleSOSClick} className="w-24 h-24 bg-red-600 text-white rounded-[2.5rem] shadow-2xl shadow-red-600/40 flex items-center justify-center font-black text-2xl tracking-tighter hover:scale-105 active:scale-95 transition-all border-[10px] border-white/10">SOS</button>
          <button onClick={startRecording} className="w-20 h-20 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[8px] border-white relative group">
            <Mic size={32} strokeWidth={3} />
            <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">{t('voice_alert', lang)}</div>
          </button>
        </div>
      ) : (
        <div className="fixed inset-0 bg-red-600 z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center border-[20px] border-white/30 animate-pulse mb-12">
            <span className="text-9xl font-black text-white tracking-tighter">{countdown}</span>
          </div>
          <h2 className="text-4xl font-black text-white uppercase mb-4 tracking-tighter text-center">{t('emergency_signal', lang)}</h2>
          <button onClick={() => setIsAlerting(false)} className="bg-white text-red-600 px-16 py-6 rounded-[2.5rem] font-black uppercase text-lg shadow-2xl active:scale-95 transition-all">{t('cancel', lang)}</button>
        </div>
      )}
    </div>
  );
};

export default SOSHub;
