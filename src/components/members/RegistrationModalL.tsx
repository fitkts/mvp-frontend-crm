import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Activity, CreditCard, Camera, MessageSquare, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon, Loader2, Sparkles, Plus, AlertCircle } from 'lucide-react';
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

export default function RegistrationModalL({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);

  // === 회원 기본 정보 (J타입 스타일 유지) ===
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [birthDate, setBirthDate] = useState('');

  // === 등록 및 상담 정보 (J/H타입 결합) ===
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);
  const [interestLevel, setInterestLevel] = useState('보통'); 
  const [source, setSource] = useState(''); 

  // === 결제 및 자동화 정보 (J타입 베이스 + K타입 복합결제) ===
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [trainer, setTrainer] = useState(''); 
  const [useLocker, setUseLocker] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  
  // [K타입에서 가져온 복합 결제 리스트]
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: '1', method: '카드', amount: '0', installment: '일시불' }
  ]);

  // [J타입 자동화]
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);
  const [msgTemplate, setMsgTemplate] = useState('기본형');
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      setMemberDate(dateStr);
      setMemberTime(timeStr);
      setPaymentDate(dateStr);
      setPaymentTime(timeStr);

      // 상태 초기화
      setMemberName('');
      setPhone('');
      setGender('');
      setBirthDate('');
      setPromoCode('');
      setDiscountMessage('');
      setBasePrice(0);
      setDiscountedPrice(0);
      setSplits([{ id: '1', method: '카드', amount: '0', installment: '일시불' }]);
      setIsLoadingLink(false);

      // K타입에서 극찬받은 오토포커스 적용
      setTimeout(() => {
        nameRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // 가격 변경 시 분할 결제 금액 자동 동기화 (1건일 때)
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
    if (numbers.length > 3 && numbers.length <= 7) formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    else if (numbers.length > 7) formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    setPhone(formatted);
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

  const applyPromo = () => recalculate(basePrice, promoCode);

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

  const handlePartialSave = () => {
    alert(`[기본정보 저장 완료]\n이름: ${memberName || '미입력'}\n연락처: ${phone || '미입력'}\n\n결제 전 가망 고객 리드로 안전하게 저장되었습니다.`);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Indigo J-Type Style */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              신규 회원 등록 <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1 inline-flex items-center gap-1"><Sparkles size={10}/>L타입 (J스타일 + 복합결제)</span>
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
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>복합결제·자동화</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar relative min-h-[480px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                  {/* 회원 정보 섹션 */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5"><User size={14} className="text-indigo-500"/><h3 className="text-xs font-bold text-slate-900">회원 정보</h3></div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                      <button className="w-16 h-16 rounded-xl bg-white flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 shrink-0"><Camera size={18} className="mb-1"/><span className="text-[9px] font-bold">사진</span></button>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">이름 (자동포커스) <span className="text-rose-500">*</span></label><input ref={nameRef} type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="홍길동" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label><input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">성별</label><div className="flex gap-1.5">
                            <button onClick={() => setGender('M')} className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${gender === 'M' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>남성</button>
                            <button onClick={() => setGender('F')} className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${gender === 'F' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>여성</button>
                          </div></div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">생년월일</label><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none h-[28px]" /></div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 등록 이력 및 상담 분석 (J/H 결합형) */}
                  <section className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 담당자</label>
                          <select value={memberManager} onChange={(e) => setMemberManager(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                            <option value="">담당자 선택</option><option value="m1">이인호 매니저</option><option value="m2">김수영 팀장</option>
                          </select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 일자</label><input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">시간</label><input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100/50">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><MapPin size={10} /> 방문 경로</label>
                          <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                            <option value="">경로 선택</option><option value="walk">워크인</option><option value="sns">SNS/인스타</option><option value="ref">지인 추천</option>
                          </select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 가망도</label>
                          <div className="flex gap-1">
                            <button onClick={() => setInterestLevel('높음')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border transition-all ${interestLevel === '높음' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-400'}`}>높음</button>
                            <button onClick={() => setInterestLevel('보통')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border transition-all ${interestLevel === '보통' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}>보통</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                   {/* 상품 선택 및 할인 (J타입 형태) */}
                   <section className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품 <span className="text-rose-500">*</span></label>
                           <select onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm">
                             <option value="">상품 선택</option><option value="pt10">PT 10회 (500,000원)</option><option value="pt20">PT 20회 (900,000원)</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 ml-0.5">할인 코드 (NEW10 등)</label>
                           <div className="flex gap-1">
                             <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="코드 입력" className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 uppercase font-bold" />
                             <button onClick={applyPromo} className="px-3 py-1 bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors">적용</button>
                           </div>
                         </div>
                      </div>
                      {discountMessage && <p className="text-[10px] font-bold text-indigo-600 ml-0.5">🎉 {discountMessage}</p>}
                   </section>

                   {/* K타입 복합 결제 UI (Indigo 테마로 통합) */}
                   <section className="bg-slate-900 rounded-xl p-4 shadow-xl relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[50px] pointer-events-none"></div>
                      <div className="flex justify-between items-center mb-3 relative z-10">
                        <span className="text-white text-[11px] font-bold">복합 결제 내역 (총 {discountedPrice.toLocaleString()}원)</span>
                        <button onClick={addSplit} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 px-2 py-1 bg-indigo-500/10 rounded transition-colors"><Plus size={12}/>결제수단 추가</button>
                      </div>
                      
                      <div className="space-y-2 relative z-10 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                        {splits.map((split) => (
                           <div key={split.id} className="flex items-center gap-2">
                             <select value={split.method} onChange={(e) => updateSplit(split.id, 'method', e.target.value as any)} className="bg-slate-800 border-none text-white text-[10px] font-bold px-2 py-2 rounded focus:ring-1 focus:ring-indigo-500 outline-none">
                                <option value="카드">카드</option><option value="현금">현금</option><option value="이체">이체</option>
                             </select>
                             <div className="flex-1 relative">
                               <input value={split.amount} onChange={(e) => updateSplit(split.id, 'amount', e.target.value)} className="w-full bg-slate-800 border-none text-white text-[12px] font-bold text-right px-2 py-2 rounded outline-none pr-5 focus:ring-1 focus:ring-indigo-500" />
                               <span className="absolute right-2 top-2.5 text-[10px] text-slate-500">원</span>
                             </div>
                             {split.method === '카드' && (
                               <select value={split.installment} onChange={(e) => updateSplit(split.id, 'installment', e.target.value)} className="bg-slate-800 border-none text-white text-[10px] px-2 py-2 rounded outline-none w-16">
                                 <option value="일시불">일시불</option><option value="2개월">2개월</option><option value="3개월">3개월</option>
                               </select>
                             )}
                             {splits.length > 1 && <button onClick={() => removeSplit(split.id)} className="text-slate-600 hover:text-rose-400 transition-colors"><X size={14}/></button>}
                           </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center relative z-10">
                         <span className="text-slate-500 text-[11px] font-bold">잔액 결제:</span>
                         <span className={`text-base font-bold tracking-tight ${remaining === 0 ? 'text-indigo-400' : 'text-rose-500'}`}>{remaining.toLocaleString()}원</span>
                      </div>
                   </section>

                   {/* 자동화 메시지 (J타입 템플릿) */}
                   <section className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer w-max">
                        <input type="checkbox" checked={sendWelcomeMsg} onChange={(e) => setSendWelcomeMsg(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-xs font-bold text-slate-700">기입된 정보로 알림톡 즉시 발송</span>
                      </label>
                      <AnimatePresence>{sendWelcomeMsg && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
                           <div className="flex gap-1.5">
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

          {/* Footer - Indigo Style */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800">취소</button>
                <div className="flex items-center gap-2">
                  <button onClick={handlePartialSave} className="px-4 py-2.5 text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 transition-all shadow-sm"><Save size={15} />기초정보 저장 (리드)</button>
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 text-[13px] font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 flex items-center gap-1 shadow-md transition-all">결제로 계속 <ChevronRight size={16} /></button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="px-3 py-2 text-slate-500 hover:text-slate-800 rounded flex items-center gap-1 text-[13px] font-bold"><ChevronLeft size={16} /> 이전</button>
                <div className="flex items-center gap-2">
                  <button onClick={handleRemotePayment} className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-all w-[140px] justify-center">{isLoadingLink ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}비대면 결제요청</button>
                  <button disabled={remaining !== 0} className={`px-8 py-2.5 text-[13px] font-bold text-white rounded-xl shadow-md transition-all ${remaining === 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>전산 처리 완료</button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
