import React, { useState, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

// Modern, dark-mode-friendly date picker for Tailwind/Next.js
export default function ModernDatePicker({ value, onChange, placeholder = 'Select a date' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const handleDaySelect = (date) => {
    setOpen(false);
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        ref={ref}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-[#1a1f36] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-left font-medium min-h-[56px]"
      >
        <span>{value ? format(value, 'PPP') : <span className="text-gray-400">{placeholder}</span>}</span>
        <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-3 left-0 w-[320px] bg-[#181f3a] border border-purple-500/40 rounded-2xl shadow-2xl p-5 flex flex-col items-center animate-fade-in" style={{boxShadow: '0 8px 32px 0 rgba(40, 20, 80, 0.25)'}}>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleDaySelect}
            showOutsideDays
            className="text-white"
            styles={{
              caption: { color: '#fff', textAlign: 'center' },
              head_cell: { color: '#a78bfa', fontWeight: 600 },
              day_selected: { backgroundColor: '#a78bfa', color: '#fff', borderRadius: '8px' },
              day_today: { border: '1px solid #a78bfa', borderRadius: '8px' },
              table: { margin: '0 auto' },
            }}
          />
        </div>
      )}
    </div>
  );
} 