import React, { useState } from 'react';
import { X, Calendar, Search, ChevronRight, Dumbbell, Award, TrendingUp, Filter, ChevronLeft, Percent, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SessionType = 'NORMAL' | 'NO_SHOW' | 'SUBSTITUTE_SPLIT';

interface SessionLog {
  id: string;
  memberName: string;
  phone: string;
  productName: string;
  unitPrice: number;
  date: string;
  type: SessionType;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
}

const INITIAL_MOCK_DATA: Record<string, SessionLog[]> = {
  '2026-04': [
    { id: '1', memberName: '강민준', phone: '010-1234-5678', productName: 'PT 프리미엄 20회', unitPrice: 80000, date: '2026-04-22 10:00', type: 'NORMAL' },
    { id: '2', memberName: '강민준', phone: '010-1234-5678', productName: 'PT 프리미엄 20회', unitPrice: 80000, date: '2026-04-25 10:00', type: 'NORMAL' },
    { id: '3', memberName: '박서연', phone: '010-2345-6789', productName: 'PT 스탠다드 10회', unitPrice: 70000, date: '2026-04-21 14:00', type: 'NO_SHOW' },
    { id: '4', memberName: '이준호', phone: '010-3456-7890', productName: 'PT 프리미엄 30회', unitPrice: 75000, date: '2026-04-20 19:00', type: 'SUBSTITUTE_SPLIT' },
    { id: '5', memberName: '최지우', phone: '010-4567-8901', productName: '바디프로필 패키지', unitPrice: 90000, date: '2026-04-22 09:00', type: 'NORMAL' },
    { id: '6', memberName: '김지현', phone: '010-9876-5432', productName: 'PT 입문 10회', unitPrice: 65000, date: '2026-04-19 11:00', type: 'NORMAL' },
  ],
  '2026-03': [
    { id: '101', memberName: '강민준', phone: '010-1234-5678', productName: 'PT 프리미엄 20회', unitPrice: 80000, date: '2026-03-30 10:00', type: 'NORMAL' },
    { id: '102', memberName: '박서연', phone: '010-2345-6789', productName: 'PT 스탠다드 10회', unitPrice: 70000, date: '2026-03-28 14:00', type: 'NORMAL' },
  ]
};

export default function MonthlyClassProgressModal({ isOpen, onClose, staffName }: Props) {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [searchTerm, setSearchTerm] = useState('');
  const [monthlyRates, setMonthlyRates] = useState<Record<string, number>>({
    '2026-04': 50,
    '2026-03': 50
  });
  const [sessionData, setSessionData] = useState(INITIAL_MOCK_DATA);

  if (!isOpen) return null;

  const currentLogs = sessionData[selectedMonth] || [];
  const filteredLogs = currentLogs.filter(log => 
    log.memberName.includes(searchTerm) || log.phone.includes(searchTerm)
  );

  const totalSessions = currentLogs.length;
  const totalRevenue = currentLogs.reduce((acc, log) => {
    let applyRatio = 1;
    if (log.type === 'NO_SHOW' || log.type === 'SUBSTITUTE_SPLIT') {
      applyRatio = 0.5;
    }
    return acc + (log.unitPrice * applyRatio);
  }, 0);
  
  const currentRate = monthlyRates[selectedMonth] || 0;
  const finalAmount = totalRevenue * (currentRate / 100);

  const handleUpdateSessionType = (id: string, type: SessionType) => {
    setSessionData(prev => ({
      ...prev,
      [selectedMonth]: prev[selectedMonth].map(log => log.id === id ? { ...log, type } : log)
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
               <Dumbbell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">개별 수업 세션 상세 관리</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                <span className="text-orange-600 font-bold">{staffName}</span> 트레이너님의 월별 개별 세션 기록을 조회하고 속성을 수정합니다.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="relative group flex items-center">
                <Calendar className="absolute left-3 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={14} />
                <input 
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer h-9"
                />
             </div>
             <button 
               onClick={onClose}
               className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer ml-1"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Statistics Tiles */}
        <div className="px-6 py-5 grid grid-cols-3 gap-4 shrink-0 bg-white border-b border-slate-100">
           <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                 <Dumbbell size={20} />
              </div>
              <div className="min-w-0">
                 <div className="text-[10px] font-bold text-slate-400 uppercase">가중치 적용 총 매출</div>
                 <div className="text-lg font-black text-slate-900 tabular-nums whitespace-nowrap flex items-end gap-1.5">
                   {totalRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-400 mb-0.5">원</span>
                 </div>
                 <div className="text-[10px] text-slate-500 mt-0.5">총 {totalSessions}건 세션</div>
              </div>
           </div>
           <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                 <Percent size={20} />
              </div>
              <div className="flex-1">
                 <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">이달의 정산 수수료율 (%)</div>
                 <div className="relative">
                    <input
                      type="number"
                      value={currentRate}
                      onChange={(e) => setMonthlyRates(prev => ({...prev, [selectedMonth]: Number(e.target.value)}))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all tabular-nums"
                    />
                 </div>
              </div>
           </div>
           <div className="bg-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                 <TrendingUp size={20} />
              </div>
              <div className="min-w-0">
                 <div className="text-[10px] font-bold text-white/60 uppercase">{selectedMonth.split('-')[1]}월 가지급 예상 수수료</div>
                 <div className="text-xl font-black text-white tabular-nums truncate">
                    {finalAmount.toLocaleString()} <span className="text-sm font-bold text-white/70">원</span>
                 </div>
                 <div className="text-[10px] text-indigo-200">정산 승인 전 시뮬레이션 결과</div>
              </div>
           </div>
        </div>

        {/* Search & Filter */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
           <div className="relative group max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="회원 이름 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium"
              />
           </div>
           <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
              <Filter size={12} />
              필터: {filteredLogs.length > 0 ? `해당 월 총 ${filteredLogs.length}건 세션` : '데이터 없음'}
           </div>
        </div>

        {/* List Table */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible min-h-[300px] flex flex-col">
              {filteredLogs.length > 0 ? (
                <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                         <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">수업 일시</th>
                         <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">회원 정보</th>
                         <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%] text-right">개별 수강단가</th>
                         <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%] text-center">세션 속성 (노쇼/대타)</th>
                         <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%] text-right">인정 매출</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map(log => {
                        let applyRatio = 1;
                        if (log.type === 'NO_SHOW' || log.type === 'SUBSTITUTE_SPLIT') {
                           applyRatio = 0.5;
                        }

                        return (
                          <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors group ${log.type !== 'NORMAL' ? 'bg-amber-50/10' : ''}`}>
                             <td className="px-5 py-4 font-bold text-slate-700 text-sm">
                                {log.date}
                             </td>
                             <td className="px-5 py-4">
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-slate-900">{log.memberName}</span>
                                   <span className="text-[10px] text-slate-400 mt-0.5">{log.productName}</span>
                                </div>
                             </td>
                             <td className="px-5 py-4 text-right">
                                <span className="text-sm font-black text-slate-400 tabular-nums line-through decoration-slate-300">{log.unitPrice.toLocaleString()}원</span>
                                <div className="text-[10px] text-slate-400">결제 확정 단가</div>
                             </td>
                             <td className="px-5 py-4 text-center">
                                <select 
                                   value={log.type}
                                   onChange={(e) => handleUpdateSessionType(log.id, e.target.value as SessionType)}
                                   className={`appearance-none text-center px-3 py-1.5 rounded-lg text-xs font-black outline-none border cursor-pointer ${
                                      log.type === 'NORMAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                      log.type === 'NO_SHOW' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                      'bg-purple-50 text-purple-600 border-purple-200'
                                   }`}
                                >
                                   <option value="NORMAL">정상 진행 (100%)</option>
                                   <option value="NO_SHOW">노쇼 (50% 귀속)</option>
                                   <option value="SUBSTITUTE_SPLIT">대타 진행 (Split 50%)</option>
                                </select>
                             </td>
                             <td className="px-5 py-4 text-right">
                                <div className="flex flex-col items-end">
                                   <span className="text-sm font-black text-indigo-600 tabular-nums">{(log.unitPrice * applyRatio).toLocaleString()}원</span>
                                   <span className="text-[10px] font-bold text-indigo-400">적용률: {applyRatio * 100}%</span>
                                </div>
                             </td>
                          </tr>
                        )
                      })}
                   </tbody>
                </table>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
                   <Filter size={40} className="mb-3 opacity-20" />
                   <p className="text-sm font-bold">해당 월의 수업 정산 내역이 없습니다.</p>
                   <p className="text-[11px] mt-1 text-slate-300">날짜를 다시 확인하거나 관리자에게 문의하세요.</p>
                </div>
              )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
           <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
             <AlertTriangle size={12} className="text-amber-500" /> 세션 속성 변경 시 실시간으로 인정 매출 및 예상 수당에 반영됩니다.
           </div>
           <div className="flex gap-2">
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
             >
                닫기
             </button>
             <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-100">
                수정 사항 저장 후 닫기
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
