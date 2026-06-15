/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Doctor, ClinicBranch, Specialty, Appointment } from './types';

export const CLINIC_INFO = {
  name: "Shifa CarePlus Clinic",
  tagline: "Your Family's Health & Wellness, Our Ultimate Priority",
  emergencyPhone: "+91 98765 43210",
  generalPhone: "+91 11 4567 8901",
  helplineLabel: "Shifa CarePlus Support Line & Urgent Care Booking",
  address: "Primary Hub: Sector-5, Block C, Metro Avenue, New Delhi, India",
  timings: "Open 7 Days a Week: 08:00 AM - 10:00 PM",
  email: "care@shifaclinic.com"
};

export const SPECIALTIES: Specialty[] = [
  {
    id: "gen-medicine",
    name: "General Medicine",
    iconName: "Stethoscope",
    description: "Primary healthcare, fever, diabetes, blood pressure, general health checks."
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    iconName: "Baby",
    description: "Child healthcare, growth monitoring, vaccinations, kids seasonal viral care."
  },
  {
    id: "cardiology",
    name: "Cardiology",
    iconName: "HeartPulse",
    description: "Heart checkups, ECG interpretation, hypertension management, cholesterol control."
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    iconName: "Activity",
    description: "Joint pain, fracture care, backache, arthritis, physiotherapy coordination."
  },
  {
    id: "gynecology",
    name: "Gynecology & Obstetrics",
    iconName: "Sparkles",
    description: "Maternal care, women health checkups, prenatal care, hormonal guidelines."
  },
  {
    id: "dermatology",
    name: "Dermatology",
    iconName: "Smile",
    description: "Skin diseases, acne treatment, allergy consultation, hair & nail diagnostics."
  }
];

export const CLINIC_BRANCHES: ClinicBranch[] = [
  {
    id: "branch-main",
    name: "Shifa Central Hub (Metro Plaza)",
    address: "Block-A, Connaught Galleria, near Metro Gate 4, New Delhi",
    phone: "+91 11 4111 2222",
    timings: "08:00 AM - 10:00 PM (Mon-Sun)"
  },
  {
    id: "branch-suburbs",
    name: "CarePlus Wellness Center (Defence/Heights)",
    address: "12B Commercial Boulevard, Sector 12, West Extension",
    phone: "+91 11 4222 3333",
    timings: "09:00 AM - 09:00 PM (Mon-Sat)"
  },
  {
    id: "branch-south",
    name: "Shifa Family Clinic (Green Valley)",
    address: "Shop 4-5, Shanti Kunj Apartments, Ring Road",
    phone: "+91 11 4333 4444",
    timings: "09:00 AM - 08:00 PM (Weekly Off on Sunday)"
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Alok Sharma",
    specialty: "General Medicine",
    qualification: "MD (Internal Medicine), MBBS",
    experienceYears: 15,
    rating: 4.8,
    reviewCount: 340,
    fees: 600,
    image: "male-doc-1",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slots: ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM", "06:30 PM", "07:30 PM"],
    about: "Dr. Alok Sharma is a highly experienced physician specializing in managing complex metabolic issues, diabetes, chronic hypertension, and seasonal infections."
  },
  {
    id: "doc-2",
    name: "Dr. Sarah Khan",
    specialty: "Pediatrics",
    qualification: "MD (Pediatrics), DCH",
    experienceYears: 11,
    rating: 4.9,
    reviewCount: 285,
    fees: 500,
    image: "female-doc-1",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slots: ["09:30 AM", "10:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "03:00 PM", "04:30 PM", "05:00 PM", "06:00 PM"],
    about: "Dr. Sarah Khan provides friendly, empathetic care for infants and children up to age 16. Specialties include immunizations, growth charting, and childhood allergy management."
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Aditya",
    specialty: "Cardiology",
    qualification: "DM (Cardiology), MD, MBBS",
    experienceYears: 18,
    rating: 4.9,
    reviewCount: 420,
    fees: 800,
    image: "male-doc-2",
    availableDays: ["Monday", "Wednesday", "Thursday", "Friday"],
    slots: ["10:00 AM", "10:45 AM", "11:30 AM", "03:00 PM", "03:45 PM", "04:30 PM", "05:15 PM"],
    about: "Dr. Vikram Aditya specializes in preventative cardiology, cardiac wellness screening, heart failure management, and lipid disorder treatments."
  },
  {
    id: "doc-4",
    name: "Dr. Meera Vasudevan",
    specialty: "Gynecology & Obstetrics",
    qualification: "MS (OBG), DGO, MBBS",
    experienceYears: 14,
    rating: 4.7,
    reviewCount: 195,
    fees: 700,
    image: "female-doc-2",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    slots: ["11:00 AM", "11:30 AM", "12:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "07:00 PM", "07:30 PM"],
    about: "Dr. Meera Vasudevan is dedicated to comprehensive women's clinical care. Expert in maternal health, high-risk pregnancies, PCOS management, and family planning."
  },
  {
    id: "doc-5",
    name: "Dr. Rohan Malhotra",
    specialty: "Orthopedics",
    qualification: "MS (Orthopedics), M.Ch, MBBS",
    experienceYears: 12,
    rating: 4.6,
    reviewCount: 210,
    fees: 600,
    image: "male-doc-3",
    availableDays: ["Tuesday", "Wednesday", "Friday", "Saturday"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "06:00 PM", "06:45 PM"],
    about: "Dr. Rohan Malhotra specializes in sports injuries, joint osteopathic care, lower back physical therapy plans, and micro-fracture recovery."
  },
  {
    id: "doc-6",
    name: "Dr. Priya Bansal",
    specialty: "Dermatology",
    qualification: "MD (Skincare & Dermatology), MBBS",
    experienceYears: 9,
    rating: 4.8,
    reviewCount: 178,
    fees: 550,
    image: "female-doc-3",
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    slots: ["10:00 AM", "11:00 AM", "11:30 AM", "02:30 PM", "03:30 PM", "05:00 PM", "06:00 PM", "06:30 PM"],
    about: "Dr. Priya Bansal provides advanced dermatological consultation for acne, psoriasis, clinical skin peeling, hair restoration guidance, and pediatric skin allergies."
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-demo-1",
    tokenNumber: "OPD-3891",
    doctor: DOCTORS[0], // Dr. Alok Sharma
    branch: CLINIC_BRANCHES[0],
    patientName: "Sumit Varma",
    patientAge: 34,
    patientGender: "Male",
    patientPhone: "+91 99887 76655",
    patientEmail: "sumit.varma@gmail.com",
    appointmentDate: "2026-06-15",
    appointmentTime: "11:00 AM",
    symptoms: "Mild fever and sore throat for 2 days",
    status: "Confirmed",
    createdAt: "2026-06-14T08:00:00Z"
  },
  {
    id: "apt-demo-2",
    tokenNumber: "OPD-1024",
    doctor: DOCTORS[1], // Dr. Sarah Khan
    branch: CLINIC_BRANCHES[1],
    patientName: "Aarav Khan",
    patientAge: 6,
    patientGender: "Male",
    patientPhone: "+91 91234 56789",
    patientEmail: "parent.khan@gmail.com",
    appointmentDate: "2026-06-16",
    appointmentTime: "10:30 AM",
    symptoms: "Regular vaccination booster checkup",
    status: "Confirmed",
    createdAt: "2026-06-14T08:15:00Z"
  }
];
