/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "https://dzwnzgjgqaolglvophtu.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_lp-kpGjdZfzDz1cj9pqI5Q_xe2j1yTc";
const supabase = createClient(supabaseUrl, supabaseKey);

// Path for backup local files
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const PASSWORD_FILE = path.join(DATA_DIR, 'admin_password.txt');
const LOCAL_APTS_FILE = path.join(DATA_DIR, 'appointments_backup.json');
const LOCAL_CHATS_FILE = path.join(DATA_DIR, 'chats_backup.json');

// Default initial appointments if db is empty or unreachable
const INITIAL_ACC_APTS = [
  {
    id: "apt-demo-1",
    tokenNumber: "OPD-3891",
    doctor: {
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
    branch: {
      id: "branch-main",
      name: "Shifa Central Hub (Metro Plaza)",
      address: "Block-A, Connaught Galleria, near Metro Gate 4, New Delhi",
      phone: "+91 11 4111 2222",
      timings: "08:00 AM - 10:00 PM (Mon-Sun)"
    },
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
    doctor: {
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
    branch: {
      id: "branch-suburbs",
      name: "CarePlus Wellness Center (Defence/Heights)",
      address: "12B Commercial Boulevard, Sector 12, West Extension",
      phone: "+91 11 4222 3333",
      timings: "09:00 AM - 09:00 PM (Mon-Sat)"
    },
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

// Memory state definitions
let adminPassword = "";
let appointmentsCache: any[] = [];
let chatsCache: any[] = [];

// Initialize local states from disk
if (fs.existsSync(PASSWORD_FILE)) {
  adminPassword = fs.readFileSync(PASSWORD_FILE, 'utf-8').trim();
}

if (fs.existsSync(LOCAL_APTS_FILE)) {
  try {
    appointmentsCache = JSON.parse(fs.readFileSync(LOCAL_APTS_FILE, 'utf-8'));
  } catch (e) {
    appointmentsCache = [...INITIAL_ACC_APTS];
  }
} else {
  appointmentsCache = [...INITIAL_ACC_APTS];
  fs.writeFileSync(LOCAL_APTS_FILE, JSON.stringify(appointmentsCache, null, 2));
}

if (fs.existsSync(LOCAL_CHATS_FILE)) {
  try {
    chatsCache = JSON.parse(fs.readFileSync(LOCAL_CHATS_FILE, 'utf-8'));
  } catch (e) {
    chatsCache = [];
  }
} else {
  chatsCache = [
    {
      id: "msg-init-1",
      sender: "admin",
      patientSessionId: "session-demo",
      patientName: "Sumit Varma",
      message: "Hello! Welcome to the Shifa CarePlus live clinical support helpdesk. How can we assist with your consultation booking or appointment timeline today?",
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify(chatsCache, null, 2));
}

// Support function to load admin password from Supabase table "settings"
async function syncAdminPasswordFromDB() {
  if (adminPassword) return; // Keep existing if set locally
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .maybeSingle();
    if (data && data.value) {
      adminPassword = data.value;
      fs.writeFileSync(PASSWORD_FILE, adminPassword);
      console.log("Successfully synced admin password from Supabase database settings table.");
    }
  } catch (err) {
    // Suppress or log
  }
}

// Call sync immediately
syncAdminPasswordFromDB();

// API: Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl,
    projectRef: "dzwnzgjgqaolglvophtu"
  });
});

// API: Check Admin Init Password Status
app.get('/api/admin/status', async (req, res) => {
  await syncAdminPasswordFromDB();
  res.json({
    initialized: adminPassword.length > 0
  });
});

// API: Set Admin Password First Time
app.post('/api/admin/initialize', async (req, res) => {
  await syncAdminPasswordFromDB();
  if (adminPassword.length > 0) {
    return res.status(400).json({ error: "Admin password has already been set." });
  }

  const { password } = req.body;
  if (!password || password.trim().length === 0) {
    return res.status(400).json({ error: "Password cannot be empty." });
  }

  adminPassword = password.trim();
  fs.writeFileSync(PASSWORD_FILE, adminPassword);

  // Attempt to write to Supabase "settings" table
  try {
    await supabase.from('settings').upsert({ key: 'admin_password', value: adminPassword });
  } catch (err) {
    console.warn("Could not save password to Supabase table 'settings' - it might not exist yet.");
  }

  res.json({ success: true });
});

// API: Login Admin
app.post('/api/admin/login', async (req, res) => {
  await syncAdminPasswordFromDB();
  const { password } = req.body;
  if (!adminPassword) {
    return res.status(400).json({ error: "Admin panel password not set yet. Please set it first." });
  }

  if (password === adminPassword) {
    res.json({ success: true, token: "shifa-session-" + adminPassword.slice(0, 4) + "-live" });
  } else {
    res.status(401).json({ error: "Incorrect password." });
  }
});

// API: Get All Chat Messages (Admin)
app.get('/api/chats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (data && data.length > 0) {
      const formatted = data.map(row => ({
        id: row.id,
        sender: row.sender,
        patientSessionId: row.patientSessionId || row.patient_session_id,
        patientName: row.patientName || row.patient_name,
        message: row.message,
        createdAt: row.createdAt || row.created_at
      }));
      chatsCache = formatted;
      fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify(chatsCache, null, 2));
      return res.json(formatted);
    }
  } catch (err) {
    console.warn("Supabase chats retrieve error - fallback to local cache:", err.message);
  }
  return res.json(chatsCache);
});

