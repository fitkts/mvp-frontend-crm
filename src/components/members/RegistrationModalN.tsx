import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Activity, CreditCard, Camera, MessageSquare, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles, Plus, AlertCircle, Mail, FileText, Ban, Calendar } from 'lucide-react';
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

export default function RegistrationModalN({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);

  // === 회원 기본 정보 (M타입 베이스) ===
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

  // === 결제 및 미수금 정보 (N타입 핵심) ===
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [paymentTrainer, setPaymentTrainer] = useState('');
  
  const [basePrice, setBasePrice] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // [복합 결제 리스트]
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: '1', method: '카드', amount: '0', installment: '일시불' }
  ]);

  // [N타입 추가: 미수금 시스템]
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [isUnpaidActive, setIsUnpaidActive] = useState(false); // 미수금 활성화 여부

  // [J/L타입 자동화]
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

      setMemberName(''); setPhone(''); setGender(''); setBirthDate(''); setEmail(''); setMemo('');
      setPaymentTrainer(''); setBasePrice(0); setSessions(0); setDiscountPercent(0); setDiscountedPrice(0);
      setSplits([{ id: '1', method: '카드', amount: '0', installment: '일시불' }]);
      setUnpaidAmount(0);
      setIsUnpaidActive(false);
      setIsLoadingLink(false);

      setTimeout(() => nameRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // 가격, 할인율 변경 시 최종 결제 금액 자동 계산
  useEffect(() => {
    const finalAmount = Math.max(0, basePrice * (1 - discountPercent / 100));
    setDiscountedPrice(finalAmount);
  }, [basePrice, discountPercent]);

  // 결제 금액 합계 계산
  const totalPaid = splits.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/,/g, '') || '0', 10), 0);
  // 잔액 (미수금으로 돌릴 수 있는 잠재 금액)
  const totalDue = discountedPrice - totalPaid;

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
    else if (val === 'pt50') { p = 2000000; s = 50; } // 예시용 PT 50회
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
    const currentRemaining = discountedPrice - totalPaid - unpaidAmount;
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

  // 미수금 설정 함수
  const setUnpaidToBalance = () => {
    const balance = discountedPrice - totalPaid;
    setUnpaidAmount(balance > 0 ? balance : 0);
  };

  const handlePartialSave = () => {
    alert(`[기본정보 저장 완료]\n이름: ${memberName || '미입력'}\n연락처: ${phone || '미입력'}\n일시: ${memberDate} ${memberTime}\n\n결제 전 가망 고객 리드로 안전하게 저장되었습니다.`);
    onClose();
  };

  const handleFinalSave = () => {
    alert(`[등록 전산 처리 완료]\n회원명: ${memberName}\n상품액: ${discountedPrice.toLocaleString()}원\n실결제: ${totalPaid.toLocaleString()}원\n미수금: ${unpaidAmount.toLocaleString()}원\n결제일시: ${paymentDate} ${paymentTime}\n\n성공적으로 전산 등록되었습니다.`);
    onClose();
  };

  const handleRemotePayment = () => {
    if (!phone) return alert('연락처를 먼저 입력해주세요.');
    setIsLoadingLink(true);
    setTimeout(() => {
      setIsLoadingLink(false);
      alert(`[결제 링크 발송 성공]\n'${phone}' 번호로 PG 모바일 결제 링크가 자동 발송되었습니다.`);
    }, 1500);
  };

  const getPreviewMsg = () => {
    const name = memberName || 'OOO';
    if (msgTemplate === '기본형') return `[안내] ${name} 회원님, 등록이 완료되었습니다. 앱을 통해 일정을 관리해 보세요.`;
    if (msgTemplate === '친근형') return `안녕하세요 ${name}님! ✨ 저희 센터의 가족이 되신 걸 환영해요! 첫 수업 때 봬요! 😊`;
    return `🔥 ${name}님, 오늘부터 득근 시작! 목표 달성까지 저희가 확실히 서포트하겠습니다! 👊`;
  };

  // 최종 상태 확인용 (결제금액 + 미수금 = 총액 인지 확인)
  const isBalanced = isUnpaidActive 
    ? (totalPaid + unpaidAmount === discountedPrice)
    : (totalPaid === discountedPrice);

  const effectiveUnpaid = isUnpaidActive ? unpaidAmount : 0;

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
              신규 회원 등록 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md ml-1 inline-flex items-center gap-1"><Ban size={10}/>N타입 (M기반 + 미수금 도입)</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stepper */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>기초·상담 정보</span>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>결제 및 미수 관리</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar relative min-h-[480px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5"><User size={14} className="text-indigo-500"/><h3 className="text-xs font-bold text-slate-900">회원 정보</h3></div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                      <button className="w-16 h-16 rounded-xl bg-white flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 shrink-0 mt-1"><Camera size={18} className="mb-1"/><span className="text-[9px] font-bold">사진</span></button>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">이름 <span className="text-rose-500">*</span></label><input ref={nameRef} type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="홍길동" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label><input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></div>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">성별</label>
                            <div className="flex gap-1.5 h-[28px]">
                              <button onClick={() => setGender('M')} className={`flex-1 rounded-md text-[11px] font-bold transition-all ${gender === 'M' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>남</button>
                              <button onClick={() => setGender('F')} className={`flex-1 rounded-md text-[11px] font-bold transition-all ${gender === 'F' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>여</button>
                            </div>
                          </div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">생년월일</label><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none h-[28px]" /></div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><Mail size={10} /> 이메일</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none h-[28px] focus:ring-1 focus:ring-indigo-500" /></div>
                        </div>
                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><FileText size={10} /> 기초 메모 및 특이사항</label>
                          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="상담 시 참고할 특이사항을 기록하세요." className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none" />
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 담당자</label>
                        <select value={memberManager} onChange={(e) => setMemberManager(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                          <option value="">담당자 선택</option><option value="m1">이인호 매니저</option><option value="m2">김수영 팀장</option>
                        </select>
                      </div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">방문 경로</label>
                        <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                          <option value="">경로 선택</option><option value="walk">워크인</option><option value="sns">SNS</option><option value="ref">지인</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100/50">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><Calendar size={10}/> 상담 일자</label><input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">시간</label><input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" /></div>
                    </div>
                  </section>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                   {/* 상품 선택 및 편집 */}
                   <section className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><User size={10} /> 결제 담당자</label>
                           <select value={paymentTrainer} onChange={(e) => setPaymentTrainer(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm">
                             <option value="">담당자 선택</option><option value="t1">윤지성 수석</option><option value="t2">박서준 트레이너</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품</label>
                           <select onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm">
                             <option value="">상품 선택</option><option value="pt50">PT 50회 (가족권)</option><option value="pt20">PT 20회</option><option value="pt10">PT 10회</option>
                           </select>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><CreditCard size={10}/> 결제 일자</label><input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 시간</label><input type="time" value={paymentTime} onChange={(e) => setPaymentTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm" /></div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-500 ml-0.5">상품 가격(원)</label>
                          <input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-500 ml-0.5">회수</label>
                          <input type="number" value={sessions} onChange={(e) => setSessions(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-rose-500 ml-0.5">할인율(%)</label>
                          <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-rose-600 outline-none" />
                        </div>
                      </div>
                   </section>

                   {/* 복합 결제 및 미수금 (N타입 핵심 섹션) */}
                   <section className="bg-slate-900 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-[50px] pointer-events-none"></div>
                      
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                          <span className="text-white text-lg font-black">{discountedPrice.toLocaleString()}원</span>
                        </div>
                        <button onClick={addSplit} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 px-2.5 py-1.5 bg-emerald-500/10 rounded-lg transition-all border border-emerald-500/20"><Plus size={12}/>결제수단 추가</button>
                      </div>

                      {/* 분할 결제 항목 */}
                      <div className="space-y-2 relative z-10 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                        {splits.map((split) => (
                           <div key={split.id} className="flex items-center gap-2 group">
                             <select value={split.method} onChange={(e) => updateSplit(split.id, 'method', e.target.value as any)} className="bg-slate-800 border-none text-white text-[10px] font-bold px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none">
                                <option value="카드">카드</option><option value="현금">현금</option><option value="이체">이체</option>
                             </select>
                             <div className="flex-1 relative">
                               <input value={split.amount} onChange={(e) => updateSplit(split.id, 'amount', e.target.value)} className="w-full bg-slate-800 border-none text-white text-[13px] font-bold text-right px-3 py-2.5 rounded-xl outline-none pr-6 focus:ring-1 focus:ring-emerald-500" />
                               <span className="absolute right-2 top-3 text-[10px] text-slate-500">원</span>
                             </div>
                             {split.method === '카드' && (
                               <select value={split.installment} onChange={(e) => updateSplit(split.id, 'installment', e.target.value)} className="bg-slate-800 border-none text-white text-[10px] px-2 py-2.5 rounded-xl outline-none w-16 font-medium">
                                 <option value="일시불">일시불</option><option value="2개월">2개월</option><option value="3개월">3개월</option>
                               </select>
                             )}
                             {splits.length > 1 && <button onClick={() => removeSplit(split.id)} className="text-slate-600 hover:text-rose-400 p-1 transition-colors"><X size={16}/></button>}
                           </div>
                        ))}
                      </div>

                      {/* 미수금 활성화 토글 */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                        <span className="text-[11px] font-bold text-slate-400">결제 시 미수금이 발생하나요?</span>
                        <button 
                          onClick={() => {
                            setIsUnpaidActive(!isUnpaidActive);
                            if (isUnpaidActive) setUnpaidAmount(0);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isUnpaidActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                          {isUnpaidActive ? <Check size={12}/> : <Plus size={12}/>}
                          미수금 시스템 적용
                        </button>
                      </div>

                      {/* 미수금 입력 영역 (N타입 독점 UX) - 필요 시만 노출 */}
                      <AnimatePresence>
                        {isUnpaidActive && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="pt-2 flex flex-col gap-3 relative z-10 overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                    <AlertCircle size={14} className="text-orange-500" />
                                 </div>
                                 <span className="text-slate-300 text-[11px] font-bold italic underline decoration-orange-500/50 underline-offset-4">미수금 처리 (Unpaid)</span>
                              </div>
                              <button onClick={setUnpaidToBalance} className="text-[9px] font-bold text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-tight">[ 남은 잔액 전체 미수금으로 설정 ]</button>
                            </div>
                            
                            <div className="relative group">
                              <input 
                                type="number" 
                                value={unpaidAmount} 
                                onChange={(e) => setUnpaidAmount(Number(e.target.value))} 
                                placeholder="미수금액 입력"
                                className="w-full bg-slate-800/50 border border-slate-800 text-orange-500 text-lg font-black text-right px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all pr-10"
                              />
                              <span className="absolute right-4 top-4 text-xs font-bold text-orange-500/40">원</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 결제 현황 요약 */}
                      <div className="pt-3 flex items-center justify-between text-[11px] font-bold">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-slate-500">실 결제액</span>
                            <span className="text-emerald-400">{totalPaid.toLocaleString()}원</span>
                          </div>
                          {isUnpaidActive && (
                            <div className="flex flex-col">
                              <span className="text-slate-500">미결제액(미수)</span>
                              <span className="text-orange-500">{unpaidAmount.toLocaleString()}원</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-500">차액(Balance)</span>
                          <span className={`text-base ${(totalDue - effectiveUnpaid) === 0 ? 'text-emerald-500' : 'text-rose-500'} font-black`}>
                            {(totalDue - effectiveUnpaid).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                   </section>

                   <section className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer w-max">
                        <input type="checkbox" checked={sendWelcomeMsg} onChange={(e) => setSendWelcomeMsg(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-xs font-bold text-slate-700">등록 완료 시 회원 안내 메시지 발송</span>
                      </label>
                      <AnimatePresence>{sendWelcomeMsg && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
                           <div className="flex gap-1.5 pt-1">
                              {['기본형', '친근형', '동기부여형'].map(t => (
                                <button key={t} onClick={() => setMsgTemplate(t)} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${msgTemplate === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>{t}</button>
                              ))}
                           </div>
                           <div className="p-2.5 bg-white border border-slate-100 rounded-lg text-[10px] text-slate-500 italic leading-relaxed">{getPreviewMsg()}</div>
                        </motion.div>
                      )}</AnimatePresence>
                   </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800">취소</button>
                <div className="flex items-center gap-2">
                  <button onClick={handlePartialSave} className="px-4 py-2.5 text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 transition-all shadow-sm"><Save size={15} />기초정보 저장</button>
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 text-[13px] font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 flex items-center gap-1 shadow-md transition-all font-black">미수/결제 설정 <ChevronRight size={16} /></button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="px-3 py-2 text-slate-500 hover:text-slate-800 rounded flex items-center gap-1 text-[13px] font-bold"><ChevronLeft size={16} /> 이전</button>
                <div className="flex items-center gap-2">
                  <button onClick={handleRemotePayment} className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-all w-[140px] justify-center">{isLoadingLink ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}비대면 요청</button>
                  <button onClick={handleFinalSave} disabled={!isBalanced || discountedPrice === 0} className={`px-8 py-2.5 text-[13px] font-bold text-white rounded-xl shadow-md transition-all ${isBalanced && discountedPrice > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>전산 처리 완료</button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
