/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  Clock, 
  FileText, 
  Home, 
  LayoutDashboard, 
  MessageSquare, 
  Search, 
  Settings, 
  Activity,
  Heart,
  Moon,
  User,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Calendar, label: 'Appointments' },
  { icon: FileText, label: 'Health Records' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Settings, label: 'Settings' },
];

const HEALTH_STATS = [
  { icon: Activity, label: 'Health Score', value: '88', unit: '/100', color: 'text-primary' },
  { icon: Heart, label: 'Avg Heart Rate', value: '72', unit: 'bpm', color: 'text-error' },
  { icon: Moon, label: 'Deep Sleep', value: '6.5', unit: 'hrs', color: 'text-secondary' },
];

const UPCOMING_APPOINTMENTS = [
  { 
    doctor: 'Dr. Sarah Mitchell', 
    specialty: 'Cardiologist', 
    time: 'Tomorrow, 10:30 AM',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ce417274?auto=format&fit=crop&q=80&w=100&h=100'
  }
];

const LAB_RESULTS = [
  { test: 'Complete Blood Count', date: 'May 08, 2026', status: 'Normal', physician: 'Dr. James Wilson' },
  { test: 'Lipid Panel', date: 'Apr 24, 2026', status: 'Attention', physician: 'Dr. Sarah Mitchell' },
  { test: 'Vitamin D Level', date: 'Mar 15, 2026', status: 'Normal', physician: 'Dr. James Wilson' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex min-h-screen bg-surface font-sans selection:bg-white selection:text-black">
      {/* Background Graphic Elements */}
      <div className="fixed top-0 right-0 w-1/3 h-full bg-surface-dim -z-10 border-l border-outline"></div>
      
      {/* Sidebar */}
      <aside className="w-24 border-r border-outline bg-surface flex flex-col sticky top-0 h-screen hidden md:flex items-center pb-12">
        <div className="py-12">
          <div className="text-xl tracking-[0.4em] font-serif italic text-white rotate-[-90deg] whitespace-nowrap origin-center">
            SERENE.
          </div>
        </div>

        <nav className="flex-1 flex flex-col justify-center gap-12 font-sans text-[10px] tracking-[0.25em] uppercase text-on-surface-variant">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`rotate-[-90deg] whitespace-nowrap transition-all flex items-center gap-2 group ${
                activeTab === item.label ? 'text-white' : 'hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {activeTab === item.label && (
                <motion.div layoutId="nav-dot" className="w-[4px] h-[4px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-6 items-center">
          <div className="w-[1px] h-24 bg-outline"></div>
          <Settings className="w-4 h-4 text-on-surface-variant hover:text-white cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-24 border-b border-outline px-12 flex items-center justify-between z-10 sticky top-0 bg-surface/80 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-1">Architecture of Health</span>
            <h1 className="text-2xl italic tracking-tight">Dashboard.02</h1>
          </div>

          <div className="flex items-center gap-12">
            <div className="relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant transition-colors group-focus-within:text-white" />
              <input 
                type="text" 
                placeholder="SEARCH ARCHIVE..." 
                className="bg-transparent border-none py-2 pl-8 pr-4 text-[10px] tracking-[0.2em] font-sans focus:ring-0 outline-none w-64 transition-all focus:w-80"
              />
            </div>
            
            <button className="p-2 border border-outline hover:border-white/20 transition-colors relative">
              <Bell className="w-4 h-4 text-on-surface-variant" />
              <span className="absolute top-0 right-0 w-1 h-1 bg-white"></span>
            </button>

            <div className="flex items-center gap-4 pl-12 border-l border-outline">
              <div className="text-right">
                <p className="text-[10px] tracking-widest font-semibold uppercase">Alex Johnson</p>
                <p className="text-[9px] tracking-widest text-on-surface-variant uppercase">SH-20948</p>
              </div>
              <div className="w-10 h-10 border border-outline flex items-center justify-center text-xs tracking-widest font-bold">
                AJ
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-12 max-w-screen-2xl mx-auto w-full space-y-16">
          {/* Central Display Section */}
          <section className="flex relative h-[480px]">
            {/* Overlapping Typography */}
            <div className="absolute -left-12 top-[10%] z-20 pointer-events-none">
              <h1 className="text-[140px] leading-[0.8] font-light italic text-white/95 tracking-tighter">
                Health<br />
                <span className="ml-32">Integrity.</span>
              </h1>
            </div>

            {/* Feature Image Frame */}
            <div className="ml-auto w-[680px] h-full bg-surface-dim relative overflow-hidden group border border-outline">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" 
                alt="Architecture"
                className="w-full h-full object-cover grayscale opacity-40 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-8 left-8 flex flex-col font-sans">
                <span className="text-[9px] uppercase tracking-[0.3em] text-on-surface-variant mb-1">Clinic Center</span>
                <span className="text-xs font-light tracking-widest uppercase">Copenhagen, Denmark</span>
              </div>
              <div className="absolute top-0 right-0 p-8">
                <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Detailed Info Box */}
            <div className="absolute bottom-12 left-16 w-80 bg-surface/40 backdrop-blur-xl p-10 border border-outline z-10 shadow-2xl">
              <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-4">Patient Status</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant italic mb-8">
                "A balanced study in nutrition and circadian rhythms. The recent biological metrics suggest a state of optimized homeostasis."
              </p>
              <div className="geometric-line mb-4"></div>
              <div className="font-sans text-[10px] tracking-widest text-white uppercase">Wellness Report // Vol. 24</div>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-4 border-y border-outline mx-[-48px]">
            {HEALTH_STATS.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 flex flex-col gap-6 border-r border-outline last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-on-surface-variant">{stat.label}</span>
                  <stat.icon className="w-3 h-3 text-on-surface-variant" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-serif italic tracking-tighter">{stat.value}</span>
                  <span className="text-xs tracking-widest opacity-40 uppercase">{stat.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-16">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl">Archive Results</h2>
                  <button className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-white transition-colors">View All Works</button>
                </div>
                <div className="border border-outline bg-surface-dim divide-y divide-outline">
                  {LAB_RESULTS.map((result) => (
                    <div key={result.test} className="grid grid-cols-4 p-8 items-center group cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="col-span-1">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-variant mb-1 group-hover:text-white">Pathology</p>
                        <p className="text-sm font-serif italic">{result.test}</p>
                      </div>
                      <div className="text-[11px] font-sans tracking-widest text-on-surface-variant text-center">{result.date}</div>
                      <div className="flex justify-center">
                        <span className={`text-[10px] tracking-[0.3em] uppercase ${
                          result.status === 'Normal' ? 'text-white' : 'text-on-surface-variant underline'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="text-[10px] tracking-widest text-right text-on-surface-variant">{result.physician.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trends Section */}
              <section className="brutalist-card !bg-transparent !p-0 border-none overflow-visible">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl">Biological Rhythms</h2>
                </div>
                <div className="h-64 flex items-end justify-between gap-[2px] border-b border-outline pb-4">
                  {[45, 60, 55, 75, 45, 90, 85, 70, 60, 80, 95, 80].map((height, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="flex-1 bg-white/5 relative group cursor-crosshair"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] p-2 tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                        VAL.{height}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-16">
              <section className="space-y-8">
                <h2 className="text-2xl italic">Timeline.</h2>
                {UPCOMING_APPOINTMENTS.map((app) => (
                  <div key={app.doctor} className="brutalist-card space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl">01</div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 grayscale border border-outline relative overflow-hidden">
                        <img src={app.avatar} alt="Doctor" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-on-surface-variant mb-1">{app.specialty}</p>
                        <p className="text-base font-serif italic tracking-tight">{app.doctor}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">Scheduled Projection</p>
                       <p className="text-xs tracking-[0.2em] uppercase">{app.time}</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 py-3 bg-white text-black text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-on-surface transition-colors">Confirm</button>
                      <button className="flex-1 py-3 border border-outline text-white text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white/5 transition-colors">Modify</button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="bg-white p-10 text-black space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.6em]">System Advice</span>
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm font-serif italic leading-relaxed">
                  "The interplay of natural light and consistent movement has resulted in a 25% optimization of core recovery metrics. Continue the current path."
                </p>
                <div className="h-[1px] bg-black/10"></div>
                <button className="text-[10px] font-bold uppercase tracking-[0.4em] hover:underline underline-offset-4">Read Manifesto</button>
              </section>
            </aside>
          </div>
        </div>

        {/* Bottom Bar */}
        <footer className="h-24 px-12 border-t border-outline flex items-center justify-between font-sans text-[9px] uppercase tracking-[0.4em] text-on-surface-variant mt-24 bg-surface-dim">
          <div className="flex gap-12">
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors">Behance</span>
            <span className="hover:text-white cursor-pointer transition-colors">Archive</span>
          </div>
          <div className="text-right italic">
            All rights reserved © 2026 Serene Studio
          </div>
        </footer>
      </main>
    </div>
  );
}

