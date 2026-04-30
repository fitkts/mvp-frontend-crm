import { useState, ChangeEvent, useEffect } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock, ChevronRight, ChevronLeft, Check, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalG({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);

  // 공통 상태
  const [phone, setPhone] = useState('');
  
  // Step 1
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);

  // Step 2
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [trainer, setTrainer] = useState(''); // 중복 제거된 유일한 결제/트레이너 담당자
  
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('카드');
  const [useLocker, setUseLocker] = useState(false);
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);

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

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'pt10') setPaymentAmount('500,000');
    else if (val === 'pt20') setPaymentAmount('900,000');
    else if (val === 'gym3') setPaymentAmount('200,000');
    else setPaymentAmount('0');
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
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
              신규 회원 등록 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md ml-1">G타입 (컴팩트 위자드)</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Indicator - Compact */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>기초 정보</span>
            </div>
            <div className="text-slate-300">
              <ChevronRight size={14} />
            </div>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>결제 정보</span>
            </div>
          </div>

          {/* Body - Compact Spacing */}
          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar relative min-h-[380px]">
            <AnimatePresence mode="wait">
              {/* === STEP 1 === */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <User size={14} className="text-emerald-500"/>
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
                            <input type="text" placeholder="홍길동" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label>
                            <input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-medium" />
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

                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <ClipboardList size={14} className="text-indigo-500"/>
                      <h3 className="text-xs font-bold text-slate-900">등록 이력</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 담당자</label>
                        <select 
                          value={memberManager}
                          onChange={(e) => setMemberManager(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="">담당자 선택</option>
                          <option value="manager1">이인호 (매니저)</option>
                          <option value="manager2">김수영 (데스크)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 일자</label>
                        <input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 시간</label>
                        <input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none" />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Activity size={14} className="text-amber-500"/>
                      <h3 className="text-xs font-bold text-slate-900">특이사항</h3>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          {['체지방 감량', '근력 증가', '재활', '바디프로필'].map((goal) => {
                             const isSelected = goals.includes(goal);
                             return (
                               <button 
                                 key={goal}
                                 onClick={() => toggleGoal(goal)}
                                 className={`px-2.5 py-1 border text-[10px] font-bold rounded-md transition-all ${isSelected ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500'}`}
                               >
                                 {goal}
                               </button>
                             );
                          })}
                        </div>
                      </div>
                      <textarea 
                        rows={2} 
                        placeholder="상담 메모 및 주의사항 입력" 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none resize-none placeholder:text-slate-300"
                      />
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
                      <h3 className="text-xs font-bold text-slate-900">결제 정보</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                        {/* 중복 담당자 하나로 통합 - "결제/트레이너 담당자" */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">담당자 / 트레이너</label>
                          <select 
                            value={trainer}
                            onChange={(e) => setTrainer(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          >
                            <option value="">배정 없음</option>
                            <option value="1">윤지성 (수석)</option>
                            <option value="2">김민우 (시니어)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 일자</label>
                          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 시간</label>
                          <input type="time" value={paymentTime} onChange={(e) => setPaymentTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none" />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품 <span className="text-rose-500">*</span></label>
                          <select onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none">
                            <option value="">상품을 선택하세요</option>
                            <option value="pt10">PT 베이직 10회 (500,000원)</option>
                            <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                            <option value="gym3">헬스권 3개월 (200,000원)</option>
                          </select>
                        </div>
                        
                        {/* 컴팩트한 사물함 토글 */}
                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer transition-colors w-max">
                            <div className="relative flex items-center">
                              <input type="checkbox" checked={useLocker} onChange={(e) => setUseLocker(e.target.checked)} className="peer w-4 h-4 appearance-none rounded border-2 border-slate-300 checked:bg-indigo-500 checked:border-indigo-500 bg-white" />
                              <svg className="absolute w-2.5 h-2.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <span className="text-xs font-bold text-slate-700">개인 사물함 추가</span>
                          </label>

                          <AnimatePresence>
                            {useLocker && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 gap-3 mt-3 overflow-hidden">
                                <select className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"><option>남자탈의실 (A)</option><option>여자탈의실 (B)</option></select>
                                <input type="text" placeholder="사물함 번호" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Compact Payment Summary */}
                  <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-3 shadow-md">
                    <div className="flex items-end justify-between">
                      <span className="text-slate-400 text-[10px] font-bold">결제 수단</span>
                      <div className="flex gap-1.5">
                        {['카드', '현금', '이체'].map(method => (
                          <button key={method} onClick={() => setPaymentMethod(method)} className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${paymentMethod === method ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                      <span className="text-slate-300 text-xs font-bold">최종 결제</span>
                      <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
                        <input type="text" value={paymentAmount} onChange={handleAmountChange} className="bg-transparent text-white text-xl font-bold font-display tracking-tight w-24 text-right outline-none" />
                        <span className="text-xs text-slate-400 font-bold">원</span>
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
                <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800">취소</button>
                <button onClick={() => setStep(2)} className="px-5 py-2 text-[13px] font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1">
                  다음 단계 <ChevronRight size={14} />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded flex items-center gap-1 text-[13px] font-bold">
                    <ChevronLeft size={14} /> 이전
                  </button>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={sendWelcomeMsg} onChange={(e) => setSendWelcomeMsg(e.target.checked)} className="peer w-3.5 h-3.5 appearance-none rounded border border-slate-300 checked:bg-emerald-500" />
                      <svg className="absolute w-2 h-2 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">알림톡 발송</span>
                  </label>
                </div>
                <button className="px-6 py-2 text-[13px] font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 shadow-sm flex items-center gap-1.5">
                  <Check size={14} /> 등록 완료
                </button>
              </>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
