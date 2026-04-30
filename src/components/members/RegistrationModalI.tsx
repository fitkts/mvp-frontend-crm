import { useState, ChangeEvent, useEffect } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalI({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);

  // 공통 상태
  const [phone, setPhone] = useState('');
  
  // Step 1: 기초 정보
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);

  // CRM/세일즈 특화 (H타입 아이디어 추가)
  const [interestLevel, setInterestLevel] = useState('보통'); 
  const [source, setSource] = useState(''); 

  // Step 2: 결제 정보
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [trainer, setTrainer] = useState(''); // 결제 담당자 (단일화)
  
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

  const handlePartialSave = () => {
    alert(`[가등록 완료]\n연락처: ${phone || '미입력'}\n\n결제를 진행하지 않고 '상담(리드) 고객'으로 기초 정보만 안전하게 저장되었습니다.`);
    onClose();
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
              신규 회원 등록 <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-md ml-1">I타입 (G타입 UI + CRM 세일즈)</span>
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
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>기초·상담 정보</span>
            </div>
            <div className="text-slate-300">
              <ChevronRight size={14} />
            </div>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
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
                  className="space-y-4"
                >
                  {/* 1. 회원 정보 (G타입 유지) */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={14} className="text-violet-500"/>
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
                            <input type="text" placeholder="홍길동" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label>
                            <input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-none font-medium" />
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

                  {/* 2. 등록 이력 (G타입 유지) */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ClipboardList size={14} className="text-violet-500"/>
                      <h3 className="text-xs font-bold text-slate-900">등록 이력</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 담당자</label>
                        <select 
                          value={memberManager}
                          onChange={(e) => setMemberManager(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500"
                        >
                          <option value="">담당자 선택</option>
                          <option value="manager1">이인호 (매니저)</option>
                          <option value="manager2">김수영 (데스크)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 일자</label>
                        <input type="date" value={memberDate} onChange={(e) => setMemberDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 시간</label>
                        <input type="time" value={memberTime} onChange={(e) => setMemberTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
                      </div>
                    </div>
                  </section>

                  {/* 3. 상담 및 유입 분석 (H타입 아이디어 추가) */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Flame size={14} className="text-orange-500"/>
                        <h3 className="text-xs font-bold text-slate-900">상담·유입 관리 <span className="text-[9px] font-medium text-orange-600 bg-orange-50 border border-orange-100 px-1 rounded ml-0.5">CRM</span></h3>
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
                          <option value="flyer">전단지</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 관심도 (가망도)</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => setInterestLevel('높음')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '높음' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}><Flame size={10}/> 높음</button>
                          <button onClick={() => setInterestLevel('보통')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '보통' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}><Star size={10}/> 보통</button>
                          <button onClick={() => setInterestLevel('낮음')} className={`flex-1 py-1.5 rounded-[6px] text-[10px] font-bold border transition-colors flex items-center justify-center gap-0.5 ${interestLevel === '낮음' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}><Cloud size={10}/> 낮음</button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 4. 특이사항 (G타입 유지) */}
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Activity size={14} className="text-emerald-500"/>
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
                                 className={`px-2.5 py-1 border text-[10px] font-bold rounded-md transition-all ${isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500 resize-none placeholder:text-slate-300"
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
                        {/* 단일화 결제/트레이너 담당자 (G타입 유지) */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">담당자 / 트레이너</label>
                          <select 
                            value={trainer}
                            onChange={(e) => setTrainer(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500"
                          >
                            <option value="">배정 없음</option>
                            <option value="1">윤지성 (수석)</option>
                            <option value="2">김민우 (시니어)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 일자</label>
                          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">결제 시간</label>
                          <input type="time" value={paymentTime} onChange={(e) => setPaymentTime(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품 <span className="text-rose-500">*</span></label>
                          <select onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:border-violet-500">
                            <option value="">상품을 선택하세요</option>
                            <option value="pt10">PT 베이직 10회 (500,000원)</option>
                            <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                            <option value="gym3">헬스권 3개월 (200,000원)</option>
                          </select>
                        </div>
                        
                        {/* 컴팩트 사물함 토글 (G타입 유지) */}
                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer transition-colors w-max">
                            <div className="relative flex items-center">
                              <input type="checkbox" checked={useLocker} onChange={(e) => setUseLocker(e.target.checked)} className="peer w-4 h-4 appearance-none rounded border-2 border-slate-300 checked:bg-violet-500 checked:border-violet-500 bg-white" />
                              <svg className="absolute w-2.5 h-2.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <span className="text-xs font-bold text-slate-700">개인 사물함 추가</span>
                          </label>

                          <AnimatePresence>
                            {useLocker && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 gap-3 mt-3 overflow-hidden">
                                <select className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500"><option>남자탈의실 (A)</option><option>여자탈의실 (B)</option></select>
                                <input type="text" placeholder="사물함 번호" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Compact Payment Summary (G타입 유지) */}
                  <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-3 shadow-md relative overflow-hidden">
                    <div className="absolute -left-6 -top-6 w-32 h-32 bg-violet-600/20 blur-[40px] rounded-full pointer-events-none"></div>
                    <div className="flex items-end justify-between relative z-10">
                      <span className="text-slate-400 text-[10px] font-bold">결제 수단</span>
                      <div className="flex gap-1.5">
                        {['카드', '현금', '이체'].map(method => (
                          <button key={method} onClick={() => setPaymentMethod(method)} className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${paymentMethod === method ? 'bg-violet-500 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 relative z-10">
                      <span className="text-slate-300 text-xs font-bold">최종 결제</span>
                      <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-600 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
                        <input type="text" value={paymentAmount} onChange={handleAmountChange} className="bg-transparent text-white text-xl font-bold font-display tracking-tight w-24 text-right outline-none" />
                        <span className="text-xs text-slate-400 font-bold">원</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation (H타입 아이디어 연동) */}
          <div className="px-5 py-3 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800">취소</button>
                <div className="flex items-center gap-2">
                  <button onClick={handlePartialSave} className="px-3.5 py-2 text-[12px] font-bold text-violet-600 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 flex items-center gap-1.5 transition-colors">
                    <Save size={14} /> 가등록 저장 (CRM)
                  </button>
                  <button onClick={() => setStep(2)} className="px-5 py-2 text-[13px] font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-all shadow-sm">
                    결제로 계속 <ChevronRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded flex items-center gap-1 text-[13px] font-bold">
                    <ChevronLeft size={14} /> 이전
                  </button>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={sendWelcomeMsg} onChange={(e) => setSendWelcomeMsg(e.target.checked)} className="peer w-3.5 h-3.5 appearance-none rounded border border-slate-300 checked:bg-violet-500" />
                      <svg className="absolute w-2 h-2 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">알림톡 발송</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => alert('입력된 연락처로 비대면 모바일 결제(PG) 링크가 발송되었습니다.')} className="px-3.5 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                    <LinkIcon size={14} /> 비대면 요청
                  </button>
                  <button className="px-6 py-2 text-[13px] font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 shadow-sm flex items-center gap-1.5 transition-colors">
                    <Check size={14} /> 등록 완료
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
