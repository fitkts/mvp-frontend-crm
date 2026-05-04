import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Activity, CreditCard, Camera, MessageSquare, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles, Plus, AlertCircle, Mail, FileText, Ban, Calendar, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  initialMemberName?: string;
  onSaveMember?: (memberData: any) => void;
}

interface PaymentSplit {
  id: string;
  method: '카드' | '현금' | '이체';
  amount: string;
   installment: string;
}

// --- '사물함관리' 페이지 연동 데이터 시뮬레이션 ---
const AVAILABLE_LOCKERS = [
  { id: 'A-03', area: 'A구역' },
  { id: 'A-04', area: 'A구역' },
  { id: 'A-06', area: 'A구역' },
  { id: 'A-07', area: 'A구역' },
  { id: 'A-08', area: 'A구역' },
  { id: 'A-09', area: 'A구역' },
  { id: 'B-01', area: 'B구역' },
  { id: 'B-02', area: 'B구역' },
];

export default function RegistrationModalP({ isOpen, onClose, initialStep, initialMemberName, onSaveMember }: Props) {
  const staffList = useAppStore(state => state.staff);
  const ACTIVE_STAFF = staffList.filter(s => s.status === 'ACTIVE');

  const [step, setStep] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);

  // === 회원 기본 정보 ===
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [grade, setGrade] = useState('NORMAL');
  const [email, setEmail] = useState('');
  const [memo, setMemo] = useState('');
  
  // 중복 체크 상태
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // === 등록 및 상담 정보 ===
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [workoutStartDate, setWorkoutStartDate] = useState('');
  const [memberManager, setMemberManager] = useState(''); // 직원관리 연동 대상
  const [goals, setGoals] = useState<string[]>(['체력 증진']);
  const [source, setSource] = useState(''); 

  // === 결제 및 상품 정보 ===
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [paymentTrainer, setPaymentTrainer] = useState(''); // 직원관리 연동 대상
  
  const [basePrice, setBasePrice] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeDiscountAmount, setCodeDiscountAmount] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // [P타입: 통합 사물함 관리 시스템]
  const [isLockerActive, setIsLockerActive] = useState(false);
  const [selectedLockerId, setSelectedLockerId] = useState(''); // 사물함 관리 연동
  const [lockerAmount, setLockerAmount] = useState(0);
  const [lockerPeriod, setLockerPeriod] = useState(30);
  const [lockerStartDate, setLockerStartDate] = useState('');
  const [lockerEndDate, setLockerEndDate] = useState('');

  // [복합 결제 리스트]
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: '1', method: '카드', amount: '0', installment: '일시불' }
  ]);

  // [미수금 시스템]
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [isUnpaidActive, setIsUnpaidActive] = useState(false);

  // [메시지 및 기타]
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);
  const [msgTemplate, setMsgTemplate] = useState('기본형');
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  // 초기화
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 1);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      setMemberDate(dateStr); setMemberTime(timeStr);
      setWorkoutStartDate(dateStr);
      setPaymentDate(dateStr); setPaymentTime(timeStr);
      setLockerStartDate(dateStr);

      setMemberName(initialMemberName || ''); setPhone(''); setGender(''); setBirthDate(''); setGrade('NORMAL'); setEmail(''); setMemo('');
      setMemberManager(''); setPaymentTrainer(''); setBasePrice(0); setSessions(0); setDiscountPercent(0);
      setDiscountCode(''); setIsCodeVerified(false); setCodeDiscountAmount(0);
      setIsLockerActive(false); setSelectedLockerId(''); setLockerAmount(0); setLockerPeriod(30);
      setSplits([{ id: '1', method: '카드', amount: '0', installment: '일시불' }]);
      setUnpaidAmount(0); setIsUnpaidActive(false); setIsLoadingLink(false);
      setIsDuplicateChecked(false);

      // 모달이 열릴 때 Step 1이면 성함 입력칸에 포커스 (애니메이션 고려하여 시간차 부여)
      if ((initialStep || 1) === 1) {
        setTimeout(() => nameRef.current?.focus(), 400);
      }
    }
  }, [isOpen, initialStep]);

  // 사물함 만료일 자동 계산 (무결성 검증 포함)
  useEffect(() => {
    if (lockerStartDate && lockerPeriod) {
      const start = new Date(lockerStartDate);
      start.setDate(start.getDate() + Number(lockerPeriod));
      setLockerEndDate(start.toISOString().split('T')[0]);
    }
  }, [lockerStartDate, lockerPeriod]);

  // 통합 결제 로직: (상품 할인금액) + (사물함 금액) - (코드 할인)
  useEffect(() => {
    const productPrice = Math.max(0, basePrice * (1 - discountPercent / 100));
    const total = productPrice + (isLockerActive ? lockerAmount : 0) - codeDiscountAmount;
    setDiscountedPrice(Math.max(0, total));
    
    // 상품 선택/변경 시 첫 번째 결제 수단의 금액을 합계 금액과 자동으로 동기화
    setSplits(prev => {
      if (prev.length === 1) {
        return [{ ...prev[0], amount: Math.max(0, total).toLocaleString() }];
      }
      return prev;
    });
  }, [basePrice, discountPercent, lockerAmount, isLockerActive, codeDiscountAmount]);

  const totalPaid = splits.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/,/g, '') || '0', 10), 0);
  const totalDue = discountedPrice - totalPaid;
  const effectiveUnpaid = isUnpaidActive ? unpaidAmount : 0;
  
  // 데이터 무결성 검증 1: 결제 밸런스 확인
  const isBalanced = Math.abs(totalPaid + effectiveUnpaid - discountedPrice) < 1;

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    else if (value.length > 7) formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    setPhone(formatted);
  };

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'pt10') { setBasePrice(500000); setSessions(10); }
    else if (val === 'pt20') { setBasePrice(900000); setSessions(20); }
    else if (val === 'pt50') { setBasePrice(2000000); setSessions(50); }
    else { setBasePrice(0); setSessions(0); }
    setDiscountPercent(0);
  };

  const updateSplit = (id: string, field: string, value: string) => {
    setSplits(splits.map(s => {
      if (s.id !== id) return s;
      if (field === 'amount') {
        const num = value.replace(/[^\d]/g, '');
        return { ...s, amount: parseInt(num || '0', 10).toLocaleString() };
      }
      return { ...s, [field]: value };
    }));
  };

  const addSplit = () => {
    const remaining = discountedPrice - totalPaid - effectiveUnpaid;
    setSplits([...splits, { 
      id: Math.random().toString(36).substr(2, 9), 
      method: '카드', 
      amount: (remaining > 0 ? remaining : 0).toLocaleString(), 
      installment: '일시불' 
    }]);
  };

  const removeSplit = (id: string) => {
    if (splits.length > 1) setSplits(splits.filter(s => s.id !== id));
  };

  const setUnpaidToBalance = () => {
    const balance = discountedPrice - totalPaid;
    setUnpaidAmount(balance > 0 ? balance : 0);
  };

  const handleRemotePayment = () => {
    setIsLoadingLink(true);
    setTimeout(() => {
      setIsLoadingLink(false);
      alert('결제 링크가 회원님의 카카오톡으로 발송되었습니다.');
    }, 1500);
  };

  const checkDuplicate = () => {
    if (!memberName || !phone) return alert('성함과 연락처를 먼저 입력해주세요.');
    setIsChecking(true);
    // 실제 데이터베이스 연동 시뮬레이션
    setTimeout(() => {
      setIsChecking(false);
      setIsDuplicateChecked(true);
      alert(`[중복 체크 완료]\n'${memberName}(${phone})'님은 등록 가능한 신규 회원입니다.`);
    }, 800);
  };

  const verifyDiscountCode = () => {
    if (!discountCode) return alert('할인 코드를 입력하세요.');
    setIsCheckingCode(true);
    
    // 무결성 체크용 시뮬레이션
    setTimeout(() => {
      setIsCheckingCode(false);
      if (discountCode.toUpperCase() === 'WELCOME10') {
        setIsCodeVerified(true);
        setCodeDiscountAmount(30000); // 3만원 고정 할인
        alert('[할인 코드 적용 완료]\n웰컴 할인 30,000원이 적용되었습니다.');
      } else if (discountCode.toUpperCase() === 'VIP2026') {
        setIsCodeVerified(true);
        setCodeDiscountAmount(50000); // 5만원 고정 할인
        alert('[할인 코드 적용 완료]\nVIP 특별 할인 50,000원이 적용되었습니다.');
      } else {
        setIsCodeVerified(false);
        setCodeDiscountAmount(0);
        alert('유효하지 않은 할인 코드입니다.');
      }
    }, 800);
  };

  const handlePartialSave = () => {
    if (!isDuplicateChecked) return alert('성함 및 연락처 중복 체크를 먼저 진행해 주세요.');
    
    if (onSaveMember) {
      const partialMember = {
        name: memberName || '신규 회원',
        gender: gender === 'M' ? '남' : '여',
        phone: phone || '010-0000-0000',
        status: 'ACTIVE',
        registrationDate: new Date().toISOString(),
        email: email || '',
        goal: goals[0] || '기본 목표',
        attendance: 0,
        totalPaid: 0,
        recentPurchase: '단순 상담/리드',
        remainingSessions: 0,
        assignedTrainerId: memberManager ? parseInt(memberManager, 10) : undefined,
      };
      onSaveMember(partialMember);
    }

    alert(`[단계 1 저장]\n회원: ${memberName}\n상태: 임시 리드 등록 완료`);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      handleFinalSave();
    }
  };

  const handleFinalSave = () => {
    console.log('1. handleFinalSave 시작됨');
    // 최종 무결성 검사
    if (!isBalanced) return alert('결제 금액과 총액이 일치하지 않습니다.');
    if (isLockerActive && !selectedLockerId) return alert('배정할 사물함 번호를 선택해주세요.');

    console.log('2. 무결성 통과 완료');

    alert(`[P타입 최종 등록 완료]\n회원: ${memberName}\n결제: ${discountedPrice.toLocaleString()}원\n미수: ${unpaidAmount.toLocaleString()}원\n사물함: ${isLockerActive ? selectedLockerId + '번 배정' : '미사용'}\n\n신규 회원이 목록에 추가되었습니다.`);
    
    if (onSaveMember) {
      const newMember = {
        name: memberName || '신규 회원',
        gender: gender === 'M' ? '남' : '여',
        phone: phone || '010-0000-0000',
        status: 'ACTIVE',
        registrationDate: workoutStartDate ? new Date(workoutStartDate).toISOString() : new Date().toISOString(),
        email: email || '',
        goal: goals[0] || '기본 목표',
        attendance: 0,
        totalPaid: totalPaid,
        recentPurchase: basePrice > 0 ? '수강권 결제' : '신규 회원',
        remainingSessions: sessions || 0,
        assignedTrainerId: memberManager ? parseInt(memberManager, 10) : undefined,
        paymentHistories: {
          create: splits.map(s => ({
            date: new Date().toISOString(),
            product: basePrice > 0 ? '수강권' : '신규 상품',
            sessions: sessions,
            basePrice: basePrice,
            discountedPrice: discountedPrice,
            method: s.method,
            installment: s.installment,
            trainerId: paymentTrainer ? parseInt(paymentTrainer, 10) : undefined,
            trainerName: staffList.find(st => st.id.toString() === paymentTrainer)?.name || '미정',
            locker: isLockerActive ? selectedLockerId : '미사용',
            status: 'COMPLETED'
          }))
        }
      };
      
      console.log('3. 전송할 데이터:', newMember);
      console.log('4. API 호출 직전');
      onSaveMember(newMember);
    }
  };

  const getPreviewMsg = () => {
    const name = memberName || 'OOO';
    const trainerName = staffList.find(s => s.id.toString() === paymentTrainer)?.name || '미정';
    const lockerInfo = isLockerActive ? `\n[사물함] ${selectedLockerId}번 (~${lockerEndDate})` : '';
    if (msgTemplate === '기본형') return `[안내] ${name}님, 등록이 완료되었습니다.${lockerInfo}\n담당: ${trainerName}`;
    if (msgTemplate === '친근형') return `안녕하세요 ${name}님! 🎉 함께 목표를 달성해봐요!${lockerInfo} 첫 수업 때 봬요! 😊`;
    return `🔥 ${name}님, 득근 시작!${lockerInfo}\n오늘부터 확실하게 서포트하겠습니다! 👊`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                신규 회원 등록 <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Type P (Integrated)</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">사물함/직원관리 통합 연동 시스템</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          {/* New Sleek Stepper */}
          <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-6 shrink-0">
             <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setStep(1)}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${step === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-200'}`}>1</div>
                <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>기본 정보</span>
             </div>
             <div className="h-px w-8 bg-slate-200" />
             <div className="flex items-center gap-2 group cursor-pointer" onClick={() => step === 1 ? setStep(2) : null}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-200'}`}>2</div>
                <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>결제 및 연동 설정</span>
             </div>
          </div>

          <form id="member-registration-form" onSubmit={handleFormSubmit} className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar min-h-[500px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-indigo-500 rounded-full" /><h3 className="text-sm font-black text-slate-900">회원 인적 사항</h3></div>
                      <button 
                        type="button"
                        onClick={checkDuplicate}
                        disabled={isChecking || !memberName || !phone}
                        className={`px-3 py-1.5 rounded-lg text-white text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 ${isDuplicateChecked ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}
                      >
                        {isChecking ? <Loader2 size={12} className="animate-spin" /> : isDuplicateChecked ? <Check size={12}/> : null}
                        {isDuplicateChecked ? '검증 완료' : '중복 체크'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">성함 <span className="text-rose-500">*</span></label>
                         <input 
                           ref={nameRef} 
                           type="text" 
                           autoFocus
                           value={memberName} 
                           onChange={e => {setMemberName(e.target.value); setIsDuplicateChecked(false);}} 
                           placeholder="실명을 입력하세요" 
                           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                        />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">연락처 <span className="text-rose-500">*</span></label>
                         <input type="tel" value={phone} onChange={e => {handlePhoneChange(e); setIsDuplicateChecked(false);}} maxLength={13} placeholder="010-0000-0000" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300" />
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">성별</label>
                         <div className="flex gap-1 h-[38px]">
                           {['M', 'F'].map(g => (
                             <button type="button" key={g} onClick={() => setGender(g as 'M'|'F')} className={`flex-1 rounded-xl text-[11px] font-black transition-all ${gender === g ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>{g === 'M' ? '남' : '여'}</button>
                           ))}
                         </div>
                       </div>
                       <div className="space-y-1.5 col-span-2">
                         <label className="text-[10px] font-black text-slate-500 ml-1">생년월일</label>
                         <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none h-[38px]" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">고객 등급</label>
                         <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none">
                            <option value="NORMAL">일반 회원</option>
                            <option value="SILVER">실버 (장기)</option>
                            <option value="GOLD">골드 (VIP)</option>
                            <option value="DIAMOND">다이아몬드 (VVIP)</option>
                         </select>
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">이메일</label>
                         <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-300" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">상담 날짜</label>
                         <div className="flex gap-2">
                           <input type="date" value={memberDate} onChange={e => setMemberDate(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 h-[38px]" />
                           <input type="time" value={memberTime} onChange={e => setMemberTime(e.target.value)} className="w-[100px] px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 h-[38px]" />
                         </div>
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 ml-1">운동 시작일</label>
                         <input type="date" value={workoutStartDate} onChange={e => setWorkoutStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 h-[38px]" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 ml-1">상담 담당자 (직원관리 연동)</label>
                          <select value={memberManager} onChange={e => setMemberManager(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500">
                             <option value="">직원 선택 (미배정)</option>
                             {ACTIVE_STAFF.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role === 'ADMIN' ? '수석' : '트레이너'})</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 ml-1">방문 경로</label>
                          <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none">
                             <option value="">경로 선택</option><option value="walk">워크인</option><option value="sns">인스타그램</option><option value="blog">블로그</option><option value="ref">지인 소개</option>
                          </select>
                       </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 ml-1">기본 상담 메모</label>
                     <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="체형 특징, 질환 유무, 목표 등 특이사항을 상세히 기록하세요." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 min-h-[100px] resize-none" />
                  </section>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                   {/* Product Selection Section */}
                   <section className="space-y-3">
                      <div className="flex items-center gap-2 mb-1"><div className="w-1.5 h-4 bg-indigo-500 rounded-full" /><h3 className="text-sm font-black text-slate-900">수강권 상품 선택</h3></div>
                      <select onChange={handleProductChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-3xl text-sm font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm appearance-none cursor-pointer">
                         <option value="">상품을 선택하세요</option>
                         <option value="pt10">개인 PT 10회 (500,000원)</option>
                         <option value="pt20">개인 PT 20회 (900,000원)</option>
                         <option value="pt50">개인 PT 50회 (2,000,000원)</option>
                      </select>

                      <div className="flex gap-2">
                         <div className="flex-1 relative">
                            <input 
                               type="text" 
                               value={discountCode} 
                               onChange={e => {setDiscountCode(e.target.value); setIsCodeVerified(false); setCodeDiscountAmount(0);}} 
                               placeholder="할인 코드 입력" 
                               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                            />
                         </div>
                         <button 
                            type="button"
                            onClick={verifyDiscountCode}
                            disabled={isCheckingCode || !discountCode}
                            className={`px-4 py-2.5 rounded-2xl text-white text-[10px] font-black transition-all ${isCodeVerified ? 'bg-emerald-500' : 'bg-slate-900'} disabled:opacity-50`}
                         >
                            {isCheckingCode ? <Loader2 size={12} className="animate-spin" /> : isCodeVerified ? '적용됨' : '확인'}
                         </button>
                      </div>

                      <AnimatePresence>
                        {isCodeVerified && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-between items-center px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl"
                          >
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><Sparkles size={14}/></div>
                                <span className="text-[10px] font-black text-emerald-700 uppercase leading-none">Discount Applied</span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-emerald-600">-{codeDiscountAmount.toLocaleString()}원</span>
                                <span className="text-[9px] font-bold text-emerald-400 capitalize">-{basePrice > 0 ? ((codeDiscountAmount / basePrice) * 100).toFixed(1) : 0}% off</span>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2">
                         <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 block mb-1">정가</span>
                            <span className="text-sm font-black text-slate-900">{basePrice.toLocaleString()}원</span>
                         </div>
                         <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div>
                               <span className="text-[10px] font-black text-slate-400 block mb-1">할인 (%)</span>
                               <input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-full bg-transparent text-sm font-black text-indigo-600 outline-none" min="0" max="100" />
                            </div>
                         </div>
                      </div>
                   </section>

                   {/* Personal Locker Integrated Section */}
                   <section className="p-5 rounded-[32px] border border-emerald-100 bg-emerald-50/30 space-y-5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200"><Box size={20}/></div>
                           <div>
                              <h3 className="text-[13px] font-black text-slate-900">개인 사물함 관리 (Locker)</h3>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Integrated with Locker Management Page</p>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsLockerActive(!isLockerActive)}
                          className={`relative w-12 h-6 rounded-full transition-all ${isLockerActive ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${isLockerActive ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isLockerActive && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                             <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-500 ml-1">사물함 번호 (실시간 연동)</label>
                                   <select value={selectedLockerId} onChange={e => setSelectedLockerId(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-2xl text-xs font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20">
                                      <option value="">배정 가능 사물함 선택</option>
                                      {AVAILABLE_LOCKERS.map(l => <option key={l.id} value={l.id}>{l.area} - {l.id}번</option>)}
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-500 ml-1">사물함 이용료(원)</label>
                                   <input type="number" value={lockerAmount} onChange={e => setLockerAmount(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-2xl text-sm font-black text-emerald-800 outline-none" />
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-3 bg-white/50 p-4 rounded-2xl border border-emerald-100">
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black text-slate-400">기간 선택</label>
                                   <select value={lockerPeriod} onChange={e => setLockerPeriod(Number(e.target.value))} className="w-full bg-transparent text-xs font-bold outline-none">
                                      <option value={30}>1개월 (30일)</option><option value={90}>3개월 (90일)</option><option value={180}>6개월 (180일)</option><option value={365}>12개월 (365일)</option>
                                   </select>
                                </div>
                                <div className="space-y-1 border-l border-emerald-100 pl-3">
                                   <label className="text-[9px] font-black text-slate-400">시작일</label>
                                   <input type="date" value={lockerStartDate} onChange={e => setLockerStartDate(e.target.value)} className="w-full bg-transparent text-[10px] font-bold outline-none" />
                                </div>
                                <div className="space-y-1 border-l border-emerald-100 pl-3">
                                   <label className="text-[9px] font-black text-emerald-600">만료(예정)일</label>
                                   <div className="text-[11px] font-black text-emerald-700">{lockerEndDate}</div>
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </section>

                   {/* Advanced Integrated Payment System */}
                   <section className="bg-slate-900 rounded-[40px] p-6 shadow-2xl relative overflow-hidden space-y-5">
                      <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-500/10 blur-[80px] pointer-events-none" />
                      
                      <div className="flex justify-between items-start relative z-10 pb-4 border-b border-white/5">
                        <div className="space-y-1">
                           <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Integrated Amount</span>
                           <div className="text-2xl font-black text-white">{discountedPrice.toLocaleString()}원</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-md">
                              <User size={12} className="text-indigo-400"/>
                              <select value={paymentTrainer} onChange={e => setPaymentTrainer(e.target.value)} className="bg-transparent text-[11px] font-bold text-white outline-none border-none">
                                 <option value="">담당 직원 선택</option>
                                 {ACTIVE_STAFF.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.role === 'ADMIN' ? '수석' : '트레이너'})</option>)}
                              </select>
                           </div>
                           <button type="button" onClick={addSplit} className="text-[10px] font-black text-white/50 hover:text-white flex items-center gap-1 transition-all"><Plus size={14}/>결제수단 추가</button>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10 max-h-[140px] overflow-y-auto no-scrollbar">
                        {splits.map(s => (
                           <div key={s.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 group">
                              <div className={`p-2 rounded-xl border ${s.method === '카드' ? 'border-indigo-500/30' : 'border-white/10'}`}>
                                 <CreditCard size={14} className={s.method === '카드' ? 'text-indigo-400' : 'text-slate-400'} />
                              </div>
                              <select value={s.method} onChange={e => updateSplit(s.id, 'method', e.target.value as any)} className="bg-transparent text-[11px] font-black text-white outline-none">
                                 <option value="카드" className="bg-slate-900">카드</option><option value="현금" className="bg-slate-900">현금</option><option value="이체" className="bg-slate-900">이체</option>
                              </select>
                              <div className="flex-1 text-right">
                                 <input value={s.amount} onChange={e => updateSplit(s.id, 'amount', e.target.value)} className="bg-transparent text-sm font-black text-white text-right outline-none w-full tabular-nums" />
                              </div>
                              <span className="text-[10px] text-slate-600 font-bold">원</span>
                              {splits.length > 1 && <button type="button" onClick={() => removeSplit(s.id)} className="p-1 hover:text-rose-400 transition-colors"><X size={14}/></button>}
                           </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-white/5 flex flex-col gap-4 relative z-10">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <span className="text-[11px] font-bold text-slate-500 underline decoration-orange-500 decoration-2 underline-offset-4">미수금 처리 (Unpaid Management)</span>
                              <button type="button" onClick={() => {setIsUnpaidActive(!isUnpaidActive); if(isUnpaidActive) setUnpaidAmount(0);}} className={`w-8 h-4 rounded-full relative transition-all ${isUnpaidActive ? 'bg-orange-500' : 'bg-white/10'}`}>
                                 <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all ${isUnpaidActive ? 'translate-x-4' : ''}`} />
                              </button>
                           </div>
                           {isUnpaidActive && <button type="button" onClick={setUnpaidToBalance} className="text-[9px] font-bold text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-tighter">Set Remaining to Unpaid</button>}
                        </div>
                        
                        {isUnpaidActive && (
                           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                              <input type="number" value={unpaidAmount} onChange={e => setUnpaidAmount(Number(e.target.value))} className="w-full bg-transparent text-xl font-black text-orange-500 text-right outline-none placeholder:text-orange-900/30" placeholder="0" />
                              <div className="absolute left-4 top-4 text-[10px] font-black text-orange-500 uppercase">Input Unpaid Amount</div>
                           </motion.div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-between items-center relative z-10">
                        <div className="flex gap-4">
                           <div className="flex flex-col"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Paid</span><span className="text-[13px] font-black text-indigo-400">{totalPaid.toLocaleString()}원</span></div>
                           {isUnpaidActive && <div className="flex flex-col"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Due</span><span className="text-[13px] font-black text-orange-500">{unpaidAmount.toLocaleString()}원</span></div>}
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Balance Check (Integrity)</span>
                           <span className={`text-base font-black ${isBalanced ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                              {(totalPaid + effectiveUnpaid - discountedPrice).toLocaleString()}원
                              {isBalanced && <Check size={16}/>}
                           </span>
                        </div>
                      </div>
                   </section>

                   <section className="p-4 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {['기본형', '친근형', '동기부여형'].map(t => (
                          <button type="button" key={t} onClick={() => setMsgTemplate(t)} className={`px-4 py-2 rounded-2xl text-[10px] font-black transition-all ${msgTemplate === t ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}>{t}</button>
                        ))}
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl text-[11px] text-slate-500 italic leading-relaxed shadow-sm relative">
                         <div className="absolute top-2 right-4 text-[9px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Preview</div>
                         {getPreviewMsg()}
                      </div>
                   </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
             {step === 1 ? (
               <>
                 <button type="button" onClick={onClose} className="text-slate-400 text-xs font-bold hover:text-slate-800 transition-colors">닫기</button>
                 <div className="flex gap-2">
                    <button type="button" onClick={handlePartialSave} className="px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-all">임시 리드 저장</button>
                    <button type="submit" className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">결제 및 관리 연동 <ChevronRight size={16}/></button>
                 </div>
               </>
             ) : (
               <>
                 <button type="button" onClick={() => setStep(1)} className="text-slate-400 text-xs font-bold hover:text-slate-800 flex items-center gap-1 group">이전 단계</button>
                 <div className="flex gap-2">
                    <button type="button" onClick={handleRemotePayment} className="px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-all">{isLoadingLink ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}</button>
                    <button type="submit" className={`px-10 py-3 text-xs font-black rounded-2xl transition-all shadow-2xl ${isBalanced ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>전산 최종 등록 완료</button>
                 </div>
               </>
             )}
          </div>
        </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
