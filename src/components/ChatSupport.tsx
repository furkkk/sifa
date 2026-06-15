/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, HeartPulse } from 'lucide-react';
import { ChatMessage } from '../types';

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [isNameRegistered, setIsNameRegistered] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>('');
  
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
      isSaved: true 
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
          className="w-14 h-14 bg-neutral-950 hover:bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-cyan-400/10 hover:scale-105 transition-all cursor-pointer border border-neutral-800 relative group"
          id="shifa-support-toggle"
        >
          <MessageSquare className="w-5.5 h-5.5 text-cyan-400 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full border-2 border-neutral-950 animate-ping" />
          <span className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full border-2 border-neutral-950" />
        </button>
      )}

      {/* Expanded Active Support Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] bg-neutral-950 rounded-3xl border border-neutral-900 shadow-2xl overflow-hidden flex flex-col animate-fade-in relative text-neutral-200">
          
          {/* Header */}
          <div className="bg-neutral-900 text-neutral-300 p-4 px-5 flex justify-between items-center border-b border-neutral-850">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 bg-neutral-950 rounded-xl flex items-center justify-center border border-neutral-800">
                <HeartPulse className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">Support Concierge</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-sans mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Helpdesk Live
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 bg-neutral-950 p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
            {!isNameRegistered ? (
              // Stage A: Register Name before Messaging
              <div className="my-auto space-y-4 px-2 text-center animate-fade-in">
                <div className="p-3 bg-neutral-900 text-cyan-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-neutral-800">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Introduce Yourself</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Please provide your name to start a live discussion with the Shifa clinical support executives.</p>
                </div>
                <form onSubmit={handleRegisterName} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    maxLength={35}
                    placeholder="e.g. John Doe"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-center rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-sans placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white hover:bg-neutral-100 text-black text-[11px] font-extrabold tracking-wider uppercase rounded-full cursor-pointer transition shadow-sm"
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
                      <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] text-cyan-400 font-semibold shrink-0 uppercase">
                        S
                      </div>
                      <div className="bg-neutral-900 text-neutral-300 p-2.5 rounded-2xl rounded-tl-none max-w-[80%] border border-neutral-850">
                        Hello {patientName}! Our team is online. Drop a message regarding booking availability, pricing, or emergency procedures, and an executive will reply shortly.
                      </div>
                    </div>
                  )}

                  {messages.map((m) => {
                    const isMe = m.sender === 'patient';
                    return (
                      <div key={m.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-[8px] text-cyan-400 font-bold shrink-0 uppercase font-mono">
                            OPD
                          </div>
                        )}
                        <div className={`p-2.5 rounded-2xl max-w-[80%] break-words ${
                          isMe 
                            ? 'bg-neutral-900 text-white rounded-tr-none text-right border border-neutral-800' 
                            : 'bg-neutral-900 text-cyan-400 rounded-tl-none text-left border border-cyan-451 border-cyan-950/40'
                        }`}>
                          <p className="leading-relaxed">{m.message}</p>
                          <span className={`block text-[8px] mt-1 ${isMe ? 'text-neutral-500' : 'text-cyan-600'} font-mono`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-900 flex gap-2 bg-neutral-950">
                  <input
                    type="text"
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message here..."
                    className="flex-1 text-xs rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition-all font-sans placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-white hover:bg-neutral-100 text-black rounded-full flex items-center justify-center shrink-0 cursor-pointer transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-black font-extrabold" />
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