// API: Post Chat Message
app.post('/api/chats', async (req, res) => {
  const msg = req.body;
  if (!msg.id || !msg.patientSessionId || !msg.message) {
    return res.status(400).json({ error: "Invalid chat message payload." });
  }

  const fullMsg = {
    id: msg.id,
    sender: msg.sender || 'patient',
    patientSessionId: msg.patientSessionId,
    patientName: msg.patientName || 'Anonymous Patient',
    message: msg.message,
    createdAt: msg.createdAt || new Date().toISOString()
  };

  chatsCache.push(fullMsg);
  fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify(chatsCache, null, 2));

  try {
    const payload = {
      id: fullMsg.id,
      sender: fullMsg.sender,
      patient_session_id: fullMsg.patientSessionId,
      patientSessionId: fullMsg.patientSessionId,
      patient_name: fullMsg.patientName,
      patientName: fullMsg.patientName,
      message: fullMsg.message,
      created_at: fullMsg.createdAt,
      createdAt: fullMsg.createdAt
    };

    const { error } = await supabase.from('chat_messages').insert(payload);
    if (error) {
      console.warn("Supabase chat message insert failed - falling back to local storage:", error.message);
    }
  } catch (err) {
    console.warn("Could not reach Supabase - cached chat locally:", err);
  }

  res.json(fullMsg);
});

// Helper to standardise database return rows to full object schema
function formatAppointment(row: any) {
  let doc = row.doctor;
  let br = row.branch;
  if (typeof doc === 'string') {
    try { doc = JSON.parse(doc); } catch(e){}
  }
  if (typeof br === 'string') {
    try { br = JSON.parse(br); } catch(e){}
  }
  return {
    id: row.id,
    tokenNumber: row.tokenNumber || row.token_number,
    patientName: row.patientName || row.patient_name,
    patientAge: row.patientAge || row.patient_age,
    patientGender: row.patientGender || row.patient_gender,
    patientPhone: row.patientPhone || row.patient_phone,
    patientEmail: row.patientEmail || row.patient_email,
    appointmentDate: row.appointmentDate || row.appointment_date,
    appointmentTime: row.appointmentTime || row.appointment_time,
    symptoms: row.symptoms,
    status: row.status,
    doctor: doc,
    branch: br,
    createdAt: row.createdAt || row.created_at
  };
}

// API: Get Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    // Attempt load from Supabase
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase load error, falling back to local files:", error.message);
      return res.json(appointmentsCache);
    }

    if (data && data.length > 0) {
      const formatted = data.map(formatAppointment);
      // Synchronize cache
      appointmentsCache = formatted;
      fs.writeFileSync(LOCAL_APTS_FILE, JSON.stringify(appointmentsCache, null, 2));
      return res.json(formatted);
    } else {
      // If table is successfully queried but completely empty, populate with initial backup
      return res.json(appointmentsCache);
    }
  } catch (err) {
    console.warn("Unhandled get appointments error - returning local cache:", err);
    return res.json(appointmentsCache);
  }
});

// API: Book a new Appointment
app.post('/api/appointments', async (req, res) => {
  const apt = req.body;
  if (!apt.id || !apt.patientName) {
    return res.status(400).json({ error: "Invalid appointment payload." });
  }

  // Backup locally first
  appointmentsCache = [apt, ...appointmentsCache];
  fs.writeFileSync(LOCAL_APTS_FILE, JSON.stringify(appointmentsCache, null, 2));

  // Try pushing to Supabase
  try {
    const payload = {
      id: apt.id,
      tokenNumber: apt.tokenNumber,
      token_number: apt.tokenNumber,
      patientName: apt.patientName,
      patient_name: apt.patientName,
      patientAge: parseInt(apt.patientAge) || 30,
      patient_age: parseInt(apt.patientAge) || 30,
      patientGender: apt.patientGender,
      patient_gender: apt.patientGender,
      patientPhone: apt.patientPhone,
      patient_phone: apt.patientPhone,
      patientEmail: apt.patientEmail,
      patient_email: apt.patientEmail,
      appointmentDate: apt.appointmentDate,
      appointment_date: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      appointment_time: apt.appointmentTime,
      symptoms: apt.symptoms || "",
      status: apt.status || 'Confirmed',
      doctor: typeof apt.doctor === 'object' ? JSON.stringify(apt.doctor) : apt.doctor,
      branch: typeof apt.branch === 'object' ? JSON.stringify(apt.branch) : apt.branch,
      createdAt: apt.createdAt || new Date().toISOString(),
      created_at: apt.createdAt || new Date().toISOString()
    };

    const { error } = await supabase.from('appointments').insert(payload);
    if (error) {
      console.warn("Error inserting appointment to Supabase - fallback used:", error.message);
    } else {
      console.log("Appointment successfully pushed to Supabase:", apt.id);
    }
  } catch (err) {
    console.warn("Could not reach Supabase - saved to local memory backup.", err);
  }

  res.json(apt);
});

// API: Cancel Appointment
app.post('/api/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;

  // Update in local cache
  appointmentsCache = appointmentsCache.map(apt => {
    if (apt.id === id) {
      return { ...apt, status: 'Cancelled' };
    }
    return apt;
  });
  fs.writeFileSync(LOCAL_APTS_FILE, JSON.stringify(appointmentsCache, null, 2));

  // Try pushing to Supabase
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Cancelled', status_modified_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      // Try again simple query
      await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('id', id);
    }
  } catch (err) {
    console.warn("Failed to reach Supabase to cancel - updated on local cache.", err);
  }

  res.json({ success: true, id });
});

// Serve frontend assets
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      // API routes should not trigger Index.html fallback
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // If dist folder doesn't exist in production, use Vite middleware as a safe fallback
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
