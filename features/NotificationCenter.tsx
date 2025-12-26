import React from 'react';
import { AppNotification } from '../types';
import { 
  Bell, 
  ChevronLeft, 
  AlertCircle, 
  Clock, 
  Users, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  X,
  ChevronRight
} from 'lucide-react';

interface Props {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkRead: () => void;
  onDelete: (id: string) => void;
}

const NotificationCenter: React.FC<Props> = ({ notifications, onBack, onMarkRead, onDelete }) => {
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'emergency': return <AlertCircle className="text-red-500" size={20} />;
      case 'reminder': return <Clock className="text-amber-500" size={20} />;
      case 'community': return <Users className="text-blue-500" size={20} />;
      case 'system': return <Settings className="text-slate-400" size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getBgColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'emergency': return 'bg-red-50';
      case 'reminder': return 'bg-amber-50';
      case 'community': return 'bg-blue-50';
      case 'system': return 'bg-slate-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Notifications</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stay updated with your world</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={onMarkRead}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 active:scale-95 transition-all"
          >
            Read All
          </button>
        )}
      </header>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`group relative p-4 rounded-[1.5rem] border border-slate-100 transition-all flex gap-4 ${n.read ? 'bg-white' : 'bg-white shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getBgColor(n.type)}`}>
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm font-black tracking-tight mb-0.5 ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap ml-2">
                    {getTimeAgo(n.timestamp)}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-500 font-medium' : 'text-slate-700 font-bold'}`}>
                  {n.message}
                </p>
                {!n.read && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">New</span>
                  </div>
                )}
              </div>

              {/* Action Overlay (Desktop hover / Mobile swipe mock) */}
              <button 
                onClick={() => onDelete(n.id)}
                className="absolute right-4 bottom-4 p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <div className="bg-slate-100 p-8 rounded-full mb-6">
              <Bell size={64} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">All caught up!</h3>
            <p className="text-sm font-bold text-slate-500 max-w-[200px] mt-2">No new notifications to show right now.</p>
          </div>
        )}
      </div>

      {/* Quick Settings Banner */}
      <div className="p-4 bg-white border-t border-slate-50">
        <div className="bg-slate-900 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Settings size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-400">Settings</p>
              <p className="text-[10px] text-slate-300 font-medium">Manage alert preferences</p>
            </div>
          </div>
          {/* Fixed: ChevronRight is now imported from lucide-react */}
          <ChevronRight size={20} className="text-slate-500" />
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;