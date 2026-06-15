/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, Stethoscope, MapPin, Sparkles, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Doctor, ClinicBranch, Appointment } from '../types';
import { DOCTORS, CLINIC_BRANCHES, SPECIALTIES } from '../data';

interface AppointmentFormProps {
  preselectedDoctor: Doctor | null;
  onAppointmentBooked: (appointment: Appointment) => void;
  onCancel: () => void;
  patientUser: { name: string; email: string; phone: string; isSaved: boolean } | null;
}

export default function AppointmentForm({ preselectedDoctor, onAppointmentBooked, onCancel, patientUser }: AppointmentFormProps) {
  // Current date for min-date validation (formatted as YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Max date (e.g., 10 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 10);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Booking states
  const [selectedBranch, setSelectedBranch] = useState<ClinicBranch>(CLINIC_BRANCHES[0]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(preselectedDoctor?.specialty || SPECIALTIES[0].name);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preselectedDoctor);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // Patient details state
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');

  // Prefill registration details from active logged-in check-in session
  useEffect(() => {
    if (patientUser) {
      setPatientName(patientUser.name || '');
      setPatientPhone(patientUser.phone || '');
      setPatientEmail(patientUser.email || '');
    }
  }, [patientUser]);

  // UI Flow State
  const [step, setStep] = useState<number>(1); // 1: Consultation Details, 2: Patient Demographics, 3: Success Confirmation
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [recentApt, setRecentApt] = useState<Appointment | null>(null);

  // Update filtered doctors when specialty changes
  useEffect(() => {
    const doctorsOfSpecialty = DOCTORS.filter(doc => doc.specialty === selectedSpecialty);
    setFilteredDoctors(doctorsOfSpecialty);
    
    // If current selected doctor doesn't match the updated specialty, clear or select first
    if (!preselectedDoctor) {
      if (doctorsOfSpecialty.length > 0) {
        setSelectedDoctor(doctorsOfSpecialty[0]);
        setSelectedSlot('');
      } else {
        setSelectedDoctor(null);
        setSelectedSlot('');
      }
    }
  }, [selectedSpecialty, preselectedDoctor]);

  // Set first slot as default when doctor changes
  useEffect(() => {
    if (selectedDoctor && selectedDoctor.slots.length > 0) {
      setSelectedSlot(selectedDoctor.slots[0]);
    } else {
      setSelectedSlot('');
    }
  }, [selectedDoctor]);

  const handleNextStep = () => {
    setValidationError('');
    if (step === 1) {
      if (!selectedDoctor) {
        setValidationError('Please select a doctor.');
        return;
      }
      if (!selectedDate) {
        setValidationError('Please choose a preferred appointment date.');
        return;
      }
      if (!selectedSlot) {
        setValidationError('Please pick an available timing slot.');
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!patientName.trim()) {
      setValidationError('Patient Full Name is required.');
      return;
    }
    const ageNum = parseInt(patientAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setValidationError('Please enter a valid age between 1 and 120.');
      return;
    }

    const hasPhone = patientPhone.trim().length >= 8;
    const hasEmail = patientEmail.trim().length > 0;

    if (!hasPhone && !hasEmail) {
      setValidationError('Either Email or Phone number is required to book a session.');
      return;
    }

    if (hasEmail && !hasPhone) {
      // Allow booking but warn it won't be saved in database!
      console.log("Allowing booking without phone number (email-only user) - will skip backend save");
    } else if (!hasPhone) {
      setValidationError('Please enter a valid, reachable mobile number.');
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable network booking latency
    setTimeout(() => {
      const generatedToken = `OPD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        tokenNumber: generatedToken,
        doctor: selectedDoctor!,
        branch: selectedBranch,
        patientName: patientName.trim(),
        patientAge: ageNum,
        patientGender: patientGender,
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || 'walkin.patient@shifaclinic.com',
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        symptoms: symptoms.trim() || 'Routine wellness check',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };

      setRecentApt(newAppointment);
      setIsSubmitting(false);
      setStep(3); // Go to success screen
      onAppointmentBooked(newAppointment);
    }, 1200);
  };

  return (
    <div className="bg-neutral-950 rounded-3xl border border-neutral-900 shadow-2xl overflow-hidden max-w-2xl mx-auto text-neutral-200">
      {/* Header Banner */}
      <div className="bg-neutral-900 px-6 py-6 text-white relative border-b border-neutral-800">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-neutral-500">
          <Stethoscope className="w-24 h-24" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-sans text-xl font-extrabold tracking-tight">Book Professional OPD Ticket</h2>
            <p className="text-xs text-neutral-400 mt-1">Get immediate consultation token numbers on your screen.</p>
          </div>
          {step < 3 && (
            <button 
              onClick={onCancel}
              className="text-neutral-300 hover:text-white text-xs border border-neutral-800 hover:border-neutral-700 px-3.5 py-1.5 rounded-full transition-colors bg-neutral-950 cursor-pointer"
            >
              Back to Home
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mt-5">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-neutral-800'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-neutral-800'}`}></div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 pl-2">Step {step} of 2</span>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {validationError && (
          <div className="mb-6 p-4 bg-neutral-900 border-l-4 border-cyan-400 text-neutral-200 rounded-r-xl text-xs font-mono">
            {validationError}
          </div>
        )}

        {/* STEP 1: CONSULTATION SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            {/* 1. Branch Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Select clinic branch (ब्रांच चुनें)
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {CLINIC_BRANCHES.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranch(branch)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedBranch.id === branch.id
                        ? 'border-cyan-400 bg-cyan-950/15 ring-1 ring-cyan-400/30 text-white'
                        : 'border-neutral-900 hover:border-neutral-800 bg-neutral-900/40 text-neutral-305'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-neutral-100">{branch.name}</span>
                      {selectedBranch.id === branch.id && (
                        <span className="text-[10px] font-semibold text-cyan-400 bg-neutral-950 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{branch.address}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{branch.timings}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Specialty & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                  Medical Specialty (विभाग)
                </label>
                <select
                  disabled={preselectedDoctor !== null}
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full rounded-full border border-neutral-900 bg-neutral-900 px-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none disabled:bg-neutral-950 disabled:text-neutral-500 cursor-pointer"
                >
                  {SPECIALTIES.map(spec => (
                    <option key={spec.id} value={spec.name}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Physician / Specialty Doctor (डॉक्टर)
                </label>
                <select
                  disabled={preselectedDoctor !== null}
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doc = DOCTORS.find(d => d.id === e.target.value);
                    if (doc) setSelectedDoctor(doc);
                  }}
                  className="w-full rounded-full border border-neutral-900 bg-neutral-900 px-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none disabled:bg-neutral-950 disabled:text-neutral-500 cursor-pointer"
                >
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.qualification})</option>
                    ))
                  ) : (
                    <option value="">No doctors available</option>
                  )}
                </select>
              </div>
            </div>

            {/* 3. Date & Available Slots */}
            {selectedDoctor && (
              <div className="bg-neutral-905 border border-neutral-900 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      Consultation Date (दिनांक)
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      max={maxDateStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer font-sans"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      Doctor consultation Fee
                    </span>
                    <div className="h-10 flex items-center pl-1">
                      <span className="font-sans font-extrabold text-white text-xl tracking-tight flex items-baseline">
                        <span className="text-cyan-400 mr-1">₹{selectedDoctor.fees}</span>
                        <span className="text-xs text-neutral-400 font-normal">/ Rs. {selectedDoctor.fees * 2} (Counter)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Available timing slots (समय चुनें)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedDoctor.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-full border text-center font-mono text-[11px] font-semibold transition-all duration-155 cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-white border-white text-black shadow-sm font-extrabold'
                            : 'bg-neutral-900 border-neutral-850 hover:border-neutral-750 text-neutral-300 hover:bg-neutral-850'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Proceed bar */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
              <span className="text-xs text-neutral-400 italic">Pre-booking guarantees minimal wait time.</span>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1 transition-all cursor-pointer"
              >
                Proceed to Patient Details
                <ChevronRight className="w-4 h-4 text-black stroke-[3.0]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PATIENT DEMOGRAPHICS */}
        {step === 2 && (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {patientEmail && (!patientPhone || patientPhone.trim() === "") && (
              <div className="p-4 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-2xl text-[11px] leading-relaxed">
                ⚠️ <strong className="text-cyan-400">Email-Only Session Warning:</strong> Since you only entered an email and left the mobile number blank, your appointment register and OPD ticket <strong>will NOT be saved to our database system</strong>. Cloud storage requires both a phone number and an email.
              </div>
            )}
            <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 text-[11px] text-neutral-300 leading-relaxed flex gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong className="text-white">Please supply correct demographic details.</strong> This forms the medical record database for your token printout. Your primary diagnosis / symptoms description will assist the doctor beforehand.
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-1.5">
                Patient's Full Name (मरीज़ का नाम) <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma or Fatima Syeda"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-full border border-neutral-900 bg-neutral-900 pl-10 pr-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-1.5">
                  Age (आयु) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Years"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full rounded-full border border-neutral-900 bg-neutral-900 px-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-1.5">
                  Gender (लिंग)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((genderOption) => (
                    <button
                      key={genderOption}
                      type="button"
                      onClick={() => setPatientGender(genderOption)}
                      className={`py-3 px-1 rounded-full border text-center text-xs font-semibold transition-all ${
                        patientGender === genderOption
                          ? 'border-cyan-400 bg-cyan-950/20 text-white'
                          : 'border-neutral-900 hover:border-neutral-805 text-neutral-400 bg-neutral-900/40'
                      }`}
                    >
                      {genderOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-1.5">
                  Mobile Number (मोबाइल नंबर) <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full rounded-full border border-neutral-900 bg-neutral-900 pl-10 pr-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-1.5">
                  Email Address (ईमेल)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. patient@gmail.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full rounded-full border border-neutral-900 bg-neutral-900 pl-10 pr-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms textbox */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-1.5">
                Brief symptoms / Reason for booking (बीमारी के लक्षण)
              </label>
              <textarea
                placeholder="e.g. High fever since yesterday, acute joint pain, regular sugar inspection, routine pregnancy ultrasound etc..."
                value={symptoms}
                rows={3}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full rounded-2xl border border-neutral-900 bg-neutral-900 px-5 py-3 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-4.5 py-2.5 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white font-medium text-xs rounded-full flex items-center gap-1 transition-all cursor-pointer disabled:opacity-55"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Doctor/Time
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:bg-neutral-800"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-neutral-900 border-t-black rounded-full animate-spin"></span>
                    Generating Private OPD Token...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black stroke-[3.0]" />
                    Confirm & Book Clinic Slot
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 3 && recentApt && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-neutral-900 text-cyan-400 rounded-full flex items-center justify-center mx-auto animate-bounce border border-neutral-800 shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight">Booking Confirmed!</h3>
              <p className="text-sm text-neutral-400 mt-1">Your official consultation ticket is ready for the clinic counter.</p>
              <div className="inline-block mt-4 bg-white font-mono text-black text-md px-5 py-2.5 rounded-full border border-neutral-800 animate-pulse font-extrabold tracking-wider shadow-inner">
                TOKEN: {recentApt.tokenNumber}
              </div>
            </div>

            {/* Quick summary ticket snapshot */}
            <div className="max-w-md mx-auto text-left bg-neutral-900/40 rounded-3xl border border-neutral-900 p-6 space-y-3.5 font-sans">
              <div className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2.5">
                <span className="text-neutral-500 font-mono uppercase tracking-wider">Appointment Details</span>
                <span className="text-cyan-400 font-bold tracking-wider">OPD-SLIP-LIVE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-neutral-300">
                <div>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Patient Name</p>
                  <p className="font-bold text-white line-clamp-1">{recentApt.patientName} ({recentApt.patientGender}, {recentApt.patientAge})</p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Contact Phone</p>
                  <p className="font-bold text-white">{recentApt.patientPhone}</p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Consulting Doctor</p>
                  <p className="font-bold text-cyan-400">{recentApt.doctor.name}</p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Department / Sector</p>
                  <p className="font-bold text-neutral-300">{recentApt.doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Timing Slot</p>
                  <p className="font-bold text-white font-mono">{recentApt.appointmentDate} at {recentApt.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-mono text-[10px] uppercase font-mono">Branch Hub</p>
                  <p className="font-bold text-neutral-300 line-clamp-1">{recentApt.branch.name}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                onClick={onCancel} // Back to clinic list
                className="w-full sm:w-auto px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-bold text-xs rounded-full hover:bg-neutral-850 transition-colors cursor-pointer"
              >
                Back To Main Page
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setRecentApt(null);
                  onCancel();
                  // Dispatch a virtual tab switch to "appointments" so user goes directly to OPD ticket list
                  window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'appointments' }));
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-full shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                View Print-Ready OPD Slip
                <ChevronRight className="w-4 h-4 text-black stroke-[3.0]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
