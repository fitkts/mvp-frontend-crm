import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Activity, CreditCard, Camera, MessageSquare, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles, Plus, AlertCircle, Mail, FileText, Ban, Calendar, Box } from 'lucide-react';
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

export default function RegistrationModalO({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);

  // === 회원 기본 정보 ===
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [memo, setMemo] = useState('');

  // === 등록 및 상담 정보 ===
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);
  const [interestLevel, setInterestLevel] = useState('보통'); 
  const [source, setSource] = useState(''); 

  // === 결제 및 미수금 정보 ===
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [paymentTrainer, setPaymentTrainer] = useState('');
  
  const [basePrice, setBasePrice] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // [O타입 추가: 개인사물함 배정 시스템]
  const [isLockerActive, setIsLockerActive] = useState(false);
  const [lockerNumber, setLockerNumber] = useState('');
  const [lockerAmount, setLockerAmount] = useState(0);
  const [lockerPeriod, setLockerPeriod] = useState(30); // 기본 30일
  const [lockerStartDate, setLockerStartDate] = useState('');
  const [lockerEndDate, setLockerEndDate] = useState('');

  // [복합 결제 리스트]
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: '1', method: '카드', amount: '0', installment: '일시불' }
  ]);

  // [미수금 시스템]
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [isUnpaidActive, setIsUnpaidActive] = useState(false);

  // [자동화]
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);
  const [msgTemplate, setMsgTemplate] = useState('기본형');
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      setMemberDate(dateStr); setMemberTime(timeStr);
      setPaymentDate(dateStr); setPaymentTime(timeStr);
      setLockerStartDate(dateStr);

      setMemberName(''); setPhone(''); setGender(''); setBirthDate(''); setEmail(''); setMemo('');
      setPaymentTrainer(''); setBasePrice(0); setSessions(0); setDiscountPercent(0); setDiscountedPrice(0);
      setLockerNumber(''); setLockerAmount(0); setLockerPeriod(30); setIsLockerActive(false);
      setSplits([{ id: '1', method: '카드', amount: '0', installment: '일시불' }]);
      setUnpaidAmount(0);
      setIsUnpaidActive(false);
      setIsLoadingLink(false);

      setTimeout(() => nameRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // 사물함 종료일 자동 계산
  useEffect(() => {
    if (lockerStartDate && lockerPeriod) {
      const start = new Date(lockerStartDate);
      start.setDate(start.getDate() + Number(lockerPeriod));
      setLockerEndDate(start.toISOString().split('T')[0]);
    }
  }, [lockerStartDate, lockerPeriod]);

  // 총 상품 결제 금액 자동 계산 (기본상품 + 사물함)
  useEffect(() => {
    const productFinal = Math.max(0, basePrice * (1 - discountPercent / 100));
    const total = productFinal + (isLockerActive ? lockerAmount : 0);
    setDiscountedPrice(total);
  }, [basePrice, discountPercent, lockerAmount, isLockerActive]);

  const totalPaid = splits.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/,/g, '') || '0', 10), 0);
  const totalDue = discountedPrice - totalPaid;
  const effectiveUnpaid = isUnpaidActive ? unpaidAmount : 0;
  const isBalanced = isUnpaidActive 
    ? (totalPaid + unpaidAmount === discountedPrice)
    : (totalPaid === discountedPrice);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/[^\d]/g, '');
    let formatted = numbers;
    if (numbers.length > 3 && numbers.length <= 7) formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    else if (numbers.length > 7) formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    setPhone(formatted);
  };

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let p = 0, s = 0;
    if (val === 'pt10') { p = 500000; s = 10; }
    else if (val === 'pt20') { p = 900000; s = 20; }
    else if (val === 'pt50') { p = 2000000; s = 50; }
    else if (val === 'gym3') { p = 200000; s = 90; }
    setBasePrice(p);
    setSessions(s);
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
    const currentRemaining = discountedPrice - totalPaid - effectiveUnpaid;
    const defaultAmount = currentRemaining > 0 ? currentRemaining : 0;
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

  const setUnpaidToBalance = () => {
    const balance = discountedPrice - totalPaid;
    setUnpaidAmount(balance > 0 ? balance : 0);
  };

  const handlePartialSave = () => {
    alert(`[기본정보 저장 완료]\n회원명: ${memberName}\n일시: ${memberDate} ${memberTime}\n\n임시 리드로 저장되었습니다.`);
    onClose();
  };

  const handleFinalSave = () => {
    alert(`[O타입 전산 등록 완료]\n회원명: ${memberName}\n총액: ${discountedPrice.toLocaleString()}원\n사물함: ${isLockerActive ? lockerNumber + '번' : '미사용'}\n결제일: ${paymentDate}\n미수금: ${unpaidAmount.toLocaleString()}원`);
    onClose();
  };

  const handleRemotePayment = () => {
    if (!phone) return alert('연락처를 입력해주세요.');
    setIsLoadingLink(true);
    setTimeout(() => {
      setIsLoadingLink(false);
      alert('비대면 결제 링크가 발송되었습니다.');
    }, 1500);
  };

  const getPreviewMsg = () => {
    if (msgTemplate === '기본형') return `[안내] ${memberName || '회원'}님, 등록 완료! 사물함: ${isLockerActive ? lockerNumber + '번(' + lockerEndDate + '까지)' : '사용안함'}`;
    if (msgTemplate === '친근형') return `축하해요 ${memberName || '회원'}님! 🎉 오늘부터 열혈 운동 시작해봐요! 💪`;
    return `🔥 ${memberName || '회원'}님, 목표 달성을 위해 최선을 다하겠습니다! 👊`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              신규 회원 등록 <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1 inline-flex items-center gap-1"><Sparkles size={10}/>O타입 (N+사물함 시스템)</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stepper */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-500 text-white">1</div>
              <span className="text-[11px] font-bold text-slate-800">기본 정보</span>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>상품·결제·사물함</span>
            </div>
          </div>

          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar min-h-[520px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                  <section className="space-y-4">
                    <div className="flex items-center gap-1.5"><User size={14} className="text-indigo-500"/><h3 className="text-xs font-bold text-slate-900">핵심 인적 사항</h3></div>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">성함</label><input ref={nameRef} type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="홍길동" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" /></div>
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처</label><input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" /></div>
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">상담일자</label><input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none h-8" /></div>
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">시간</label><input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none h-8" /></div>
                    </div>
                  </section>
                  <section className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">성별</label>
                      <div className="flex gap-1">
                        {['M', 'F'].map(g => (
                          <button key={g} onClick={() => setGender(g as 'M'|'F')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${gender === g ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>{g === 'M' ? '남성' : '여성'}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 가망도</label>
                      <div className="flex gap-1">
                        {['높음', '보통'].map(t => (
                          <button key={t} onClick={() => setInterestLevel(t)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${interestLevel === t ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-200'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                   {/* 사물함 배정 시스템 (O타입 추가) */}
                   <section className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200"><Box size={16}/></div>
                           <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">개인 사물함 관리</h3>
                        </div>
                        <button 
                          onClick={() => setIsLockerActive(!isLockerActive)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isLockerActive ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                        >
                          {isLockerActive ? '사물함 사용중' : '사물함 미배정'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isLockerActive && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                             <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-500 ml-0.5">사물함 번호</label>
                                   <input type="text" value={lockerNumber} onChange={e => setLockerNumber(e.target.value)} placeholder="일련번호 입력" className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-500 ml-0.5">사물함 금액(원)</label>
                                   <input type="number" value={lockerAmount} onChange={e => setLockerAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 outline-none" />
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 ml-0.5">이용 기간(일)</label>
                                  <select value={lockerPeriod} onChange={e => setLockerPeriod(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold outline-none">
                                    <option value={30}>30일 (1달)</option><option value={90}>90일 (3달)</option><option value={180}>180일 (6달)</option><option value={365}>365일 (1년)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 ml-0.5">시작 일자</label>
                                  <input type="date" value={lockerStartDate} onChange={e => setLockerStartDate(e.target.value)} className="w-full px-2 py-2 bg-white border border-indigo-100 rounded-xl text-[10px] outline-none" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-indigo-600 ml-0.5">만료 예정일</label>
                                  <div className="w-full px-2 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[10px] font-bold text-indigo-600 flex items-center justify-center">{lockerEndDate || '계산중..'}</div>
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </section>

                   {/* 메인 상품 및 결제 */}
                   <section className="bg-slate-900 rounded-2xl p-5 shadow-2xl space-y-4">
                      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] font-bold">Total Payment</span>
                          <div className="text-white text-xl font-black">{discountedPrice.toLocaleString()}원</div>
                        </div>
                        <div className="flex gap-2 mb-1">
                           <div className="text-right">
                              <div className="text-[9px] text-slate-600 font-bold">BASE + LOCKER</div>
                              <div className="text-[10px] text-slate-400">{(discountedPrice - (isLockerActive ? lockerAmount : 0)).toLocaleString()} + {isLockerActive ? lockerAmount.toLocaleString() : 0}</div>
                           </div>
                           <button onClick={addSplit} className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"><Plus size={14}/></button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[120px] overflow-y-auto no-scrollbar">
                        {splits.map(s => (
                          <div key={s.id} className="flex gap-2">
                             <select value={s.method} onChange={e => updateSplit(s.id, 'method', e.target.value as any)} className="bg-slate-800 border-none text-white text-[10px] font-bold px-3 py-2 rounded-xl outline-none">
                               <option value="카드">카드</option><option value="현금">현금</option><option value="이체">이체</option>
                             </select>
                             <input value={s.amount} onChange={e => updateSplit(s.id, 'amount', e.target.value)} className="flex-1 bg-slate-800 border-none text-white text-xs font-bold text-right px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500" />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <button 
                           onClick={() => {setIsUnpaidActive(!isUnpaidActive); if(isUnpaidActive) setUnpaidAmount(0);}}
                           className={`text-[10px] font-black px-3 py-2 rounded-xl transition-all ${isUnpaidActive ? 'bg-orange-500 text-white' : 'text-slate-500 border border-slate-800'}`}
                         >
                           미수금 등록 {isUnpaidActive ? 'ON' : 'OFF'}
                         </button>
                         {isUnpaidActive && (
                            <div className="flex-1 ml-4 relative">
                               <input type="number" value={unpaidAmount} onChange={e => setUnpaidAmount(Number(e.target.value))} className="w-full bg-slate-800 text-orange-500 text-sm font-black text-right px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-orange-500" />
                               <span className="absolute left-2 top-2 text-[10px] text-slate-600 uppercase">Unpaid</span>
                            </div>
                         )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] font-bold">
                         <span className="text-slate-500">최종 확인 잔액:</span>
                         <span className={`${(totalDue - effectiveUnpaid) === 0 ? 'text-indigo-400' : 'text-rose-500'} text-sm font-black`}>{(totalDue - effectiveUnpaid).toLocaleString()}원</span>
                      </div>
                   </section>

                   <section className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {['기본형', '친근형', '동기부여형'].map(t => (
                          <button key={t} onClick={() => setMsgTemplate(t)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${msgTemplate === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>{t}</button>
                        ))}
                      </div>
                      <div className="p-3 bg-white border border-slate-100 rounded-xl text-[10px] text-slate-500 italic leading-relaxed">{getPreviewMsg()}</div>
                   </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
             {step === 1 ? (
               <>
                 <button onClick={onClose} className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors">닫기</button>
                 <div className="flex gap-2">
                    <button onClick={handlePartialSave} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all">임시저장</button>
                    <button onClick={() => setStep(2)} className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-1">다음 단계 <ChevronRight size={14}/></button>
                 </div>
               </>
             ) : (
               <>
                 <button onClick={() => setStep(1)} className="text-slate-400 text-xs font-bold hover:text-slate-600 flex items-center gap-1">이전</button>
                 <div className="flex gap-2">
                    <button onClick={handleRemotePayment} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">링크발송</button>
                    <button disabled={!isBalanced || discountedPrice === 0} onClick={handleFinalSave} className={`px-8 py-2.5 text-xs font-black rounded-xl transition-all shadow-xl ${isBalanced && discountedPrice > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>데이터 전산 등록 완료</button>
                 </div>
               </>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
