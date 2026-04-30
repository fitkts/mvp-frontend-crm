import { useState } from 'react';
import { Search, Plus, Phone, Activity, Target, CreditCard, CalendarDays, MoreHorizontal, Dumbbell, User, UserCircle, Pencil, FileText, ChevronRight, ChevronDown, AlertCircle, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RegistrationModalP from '../components/members/RegistrationModalP';
import { MOCK_STAFF } from '../lib/staffData';

const INITIAL_MOCK_MEMBERS = [
  { 
    id: 1, name: '강민준', gender: '남', phone: '010-3001-0001', status: 'ACTIVE', registrationDate: '2025-11-01', lastVisit: '2026-04-14', email: 'minjun@example.com', goal: '체지방 감량', attendance: 85, totalPaid: 1500000, recentPurchase: 'PT 프리미엄 20회', remainingSessions: 12, assignedTrainerId: 1,
    paymentHistory: [
      { id: 'pay_1', date: '2026.04.01', product: 'PT 프리미엄 20회', sessions: 20, basePrice: 1500000, discountedPrice: 1500000, method: '카드', installment: '일시불', trainer: '윤지성', locker: 'A-03 (30일)', status: 'COMPLETED' }
    ]
  },
  { 
    id: 2, name: '김지은', gender: '여', phone: '010-4002-0002', status: 'STOP', registrationDate: '2026-01-15', lastVisit: '2026-04-10', email: 'jieun@example.com', goal: '근력 증가', attendance: 62, totalPaid: 500000, recentPurchase: 'PT 베이직 10회', remainingSessions: 4, assignedTrainerId: 2,
    paymentHistory: [
      { id: 'pay_2', date: '2026.03.15', product: 'PT 베이직 10회', sessions: 10, basePrice: 600000, discountedPrice: 500000, method: '이체', installment: '없음', trainer: '이코치', locker: '미사용', status: 'COMPLETED' }
    ]
  },
  { 
    id: 3, name: '이도현', gender: '남', phone: '010-5003-0003', status: 'EXPIRED', registrationDate: '2025-08-20', lastVisit: '2026-03-20', email: 'dohyun@example.com', goal: '체력 증진', attendance: 45, totalPaid: 200000, recentPurchase: '헬스 3개월권', remainingSessions: 0, assignedTrainerId: 3,
    paymentHistory: [
      { id: 'pay_3', date: '2025.08.20', product: '헬스 3개월권', sessions: 0, basePrice: 200000, discountedPrice: 200000, method: '카드', installment: '3개월', trainer: '데스크', locker: 'B-01 (90일)', status: 'EXPIRED' }
    ]
  },
  { 
    id: 4, name: '박서연', gender: '여', phone: '010-6004-0004', status: 'ACTIVE', registrationDate: '2026-03-01', lastVisit: '2026-04-15', email: 'seoyeon@example.com', goal: '자세 교정', attendance: 92, totalPaid: 250000, recentPurchase: '그룹 필라테스 10회', remainingSessions: 8, assignedTrainerId: 2,
    paymentHistory: [
      { id: 'pay_4', date: '2026.03.01', product: '그룹 필라테스 10회', sessions: 10, basePrice: 250000, discountedPrice: 250000, method: '카드', installment: '일시불', trainer: '이코치', locker: '미사용', status: 'COMPLETED' }
    ]
  },
  { 
    id: 5, name: '정우성', gender: '남', phone: '010-7005-0005', status: 'STOP', registrationDate: '2025-12-10', lastVisit: '2026-02-28', email: 'woosung@example.com', goal: '재활', attendance: 30, totalPaid: 900000, recentPurchase: 'PT 프리미엄 20회', remainingSessions: 15, assignedTrainerId: 1,
    paymentHistory: [
      { id: 'pay_5', date: '2025.12.10', product: 'PT 프리미엄 20회', sessions: 20, basePrice: 1500000, discountedPrice: 900000, method: '복합', installment: '-', trainer: '김대표', locker: 'B-02 (30일)', status: 'UNPAID' }
    ]
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 정상 이용
        </span>
      );
    case 'STOP':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase">
          일시 정지
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">
         기간 만료
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 uppercase">
          {status}
        </span>
      );
  }
};

