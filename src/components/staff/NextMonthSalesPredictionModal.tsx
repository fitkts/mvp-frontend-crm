import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Calendar, AlertCircle, CheckCircle2, ChevronRight, Calculator, PieChart, Sparkles, Search, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProspectMember {
  id: number;
  name: string;
  currentProduct: string;
  usageRate: number; // 0 to 1
  remainingDays: number;
  expectedAmount: number;
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'RENEWAL' | 'NEW_CONSULT';
  isConfirmed?: boolean;
}

interface MemberDatabase {
  name: string;
  product: string;
  usageRate: number;
  remainingDays: number;
  expectedAmount: number;
}

const ALL_MEMBERS: MemberDatabase[] = [
  { name: '김철수', product: 'PT 20회', usageRate: 0.75, remainingDays: 20, expectedAmount: 1200000 },
  { name: '이영희', product: '바디프로필 패키지', usageRate: 0.60, remainingDays: 45, expectedAmount: 2500000 },
  { name: '박지성', product: 'PT 스탠다드 10회', usageRate: 0.90, remainingDays: 10, expectedAmount: 700000 },
  { name: '손흥민', product: 'PT 프리미엄 30회', usageRate: 0.40, remainingDays: 60, expectedAmount: 3300000 },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
}

const INITIAL_PROSPECTS: ProspectMember[] = [
  { id: 1, name: '강민준', currentProduct: 'PT 프리미엄 20회', usageRate: 0.85, remainingDays: 45, expectedAmount: 1600000, probability: 'HIGH', type: 'RENEWAL', isConfirmed: true },
  { id: 2, name: '이준호', currentProduct: 'PT 프리미엄 30회', usageRate: 0.72, remainingDays: 12, expectedAmount: 2200000, probability: 'HIGH', type: 'RENEWAL', isConfirmed: false },
  { id: 3, name: '최지우', currentProduct: '바디프로필 패키지', usageRate: 0.92, remainingDays: 5, expectedAmount: 1800000, probability: 'HIGH', type: 'RENEWAL', isConfirmed: true },
  { id: 101, name: '정우성(신규)', currentProduct: '상담 진행 중', usageRate: 0, remainingDays: 0, expectedAmount: 1200000, probability: 'MEDIUM', type: 'NEW_CONSULT', isConfirmed: false },
];

