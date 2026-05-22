import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Activity, CreditCard, Camera, MessageSquare, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles, Plus, AlertCircle, Mail, FileText, Ban, Calendar, Box, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStaffList } from '../../api/queries/useStaff';
import { useProductList } from '../../api/queries/useProducts';
import { useLockerList } from '../../api/queries/useLockers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  member?: any; // Existing member data for editing
  onSaveMember?: (memberData: any, isEdit: boolean) => void;
  onDeleteMember?: (id: number) => void;
}

interface PaymentSplit {
  id: string;
  method: '카드' | '현금' | '이체';
  amount: string;
   installment: string;
}


export default function RegistrationModalP({ isOpen, onClose, initialStep, member, onSaveMember, onDeleteMember }: Props) {
  const { data: staffResponse } = useStaffList();
  const staffList = staffResponse?.data || [];
  const ACTIVE_STAFF = staffList.filter(s => s.status === 'ACTIVE');

  const { data: productsResponse } = useProductList();
  const productList = productsResponse?.data || [];

  const { data: lockersResponse } = useLockerList();
  const lockerList = lockersResponse?.data || [];
  const AVAILABLE_LOCKERS = lockerList.filter((l: any) => l.status === 'AVAILABLE');

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
  
  const [selectedProductId, setSelectedProductId] = useState('');
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

  // 초기화 및 데이터 바인딩
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 1);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      // 기본값 설정
      setMemberDate(dateStr); 
      setMemberTime(timeStr);
      setWorkoutStartDate(dateStr);
      setPaymentDate(dateStr); 
      setPaymentTime(timeStr);
      setLockerStartDate(dateStr);
      
      if (member) {
        // 수정 모드: 기존 데이터 바인딩
        setMemberName(member.name || '');
        setPhone(member.phone || '');
        setGender(member.gender === '남' ? 'M' : member.gender === '여' ? 'F' : '');
        setBirthDate(member.birthDate || '');
        setGrade(member.grade || 'NORMAL');
        setEmail(member.email || '');
        setMemo(member.memo || '');
        setMemberManager(member.assignedTrainerId?.toString() || '');
        setGoals(member.goal ? [member.goal] : ['체력 증진']);
        setSource(member.source || '');
        setMemberDate(member.registrationDate?.split('T')[0] || dateStr);
        setWorkoutStartDate(member.registrationDate?.split('T')[0] || dateStr);
        
        setIsDuplicateChecked(true); // 기존 회원은 중복 체크 불필요
      } else {
        // 신규 등록 모드: 초기화
        setMemberName(''); 
        setPhone(''); 
        setGender(''); 
        setBirthDate(''); 
        setGrade('NORMAL'); 
        setEmail(''); 
        setMemo('');
        setMemberManager(''); 
        setPaymentTrainer(''); 
        setSelectedProductId('');
        setBasePrice(0); 
        setSessions(0); 
        setDiscountPercent(0);
        setDiscountCode(''); 
        setIsCodeVerified(false); 
        setCodeDiscountAmount(0);
        setIsLockerActive(false); 
        setSelectedLockerId(''); 
        setLockerAmount(0); 
        setLockerPeriod(30);
        setSplits([{ id: '1', method: '카드', amount: '0', installment: '일시불' }]);
        setUnpaidAmount(0); 
        setIsUnpaidActive(false); 
        setIsLoadingLink(false);
        setIsDuplicateChecked(false);
      }

      // 모달이 열릴 때 Step 1이면 성함 입력칸에 포커스
      if ((initialStep || 1) === 1 && !member) {
        setTimeout(() => nameRef.current?.focus(), 400);
      }
    }
  }, [isOpen, initialStep, member]);

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
    const productId = e.target.value;
    const selectedProduct = productList.find((p: any) => p.id.toString() === productId);
    
    setSelectedProductId(productId);
    if (selectedProduct) {
      setBasePrice(selectedProduct.price);
      setSessions(selectedProduct.sessionCnt || 0);
    } else {
      setBasePrice(0);
      setSessions(0);
    }
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
        status: member ? member.status : 'ACTIVE',
        registrationDate: member ? member.registrationDate : new Date().toISOString(),
        email: email || '',
        goal: goals[0] || '기본 목표',
        attendance: member ? member.attendance : 0,
        totalPaid: member ? member.totalPaid : 0,
        recentPurchase: member ? member.recentPurchase : '단순 상담/리드',
        remainingSessions: member ? member.remainingSessions : 0,
        assignedTrainerId: memberManager ? parseInt(memberManager, 10) : undefined,
      };
      onSaveMember(partialMember, !!member);
    }

    alert(`[${member ? '정보 수정' : '단계 1 저장'}]\n회원: ${memberName}\n상태: ${member ? '정보 변경 완료' : '임시 리드 등록 완료'}`);
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

    alert(`[P타입 완료]\n회원: ${memberName}\n결제: ${discountedPrice.toLocaleString()}원\n미수: ${unpaidAmount.toLocaleString()}원\n사물함: ${isLockerActive ? selectedLockerId + '번 배정' : '미사용'}\n\n처리가 완료되었습니다.`);
    
    if (onSaveMember) {
      const newMember: any = {
        name: memberName || '신규 회원',
        gender: gender === 'M' ? '남' : '여',
        phone: phone || '010-0000-0000',
        status: member ? member.status : 'ACTIVE',
        registrationDate: member ? member.registrationDate : (workoutStartDate ? new Date(workoutStartDate).toISOString() : new Date().toISOString()),
        email: email || '',
        goal: goals[0] || '기본 목표',
        attendance: member ? member.attendance : 0,
        totalPaid: member ? (member.totalPaid + totalPaid) : totalPaid,
        recentPurchase: productList.find((p: any) => p.id.toString() === selectedProductId)?.name || member?.recentPurchase || '신규 회원',
        remainingSessions: member ? (member.remainingSessions + (sessions || 0)) : (sessions || 0),
        assignedTrainerId: memberManager ? parseInt(memberManager, 10) : undefined,
      };

      if (selectedProductId) {
        newMember.paymentHistories = {
          create: splits.map(s => ({
            date: new Date().toISOString(),
            product: productList.find((p: any) => p.id.toString() === selectedProductId)?.name || '수강권',
            sessions: sessions,
            basePrice: splits.length === 1 ? basePrice : parseInt(s.amount.replace(/,/g, '') || '0', 10),
            discountedPrice: parseInt(s.amount.replace(/,/g, '') || '0', 10),
            method: s.method,
            installment: s.installment,
            trainerId: paymentTrainer ? parseInt(paymentTrainer, 10) : undefined,
            trainerName: staffList.find(st => st.id.toString() === paymentTrainer)?.name || '미정',
            locker: isLockerActive ? selectedLockerId : '미사용',
            status: 'COMPLETED'
          }))
        };
      }
      
      console.log('3. 전송할 데이터:', newMember);
      console.log('4. API 호출 직전');
      onSaveMember(newMember, !!member);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans border border-slate-200" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 leading-none">
                  {member ? '회원 정보 수정' : '신규 회원 등록'} 
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Type P</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-1">사물함/직원관리 통합 전산 시스템</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {member && (
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?\n모든 결제 및 예약 내역이 영구 삭제됩니다.')) {
                      onDeleteMember?.(member.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="회원 삭제"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4 shrink-0">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(1)}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>1</div>
                <span className={`text-[11px] font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>기본 정보</span>
             </div>
             <ChevronRight size={12} className="text-slate-300" />
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => step === 1 ? setStep(2) : null}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>2</div>
                <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>결제 및 연동 설정</span>
             </div>
          </div>

          <form id="member-registration-form" onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-5 bg-white custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                    <section className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                          <h3 className="text-[13px] font-bold text-slate-900">회원 인적 사항</h3>
                        </div>
                        <button 
                          type="button"
                          onClick={checkDuplicate}
                          disabled={isChecking || !memberName || !phone}
                          className={`px-2.5 py-1 rounded-lg text-white text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 ${isDuplicateChecked ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'} disabled:opacity-50`}
                        >
                          {isChecking ? <Loader2 size={10} className="animate-spin" /> : isDuplicateChecked ? <Check size={10}/> : null}
                          {isDuplicateChecked ? '검증 완료' : '중복 체크'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">성함 <span className="text-rose-500">*</span></label>
                          <input 
                            ref={nameRef} 
                            type="text" 
                            autoFocus
                            value={memberName} 
                            onChange={e => {setMemberName(e.target.value); setIsDuplicateChecked(false);}} 
                            placeholder="실명 입력" 
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-300" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label>
                          <input type="tel" value={phone} onChange={e => {handlePhoneChange(e); setIsDuplicateChecked(false);}} maxLength={13} placeholder="010-0000-0000" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">성별</label>
                          <div className="flex gap-1 h-9">
                            {['M', 'F'].map(g => (
                              <button type="button" key={g} onClick={() => setGender(g as 'M'|'F')} className={`flex-1 rounded-lg text-[11px] font-bold transition-all ${gender === g ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}>{g === 'M' ? '남' : '여'}</button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">생년월일</label>
                          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium outline-none h-9 focus:border-indigo-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">고객 등급</label>
                          <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:border-indigo-500">
                             <option value="NORMAL">일반 회원</option>
                             <option value="SILVER">실버 (장기)</option>
                             <option value="GOLD">골드 (VIP)</option>
                             <option value="DIAMOND">다이아몬드 (VVIP)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">이메일</label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 일시</label>
                          <div className="flex gap-2">
                            <input type="date" value={memberDate} onChange={e => setMemberDate(e.target.value)} className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none h-9 focus:border-indigo-500" />
                            <input type="time" value={memberTime} onChange={e => setMemberTime(e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none h-9 focus:border-indigo-500" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">운동 시작일</label>
                          <input type="date" value={workoutStartDate} onChange={e => setWorkoutStartDate(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none h-9 focus:border-indigo-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 담당자</label>
                          <select value={memberManager} onChange={e => setMemberManager(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:border-indigo-500">
                             <option value="">직원 선택 (미배정)</option>
                             {ACTIVE_STAFF.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role === 'ADMIN' ? '수석' : '트레이너'})</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">방문 경로</label>
                          <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:border-indigo-500">
                             <option value="">경로 선택</option><option value="walk">워크인</option><option value="sns">인스타그램</option><option value="blog">블로그</option><option value="ref">지인 소개</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 메모</label>
                      <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="목표, 신체 특이사항 등을 기록하세요." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all min-h-[80px] resize-none" />
                    </section>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    {/* Product Selection */}
                    <section className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                        <h3 className="text-[13px] font-bold text-slate-900">수강권 상품 선택</h3>
                      </div>
                      <select value={selectedProductId} onChange={handleProductChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-sm cursor-pointer">
                         <option value="">상품을 선택하세요</option>
                         {productList.map((p: any) => (
                           <option key={p.id} value={p.id}>
                             {p.name} ({p.price.toLocaleString()}원)
                           </option>
                         ))}
                      </select>

                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={discountCode} 
                            onChange={e => {setDiscountCode(e.target.value); setIsCodeVerified(false); setCodeDiscountAmount(0);}} 
                            placeholder="할인 코드" 
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={verifyDiscountCode}
                          disabled={isCheckingCode || !discountCode}
                          className={`px-4 py-2 rounded-xl text-white text-[11px] font-bold transition-all ${isCodeVerified ? 'bg-emerald-500' : 'bg-slate-900'} disabled:opacity-50`}
                        >
                          {isCheckingCode ? <Loader2 size={12} className="animate-spin" /> : isCodeVerified ? '적용됨' : '적용'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isCodeVerified && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-between items-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl"
                          >
                             <div className="flex items-center gap-2">
                                <Sparkles size={12} className="text-emerald-600"/>
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Discount Applied</span>
                             </div>
                             <span className="text-[11px] font-bold text-emerald-600">-{codeDiscountAmount.toLocaleString()}원</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2">
                        <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">Price</span>
                          <span className="text-[13px] font-bold text-slate-900">{basePrice.toLocaleString()}원</span>
                        </div>
                        <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">Discount (%)</span>
                          <input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-full bg-transparent text-[13px] font-bold text-indigo-600 outline-none" min="0" max="100" />
                        </div>
                      </div>
                    </section>

                    {/* Locker Section */}
                    <section className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-100">
                            <Box size={16}/>
                          </div>
                          <div>
                            <h3 className="text-[12px] font-bold text-slate-900">개인 사물함 관리</h3>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">Locker Management Integration</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsLockerActive(!isLockerActive)}
                          className={`relative w-10 h-5 rounded-full transition-all ${isLockerActive ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isLockerActive ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isLockerActive && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                             <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-500 ml-0.5">사물함 번호</label>
                                   <select value={selectedLockerId} onChange={e => setSelectedLockerId(e.target.value)} className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-[12px] font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/10">
                                      <option value="">사물함 선택</option>
                                      {AVAILABLE_LOCKERS.map((l: any) => <option key={l.id} value={l.id}>{l.id}번</option>)}
                                   </select>
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-500 ml-0.5">이용료(원)</label>
                                   <input type="number" value={lockerAmount} onChange={e => setLockerAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-[12px] font-bold text-emerald-800 outline-none" />
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-2 bg-white/60 p-3 rounded-xl border border-emerald-100">
                                <div className="space-y-0.5">
                                   <label className="text-[9px] font-bold text-slate-400">기간</label>
                                   <select value={lockerPeriod} onChange={e => setLockerPeriod(Number(e.target.value))} className="w-full bg-transparent text-[11px] font-bold outline-none">
                                      <option value={30}>1개월</option><option value={90}>3개월</option><option value={180}>6개월</option><option value={365}>12개월</option>
                                   </select>
                                </div>
                                <div className="space-y-0.5 border-l border-emerald-100 pl-2">
                                   <label className="text-[9px] font-bold text-slate-400">시작일</label>
                                   <input type="date" value={lockerStartDate} onChange={e => setLockerStartDate(e.target.value)} className="w-full bg-transparent text-[10px] font-medium outline-none" />
                                </div>
                                <div className="space-y-0.5 border-l border-emerald-100 pl-2">
                                   <label className="text-[9px] font-bold text-emerald-600">만료일</label>
                                   <div className="text-[10px] font-bold text-emerald-700">{lockerEndDate}</div>
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>

                    {/* Payment Section */}
                    <section className="bg-slate-900 rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-4 border border-slate-800">
                       <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/5 blur-[80px] pointer-events-none" />
                       
                       <div className="flex justify-between items-start relative z-10 pb-3 border-b border-white/10">
                         <div className="space-y-0.5">
                            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Total Amount</span>
                            <div className="text-xl font-bold text-white">{discountedPrice.toLocaleString()}원</div>
                         </div>
                         <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                               <User size={10} className="text-indigo-400"/>
                               <select value={paymentTrainer} onChange={e => setPaymentTrainer(e.target.value)} className="bg-transparent text-[10px] font-bold text-white outline-none border-none cursor-pointer">
                                  <option value="">담당 직원 선택</option>
                                  {ACTIVE_STAFF.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.role === 'ADMIN' ? '수석' : '트레이너'})</option>)}
                               </select>
                            </div>
                         </div>
                       </div>

                       <div className="space-y-2 relative z-10 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                         {splits.map(s => (
                            <div key={s.id} className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 group">
                               <div className={`p-1.5 rounded-lg border ${s.method === '카드' ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/10 bg-white/5'}`}>
                                  <CreditCard size={12} className={s.method === '카드' ? 'text-indigo-400' : 'text-slate-400'} />
                               </div>
                               <select value={s.method} onChange={e => updateSplit(s.id, 'method', e.target.value as any)} className="bg-transparent text-[10px] font-bold text-white outline-none cursor-pointer">
                                  <option value="카드" className="bg-slate-900">카드</option><option value="현금" className="bg-slate-900">현금</option><option value="이체" className="bg-slate-900">이체</option>
                               </select>
                               <div className="flex-1 text-right">
                                  <input value={s.amount} onChange={e => updateSplit(s.id, 'amount', e.target.value)} className="bg-transparent text-[13px] font-bold text-white text-right outline-none w-full tabular-nums" />
                               </div>
                               <span className="text-[10px] text-slate-500 font-medium">원</span>
                               {splits.length > 1 && <button type="button" onClick={() => removeSplit(s.id)} className="p-1 text-slate-500 hover:text-rose-400 transition-colors"><X size={12}/></button>}
                            </div>
                         ))}
                         <button type="button" onClick={addSplit} className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-1.5 mt-1"><Plus size={12}/>결제수단 추가</button>
                       </div>

                       <div className="pt-2 border-t border-white/10 flex flex-col gap-3 relative z-10">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">미수금 처리 (Unpaid)</span>
                               <button type="button" onClick={() => {setIsUnpaidActive(!isUnpaidActive); if(isUnpaidActive) setUnpaidAmount(0);}} className={`w-8 h-4 rounded-full relative transition-all ${isUnpaidActive ? 'bg-orange-500' : 'bg-white/10'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${isUnpaidActive ? 'translate-x-4' : ''}`} />
                               </button>
                            </div>
                            {isUnpaidActive && <button type="button" onClick={setUnpaidToBalance} className="text-[9px] font-bold text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-tight">나머지 전액 설정</button>}
                         </div>
                         
                         {isUnpaidActive && (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                               <input type="number" value={unpaidAmount} onChange={e => setUnpaidAmount(Number(e.target.value))} className="w-full bg-transparent text-lg font-bold text-orange-500 text-right outline-none placeholder:text-orange-900/20" placeholder="0" />
                               <div className="absolute left-3 top-3 text-[8px] font-bold text-orange-500/70 uppercase">Unpaid Amount</div>
                            </motion.div>
                         )}
                       </div>

                       <div className="pt-2 flex justify-between items-center relative z-10">
                         <div className="flex gap-4">
                            <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Paid</span><span className="text-[12px] font-bold text-indigo-400">{totalPaid.toLocaleString()}원</span></div>
                            {isUnpaidActive && <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Due</span><span className="text-[12px] font-bold text-orange-500">{unpaidAmount.toLocaleString()}원</span></div>}
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Status Check</span>
                            <span className={`text-[13px] font-bold ${isBalanced ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                               {(totalPaid + effectiveUnpaid - discountedPrice).toLocaleString()}원
                               {isBalanced && <Check size={12}/>}
                            </span>
                         </div>
                       </div>
                    </section>

                    {/* Message Preview */}
                    <section className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-3">
                       <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                         {['기본형', '친근형', '동기부여형'].map(t => (
                           <button type="button" key={t} onClick={() => setMsgTemplate(t)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${msgTemplate === t ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}>{t}</button>
                         ))}
                       </div>
                       <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed shadow-sm relative">
                          <div className="absolute top-2 right-3 text-[8px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">Preview</div>
                          {getPreviewMsg()}
                       </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
               {step === 1 ? (
                 <>
                   <button type="button" onClick={onClose} className="text-slate-400 text-[11px] font-bold hover:text-slate-800 transition-colors">닫기</button>
                   <div className="flex gap-2">
                      <button type="button" onClick={handlePartialSave} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-all">{member ? '수정 내용 저장' : '임시 리드 저장'}</button>
                      <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-1.5">{member ? '추가 관리 설정' : '결제 및 관리 연동'} <ChevronRight size={14}/></button>
                   </div>
                 </>
               ) : (
                 <>
                   <button type="button" onClick={() => setStep(1)} className="text-slate-400 text-[11px] font-bold hover:text-slate-800 flex items-center gap-1">이전 단계</button>
                   <div className="flex gap-2">
                      <button type="button" onClick={handleRemotePayment} className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-all">{isLoadingLink ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}</button>
                      <button type="submit" className={`px-8 py-2.5 text-[11px] font-bold rounded-xl transition-all shadow-lg ${isBalanced ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>{member ? '정보 수정 완료' : '전산 최종 등록 완료'}</button>
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
