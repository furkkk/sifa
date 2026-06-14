/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeartPulse, PhoneCall, Clock, MapPin, CalendarDays, Lock } from 'lucide-react';
import { CLINIC_INFO } from '../data';

interface HeaderProps {
  onBookClick: () => void;
  onViewAppointmentsClick: () => void;
  onViewAdminClick: () => void;
  activeTab: string;
}

export default function Header({ onBookClick, onViewAppointmentsClick, onViewAdminClick, activeTab }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top emergency & timing bar */}
      <div className="bg-slate-900 text-slate-100 py-2 px-10 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Emergency Hot: {CLINIC_INFO.emergencyPhone}
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {CLINIC_INFO.timings}
            </span>
          </div>
          <p className="font-sans text-xs tracking-wide text-slate-300 italic">
            {CLINIC_INFO.taglineUrduHindi}
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'home' }))}>
            <div className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-semibold tracking-tight text-slate-900">
                Shifa <span className="text-blue-600">CarePlus</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Multi-Specialty Clinic & OPD</p>
            </div>
          </div>

          {/* Quick contact / Action Links */}
          <div className="flex items-center gap-3">
            <button
              onClick={onViewAdminClick}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </button>

            <button
              onClick={onViewAppointmentsClick}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">My Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </button>
            
            <button
              onClick={onBookClick}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-sm cursor-pointer transition-all duration-200 flex items-center gap-1.5"
            >
              Book OPD Ticket
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