export default function MembersPage() {
  const [members, setMembers] = useState(INITIAL_MOCK_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<any>(members[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingTrainer, setIsEditingTrainer] = useState(false);

  // Registration Modal State (Using finalized P-Type)
  const [isModalPOpen, setIsModalPOpen] = useState(false);
  const [modalPMode, setModalPMode] = useState<{ step: number; name?: string }>({ step: 1 });

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || m.phone.includes(searchTerm)
  );

  const handleTrainerChange = (newTrainerIdStr: string) => {
    const newTrainerId = parseInt(newTrainerIdStr);
    const updatedMembers = members.map(m => 
      m.id === selectedMember.id ? { ...m, assignedTrainerId: newTrainerId } : m
    );
    setMembers(updatedMembers);
    setSelectedMember({ ...selectedMember, assignedTrainerId: newTrainerId });
    setIsEditingTrainer(false);
  };
  
  const getTrainerName = (trainerId: number | undefined) => {
     if (!trainerId) return '미배정';
     const trainer = MOCK_STAFF.find(s => s.id === trainerId);
     if (trainer) return `${trainer.name} (${trainer.role === 'ADMIN' ? '수석' : '트레이너'})`;
     return '미배정';
  };

  return (
    <>
      <div className="flex items-start gap-5 h-[calc(100vh-140px)]">
        {/* 1. Left Table View - Full Height */}
        <div className="flex-1 flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              회원 목록 <span className="text-xs font-medium text-slate-400">({filteredMembers.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative group w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                <input
                  type="text"
                  placeholder="이름, 연락처 검색"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Primary New Registration Button */}
              <button 
                onClick={() => {
                  setModalPMode({ step: 1 });
                  setIsModalPOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-black rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
              >
                <Plus size={16} />
                신규 등록
              </button>
            </div>
          </div>

        {/* Table List */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px] border-collapse relative table-fixed">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[30%]">회원 정보</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[20%]">연락처</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[12%]">등록일</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[18%]">수강권 (잔여/총)</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[12%]">출석률</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 text-center w-[13%]">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr 
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`group cursor-pointer transition-colors ${
                    selectedMember?.id === member.id 
                      ? 'bg-emerald-50/40' 
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-5 py-3.5 relative">
                    {/* Fixed Sidebar indicator */}
                    {selectedMember?.id === member.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                    )}
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        selectedMember?.id === member.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white border border-slate-200/50'
                      }`}>
                        {member.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-slate-900 text-[13px]">{member.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex gap-1 items-center">
                          {member.gender} <span className="w-0.5 h-0.5 rounded-full bg-slate-300"/> 담당: 윤지성
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{member.phone}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-500">{member.registrationDate}</td>
                  <td className="px-5 py-3.5">
                    {member.recentPurchase.includes('회') ? (() => {
                      const total = parseInt(member.recentPurchase.match(/(\d+)회/)?.[1] || '0', 10);
                      const used = total - member.remainingSessions;
                      const percent = total > 0 ? Math.round((used / total) * 100) : 0;
                      return (
                        <div className="flex flex-col gap-1.5">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-700">{member.remainingSessions}<span className="text-slate-400 font-medium">/{total}회</span></span>
                              <span className="text-[9px] font-bold text-indigo-500">{percent}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                           </div>
                        </div>
                      );
                    })() : (
                      <div className="text-[11px] text-slate-400 font-medium">기간권 상시</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${member.attendance}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{member.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge status={member.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Right Detail View - Minimalist & Data Heavy (Full height) */}
      <AnimatePresence mode="wait">
        {selectedMember ? (
          <motion.div 
            key={selectedMember.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="w-[480px] h-full flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0 relative"
          >
            {/* Minimalist Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col gap-4 shrink-0 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-lg font-bold border border-slate-200">
                    {selectedMember.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedMember.name}</h2>
                      <StatusBadge status={selectedMember.status} />
                    </div>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <span>{selectedMember.phone}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                      <span>{selectedMember.gender}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                      <span>{selectedMember.email}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setModalPMode({ step: 1, name: selectedMember.name });
                    setIsModalPOpen(true);
                  }}
                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1 group/edit"
                  title="정보 수정"
                >
                  <Pencil size={18} className="group-hover/edit:scale-110 transition-transform" />
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 w-full mt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                  <CalendarDays size={14} /> 일정 예약
                </button>
                <button 
                  onClick={() => {
                    setModalPMode({ step: 2, name: selectedMember.name });
                    setIsModalPOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                >
                  <CreditCard size={14} /> 상품 결제
                </button>
                <button className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors tooltip" title="메모 기록">
                  <FileText size={14} />
                </button>
              </div>
            </div>

            {/* Dense Tabs */}
            <div className="px-5 flex gap-6 overflow-x-auto no-scrollbar shrink-0 bg-white border-b border-slate-100">
              {[
                { id: 'overview', label: '종합 개요' },
                { id: 'payment', label: '수강권 내역' },
                { id: 'schedule', label: '예약 및 출석' },
                { id: 'body', label: '체형 분석' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-slate-900 text-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area - Data Centric */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-5 custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-5">
                  {/* Dense Data Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Item 1 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><CreditCard size={14} className="text-slate-400"/> 활성 수강권</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{selectedMember.remainingSessions}회 남음</span>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">{selectedMember.recentPurchase}</div>
                        <div className="text-[11px] text-slate-400 mt-1">2026.01.01 ~ 2026.06.30</div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Activity size={14} className="text-slate-400"/> 출석 및 방문</span>
                        <span className="text-[11px] font-bold text-emerald-600">{selectedMember.attendance}%</span>
                      </div>
                      <div>
                        <div className="flex w-full h-1.5 bg-slate-100 rounded-full mb-1.5 overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{width: `${selectedMember.attendance}%`}}></div>
                        </div>
                        <div className="text-[11px] text-slate-400">최근 방문: {selectedMember.lastVisit}</div>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2"><UserCircle size={14} className="text-slate-400"/> 담당 트레이너</div>
                      <div className="mt-1 flex items-center justify-between min-h-[22px]">
                         {isEditingTrainer ? (
                           <select 
                             className="text-[12px] bg-slate-50 border border-slate-200 rounded px-1 min-w-0 flex-1 mr-2 outline-none focus:border-emerald-500"
                             value={selectedMember.assignedTrainerId || ''}
                             onChange={(e) => handleTrainerChange(e.target.value)}
                             onBlur={() => setIsEditingTrainer(false)}
                             autoFocus
                           >
                              <option value="">미배정</option>
                              {MOCK_STAFF.filter(s => s.role !== 'MANAGER').map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.name} ({staff.role === 'ADMIN' ? '수석' : '트레이너'})</option>
                              ))}
                           </select>
                         ) : (
                           <>
                             <span className="text-[13px] font-bold text-slate-900 truncate">{getTrainerName(selectedMember.assignedTrainerId)}</span>
                             <button onClick={() => setIsEditingTrainer(true)} className="text-[10px] text-slate-400 underline hover:text-slate-600 shrink-0">변경</button>
                           </>
                         )}
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2"><CreditCard size={14} className="text-slate-400"/> 누적 결제</div>
                      <div className="text-[13px] font-bold text-slate-900 mt-1 flex items-center justify-between">
                         {(selectedMember.totalPaid / 10000).toLocaleString()}만원
                         <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  </div>

                  {/* Goal & Memo Block */}
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                     <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5"><Target size={14} className="text-slate-400"/> 회원 목표 및 특이사항</h3>
                        <button className="text-[10px] font-bold text-emerald-600 hover:underline">수정</button>
                     </div>
                     <div className="p-4 flex flex-col gap-3">
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">등록 목표</div>
                           <div className="text-[13px] text-slate-800 font-medium">{selectedMember.goal}</div>
                        </div>
                        <div className="w-full h-px bg-slate-50" />
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">트레이너 메모 (최근)</div>
                           <div className="text-[12px] text-slate-600 leading-relaxed tabular-nums">
                             <div className="mb-1 text-[10px] text-slate-400">2026.04.14 15:30 기록됨</div>
                             최근 오른쪽 어깨 통증 호소. 푸시 계열 운동 시 가동범위 제한하여 진행할 것. 하체 컨디션은 좋음.
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Quick recent history log list style */}
                  <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
                     <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-slate-900">최근 타임라인</h3>
                        <span className="text-[10px] font-medium text-slate-400 cursor-pointer">더보기</span>
                     </div>
                     <div className="p-0">
                        {/* List Item */}
                        <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <div className="mt-0.5 w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                              <CalendarDays size={12} className="text-emerald-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-slate-900">PT 예약 확정</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">4월 18일 (목) 19:00 - 하체 집중</div>
                           </div>
                           <div className="text-[10px] text-slate-400">어제</div>
                        </div>
                         {/* List Item */}
                         <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <div className="mt-0.5 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                              <Activity size={12} className="text-slate-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-slate-900">출석 완료</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">입장 타각 확인</div>
                           </div>
                           <div className="text-[10px] text-slate-400">4.14</div>
                        </div>
                         {/* List Item */}
                         <div className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                           <div className="mt-0.5 w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                              <CreditCard size={12} className="text-blue-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-slate-900">결제 완료</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">개인락커 3개월 연장 (30,000원)</div>
                           </div>
                           <div className="text-[10px] text-slate-400">4.10</div>
                        </div>
                     </div>
                  </div>

                </div>
              )}

              {activeTab === 'payment' && (
                 <div className="flex-1 overflow-hidden flex flex-col uppercase tracking-tighter">
                    <div className="px-5 py-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                       <h3 className="text-[11px] font-black text-slate-900 tracking-wider">PAYMENT LOG <span className="text-indigo-600 ml-1">[{selectedMember.paymentHistory?.length || 0}]</span></h3>
                       <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                          CSV EXPORT <FileText size={12}/>
                       </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <table className="w-full text-left table-fixed border-separate border-spacing-0">
                          <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                             <tr>
                                <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 border-b border-slate-100 bg-slate-50/30 w-[22%]">거래일시</th>
                                <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 border-b border-slate-100 bg-slate-50/30">상품명 / 상세</th>
                                <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 border-b border-slate-100 bg-slate-50/30 w-[20%] text-right pr-5">결제금액</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {selectedMember.paymentHistory?.map((pay: any) => (
                                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors group">
                                   <td className="px-5 py-4 align-top">
                                      <div className="text-[10px] font-black text-slate-900">{pay.date}</div>
                                      <div className="text-[9px] font-bold text-slate-400 mt-0.5">{pay.trainer}</div>
                                   </td>
                                   <td className="px-3 py-4">
                                      <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[12px] font-black text-slate-800 break-all leading-tight">{pay.product}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black leading-none ${
                                               pay.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                                               pay.status === 'UNPAID' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                               {pay.status === 'COMPLETED' ? 'PAID' : pay.status === 'UNPAID' ? 'UNPAID' : 'EXP'}
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                            <span className="flex items-center gap-0.5"><CreditCard size={10}/> {pay.method}</span>
                                            <span className="w-0.5 h-0.5 bg-slate-200 rounded-full"/>
                                            <span className="flex items-center gap-0.5"><Box size={10}/> {pay.locker === '미사용' ? 'NO-LOCKER' : pay.locker}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-3 py-4 text-right pr-5 align-top">
                                      <div className="text-[13px] font-black text-slate-900 tabular-nums tracking-normal">
                                         {(pay.discountedPrice/10000).toLocaleString()}
                                         <span className="text-[10px] font-bold ml-0.5 text-slate-400">만</span>
                                      </div>
                                      {pay.basePrice !== pay.discountedPrice && (
                                         <div className="text-[9px] text-slate-300 font-bold line-through tabular-nums leading-none mt-0.5">
                                            {(pay.basePrice/10000).toLocaleString()}만
                                         </div>
                                      )}
                                      {pay.status === 'UNPAID' && (
                                         <div className="mt-2 text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.5 rounded inline-block">
                                            미수금: 60만
                                         </div>
                                      )}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       
                       {!selectedMember.paymentHistory?.length && (
                          <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                             <CreditCard size={40} className="mb-2" />
                             <p className="text-[11px] font-black">데이터가 존재하지 않습니다</p>
                          </div>
                       )}
                    </div>
                 </div>
              )}

              {activeTab !== 'overview' && activeTab !== 'payment' && (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
                  <MoreHorizontal size={32} className="mb-2 opacity-30" />
                  <p className="font-medium text-xs">상세 데이터 내역이 표시될 영역입니다</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="w-[480px] h-full flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 rounded-2xl shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
              <UserCircle size={32} />
            </div>
            <p className="text-slate-400 font-bold text-sm">목록에서 조회할 회원을 선택하세요.</p>
          </div>
        )}
      </AnimatePresence>
    </div>

    {/* Registration Modal (Finalized P-Type) */}
    <RegistrationModalP 
      isOpen={isModalPOpen} 
      onClose={() => setIsModalPOpen(false)} 
      initialStep={modalPMode.step}
      initialMemberName={modalPMode.name}
      onSaveMember={(newMember) => {
        setMembers([newMember, ...members]);
      }}
    />
    </>
  );
}
