/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, MessageCircle, HeartPulse, Clock } from 'lucide-react';
import { ChatMessage } from '../types';

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [isNameRegistered, setIsNameRegistered] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat session on mount
  useEffect(() => {
    let savedSession = localStorage.getItem('shifa_chat_session');
    
    if (!savedSession) {
      savedSession = 'client-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('shifa_chat_session', savedSession);
    }
    setSessionId(savedSession);

    const syncFromPatientUser = () => {
      const pUserStr = localStorage.getItem('shifa_patient_user');
      if (pUserStr) {
        try {
          const user = JSON.parse(pUserStr);
          if (user && user.name) {
            setPatientName(user.name);
            setIsNameRegistered(true);
            return;
          }
        } catch (e) {}
      }

      let savedName = localStorage.getItem('shifa_chat_name');
      if (savedName) {
        setPatientName(savedName);
        setIsNameRegistered(true);
      } else {
        setIsNameRegistered(false);
      }
    };

    syncFromPatientUser();

    // Listen to storage changes to sync immediately
    window.addEventListener('storage', syncFromPatientUser);
    return () => {
      window.removeEventListener('storage', syncFromPatientUser);
    };
  }, []);

  // Poll messages every 3 seconds when chat is open
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchChatMessages = async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          // Filter messages for current user session
          const filtered = data.filter(m => m.patientSessionId === sessionId);
          setMessages(filtered);
        }
      } catch (err) {
        console.warn("Could not retrieve live chat logs:", err);
      }
    };

    fetchChatMessages(); // Initial load

    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(fetchChatMessages, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRegisterName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    
    const trimmed = nameInput.trim();
    localStorage.setItem('shifa_chat_name', trimmed);
    setPatientName(trimmed);
    setIsNameRegistered(true);

    const dummyUser = { 
      name: trimmed, 
      email: trimmed.toLowerCase().replace(/\s+/g, '') + '@clinicalsupport.com', 
      phone: '', 
      isSaved: false 
    };
    localStorage.setItem('shifa_patient_user', JSON.stringify(dummyUser));

    // Send a system greeting/trigger
    const initMessage: ChatMessage = {
      id: 'msg-start-' + Date.now(),
      sender: 'patient',
      patientSessionId: sessionId,
      patientName: trimmed,
      message: `Joined live support chat as "${trimmed}".`,
      createdAt: new Date().toISOString()
    };

    sendToServer(initMessage);
  };

  const sendToServer = async (msg: ChatMessage) => {
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
    } catch (err) {
      console.warn("Could not sync message live to backend:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let phone = "";
    let email = "";
    const pUserStr = localStorage.getItem('shifa_patient_user');
    if (pUserStr) {
      try {
        const pUser = JSON.parse(pUserStr);
        phone = pUser.phone || "";
        email = pUser.email || "";
      } catch (e) {}
    }

    const newMsg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
      sender: 'patient',
      patientSessionId: sessionId,
      patientName: patientName || 'Patient',
      message: text.trim(),
      createdAt: new Date().toISOString(),
      patientPhone: phone,
      patientEmail: email
    };

    // Optimistic state
    setMessages(prev => [...prev, newMsg]);
    setText('');
    
    await sendToServer(newMsg);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button wrapper */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border border-blue-500 relative"
          id="shifa-support-toggle"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white animate-ping" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Expanded Active Support Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col animate-fade-in relative">
          
          {/* Header */}
          <div className="bg-slate-900 text-slate-150 p-4 px-5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">Support Concierge</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-sans mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Helpdesk Live
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 bg-slate-50/50 p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
            {!isNameRegistered ? (
              // Stage A: Register Name before Messaging
              <div className="my-auto space-y-4 px-2 text-center animate-fade-in">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-blue-100">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Introduce Yourself</h4>
                  <p className="text-[11px] text-slate-400">Please provide your name to start a live discussion with the Shifa clinical support executives.</p>
                </div>
                <form onSubmit={handleRegisterName} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    maxLength={35}
                    placeholder="e.g. John Doe"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition-all font-sans"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold tracking-wider uppercase rounded-full cursor-pointer transition shadow-xs"
                  >
                    Connect with Support desk
                  </button>
                </form>
              </div>
            ) : (
              // Stage B: Main Chat Log
              <div className="flex-1 flex flex-col h-full justify-between">
                
                {/* Chat Log View */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {/* Automated Initial Helper Welcome message if empty */}
                  {messages.length === 0 && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-semibold shrink-0 uppercase">
                        S
                      </div>
                      <div className="bg-slate-100 text-slate-800 p-2.5 rounded-2xl rounded-tl-none max-w-[80%]">
                        Hello {patientName}! Our team is online. Drop a message regarding booking availability, pricing, or emergency procedures, and an executive will reply shortly.
                      </div>
                    </div>
                  )}

                  {messages.map((m) => {
                    const isMe = m.sender === 'patient';
                    return (
                      <div key={m.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-slate-300 font-bold shrink-0 uppercase font-mono">
                            OPD
                          </div>
                        )}
                        <div className={`p-2.5 rounded-2xl max-w-[80%] break-words ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none text-right' 
                            : 'bg-white border select-all border-slate-200 text-slate-800 rounded-tl-none text-left'
                        }`}>
                          <p className="leading-relaxed">{m.message}</p>
                          <span className={`block text-[8px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'} font-mono`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message here..."
                    className="flex-1 text-xs rounded-full border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-blue-500 transition-all font-sans"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-605 hover:bg-blue-700 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
