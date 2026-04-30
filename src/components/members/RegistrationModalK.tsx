import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentSplit {
  id: string;
  method: '카드' | '현금' | '이체';
  amount: string;
  installment: string;
}

export default function RegistrationModalK({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);

  // === 인적사항 상태 (K타입 연결 강화) ===
  const nameRef = useRef<HTMLInputElement>(null); // AutoFocus 용
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M'|'F'|''>('');
  const [birthDate, setBirthDate] = useState('');
  
  // 중복 확인 상태
  const [isCheckingDup, setIsCheckingDup] = useState(false);
  const [dupStatus, setDupStatus] = useState<'idle'|'ok'|'dup'>('idle');

  // Step 1: 상담 기반 정보
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);
  const [interestLevel, setInterestLevel] = useState('보통'); 
  const [source, setSource] = useState(''); 

  // Step 2: 결제 & 자동화 정보
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [trainer, setTrainer] = useState(''); 
  const [useLocker, setUseLocker] = useState(false);
  
  // === 복합 결제 및 가격 (K타입 고도화) ===
  const [basePrice, setBasePrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  
  // 복합 결제 리스트
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: '1', method: '카드', amount: '0', installment: '일시불' }
  ]);

  // 알림톡 자동화 상태
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);
  const [msgTemplate, setMsgTemplate] = useState('기본형');

  // 비대면 링크 발송 로딩
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      setMemberDate(dateStr);
      setMemberTime(timeStr);
      setPaymentDate(dateStr);
      setPaymentTime(timeStr);

      setPromoCode('');
      setDiscountMessage('');
      setBasePrice(0);
      setDiscountedPrice(0);
      setSplits([{ id: '1', method: '카드', amount: '0', installment: '일시불' }]);
      setIsLoadingLink(false);
      setDupStatus('idle');
      
      // K타입: 모달 오픈 시 자동 포커스 (애니메이션 대기 시간 200ms)
      setTimeout(() => {
        nameRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // 가격 변경 시 분할이 1개면 방식을 유지하며 금액 자동 설정
  useEffect(() => {
    if (splits.length === 1) {
      const single = splits[0];
      setSplits([{ ...single, amount: discountedPrice.toLocaleString() }]);
    }
  }, [discountedPrice]);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/[^\d]/g, '');
    let formatted = numbers;
    
    if (numbers.length > 3 && numbers.length <= 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length > 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
    setPhone(formatted);
    // 폰 번호가 바뀌면 중복체크 리셋
    setDupStatus('idle');
  };

  const handleCheckDuplicate = () => {
    if (!memberName || !phone) {
      alert('이름과 연락처를 입력해주세요.');
      return;
    }
    setIsCheckingDup(true);
    setTimeout(() => {
      setIsCheckingDup(false);
      setDupStatus('ok'); // 테스트성 무조건 통과
    }, 600);
  };

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let price = 0;
    if (val === 'pt10') price = 500000;
    else if (val === 'pt20') price = 900000;
    else if (val === 'gym3') price = 200000;
    
    setBasePrice(price);
    recalculate(price, promoCode);
  };

  const applyPromo = () => {
    recalculate(basePrice, promoCode);
  };

  const recalculate = (price: number, code: string) => {
    let final = price;
    const upperCode = code.toUpperCase();
    if (upperCode === 'NEW10') {
      final = price * 0.9;
      setDiscountMessage('신규회원 10% 할인이 적용되었습니다.');
    } else if (upperCode === 'FRIEND5') {
      final = Math.max(0, price - 50000);
      setDiscountMessage('지인추천 5만원 할인이 적용되었습니다.');
    } else if (code.trim() !== '') {
      setDiscountMessage('유효하지 않은 코드입니다.');
    } else {
      setDiscountMessage('');
    }
    setDiscountedPrice(final);
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  // === K타입: 복합 결제 컨트롤 핸들러 ===
  const totalPaid = splits.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/,/g, '') || '0', 10), 0);
  const remaining = discountedPrice - totalPaid;

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
    const defaultAmount = remaining > 0 ? remaining : 0;
    setSplits([...splits, { 
      id: Math.random().toString(36).substr(2, 9), 
      method: '카드', 
      amount: defaultAmount.toLocaleString(), 
      installment: '일시불' 
    }]);
  };

  const removeSplit = (id: string) => {
    if (splits.length <= 1) return;
    setSplits(splits.filter(s => s.id !== id));
  };


  const getPreviewMsg = () => {
    const name = memberName || 'OOO';
    if (msgTemplate === '기본형') return `[안내] ${name} 회원님, 등록이 완료되었습니다. 센터 앱을 다운로드하여 예약 일정을 관리해 주세요. 감사합니다.`;
    if (msgTemplate === '친근형') return `안녕하세요 ${name} 회원님! ✨ 저희 센터의 가족이 되신 것을 진심으로 환영해요! 편하실 때 앱에서 첫 일정을 꼭 잡아주세요 😊`;
    return `🔥 ${name}님, 멋진 목표 달성을 위한 첫 걸음을 축하합니다! 담당 트레이너와 함께 득근해봐요! 지치지 않게 서포트하겠습니다! 👊`;
  };

  const handleRemotePayment = () => {
    if (!phone) {
      alert('연락처를 먼저 입력해주세요.');
      return;
    }
    setIsLoadingLink(true);
    setTimeout(() => {
      setIsLoadingLink(false);
      alert(`[결제 링크 발송 API 성공]\n'${phone}' 번호로 PG 모바일 결제 링크 및 안내 문자가 성공적으로 자동 발송되었습니다.`);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              신규 회원 등록 <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-md ml-1 inline-flex items-center gap-1"><Sparkles size={10}/>K타입 (실무 완성형)</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>인적사항·상담</span>
            </div>
            <div className="text-slate-300">
              <ChevronRight size={14} />
            </div>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>복합결제·자동화</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar relative min-h-[480px]">
            <AnimatePresence mode="wait">
              {/* === STEP 1 === */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* 1. 회원 정보 (오토포커스 + 상태완결 + 중복체크) */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={14} className="text-sky-500"/>
                      <h3 className="text-xs font-bold text-slate-900">회원 정보 (필수)</h3>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <button className="w-16 h-16 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors border border-dashed border-slate-200 shrink-0 group">
                        <Camera size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold">사진</span>
                      </button>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {/* AutoFocus 적용 input */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">이름 <span className="text-rose-500">*</span></label>
                            <input 
                              ref={nameRef}
                              type="text" 
                              value={memberName} 
                              onChange={(e) => setMemberName(e.target.value)} 
                              placeholder="홍길동" 
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none font-bold" 
                            />
                          </div>
                          {/* 중복 로직 병합 전화번호 */}
                          <div className="space-y-1 relative">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label>
                            <div className="flex gap-1.5">
                              <input 
                                type="tel" 
                                value={phone} 
                                onChange={handlePhoneChange} 
                                maxLength={13} 
                                placeholder="010-0000-0000" 
                                className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs focus:ring-1 outline-none font-bold ${dupStatus === 'ok' ? 'border-sky-300 ring-sky-300 bg-sky-50' : 'border-slate-200 focus:ring-sky-500'}`} 
                              />
                              <button 
                                onClick={handleCheckDuplicate} 
                                disabled={isCheckingDup || !phone}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold shrink-0 w-[60px] flex justify-center items-center transition-colors ${dupStatus === 'ok' ? 'bg-sky-100 text-sky-600 border border-sky-200' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                              >
                                {isCheckingDup ? <Loader2 size={12} className="animate-spin"/> : dupStatus === 'ok' ? '확인됨' : '중복확인'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">성별</label>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => setGender('M')} 
                                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all border ${gender === 'M' ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                              >
                                남성
                              </button>
                              <button 
                                onClick={() => setGender('F')} 
                                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all border ${gender === 'F' ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                              >
                                여성
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">생년월일</label>
                            <input 
                              type="date" 
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none h-[28px] text-slate-600" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. 등록 이력 */}
                  <section>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 담당자</label>
                        <select 
                          value={memberManager}
                          onChange={(e) => setMemberManager(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                        >
                          <option value="">담당자 선택</option>
                          <option value="manager1">이인호 (매니저)</option>
                          <option value="manager2">김수영 (데스크)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 일자</label>
                        <input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 시간</label>
                        <input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500" />
                      </div>
                    </div>
                  </section>

                  {/* 3. CRM 세일즈 */}
                  <section>
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><MapPin size={10} /> 방문 경로</label>
                         <select 
                           value={source}
                           onChange={(e) => setSource(e.target.value)}
                           className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-orange-500 text-slate-700"
                         >
                           <option value="">경로를 지정해주세요</option>
                           <option value="walk_in">직접 방문 (지나가다)</option>
                           <option value="referral">지인 추천</option>
                           <option value="instagram">인스타그램 / SNS</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 가망도 (리드온도)</label>
                         <div className="flex gap-1.5">
                           <button onClick={() => setInterestLevel('높음')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '높음' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}><Flame size={10}/> 높음</button>
                           <button onClick={() => setInterestLevel('보통')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '보통' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400'}`}><Star size={10}/> 보통</button>
                           <button onClick={() => setInterestLevel('낮음')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '낮음' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}><Cloud size={10}/> 낮음</button>
                         </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* === STEP 2 === */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <CreditCard size={14} className="text-sky-500"/>
                      <h3 className="text-xs font-bold text-slate-900">결제 및 세팅</h3>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-4">
                      
                      {/* 상품/세팅 헤더부 */}
                      <div className="grid grid-cols-[2fr_1.5fr] gap-3">
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품 <span className="text-rose-500">*</span></label>
                           <select onChange={handleProductChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm">
                             <option value="">상품을 선택하세요</option>
                             <option value="pt10">PT 베이직 10회 (500,000원)</option>
                             <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                             <option value="gym3">헬스권 3개월 (200,000원)</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 ml-0.5">할인 코드</label>
                           <div className="flex gap-1">
                             <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="NEW10" className="flex-1 px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none uppercase font-bold text-slate-700 shadow-sm" />
                             <button onClick={applyPromo} className="px-3 py-2 bg-slate-800 text-white text-[11px] font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm">적용</button>
                           </div>
                         </div>
                      </div>

                      {discountMessage && (
                        <p className={`text-[10px] font-bold ml-0.5 -mt-2 ${discountMessage.includes('유효') ? 'text-rose-500' : 'text-sky-600'}`}>
                          {discountMessage.includes('유효') ? '' : '🎉 '} {discountMessage}
                        </p>
                      )}

                      {/* === 복합 결제 (Split Payment) UI === */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-[11px] font-bold text-slate-800 ml-0.5">
                            복합 결제 내역 <span className="text-sky-500 font-medium ml-1">총 청구금액: {discountedPrice.toLocaleString()}원</span>
                          </label>
                        </div>
                        
                        <div className="space-y-1.5">
                          <AnimatePresence>
                            {splits.map((split, i) => (
                              <motion.div 
                                key={split.id} 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-1.5 overflow-hidden"
                              >
                                <select 
                                  value={split.method} 
                                  onChange={(e) => updateSplit(split.id, 'method', e.target.value as any)}
                                  className="px-2 py-2 bg-white rounded border border-slate-200 text-[11px] font-bold outline-none focus:border-sky-500"
                                >
                                  <option value="카드">💳 카드</option>
                                  <option value="현금">💵 현금</option>
                                  <option value="이체">🏦 이체</option>
                                </select>
                                
                                <div className="flex-1 relative">
                                  <input 
                                    className="w-full text-right px-2 py-2 bg-white border border-slate-200 rounded text-[12px] font-bold pr-5 outline-none focus:border-sky-500" 
                                    value={split.amount} 
                                    onChange={(e) => updateSplit(split.id, 'amount', e.target.value)}
                                  />
                                  <span className="absolute right-2 top-[9px] text-[10px] text-slate-400 font-medium">원</span>
                                </div>

                                {split.method === '카드' ? (
                                  <select 
                                    value={split.installment} 
                                    onChange={(e) => updateSplit(split.id, 'installment', e.target.value)}
                                    className="px-2 py-2 bg-white rounded border border-slate-200 text-[10px] outline-none focus:border-sky-500 w-[72px]"
                                  >
                                    <option value="일시불">일시불</option>
                                    <option value="2개월">2개월</option>
                                    <option value="3개월">3개월</option>
                                  </select>
                                ) : (
                                  <div className="w-[72px]" /> // 빈 공간 맞춤
                                )}

                                {splits.length > 1 && (
                                  <button onClick={() => removeSplit(split.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"><X size={14}/></button>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        
                        {/* 결제 추가 및 잔여 금액 표시 */}
                        <div className="flex justify-between items-center mt-2.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                          <button onClick={addSplit} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded transition-colors">
                            <Plus size={12}/> 결제수단 추가 분할
                          </button>
                          
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-500">가야 할 잔액결제:</span>
                             <span className={`text-sm font-bold tracking-tight flex items-center gap-1 ${remaining > 0 ? 'text-rose-500' : remaining < 0 ? 'text-amber-500' : 'text-sky-600'}`}>
                               {remaining === 0 ? <Check size={14} /> : remaining < 0 ? <AlertCircle size={12}/> : null}
                               {Math.abs(remaining).toLocaleString()}원 
                               {remaining < 0 && <span className="text-[9px] font-medium">(초과설정)</span>}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 자동화 메시지 발송 */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <MessageSquare size={14} className="text-emerald-500"/>
                      <h3 className="text-xs font-bold text-slate-900">자동화 알림톡 발송</h3>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer transition-colors w-max">
                        <div className="relative flex items-center">
                          <input type="checkbox" checked={sendWelcomeMsg} onChange={(e) => setSendWelcomeMsg(e.target.checked)} className="peer w-4 h-4 appearance-none rounded border-2 border-slate-300 checked:bg-emerald-500 checked:border-emerald-500 bg-white cursor-pointer" />
                          <svg className="absolute w-2.5 h-2.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700">해당 회원에게 가입 환영 알림 즉시 발송</span>
                      </label>
                      
                      <AnimatePresence>
                        {sendWelcomeMsg && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="bg-white border border-slate-200 rounded-xl p-3 mt-1 shadow-sm">
                               <div className="flex gap-2 mb-2.5">
                                  {['기본형', '친근형', '동기부여형'].map(t => (
                                    <button 
                                      key={t} 
                                      onClick={() => setMsgTemplate(t)} 
                                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-colors ${msgTemplate === t ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                                    >
                                      {t}
                                    </button>
                                  ))}
                               </div>
                               <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-600 leading-relaxed font-medium break-keep border border-slate-100">
                                  {getPreviewMsg()}
                               </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">취소</button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 text-[13px] font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 flex items-center gap-1 transition-all shadow-md">
                    복합결제로 계속 <ChevronRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="px-3 py-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg flex items-center gap-1 text-[12px] font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  <ChevronLeft size={14} /> 이전
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRemotePayment} 
                    disabled={isLoadingLink || !phone} 
                    className="px-3.5 py-2 text-[12px] font-bold text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 w-[140px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingLink ? <Loader2 size={12} className="animate-spin text-sky-500" /> : <LinkIcon size={12} className="text-sky-500" />} 
                    {isLoadingLink ? '링크 전송중...' : '비대면 결제 요청'}
                  </button>
                  <button 
                    disabled={remaining !== 0}
                    className={`px-6 py-2.5 text-[13px] font-bold text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all
                      ${remaining === 0 ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20' : 'bg-slate-300 cursor-not-allowed opacity-70'}
                    `}
                  >
                    {remaining === 0 ? <Check size={14} /> : <AlertCircle size={14} />} 
                    {remaining === 0 ? '전산 처리 완료' : '잔액을 맞춰주세요'}
                  </button>
                </div>
              </>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
