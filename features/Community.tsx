
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, CommunityComment, User } from '../types';
import { db } from '../services/db';
import { Heart, MessageCircle, Share2, MoreHorizontal, Plus, Award, TrendingUp, X, Image as ImageIcon, Mic, Send, Play, Pause, Square, Volume2 } from 'lucide-react';
import { t } from '../constants';

interface Props {
  user: User;
}

const Community: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'nearby' | 'maintenance'>('all');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({});
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postAudio, setPostAudio] = useState<string | null>(null);
  const lang = user.language;
  
  const playbackIntervalRef = useRef<any>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await db.community.getPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!postContent.trim() && !postImage && !postAudio) return;
    const newPost: CommunityPost = { 
      id: Math.random().toString(36).substring(7), 
      author: user.name, 
      content: postContent, 
      category: 'Update', 
      timestamp: Date.now(), 
      likes: 0, 
      likedBy: [], 
      imageUrl: postImage || undefined, 
      audioUrl: postAudio || undefined, 
      comments: [] 
    };
    
    // FIX: Using db.community.savePost since savePosts does not exist on the db service.
    setPosts([newPost, ...posts]);
    await db.community.savePost(newPost);
    
    setIsPosting(false);
    setPostContent('');
    setPostImage(null);
    setPostAudio(null);
  };

  const toggleAudio = (postId: string) => {
    if (playingId === postId) {
      setPlayingId(null); clearInterval(playbackIntervalRef.current);
    } else {
      clearInterval(playbackIntervalRef.current);
      setPlayingId(postId);
      playbackIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => {
          const current = prev[postId] || 0;
          if (current >= 100) { setPlayingId(null); clearInterval(playbackIntervalRef.current); return { ...prev, [postId]: 0 }; }
          return { ...prev, [postId]: current + 2 };
        });
      }, 200);
    }
  };

  return (
    <div className="p-4 space-y-8 md:max-w-3xl md:mx-auto">
      <header className="flex justify-between items-center px-2 pt-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">{t('nav_drivehub', lang)}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">12,403 {t('join_drivers', lang)}</p>
        </div>
        <button onClick={() => setIsPosting(true)} className="bg-blue-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"><Plus size={24} strokeWidth={3}/></button>
      </header>

      <section className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-[3rem] p-8 text-white shadow-2xl flex items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="bg-white/20 p-5 rounded-[1.5rem] backdrop-blur-xl border border-white/30 shadow-inner"><Award size={36} /></div>
        <div className="z-10">
          <h3 className="font-black text-xl uppercase tracking-tighter leading-none">{t('top_driver', lang)}</h3>
          <p className="text-[10px] font-black opacity-90 mt-3 uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block">Suresh Mane • 98% {t('rating', lang)}</p>
        </div>
      </section>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[2.5rem] border border-slate-200/50">
        {(['all', 'nearby', 'maintenance'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[2rem] transition-all ${activeTab === tab ? 'bg-white shadow-xl text-blue-600' : 'text-slate-500'}`}
          >
            {t(tab === 'all' ? 'all_feed' : tab === 'nearby' ? 'nearby' : 'tech_tips', lang)}
          </button>
        ))}
      </div>

      <section className="space-y-8 pb-32">
        {!loading ? posts.map(post => (
          <article key={post.id} className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:border-blue-100 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 border border-slate-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight leading-none">{post.author}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">{post.category}</span>
                    <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700 font-bold leading-relaxed mb-6 px-1">{post.content}</p>
            {post.audioUrl && (
              <div className="mb-6 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                 <button onClick={() => toggleAudio(post.id)} className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all">{playingId === post.id ? <Pause size={20} fill="white" stroke="none" /> : <Play size={20} fill="white" stroke="none" />}</button>
                 <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-linear" style={{ width: `${audioProgress[post.id] || 0}%` }}></div>
                 </div>
              </div>
            )}
            <div className="flex items-center gap-8 pt-6 border-t border-slate-50">
              <button className="flex items-center gap-2.5 text-slate-400 hover:text-red-500 transition-all">
                <Heart size={20} className="group-hover:fill-red-500 transition-all" />
                <span className="text-xs font-black">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2.5 text-slate-400 hover:text-blue-500 transition-all">
                <MessageCircle size={20} />
                <span className="text-xs font-black">{post.comments?.length || 0}</span>
              </button>
              <button className="flex items-center gap-2.5 text-slate-400 ml-auto hover:text-slate-600 transition-all"><Share2 size={20} /></button>
            </div>
          </article>
        )) : (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[3.5rem] h-48 animate-pulse border border-slate-50"></div>
            ))}
          </div>
        )}
      </section>

      {isPosting && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-md rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('create_post', lang)}</h3>
              <button onClick={() => setIsPosting(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><X size={24}/></button>
            </div>
            <textarea autoFocus placeholder="What's on your mind?..." className="w-full min-h-[160px] p-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] focus:border-blue-500 outline-none resize-none text-sm font-bold leading-relaxed transition-all" value={postContent} onChange={e => setPostContent(e.target.value)} />
            <div className="mt-10 flex items-center justify-between">
              <div className="flex gap-4">
                <button className="p-4 bg-slate-50 text-slate-500 rounded-[1.5rem] hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"><ImageIcon size={24}/></button>
                <button className="p-4 bg-slate-50 text-slate-500 rounded-[1.5rem] hover:bg-amber-50 hover:text-amber-600 transition-all border border-slate-100"><Mic size={24}/></button>
              </div>
              <button onClick={handlePost} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3">
                {t('post', lang)} <Send size={20}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
