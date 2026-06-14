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
  // Get color gradient & icon background according to doctor specialization - aligned with Clean Minimalism
  const getTheme = (specialty: string) => {
    switch (specialty) {
      case 'General Medicine':
        return { bg: 'from-slate-50/50 to-blue-50/20', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'Pediatrics':
        return { bg: 'from-slate-50/50 to-blue-50/20', text: 'text-blue-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'Cardiology':
        return { bg: 'from-slate-50/50 to-blue-50/20', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'Orthopedics':
        return { bg: 'from-slate-50/50 to-blue-50/20', text: 'text-blue-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'Gynecology & Obstetrics':
        return { bg: 'from-slate-50/50 to-blue-50/20', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-100' };
      default:
        return { bg: 'from-slate-50/50 to-blue-50/20', text: 'text-blue-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
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
    <div className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500/30 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Visual Header / Avatar section */}
      <div className={`p-6 bg-gradient-to-br ${theme.bg} relative flex items-center gap-4 border-b border-slate-100`}>
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-sans font-medium text-xl text-slate-700 group-hover:scale-102 transition-transform duration-300">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 border border-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1">
          <span className={`inline-block text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${theme.badge} mb-1.5`}>
            {doctor.specialty}
          </span>
          <h3 className="font-sans font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
            {doctor.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono font-medium">{doctor.qualification}</p>
        </div>
      </div>

      {/* Body Statistics & Bio */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {doctor.about}
          </p>

          <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Experience</p>
                <p className="font-medium text-slate-800">{doctor.experienceYears} Years</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Rating</p>
                <p className="font-medium text-slate-800">{doctor.rating} ({doctor.reviewCount})</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Available Days</p>
            <div className="flex flex-wrap gap-1">
              {doctor.availableDays.map((day, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-500"
                >
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fees & CTA */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wide block">OPD consultation Fee</span>
            <span className="font-sans font-semibold text-slate-900 text-lg flex items-center">
              <span className="text-blue-600 text-sm font-semibold mr-0.5">₹</span>
              {doctor.fees}
              <span className="text-xs text-slate-400 font-normal ml-1">/ Rs. {doctor.fees * 2}</span>
            </span>
          </div>

          <button
            onClick={() => onBookClick(doctor)}
            className="px-4.5 py-2.5 rounded-full bg-slate-900 group-hover:bg-blue-600 text-white font-medium text-xs tracking-wide transition-all duration-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            Book Slot
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
