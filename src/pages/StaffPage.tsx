import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Activity, Briefcase, CreditCard, CalendarDays, MoreHorizontal, Users, User, UserCircle, Settings2, FileText, ChevronRight, Award, Clock, DollarSign, Mail, Dumbbell, Sparkles, Calendar, Calculator, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import RegistrationModalStaff from '../components/members/RegistrationModalStaff';
import AssignedMembersModal from '../components/staff/AssignedMembersModal';
import PayrollModalStaff from '../components/staff/PayrollModalStaff';
import MonthlyClassProgressModal from '../components/staff/MonthlyClassProgressModal';

import { useStaffList, useCreateStaff, useStaffDetail } from '../api/queries/useStaff';
import { useMembers } from '../api/queries/useMembers';

const RoleBadge = ({ role }: { role: string }) => {
  switch (role) {
    case 'ADMIN':
      return <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">관리자</span>;
    case 'MANAGER':
      return <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">매니저</span>;
    case 'TRAINER':
      return <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">트레이너</span>;
    default:
      return <span className="text-[10px] text-slate-600 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{role}</span>;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 재직중
        </span>
      );
    case 'INACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase">
          휴무/퇴사
        </span>
      );
    default:
      return null;
  }
};

const calculateTenure = (joinDate: string) => {
  const start = new Date(joinDate);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;
  
  if (years > 0) {
    return `${years}년 ${days}일`;
  }
  return `${days}일`;
};

