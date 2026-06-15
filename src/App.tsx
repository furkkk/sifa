/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Stethoscope, Baby, HeartPulse, Activity, Sparkles, Smile,
  PhoneCall, MapPin, Clock, ShieldCheck, Heart, Sparkle, CalendarDays,
  Menu, X, BadgeAlert, Plus, Layers, Laptop, AlertCircle, ArrowUpRight,
  ArrowLeft
} from 'lucide-react';

import { Doctor, ClinicBranch, Appointment, Specialty } from './types';
import { DOCTORS, CLINIC_BRANCHES, SPECIALTIES, INITIAL_APPOINTMENTS, CLINIC_INFO } from './data';
import Header from './components/Header';
import DoctorCard from './components/DoctorCard';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import AdminPanel from './components/AdminPanel';
import ChatSupport from './components/ChatSupport';

// Type-safe Specialty Icon selector
const SpecialtyIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Stethoscope': return <Stethoscope className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Smile': return <Smile className={className} />;
    default: return <Stethoscope className={className} />;
  }
};

// Multi-use Patient check-in component supporting both email and optional phone warnings
function PatientCheckinForm({ onLogin }: { onLogin: (name: string, email: string, phone: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const hasEmail = email.includes('@') && email.trim().length > 3;
  const hasPhone = phone.trim().length >= 8;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!email.trim() || !email.includes('@')) return;
    onLogin(name, email, phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">Your Full Name (मरीज़ का नाम)</label>
        <input 
          type="text" 
          required
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-850 outline-none focus:border-blue-500 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">Email Address (ईमेल)</label>
        <input 
          type="email" 
          required
          placeholder="e.g. rahul@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-850 outline-none focus:border-blue-500 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold flex justify-between">
          <span>Mobile Phone Number (मोबाइल नंबर)</span>
          <span className="text-[10px] text-amber-600 font-semibold normal-case">Required for cloud records</span>
        </label>
        <input 
          type="tel" 
          placeholder="e.g. +91 99887 76655"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-850 outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {hasEmail ? (
        !hasPhone ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-[10.5px] leading-relaxed select-none">
            ✓ <strong>Cloud Sync Activated (Email Only):</strong> Your email will represent your clinical identity. Your tickets and support chats will be securely saved persistently in the database records.
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-55/40 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-[10.5px] leading-relaxed select-none">
            ✓ <strong>Cloud Sync Activated:</strong> Mobile and email provided. Your consultation registers and helpdesk chats will be securely saved to backend database storage.
          </div>
        )
      ) : null}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-750 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold py-3 rounded-full cursor-pointer transition shadow-md shadow-blue-500/15 uppercase tracking-wider text-center"
      >
        Check-In Session
      </button>
    </form>
  );
}

