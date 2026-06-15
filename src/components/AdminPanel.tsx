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
      <div className="max-w-md mx-auto my-12 bg-neutral-950 rounded-3xl border border-neutral-900 shadow-2xl p-8 space-y-6 text-neutral-200">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-neutral-900 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-neutral-800">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="font-sans font-extrabold text-xl text-white">Define Admin Password</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Welcome! As the first administrator logging in, please create a secure management password. This password will be stored persistently in your backend database.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-neutral-900 border border-neutral-800 text-rose-400 rounded-2xl text-xs flex gap-2 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleInitializePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">Specify Admin Password</label>
            <input 
              type="password"
              placeholder="e.g. shifacare2026"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="w-full rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-750 outline-none focus:border-cyan-400 transition-all font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-full cursor-pointer transition shadow-sm"
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
      <div className="max-w-md mx-auto my-12 bg-neutral-950 rounded-3xl border border-neutral-900 shadow-2xl p-8 space-y-6 text-neutral-200">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-neutral-900 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-neutral-800">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="font-sans font-extrabold text-xl text-white">Administrator Access</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Enter the clinical management password to open the persistent Supabase synchronization panel.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-neutral-900 border border-neutral-800 text-cyan-400 rounded-2xl text-xs flex gap-2 items-center">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-neutral-900 border border-neutral-800 text-rose-450 rounded-2xl text-xs flex gap-2 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">Enter Admin Password</label>
            <input 
              type="password"
              placeholder="••••••••••••••••"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all font-mono placeholder:text-neutral-750"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-full cursor-pointer transition shadow-sm"
          >
            Access Admin Workspace
          </button>
        </form>

        <div className="border-t border-neutral-900 pt-4 text-center">
          <p className="text-[10px] text-neutral-500 font-sans leading-normal">
            First time logging in? Specify your customized password in step above. Persistent cloud database holds your configuration across hot redeployments.
          </p>
        </div>
      </div>
    );
  }

  // Admin Workspace (Main Content)
  return (
    <div className="space-y-8 animate-fade-in font-sans text-neutral-205">
      
      {/* 1. Welcoming Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-md text-neutral-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-neutral-900 text-cyan-400 border border-neutral-850 uppercase tracking-widest text-[9px] font-mono font-bold rounded-full">
              Live System Panel
            </span>
            <span className="flex items-center gap-1 text-[11px] text-neutral-450 font-mono">
              <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Connected to Supabase Cloud Engine
            </span>
          </div>
          <h2 className="font-sans font-extrabold text-2xl text-white mt-1.5">Management Hub & Supabase Logs</h2>
          <p className="text-xs text-neutral-400">Control live OPD appointments, evaluate clinician visits, and view patient symptoms.</p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              onRefresh();
              setSuccessMsg('Refreshing dynamic database feeds...');
              setTimeout(() => setSuccessMsg(''), 2000);
            }}
            className="px-4.5 py-2 text-cyan-400 border border-neutral-900 hover:border-cyan-400/30 bg-neutral-950 hover:bg-neutral-900 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            Sync Database
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4.5 py-2 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold rounded-full cursor-pointer transition border border-neutral-800"
          >
            Log Out Panel
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-neutral-950 border border-neutral-900 text-cyan-400 rounded-2xl text-xs flex gap-2 items-center">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Switch Controls */}
      <div className="flex border-b border-neutral-900 mt-2 gap-6 font-sans">
        <button
          onClick={() => setActiveAdminSubTab('ledger')}
          className={`pb-3 text-xs uppercase tracking-wider font-extrabold border-b-2 cursor-pointer transition-all ${
            activeAdminSubTab === 'ledger'
              ? 'border-white text-white font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-350'
          }`}
        >
          Patient Tickets & Ledger
        </button>
        <button
          onClick={() => setActiveAdminSubTab('chat')}
          className={`pb-3 text-xs uppercase tracking-wider font-extrabold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeAdminSubTab === 'chat'
              ? 'border-white text-white font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-350'
          }`}
        >
          <span>Live Support Helpdesk</span>
          {chatMessages.length > 0 && (
            <span className="px-2 py-0.5 bg-neutral-900 text-cyan-400 text-[10px] font-mono rounded-full font-bold border border-neutral-850 animate-pulse">
              {Array.from(new Set(chatMessages.map(m => m.patientSessionId))).length}
            </span>
          )}
        </button>
      </div>

      {activeAdminSubTab === 'chat' ? (
        /* ======================== CHATROOM WORKSPACE ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans text-neutral-200">
          
          {/* Active Chats Sidebar */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-4 shadow-md">
            <div>
              <h3 className="font-extrabold text-white text-sm">Active Patients</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">Select a patient below to view messages and reply instantly.</p>
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
                    <div className="text-center py-12 space-y-2 text-neutral-550 border border-dashed border-neutral-900 rounded-2xl p-4">
                      <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
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
                          ? 'bg-neutral-900 border-cyan-400/30 text-white shadow-md'
                          : 'bg-neutral-900/35 border-neutral-900 hover:bg-neutral-900 text-neutral-350'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-xs truncate max-w-[150px]">
                          {session.patientName}
                        </span>
                        <span className={`text-[9px] font-mono shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`}>
                          {new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className={`text-[11px] truncate mt-1.5 font-sans italic ${isSelected ? 'text-neutral-200' : 'text-neutral-450'}`}>
                        {session.lastSender === 'admin' ? 'You: ' : ''}"{session.lastMessage}"
                      </p>
                      
                      <div className="flex items-center justify-between gap-1.5 mt-2.5">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isSelected 
                            ? 'bg-neutral-950 border-neutral-800 text-cyan-400' 
                            : 'bg-neutral-950 border-neutral-900 text-neutral-400'
                        }`}>
                          {session.messagesCount} message{session.messagesCount > 1 ? 's' : ''}
                        </span>
                        
                        {session.lastSender === 'patient' && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-[9px] font-bold text-cyan-400 font-mono uppercase tracking-wider">Help Awaited</span>
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
          <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[500px]">
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
                    <div className="w-12 h-12 bg-neutral-900 border border-neutral-900 text-neutral-500 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5.5 h-5.5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Select Conversation</h4>
                      <p className="text-xs text-neutral-450 max-w-xs mx-auto mt-1">Choose an ongoing patient session in the side list to begin official clinicians support dialogue.</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col h-full justify-between flex-1 font-sans">
                  {/* Dialogue Header */}
                  <div className="border-b border-neutral-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-[13px] text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
                        Patient Room: <span className="text-cyan-400 select-all">{patientName}</span>
                      </h4>
                      <p className="text-[9px] text-neutral-500 font-mono mt-0.5">Session UUID: {selectedSessionId}</p>
                    </div>
                    
                    <span className="text-[9px] uppercase font-mono tracking-widest bg-neutral-900 text-cyan-400 px-2.5 py-0.5 rounded-full border border-neutral-850 font-bold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" /> Live Sync
                    </span>
                  </div>

                  {/* Message Threads */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[340px] mb-4 text-xs">
                    {activeSessionMessages.map((m) => {
                      const isAdmin = m.sender === 'admin';
                      return (
                        <div key={m.id} className={`flex gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {!isAdmin && (
                            <div className="w-6.5 h-6.5 rounded-full bg-neutral-900 text-cyan-400 border border-neutral-850 flex items-center justify-center font-bold text-[9px] shrink-0 font-mono uppercase">
                              PT
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl max-w-[80%] break-words leading-relaxed ${
                            isAdmin 
                              ? 'bg-neutral-905 bg-neutral-900 border border-neutral-800 text-white rounded-tr-none text-left' 
                              : 'bg-neutral-900 border border-neutral-850 text-cyan-400 rounded-tl-none select-all text-left'
                          }`}>
                            <p>{m.message}</p>
                            <span className={`block text-[8px] mt-1.5 font-mono ${isAdmin ? 'text-neutral-500' : 'text-cyan-600'}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • by {isAdmin ? 'Support desk' : m.patientName}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Reply */}
                  <form onSubmit={handleAdminSendReply} className="border-t border-neutral-900 pt-4 flex gap-2">
                    <input
                      type="text"
                      required
                      value={adminReplyInput}
                      onChange={(e) => setAdminReplyInput(e.target.value)}
                      placeholder={`Type reply to ${patientName}...`}
                      className="flex-1 text-xs rounded-full border border-neutral-905 border-neutral-900 bg-neutral-900 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition-all font-sans placeholder:text-neutral-600"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black text-xs font-black rounded-full flex items-center gap-1 cursor-pointer transition shrink-0 shadow-md"
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
      <div className="bg-neutral-950 text-neutral-200 rounded-3xl overflow-hidden border border-neutral-900 shadow-md">
        <button 
          onClick={() => setShowSqlHelper(!showSqlHelper)}
          className="w-full flex justify-between items-center px-6 py-4 bg-neutral-950 hover:bg-neutral-900/40 border-none transition text-left cursor-pointer outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Database className="w-4.5 h-4.5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white font-sans">Supabase DB Schema Helper & Integration</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Click here to copy the table schema SQL commands if you are setting up Supabase table for the first time.</p>
            </div>
          </div>
          {showSqlHelper ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {showSqlHelper && (
          <div className="p-6 border-t border-neutral-900 space-y-4">
            <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl font-sans">
              Since appointments go to your personal Supabase instance under project reference <strong>dzwnzgjgqaolglvophtu</strong>, please ensure you have run this CREATE TABLE command in your Supabase dashboard first so SQL queries can correctly save patient records.
            </p>

            <div className="relative">
              <pre className="p-4 bg-neutral-900/30 rounded-2xl text-[10px] sm:text-xs text-cyan-400 font-mono overflow-x-auto max-h-56 leading-normal border border-neutral-900">
                {sqlSchemaText}
              </pre>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 py-1.5 px-3 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 rounded-lg flex items-center gap-1 text-[10px] border border-neutral-850 transition cursor-pointer font-sans"
              >
                {sqlCopied ? <Check className="w-3 h-3 text-cyan-400 font-bold" /> : <Copy className="w-3 h-3" />}
                {sqlCopied ? 'Copied script!' : 'Copy Script'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Analytics Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-neutral-200">
        
        <div className="bg-neutral-950 rounded-3xl border border-neutral-900 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 tracking-wider">Total Registers</span>
            <div className="p-1.5 bg-neutral-900 text-cyan-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-white mt-1.5">{totalRegistrations}</p>
          <p className="text-[10px] text-neutral-500 mt-1 uppercase font-mono">Durable appointments list</p>
        </div>

        <div className="bg-neutral-950 rounded-3xl border border-neutral-900 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">Clinical Queue</span>
            <div className="p-1.5 bg-neutral-900 text-cyan-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-cyan-400 mt-1.5">{activeConfirmed}</p>
          <p className="text-[10px] text-neutral-500 mt-1 uppercase font-mono">Awaiting Counter lobby</p>
        </div>

        <div className="bg-neutral-950 rounded-3xl border border-neutral-900 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-550 tracking-wider">Cancelled OPDs</span>
            <div className="p-1.5 bg-neutral-900 text-neutral-550 rounded-xl">
              <XCircle className="w-4 h-4 text-neutral-500" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-white mt-1.5">{cancelledSlips}</p>
          <p className="text-[10px] text-neutral-500 mt-1 uppercase font-mono">Marked cancelled slip</p>
        </div>

        <div className="bg-neutral-950 rounded-3xl border border-neutral-900 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">Total Collection</span>
            <div className="p-1.5 bg-neutral-900 text-cyan-400 rounded-xl">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-cyan-400 mt-1.5">₹{totalFees}</p>
          <p className="text-[10px] text-neutral-500 mt-1 uppercase font-mono">Core clinical revenues</p>
        </div>

      </div>

      {/* 4. Table view control dashboard */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl shadow-md p-6 space-y-6 text-neutral-200">
        
        {/* Table Filters header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-neutral-900">
          <div>
            <h3 className="font-extrabold text-white text-lg">Detailed Patient Ledger</h3>
            <p className="text-xs text-neutral-400">Filter records and trigger live queue serial modifications.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text"
                placeholder="Search Patient, Doctor, Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-neutral-900 bg-neutral-900 pl-9 pr-4 py-2 text-xs text-white focus:border-cyan-400 outline-none placeholder:text-neutral-600"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-neutral-900 bg-neutral-900 text-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-cyan-400 select-mono"
            >
              <option value="All">All statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="rounded-full border border-neutral-900 bg-neutral-900 text-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-cyan-400 max-w-[150px] truncate select-mono"
            >
              <option value="All">All Doctors</option>
              {uniqueDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
            </select>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-full border border-neutral-900 bg-neutral-900 text-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-cyan-400 max-w-[150px] truncate select-mono"
            >
              <option value="All">All Branches</option>
              {uniqueBranches.map(br => <option key={br} value={br}>{br}</option>)}
            </select>
          </div>
        </div>

        {/* Database List */}
        {filteredApts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-[10px] font-mono uppercase text-neutral-500 font-bold">
                  <th className="py-3.5 px-2">OPD Token</th>
                  <th className="py-3.5 px-2">Patient Details</th>
                  <th className="py-3.5 px-2">Consultant Doctor</th>
                  <th className="py-3.5 px-2">Branch/Location</th>
                  <th className="py-3.5 px-2">Time Slot</th>
                  <th className="py-3.5 px-2">Status</th>
                  <th className="py-3.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60">
                {filteredApts.map((apt) => (
                  <tr 
                    key={apt.id} 
                    className={`hover:bg-neutral-900/30 transition ${
                      apt.status === 'Cancelled' ? 'bg-neutral-950 opacity-40 text-neutral-500' : ''
                    }`}
                  >
                    {/* OPD Token number display */}
                    <td className="py-4.5 px-2 font-mono font-bold text-cyan-400">
                      {apt.tokenNumber || 'OPD-PEND'}
                    </td>
                    
                    {/* Patient detail display */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-extrabold text-white text-[13px]">{apt.patientName}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {apt.patientGender}, {apt.patientAge} Years • {apt.patientPhone}
                        </p>
                        {apt.symptoms && (
                          <p className="text-[10px] text-neutral-500 mt-1 italic max-w-xs truncate" title={apt.symptoms}>
                            symptom: "{apt.symptoms}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Consulting physician displays */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-extrabold text-neutral-200">{apt.doctor?.name || 'Unassigned doctor'}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {apt.doctor?.specialty || 'General Practitioner'} • Fee: ₹{apt.doctor?.fees || 0}
                        </p>
                      </div>
                    </td>

                    {/* Branch locations */}
                    <td className="py-4.5 px-2 text-neutral-300 font-sans max-w-[130px] truncate" title={apt.branch?.name}>
                      {apt.branch?.name?.split('(')[0] || 'Main Branch'}
                    </td>

                    {/* Timings */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-bold text-neutral-200 font-mono">{apt.appointmentDate}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">{apt.appointmentTime}</p>
                      </div>
                    </td>

                    {/* badge indicators */}
                    <td className="py-4.5 px-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2.5 py-0.5 rounded-full border uppercase ${
                        apt.status === 'Confirmed' 
                          ? 'bg-neutral-900 border-cyan-400/20 text-cyan-400 font-bold' 
                          : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                      }`}>
                        {apt.status === 'Confirmed' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
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
                          className="p-1 px-3 bg-neutral-905 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-cyan-400 hover:text-white rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all"
                          title="Print OPD Gate Slip"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>

                        {/* Cancellations */}
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={isLoading}
                            className="p-1 px-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-450 hover:bg-rose-955/10 rounded-lg transition-all cursor-pointer"
                            title="Cancel Registration slip appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
            <div className="w-12 h-12 bg-neutral-900 text-neutral-600 rounded-full flex items-center justify-center mx-auto border border-neutral-850">
              <AlertCircle className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">No synchronized clinic records match search options</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">Adjust filter settings, look up other specialties, or book a new live client consultation slip to generate traffic.</p>
            </div>
          </div>
        )}

      </div>
      </>
      )}
    </div>
  );
}