export default function StaffPage() {
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const { data: staffData, isLoading } = useStaffList();
  const staffList = staffData?.data || [];
  const createStaffMutation = useCreateStaff();
  
  // W-2: selectedStaff의 상세 정보 (담당 회원 포함) 가져오기
  const staffDetailId = selectedStaff?.id;

  // C-4 fix: staffList 로드 완료 시 첫 번째 직원 자동 선택
  useEffect(() => {
    if (staffList.length > 0 && !selectedStaff) {
      setSelectedStaff(staffList[0]);
    }
  }, [staffList]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isClassLogModalOpen, setIsClassLogModalOpen] = useState(false);

  const filteredStaff = staffList.filter((s: any) => 
    s.name.includes(searchTerm) || s.phone.includes(searchTerm)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  }

  return (
    <div className="flex items-start gap-5 h-[calc(100vh-140px)]">
      {/* 1. Left Table View - Full Height */}
      <div className="flex-1 flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            직원 목록 <span className="text-xs font-medium text-slate-400">({filteredStaff.length})</span>
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
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              직원 추가
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px] border-collapse relative table-fixed">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[25%]">직원 정보</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[18%]">연락처</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[17%]">인적사항</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 w-[15%]">입사일</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 text-right w-[15%]">이번 달 매출</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 text-center w-[10%]">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((staff) => (
                <tr 
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff)}
                  className={`group cursor-pointer transition-colors ${
                    selectedStaff?.id === staff.id 
                      ? 'bg-emerald-50/40' 
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-5 py-3.5 relative">
                    {/* Fixed Sidebar indicator */}
                    {selectedStaff?.id === staff.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                    )}
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        selectedStaff?.id === staff.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white border border-slate-200/50'
                      }`}>
                        {staff.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5">
                          {staff.name}
                          <RoleBadge role={staff.role} />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex gap-1 items-center">
                          {staff.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{staff.phone}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                     <span>{staff.gender === 'M' ? '남성' : '여성'}</span>
                     <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                     <span className="text-slate-400 text-[11px]">{staff.birthDate}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-500">{staff.joinDate}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-700 text-[13px] tabular-nums">
                    {((staff.revenue || 0) / 10000).toLocaleString()}만원
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge status={staff.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Right Detail View - Minimalist & Data Heavy (Full height) */}
      <AnimatePresence mode="wait">
        {selectedStaff ? (
          <motion.div 
            key={selectedStaff.id}
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
                    {selectedStaff.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedStaff.name}</h2>
                      <StatusBadge status={selectedStaff.status} />
                    </div>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <span>{selectedStaff.phone}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                      <span>{selectedStaff.email}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                      <RoleBadge role={selectedStaff.role} />
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-indigo-600 transition-all p-1 cursor-pointer active:rotate-12">
                  <Settings2 size={18} />
                </button>
              </div>

              <div className="flex gap-2 w-full mt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95 cursor-pointer">
                  <CalendarDays size={14} /> 일정 배정
                </button>
                <button 
                  onClick={() => setIsPayrollModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 hover:shadow-md transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-200"
                >
                  <CreditCard size={14} /> 급여 내역
                </button>
                <button className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95 cursor-pointer tooltip" title="직원 메모">
                  <FileText size={14} />
                </button>
              </div>
            </div>

            {/* Dense Tabs */}
            <div className="px-5 flex gap-6 overflow-x-auto no-scrollbar shrink-0 bg-white border-b border-slate-100">
              {[
                { id: 'overview', label: '종합 개요' },
                { id: 'attendance', label: '근태 현황' },
                { id: 'members', label: '담당 회원' },
                { id: 'performance', label: '실적/목표' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-[13px] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap px-1 ${
                    activeTab === tab.id 
                      ? 'border-slate-900 text-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
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
                    <div 
                      onClick={() => setIsPayrollModalOpen(true)}
                      className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Award size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors"/> 이번 달 매출</span>
                        <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{((selectedStaff.revenue || 0) / 10000).toLocaleString()}만원</div>
                        <div className="flex w-full h-1.5 bg-slate-100 rounded-full mt-2 mb-1.5 overflow-hidden">
                           <div className="h-full bg-indigo-500 rounded-full" style={{width: `80%`}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div 
                      onClick={() => setIsAssignedModalOpen(true)}
                      className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Users size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors"/> 담당 회원 수</span>
                        <ChevronRight size={12} className="text-slate-300 group-hover:text-emerald-400 transition-all group-hover:translate-x-0.5" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{selectedStaff.assignedMembers ?? 0}명</div>
                        <div className="text-[11px] text-slate-400 mt-1">지난 달 대비 +3 관리중</div>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div 
                      onClick={() => setIsClassLogModalOpen(true)}
                      className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm cursor-pointer hover:border-orange-200 hover:bg-orange-50/10 transition-all group"
                    >
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center mb-2 gap-1.5 group-hover:text-orange-500 transition-colors"><Dumbbell size={14} className="text-slate-400 group-hover:text-orange-400"/> 이번 달 누적 수업수</div>
                      <div className="text-[13px] font-bold text-slate-900 mt-1 flex items-center justify-between group-hover:text-orange-600">
                         {selectedStaff.workHours ?? 0} 회
                         <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">비율 달성</span>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2"><Briefcase size={14} className="text-slate-400"/> 입사일 / 근속</div>
                      <div className="text-[13px] font-bold text-slate-900 mt-1 flex items-center justify-between">
                         <div className="flex flex-col">
                           <span>{selectedStaff.joinDate}</span>
                           <span className="text-[10px] text-indigo-600">({calculateTenure(selectedStaff.joinDate)})</span>
                         </div>
                         <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  </div>

                  {/* Duties & Memo Block */}
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                     <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5"><FileText size={14} className="text-slate-400"/> 주요 업무 및 특이사항</h3>
                        <button className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">수정</button>
                     </div>
                     <div className="p-4 flex flex-col gap-3">
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">핵심 담당 업무</div>
                           <div className="text-[13px] text-slate-800 font-medium">{selectedStaff.description}</div>
                        </div>
                        <div className="w-full h-px bg-slate-50" />
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">관리자 메모</div>
                           <div className="text-[12px] text-slate-600 leading-relaxed tabular-nums">
                             <div className="mb-1 text-[10px] text-slate-400">2026.04.01 반영</div>
                             최근 등록 회원들의 서비스 만족도가 높음. 다음 달 성과 평가 시 기본급 인상 및 인센티브 지급 대상자.
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Quick recent history log list style */}
                  <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
                     <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-slate-900">최근 활동 타임라인</h3>
                        <span className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">더보기</span>
                     </div>
                     <div className="p-0">
                        {/* List Item */}
                        <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <div className="mt-0.5 w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                              <DollarSign size={12} className="text-emerald-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-slate-900">새로운 PT 매출 등록</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">회원 강민준 - PT 프리미엄 20회 (+1,500,000원)</div>
                           </div>
                           <div className="text-[10px] text-slate-400">어제</div>
                        </div>
                         {/* List Item */}
                         <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <div className="mt-0.5 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                              <CalendarDays size={12} className="text-slate-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-slate-900">신규 회원 배정</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">신규 회원 박서연 담당 코치로 지정됨</div>
                           </div>
                           <div className="text-[10px] text-slate-400">4.10</div>
                        </div>
                         {/* List Item */}
                         <div className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                           <div className="mt-0.5 w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                              <Activity size={12} className="text-indigo-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-slate-900">연차 휴무 사용</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">개인 사유로 1일 오전/오후 휴무</div>
                           </div>
                           <div className="text-[10px] text-slate-400">3.28</div>
                        </div>
                     </div>
                  </div>

                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="flex flex-col gap-5">
                  {/* Statistics */}
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-[12px] font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-slate-400" /> 이번 달 근태 통계 요약 (4월)
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col justify-center">
                        <div className="text-[10px] font-bold text-slate-500 mb-1">정상 출근</div>
                        <div className="text-[15px] font-bold text-slate-900">20<span className="text-[11px] font-medium text-slate-500 ml-0.5">일</span></div>
                      </div>
                      <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 flex flex-col justify-center">
                        <div className="text-[10px] font-bold text-orange-600 mb-1">지각</div>
                        <div className="text-[15px] font-bold text-orange-700">1<span className="text-[11px] font-medium text-orange-500 ml-0.5">일</span></div>
                      </div>
                      <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 flex flex-col justify-center">
                        <div className="text-[10px] font-bold text-red-600 mb-1">결근/휴가</div>
                        <div className="text-[15px] font-bold text-red-700">1<span className="text-[11px] font-medium text-red-500 ml-0.5">일</span></div>
                      </div>
                      <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 flex flex-col justify-center">
                        <div className="text-[10px] font-bold text-indigo-600 mb-1">총 근무시간</div>
                        <div className="text-[15px] font-bold text-indigo-700">165<span className="text-[11px] font-medium text-indigo-500 ml-0.5">h</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance History Table */}
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0 shrink-0">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
                      <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" /> 상세 출/퇴근 기록
                      </h3>
                      <button className="text-[10px] text-slate-500 px-2 py-1 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 font-medium transition-colors cursor-pointer">전체 다운로드</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50/50 text-slate-500">
                          <tr>
                            <th className="px-4 py-2.5 font-bold w-[25%] border-b border-slate-100">일자</th>
                            <th className="px-4 py-2.5 font-bold w-[25%] border-b border-slate-100">출근</th>
                            <th className="px-4 py-2.5 font-bold w-[25%] border-b border-slate-100">퇴근</th>
                            <th className="px-4 py-2.5 font-bold w-[25%] border-b border-slate-100 text-center">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 28일 (화)</td>
                            <td className="px-4 py-3 text-slate-600">08:55</td>
                            <td className="px-4 py-3 text-slate-600">18:05</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100">정상</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 27일 (월)</td>
                            <td className="px-4 py-3 text-slate-600">08:50</td>
                            <td className="px-4 py-3 text-slate-600">18:10</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100">정상</span></td>
                          </tr>
                          <tr className="bg-orange-50/20 hover:bg-orange-50/40 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 24일 (금)</td>
                            <td className="px-4 py-3 text-orange-600 font-bold">09:15</td>
                            <td className="px-4 py-3 text-slate-600">18:00</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-bold border border-orange-100">지각</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 23일 (목)</td>
                            <td className="px-4 py-3 text-slate-600">08:58</td>
                            <td className="px-4 py-3 text-slate-600">18:02</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100">정상</span></td>
                          </tr>
                          <tr className="bg-red-50/20 hover:bg-red-50/40 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 22일 (수)</td>
                            <td className="px-4 py-3 text-slate-400">-</td>
                            <td className="px-4 py-3 text-slate-400">-</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">연차</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 21일 (화)</td>
                            <td className="px-4 py-3 text-slate-600">08:50</td>
                            <td className="px-4 py-3 text-slate-600">18:30</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">초과(0.5h)</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium">4월 20일 (월)</td>
                            <td className="px-4 py-3 text-slate-600">08:54</td>
                            <td className="px-4 py-3 text-slate-600">18:01</td>
                            <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100">정상</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <MembersTabContent staffId={selectedStaff?.id} />
              )}

              {activeTab === 'performance' && (
                <div className="flex flex-col gap-4">
                  {/* Current Month Performance */}
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                     <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <Award size={14} className="text-emerald-500" /> 4월 실적 요약 (현재)
                     </h3>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 group hover:border-emerald-200 transition-colors">
                           <div className="text-[10px] font-bold text-slate-500 mb-1">현재 매출 달성</div>
                           <div className="text-lg font-black text-slate-900 tabular-nums">
                              {((selectedStaff.revenue || 0) / 10000).toLocaleString()}<span className="text-[11px] font-medium text-slate-500 ml-0.5">만원</span>
                           </div>
                           <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{width: `80%`}} />
                           </div>
                           <div className="mt-1.5 flex justify-between text-[10px] font-bold">
                              <span className="text-emerald-600">80% 달성</span>
                              <span className="text-slate-400">목표 {((selectedStaff.revenue || 0) / 10000 / 0.8).toLocaleString()}만원</span>
                           </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 group hover:border-indigo-200 transition-colors">
                           <div className="text-[10px] font-bold text-slate-500 mb-1">현재 진행 수업</div>
                           <div className="text-lg font-black text-slate-900 tabular-nums">
                              {selectedStaff.workHours ?? 0}<span className="text-[11px] font-medium text-slate-500 ml-0.5">회</span>
                           </div>
                           <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{width: `95%`}} />
                           </div>
                           <div className="mt-1.5 flex justify-between text-[10px] font-bold">
                              <span className="text-indigo-600">95% 진행 (평균비례)</span>
                              <span className="text-slate-400">목표 120회</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Expected Revenue Projection */}
                  <div className="bg-slate-900 rounded-xl p-4 shadow-md relative overflow-hidden group">
                     <div className="absolute right-[-5%] top-[-10%] text-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles size={80} />
                     </div>
                     <h3 className="relative z-10 text-[11px] font-black tracking-wider uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                        <Calendar size={12} className="text-indigo-400" /> 익월(5월) 예상 지표
                     </h3>
                     
                     <div className="relative z-10 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                           <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                              <DollarSign size={10} className="text-emerald-400"/> 예상 총 매출 (Max)
                           </div>
                           <div className="text-xl font-black text-white tabular-nums">
                              3,250<span className="text-[11px] font-bold text-slate-500 ml-0.5">만원</span>
                           </div>
                        </div>
                        <div className="flex flex-col">
                           <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                              <Calculator size={10} className="text-indigo-400"/> 가중치 반영 예상매출
                           </div>
                           <div className="text-xl font-black text-white tabular-nums flex items-baseline gap-1">
                              2,680<span className="text-[11px] font-bold text-slate-500 ml-0.5">만원</span>
                           </div>
                        </div>
                     </div>

                     <div className="relative z-10 mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                           <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                              <Users size={10} className="text-rose-400"/> 재계약 만료 대상
                           </div>
                           <div className="text-sm font-black text-slate-200">
                              8<span className="text-[10px] font-bold text-slate-500 ml-0.5">명</span>
                           </div>
                        </div>
                        <div className="flex flex-col">
                           <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                              <CheckCircle2 size={10} className="text-emerald-400"/> 예상 전환 목표
                           </div>
                           <div className="text-sm font-black text-slate-200">
                              5<span className="text-[10px] font-bold text-slate-500 ml-0.5">명</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab !== 'overview' && activeTab !== 'attendance' && activeTab !== 'members' && activeTab !== 'performance' && (
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
            <p className="text-slate-400 font-bold text-sm">목록에서 조회할 직원을 선택하세요.</p>
          </div>
        )}
      </AnimatePresence>
      <RegistrationModalStaff 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveStaff={(staffData) => {
          createStaffMutation.mutate(staffData, {
            onSuccess: () => {
              alert('성공적으로 등록되었습니다!');
              setIsModalOpen(false);
            },
            onError: (err: any) => {
              alert(`등록 실패: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
            }
          });
        }}
      />
      <AssignedMembersModal 
        isOpen={isAssignedModalOpen} 
        onClose={() => setIsAssignedModalOpen(false)} 
        staffName={selectedStaff?.name || ''}
        staffId={selectedStaff?.id}
      />
      <PayrollModalStaff 
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        staff={selectedStaff}
      />
      <MonthlyClassProgressModal
        isOpen={isClassLogModalOpen}
        onClose={() => setIsClassLogModalOpen(false)}
        staffName={selectedStaff?.name || ''}
      />
    </div>
  );
}

function MembersTabContent({ staffId }: { staffId?: number }) {
  const { data: membersData, isLoading } = useMembers({ staffId });
  const members = membersData?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
        <p className="text-xs font-medium">회원 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-slate-100 border-dashed">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
          <Users size={24} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">담당 회원이 없습니다</p>
          <p className="text-xs text-slate-400 mt-1">이 직원이 관리하는 회원이 여기에 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member: any) => (
        <div 
          key={member.id} 
          className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-emerald-200 transition-all group"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
                {member.name[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{member.name}</div>
                <div className="text-[10px] text-slate-400 font-medium">{member.phone}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700">{member.product}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">잔여 {member.totalSessions - member.usedSessions}회 / {member.totalSessions}회</div>
            </div>
          </div>
          
          <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: `${(member.usedSessions / member.totalSessions) * 100}%` }}
            />
          </div>
          
          <div className="mt-3 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar size={12} className="text-slate-300" />
              최근 방문: {member.lastVisit || '-'}
            </div>
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
              <Activity size={12} className="text-indigo-400" />
              다음 수업: {member.nextSession || '-'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
