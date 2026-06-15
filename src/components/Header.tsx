/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeartPulse, PhoneCall, Clock, MapPin, CalendarDays, Lock, Plus } from 'lucide-react';
import { CLINIC_INFO } from '../data';

interface HeaderProps {
  onBookClick: () => void;
  onViewAppointmentsClick: () => void;
  onViewAdminClick: () => void;
  activeTab: string;
}

export default function Header({ onBookClick, onViewAppointmentsClick, onViewAdminClick, activeTab }: HeaderProps) {
  return (
    <header className="w-full bg-white/95 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      {/* Top emergency & timing bar */}
      <div className="bg-zinc-50 text-zinc-700 py-2 px-4 sm:px-6 lg:px-8 text-xs font-sans border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-650">
              <span className="inline-block w-2 h-2 rounded-full bg-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.4)]"></span>
              Emergency Hot: <span className="text-zinc-900 hover:text-black transition-colors hover:underline font-mono tracking-wide">{CLINIC_INFO.emergencyPhone}</span>
            </span>
            <span className="hidden sm:inline text-zinc-300">|</span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-zinc-700">{CLINIC_INFO.timings}</span>
            </span>
          </div>
          <p className="text-[11px] tracking-wide text-zinc-500 font-sans">
            ✨ <span className="text-zinc-800 font-semibold">{CLINIC_INFO.tagline}</span>
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Logo & Clinical emblem */}
          <div 
            className="flex items-center gap-3 cursor-pointer self-start md:self-auto select-none group" 
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'home' }))}
          >
            <div className="p-2.5 bg-black text-white rounded-2xl flex items-center justify-center shadow-xs active:scale-95 group-hover:bg-zinc-800 transition-all border border-zinc-950">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1">
                Shifa <span className="text-zinc-700">CarePlus</span>
              </h1>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Multi-Specialty Clinic & OPD Hub</p>
            </div>
          </div>

          {/* Action Links / Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto font-sans">
            <button
              onClick={onViewAppointmentsClick}
              className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none border ${
                activeTab === 'appointments'
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'text-zinc-650 bg-zinc-50 hover:text-black hover:bg-zinc-100 border-zinc-200'
              }`}
            >
              <CalendarDays className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'appointments' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Browse Tickets</span>
            </button>
            
            <button
              onClick={onBookClick}
              className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none border ${
                activeTab === 'book'
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
              }`}
            >
              <Plus className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'book' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Book Ticket</span>
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
