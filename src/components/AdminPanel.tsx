/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, Phone, Search, Activity, 
  CheckCircle2, XCircle, Trash2, Printer, Key, ShieldAlert, Check, 
  Copy, Database, RefreshCw, ChevronDown, Lock, ChevronUp, AlertCircle,
  MessageSquare, Send, HeartPulse
} from 'lucide-react';
import { Appointment } from '../types';

interface AdminPanelProps {
  onCancelAppointment: (id: string) => void;
  appointments: Appointment[];
  onRefresh: () => void;
}

export default function AdminPanel({ onCancelAppointment, appointments, onRefresh }: AdminPanelProps) {
  // Authentication & initialization states
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  
  // Dashboard & search/filter states
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'ledger' | 'chat'>('ledger');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [adminReplyInput, setAdminReplyInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [showSqlHelper, setShowSqlHelper] = useState<boolean>(true);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Check login session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('shifa_admin_session');
    if (savedSession) {
      setIsAdminLoggedIn(true);
    }
    checkAdminStatus();
  }, []);

  // Poll admin chat messages
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const fetchAllChats = async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (err) {
        console.warn("Could not download admin chats list:", err);
      }
    };

    fetchAllChats();

    const interval = setInterval(fetchAllChats, 3000);
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  // Scroll to bottom of chat when messages change or session changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedSessionId, activeAdminSubTab]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/status');
      const data = await res.json();
      setIsInitialized(data.initialized);
    } catch (e) {
      console.error("Failed to check admin initialize status", e);
      setIsInitialized(true); // Fallback to login box
    }
  };

  const handleInitializePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPasswordInput.trim()) {
      setErrorMsg('Password cannot be blank.');
      return;
    }

    try {
      const res = await fetch('/api/admin/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPasswordInput.trim() })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessMsg('Admin password set up successfully! You can now log in.');
        setIsInitialized(true);
        setAdminPasswordInput(newPasswordInput.trim());
        setNewPasswordInput('');
      } else {
        setErrorMsg(data.error || 'Failed to initialize password.');
      }
    } catch (e) {
      setErrorMsg('Network error while saving admin password.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminPasswordInput.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('shifa_admin_session', data.token);
        setIsAdminLoggedIn(true);
        onRefresh(); // Get latest appointments
      } else {
        setErrorMsg(data.error || 'Incorrect Admin Password.');
      }
    } catch (e) {
      setErrorMsg('Failed to connect to backend.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('shifa_admin_session');
    setIsAdminLoggedIn(false);
    setAdminPasswordInput('');
  };

  // SQL schema generator text
  const sqlSchemaText = `-- INSTRUCTIONS: Go to your Supabase Console -> SQL Editor -> New Query.
-- Paste the code below and click "Run" to create your tables.

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  token_number TEXT,
  tokenNumber TEXT,
  patient_name TEXT,
  patientName TEXT,
  patient_age INTEGER,
  patientAge INTEGER,
  patient_gender TEXT,
  patientGender TEXT,
  patient_phone TEXT,
  patientPhone TEXT,
  patient_email TEXT,
  patientEmail TEXT,
  appointment_date TEXT,
  appointmentDate TEXT,
  appointment_time TEXT,
  appointmentTime TEXT,
  symptoms TEXT,
  status TEXT,
  doctor TEXT, -- JSON representation of doctor object
  branch TEXT, -- JSON representation of branch object
  created_at TEXT,
  createdAt TEXT
);

-- OPTIONAL Settings table (for persistent backend admin password)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Support Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  sender TEXT, -- 'patient' or 'admin'
  patient_session_id TEXT,
  patientSessionId TEXT,
  patient_name TEXT,
  patientName TEXT,
  message TEXT,
  created_at TEXT,
  createdAt TEXT
);

-- Enable general table accessibility configs
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON appointments FOR DELETE USING (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Chat Read Access" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public Chat Insert Access" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Chat Update Access" ON chat_messages FOR UPDATE USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  // Derived filter options
  const uniqueDoctors = Array.from(new Set(appointments.map(apt => apt.doctor?.name).filter(Boolean)));
  const uniqueBranches = Array.from(new Set(appointments.map(apt => apt.branch?.name).filter(Boolean)));

  // Filter logic
  const filteredApts = appointments.filter(apt => {
    const matchesSearch = 
      (apt.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.tokenNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.patientPhone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.doctor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.symptoms || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'All' || apt.doctor?.name === doctorFilter;
    const matchesBranch = branchFilter === 'All' || apt.branch?.name === branchFilter;

    return matchesSearch && matchesStatus && matchesDoctor && matchesBranch;
  });

  // KPI calculations
  const totalRegistrations = filteredApts.length;
  const activeConfirmed = filteredApts.filter(a => a.status === 'Confirmed').length;
  const cancelledSlips = filteredApts.filter(a => a.status === 'Cancelled').length;
  const totalFees = filteredApts
    .filter(a => a.status !== 'Cancelled')
    .reduce((sum, a) => sum + (a.doctor?.fees || 0), 0);

  // Trigger cancel with loading helper
  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this registration?")) {
      setIsLoading(true);
      await onCancelAppointment(id);
      setIsLoading(false);
    }
  };

  const handleAdminSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyInput.trim() || !selectedSessionId) return;

    // Find the current session messages to identify the correct patient's name
    const sessionMessages = chatMessages.filter(m => m.patientSessionId === selectedSessionId);
    const patientName = sessionMessages[0]?.patientName || "Anonymous Patient";

    const replyMsg = {
      id: 'msg-admin-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
      sender: 'admin' as const,
      patientSessionId: selectedSessionId,
      patientName: patientName,
      message: adminReplyInput.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistic state
    setChatMessages(prev => [...prev, replyMsg]);
    setAdminReplyInput('');

    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyMsg)
      });
    } catch (err) {
      console.warn("Admin reply sync error:", err);
    }
  };

  // Render initialization state (Set Password)
  if (isInitialized === false && !isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-zinc-200 shadow-xl p-8 space-y-6 text-zinc-900 font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 text-black rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-200 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-sans font-extrabold text-xl text-black">Set Staff Password</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Welcome! As the clinic manager, please define an authorized staff access password to save secure clinic records.
          </p>
        </div>

        {/* Worker-only Prominent Warning Banner */}
        <div className="p-4 bg-zinc-900 border-l-4 border-black text-white rounded-2xl text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-extrabold tracking-wider text-[10px] uppercase font-mono text-zinc-200">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>⚠️ Strictly Restricted!</span>
          </div>
          <p className="font-sans font-bold text-[13px] leading-snug">
            ONLY FOR WORKER - NO PUBLIC USER
          </p>
          <p className="text-[10px] text-zinc-300 leading-normal">
            यह पेज सिर्फ अस्पताल कर्मचारियों (Staff/Doctors) के उपयोग के लिए है। आम मरीज़ कृपया बैक बटन दबाएं।
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 text-red-600 rounded-2xl text-xs flex gap-2 items-center font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleInitializePassword} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">Specify Admin Password</label>
            <input 
              type="password"
              placeholder="e.g. shifacare2026"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-300 outline-none focus:border-black transition-all font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs rounded-full cursor-pointer transition shadow-sm uppercase tracking-wider"
          >
            Save Security Credentials & Login
          </button>
        </form>
      </div>
    );
  }

  // Render Login state
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-zinc-200 shadow-xl p-8 space-y-6 text-zinc-900 font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 text-black rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-200">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="font-sans font-extrabold text-xl text-black">Staff Workplace Sign In</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Enter the clinical management password to synchronize appointments and chat feeds.
          </p>
        </div>

        {/* Worker-only Prominent Warning Banner */}
        <div className="p-4 bg-zinc-950 border-l-4 border-black text-white rounded-2xl text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-extrabold tracking-wider text-[10px] uppercase font-mono text-zinc-300">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>⚠️ STRICTLY RESTRICTED</span>
          </div>
          <p className="font-sans font-bold text-[13.5px] leading-snug tracking-wide text-white uppercase">
            ONLY FOR WORKER - NO PUBLIC USER
          </p>
          <p className="text-[10px] text-zinc-400 leading-normal font-medium">
            यह पेज सिर्फ स्वास्थ्य कर्मचारियों के लिए है, आम जनता या मरीजों के ठहरने के लिए नहीं है।
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl text-xs flex gap-2 items-center font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-zinc-900" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-zinc-55 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex gap-2 items-center font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 font-sans">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">Staff Code Password</label>
            <input 
              type="password"
              placeholder="••••••••••••••••"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black transition-all font-mono placeholder:text-zinc-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs rounded-full cursor-pointer transition shadow-sm uppercase tracking-wider"
          >
            Access Staff Panel
          </button>
        </form>

        <div className="border-t border-zinc-100 pt-4 text-center">
          <p className="text-[10px] text-zinc-400 font-sans leading-normal">
            For secure doctor operations only. Unauthorized access attempts are monitored securely in the database log.
          </p>
        </div>
      </div>
    );
  }

  // Admin Workspace (Main Content)
  return (
    <div className="space-y-8 animate-fade-in font-sans text-zinc-800">
      
      {/* 0. STRICT WORKER-ONLY HEAVY BANNER */}
      <div className="bg-black text-white p-4.5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md select-none border border-zinc-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 text-white rounded-xl">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-[12.5px] uppercase tracking-wider font-sans">
              ONLY FOR WORKER - NO PUBLIC USER ALLOWED
            </h4>
            <p className="text-[10px] text-zinc-300 font-mono mt-0.5">
              Authorized Health Clinic Personnel Duty Counter Terminal • System Block Ref: #655
            </p>
          </div>
        </div>
        <span className="text-[9.5px] font-mono tracking-widest bg-zinc-800 text-white px-3 py-1 rounded-full font-bold uppercase border border-zinc-700">
          Staff Operator
        </span>
      </div>

      {/* 1. Welcoming Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs text-zinc-850">
        <div className="text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase tracking-widest text-[9px] font-mono font-bold rounded-full">
              Live System Panel
            </span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
              <Database className="w-3.5 h-3.5 text-black" />
              Connected to Supabase Cloud Engine
            </span>
          </div>
          <h2 className="font-sans font-extrabold text-2xl text-zinc-900 mt-1.5 tracking-tight">Staff Management Portal</h2>
          <p className="text-xs text-zinc-500 font-sans">Control live OPD appointments, evaluate clinician visits, and view patient symptoms.</p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              onRefresh();
              setSuccessMsg('Refreshing dynamic database feeds...');
              setTimeout(() => setSuccessMsg(''), 2000);
            }}
            className="px-4.5 py-2 text-black border border-zinc-200 hover:border-black bg-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Database
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4.5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-full cursor-pointer transition border border-black shadow-xs"
          >
            Log Out Panel
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl text-xs flex gap-2 items-center font-bold">
          <Check className="w-4 h-4 text-zinc-950" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Switch Controls */}
      <div className="flex border-b border-zinc-200 mt-2 gap-6 font-sans">
        <button
          onClick={() => setActiveAdminSubTab('ledger')}
          className={`pb-3 text-xs uppercase tracking-wider font-extrabold border-b-2 cursor-pointer transition-all ${
            activeAdminSubTab === 'ledger'
              ? 'border-black text-black font-black'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Patient Tickets & Ledger
        </button>
        <button
          onClick={() => setActiveAdminSubTab('chat')}
          className={`pb-3 text-xs uppercase tracking-wider font-extrabold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeAdminSubTab === 'chat'
              ? 'border-black text-black font-black'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <span>Live Support Helpdesk</span>
          {chatMessages.length > 0 && (
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono rounded-full font-bold border border-zinc-950 animate-pulse">
              {Array.from(new Set(chatMessages.map(m => m.patientSessionId))).length}
            </span>
          )}
        </button>
      </div>

      {activeAdminSubTab === 'chat' ? (
        /* ======================== CHATROOM WORKSPACE ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans text-zinc-800">
          
          {/* Active Chats Sidebar */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm">Active Patients</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Select a patient below to view messages and reply instantly.</p>
            </div>
            
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {(() => {
                const groupedMap: { [key: string]: any[] } = {};
                chatMessages.forEach(msg => {
                  if (!groupedMap[msg.patientSessionId]) {
                    groupedMap[msg.patientSessionId] = [];
                  }
                  groupedMap[msg.patientSessionId].push(msg);
                });
                
                const sessionList = Object.keys(groupedMap).map(sid => {
                  const msgs = groupedMap[sid];
                  const lastMsg = msgs[msgs.length - 1];
                  return {
                    sessionId: sid,
                    patientName: lastMsg.patientName || 'Anonymous Patient',
                    lastMessage: lastMsg.message,
                    lastTimestamp: lastMsg.createdAt,
                    messagesCount: msgs.length,
                    lastSender: lastMsg.sender
                  };
                }).sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());

                if (sessionList.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-2 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl p-4">
                      <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto" />
                      <p className="text-xs">No active chats at the moment.</p>
                    </div>
                  );
                }

                return sessionList.map(session => {
                  const isSelected = selectedSessionId === session.sessionId;
                  return (
                    <button
                      key={session.sessionId}
                      onClick={() => setSelectedSessionId(session.sessionId)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer block ${
                        isSelected
                          ? 'bg-zinc-50 border-black text-black shadow-xs'
                          : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-650'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-xs truncate max-w-[150px] text-zinc-900">
                          {session.patientName}
                        </span>
                        <span className={`text-[9px] font-mono shrink-0 ${isSelected ? 'text-black font-bold' : 'text-zinc-450'}`}>
                          {new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className={`text-[11px] truncate mt-1.5 font-sans italic ${isSelected ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                        {session.lastSender === 'admin' ? 'You: ' : ''}"{session.lastMessage}"
                      </p>
                      
                      <div className="flex items-center justify-between gap-1.5 mt-2.5">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isSelected 
                            ? 'bg-black border-black text-white' 
                            : 'bg-zinc-150 bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}>
                          {session.messagesCount} message{session.messagesCount > 1 ? 's' : ''}
                        </span>
                        
                        {session.lastSender === 'patient' && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                            <span className="text-[9px] font-bold text-black font-mono uppercase tracking-wider">Help Awaited</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Chat Window Panel */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
            {(() => {
              const groupedMap: { [key: string]: any[] } = {};
              chatMessages.forEach(msg => {
                if (!groupedMap[msg.patientSessionId]) groupedMap[msg.patientSessionId] = [];
                groupedMap[msg.patientSessionId].push(msg);
              });
              const activeSessionMessages = groupedMap[selectedSessionId] || [];
              const patientName = activeSessionMessages[0]?.patientName || "Patient";

              if (!selectedSessionId) {
                return (
                  <div className="text-center my-auto space-y-3 py-16">
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 text-zinc-450 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5.5 h-5.5 text-zinc-750" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Select Conversation</h4>
                      <p className="text-xs text-zinc-405 max-w-xs mx-auto mt-1">Choose an ongoing patient session in the side list to begin official clinicians support dialogue.</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col h-full justify-between flex-1 font-sans text-zinc-800">
                  {/* Dialogue Header */}
                  <div className="border-b border-zinc-205 pb-3 mb-4 flex justify-between items-center text-left">
                    <div>
                      <h4 className="font-extrabold text-[13px] text-zinc-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                        Patient Room: <span className="text-black bg-zinc-100 px-2.5 py-0.5 rounded-md font-bold select-all font-sans">{patientName}</span>
                      </h4>
                      <p className="text-[9px] text-zinc-400 font-mono mt-1">Session UUID: {selectedSessionId}</p>
                    </div>
                    
                    <span className="text-[9px] uppercase font-mono tracking-widest bg-zinc-50 text-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200 font-bold flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /> Live Sync
                    </span>
                  </div>

                  {/* Message Threads */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[340px] mb-4 text-xs">
                    {activeSessionMessages.map((m) => {
                      const isAdmin = m.sender === 'admin';
                      return (
                        <div key={m.id} className={`flex gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {!isAdmin && (
                            <div className="w-6.5 h-6.5 rounded-full bg-zinc-100 text-black border border-zinc-200 flex items-center justify-center font-bold text-[9px] shrink-0 font-mono uppercase">
                              PT
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl max-w-[80%] break-words leading-relaxed text-left ${
                            isAdmin 
                              ? 'bg-black text-white rounded-tr-none' 
                              : 'bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-tl-none select-all'
                          }`}>
                            <p className="font-sans">{m.message}</p>
                            <span className={`block text-[8px] mt-1.5 font-mono ${isAdmin ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • by {isAdmin ? 'Support desk' : m.patientName}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Reply */}
                  <form onSubmit={handleAdminSendReply} className="border-t border-zinc-200 pt-4 flex gap-2">
                    <input
                      type="text"
                      required
                      value={adminReplyInput}
                      onChange={(e) => setAdminReplyInput(e.target.value)}
                      placeholder={`Type reply to ${patientName}...`}
                      className="flex-1 text-xs rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-black outline-none focus:border-black transition-all font-sans placeholder:text-zinc-300"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-full flex items-center gap-1 cursor-pointer transition shrink-0 shadow-xs"
                    >
                      <span>Send Response</span>
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>

        </div>
      ) : (
        /* Regular Appointment Ledger view */
        <>
      {/* 2. SQL schema helper box */}
      <div className="bg-white text-zinc-800 rounded-3xl overflow-hidden border border-zinc-200 shadow-xs">
        <button 
          onClick={() => setShowSqlHelper(!showSqlHelper)}
          className="w-full flex justify-between items-center px-6 py-4 bg-white hover:bg-zinc-50 border-none transition text-left cursor-pointer outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Database className="w-4.5 h-4.5 text-black" />
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 font-sans">Supabase DB Schema Helper & Integration</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Click here to copy the table schema SQL commands if you are setting up Supabase table for the first time.</p>
            </div>
          </div>
          {showSqlHelper ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>

        {showSqlHelper && (
          <div className="p-6 border-t border-zinc-200 space-y-4 bg-zinc-50">
            <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl font-sans text-left">
              Since appointments go to your personal Supabase instance under project reference <strong>dzwnzgjgqaolglvophtu</strong>, please ensure you have run this CREATE TABLE command in your Supabase dashboard first so SQL queries can correctly save patient records.
            </p>

            <div className="relative">
              <pre className="p-4 bg-white rounded-2xl text-[10px] sm:text-xs text-black font-mono overflow-x-auto max-h-56 leading-normal border border-zinc-200">
                {sqlSchemaText}
              </pre>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 py-1.5 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1 text-[10px] border border-black transition cursor-pointer font-sans"
              >
                {sqlCopied ? <Check className="w-3 h-3 text-white font-bold" /> : <Copy className="w-3 h-3" />}
                {sqlCopied ? 'Copied script!' : 'Copy Script'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Analytics Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-zinc-800">
        
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">Total Registers</span>
            <div className="p-1.5 bg-zinc-150 bg-zinc-100 text-black rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-zinc-900 mt-1.5 tracking-tight">{totalRegistrations}</p>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono">Durable appointments list</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-450 tracking-wider">Clinical Queue</span>
            <div className="p-1.5 bg-zinc-100 text-zinc-900 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-black" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-zinc-900 mt-1.5 tracking-tight">{activeConfirmed}</p>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono">Awaiting Counter lobby</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-450 tracking-wider">Cancelled OPDs</span>
            <div className="p-1.5 bg-zinc-100 text-zinc-455 rounded-xl">
              <XCircle className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-zinc-900 mt-1.5 tracking-tight">{cancelledSlips}</p>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono">Marked cancelled slip</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-900 tracking-wider">Total Collection</span>
            <div className="p-1.5 bg-zinc-100 text-black rounded-xl">
              <Activity className="w-4 h-4 text-black" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-zinc-900 mt-1.5 tracking-tight">₹{totalFees}</p>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono">Core clinical revenues</p>
        </div>

      </div>

      {/* 4. Table view control dashboard */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-xs p-6 space-y-6 text-zinc-800">
        
        {/* Table Filters header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-zinc-200">
          <div className="text-left">
            <h3 className="font-extrabold text-zinc-900 text-lg tracking-tight">Detailed Patient Ledger</h3>
            <p className="text-xs text-zinc-500">Filter records and trigger live queue serial modifications.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search Patient, Doctor, Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-xs text-zinc-900 focus:border-black outline-none placeholder:text-zinc-350"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-zinc-200 bg-white text-zinc-800 px-3 py-1.5 text-xs outline-none focus:border-black select-mono cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="rounded-full border border-zinc-200 bg-white text-zinc-800 px-3 py-1.5 text-xs outline-none focus:border-black max-w-[150px] truncate select-mono cursor-pointer"
            >
              <option value="All">All Doctors</option>
              {uniqueDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
            </select>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-full border border-zinc-200 bg-white text-zinc-800 px-3 py-1.5 text-xs outline-none focus:border-black max-w-[150px] truncate select-mono cursor-pointer"
            >
              <option value="All">All Branches</option>
              {uniqueBranches.map(br => <option key={br} value={br}>{br}</option>)}
            </select>
          </div>
        </div>

        {/* Database List */}
        {filteredApts.length > 0 ? (
          <div className="overflow-x-auto text-left">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 text-[10px] font-mono uppercase text-zinc-400 font-bold whitespace-nowrap">
                  <th className="py-3.5 px-2">OPD Token</th>
                  <th className="py-3.5 px-2">Patient Details</th>
                  <th className="py-3.5 px-2">Consultant Doctor</th>
                  <th className="py-3.5 px-2">Branch/Location</th>
                  <th className="py-3.5 px-2">Time Slot</th>
                  <th className="py-3.5 px-2">Status</th>
                  <th className="py-3.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredApts.map((apt) => (
                  <tr 
                    key={apt.id} 
                    className={`hover:bg-zinc-50 transition ${
                      apt.status === 'Cancelled' ? 'bg-zinc-50/50 opacity-50 text-zinc-400' : ''
                    }`}
                  >
                    {/* OPD Token number display */}
                    <td className="py-4.5 px-2 font-mono font-extrabold text-zinc-900 border-none">
                      {apt.tokenNumber || 'OPD-PEND'}
                    </td>
                    
                    {/* Patient detail display */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-extrabold text-zinc-950 text-[13px]">{apt.patientName}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {apt.patientGender}, {apt.patientAge} Years • {apt.patientPhone}
                        </p>
                        {apt.symptoms && (
                          <p className="text-[10px] text-zinc-400 mt-1 italic max-w-xs truncate" title={apt.symptoms}>
                            symptom: "{apt.symptoms}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Consulting physician displays */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-extrabold text-zinc-850">{apt.doctor?.name || 'Unassigned doctor'}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {apt.doctor?.specialty || 'General Practitioner'} • Fee: ₹{apt.doctor?.fees || 0}
                        </p>
                      </div>
                    </td>

                    {/* Branch locations */}
                    <td className="py-4.5 px-2 text-zinc-700 font-sans max-w-[130px] truncate" title={apt.branch?.name}>
                      {apt.branch?.name?.split('(')[0] || 'Main Branch'}
                    </td>

                    {/* Timings */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-bold text-zinc-900 font-mono">{apt.appointmentDate}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{apt.appointmentTime}</p>
                      </div>
                    </td>

                    {/* badge indicators */}
                    <td className="py-4.5 px-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2.5 py-0.5 rounded-full border uppercase ${
                        apt.status === 'Confirmed' 
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-800 font-bold' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                      }`}>
                        {apt.status === 'Confirmed' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                        ) : null}
                        {apt.status}
                      </span>
                    </td>

                    {/* action items list */}
                    <td className="py-4.5 px-2 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Gate slip slip switches */}
                        <button
                          onClick={() => {
                            // Switch tab to "appointments" and simulate clicking on receipt
                            window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'appointments' }));
                          }}
                          className="p-1 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all shadow-xs text-xs"
                          title="Print OPD Gate Slip"
                        >
                          <Printer className="w-3 h-3 text-zinc-700" />
                          <span>Receipt</span>
                        </button>

                        {/* Cancellations */}
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={isLoading}
                            className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-650 rounded-lg transition-all cursor-pointer"
                            title="Cancel Registration slip appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-zinc-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3.5">
            <div className="w-12 h-12 bg-zinc-50 text-zinc-450 rounded-full flex items-center justify-center mx-auto border border-zinc-200">
              <AlertCircle className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-800 text-sm">No synchronized clinic records match search options</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">Adjust filter settings, look up other specialties, or book a new live client consultation slip to generate traffic.</p>
            </div>
          </div>
        )}

      </div>
      </>
      )}
    </div>
  );
}
