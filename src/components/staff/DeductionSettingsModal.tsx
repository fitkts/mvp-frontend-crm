import React, { useState } from 'react';
import { X, ShieldCheck, Briefcase, Percent, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export type EmploymentType = 'REGULAR' | 'FREELANCE';

export interface DeductionSettings {
  type: EmploymentType;
  items: {
    incomeTax: boolean;
    residenceTax: boolean;
    nationalPension: boolean;
    healthInsurance: boolean;
    longTermCare: boolean;
    unemploymentInsurance: boolean;
  };
  rates: {
    incomeTax: number; // Freelance usually 3%
    residenceTax: number; // usually 0.3%
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: DeductionSettings) => void;
  currentSettings: DeductionSettings;
}

export default function DeductionSettingsModal({ isOpen, onClose, onSave, currentSettings }: Props) {
  const [settings, setSettings] = useState<DeductionSettings>(currentSettings);

  if (!isOpen) return null;

  const toggleItem = (key: keyof DeductionSettings['items']) => {
    setSettings(prev => ({
      ...prev,
      items: { ...prev.items, [key]: !prev.items[key] }
    }));
  };

  const setType = (type: EmploymentType) => {
    // Default presets for types
    if (type === 'FREELANCE') {
      setSettings({
        type,
        items: {
          incomeTax: true,
          residenceTax: true,
          nationalPension: false,
          healthInsurance: false,
          longTermCare: false,
          unemploymentInsurance: false,
        },
        rates: { incomeTax: 3, residenceTax: 0.3 }
      });
    } else {
      setSettings({
        type,
        items: {
          incomeTax: true,
          residenceTax: true,
          nationalPension: true,
          healthInsurance: true,
          longTermCare: true,
          unemploymentInsurance: true,
        },
        rates: { incomeTax: 0, residenceTax: 0 } // Regular uses progressive tax table usually, but we keep it simple
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                 <ShieldCheck size={18} />
              </div>
              <h3 className="text-base font-black text-slate-900">공제 항목 설정</h3>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
              <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           {/* Employment Type Selection */}
           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">고용 형태 선택</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                 <button 
                   onClick={() => setType('REGULAR')}
                   className={`py-2.5 rounded-xl text-xs font-bold transition-all ${settings.type === 'REGULAR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    정규직 (4대보험)
                 </button>
                 <button 
                   onClick={() => setType('FREELANCE')}
                   className={`py-2.5 rounded-xl text-xs font-bold transition-all ${settings.type === 'FREELANCE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    프리랜서 (3.3%)
                 </button>
              </div>
           </div>

           {/* Toggle Items */}
           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">적용 공제 항목</label>
              <div className="space-y-2">
                 {/* Item: Income Tax */}
                 <button 
                   onClick={() => toggleItem('incomeTax')}
                   className={`w-full flex items-center justify-between p-3 border rounded-2xl transition-all ${settings.items.incomeTax ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${settings.items.incomeTax ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <Check size={14} strokeWidth={3} />
                       </div>
                       <span className={`text-[13px] font-bold ${settings.items.incomeTax ? 'text-rose-900' : 'text-slate-400'}`}>소득세</span>
                    </div>
                    {settings.type === 'FREELANCE' && settings.items.incomeTax && (
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-rose-100">
                         <input 
                           type="number" 
                           value={settings.rates.incomeTax} 
                           onChange={(e) => setSettings(prev => ({ ...prev, rates: { ...prev.rates, incomeTax: Number(e.target.value) } }))}
                           className="w-8 text-[11px] font-black text-rose-600 outline-none"
                         />
                         <span className="text-[10px] font-bold text-rose-300">%</span>
                      </div>
                    )}
                 </button>

                 {/* Regular Only: Insurances */}
                 {settings.type === 'REGULAR' && (
                   <div className="grid grid-cols-2 gap-2">
                      {(['nationalPension', 'healthInsurance', 'longTermCare', 'unemploymentInsurance'] as const).map(key => (
                         <button 
                           key={key}
                           onClick={() => toggleItem(key)}
                           className={`flex items-center gap-2.5 p-3 border rounded-2xl transition-all ${settings.items[key] ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                         >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${settings.items[key] ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                               <Check size={12} strokeWidth={3} />
                            </div>
                            <span className={`text-[11px] font-bold text-left leading-tight ${settings.items[key] ? 'text-indigo-900' : 'text-slate-400'}`}>
                               {key === 'nationalPension' && '국민연금'}
                               {key === 'healthInsurance' && '건강보험'}
                               {key === 'longTermCare' && '장기요양'}
                               {key === 'unemploymentInsurance' && '고용보험'}
                            </span>
                         </button>
                      ))}
                   </div>
                 )}

                 {/* Residence Tax Toggle */}
                 <button 
                   onClick={() => toggleItem('residenceTax')}
                   className={`w-full flex items-center justify-between p-3 border rounded-2xl transition-all ${settings.items.residenceTax ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${settings.items.residenceTax ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <Check size={14} strokeWidth={3} />
                       </div>
                       <span className={`text-[13px] font-bold ${settings.items.residenceTax ? 'text-amber-900' : 'text-slate-400'}`}>지방소득세</span>
                    </div>
                    {settings.type === 'FREELANCE' && settings.items.residenceTax && (
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-amber-100">
                         <input 
                           type="number" 
                           step="0.1"
                           value={settings.rates.residenceTax} 
                           onChange={(e) => setSettings(prev => ({ ...prev, rates: { ...prev.rates, residenceTax: Number(e.target.value) } }))}
                           className="w-10 text-[11px] font-black text-amber-600 outline-none"
                         />
                         <span className="text-[10px] font-bold text-amber-300">%</span>
                      </div>
                    )}
                 </button>
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                고용 형태에 따른 기본 공제 항목이 자동 설정됩니다. <br />
                정규직의 경우 급여 구간에 따른 비과세 및 소득세 조견표가 적용됩니다.
              </p>
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
             onClick={() => { onSave(settings); onClose(); }}
             className="flex-1 py-3 bg-rose-600 text-white text-sm font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
           >
              적용하기
           </button>
        </div>
      </motion.div>
    </div>
  );
}