export default function App() {
  // Navigation active state
  // 'home' | 'appointments' | 'book' | 'admin'
  const [activeTab, setActiveTab ] = useState<string>('home');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Patient User state retrieved from localStorage
  const [patientUser, setPatientUser] = useState<{ name: string; email: string; phone: string; isSaved: boolean } | null>(() => {
    const saved = localStorage.getItem('shifa_patient_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // App State - Appointments list pulled from DB backend API with local cache
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Filtering states on Homepage
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');

  // Fetch appointments from DB
  const fetchAppointments = async () => {
    try {
      let url = '/api/appointments';
      if (patientUser?.email) {
        url += `?email=${encodeURIComponent(patientUser.email)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        throw new Error("API responded with error");
      }
    } catch (err) {
      console.warn("Could not load backend appointments - falling back to client localStorage:", err);
      const saved = localStorage.getItem('shifa_appointments');
      let displayApts = INITIAL_APPOINTMENTS;
      if (saved) {
        try {
          displayApts = JSON.parse(saved);
        } catch (e) {
          displayApts = INITIAL_APPOINTMENTS;
        }
      }
      // Apply offline fallback email filtering
      if (patientUser?.email) {
        displayApts = displayApts.filter(apt => apt.patientEmail && apt.patientEmail.toLowerCase().trim() === patientUser.email.toLowerCase().trim());
      }
      setAppointments(displayApts);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientUser?.email]);

  const handlePatientLogin = (name: string, email: string, phone: string) => {
    const user = { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), isSaved: true };
    setPatientUser(user);
    localStorage.setItem('shifa_patient_user', JSON.stringify(user));
    localStorage.setItem('shifa_chat_name', user.name);
    // Dispatches custom event to notify target components
    window.dispatchEvent(new Event('storage'));
  };

  const handlePatientLogout = () => {
    setPatientUser(null);
    localStorage.removeItem('shifa_patient_user');
    localStorage.removeItem('shifa_chat_name');
    window.dispatchEvent(new Event('storage'));
  };

  // Add Appointment
  const handleAddAppointment = async (newApt: Appointment) => {
    // Optimistic UI updates
    setAppointments(prev => [newApt, ...prev]);
    
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApt)
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        throw new Error("Failed to book on backend");
      }
    } catch (err) {
      console.warn("Could not save to server - storing in client backup", err);
      const backupList = [newApt, ...appointments];
      localStorage.setItem('shifa_appointments', JSON.stringify(backupList));
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (aptId: string) => {
    // Optimistic UI updates
    setAppointments(prev => prev.map(apt => {
      if (apt.id === aptId) {
        return { ...apt, status: 'Cancelled' as const };
      }
      return apt;
    }));

    try {
      const res = await fetch(`/api/appointments/${aptId}/cancel`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        throw new Error("Cancel API failed");
      }
    } catch (err) {
      console.warn("Could not cancel on server - updating client backup", err);
      const backupList = appointments.map(apt => {
        if (apt.id === aptId) {
          return { ...apt, status: 'Cancelled' as const };
        }
        return apt;
      });
      localStorage.setItem('shifa_appointments', JSON.stringify(backupList));
    }
  };

  // Listen to custom virtual tab switch events from sub-components
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
        // Scroll to container top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('switch-tab', handleSwitchTab);
    return () => {
      window.removeEventListener('switch-tab', handleSwitchTab);
    };
  }, []);

  // Callback to trigger booking form with a specific pre-selected doctor
  const handleInitiateBooking = (doctor: Doctor | null) => {
    setSelectedDoctorForBooking(doctor);
    setActiveTab('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Doctors filtering logic
  const filteredDoctors = DOCTORS.filter(doc => {
    const matchesSpecialty = selectedSpecialtyFilter === 'All' || doc.specialty === selectedSpecialtyFilter;
    const matchesSearch = doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
                          doc.qualification.toLowerCase().includes(doctorSearchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 font-sans antialiased text-slate-200">
      
      {/* 1. TOP HEADER & NAVBAR */}
      <Header 
        onBookClick={() => handleInitiateBooking(null)}
        onViewAppointmentsClick={() => setActiveTab('appointments')}
        onViewAdminClick={() => setActiveTab('admin')}
        activeTab={activeTab}
      />

      {/* 2. CHOOSE CURRENT MAIN VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* Patient Register/Check-in banner */}
        {patientUser ? (
          <div className="bg-[#0b1329]/80 border border-slate-800/85 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-950/50 text-cyan-400 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Smile className="w-5.5 h-5.5 animate-bounce text-cyan-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Checked-in Patient Session</p>
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-sm text-white">{patientUser.name}</h4>
                  {patientUser.isSaved ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/40 text-emerald-400 rounded-full text-[9px] font-semibold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      Sync Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/40 text-amber-400 rounded-full text-[9px] font-semibold border border-amber-500/20 animate-pulse">
                      Not Saved (Email only)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-sans font-medium">
                  {patientUser.email} {patientUser.phone ? `| ${patientUser.phone}` : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-cyan-500/10 cursor-pointer transition border border-cyan-400/25"
              >
                My OPD Tickets
              </button>
              <button
                onClick={handlePatientLogout}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white text-xs font-bold rounded-full cursor-pointer transition animate-fade-in"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-950 via-[#0e172e] to-slate-950 border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wide uppercase font-bold">
                Patient Self Check-In
              </span>
              <h4 className="font-sans font-bold text-base text-white tracking-tight">Check-In With Email and Phone Prior to OPD Booking</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl font-sans">
                Please register your session. This ensures clinical helpdesk tickets can search and store chats and queue slots securely.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-455 hover:to-blue-555 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-cyan-500/15 border border-cyan-400/25 cursor-pointer transition shrink-0"
            >
              Sign In / Session Check-In
            </button>
          </div>
        )}

        {/* VIEW A: HOME - CLINIC GENERAL PORTAL */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* Elegant Hero Slider section with Urdu/Hindi easy guide banner */}
            <section className="bg-gradient-to-br from-[#0c142b] via-[#05080f] to-[#0b1329] rounded-3xl p-6 sm:p-10 lg:p-14 text-white relative overflow-hidden border border-slate-800 shadow-3xl">
              {/* Absolutes decorative blobs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 -mr-20 -mt-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 -ml-20 -mb-20"></div>

              <div className="max-w-3xl space-y-6 relative z-10 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-xs font-mono tracking-wider uppercase border border-cyan-500/20 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <Sparkle className="w-3.5 h-3.5 text-cyan-400" />
                  Live Digital Appointment Portal - 2026
                </span>

                <h2 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-white">
                  Expert Clinicians. <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Zero Wait Lobby Counter.</span>
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-medium font-sans">
                  {CLINIC_INFO.tagline}. Simply reserve your OPD slot online, get an instant queue token number, and get prioritized medical diagnostics at your selected time.
                </p>

                {/* Patient Quick Instruction banner (Urdu/Hindi) */}
                <div className="p-4 bg-slate-950/85 border border-slate-800/80 rounded-2xl text-xs space-y-1 max-w-lg shadow-2xl backdrop-blur-md">
                  <p className="font-bold text-cyan-400 flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 shrink-0 text-cyan-400" />
                    क्लीनिक विजिट के लिए आसान गाइड:
                  </p>
                  <p className="text-slate-350 leading-normal font-sans font-medium">
                    १. नीचे अपनी पसंद के डॉक्टर चुनें। २. तारीख और "टाइम स्लॉट" सिलेक्ट करें। ३. तुरंत अपना डिजिटल OPD टोकन काउंटर पर दिखाएं और सीधे डॉक्टर से मिलें!
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={() => handleInitiateBooking(null)}
                    className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-550 font-bold text-xs sm:text-sm text-white px-6 py-4 rounded-full transition duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 cursor-pointer flex items-center gap-2 border border-cyan-400/20 active:scale-98 animate-fade-in"
                  >
                    <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                    Book Live OPD Appointment Now
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="bg-[#0b1329]/80 hover:bg-[#111c3a] text-slate-300 hover:text-white font-bold text-xs sm:text-sm px-6 py-4 rounded-full transition duration-200 border border-slate-800 cursor-pointer flex items-center gap-2 active:scale-98"
                  >
                    <CalendarDays className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Check My Token Status
                  </button>
                </div>
              </div>
            </section>

            {/* Quick stats / Features bar */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0b1329]/55 border border-slate-850/65 rounded-3xl p-5 flex items-start gap-3.5 hover:border-slate-800 transition duration-300 text-left">
                <div className="p-2.5 bg-cyan-950/60 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">Verified Doctors</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Top-rated specialist staff</p>
                </div>
              </div>
              
              <div className="bg-[#0b1329]/55 border border-slate-850/65 rounded-3xl p-5 flex items-start gap-3.5 hover:border-slate-800 transition duration-300 text-left">
                <div className="p-2.5 bg-cyan-950/60 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">Open 7 Days</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">8:00 AM to 10:00 PM</p>
                </div>
              </div>

              <div className="bg-[#0b1329]/55 border border-slate-850/65 rounded-3xl p-5 flex items-start gap-3.5 hover:border-slate-800 transition duration-300 text-left">
                <div className="p-2.5 bg-cyan-950/60 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">5-Day Free Recheck</h4>
                  <p className="text-[11px] text-slate-455 mt-0.5 text-slate-450">Complementary review checks</p>
                </div>
              </div>

              <div className="bg-[#0b1329]/55 border border-slate-850/65 rounded-3xl p-5 flex items-start gap-3.5 hover:border-slate-800 transition duration-300 text-left">
                <div className="p-2.5 bg-cyan-950/60 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">Direct Helpdesk</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5 font-mono">{CLINIC_INFO.generalPhone}</p>
                </div>
              </div>
            </section>

            {/* Specialties & Clinical Departments Selection */}
            <section className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2 animate-fade-in">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-800 px-3 py-1 rounded-full shadow-sm">Departments</span>
                <h3 className="font-sans font-bold text-2xl text-white tracking-tight">Browse Clinical Specialties</h3>
                <p className="text-xs text-slate-400 leading-normal font-sans">
                  Choose a department below to show our qualified medical practitioner lists immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                <button
                  onClick={() => setSelectedSpecialtyFilter('All')}
                  className={`p-4 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
                    selectedSpecialtyFilter === 'All'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/30 text-white shadow-xl shadow-cyan-500/10 font-bold scale-[1.02]'
                      : 'bg-[#0b1329]/75 border-slate-800/80 hover:border-slate-705 text-slate-300 hover:bg-[#111c3a]'
                  }`}
                >
                  <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${
                    selectedSpecialtyFilter === 'All' ? 'bg-white/10 text-cyan-300 hover:rotate-6 transition-all' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/10'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold font-sans">All Departments</h5>
                  <p className="text-[9px] text-cyan-400/85 mt-1 font-mono uppercase tracking-wider font-bold">Full Care</p>
                </button>

                {SPECIALTIES.map(spec => (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialtyFilter(spec.name)}
                    className={`p-4 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
                      selectedSpecialtyFilter === spec.name
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/30 text-white shadow-xl shadow-cyan-500/10 font-bold scale-[1.02]'
                        : 'bg-[#0b1329]/75 border-slate-800/80 hover:border-slate-705 text-slate-350 hover:bg-[#111c3a]'
                    }`}
                  >
                    <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-300 ${
                      selectedSpecialtyFilter === spec.name ? 'bg-white/10 text-cyan-300' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/10'
                    }`}>
                      <SpecialtyIcon name={spec.iconName} className="w-4.5 h-4.5" />
                    </div>
                    <h5 className="text-xs font-bold leading-tight font-sans text-left truncate block">{spec.name}</h5>
                    <p className="text-[10px] text-slate-450 text-left line-clamp-1 mt-1 font-sans">{spec.description.slice(0, 32)}...</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Doctors finder list section */}
            <section className="space-y-6 pt-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-bold">Shifa Clinical Guild</span>
                  <h3 className="font-sans font-bold text-2xl text-white tracking-tight mt-1">
                    Meet Our Specialist Doctors
                  </h3>
                  <p className="text-xs text-slate-405 text-slate-400 mt-1">
                    Currently filtering: <span className="font-semibold text-cyan-400">{selectedSpecialtyFilter} doctors</span>
                  </p>
                </div>

                {/* Live doctor search input */}
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search doctor by name / qualifications..."
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-slate-800 bg-[#0b1329]/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
                  />
                  {doctorSearchQuery && (
                    <button 
                      onClick={() => setDoctorSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-400 text-xs font-mono font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map(doctor => (
                    <DoctorCard 
                      key={doctor.id} 
                      doctor={doctor} 
                      onBookClick={handleInitiateBooking} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#0b1329]/50 border border-slate-800 rounded-3xl p-6 space-y-3.5">
                  <div className="w-12 h-12 bg-slate-950 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                    <AlertCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-white text-sm">No doctors match your query</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">We might not have an active practitioner for the chosen department query. Try switching specialties above.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSpecialtyFilter('All');
                      setDoctorSearchQuery('');
                    }}
                    className="px-5 py-2 bg-slate-900 text-slate-200 text-xs font-bold rounded-full border border-slate-800 hover:bg-[#111c3a] hover:text-white transition cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                </div>
              )}
            </section>

            {/* Diagnostic list and Branch Locations */}
            <section className="bg-gradient-to-br from-[#0c142b]/60 to-[#05080f]/90 rounded-3xl p-6 sm:p-10 border border-slate-850/70 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl backdrop-blur-md">
              <div className="space-y-4 text-left">
                <span className="text-[10px] tracking-wider uppercase font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/45 px-3 py-1 rounded-full font-bold">
                  Diagnostic Services
                </span>
                <h4 className="font-sans font-bold text-xl text-white">In-house Medical Testing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our core hub departments offer rapid, certified pathology and diagnostic screenings right after your OPD consultation:
                </p>
                <ul className="text-xs text-slate-300 space-y-2.5 font-sans">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                    Complete Blood Count (CBC) & Sugar Profile (₹150)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                    Standard Clinical ECG (₹250)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                    Maternal & Obstetrics Ultrasound (₹600)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                    Child Nebulization & Allergy checks
                  </li>
                </ul>
              </div>

              {/* Branch list in full detail */}
              <div className="md:col-span-2 space-y-4 text-left">
                <span className="text-[10px] tracking-wider uppercase font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/45 px-3 py-1 rounded-full font-bold">
                  Our Branches
                </span>
                <h4 className="font-sans font-bold text-xl text-white">Authorized Shifa Branches</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CLINIC_BRANCHES.map(branch => (
                    <div key={branch.id} className="bg-slate-950/70 border border-slate-850/80 p-5 rounded-3xl space-y-2 hover:border-slate-800 transition duration-300">
                      <h5 className="font-sans font-bold text-sm text-cyan-300">{branch.name}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{branch.address}</p>
                      
                      <div className="pt-2 border-t border-slate-900/60 text-[10px] text-slate-450 font-mono flex flex-col gap-1">
                        <span>Timings: <strong className="text-cyan-400 font-extrabold">{branch.timings}</strong></span>
                        <span>Contact: <strong className="text-slate-300 font-sans">{branch.phone}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW B: BOOKING SLIP FORM */}
        {activeTab === 'book' && (
          <div className="space-y-6">
            {!patientUser ? (
              <div className="max-w-md mx-auto bg-gradient-to-b from-[#0b1329] to-[#05080f] border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-center backdrop-blur-md">
                <div className="w-12 h-12 bg-cyan-950 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-800/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-lg text-white">Check-In Session Required</h3>
                  <p className="text-xs text-slate-450 leading-normal max-w-xs mx-auto font-sans">
                    Please establish your clinical check-in desk session first to prepare your digital queue token slips.
                  </p>
                </div>
                <PatientCheckinForm onLogin={handlePatientLogin} />
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs text-slate-450 hover:text-white font-bold cursor-pointer block mx-auto pt-2"
                >
                  ← Return to Doctor Hub
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleInitiateBooking(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer flex items-center gap-1 mb-2 bg-[#0b1329]/85 px-4 py-2 rounded-full border border-slate-800 shadow-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                  Reset Form Selection
                </button>
                <AppointmentForm 
                  preselectedDoctor={selectedDoctorForBooking}
                  onAppointmentBooked={handleAddAppointment}
                  onCancel={() => {
                    setSelectedDoctorForBooking(null);
                    setActiveTab('home');
                  }}
                  patientUser={patientUser}
                />
              </>
            )}
          </div>
        )}

        {/* VIEW C: APPOINTMENT list DASHBOARD TICKETS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {!patientUser ? (
              <div className="max-w-md mx-auto bg-gradient-to-b from-[#0b1329] to-[#05080f] border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-center backdrop-blur-md">
                <div className="w-12 h-12 bg-cyan-950 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-800/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-lg text-white">Patient Register Lookup</h3>
                  <p className="text-xs text-slate-455 leading-normal max-w-xs mx-auto text-slate-450">
                    Check-in with your email address to instantly query and monitor your active OPD queue registers.
                  </p>
                </div>
                <PatientCheckinForm onLogin={handlePatientLogin} />
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs text-slate-455 hover:text-white font-bold cursor-pointer block mx-auto pt-2"
                >
                  ← Return to Doctor Hub
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center bg-[#0b1329]/95 text-white p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
                  <div>
                    <h2 className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white">Active OPD Registers</h2>
                    <p className="text-xs text-slate-400 mt-1 font-sans font-medium">Active queue tickets retrieved for {patientUser.email}.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-405 hover:to-blue-550 text-white font-bold px-5 py-2.5 rounded-full border border-cyan-400/20 transition cursor-pointer"
                  >
                    Go to Doctor Hub
                  </button>
                </div>

                <AppointmentList 
                  appointments={appointments}
                  onCancelAppointment={handleCancelAppointment}
                  onBookNewClick={() => handleInitiateBooking(null)}
                />
              </>
            )}
          </div>
        )}

        {/* VIEW D: ADMIN SYSTEM PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <AdminPanel 
              appointments={appointments}
              onCancelAppointment={handleCancelAppointment}
              onRefresh={fetchAppointments}
            />
          </div>
        )}

      </main>

      {/* 3. UNIVERSAL FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-300 pt-16 pb-10 px-4 sm:px-6 lg:px-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-850 text-xs sm:text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg flex items-center justify-center border border-cyan-400/25 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-sans font-bold text-white text-lg tracking-tight">Shifa CarePlus</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs font-sans">
              State authorized multi-specialty out-patient health clinic offering diagnostics, vaccines, counseling and pharmacy checks under one trust emblem.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-4">Contact Helplines</h5>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="font-medium text-white flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                Emergency Line: <br />
                <span className="text-rose-400 font-mono font-bold">{CLINIC_INFO.emergencyPhone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                General Help: {CLINIC_INFO.generalPhone}
              </p>
              <p className="flex items-center gap-1.5">
                Email Support: {CLINIC_INFO.email}
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-4">Timings & Days</h5>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Monday - Sunday: <br /><strong className="text-white font-mono">{CLINIC_INFO.timings}</strong></p>
              <p className="italic text-[11px] text-slate-500">Emergency trauma diagnostics active 24 Hours weekly with prior notification.</p>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-4 font-sans">Digital OPD Help</h5>
            <div className="space-y-2.5 text-xs text-slate-400 font-sans">
              <p><strong>How to book online?</strong> <br />Click "Book Slot" under any doctor, enter contact details, and receive your digital entrance token instantly.</p>
              <p className="italic text-[11px] text-slate-500">Need immediate assistance? Click the support icon in the bottom right corner to speak with our live desk.</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 text-center gap-4">
          <p>© 2026 Shifa CarePlus Clinical Systems Corp. All rights reserved.</p>
          <p className="font-mono text-[10px] tracking-wide text-slate-650 uppercase">
            Designed for Instant OPD Token Management & Patient Ease
          </p>
        </div>
      </footer>
      
      <ChatSupport />
    </div>
  );
}
