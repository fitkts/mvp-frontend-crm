import React, { useState } from 'react';
import { X, Settings2, Calculator, Percent, DollarSign, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { baseSalary: number, incentiveRate: number }) => void;
  currentSettings: { baseSalary: number, incentiveRate: number };
}

export default function PaymentSettingsModal({ isOpen, onClose, onSave, currentSettings }: Props) {
  const [baseSalary, setBaseSalary] = useState(currentSettings.baseSalary);
  const [incentiveRate, setIncentiveRate] = useState(currentSettings.incentiveRate);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ baseSalary, incentiveRate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                 <Settings2 size={18} />
              </div>
              <h3 className="text-base font-black text-slate-900">지급 항목 설정</h3>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
              <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           {/* Base Salary */}
           <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                 <DollarSign size={12} /> 기본급 (Base Salary)
              </label>
              <div className="relative">
                 <input 
                   type="number"
                   value={baseSalary}
                   onChange={(e) => setBaseSalary(Number(e.target.value))}
                   className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">원</span>
              </div>
           </div>

           {/* Incentive Rate */}
           <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                 <Percent size={12} /> 매출 인센티브 요율
              </label>
              <div className="relative">
                 <input 
                   type="number"
                   step="0.1"
                   value={incentiveRate}
                   onChange={(e) => setIncentiveRate(Number(e.target.value))}
                   className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
           </div>
        </div>

        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex gap-3">
           <button 
             onClick={onClose}
             className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
           >
              취소
           </button>
           <button 
             onClick={handleSave}
             className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
           >
              <Save size={16} /> 설정 저장
           </button>
        </div>
      </motion.div>
    </div>
  );
}
