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
      bg: 'bg-neutral-950', 
      border: 'border-neutral-900', 
      text: 'text-white', 
      badge: 'bg-neutral-900 text-neutral-300 border-neutral-800' 
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
    <div className="bg-neutral-950 rounded-3xl border border-neutral-900 hover:border-cyan-400/40 shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group hover:-translate-y-1">
      {/* Visual Header / Avatar section */}
      <div className="p-6 bg-neutral-900/40 relative flex items-center gap-4 border-b border-neutral-900">
        {/* Absolute decorative glow dot in card header */}
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-sm flex items-center justify-center font-sans font-bold text-xl text-white group-hover:scale-105 group-hover:border-neutral-700 transition-all duration-300 select-none">
            <span className="text-white">{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-1 border border-neutral-950 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border bg-neutral-900 text-neutral-300 border-neutral-800 mb-2">
            {doctor.specialty}
          </span>
          <h3 className="font-sans font-bold text-white text-base group-hover:text-cyan-400 transition-colors duration-200 truncate">
            {doctor.name}
          </h3>
          <p className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">{doctor.qualification}</p>
        </div>
      </div>

      {/* Body Statistics & Bio */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
            "{doctor.about}"
          </p>

          <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-neutral-900 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <Award className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-neutral-500 text-[9px] uppercase font-mono tracking-wider font-semibold">Experience</p>
                <p className="font-bold text-neutral-200">{doctor.experienceYears} Years</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <p className="text-neutral-500 text-[9px] uppercase font-mono tracking-wider font-semibold">Rating</p>
                <p className="font-bold text-neutral-200">{doctor.rating} <span className="text-[10px] font-normal text-neutral-500">({doctor.reviewCount})</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] uppercase text-neutral-500 font-mono tracking-wider font-bold">Clinical Duty slots</p>
            <div className="flex flex-wrap gap-1">
              {doctor.availableDays.map((day, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-850 text-[9px] font-bold text-neutral-300 font-mono"
                >
                  {day.slice(0, 3).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fees & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
          <div>
            <span className="text-[9px] uppercase text-neutral-500 font-mono tracking-wide block font-semibold">Consultation Fee</span>
            <span className="font-sans font-extrabold text-white text-lg flex items-baseline">
              <span className="text-cyan-400 text-sm font-bold mr-0.5">₹</span>
              <span className="text-cyan-400">{doctor.fees}</span>
              <span className="text-[10px] text-neutral-500 font-normal ml-1">/ OPD Ticket</span>
            </span>
          </div>

          <button
            onClick={() => onBookClick(doctor)}
            className="px-4.5 py-2.5 rounded-full bg-neutral-900 hover:bg-white text-neutral-300 hover:text-black border border-neutral-800 hover:border-white text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Reserve Slot</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-black transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