export default function NextMonthSalesPredictionModal({ isOpen, onClose, staffName }: Props) {
  const [prospects, setProspects] = useState<ProspectMember[]>(INITIAL_PROSPECTS);
  const [newEntryName, setNewEntryName] = useState('');
  const [suggestions, setSuggestions] = useState<MemberDatabase[]>([]);

  if (!isOpen) return null;

  const handleToggleConfirm = (id: number) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, isConfirmed: !p.isConfirmed } : p));
  };

  const handleNameChange = (val: string) => {
    setNewEntryName(val);
    if (val.length > 0) {
      const filtered = ALL_MEMBERS.filter(m => m.name.includes(val));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (member: MemberDatabase) => {
    const newProspect: ProspectMember = {
      id: Date.now(),
      name: member.name,
      currentProduct: member.product,
      usageRate: member.usageRate,
      remainingDays: member.remainingDays,
      expectedAmount: member.expectedAmount,
      probability: 'MEDIUM',
      type: 'RENEWAL',
      isConfirmed: false
    };
    setProspects(prev => [...prev, newProspect]);
    setNewEntryName('');
    setSuggestions([]);
  };

  const totalExpectedRevenue = prospects.reduce((acc, curr) => acc + curr.expectedAmount, 0);
  const weightedRevenue = prospects.reduce((acc, curr) => {
    const multiplier = curr.probability === 'HIGH' ? 0.9 : curr.probability === 'MEDIUM' ? 0.5 : 0.2;
    return acc + (curr.expectedAmount * multiplier);
  }, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
               <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">익월 예상 매출 리포트</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                <span className="text-indigo-600 font-bold">{staffName}</span> 트레이너님의 다음 달 예상 실적 가이드입니다.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-6">
           {/* High-Level Stats */}
           <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2 bg-slate-900 p-3 rounded-xl shadow-md relative overflow-hidden group">
                 <div className="absolute right-[-2%] top-[-5%] text-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={60} />
                 </div>
                 <div className="relative z-10 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calculator size={12} className="text-indigo-400" /> 가중치 적용 예상 매출
                 </div>
                 <div className="relative z-10 text-xl font-black text-white tabular-nums flex items-baseline gap-1">
                    {Math.floor(weightedRevenue).toLocaleString()}<span className="text-[10px] font-bold text-slate-400">원</span>
                 </div>
                 <div className="relative z-10 mt-1.5 flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                       <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
                       <span className="text-[9px] text-indigo-100 font-bold italic">Prob. 82.4%</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium tracking-tight">최대: <span className="text-slate-300 font-black">{totalExpectedRevenue.toLocaleString()}원</span></span>
                 </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                 <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users size={12} className="text-rose-500" /> 재계약 대상
                 </div>
                 <div className="text-lg font-black text-slate-900 tabular-nums">
                    {prospects.filter(p => p.type === 'RENEWAL').length}<span className="text-[10px] font-bold text-slate-400 ml-0.5">명</span>
                 </div>
                 <div className="mt-1 text-[9px] text-rose-500 font-bold flex items-center gap-1">
                    <AlertCircle size={10} /> 임박 대상 포함
                 </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                 <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar size={12} className="text-emerald-500" /> 상담 및 신규
                 </div>
                 <div className="text-lg font-black text-slate-900 tabular-nums">
                    {prospects.filter(p => p.type === 'NEW_CONSULT').length}<span className="text-[10px] font-bold text-slate-400 ml-0.5">건</span>
                 </div>
                 <div className="mt-1 text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} /> 전환 예상 
                 </div>
              </div>
           </div>

           {/* Table View */}
           <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[100px]">구분</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">회원명</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">현재 상품/상태</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">진행률/잔여</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">예상 결제액</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">성공 확률</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">확정</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {prospects.map((member) => (
                          <tr key={member.id} className={`group hover:bg-slate-50/50 transition-colors ${member.isConfirmed ? 'bg-indigo-50/20' : ''}`}>
                             <td className="px-6 py-4">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                   member.type === 'RENEWAL' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                   {member.type === 'RENEWAL' ? '재계약' : '신규가망'}
                                </span>
                             </td>
                             <td className="px-6 py-4 font-black text-slate-900 text-sm">{member.name}</td>
                             <td className="px-6 py-4 text-xs font-medium text-slate-500">{member.currentProduct}</td>
                             <td className="px-6 py-4">
                                {member.type === 'RENEWAL' ? (
                                   <div className="flex flex-col items-center gap-1">
                                      <div className="text-[10px] font-bold text-slate-400">{Math.round(member.usageRate * 100)}% / {member.remainingDays}일</div>
                                      <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                           className={`h-full rounded-full ${member.usageRate >= 0.7 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                           style={{ width: `${member.usageRate * 100}%` }}
                                         />
                                      </div>
                                   </div>
                                ) : (
                                   <div className="text-center text-[10px] text-slate-300">-</div>
                                )}
                             </td>
                             <td className="px-6 py-4 text-right font-black text-slate-900 text-sm tabular-nums">
                                {member.expectedAmount.toLocaleString()}원
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={`text-[10px] font-black ${
                                   member.probability === 'HIGH' ? 'text-emerald-500' : member.probability === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400'
                                }`}>
                                   {member.probability}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <button 
                                  onClick={() => handleToggleConfirm(member.id)}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                     member.isConfirmed ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                  }`}
                                >
                                   <Check size={14} strokeWidth={4} />
                                </button>
                             </td>
                          </tr>
                       ))}
                       
                       {/* Manual Entry Row */}
                       <tr className="bg-slate-50/50">
                          <td className="px-6 py-4">
                             <div className="w-16 h-5 bg-slate-200 rounded animate-shimmer" />
                          </td>
                          <td className="px-6 py-4 relative">
                             <div className="relative">
                                <input 
                                  type="text"
                                  placeholder="회원명 입력..."
                                  value={newEntryName}
                                  onChange={(e) => handleNameChange(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                />
                                <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                
                                <AnimatePresence>
                                   {suggestions.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden"
                                      >
                                         <div className="p-1.5 max-h-48 overflow-y-auto">
                                            {suggestions.map((m, i) => (
                                               <button 
                                                 key={i}
                                                 onClick={() => handleSelectSuggestion(m)}
                                                 className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                                               >
                                                  <div>
                                                     <div className="text-[11px] font-black text-slate-900">{m.name}</div>
                                                     <div className="text-[9px] text-slate-400">{m.product}</div>
                                                  </div>
                                                  <Plus size={12} className="text-slate-300 group-hover:text-indigo-600" />
                                               </button>
                                            ))}
                                         </div>
                                      </motion.div>
                                   )}
                                </AnimatePresence>
                             </div>
                          </td>
                          <td colSpan={5} className="px-6 py-4">
                             <span className="text-[10px] text-slate-300 italic font-medium">이름을 입력하면 담당 회원 정보에서 자동 검색됩니다.</span>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-2 text-indigo-500 text-[11px] font-bold italic px-3 uppercase tracking-tighter">
              <Sparkles size={14} /> Total weight considers probability of each prospect.
           </div>
           <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-slate-100 text-slate-600 text-sm font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                닫기
              </button>
              <button 
                className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-100 flex items-center gap-2 border border-indigo-400"
              >
                 목표 매출 확정 <ChevronRight size={14} strokeWidth={3} />
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
