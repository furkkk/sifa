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
    <header className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-30 shadow-2xl">
      {/* Top emergency & timing bar */}
      <div className="bg-[#05080f]/90 text-slate-100 py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-sans border-b border-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse cyber-glow-cyan shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              Emergency Hot: <span className="text-white hover:text-cyan-300 transition-colors hover:underline tracking-wide">{CLINIC_INFO.emergencyPhone}</span>
            </span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span className="flex items-center gap-1.5 text-slate-350">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-mono text-slate-300">{CLINIC_INFO.timings}</span>
            </span>
          </div>
          <p className="text-[11px] tracking-wide text-slate-400 italic text-center sm:text-right font-sans">
            ✨ {CLINIC_INFO.tagline}
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Logo & Clinical emblem */}
          <div 
            className="flex items-center gap-3 cursor-pointer self-start md:self-auto select-none group" 
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'home' }))}
          >
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 active:scale-95 group-hover:rotate-6 transition-all duration-300 border border-cyan-400/20">
              <HeartPulse className="w-6 h-6 animate-pulse text-cyan-205" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Shifa <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">CarePlus</span>
              </h1>
              <p className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest font-bold">Multi-Specialty Clinic & OPD Hub</p>
            </div>
          </div>

          {/* Action Links / Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
            <button
              onClick={onViewAdminClick}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none border ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] shadow-cyan-500/10'
                  : 'text-slate-350 hover:text-white hover:bg-slate-900 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
              <span>Admin</span>
            </button>

            <button
              onClick={onViewAppointmentsClick}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none border ${
                activeTab === 'appointments'
                  ? 'bg-blue-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-350 hover:text-white hover:bg-slate-900 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>Tickets</span>
            </button>
            
            <button
              onClick={onBookClick}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1.5 md:flex-none border border-cyan-400/30 font-sans tracking-wide"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] text-cyan-300" />
              <span>Book Ticket</span>
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
