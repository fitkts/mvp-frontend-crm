import React from 'react';
import { X, CreditCard, TrendingUp, Dumbbell, Users, Calculator, Receipt, ArrowDownCircle, Info, Building2, UserCheck, Settings2, ChevronRight, CheckCircle2, Clock, Check, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Staff } from '../../lib/staffData';
import PaymentSettingsModal from './PaymentSettingsModal';
import DeductionSettingsModal, { DeductionSettings } from './DeductionSettingsModal';
import NextMonthSalesPredictionModal from './NextMonthSalesPredictionModal';

type PayrollStatus = 'PENDING' | 'APPROVED' | 'PAID';

// Dummy sessions for Audit Trail
const DUMMY_SESSIONS = [
  { id: '1', date: '2026-04-01 10:00', memberName: '강민준', type: 'NORMAL', unitPrice: 80000, commissionRate: 0.3, applyRatio: 1, calculatedPay: 24000 },
  { id: '2', date: '2026-04-03 14:00', memberName: '박서연', type: 'NO_SHOW', unitPrice: 70000, commissionRate: 0.3, applyRatio: 0.5, calculatedPay: 10500 },
  { id: '3', date: '2026-04-05 19:00', memberName: '이준호', type: 'SUBSTITUTE_SPLIT', unitPrice: 60000, commissionRate: 0.3, applyRatio: 0.5, calculatedPay: 9000 },
  { id: '4', date: '2026-04-08 09:00', memberName: '최지우', type: 'NORMAL', unitPrice: 90000, commissionRate: 0.3, applyRatio: 1, calculatedPay: 27000 },
  { id: '5', date: '2026-04-10 11:00', memberName: '정우성', type: 'NORMAL', unitPrice: 75000, commissionRate: 0.3, applyRatio: 1, calculatedPay: 22500 }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

export default function PayrollModalStaff({ isOpen, onClose, staff }: Props) {
  const [payrollStatuses, setPayrollStatuses] = React.useState<Record<string | number, PayrollStatus>>({});
  const [isAuditModalOpen, setIsAuditModalOpen] = React.useState(false);
  
  const payrollStatus = staff ? (payrollStatuses[staff.id] || 'PENDING') : 'PENDING';
  const setPayrollStatus = (status: PayrollStatus) => {
    if (staff) {
      setPayrollStatuses(prev => ({ ...prev, [staff.id]: status }));
    }
  };

  const [salarySettings, setSalarySettings] = React.useState({
    baseSalary: 2500000,
    incentiveRate: 3
  });
  const [deductionSettings, setDeductionSettings] = React.useState<DeductionSettings>({
    type: staff?.description.includes('프리랜서') ? 'FREELANCE' : 'REGULAR',
    items: {
      incomeTax: true,
      residenceTax: true,
      nationalPension: !staff?.description.includes('프리랜서'),
      healthInsurance: !staff?.description.includes('프리랜서'),
      longTermCare: !staff?.description.includes('프리랜서'),
      unemploymentInsurance: !staff?.description.includes('프리랜서'),
    },
    rates: {
      incomeTax: 3,
      residenceTax: 0.3
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isDeductionSettingsOpen, setIsDeductionSettingsOpen] = React.useState(false);
  const [isPredictionOpen, setIsPredictionOpen] = React.useState(false);

  if (!isOpen || !staff) return null;

  // V4 Variables
  const nonTaxableAllowance = 200000; // 식대 등 비과세 가설
  const refundClawback = 125000; // 기지급된 수업권 환불로 인한 환수금액 예시
  
  // Calculations using settings
  const baseSalary = salarySettings.baseSalary;
  const salesIncentive = Math.floor(staff.revenue * (salarySettings.incentiveRate / 100));
  
  // V4 Audit Data: Calculate total class pay based on individual actual session rates
  const totalClassPay = DUMMY_SESSIONS.reduce((acc, curr) => acc + curr.calculatedPay, 0);

  const grossPay = baseSalary + salesIncentive + totalClassPay;
  
  // Tax base calculation (V4)
  // 프리랜서: Gross - refundClawback
  // 정규직: Gross - nonTaxableAllowance - refundClawback
  const taxBase = deductionSettings.type === 'FREELANCE' 
                  ? grossPay - refundClawback 
                  : grossPay - nonTaxableAllowance - refundClawback;

  // Tax calculation
  let totalTaxes = 0;
  const deductions: { label: string, value: number, description: string }[] = [];

  if (deductionSettings.type === 'FREELANCE') {
    const itax = deductionSettings.items.incomeTax ? Math.floor(taxBase * (deductionSettings.rates.incomeTax / 100)) : 0;
    const rtax = deductionSettings.items.residenceTax ? Math.floor(itax * 0.1) : 0; 
    
    if (itax > 0) deductions.push({ label: '사업소득세', value: itax, description: `과세표준의 ${deductionSettings.rates.incomeTax}%` });
    if (rtax > 0) deductions.push({ label: '지방소득세', value: rtax, description: '소득세의 10%' });
    totalTaxes = itax + rtax;
  } else {
    // Regular 
    if (deductionSettings.items.nationalPension) {
      const val = Math.floor(taxBase * 0.045);
      deductions.push({ label: '국민연금', value: val, description: '과세표준의 4.5%' });
      totalTaxes += val;
    }
    if (deductionSettings.items.healthInsurance) {
      const val = Math.floor(taxBase * 0.03545);
      deductions.push({ label: '건강보험', value: val, description: '과세표준의 3.545%' });
      totalTaxes += val;
    }
    if (deductionSettings.items.longTermCare) {
      const health = Math.floor(taxBase * 0.03545);
      const val = Math.floor(health * 0.1295);
      deductions.push({ label: '장기요양보험', value: val, description: '건강보험료의 12.95%' });
      totalTaxes += val;
    }
    if (deductionSettings.items.unemploymentInsurance) {
      const val = Math.floor(taxBase * 0.009);
      deductions.push({ label: '고용보험', value: val, description: '과세표준의 0.9%' });
      totalTaxes += val;
    }
    if (deductionSettings.items.incomeTax) {
      const val = Math.floor(taxBase * 0.02); 
      deductions.push({ label: '근로소득세', value: val, description: '과세표준 간이세액표 (추정)' });
      totalTaxes += val;
    }
    if (deductionSettings.items.residenceTax) {
      const itax = Math.floor(taxBase * 0.02);
      const val = Math.floor(itax * 0.1);
      deductions.push({ label: '지방소득세', value: val, description: '소득세의 10%' });
      totalTaxes += val;
    }
  }

  // Final Total Deductions = Taxes + Clawbacks
  const totalDeductions = totalTaxes + refundClawback;
  const netPay = grossPay - totalDeductions;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              payrollStatus === 'PAID' ? 'bg-indigo-50 text-indigo-600' :
              payrollStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
              'bg-amber-50 text-amber-600'
            }`}>
               <Receipt size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight">급여 정산 명세서</h2>
                 <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${
                    payrollStatus === 'PAID' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                    payrollStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                 }`}>
                    {payrollStatus === 'PENDING' ? '정산 대기/검토중' : payrollStatus === 'APPROVED' ? '관리자 승인완료' : '지급 완료'}
                 </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                <span className="text-emerald-600 font-bold">{staff.name}</span> 님의 2026년 4월 급여 데이터 (V4)
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
          {/* Summary Dashboard */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                   <TrendingUp size={12} /> 총 지급액
                </div>
                <div className="text-sm font-black text-slate-900 tabular-nums">
                   {grossPay.toLocaleString()}<span className="text-[10px] ml-0.5 font-bold">원</span>
                </div>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1.5 text-rose-500">
                   <ArrowDownCircle size={12} /> 총 공제액
                </div>
                <div className="text-sm font-black text-slate-900 tabular-nums">
                   {totalDeductions.toLocaleString()}<span className="text-[10px] ml-0.5 font-bold text-slate-400">원</span>
                </div>
             </div>
             <div className="bg-emerald-600 p-3 rounded-xl shadow-md ring-2 ring-emerald-50/50">
                <div className="text-[10px] font-bold text-emerald-100 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                   <Calculator size={12} /> 예상 실수령액
                </div>
                <div className="text-base font-black text-white tabular-nums">
                   {netPay.toLocaleString()}<span className="text-[10px] ml-0.5 font-bold">원</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             {/* Left Column: Earnings Breakdown */}
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 text-indigo-600 uppercase tracking-wider">
                      <TrendingUp size={14} /> 지급 항목 (Earnings)
                   </h3>
                   <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer group"
                     title="지급 항목 설정"
                   >
                      <Settings2 size={14} className="group-hover:rotate-45 transition-transform" />
                   </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-50">
                   <div className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-slate-700">기본급</span>
                         <span className="text-[10px] text-slate-400">계약 조건에 따른 월 고정 급여</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 tabular-nums">{baseSalary.toLocaleString()}원</span>
                   </div>
                   <div className="p-4 flex items-center justify-between bg-slate-50/30">
                      <div className="flex flex-col">
                         <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-700">매출 인센티브</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black">{salarySettings.incentiveRate}%</span>
                         </div>
                         <span className="text-[10px] text-slate-400">당월 매출: {staff.revenue.toLocaleString()}원</span>
                      </div>
                      <span className="text-sm font-black text-indigo-600 tabular-nums">+{salesIncentive.toLocaleString()}원</span>
                   </div>
                   <div className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                         <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-700">당월 수업 수수료</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black border border-emerald-200/50">V4 개별 단가 적용형</span>
                         </div>
                         <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-slate-400">당월 반영 세션: {DUMMY_SESSIONS.length}건</span>
                            <button 
                              onClick={() => setIsAuditModalOpen(true)}
                              className="text-[10px] text-indigo-500 font-bold hover:underline flex items-center gap-0.5"
                            >
                               <ListChecks size={10} /> 정산 근거 상세 조회
                            </button>
                         </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600 tabular-nums">+{totalClassPay.toLocaleString()}원</span>
                   </div>
                </div>

                {/* Additional Performance Stats */}
                <button 
                  onClick={() => setIsPredictionOpen(true)}
                  className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between hover:bg-indigo-100/70 transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <CreditCard size={16} />
                      </div>
                      <div className="flex flex-col text-left">
                         <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-tight">익월 예상 매출 인센티브</span>
                         <span className="text-[10px] text-indigo-500 font-medium">진행중인 상담 건수: 3건</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-700">+450,000원</span>
                      <ChevronRight size={14} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
                   </div>
                </button>
             </div>

             {/* Right Column: Deductions & Employment Type */}
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                   <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 text-rose-500 uppercase tracking-wider">
                         <ArrowDownCircle size={14} /> 공제 항목 (Deductions)
                      </h3>
                      <div className="group relative">
                         <Info size={12} className="text-slate-400 cursor-help" />
                         <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10">
                            <strong>세금 계산용 과세표준:</strong> {taxBase.toLocaleString()}원<br/>
                            <span className="text-slate-400">산출식: (총지급액 - 비과세수당 - 환수금)</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsDeductionSettingsOpen(true)}
                     className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer group"
                     title="공제 항목 설정"
                   >
                      <Settings2 size={14} className="group-hover:rotate-45 transition-transform" />
                   </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-50">
                   {deductions.length > 0 ? deductions.map((d, idx) => (
                     <div key={idx} className="p-4 flex items-center justify-between bg-slate-50/10">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-700">{d.label}</span>
                           <span className="text-[10px] text-slate-400">{d.description}</span>
                        </div>
                        <span className="text-sm font-bold text-rose-500 tabular-nums">-{d.value.toLocaleString()}원</span>
                     </div>
                   )) : (
                     <div className="p-8 text-center text-slate-400 text-xs font-medium">
                        적용된 공제 항목이 없습니다.
                     </div>
                   )}
                   {/* Clawback */}
                   {refundClawback > 0 && (
                     <div className="p-4 flex items-center justify-between bg-rose-50/30">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-900 border-b border-rose-200 inline-block w-fit mb-0.5">기수당 환수금 (Clawback)</span>
                           <span className="text-[10px] text-rose-500 font-medium">회원 환불에 따른 당월 기지급 수수료 차감분</span>
                        </div>
                        <span className="text-sm font-black text-rose-600 tabular-nums">-{refundClawback.toLocaleString()}원</span>
                     </div>
                   )}
                </div>

                {/* Contract Info Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={14} /> 고용 및 세무 정보
                   </h4>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[12px] font-medium text-slate-500 flex items-center gap-2"><Building2 size={13} /> 고용 형태</span>
                         <span className={`text-[12px] font-bold ${deductionSettings.type === 'REGULAR' ? 'text-indigo-600' : 'text-rose-500'}`}>
                            {deductionSettings.type === 'REGULAR' ? '정규직 (4대보험 적용)' : '프리랜서 (3.3% 원천징수)'}
                         </span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[12px] font-medium text-slate-500 flex items-center gap-2"><UserCheck size={13} /> 정산 주기</span>
                         <span className="text-[12px] font-bold text-slate-900">매월 5일 지급 (익월정산)</span>
                      </div>
                   </div>
                   <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 leading-relaxed">
                      * 본 급여 명세서는 시스템 자동 계산 대조용이며, 최종 정산은 세무 대리인을 통해 확정됩니다. 고용 형태에 따라 공제율이 상이할 수 있습니다.
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-2 text-rose-500 text-[11px] font-bold italic px-3">
              <Info size={14} /> 급여 데이터는 매일 자정 자동 업데이트됩니다. (수강권 단가 고정 적용)
           </div>
           <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                닫기
              </button>
              {payrollStatus === 'PENDING' && (
                <button 
                  onClick={() => setPayrollStatus('APPROVED')}
                  className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-200 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> 명세서 승인
                </button>
              )}
              {payrollStatus === 'APPROVED' && (
                <button 
                  onClick={() => setPayrollStatus('PAID')}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-200"
                >
                  지급 완료 처리
                </button>
              )}
              <button 
                className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-lg shadow-slate-200"
              >
                명세서 PDF 출력
              </button>
           </div>
        </div>
      </motion.div>

      {/* Session Audit Trail Modal */}
      <AnimatePresence>
        {isAuditModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
             >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <ListChecks size={18} className="text-indigo-600" />
                    <h3 className="text-base font-black text-slate-900">당월 수업 수수료 정산 근거 (Audit Trail)</h3>
                  </div>
                  <button onClick={() => setIsAuditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-0 border-b border-slate-100 bg-slate-50 relative">
                   <div className="sticky top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-3 mx-4 mt-4 rounded-lg flex items-center gap-3">
                      <Info size={16} className="text-amber-600 shrink-0" />
                      <p className="text-[11px] text-amber-700 font-medium">수업 결제 시점에 고정된 1회당 단가(unitPrice)와 귀속 정책(applyRatio)이 곱해져 산정된 실 데이터입니다. <strong>해당 화면의 데이터는 임의로 수정할 수 없습니다.</strong></p>
                   </div>
                   <div className="p-4">
                      <table className="w-full text-left text-[11px] border-collapse bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                         <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                               <th className="px-4 py-3">완료 일시</th>
                               <th className="px-4 py-3">회원명</th>
                               <th className="px-4 py-3">속성</th>
                               <th className="px-4 py-3 text-right">고정 수강단가</th>
                               <th className="px-4 py-3 text-center">수수료율</th>
                               <th className="px-4 py-3 text-center">귀속 가중치</th>
                               <th className="px-4 py-3 text-right">정산 인정 금액</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 text-slate-700">
                            {DUMMY_SESSIONS.map(session => (
                               <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-slate-900">{session.date}</td>
                                  <td className="px-4 py-3">{session.memberName}</td>
                                  <td className="px-4 py-3">
                                     {session.type === 'NORMAL' && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold border border-emerald-100">정상 진행</span>}
                                     {session.type === 'NO_SHOW' && <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-[9px] font-bold border border-rose-100">노쇼 (50%)</span>}
                                     {session.type === 'SUBSTITUTE_SPLIT' && <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[9px] font-bold border border-purple-100">대타 (Split 50%)</span>}
                                  </td>
                                  <td className="px-4 py-3 text-right tabular-nums">{session.unitPrice.toLocaleString()}원</td>
                                  <td className="px-4 py-3 text-center">{session.commissionRate * 100}%</td>
                                  <td className="px-4 py-3 text-center font-bold text-indigo-600">{session.applyRatio * 100}%</td>
                                  <td className="px-4 py-3 text-right font-black text-slate-900">{session.calculatedPay.toLocaleString()}원</td>
                               </tr>
                            ))}
                         </tbody>
                         <tfoot className="bg-slate-50 border-t border-slate-200">
                            <tr>
                               <td colSpan={6} className="px-4 py-3 text-right font-bold text-slate-500">총 수업 수수료 합계</td>
                               <td className="px-4 py-3 text-right font-black text-indigo-600 text-[13px]">{totalClassPay.toLocaleString()}원</td>
                            </tr>
                         </tfoot>
                      </table>
                   </div>
                </div>
                <div className="p-4 flex justify-end bg-white shrink-0">
                  <button onClick={() => setIsAuditModalOpen(false)} className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95">닫기</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => setSalarySettings(newSettings)}
        currentSettings={salarySettings}
      />
      <DeductionSettingsModal 
        isOpen={isDeductionSettingsOpen}
        onClose={() => setIsDeductionSettingsOpen(false)}
        onSave={(newSettings) => setDeductionSettings(newSettings)}
        currentSettings={deductionSettings}
      />
      <NextMonthSalesPredictionModal 
        isOpen={isPredictionOpen}
        onClose={() => setIsPredictionOpen(false)}
        staffName={staff.name}
      />
    </div>
  );
}
