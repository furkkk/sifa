/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Trash2, Printer, Search, ShieldCheck, User, Receipt, XCircle, HeartPulse, ArrowLeft } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentListProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onBookNewClick: () => void;
}

export default function AppointmentList({ appointments, onCancelAppointment, onBookNewClick }: AppointmentListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Confirmed' | 'Cancelled'>('All');
  const [selectedSlipApt, setSelectedSlipApt] = useState<Appointment | null>(null);

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && apt.status === activeFilter;
  });

  // Calculate stats for the dashboard summary
  const totalBooked = appointments.length;
  const activeCount = appointments.filter(a => a.status === 'Confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-zinc-800">
      {/* 2. SLIP OVERLAY MODE (Show print-friendly OPD gate slips) */}
      {selectedSlipApt ? (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden max-w-lg mx-auto p-6 space-y-6 animate-fade-in text-zinc-800">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
            <button
              onClick={() => setSelectedSlipApt(null)}
              className="px-4 py-2 border border-zinc-200 text-zinc-650 hover:text-black hover:bg-zinc-50 text-xs rounded-full flex items-center gap-1.5 transition-all cursor-pointer font-medium bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to List
            </button>
            <button 
              onClick={handlePrint}
              className="bg-black hover:bg-zinc-800 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print OPD Slip
            </button>
          </div>

          {/* PRINT CARD WRAPPER */}
          <div id="print-opd-card" className="border-2 border-dashed border-zinc-300 rounded-3xl p-6 bg-zinc-50 relative antialiased max-w-md mx-auto">
            {/* Visual Medical Watermark */}
            <div className="absolute top-2 right-4 text-black/5 pointer-events-none select-none">
              <HeartPulse className="w-32 h-32" />
            </div>

            {/* Slip Header */}
            <div className="text-center pb-5 border-b-2 border-zinc-250 border-zinc-200">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-900 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full font-bold">
                OUT-PATIENT DEPARTMENT (OPD) GATE TICKET
              </span>
              <h2 className="font-sans text-xl font-extrabold text-zinc-900 mt-3.5">
                SHIFA CAREPLUS CLINIC
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">{selectedSlipApt.branch.name}</p>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5">Phone: {selectedSlipApt.branch.phone}</p>
            </div>

            {/* Token Highlight */}
            <div className="my-5 py-4 bg-zinc-100 text-black text-center rounded-3xl border border-zinc-250 flex flex-col justify-center">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Clinical OPD Serial Token</span>
              <span className="text-2xl font-mono font-bold tracking-widest leading-none mt-1">
                {selectedSlipApt.tokenNumber}
              </span>
              <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">Show this at the Main Desk lobby</span>
            </div>

            {/* Patient Table Details */}
            <div className="space-y-3.5 font-sans">
              <div className="grid grid-cols-2 gap-3.5 text-xs text-left">
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-mono">Patient Name</span>
                  <p className="font-bold text-zinc-900 mt-0.5">{selectedSlipApt.patientName}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-mono">Demographics</span>
                  <p className="font-medium text-zinc-650 mt-0.5">{selectedSlipApt.patientGender} / {selectedSlipApt.patientAge} Years</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-mono">Consulting Physician</span>
                  <p className="font-bold text-black mt-0.5">{selectedSlipApt.doctor.name}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-mono">Medical Specialty</span>
                  <p className="font-medium text-zinc-650 mt-0.5">{selectedSlipApt.doctor.specialty}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-mono">Appointment Slot</span>
                  <p className="font-bold text-zinc-900 font-mono mt-0.5">{selectedSlipApt.appointmentDate}</p>
                  <p className="font-medium text-zinc-500 font-mono">{selectedSlipApt.appointmentTime}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-mono">Cons. Fee Paid</span>
                  <p className="font-sans font-bold text-zinc-950 mt-0.5">₹{selectedSlipApt.doctor.fees}</p>
                  <p className="text-[9px] text-zinc-500 italic font-mono">(To pay at counter)</p>
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div className="mt-2.5 pt-3 border-t border-zinc-200">
                <span className="text-[9px] uppercase text-zinc-400 font-mono">Chief Complaint / Symptoms</span>
                <p className="text-[11px] text-zinc-650 bg-white p-2.5 rounded-2xl border border-zinc-200 italic mt-1 leading-normal line-clamp-2">
                  "{selectedSlipApt.symptoms || 'Routine clinic checkup request.'}"
                </p>
              </div>

              {/* Fake Barcode replica in pure CSS */}
              <div className="pt-4 border-t border-zinc-200">
                <div className="flex justify-center items-center h-10 gap-0.5 overflow-hidden">
                  {[4, 1, 3, 2, 8, 1, 2, 4, 1, 6, 2, 3, 1, 8, 2, 4, 2, 1, 3, 1, 7, 2, 1, 4, 3, 2, 1, 5, 2, 4, 1, 2].map((w, i) => (
                    <div 
                      key={i} 
                      className="bg-zinc-600 h-full rounded-xs shrink-0" 
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <p className="text-center text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">
                  *SHIFA-{selectedSlipApt.tokenNumber}-{selectedSlipApt.id.slice(-4)}*
                </p>
              </div>

              {/* Instructions list */}
              <div className="bg-zinc-100 border border-zinc-200 p-3 rounded-2xl text-[10px] text-zinc-600 leading-normal space-y-1 mt-4 text-left">
                <p className="font-bold text-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Important Guidelines for Patient:
                </p>
                <ul className="list-decimal list-inside pl-1 space-y-0.5 text-zinc-500">
                  <li>Please arrive 10-15 minutes prior to scheduling.</li>
                  <li>In case of cancellations, please do so 2 hours before.</li>
                  <li>Recheck consultation is free within the next 5 days.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL APPOINTMENTS LISTING */
        <div className="space-y-6 font-sans text-zinc-805">
          {/* 1. Statistics Cards Dashboard Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white border border-zinc-200 rounded-3xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-405 text-zinc-400 block">Total Tickets</span>
              <p className="font-sans font-extrabold text-2xl text-zinc-900 mt-0.5">{totalBooked}</p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-3xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-black block font-extrabold">Confirmed</span>
              <p className="font-sans font-extrabold text-2xl text-black mt-0.5">{activeCount}</p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-3xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-405 text-zinc-400 block">Cancelled</span>
              <p className="font-sans font-extrabold text-2xl text-zinc-400 mt-0.5">{cancelledCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs p-6 space-y-6">
            {/* Filter and navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
              <div className="text-left">
                <h3 className="font-sans font-extrabold text-zinc-900 text-lg">My Clinical OPD Slips</h3>
                <p className="text-xs text-zinc-500">View live token queue, check dates, and download counter tickets.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 self-stretch md:self-auto">
                {(['All', 'Confirmed', 'Cancelled'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-155 cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-black text-white font-extrabold font-sans shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search appointments by Patient name, Doctor, or OPD Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-xs text-zinc-800 focus:border-black outline-none placeholder:text-zinc-300"
              />
            </div>

            {/* Appointment tickets grid */}
            {filteredAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className={`bg-zinc-50 rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between hover:shadow-xs hover:bg-white text-left ${
                      apt.status === 'Cancelled' 
                        ? 'border-zinc-200 bg-zinc-50/50 opacity-60' 
                        : 'border-zinc-250 border-zinc-200 hover:border-black'
                    }`}
                  >
                    <div>
                      {/* Ticket top line */}
                      <div className="flex justify-between items-start gap-4 text-left">
                        <div>
                          <p className="text-[10px] font-mono text-zinc-800 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${apt.status === 'Cancelled' ? 'bg-zinc-400' : 'bg-black animate-pulse'}`}></span>
                            TOKEN: {apt.tokenNumber}
                          </p>
                          <h4 className="font-sans font-extrabold text-base text-zinc-900 mt-1 line-clamp-1">
                            {apt.patientName}
                          </h4>
                          <p className="text-xs text-zinc-400 font-mono">{apt.patientGender}, {apt.patientAge} Years</p>
                        </div>
                        
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          apt.status === 'Confirmed'
                            ? 'bg-zinc-150 bg-zinc-100 border-zinc-205 text-zinc-800 font-sans font-extrabold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-400 font-sans'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="mt-4 pt-4 border-t border-zinc-200 grid grid-cols-1 gap-2.5 text-xs text-zinc-650">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate text-zinc-500">
                            Doctor: <strong className="text-zinc-900 font-sans font-bold">{apt.doctor.name}</strong> ({apt.doctor.specialty})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-mono text-[11px] text-zinc-500">
                             Date: <strong className="text-zinc-900 font-semibold">{apt.appointmentDate}</strong> at <strong className="text-zinc-900 font-semibold">{apt.appointmentTime}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate font-sans text-[11px] text-zinc-500">
                            {apt.branch.name}
                          </span>
                        </div>

                        {apt.symptoms && (
                          <div className="text-[10.5px] italic text-zinc-600 bg-white border border-zinc-200 p-2.5 rounded-2xl mt-1 line-clamp-1">
                            Symptoms: "{apt.symptoms}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-zinc-200 flex-wrap gap-2.5">
                      <div className="flex items-center gap-2">
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => setSelectedSlipApt(apt)}
                            className="bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Gate Slip / Receipt
                          </button>
                        )}
                      </div>

                      {apt.status === 'Confirmed' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel the appointment of ${apt.patientName}?`)) {
                              onCancelAppointment(apt.id);
                            }
                          }}
                          className="text-zinc-400 hover:text-black hover:bg-zinc-100 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1 cursor-pointer border border-transparent hover:border-zinc-250"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancel Slip
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-4 bg-zinc-50 border border-zinc-200 rounded-3xl">
                <div className="w-14 h-14 bg-white text-zinc-300 rounded-full flex items-center justify-center mx-auto border border-zinc-200">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-zinc-800 text-sm">No appointments found matching constraints</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">Please adjust filters or book a new clinical OPD ticket to get started.</p>
                </div>
                <button
                  onClick={onBookNewClick}
                  className="px-5 py-2.5 rounded-full bg-black text-white font-extrabold text-xs transition hover:bg-zinc-800 cursor-pointer inline-block"
                >
                  Book Your Appointment Now!
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
