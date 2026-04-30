import { useState, ChangeEvent, useEffect } from 'react';
import { X, User, Activity, CreditCard, Camera, Key, MessageSquare, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalE({ isOpen, onClose }: Props) {
  const [phone, setPhone] = useState('');
  const [useLocker, setUseLocker] = useState(false);
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);

  // E타입 추가 상태: 등록일시, 결제금액
  const [regDate, setRegDate] = useState('');
  const [regTime, setRegTime] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0');

  // 모달이 열릴 때 현재 날짜와 시간으로 초기화
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setRegDate(`${year}-${month}-${day}`);

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setRegTime(`${hours}:${minutes}`);
    }
  }, [isOpen]);

  // 연락처 자동 하이픈 및 숫자만 입력 허용
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/[^\d]/g, ''); // 숫자 이외의 문자 제거
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
          className="bg-white rounded-[24px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900">신규 회원 등록 (E타입 - 실무 최적화)</h2>
              <p className="text-xs text-slate-500 mt-1">D타입 기능에 더해 등록 일시 조정 및 직접 결제 금액 수정이 가능한 버전입니다.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body - 2 Columns */}
          <div className="overflow-y-auto p-6 bg-slate-50/50 flex-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6 h-full">
              
              {/* Left Column: Basic Info & Goals */}
              <div className="space-y-6">
                
                {/* Section 1: Basic Info */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <User size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">기본 정보</h3>
                  </div>
                  <div className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <button className="w-16 h-16 rounded-full bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors border-2 border-dashed border-slate-200 shrink-0 group">
                      <Camera size={16} className="mb-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold">사진 등록</span>
                    </button>
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">이름 <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="홍길동" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">연락처 <span className="text-rose-500">*</span></label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={handlePhoneChange}
                          maxLength={13}
                          placeholder="010-0000-0000" 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" 
                        />
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">성별</label>
                          <div className="flex gap-2">
                            <button className="flex-1 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm border border-slate-900">남성</button>
                            <button className="flex-1 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-100">여성</button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">생년월일</label>
                          <input type="date" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Goals */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-600">
                      <Activity size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">운동 목표 및 특이사항</h3>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">주요 목표</label>
                      <div className="flex flex-wrap gap-1.5">
                         {['체지방 감량', '근력 증가', '체력 증진', '자세 교정', '바디프로필'].map((goal, i) => (
                           <button key={goal} className={`px-2.5 py-1.5 border text-[11px] font-bold rounded-lg transition-colors ${i === 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                             {goal}
                           </button>
                         ))}
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">관리자 메모</label>
                      <textarea 
                        rows={2} 
                        placeholder="병력, 특이사항이나 트레이너가 인지해야 할 내용을 기록하세요." 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Membership, Locker & Payment */}
              <div className="space-y-6">
                
                {/* Section 3: Membership */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                        <CreditCard size={14} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">수강권 설정</h3>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    
                    {/* [AI Idea] Registration Date & Time Settings */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1 flex items-center gap-1">
                          <CalendarClock size={12} /> 등록 일자
                        </label>
                        <input 
                          type="date" 
                          value={regDate} 
                          onChange={(e) => setRegDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">등록 시간</label>
                        <input 
                          type="time" 
                          value={regTime} 
                          onChange={(e) => setRegTime(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">등록 상품 선택 <span className="text-rose-500">*</span></label>
                      <select 
                        onChange={handleProductChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-700 font-medium"
                      >
                        <option value="">상품을 선택하세요</option>
                        <option value="pt10">PT 베이직 10회 (500,000원)</option>
                        <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                        <option value="gym3">헬스권 3개월 (200,000원)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">담당 트레이너 배정</label>
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-700">
                        <option value="">배정 없음 (추후 배정)</option>
                        <option value="1">윤지성 (수석)</option>
                        <option value="2">김민우 (시니어)</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Section 4: Locker (Requested addition) */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Key size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">부가 서비스</h3>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={useLocker}
                          onChange={(e) => setUseLocker(e.target.checked)}
                          className="peer w-5 h-5 appearance-none rounded-md border-2 border-slate-300 checked:bg-emerald-500 checked:border-emerald-500 transition-colors" 
                        />
                        <svg className="absolute w-3 h-3 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-slate-700">개인 사물함 이용하기</span>
                    </label>

                    {useLocker && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">사물함 구역</label>
                          <select className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500">
                            <option>남자탈의실 (A구역)</option>
                            <option>여자탈의실 (B구역)</option>
                            <option>복도 (C구역)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">사물함 번호</label>
                          <input type="text" placeholder="예: A-12" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </section>

                {/* Info summary */}
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-md">
                   <div className="flex flex-col">
                     <span className="text-slate-400 text-[11px] font-bold mb-1">최종 결제 금액</span>
                     <div className="flex items-center border-b border-slate-700 pb-0.5">
                       {/* Editable Payment Amount Input */}
                       <input 
                         type="text" 
                         value={paymentAmount}
                         onChange={handleAmountChange}
                         className="bg-transparent text-white text-xl font-bold font-display tracking-tight w-28 focus:outline-none"
                       />
                       <span className="text-sm text-slate-400 font-medium ml-1">원</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className="text-slate-400 text-[11px] font-bold inline-block mb-1">결제 수단</span>
                     <div className="flex gap-1.5">
                        <button className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-md">카드</button>
                        <button className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-md hover:text-white transition-colors">현금</button>
                        <button className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-md hover:text-white transition-colors">이체</button>
                     </div>
                   </div>
                </div>

              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={sendWelcomeMsg}
                  onChange={(e) => setSendWelcomeMsg(e.target.checked)}
                  className="peer w-4 h-4 appearance-none rounded border border-slate-300 checked:bg-emerald-500 checked:border-emerald-500 transition-colors" 
                />
                <svg className="absolute w-2.5 h-2.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <MessageSquare size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <span className="text-[11px] font-bold text-slate-600">등록 완료 시 회원에게 알림톡 발송</span>
            </label>

            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button 
                className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors"
              >
                등록 완료
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
