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
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden max-w-2xl mx-auto text-zinc-800">
      {/* Header Banner */}
      <div className="bg-zinc-50 px-6 py-6 text-zinc-950 relative border-b border-zinc-200 text-left">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-black">
          <Stethoscope className="w-24 h-24" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-sans text-xl font-extrabold tracking-tight text-zinc-900">Book Professional OPD Ticket</h2>
            <p className="text-xs text-zinc-500 mt-1 font-medium">Get immediate consultation token numbers on your screen.</p>
          </div>
          {step < 3 && (
            <button 
              onClick={onCancel}
              className="text-zinc-700 hover:text-black text-xs border border-zinc-200 hover:border-zinc-300 px-3.5 py-1.5 rounded-full transition-colors bg-white cursor-pointer font-bold"
            >
              Back to Home
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mt-5">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.15)]' : 'bg-zinc-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.15)]' : 'bg-zinc-200'}`}></div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 pl-2 font-bold">Step {step} of 2</span>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {validationError && (
          <div className="mb-6 p-4 bg-zinc-50 border-l-4 border-black text-zinc-805 rounded-r-xl text-xs font-mono text-left">
            {validationError}
          </div>
        )}

        {/* STEP 1: CONSULTATION SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            {/* 1. Branch Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-800" />
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
                        ? 'border-black bg-zinc-50 ring-1 ring-zinc-300 text-black'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-650'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-800">{branch.name}</span>
                      {selectedBranch.id === branch.id && (
                        <span className="text-[10px] font-bold text-black bg-white border border-zinc-300 px-2.5 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-505 text-zinc-500 mt-1 line-clamp-1">{branch.address}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{branch.timings}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Specialty & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-zinc-800" />
                  Medical Specialty (विभाग)
                </label>
                <select
                  disabled={preselectedDoctor !== null}
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-xs text-zinc-800 focus:border-black outline-none disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer"
                >
                  {SPECIALTIES.map(spec => (
                    <option key={spec.id} value={spec.name}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-800" />
                  Physician / Specialty Doctor (डॉक्टर)
                </label>
                <select
                  disabled={preselectedDoctor !== null}
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doc = DOCTORS.find(d => d.id === e.target.value);
                    if (doc) setSelectedDoctor(doc);
                  }}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-xs text-zinc-800 focus:border-black outline-none disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer"
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
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-800" />
                      Consultation Date (दिनांक)
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      max={maxDateStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs text-zinc-800 focus:border-black outline-none cursor-pointer font-sans"
                    />
                  </div>

                  <div className="text-left">
                    <span className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-black animate-pulse"></span>
                      Doctor consultation Fee
                    </span>
                    <div className="h-10 flex items-center pl-1">
                      <span className="font-sans font-extrabold text-zinc-900 text-xl tracking-tight flex items-baseline">
                        <span className="text-zinc-950 mr-1">₹{selectedDoctor.fees}</span>
                        <span className="text-xs text-zinc-400 font-normal">/ Rs. {selectedDoctor.fees * 2} (Counter)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-800" />
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
                            ? 'bg-black border-black text-white shadow-xs font-extrabold'
                            : 'bg-white border-zinc-200 hover:border-zinc-350 text-zinc-650 hover:bg-zinc-50'
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
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
              <span className="text-xs text-zinc-400 italic">Pre-booking guarantees minimal wait time.</span>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs rounded-full shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                Proceed to Patient Details
                <ChevronRight className="w-4 h-4 text-white stroke-[3.0]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PATIENT DEMOGRAPHICS */}
        {step === 2 && (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {patientEmail && (!patientPhone || patientPhone.trim() === "") && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 text-zinc-650 rounded-2xl text-[11px] leading-relaxed text-left">
                ⚠️ <strong className="text-black">Email-Only Session Warning:</strong> Since you only entered an email and left the mobile number blank, your appointment register and OPD ticket <strong>will NOT be saved to our database system</strong>. Cloud storage requires both a phone number and an email.
              </div>
            )}
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-[11px] text-zinc-505 text-zinc-500 leading-relaxed flex gap-2.5 text-left">
              <Sparkles className="w-5 h-5 text-black shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong className="text-zinc-800 block mb-0.5">Please supply correct demographic details.</strong> This forms the medical record database for your token printout. Your primary diagnosis / symptoms description will assist the doctor beforehand.
              </div>
            </div>

            {/* Name */}
            <div className="text-left">
              <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-1.5">
                Patient's Full Name (मरीज़ का नाम) <span className="text-black font-extrabold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma or Fatima Syeda"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-5 py-3 text-xs text-zinc-850 focus:border-black outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div className="text-left">
                <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-1.5">
                  Age (आयु) <span className="text-black">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Years"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-xs text-zinc-850 focus:border-black outline-none"
                />
              </div>

              {/* Gender */}
              <div className="text-left">
                <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-1.5">
                  Gender (लिंग)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((genderOption) => (
                    <button
                      key={genderOption}
                      type="button"
                      onClick={() => setPatientGender(genderOption)}
                      className={`py-3 px-1 rounded-full border text-center text-xs font-semibold transition-all cursor-pointer ${
                        patientGender === genderOption
                          ? 'border-black bg-zinc-50 text-black font-bold'
                          : 'border-zinc-200 hover:border-zinc-300 text-zinc-500 bg-white'
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
              <div className="text-left">
                <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-1.5">
                  Mobile Number (मोबाइल नंबर) <span className="text-black font-extrabold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-5 py-3 text-xs text-zinc-850 focus:border-black outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="text-left">
                <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-1.5">
                  Email Address (ईमेल)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. patient@gmail.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-5 py-3 text-xs text-zinc-850 focus:border-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms textbox */}
            <div className="text-left">
              <label className="block text-xs font-bold uppercase text-zinc-500 font-mono tracking-wider mb-1.5">
                Brief symptoms / Reason for booking (बीमारी के लक्षण)
              </label>
              <textarea
                placeholder="e.g. High fever since yesterday, acute joint pain, regular sugar inspection, routine pregnancy ultrasound etc..."
                value={symptoms}
                rows={3}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-xs text-zinc-850 focus:border-black outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-4.5 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-650 hover:text-black font-medium text-xs rounded-full flex items-center gap-1 transition-all cursor-pointer disabled:opacity-55"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Doctor/Time
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:bg-zinc-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating Private OPD Token...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white stroke-[3.0]" />
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
            <div className="w-16 h-16 bg-zinc-100 text-black rounded-full flex items-center justify-center mx-auto animate-bounce border border-zinc-250 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="font-sans font-extrabold text-2xl text-zinc-900 tracking-tight">Booking Confirmed!</h3>
              <p className="text-sm text-zinc-505 text-zinc-500 mt-1">Your official consultation ticket is ready for the clinic counter.</p>
              <div className="inline-block mt-4 bg-zinc-950 font-mono text-white text-md px-5 py-2.5 rounded-full border border-zinc-900 animate-pulse font-extrabold tracking-wider shadow-inner">
                TOKEN: {recentApt.tokenNumber}
              </div>
            </div>

            {/* Quick summary ticket snapshot */}
            <div className="max-w-md mx-auto text-left bg-zinc-50 rounded-3xl border border-zinc-200 p-6 space-y-3.5 font-sans">
              <div className="flex justify-between items-center text-xs border-b border-zinc-200 pb-2.5">
                <span className="text-zinc-500 font-mono uppercase tracking-wider">Appointment Details</span>
                <span className="text-black font-extrabold tracking-wider">OPD-SLIP-LIVE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-zinc-750">
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Patient Name</p>
                  <p className="font-bold text-zinc-900 line-clamp-1">{recentApt.patientName} ({recentApt.patientGender}, {recentApt.patientAge})</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Contact Phone</p>
                  <p className="font-bold text-zinc-900">{recentApt.patientPhone}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Consulting Doctor</p>
                  <p className="font-bold text-black">{recentApt.doctor.name}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Department / Sector</p>
                  <p className="font-bold text-zinc-700">{recentApt.doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Timing Slot</p>
                  <p className="font-bold text-zinc-900 font-mono">{recentApt.appointmentDate} at {recentApt.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Branch Hub</p>
                  <p className="font-bold text-zinc-700 line-clamp-1">{recentApt.branch.name}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                onClick={onCancel} // Back to clinic list
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-150 bg-zinc-100 border border-zinc-220 text-zinc-800 font-bold text-xs rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
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
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs rounded-full shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                View Print-Ready OPD Slip
                <ChevronRight className="w-4 h-4 text-white stroke-[3.0]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
