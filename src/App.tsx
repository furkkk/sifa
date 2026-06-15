/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Stethoscope, Baby, HeartPulse, Activity, Sparkles, Smile,
  PhoneCall, MapPin, Clock, ShieldCheck, Heart, Sparkle, CalendarDays,
  Menu, X, BadgeAlert, Plus, Layers, Laptop, AlertCircle, ArrowUpRight,
  ArrowLeft, LockKeyhole
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
    <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans text-zinc-800">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-500 font-bold">Your Full Name (मरीज़ का नाम)</label>
        <input 
          type="text" 
          required
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 px-4 py-2.5 text-xs text-zinc-900 outline-none focus:border-black bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-500 font-bold">Email Address (ईमेल)</label>
        <input 
          type="email" 
          required
          placeholder="e.g. rahul@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 px-4 py-2.5 text-xs text-zinc-900 outline-none focus:border-black bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-500 font-bold flex justify-between">
          <span>Mobile Phone Number (मोबाइल नंबर)</span>
          <span className="text-[10px] text-zinc-600 font-semibold normal-case">Required for cloud records</span>
        </label>
        <input 
          type="tel" 
          placeholder="e.g. +91 99887 76655"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 px-4 py-2.5 text-xs text-zinc-900 outline-none focus:border-black bg-white"
        />
      </div>

      {hasEmail ? (
        !hasPhone ? (
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-2xl text-[10.5px] leading-relaxed select-none text-left">
            ✓ <strong>Local Session Activated (Email Only):</strong> Your email will represent your clinical identity. To save securely to cloud database records and view under worker ledger, please supply a phone number.
          </div>
        ) : (
          <div className="p-3.5 bg-zinc-50 border border-zinc-250 text-emerald-850 rounded-2xl text-[10.5px] leading-relaxed select-none text-left">
            ✓ <strong>Cloud Sync Activated:</strong> Mobile and email provided. Your consultation registers and helpdesk chats will be securely saved to backend database storage.
          </div>
        )
      ) : null}

      <button
        type="submit"
        className="w-full bg-black hover:bg-zinc-800 text-white text-xs font-semibold py-3 rounded-full cursor-pointer transition uppercase tracking-wider text-center"
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
      // If we are in the admin tab, we want to load all appointments
      if (patientUser?.email && activeTab !== 'admin') {
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
      // Apply offline fallback email filtering if not in admin tab
      if (patientUser?.email && activeTab !== 'admin') {
        displayApts = displayApts.filter(apt => apt.patientEmail && apt.patientEmail.toLowerCase().trim() === patientUser.email.toLowerCase().trim());
      }
      setAppointments(displayApts);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientUser?.email, activeTab]);

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
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-black selection:text-white font-sans antialiased text-zinc-900">
      
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
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-50 text-black rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200">
                <Smile className="w-5.5 h-5.5 text-zinc-800" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Checked-in Patient Session</p>
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-sm text-zinc-900">{patientUser.name}</h4>
                  {patientUser.isSaved ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded-full text-[9px] font-bold border border-zinc-200">
                      Sync Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-50 text-amber-700 rounded-full text-[9px] font-semibold border border-zinc-200 animate-pulse">
                      Not Saved (Email only)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 font-sans font-medium">
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
                className="px-4.5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-full cursor-pointer transition"
              >
                My OPD Tickets
              </button>
              <button
                onClick={handlePatientLogout}
                className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-650 hover:text-black text-xs font-bold rounded-full cursor-pointer transition animate-fade-in"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden text-left animate-fade-in">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-zinc-50 text-zinc-850 border border-zinc-200 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wide uppercase font-bold">
                Patient Self Check-In
              </span>
              <h4 className="font-sans font-bold text-base text-zinc-900 tracking-tight">Check-In With Email and Phone Prior to OPD Booking</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed max-w-2xl font-sans">
                Please register your session. This ensures clinical helpdesk tickets can search and store chats and queue slots securely.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-black hover:bg-zinc-855 text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer transition shrink-0"
            >
              Sign In / Session Check-In
            </button>
          </div>
        )}

        {/* VIEW A: HOME - CLINIC GENERAL PORTAL */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* Elegant Hero Slider section with Urdu/Hindi easy guide banner */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 text-zinc-900 relative overflow-hidden border border-zinc-200 shadow-xs">
              <div className="max-w-3xl space-y-6 relative z-10 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-50 text-zinc-800 rounded-full text-xs font-mono tracking-wider uppercase border border-zinc-200 font-bold">
                  <Sparkle className="w-3.5 h-3.5 text-zinc-800" />
                  Live Digital Appointment Portal - 2026
                </span>

                <h2 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-neutral-950">
                  Expert Clinicians. <br />
                  <span className="text-zinc-650 text-zinc-700">Zero Wait Lobby Counter.</span>
                </h2>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl font-medium font-sans">
                  {CLINIC_INFO.tagline}. Simply reserve your OPD slot online, get an instant queue token number, and get prioritized medical diagnostics at your selected time.
                </p>

                {/* Patient Quick Instruction banner (Urdu/Hindi) */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs space-y-1 max-w-lg">
                  <p className="font-bold text-black flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 shrink-0 text-black" />
                    क्लीनिक विजिट के लिए आसान गाइड:
                  </p>
                  <p className="text-zinc-600 leading-normal font-sans font-medium select-none">
                    १. नीचे अपनी पसंद के डॉक्टर चुनें। २. तारीख और "टाइम स्लॉट" सिलेक्ट करें। ३. तुरंत अपना OPD टोकन काउंटर पर दिखाएं और सीधे डॉक्टर से मिलें!
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={() => handleInitiateBooking(null)}
                    className="bg-black hover:bg-zinc-800 font-extrabold text-xs sm:text-sm text-white px-6 py-4 rounded-full transition duration-300 shadow-xs cursor-pointer flex items-center gap-2 active:scale-98"
                  >
                    <Plus className="w-4 h-4 text-white stroke-[3.0]" />
                    Book Live OPD Appointment Now
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 hover:text-black font-bold text-xs sm:text-sm px-6 py-4 rounded-full transition duration-250 border border-zinc-220 cursor-pointer flex items-center gap-2 active:scale-98"
                  >
                    <CalendarDays className="w-4 h-4 text-zinc-900 animate-pulse" />
                    Check My Token Status
                  </button>
                </div>
              </div>
            </section>

            {/* Quick stats / Features bar */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-200 rounded-3xl p-5 flex items-start gap-3.5 hover:border-zinc-350 transition duration-300 text-left">
                <div className="p-2.5 bg-zinc-50 text-zinc-805 rounded-xl border border-zinc-200">
                  <ShieldCheck className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-zinc-905 text-sm">Verified Doctors</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Top-rated specialist staff</p>
                </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-3xl p-5 flex items-start gap-3.5 hover:border-zinc-350 transition duration-300 text-left">
                <div className="p-2.5 bg-zinc-50 text-zinc-805 rounded-xl border border-zinc-200">
                  <Clock className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-zinc-905 text-sm">Open 7 Days</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">8:00 AM to 10:00 PM</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-5 flex items-start gap-3.5 hover:border-zinc-350 transition duration-300 text-left">
                <div className="p-2.5 bg-zinc-50 text-zinc-805 rounded-xl border border-zinc-200">
                  <HeartPulse className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-zinc-905 text-sm">5-Day Free Recheck</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Complementary review checks</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-5 flex items-start gap-3.5 hover:border-zinc-350 transition duration-300 text-left">
                <div className="p-2.5 bg-zinc-50 text-zinc-805 rounded-xl border border-zinc-200">
                  <PhoneCall className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-zinc-905 text-sm">Direct Helpdesk</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">{CLINIC_INFO.generalPhone}</p>
                </div>
              </div>
            </section>

            {/* Specialties & Clinical Departments Selection */}
            <section className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2 animate-fade-in">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-900 font-bold bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full shadow-sm">Departments</span>
                <h3 className="font-sans font-bold text-2xl text-zinc-900 tracking-tight">Browse Clinical Specialties</h3>
                <p className="text-xs text-zinc-500 leading-normal font-sans">
                  Choose a department below to show our qualified medical practitioner lists immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                <button
                  onClick={() => setSelectedSpecialtyFilter('All')}
                  className={`p-4 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
                    selectedSpecialtyFilter === 'All'
                      ? 'bg-black border-black text-white font-bold scale-[1.02] shadow-xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-350 text-zinc-650 hover:bg-zinc-50'
                  }`}
                >
                  <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${
                    selectedSpecialtyFilter === 'All' ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900 border border-zinc-200'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold font-sans">All Departments</h5>
                  <p className={`text-[9px] mt-1 font-mono uppercase tracking-wider font-bold ${selectedSpecialtyFilter === 'All' ? 'text-zinc-200' : 'text-zinc-505'}`}>Full Care</p>
                </button>

                {SPECIALTIES.map(spec => (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialtyFilter(spec.name)}
                    className={`p-4 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
                      selectedSpecialtyFilter === spec.name
                        ? 'bg-black border-black text-white font-bold scale-[1.02] shadow-xs'
                        : 'bg-white border-zinc-200 hover:border-zinc-350 text-zinc-650 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-350 ${
                      selectedSpecialtyFilter === spec.name ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900 border border-zinc-200'
                    }`}>
                      <SpecialtyIcon name={spec.iconName} className="w-4.5 h-4.5" />
                    </div>
                    <h5 className="text-xs font-bold leading-tight font-sans text-left truncate block">{spec.name}</h5>
                    <p className={`text-[10px] text-left line-clamp-1 mt-1 font-sans ${selectedSpecialtyFilter === spec.name ? 'text-zinc-300' : 'text-zinc-500'}`}>{spec.description.slice(0, 32)}...</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Doctors finder list section */}
            <section className="space-y-6 pt-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-200 pb-5">
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-550 text-zinc-500 font-bold">Shifa Clinical Guild</span>
                  <h3 className="font-sans font-bold text-2xl text-zinc-905 text-zinc-900 tracking-tight mt-1">
                    Meet Our Specialist Doctors
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Currently filtering: <span className="font-bold text-black">{selectedSpecialtyFilter} doctors</span>
                  </p>
                </div>

                {/* Live doctor search input */}
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search doctor by name / qualifications..."
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-black outline-none transition"
                  />
                  {doctorSearchQuery && (
                    <button 
                      onClick={() => setDoctorSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-black text-xs font-mono font-bold cursor-pointer"
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
                <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl p-6 space-y-3.5">
                  <div className="w-12 h-12 bg-zinc-50 text-zinc-400 rounded-full flex items-center justify-center mx-auto border border-zinc-200">
                    <AlertCircle className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-zinc-900 text-sm">No doctors match your query</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">We might not have an active practitioner for the chosen department query. Try switching specialties above.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSpecialtyFilter('All');
                      setDoctorSearchQuery('');
                    }}
                    className="px-5 py-2 bg-black text-white text-xs font-bold rounded-full border border-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                </div>
              )}
            </section>

            {/* Diagnostic list and Branch Locations */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xs">
              <div className="space-y-4 text-left">
                <span className="text-[10px] tracking-wider uppercase font-mono text-zinc-900 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full font-bold">
                  Diagnostic Services
                </span>
                <h4 className="font-sans font-bold text-xl text-zinc-950">In-house Medical Testing</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Our core hub departments offer rapid, certified pathology and diagnostic screenings right after your OPD consultation:
                </p>
                <ul className="text-xs text-zinc-650 space-y-2.5 font-sans">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    Complete Blood Count (CBC) & Sugar Profile (₹150)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    Standard Clinical ECG (₹250)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    Maternal & Obstetrics Ultrasound (₹600)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    Child Nebulization & Allergy checks
                  </li>
                </ul>
              </div>

              {/* Branch list in full detail */}
              <div className="md:col-span-2 space-y-4 text-left">
                <span className="text-[10px] tracking-wider uppercase font-mono text-zinc-900 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full font-bold">
                  Our Branches
                </span>
                <h4 className="font-sans font-bold text-xl text-zinc-950">Authorized Shifa Branches</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CLINIC_BRANCHES.map(branch => (
                    <div key={branch.id} className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl space-y-2 hover:border-zinc-300 transition duration-300">
                      <h5 className="font-sans font-bold text-sm text-zinc-950">{branch.name}</h5>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{branch.address}</p>
                      
                      <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-400 font-mono flex flex-col gap-1">
                        <span>Timings: <strong className="text-black font-extrabold">{branch.timings}</strong></span>
                        <span>Contact: <strong className="text-zinc-600 font-sans">{branch.phone}</strong></span>
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
              <div className="max-w-md mx-auto bg-white border border-zinc-200 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6 text-center animate-fade-in">
                <div className="w-12 h-12 bg-zinc-50 text-black rounded-full flex items-center justify-center mx-auto border border-zinc-200">
                  <ShieldCheck className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-lg text-zinc-900">Check-In Session Required</h3>
                  <p className="text-xs text-zinc-505 leading-normal max-w-xs mx-auto font-sans">
                    Please establish your clinical check-in desk session first to prepare your digital queue token slips.
                  </p>
                </div>
                <PatientCheckinForm onLogin={handlePatientLogin} />
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs text-zinc-500 hover:text-black font-bold cursor-pointer block mx-auto pt-2"
                >
                  ← Return to Doctor Hub
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleInitiateBooking(null)}
                  className="text-xs text-zinc-650 hover:text-black font-bold cursor-pointer flex items-center gap-1 mb-2 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-xs text-left"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-black" />
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
              <div className="max-w-md mx-auto bg-white border border-zinc-200 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6 text-center">
                <div className="w-12 h-12 bg-zinc-50 text-black rounded-full flex items-center justify-center mx-auto border border-zinc-200">
                  <ShieldCheck className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-lg text-zinc-900">Patient Register Lookup</h3>
                  <p className="text-xs text-zinc-500 leading-normal max-w-xs mx-auto text-zinc-505">
                    Check-in with your email address to instantly query and monitor your active OPD queue registers.
                  </p>
                </div>
                <PatientCheckinForm onLogin={handlePatientLogin} />
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs text-zinc-500 hover:text-black font-bold cursor-pointer block mx-auto pt-2"
                >
                  ← Return to Doctor Hub
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center bg-black text-white p-6 rounded-3xl border border-zinc-800 shadow-sm text-left">
                  <div>
                    <h2 className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white">Active OPD Registers</h2>
                    <p className="text-xs text-zinc-300 mt-1 font-sans font-medium">Active queue tickets retrieved for {patientUser.email}.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-xs bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold px-5 py-2.5 rounded-full border border-white transition cursor-pointer"
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

        {/* WORKER DOOR BOTTOM CARD ACCORDION (NICHA OPTION RAKHO) */}
        {activeTab !== 'admin' && (
          <div className="mt-16 pt-8 border-t border-zinc-200 max-w-3xl mx-auto text-center font-sans">
            <div className="bg-white border-2 border-zinc-300 rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-xs hover:border-black transition-all">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-black"></div>
              
              <div className="flex flex-col items-center gap-1.5 text-zinc-900">
                <LockKeyhole className="w-8 h-8 text-black" />
                <h4 className="font-bold text-base tracking-tight uppercase">
                  Staff Worker Entrance / स्टाफ प्रवेश द्वार
                </h4>
                <p className="text-xs text-zinc-600 font-medium max-w-md mx-auto block leading-relaxed">
                  ⚠️ <strong>ONLY FOR WORKER - NO PUBLIC USER</strong> <br />
                  सिर्फ क्लीनिक स्टाफ और कर्मचारियों के लिए - आम मरीजों और जनता के लिए नहीं
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-black hover:bg-zinc-800 text-white font-extrabold text-xs px-8 py-3 rounded-full uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Enter Worker Panel (कर्मचारी लॉग-इन)
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. UNIVERSAL FOOTER */}
      <footer className="bg-zinc-100 border-t border-zinc-200 text-zinc-650 pt-16 pb-10 px-4 sm:px-6 lg:px-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-200 text-xs sm:text-sm text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-black text-white rounded-lg flex items-center justify-center border border-black shadow-xs">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-sans font-bold text-zinc-950 text-lg tracking-tight">Shifa CarePlus</span>
            </div>
            <p className="text-zinc-500 leading-relaxed text-xs font-sans">
              State authorized multi-specialty out-patient health clinic offering diagnostics, vaccines, counseling and pharmacy checks under one trust emblem.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4">Contact Helplines</h5>
            <div className="space-y-2.5 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-black" />
                Emergency Line: <br />
                <span className="text-zinc-950 font-mono font-black">{CLINIC_INFO.emergencyPhone}</span>
              </p>
              <p className="flex items-center gap-1.5 text-zinc-500">
                General Help: {CLINIC_INFO.generalPhone}
              </p>
              <p className="flex items-center gap-1.5 text-zinc-500">
                Email Support: {CLINIC_INFO.email}
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4">Timings & Days</h5>
            <div className="space-y-2 text-xs text-zinc-500">
              <p>Monday - Sunday: <br /><strong className="text-zinc-900 font-mono font-bold">{CLINIC_INFO.timings}</strong></p>
              <p className="italic text-[11px] text-zinc-400">Emergency trauma diagnostics active 24 Hours weekly with prior notification.</p>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4 font-sans">Digital OPD Help</h5>
            <div className="space-y-2.5 text-xs text-zinc-500 font-sans">
              <p><strong>How to book online?</strong> <br />Click "Book Slot" under any doctor, enter contact details, and receive your digital entrance token instantly.</p>
              <p className="italic text-[11px] text-zinc-400">Need worker assistance? Click the worker login tab at the bottom of the page or contact direct help desk.</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 text-center gap-4">
          <p>© 2026 Shifa CarePlus Clinical Systems Corp. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[10px] text-zinc-600 hover:text-black font-semibold uppercase tracking-wider underline cursor-pointer"
            >
              Worker Panel Login
            </button>
            <span>•</span>
            <span className="font-mono text-[10px] tracking-wide text-zinc-450 uppercase font-bold">
              Instant OPD Token Management
            </span>
          </div>
        </div>
      </footer>
      
      <ChatSupport />
    </div>
  );
}
