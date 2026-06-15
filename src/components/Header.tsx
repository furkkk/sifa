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
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top emergency & timing bar */}
      <div className="bg-slate-950 text-slate-100 py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-medium text-blue-400">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Emergency Hot: <span className="text-white hover:underline">{CLINIC_INFO.emergencyPhone}</span>
            </span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {CLINIC_INFO.timings}
            </span>
          </div>
          <p className="text-[11px] tracking-wide text-slate-400 italic text-center sm:text-right">
            {CLINIC_INFO.tagline}
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Logo & Clinical emblem */}
          <div 
            className="flex items-center gap-3 cursor-pointer self-start md:self-auto select-none" 
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'home' }))}
          >
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform duration-200">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Shifa <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CarePlus</span>
              </h1>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Multi-Specialty Clinic & OPD</p>
            </div>
          </div>

          {/* Action Links / Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <button
              onClick={onViewAdminClick}
              className={`px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Admin</span>
            </button>

            <button
              onClick={onViewAppointmentsClick}
              className={`px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 md:flex-none ${
                activeTab === 'appointments'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>Tickets</span>
            </button>
            
            <button
              onClick={onBookClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4.5 py-2.5 rounded-full shadow-lg shadow-blue-550/15 hover:shadow-xl active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1.5 md:flex-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Book Ticket</span>
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
