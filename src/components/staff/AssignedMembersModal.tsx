import React from 'react';
import { X, Users, Search, ChevronRight, Phone, Calendar, MoreHorizontal, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
  id: number;
  name: string;
  phone: string;
  product: string;
  totalSessions: number;
  usedSessions: number;
  lastVisit: string;
  nextSession: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
}

const MOCK_ASSIGNED_MEMBERS: Member[] = [
  { id: 1, name: '강민준', phone: '010-1234-5678', product: 'PT 프리미엄 20회', totalSessions: 20, usedSessions: 12, lastVisit: '2026.04.20', nextSession: '2026.04.24', status: 'ACTIVE' },
  { id: 2, name: '박서연', phone: '010-2345-6789', product: 'PT 스탠다드 10회', totalSessions: 10, usedSessions: 8, lastVisit: '2026.04.21', nextSession: '2026.04.23', status: 'ACTIVE' },
  { id: 3, name: '이준호', phone: '010-3456-7890', product: 'PT 프리미엄 30회', totalSessions: 30, usedSessions: 5, lastVisit: '2026.04.18', nextSession: '2026.04.25', status: 'ACTIVE' },
  { id: 4, name: '최지우', phone: '010-4567-8901', product: '바디프로필 패키지', totalSessions: 24, usedSessions: 22, lastVisit: '2026.04.15', nextSession: '2026.04.22', status: 'ACTIVE' },
  { id: 5, name: '정우성', phone: '010-5678-9012', product: 'PT 기초 8회', totalSessions: 8, usedSessions: 8, lastVisit: '2026.04.10', nextSession: '-', status: 'EXPIRED' },
];

export default function AssignedMembersModal({ isOpen, onClose, staffName }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
      >
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
               <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">담당 회원 상세 정보</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                <span className="text-emerald-600 font-bold">{staffName}</span> 트레이너님이 관리 중인 회원 리스트입니다.
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

        {/* Search & Statistics Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
           <div className="relative group flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="회원 이름 또는 연락처 검색"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">총 관리 인원</span>
                 <span className="text-sm font-black text-slate-900">{MOCK_ASSIGNED_MEMBERS.length}명</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">수업 진행률 (전체)</span>
                 <span className="text-sm font-black text-emerald-600">68%</span>
              </div>
           </div>
        </div>

        {/* Member Table */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
           <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                       <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">회원정보 / 연락처</th>
                       <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">수강 상품</th>
                       <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">수업 진행 현황</th>
                       <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">최근/차기 일정</th>
                       <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">상태</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {MOCK_ASSIGNED_MEMBERS.map(member => {
                       const progress = (member.usedSessions / member.totalSessions) * 100;
                       return (
                          <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                                      {member.name[0]}
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-slate-900">{member.name}</div>
                                      <div className="text-[11px] text-slate-400 mt-0.5">{member.phone}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-5 py-4">
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                   {member.product}
                                </span>
                             </td>
                             <td className="px-5 py-4">
                                <div className="w-full max-w-[120px]">
                                   <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-500">
                                         {member.usedSessions} / {member.totalSessions} <span className="text-slate-400 font-medium">회</span>
                                      </span>
                                      <span className="text-[10px] font-black text-emerald-600">{Math.round(progress)}%</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className={`h-full rounded-full ${progress >= 100 ? 'bg-slate-400' : 'bg-emerald-500 shadow-sm shadow-emerald-200'}`}
                                      />
                                   </div>
                                </div>
                             </td>
                             <td className="px-5 py-4">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                      <Calendar size={12} className="text-slate-300" />
                                      최근: {member.lastVisit}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600">
                                      <Activity size={12} className="text-indigo-400" />
                                      차기: {member.nextSession}
                                   </div>
                                </div>
                             </td>
                             <td className="px-5 py-4 text-center">
                                {member.status === 'ACTIVE' ? (
                                   <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">이용중</span>
                                ) : (
                                   <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200">종료</span>
                                )}
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-lg shadow-slate-200"
           >
              확인
           </button>
        </div>
      </motion.div>
    </div>
  );
}
