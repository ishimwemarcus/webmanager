import React, { useState } from 'react';
import { Calculator, X, RotateCcw, Delete } from 'lucide-react';

export default function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState([]);

  const handleNumber = (num) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // eslint-disable-next-line no-eval
      const result = eval(fullEq.replace('×', '*').replace('÷', '/'));
      setHistory(prev => [fullEq + ' = ' + result, ...prev].slice(0, 5));
      setDisplay(result.toString());
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const backspace = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-navy-brand text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all group no-print"
      >
        <Calculator className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] w-80 glass-card bg-white/90 backdrop-blur-xl rounded-[32px] border border-navy-50 shadow-[0_32px_64px_rgba(0,0,0,0.15)] overflow-hidden animate-scale-in no-print">
      <div className="p-4 bg-navy-brand text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Asset Calculator</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Screen */}
        <div className="bg-navy-50/50 rounded-2xl p-4 text-right border border-navy-50 shadow-inner">
          <p className="text-[9px] font-bold text-blue-gray h-4 mb-1 uppercase tracking-widest">{equation}</p>
          <p className="text-3xl font-black text-navy-brand truncate">{display}</p>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className="p-3 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-500 hover:text-white transition-all uppercase">C</button>
          <button onClick={backspace} className="p-3 rounded-xl bg-navy-50 text-navy-brand font-black text-xs hover:bg-navy-100 transition-all flex items-center justify-center"><Delete className="w-4 h-4" /></button>
          <button onClick={() => handleOperator('/')} className="p-3 rounded-xl bg-navy-50 text-navy-brand font-black text-xs hover:bg-navy-100 transition-all">÷</button>
          <button onClick={() => handleOperator('*')} className="p-3 rounded-xl bg-navy-50 text-navy-brand font-black text-xs hover:bg-navy-100 transition-all">×</button>

          {[7, 8, 9].map(n => (
            <button key={n} onClick={() => handleNumber(n.toString())} className="p-3 rounded-xl bg-white border border-navy-50 text-charcoal font-black text-sm hover:border-navy-brand transition-all shadow-sm">{n}</button>
          ))}
          <button onClick={() => handleOperator('-')} className="p-3 rounded-xl bg-navy-50 text-navy-brand font-black text-xs hover:bg-navy-100 transition-all">−</button>

          {[4, 5, 6].map(n => (
            <button key={n} onClick={() => handleNumber(n.toString())} className="p-3 rounded-xl bg-white border border-navy-50 text-charcoal font-black text-sm hover:border-navy-brand transition-all shadow-sm">{n}</button>
          ))}
          <button onClick={() => handleOperator('+')} className="p-3 rounded-xl bg-navy-50 text-navy-brand font-black text-xs hover:bg-navy-100 transition-all">+</button>

          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => handleNumber(n.toString())} className="p-3 rounded-xl bg-white border border-navy-50 text-charcoal font-black text-sm hover:border-navy-brand transition-all shadow-sm">{n}</button>
          ))}
          <button onClick={calculate} className="row-span-2 p-3 rounded-xl bg-navy-brand text-white font-black text-sm hover:shadow-lg hover:shadow-navy-brand/30 transition-all">=</button>

          <button onClick={() => handleNumber('0')} className="col-span-2 p-3 rounded-xl bg-white border border-navy-50 text-charcoal font-black text-sm hover:border-navy-brand transition-all shadow-sm">0</button>
          <button onClick={() => handleNumber('.')} className="p-3 rounded-xl bg-white border border-navy-50 text-charcoal font-black text-sm hover:border-navy-brand transition-all shadow-sm">.</button>
        </div>

        {/* History Area */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-navy-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black uppercase text-blue-gray tracking-[0.2em]">Computation History</span>
              <button onClick={() => setHistory([])} className="p-1 hover:bg-navy-50 rounded-md"><RotateCcw className="w-3 h-3 text-blue-gray" /></button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <p key={i} className="text-[9px] font-bold text-blue-gray opacity-60 hover:opacity-100 transition-opacity cursor-pointer truncate" onClick={() => setDisplay(h.split('=')[1].trim())}>{h}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
