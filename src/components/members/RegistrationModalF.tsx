import { useState, ChangeEvent, useEffect } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock, ChevronRight, ChevronLeft, Check, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalF({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1); // 1: 기본 정보, 2: 결제 정보

  // 공통 상태
  const [phone, setPhone] = useState('');
  
  // Step 1: 기본 정보 관련 상태
  const [memberDate, setMemberDate] = useState('');
  const [memberTime, setMemberTime] = useState('');
  const [memberManager, setMemberManager] = useState(''); // 등록 담당자
  const [goals, setGoals] = useState<string[]>(['체지방 감량']); // 기본 선택

  // Step 2: 결제/상품 정보 관련 상태
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');
  const [paymentManager, setPaymentManager] = useState(''); // 결제 담당자
  
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('카드');
  const [useLocker, setUseLocker] = useState(false);
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setStep(1); // 스텝 초기화
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      // 기본 정보용 일시 초기화
      setMemberDate(dateStr);
      setMemberTime(timeStr);
      
      // 결제 정보용 일시 초기화
      setPaymentDate(dateStr);
      setPaymentTime(timeStr);
    }
  }, [isOpen]);

  // 연락처 자동 하이픈 및 숫자만 입력 허용
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

  // 결제 금액 콤마 포맷팅 핸들러
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) {
      setPaymentAmount('0');
      return;
    }
    setPaymentAmount(parseInt(numbers, 10).toLocaleString());
  };

  // 상품 선택 시 금액 자동 변경
  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'pt10') setPaymentAmount('500,000');
    else if (val === 'pt20') setPaymentAmount('900,000');
    else if (val === 'gym3') setPaymentAmount('200,000');
    else setPaymentAmount('0');
  };

  // 목표 토글 핸들러
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
          className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                신규 회원 등록 <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-1">F타입 (위자드 폼)</span>
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex gap-4 shrink-0">
            <div className={`flex items-center gap-2 flex-1 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className={`text-sm font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>기초 정보</span>
            </div>
            <div className="flex items-center text-slate-300">
              <ChevronRight size={16} />
            </div>
            <div className={`flex items-center gap-2 flex-1 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className={`text-sm font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>상품 · 결제</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 bg-white flex-1 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {/* === STEP 1: 기본 정보 === */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><User size={16} className="text-emerald-500"/> 개인 정보</h3>
                    </div>
                    <div className="flex items-start gap-5 p-5 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/50">
                      <button className="w-[84px] h-[84px] rounded-full bg-white flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors border-2 border-dashed border-slate-200 shrink-0 group">
                        <Camera size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">사진 등록</span>
                      </button>
                      
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 ml-1">이름 <span className="text-rose-500">*</span></label>
                          <input type="text" placeholder="홍길동" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 ml-1">연락처 <span className="text-rose-500">*</span></label>
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={handlePhoneChange}
                            maxLength={13}
                            placeholder="010-0000-0000" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 ml-1">성별</label>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm border border-slate-900">남성</button>
                            <button className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50">여성</button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 ml-1">생년월일</label>
                          <input type="date" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-600 h-[38px]" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Step 1: 등록 정보 내역 */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><ClipboardList size={16} className="text-indigo-500"/> 최초 등록 내역</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/50">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">등록 담당자</label>
                        <select 
                          value={memberManager}
                          onChange={(e) => setMemberManager(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">담당자 선택</option>
                          <option value="manager1">이인호 (매니저)</option>
                          <option value="manager2">김수영 (데스크)</option>
                          <option value="manager3">최민철 (대표)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                          <CalendarClock size={12} /> 등록 일자
                        </label>
                        <input 
                          type="date" 
                          value={memberDate} 
                          onChange={(e) => setMemberDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 font-medium" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">등록 시간</label>
                        <input 
                          type="time" 
                          value={memberTime} 
                          onChange={(e) => setMemberTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 font-medium" 
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Activity size={16} className="text-amber-500"/> 특이사항</h3>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/50 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">주요 목표 복수 선택</label>
                        <div className="flex flex-wrap gap-2">
                          {['체지방 감량', '근력 증가', '체력 증진', '자세 교정', '바디프로필'].map((goal) => {
                             const isSelected = goals.includes(goal);
                             return (
                               <button 
                                 key={goal}
                                 onClick={() => toggleGoal(goal)}
                                 className={`px-3 py-2 border text-xs font-bold rounded-xl transition-all ${isSelected ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                               >
                                 {goal}
                               </button>
                             );
                          })}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">상담 메모</label>
                        <textarea 
                          rows={3} 
                          placeholder="병력, 특이사항이나 트레이너가 인지해야 할 내용을 기록하세요." 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* === STEP 2: 결제 정보 === */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><CreditCard size={16} className="text-blue-500"/> 결제 정보 이력</h3>
                    </div>
                    {/* Step 2: 결제 정보 내역 */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-5 rounded-2xl border border-blue-50 shadow-sm bg-blue-50/30">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">결제 담당자</label>
                        <select 
                          value={paymentManager}
                          onChange={(e) => setPaymentManager(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">담당자 선택</option>
                          <option value="manager1">이인호 (매니저)</option>
                          <option value="manager2">김수영 (데스크)</option>
                          <option value="manager3">최민철 (대표)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                          <CalendarClock size={12} /> 결제 일자
                        </label>
                        <input 
                          type="date" 
                          value={paymentDate} 
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-700 font-medium" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">결제 시간</label>
                        <input 
                          type="time" 
                          value={paymentTime} 
                          onChange={(e) => setPaymentTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-700 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-5 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/50">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">등록 상품 선택 <span className="text-rose-500">*</span></label>
                        <select 
                          onChange={handleProductChange}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 font-bold"
                        >
                          <option value="">상품을 선택하세요</option>
                          <option value="pt10">PT 베이직 10회 (500,000원)</option>
                          <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                          <option value="gym3">헬스권 3개월 (200,000원)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">담당 트레이너 배정 (수업권일 경우)</label>
                        <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-700">
                          <option value="">배정 없음 (추후 배정 가능)</option>
                          <option value="1">윤지성 (수석)</option>
                          <option value="2">김민우 (시니어)</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Locker (Requested addition) */}
                  <section>
                    <div className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/50">
                      <label className="flex items-center gap-3 p-1 cursor-pointer transition-colors">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={useLocker}
                            onChange={(e) => setUseLocker(e.target.checked)}
                            className="peer w-5 h-5 appearance-none rounded-md border-2 border-slate-300 checked:bg-indigo-500 checked:border-indigo-500 transition-colors bg-white" 
                          />
                          <svg className="absolute w-3 h-3 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Key size={14} className="text-indigo-500"/> 개인 사물함 배정하기</span>
                      </label>

                      <AnimatePresence>
                        {useLocker && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                            animate={{ height: 'auto', opacity: 1, marginTop: 12 }} 
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="grid grid-cols-2 gap-4 overflow-hidden"
                          >
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 ml-1">사물함 구역</label>
                              <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500">
                                <option>남자탈의실 (A구역)</option>
                                <option>여자탈의실 (B구역)</option>
                                <option>복도 (C구역)</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 ml-1">사물함 번호</label>
                              <input type="text" placeholder="예: A-12" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* Payment Info */}
                  <div className="bg-slate-900 rounded-3xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div>
                      <span className="text-slate-400 text-xs font-bold inline-block mb-2">결제 수단</span>
                      <div className="flex gap-2">
                        {['카드', '현금', '이체'].map(method => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              paymentMethod === method 
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 focus:bg-slate-700'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-slate-400 text-xs font-bold mb-1.5 block">최종 결제 금액</span>
                      <div className="flex items-center gap-2">
                        {/* Editable Payment Amount Input */}
                        <div className="flex-1 bg-slate-800/80 rounded-2xl flex items-center px-4 py-3 border border-slate-700 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                          <input 
                            type="text" 
                            value={paymentAmount}
                            onChange={handleAmountChange}
                            className="bg-transparent text-white text-3xl font-bold font-display tracking-tight w-full focus:outline-none text-right placeholder-slate-600"
                            placeholder="0"
                          />
                        </div>
                        <span className="text-lg text-slate-400 font-bold px-2">원</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  다음으로 <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors rounded-lg flex items-center gap-1 text-sm font-bold"
                  >
                    <ChevronLeft size={16} /> 이전
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={sendWelcomeMsg}
                        onChange={(e) => setSendWelcomeMsg(e.target.checked)}
                        className="peer w-4 h-4 appearance-none rounded border border-slate-300 checked:bg-emerald-500 checked:border-emerald-500 transition-colors bg-white" 
                      />
                      <svg className="absolute w-2.5 h-2.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <MessageSquare size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[11px] font-bold text-slate-600">안내 알림톡 즉시 발송</span>
                  </label>
                </div>
                <button 
                  className="px-8 py-3 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check size={16} />
                  등록 완료
                </button>
              </>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
