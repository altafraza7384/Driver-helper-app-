
export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  language: string;
  premium: boolean;
  isAdmin?: boolean;
  subscriptionTier?: 'free' | 'monthly' | 'yearly';
  theme?: 'light' | 'dark';
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'emergency' | 'community' | 'system' | 'alarm';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Alarm {
  id: string;
  type: 'wake' | 'sleep' | 'rest' | 'screentime';
  time: string; // HH:mm
  date?: string; // YYYY-MM-DD
  enabled: boolean;
  label: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingLinks?: GroundingLink[];
}

export interface SOSAlert {
  id: string;
  lat: number;
  lng: number;
  message: string;
  status: 'active' | 'resolved';
  timestamp: number;
}

export interface IncomeRecord {
  id: string;
  date: string;
  source: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface CarCheck {
  id: string;
  type: 'Maintenance' | 'Daily Check' | 'Repair';
  item: string;
  date: string;
  status: 'Completed' | 'Pending';
  cost?: number;
}

export interface HealthLog {
  id: string;
  type: 'Exercise' | 'Water' | 'Sleep' | 'Checkup';
  description: string;
  date: string;
  value?: string;
}

export interface Note {
  id: string;
  content: string;
  audioUrl?: string;
  reminderDate?: string; // ISO string
  timestamp: number;
}

export interface CommunityComment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  category: string;
  timestamp: number;
  likes: number;
  likedBy?: string[]; // user IDs
  imageUrl?: string;
  audioUrl?: string;
  comments?: CommunityComment[];
}

export type ViewType = 'dashboard' | 'income' | 'sos' | 'ai' | 'community' | 'profile' | 'car-check' | 'health' | 'notes' | 'notifications' | 'live-voice' | 'alarms' | 'admin';
