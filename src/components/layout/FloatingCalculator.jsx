import React, { useEffect, useRef, useState } from 'react';
import { Calculator, X, Minus, Plus, Delete, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function FloatingCalculator({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const { L } = useLanguage();

  const handleNumber = (num) => {
    setDisplay(prev => prev === '0' ? String(num) : prev + num);
  };

  const handleOperator = (op) => {
    setFormula(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // Basic math only for security
      const result = eval(formula + display);
      setDisplay(String(result));
      setFormula('');
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFormula('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const x = Math.max(window.innerWidth - 360, 16);
    const y = 96;
    setPosition({ x, y });
  }, [isOpen]);

  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (event) => {
      const maxX = Math.max(window.innerWidth - 320, 16);
      const maxY = Math.max(window.innerHeight - 120, 16);
      const nextX = Math.min(Math.max(event.clientX - dragOffsetRef.current.x, 16), maxX);
      const nextY = Math.min(Math.max(event.clientY - dragOffsetRef.current.y, 16), maxY);
      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => setDragging(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging]);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    dragOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    setDragging(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed w-80 bg-white rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.3)] z-[200] overflow-hidden border border-navy-50 animate-scale-in"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* Header */}
      <div
        className={`p-6 bg-navy-950 text-white flex items-center justify-between ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={startDrag}
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span className="text-xs md:text-sm font-black uppercase tracking-widest">{L('QUICK CALC', 'CALCUL RAPIDE')}</span>
        </div>
        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Display */}
      <div className="p-8 bg-navy-50/50 text-right">
        <p className="text-xs md:text-sm font-black text-blue-gray uppercase tracking-widest h-4 mb-1">{formula}</p>
        <p className="text-3xl md:text-4xl font-black text-navy-950 tracking-tighter truncate">{display}</p>
      </div>

      {/* Keys */}
      <div className="p-6 grid grid-cols-4 gap-3 bg-white">
        <button onClick={clear} className="col-span-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase hover:bg-rose-100 transition-all">{L('Clear', 'Effacer')}</button>
        <button onClick={() => handleOperator('/')} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:bg-navy-100 transition-all">÷</button>
        <button onClick={() => handleOperator('*')} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:bg-navy-100 transition-all">×</button>

        {[7, 8, 9].map(n => (
          <button key={n} onClick={() => handleNumber(n)} className="py-5 bg-white border border-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:border-emerald-500 hover:text-emerald-600 transition-all">{n}</button>
        ))}
        <button onClick={() => handleOperator('-')} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:bg-navy-100 transition-all">−</button>

        {[4, 5, 6].map(n => (
          <button key={n} onClick={() => handleNumber(n)} className="py-5 bg-white border border-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:border-emerald-500 hover:text-emerald-600 transition-all">{n}</button>
        ))}
        <button onClick={() => handleOperator('+')} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:bg-navy-100 transition-all">+</button>

        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => handleNumber(n)} className="py-5 bg-white border border-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:border-emerald-500 hover:text-emerald-600 transition-all">{n}</button>
        ))}
        <button onClick={calculate} className="row-span-2 bg-emerald-500 text-white rounded-2xl font-black text-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">=</button>

        <button onClick={() => handleNumber(0)} className="col-span-2 py-5 bg-white border border-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:border-emerald-500 hover:text-emerald-600 transition-all">0</button>
        <button onClick={() => setDisplay(prev => prev.includes('.') ? prev : prev + '.')} className="py-5 bg-white border border-navy-50 text-navy-950 rounded-2xl font-black text-xl hover:border-emerald-500 hover:text-emerald-600 transition-all">.</button>
      </div>
    </div>
  );
}
