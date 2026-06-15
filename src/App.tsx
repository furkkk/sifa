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

export default function App() {
  // Navigation active state
  // 'home' | 'appointments' | 'book' | 'admin'
  const [activeTab, setActiveTab ] = useState<string>('home');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // App State - Appointments list pulled from DB backend API with local cache
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Filtering states on Homepage
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');

  // Fetch appointments from DB
  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        throw new Error("API responded with error");
      }
    } catch (err) {
      console.warn("Could not load backend appointments - falling back to client localStorage:", err);
      const saved = localStorage.getItem('shifa_appointments');
      if (saved) {
        try {
          setAppointments(JSON.parse(saved));
        } catch (e) {
          setAppointments(INITIAL_APPOINTMENTS);
        }
      } else {
        setAppointments(INITIAL_APPOINTMENTS);
        localStorage.setItem('shifa_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 font-sans antialiased text-slate-800">
      
      {/* 1. TOP HEADER & NAVBAR */}
      <Header 
        onBookClick={() => handleInitiateBooking(null)}
        onViewAppointmentsClick={() => setActiveTab('appointments')}
        onViewAdminClick={() => setActiveTab('admin')}
        activeTab={activeTab}
      />

      {/* 2. CHOOSE CURRENT MAIN VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-10 py-8 md:py-12 space-y-12">
        
        {/* VIEW A: HOME - CLINIC GENERAL PORTAL */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* Elegant Hero Slider section with Urdu/Hindi easy guide banner */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-10 lg:p-14 text-white relative overflow-hidden border border-slate-800 shadow-md">
              {/* Absolutes decorative blobs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-550 rounded-full mix-blend-screen filter blur-3xl opacity-5 -ml-20 -mb-20"></div>

              <div className="max-w-3xl space-y-6 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs font-mono tracking-wider uppercase border border-blue-500/20 font-semibold">
                  <Sparkle className="w-3.5 h-3.5 text-blue-400" />
                  Live Digital Appointment Portal - 2026
                </span>

                <h2 className="font-sans font-semibold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                  Expert Clinicians. <br />
                  <span className="text-blue-400">Zero Wait Lobby Counter.</span>
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                  {CLINIC_INFO.tagline}. Simply reserve your OPD slot online, get an instant queue token number, and get prioritized medical diagnostics at your selected time.
                </p>

                {/* Patient Quick Instruction banner (Urdu/Hindi) */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs space-y-1 max-w-lg">
                  <p className="font-semibold text-blue-400 flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 shrink-0" />
                    क्लीनिक विजिट के लिए आसान गाइड:
                  </p>
                  <p className="text-slate-300 leading-normal font-sans">
                    १. नीचे अपनी पसंद के डॉक्टर चुनें। २. तारीख और "टाइम स्लॉट" सिलेक्ट करें। ३. तुरंत अपना डिजिटल OPD टोकन काउंटर पर दिखाएं और सीधे डॉक्टर से मिलें!
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={() => handleInitiateBooking(null)}
                    className="bg-blue-600 hover:bg-blue-700 font-medium text-xs sm:text-sm text-white px-6 py-3.5 rounded-full transition duration-200 shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                    Book Live OPD Appointment Now
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="bg-white/5 hover:bg-white/10 text-white font-medium text-xs sm:text-sm px-6 py-3.5 rounded-full transition duration-200 border border-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-blue-400" />
                    Check My Token Status
                  </button>
                </div>
              </div>
            </section>

            {/* Quick stats / Features bar */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-slate-800 text-sm">Verified Doctors</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Top-rated specialist staff</p>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-slate-800 text-sm">Open 7 Days</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">8:00 AM to 10:00 PM</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-slate-800 text-sm">5-Day Free Recheck</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Complementary review checks</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-slate-800 text-sm">Direct Helpdesk</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{CLINIC_INFO.generalPhone}</p>
                </div>
              </div>
            </section>

            {/* Specialties & Clinical Departments Selection */}
            <section className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="font-sans font-semibold text-2xl text-slate-900 tracking-tight">Browse Clinical Specialties</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Choose a department below to show our qualified medical practitioner lists immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <button
                  onClick={() => setSelectedSpecialtyFilter('All')}
                  className={`p-4 rounded-3xl border text-center transition-all duration-250 cursor-pointer ${
                    selectedSpecialtyFilter === 'All'
                      ? 'bg-slate-900 border-slate-950 text-white shadow-sm font-semibold'
                      : 'bg-white border-slate-200 hover:border-blue-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="mx-auto w-10 h-10 rounded-full bg-blue-50/10 text-blue-400 flex items-center justify-center mb-2.5">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-semibold font-sans">All Departments</h5>
                  <p className="text-[10px] text-slate-400 mt-1">Full Clinical Care</p>
                </button>

                {SPECIALTIES.map(spec => (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialtyFilter(spec.name)}
                    className={`p-4 rounded-3xl border text-center transition-all duration-250 cursor-pointer ${
                      selectedSpecialtyFilter === spec.name
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-200 text-slate-800'
                    }`}
                  >
                    <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${
                      selectedSpecialtyFilter === spec.name ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <SpecialtyIcon name={spec.iconName} className="w-4.5 h-4.5" />
                    </div>
                    <h5 className="text-xs font-semibold leading-tight font-sans text-left line-clamp-1 truncate block">{spec.name}</h5>
                    <p className="text-[10px] text-slate-450 text-left line-clamp-2 mt-1 leading-snug">{spec.description.slice(0, 35)}...</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Doctors finder list section */}
            <section className="space-y-6 pt-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-blue-600 font-semibold">Shifa Clinical Guild</span>
                  <h3 className="font-sans font-semibold text-2xl text-slate-900 tracking-tight mt-1">
                    Meet Our Specialist Doctors
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">
                    Currently filtering: <span className="font-semibold text-blue-600">{selectedSpecialtyFilter} doctors</span>
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
                    className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {doctorSearchQuery && (
                    <button 
                      onClick={() => setDoctorSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 text-xs font-mono font-bold cursor-pointer"
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
                <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-6 space-y-3.5">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-slate-700 text-sm">No doctors match your query</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">We might not have an active practitioner for the chosen department query. Try switching specialties above.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSpecialtyFilter('All');
                      setDoctorSearchQuery('');
                    }}
                    className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-205 transition cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                </div>
              )}
            </section>

            {/* Diagnostic list and Branch Locations */}
            <section className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/65 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <span className="text-[10px] tracking-wider uppercase font-mono text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-semibold">
                  Diagnostic Services
                </span>
                <h4 className="font-sans font-semibold text-xl text-slate-900">In-house Medical Testing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our core hub departments offer rapid, certified pathology and diagnostic screenings right after your OPD consultation:
                </p>
                <ul className="text-xs text-slate-600 space-y-2.5 font-sans">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Complete Blood Count (CBC) & Sugar Profile (₹150)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Standard Clinical ECG (₹250)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Maternal & Obstetrics Ultrasound (₹600)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Child Nebulization & Allergy checks
                  </li>
                </ul>
              </div>

              {/* Branch list in full detail */}
              <div className="md:col-span-2 space-y-4">
                <span className="text-[10px] tracking-wider uppercase font-mono text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-semibold">
                  Our Branches
                </span>
                <h4 className="font-sans font-semibold text-xl text-slate-900">Authorized Shifa Branches</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CLINIC_BRANCHES.map(branch => (
                    <div key={branch.id} className="bg-white border border-slate-200 p-5 rounded-3xl space-y-2">
                      <h5 className="font-sans font-semibold text-sm text-slate-900">{branch.name}</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{branch.address}</p>
                      
                      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex flex-col gap-1">
                        <span>Timings: <strong className="text-blue-650 font-semibold">{branch.timings}</strong></span>
                        <span>Contact: <strong className="text-slate-700 font-sans">{branch.phone}</strong></span>
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
            <button
              onClick={() => handleInitiateBooking(null)}
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold cursor-pointer flex items-center gap-1 mb-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Reset Form Selection
            </button>
            <AppointmentForm 
              preselectedDoctor={selectedDoctorForBooking}
              onAppointmentBooked={handleAddAppointment}
              onCancel={() => {
                setSelectedDoctorForBooking(null);
                setActiveTab('home');
              }}
            />
          </div>
        )}

        {/* VIEW C: APPOINTMENT list DASHBOARD TICKETS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl border border-slate-950">
              <div>
                <h2 className="font-sans font-semibold text-lg sm:text-xl tracking-tight">Active OPD Registers</h2>
                <p className="text-xs text-slate-400 mt-1 font-sans">Confirm your active queue position and download printer receipts.</p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Go to Doctor Hub
              </button>
            </div>

            <AppointmentList 
              appointments={appointments}
              onCancelAppointment={handleCancelAppointment}
              onBookNewClick={() => handleInitiateBooking(null)}
            />
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
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 pt-16 pb-10 px-10 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-850 text-xs sm:text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-sans font-semibold text-white text-lg tracking-tight">Shifa CarePlus</span>
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
