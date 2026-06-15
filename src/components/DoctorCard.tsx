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
  // Get sleek black and white themes for doctor specialities
  const getTheme = (specialty: string) => {
    return { 
      bg: 'bg-white', 
      border: 'border-zinc-200', 
      text: 'text-zinc-900', 
      badge: 'bg-zinc-100 text-zinc-800 border-zinc-200' 
    };
  };

  const theme = getTheme(doctor.specialty);

  // Split name initials for custom beautiful clinical avatars
  const initials = doctor.name
    .split(' ')
    .filter(n => n !== 'Dr.')
    .map(n => n[0])
    .join('');

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 hover:border-black/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group hover:-translate-y-1">
      {/* Visual Header / Avatar section */}
      <div className="p-6 bg-zinc-50/50 relative flex items-center gap-4 border-b border-zinc-200">
        {/* Absolute decorative active indicator dots */}
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-zinc-900 animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.3)]"></div>

        <div className="relative font-sans">
          <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-950 flex items-center justify-center font-sans font-bold text-xl text-white group-hover:scale-105 transition-all duration-300 select-none">
            <span>{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-1 border border-zinc-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 stroke-[3]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border bg-zinc-100 text-zinc-800 border-zinc-200 mb-2 font-mono">
            {doctor.specialty}
          </span>
          <h3 className="font-sans font-extrabold text-zinc-900 text-base group-hover:text-black transition-colors duration-200 truncate">
            {doctor.name}
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">{doctor.qualification}</p>
        </div>
      </div>

      {/* Body Statistics & Bio */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <p className="text-xs text-zinc-650 leading-relaxed font-sans italic text-zinc-600">
            "{doctor.about}"
          </p>

          <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-zinc-200 text-xs text-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <Award className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="font-sans">
                <p className="text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-semibold">Experience</p>
                <p className="font-bold text-zinc-900">{doctor.experienceYears} Years</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <Star className="w-4 h-4 text-zinc-900 fill-zinc-900" />
              </div>
              <div className="font-sans">
                <p className="text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-semibold">Rating</p>
                <p className="font-bold text-zinc-900 text-xs">{doctor.rating} <span className="text-[10px] font-normal text-zinc-500">({doctor.reviewCount})</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-wider font-bold">Clinical Duty slots</p>
            <div className="flex flex-wrap gap-1">
              {doctor.availableDays.map((day, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-700 font-mono"
                >
                  {day.slice(0, 3).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fees & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <div>
            <span className="text-[9px] uppercase text-zinc-400 font-mono tracking-wide block font-semibold">Consultation Fee</span>
            <span className="font-sans font-extrabold text-zinc-900 text-lg flex items-baseline">
              <span className="text-black text-sm font-bold mr-0.5">₹</span>
              <span className="text-black">{doctor.fees}</span>
              <span className="text-[10px] text-zinc-400 font-normal ml-1">/ Ticket</span>
            </span>
          </div>

          <button
            onClick={() => onBookClick(doctor)}
            className="px-4.5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold tracking-wide transition-all duration-150 flex items-center gap-1.5 shadow-xs cursor-pointer rounded-full"
          >
            <span>Reserve Slot</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
