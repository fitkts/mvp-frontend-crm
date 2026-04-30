import { useState, ChangeEvent, useEffect } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Flame, Star, Cloud, MapPin, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalH({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);

  // 공통 상태
  const [phone, setPhone] = useState('');
  
  // Step 1: 기본 정보 & CRM 상담 정보
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); 
  const [goals, setGoals] = useState<string[]>(['체지방 감량']);
  
  // === H타입 아이디어 추가 기능 (CRM 특화) ===
  const [interestLevel, setInterestLevel] = useState('보통'); // 관심도(가망도)
  const [source, setSource] = useState(''); // 방문 경로

  // Step 2: 결제 정보
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [trainer, setTrainer] = useState('');
  
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
    // 실제 저장 로직 연동 구간
    alert(`[가등록 완료]\n이름: 입력됨\n연락처: ${phone}\n\n결제를 진행하지 않고 '상담(리드) 고객'으로 기초 정보만 저장되었습니다.`);
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
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              신규 회원 등록 <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md ml-1">H타입 (CRM 세일즈 특화)</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>기초·상담 정보</span>
            </div>
            <div className="text-slate-300">
              <ChevronRight size={14} />
            </div>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>상품·결제</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 bg-white flex-1 custom-scrollbar relative min-h-[420px]">
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
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={14} className="text-rose-500"/>
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
                            <input type="text" placeholder="홍길동" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-0.5">연락처 <span className="text-rose-500">*</span></label>
                            <input type="tel" value={phone} onChange={handlePhoneChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 outline-none font-medium" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 세일즈/CRM 아이디어 섹션 */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Flame size={14} className="text-orange-500"/>
                        <h3 className="text-xs font-bold text-slate-900">상담 및 유입 분석 <span className="text-[9px] font-medium text-orange-500 bg-orange-50 px-1 rounded ml-1">세일즈 특화</span></h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><MapPin size={10} /> 방문 경로</label>
                        <select 
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-orange-500"
                        >
                          <option value="">경로 선택</option>
                          <option value="walk_in">지나가다 방문 (워크인)</option>
                          <option value="referral">지인 추천</option>
                          <option value="instagram">인스타그램 / SNS</option>
                          <option value="search">네이버 검색 / 지도</option>
                          <option value="flyer">전단지 / 현수막</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담 관심도 (구매망)</label>
                        <div className="flex gap-1">
                          <button onClick={() => setInterestLevel('높음')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 ${interestLevel === '높음' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}><Flame size={12}/> 높음</button>
                          <button onClick={() => setInterestLevel('보통')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 ${interestLevel === '보통' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400'}`}><Star size={12}/> 보통</button>
                          <button onClick={() => setInterestLevel('낮음')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 ${interestLevel === '낮음' ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}><Cloud size={12}/> 낮음</button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-0.5">상담/등록 담당자</label>
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
                      <div className="col-span-3 mt-1">
                        <textarea 
                          rows={2} 
                          placeholder="회원의 운동 목적이나 특이사항, 오늘 상담 내용을 간략히 적어주세요." 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none resize-none placeholder:text-slate-300"
                        />
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
                      <h3 className="text-xs font-bold text-slate-900">결제 정보</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">담당자 / 트레이너 배정</label>
                          <select value={trainer} onChange={(e) => setTrainer(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none">
                            <option value="">배정 없음 (추후배정)</option>
                            <option value="1">윤지성 (수석)</option>
                            <option value="2">김민우 (시니어)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5 flex items-center gap-1"><CalendarClock size={10} /> 결제 일시 지정</label>
                          <div className="flex gap-1.5">
                            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-3/5 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none" />
                            <input type="time" value={paymentTime} onChange={(e) => setPaymentTime(e.target.value)} className="w-2/5 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-100 shadow-sm bg-slate-50/30 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 ml-0.5">등록 상품 <span className="text-rose-500">*</span></label>
                          <select onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:border-rose-500">
                            <option value="">상품을 선택하세요</option>
                            <option value="pt10">PT 베이직 10회 (500,000원)</option>
                            <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                            <option value="gym3">헬스권 3개월 (200,000원)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Payment Summary */}
                  <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-3 shadow-md relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/20 blur-2xl rounded-full pointer-events-none"></div>
                    <div className="flex items-end justify-between relative z-10">
                      <span className="text-slate-400 text-[10px] font-bold">결제 수단</span>
                      <div className="flex gap-1.5">
                        {['카드', '현금', '이체'].map(method => (
                          <button key={method} onClick={() => setPaymentMethod(method)} className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${paymentMethod === method ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 relative z-10">
                      <span className="text-slate-300 text-xs font-bold">최종 결제</span>
                      <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-600 focus-within:border-rose-400 transition-colors">
                        <input type="text" value={paymentAmount} onChange={handleAmountChange} className="bg-transparent text-white text-xl font-bold font-display tracking-tight w-24 text-right outline-none placeholder-slate-600" placeholder="0" />
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
                <div className="flex items-center gap-2">
                  <button onClick={onClose} className="px-3 py-2 text-[12px] font-bold text-slate-400 hover:text-slate-600">취소</button>
                </div>
                <div className="flex items-center gap-2">
                  {/* H타입 핵심: 결제 안하고 바로 상담용 저장 */}
                  <button onClick={handlePartialSave} className="px-3.5 py-2 text-[12px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 transition-colors">
                    <Save size={14} /> 기본정보만 임시저장
                  </button>
                  <button onClick={() => setStep(2)} className="px-4 py-2 text-[12px] font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors">
                    결제로 계속 <ChevronRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="p-1 text-slate-400 hover:text-slate-700 rounded flex items-center gap-1 text-[12px] font-bold">
                    <ChevronLeft size={14} /> 이전
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {/* H타입 추가: 비대면 결제 링크 발송 */}
                  <button onClick={() => alert('입력된 연락처로 비대면 모바일 결제(PG) 링크가 발송되었습니다.')} className="px-3 py-2 text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 flex items-center gap-1.5 transition-colors">
                    <LinkIcon size={14} /> 비대면 결제요청
                  </button>
                  <button className="px-5 py-2 text-[13px] font-bold text-white bg-rose-500 rounded-lg hover:bg-rose-600 shadow-sm flex items-center gap-1.5 transition-colors">
                    <Check size={14} /> 등록 및 수납완료
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
