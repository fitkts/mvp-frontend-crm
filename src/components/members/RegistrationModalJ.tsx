import { useState, ChangeEvent, useEffect } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalJ({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);

  // 공통 상태
  const [phone, setPhone] = useState('');
  const [memberName, setMemberName] = useState('');
  
  // Step 1: 기초 정보
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);

  // CRM/세일즈 특화
  const [interestLevel, setInterestLevel] = useState('보통'); 
  const [source, setSource] = useState(''); 

  // Step 2: 결제 & 자동화 정보
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [trainer, setTrainer] = useState(''); 
  
  // [J타입] 결제 관련 상태
  const [basePrice, setBasePrice] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('카드');
  const [installment, setInstallment] = useState('일시불');
  
  // [J타입] 프로모션 할인 상태
  const [promoCode, setPromoCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');

  const [useLocker, setUseLocker] = useState(false);
  
  // [J타입] 알림톡 자동화 상태
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);
  const [msgTemplate, setMsgTemplate] = useState('기본형');

  // [J타입] 비대면 링크 발송 로딩
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

      // Reset specific J-type states
      setPromoCode('');
      setDiscountMessage('');
      setInstallment('일시불');
      setBasePrice(0);
      setPaymentAmount('0');
      setIsLoadingLink(false);
    }
  }, [isOpen]);

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
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) {
      setPaymentAmount('0');
      return;
    }
    setPaymentAmount(parseInt(numbers, 10).toLocaleString());
  };

  // [J타입] 상품 선택 로직
  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let price = 0;
    if (val === 'pt10') price = 500000;
    else if (val === 'pt20') price = 900000;
    else if (val === 'gym3') price = 200000;
    
    setBasePrice(price);
    recalculate(price, promoCode);
  };

  // [J타입] 할인코드 적용 로직
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
    setPaymentAmount(final.toLocaleString());
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handlePartialSave = () => {
    alert(`[가등록 완료]\n이름: ${memberName || '미입력'}\n연락처: ${phone || '미입력'}\n\n'상담(리드) 고객'으로 기초 정보가 저장되었습니다.`);
    onClose();
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
    // API 호출 시뮬레이션
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
          {/* Header - Compact */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              신규 회원 등록 <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1 inline-flex items-center gap-1"><Sparkles size={10}/>J타입 (결제·자동화 패키지)</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>기초·상담 정보</span>
            </div>
            <div className="text-slate-300">
              <ChevronRight size={14} />
            </div>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>결제·자동화 처리</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar relative min-h-[460px]">
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
                  {/* 1. 회원 정보 */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={14} className="text-indigo-500"/>
                      <h3 className="text-xs font-bold text-slate-900">회원 정보</h3>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <button className="w-16 h-16 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors border border-dashed border-slate-200 shrink-0 group">
                        <Camera size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold">사진</span>
                      </button>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">이름 <span className="text-rose-500">*</span></label>
                            <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="홍길동" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label>
                            <input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-medium" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">성별</label>
                            <div className="flex gap-1.5">
                              <button className="flex-1 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-md">남성</button>
                              <button className="flex-1 py-1.5 bg-white text-slate-600 border border-slate-200 text-[11px] font-bold rounded-md">여성</button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">생년월일</label>
                            <input type="date" className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none h-[28px] text-slate-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. 등록 이력 */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ClipboardList size={14} className="text-indigo-500"/>
                      <h3 className="text-xs font-bold text-slate-900">등록 이력</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 담당자</label>
                        <select 
                          value={memberManager}
                          onChange={(e) => setMemberManager(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">담당자 선택</option>
                          <option value="manager1">이인호 (매니저)</option>
                          <option value="manager2">김수영 (데스크)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 일자</label>
                        <input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 시간</label>
                        <input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </section>

                  {/* 3. CRM 세일즈 (H타입 유지) */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Flame size={14} className="text-orange-500"/>
                        <h3 className="text-xs font-bold text-slate-900">상담·유입 관리</h3>
                      </div>
                    </div>
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
                          <option value="search">네이버 검색 / 지도</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 관심도</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => setInterestLevel('높음')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '높음' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-400'}`}><Flame size={10}/> 높음</button>
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
                      <CreditCard size={14} className="text-blue-500"/>
                      <h3 className="text-xs font-bold text-slate-900">상품 결제</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제/담당 배정</label>
                          <select value={trainer} onChange={(e) => setTrainer(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500">
                            <option value="">배정 없음 (추후정 가능)</option>
                            <option value="1">윤지성 (수석)</option>
                            <option value="2">김민우 (시니어)</option>
                          </select>
                        </div>
                        <div className="col-span-2 flex gap-2">
                           <div className="flex-1 space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 일자</label>
                             <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                           </div>
                           <div className="flex-1 space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 시간</label>
                             <input type="time" value={paymentTime} onChange={(e) => setPaymentTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                           </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품 <span className="text-rose-500">*</span></label>
                          <select onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:border-indigo-500">
                            <option value="">상품을 선택하세요</option>
                            <option value="pt10">PT 베이직 10회 (500,000원)</option>
                            <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                            <option value="gym3">헬스권 3개월 (200,000원)</option>
                          </select>
                        </div>

                        {/* [J타입 추가] 자동 할인 / 프로모션 옵션 */}
                        <div className="pt-2 border-t border-slate-100">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">할인 / 프로모션 코드 입력</label>
                          <div className="flex gap-1.5 mt-1">
                            <input 
                              type="text" 
                              value={promoCode} 
                              onChange={(e) => setPromoCode(e.target.value)} 
                              placeholder="NEW10, FRIEND5 등" 
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 uppercase font-bold text-slate-700" 
                            />
                            <button onClick={applyPromo} className="px-4 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm">적용</button>
                          </div>
                          {discountMessage && (
                            <p className={`text-[10px] font-bold mt-1.5 ml-0.5 ${discountMessage.includes('유효') ? 'text-rose-500' : 'text-indigo-600'}`}>
                              {discountMessage.includes('유효') ? '' : '🎉 '} {discountMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* [J타입 추가] 알림톡 템플릿 설정 */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <MessageSquare size={14} className="text-emerald-500"/>
                      <h3 className="text-xs font-bold text-slate-900">자동화 메시지 발송</h3>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer transition-colors w-max">
                        <div className="relative flex items-center">
                          <input type="checkbox" checked={sendWelcomeMsg} onChange={(e) => setSendWelcomeMsg(e.target.checked)} className="peer w-4 h-4 appearance-none rounded border-2 border-slate-300 checked:bg-emerald-500 checked:border-emerald-500 bg-white" />
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

                  {/* Payment Summary */}
                  <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-3 shadow-md relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full pointer-events-none"></div>
                    <div className="flex flex-col gap-2 relative z-10 w-full mb-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-slate-400 text-[10px] font-bold">결제 수단</span>
                        <div className="flex gap-1.5">
                          {['카드', '현금', '이체'].map(method => (
                            <button key={method} onClick={() => setPaymentMethod(method)} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${paymentMethod === method ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* [J타입 추가] 카드 할부 옵션 */}
                      <AnimatePresence>
                        {paymentMethod === '카드' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center justify-between overflow-hidden">
                             <span className="text-slate-500 text-[10px] font-bold">할부 선택</span>
                             <div className="flex gap-1">
                                {['일시불', '2개월', '3개월 (무이자)'].map(inst => (
                                   <button 
                                     key={inst} 
                                     onClick={() => setInstallment(inst)} 
                                     className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${installment === inst ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}
                                   >
                                     {inst}
                                   </button>
                                ))}
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 relative z-10">
                      <span className="text-slate-300 text-xs font-bold">최종 결제 금액</span>
                      <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-600 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                        <input type="text" value={paymentAmount} onChange={handleAmountChange} className="bg-transparent text-white text-xl font-bold font-display tracking-tight w-24 text-right outline-none" />
                        <span className="text-xs text-slate-400 font-bold ml-1">원</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="px-5 py-3 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">취소</button>
                <div className="flex items-center gap-2">
                  <button onClick={handlePartialSave} className="px-3.5 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                    <Save size={14} /> 기초정보 임시저장
                  </button>
                  <button onClick={() => setStep(2)} className="px-5 py-2 text-[13px] font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-all shadow-sm">
                    상품 / 결제하기 <ChevronRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg flex items-center gap-1 text-[13px] font-bold hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={14} /> 이전
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {/* [J타입] 비대면 모바일 결제 자동 발송 액션 */}
                  <button 
                    onClick={handleRemotePayment} 
                    disabled={isLoadingLink || !phone} 
                    className="px-3.5 py-2 text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 w-[140px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingLink ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />} 
                    {isLoadingLink ? '링크 전송중...' : '비대면 결제 요청'}
                  </button>
                  <button className="px-6 py-2 text-[13px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all">
                    <Check size={14} /> 전산 처리 완료
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
