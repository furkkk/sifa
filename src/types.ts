/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  fees: number;
  image: string;
  availableDays: string[]; // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  slots: string[]; // e.g., ["09:00 AM", "10:30 AM", "11:00 AM", "02:30 PM", "04:00 PM", "06:30 PM", "07:00 PM"]
  about: string;
}

export interface ClinicBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  timings: string;
  mapEmbed?: string;
}

export interface Appointment {
  id: string;
  tokenNumber: string; // Dynamic OPD OPD-XXXX
  doctor: Doctor;
  branch: ClinicBranch;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // Selected Slot
  symptoms: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  iconName: string; // Lucide icon lookup
  description: string;
}
