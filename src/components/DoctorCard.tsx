/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Award, Clock, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorCardProps {
  key?: string | number;
  doctor: Doctor;
  onBookClick: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onBookClick }: DoctorCardProps) {
  // Get color gradient & icon background according to doctor specialization - aligned with premium Cyber look
  const getTheme = (specialty: string) => {
    switch (specialty) {
      case 'General Medicine':
        return { 
          bg: 'from-blue-900/40 via-indigo-950/20 to-slate-950', 
          border: 'border-blue-500/30', 
          text: 'text-blue-400', 
          badge: 'bg-blue-950/85 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
        };
      case 'Pediatrics':
        return { 
          bg: 'from-emerald-990 from-emerald-950/30 via-slate-950 to-slate-950', 
          border: 'border-emerald-500/30', 
          text: 'text-emerald-400', 
          badge: 'bg-emerald-950/85 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
        };
      case 'Cardiology':
        return { 
          bg: 'from-rose-950/30 via-slate-950 to-slate-950', 
          border: 'border-rose-500/30', 
          text: 'text-rose-400', 
          badge: 'bg-rose-950/85 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
        };
      case 'Orthopedics':
        return { 
          bg: 'from-amber-950/30 via-slate-950 to-slate-950', 
          border: 'border-amber-500/30', 
          text: 'text-amber-400', 
          badge: 'bg-amber-950/85 text-amber-305 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
        };
      case 'Gynecology & Obstetrics':
        return { 
          bg: 'from-purple-950/30 via-slate-950 to-slate-950', 
          border: 'border-purple-500/30', 
          text: 'text-purple-400', 
          badge: 'bg-purple-950/85 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
        };
      default:
        return { 
          bg: 'from-cyan-950/30 via-slate-950 to-slate-950', 
          border: 'border-cyan-500/30', 
          text: 'text-cyan-400', 
          badge: 'bg-cyan-950/85 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
        };
    }
  };

  const theme = getTheme(doctor.specialty);

  // Split name initials for custom beautiful clinical avatars
  const initials = doctor.name
    .split(' ')
    .filter(n => n !== 'Dr.')
    .map(n => n[0])
    .join('');

  return (
    <div className="bg-[#0b1329]/80 rounded-3xl border border-slate-800/80 hover:border-cyan-400/50 shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden group hover:-translate-y-1">
      {/* Visual Header / Avatar section */}
      <div className={`p-6 bg-gradient-to-br ${theme.bg} relative flex items-center gap-4 border-b border-slate-805 border-slate-800`}>
        {/* Absolute decorative glow dot in card header */}
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center font-sans font-bold text-xl text-white group-hover:scale-105 group-hover:border-cyan-400/40 transition-all duration-300 select-none">
            <span className="bg-gradient-to-r from-white via-slate-250 to-cyan-200 bg-clip-text text-transparent">{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 rounded-full p-1 border border-slate-950 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className={`inline-block text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${theme.badge} mb-2`}>
            {doctor.specialty}
          </span>
          <h3 className="font-sans font-bold text-white text-base group-hover:text-cyan-300 transition-colors duration-200 truncate">
            {doctor.name}
          </h3>
          <p className="text-[10px] text-cyan-400/90 font-mono font-bold uppercase tracking-wider">{doctor.qualification}</p>
        </div>
      </div>

      {/* Body Statistics & Bio */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
            "{doctor.about}"
          </p>

          <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-500 text-[9px] uppercase font-mono tracking-wider font-semibold">Experience</p>
                <p className="font-bold text-slate-200">{doctor.experienceYears} Years</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-slate-500 text-[9px] uppercase font-mono tracking-wider font-semibold">Rating</p>
                <p className="font-bold text-slate-200">{doctor.rating} <span className="text-[10px] font-normal text-slate-400">({doctor.reviewCount})</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] uppercase text-slate-500 font-mono tracking-wider font-bold">Clinical Duty slots</p>
            <div className="flex flex-wrap gap-1">
              {doctor.availableDays.map((day, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[9px] font-bold text-cyan-400 font-mono"
                >
                  {day.slice(0, 3).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fees & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-mono tracking-wide block font-semibold">Consultation Fee</span>
            <span className="font-sans font-extrabold text-white text-lg flex items-baseline">
              <span className="text-cyan-400 text-sm font-bold mr-0.5">₹</span>
              {doctor.fees}
              <span className="text-[10px] text-slate-500 font-normal ml-1">/ OPD Ticket</span>
            </span>
          </div>

          <button
            onClick={() => onBookClick(doctor)}
            className="px-4.5 py-2.5 rounded-full bg-slate-950 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 border border-slate-800 group-hover:border-cyan-400/25 text-slate-300 group-hover:text-white font-bold text-xs tracking-wide transition-all duration-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Reserve Slot</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
