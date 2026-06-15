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
    <header className="w-full bg-black/90 backdrop-blur-xl border-b border-neutral-900 sticky top-0 z-30 shadow-md">
      {/* Top emergency & timing bar */}
      <div className="bg-neutral-950 text-neutral-300 py-2 px-4 sm:px-6 lg:px-8 text-xs font-sans border-b border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
              Emergency Hot: <span className="text-white hover:text-cyan-400 transition-colors hover:underline font-mono tracking-wide">{CLINIC_INFO.emergencyPhone}</span>
            </span>
            <span className="hidden sm:inline text-neutral-800">|</span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-mono text-neutral-300">{CLINIC_INFO.timings}</span>
            </span>
          </div>
          <p className="text-[11px] tracking-wide text-neutral-400 font-sans">
            ✨ <span className="text-cyan-400 font-medium">{CLINIC_INFO.tagline}</span>
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
            <div className="p-2.5 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 group-hover:bg-neutral-850 transition-all border border-neutral-800 group-hover:border-neutral-700">
              <HeartPulse className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Shifa <span className="text-cyan-400">CarePlus</span>
              </h1>
              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Multi-Specialty Clinic & OPD Hub</p>
            </div>
          </div>

          {/* Action Links / Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
            <button
              onClick={onViewAdminClick}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none border ${
                activeTab === 'admin'
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-neutral-900 hover:border-neutral-800'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'admin' ? 'text-black' : 'text-neutral-500'}`} />
              <span>Admin</span>
            </button>

            <button
              onClick={onViewAppointmentsClick}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none border ${
                activeTab === 'appointments'
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-neutral-900 hover:border-neutral-800'
              }`}
            >
              <CalendarDays className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'appointments' ? 'text-black' : 'text-neutral-500'}`} />
              <span>Tickets</span>
            </button>
            
            <button
              onClick={onBookClick}
              className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-5 py-2 rounded-full shadow-md hover:border-cyan-400 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1.5 md:flex-none border border-neutral-800 font-sans tracking-wide"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] text-cyan-400" />
              <span>Book Ticket</span>
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
