/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, Phone, Mail, FileText, Search, Activity, 
  CheckCircle2, XCircle, Trash2, Printer, Key, ShieldAlert, Check, 
  Copy, Database, RefreshCw, ChevronDown, Lock, ChevronUp, AlertCircle
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [showSqlHelper, setShowSqlHelper] = useState<boolean>(true);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check login session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('shifa_admin_session');
    if (savedSession) {
      setIsAdminLoggedIn(true);
    }
    checkAdminStatus();
  }, []);

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
-- Paste the code below and click "Run" to create your table.

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

-- Enable general table accessibility configs
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON appointments FOR DELETE USING (true);`;

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

  // Render initialization state (Set Password)
  if (isInitialized === false && !isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-100">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-sans font-semibold text-xl text-slate-900">Define Admin Password</h2>
          <p className="text-xs text-slate-400">
            Welcome! As the first administrator logging in, please create the secure management password. This password will be encrypted and stored in your backend.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-150 text-rose-600 rounded-2xl text-xs flex gap-2 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleInitializePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Specify Password</label>
            <input 
              type="password"
              placeholder="e.g. shifa2026admin"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-full cursor-pointer transition shadow-xs"
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
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-200">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="font-sans font-semibold text-xl text-slate-900">Administrator Credentials</h2>
          <p className="text-xs text-slate-400">
            Enter the clinical management password to open the Supabase synchronization panel.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs flex gap-2 items-center">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-150 text-rose-600 rounded-2xl text-xs flex gap-2 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Enter Admin Password</label>
            <input 
              type="password"
              placeholder="••••••••••••••"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full cursor-pointer transition shadow-xs"
          >
            Access Admin Workspace
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-[10px] text-slate-400 font-sans">
            First time logging in? Contact your system manager if you forgot the one-time master credential.
          </p>
        </div>
      </div>
    );
  }

  // Admin Workspace (Main Content)
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* 1. Welcoming Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest text-[9px] font-mono font-semibold rounded-full">
              Live System Panel
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Database className="w-3 h-3 text-emerald-500 animate-pulse" />
              Connected to Project 'dzwnzgjgqaolglvophtu'
            </span>
          </div>
          <h2 className="font-sans font-semibold text-2xl text-slate-900 mt-1">Management Hub & Supabase Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control live OPD registrations, evaluate clinician visits, and view patient symptoms.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              onRefresh();
              setSuccessMsg('Refreshing dynamic database feeds...');
              setTimeout(() => setSuccessMsg(''), 2000);
            }}
            className="px-4 py-2 text-slate-600 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Database
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-full cursor-pointer transition"
          >
            Log Out Panel
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs flex gap-2 items-center mx-auto max-w-full">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. SQL schema helper box */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-950 shadow-md">
        <button 
          onClick={() => setShowSqlHelper(!showSqlHelper)}
          className="w-full flex justify-between items-center px-6 py-4 bg-slate-950 hover:bg-slate-900 border-none transition text-left cursor-pointer outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Database className="w-4.5 h-4.5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">Supabase DB Schema Helper & Integration</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Click here to copy the table schema SQL commands if you are setting up Supabase table for the first time.</p>
            </div>
          </div>
          {showSqlHelper ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showSqlHelper && (
          <div className="p-6 border-t border-slate-800 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
              Since appointments go to your personal Supabase instance under project reference <strong>dzwnzgjgqaolglvophtu</strong>, please ensure you have run this CREATE TABLE command in your Supabase dashboard first so SQL queries can correctly save patient records.
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-2xl text-[10px] sm:text-xs text-blue-200 font-mono overflow-x-auto max-h-56 leading-normal border border-slate-850">
                {sqlSchemaText}
              </pre>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center gap-1 text-xs border border-slate-700 transition cursor-pointer font-sans"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {sqlCopied ? 'Copied SQL!' : 'Copy SQL Script'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Analytics Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Total Registers</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-sans font-semibold text-slate-900 mt-2">{totalRegistrations}</p>
          <p className="text-[10px] text-slate-400 mt-1">Stored appointments in backend</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Active Clinical Queue</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-sans font-semibold text-slate-900 mt-2">{activeConfirmed}</p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting lobby arrival status</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Cancelled OPDs</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-sans font-semibold text-slate-900 mt-2">{cancelledSlips}</p>
          <p className="text-[10px] text-slate-400 mt-1">Marked cancelled by counter</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Est. Core Revenue</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-sans font-semibold text-emerald-700 mt-2">₹{totalFees}</p>
          <p className="text-[10px] text-slate-400 mt-1">Excludes path-testing laboratory</p>
        </div>

      </div>

      {/* 4. Table view control dashboard */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden p-6 space-y-6">
        
        {/* Table Filters header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Detailed Patient Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter records and trigger live queue serial modifications.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" />
              <input 
                type="text"
                placeholder="Search Patient, Doctor, Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 bg-white"
            >
              <option value="All">All statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 bg-white max-w-[150px] truncate"
            >
              <option value="All">All Doctors</option>
              {uniqueDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
            </select>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 bg-white max-w-[150px] truncate"
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
                <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-2">OPD Token</th>
                  <th className="py-3 px-2">Patient Details</th>
                  <th className="py-3 px-2">Consultant Doctor</th>
                  <th className="py-3 px-2">Branch/Location</th>
                  <th className="py-3 px-2">Time Slot</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApts.map((apt) => (
                  <tr 
                    key={apt.id} 
                    className={`hover:bg-slate-50/50 transition ${
                      apt.status === 'Cancelled' ? 'bg-slate-50/30 opacity-70 text-slate-500' : ''
                    }`}
                  >
                    {/* OPD Token number display */}
                    <td className="py-4.5 px-2 font-mono font-medium text-blue-650">
                      {apt.tokenNumber || 'OPD-PEND'}
                    </td>
                    
                    {/* Patient detail display */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-[13px]">{apt.patientName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {apt.patientGender}, {apt.patientAge} Years • {apt.patientPhone}
                        </p>
                        {apt.symptoms && (
                          <p className="text-[10px] text-slate-500 mt-1 italic max-w-xs truncate" title={apt.symptoms}>
                            symptom: "{apt.symptoms}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Consulting physician displays */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-semibold text-slate-800">{apt.doctor?.name || 'Unassigned doctor'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {apt.doctor?.specialty || 'General Practitioner'} • Fee: ₹{apt.doctor?.fees || 0}
                        </p>
                      </div>
                    </td>

                    {/* Branch locations */}
                    <td className="py-4.5 px-2 text-slate-600 font-sans max-w-[130px] truncate" title={apt.branch?.name}>
                      {apt.branch?.name?.split('(')[0] || 'Main Branch'}
                    </td>

                    {/* Timings */}
                    <td className="py-4.5 px-2">
                      <div>
                        <p className="font-semibold text-slate-850 font-mono">{apt.appointmentDate}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{apt.appointmentTime}</p>
                      </div>
                    </td>

                    {/* badge indicators */}
                    <td className="py-4.5 px-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                        apt.status === 'Confirmed' 
                          ? 'bg-blue-50 border-blue-100 text-blue-600 font-semibold' 
                          : 'bg-rose-55 border-rose-100 text-rose-600 font-medium'
                      }`}>
                        {apt.status === 'Confirmed' ? (
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
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
                            // Switch tab to "appointments" and simulate clicking on the receipt for this appointment
                            window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'appointments' }));
                          }}
                          className="p-1 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-600 rounded-lg flex items-center gap-0.5 font-medium cursor-pointer transition-all leading-normal"
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
                            className="p-1 px-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100/80 rounded-lg transition-all cursor-pointer"
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
            <div className="w-12 h-12 bg-slate-50 text-slate-350 rounded-full flex items-center justify-center mx-auto border border-slate-200">
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 text-sm">No synchronized clinic records match your search options</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">Adjust filter settings, look up other specialties, or book a new live client consultation slip to generate traffic.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
