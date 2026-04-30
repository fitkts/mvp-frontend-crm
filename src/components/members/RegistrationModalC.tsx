import { X, User, Phone, Mail, Calendar, CreditCard, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModalC({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4"
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
              <h2 className="text-xl font-bold text-slate-900">신규 회원 등록 (C타입)</h2>
              <p className="text-xs text-slate-500 mt-1">좌우 분할 레이아웃으로 스크롤 없이 한눈에 입력할 수 있는 폼입니다.</p>
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
                  <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">이름 <span className="text-rose-500">*</span></label>
                      <input type="text" placeholder="홍길동" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">연락처 <span className="text-rose-500">*</span></label>
                      <input type="tel" placeholder="010-0000-0000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">성별</label>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl">남성</button>
                          <button className="flex-1 py-2 bg-slate-50 text-slate-600 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-100">여성</button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">생년월일</label>
                        <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
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
                         {['체지방 감량', '근력 증가', '체력 증진', '자세 교정', '재활', '바디프로필'].map(goal => (
                           <button key={goal} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                             {goal}
                           </button>
                         ))}
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">관리자 메모</label>
                      <textarea 
                        rows={3} 
                        placeholder="특이사항이나 트레이너가 인지해야 할 내용을 기록하세요." 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Membership & Payment */}
              <div className="space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                      <CreditCard size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">수강권 및 담당자 설정</h3>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">등록 상품 선택 <span className="text-rose-500">*</span></label>
                      <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-700">
                        <option value="">상품을 선택하세요</option>
                        <option value="pt10">PT 베이직 10회 (500,000원)</option>
                        <option value="pt20">PT 프리미엄 20회 (900,000원)</option>
                        <option value="gym3">헬스권 3개월 (200,000원)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">담당 트레이너 배정</label>
                      <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-700">
                        <option value="">배정 없음 (추후 배정)</option>
                        <option value="1">윤지성 (수석)</option>
                        <option value="2">김민우 (시니어)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">결제 수단</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">카드결제</button>
                        <button className="py-2 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-100">계좌이체</button>
                        <button className="py-2 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-100">현금</button>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 ml-1">최종 결제 금액</label>
                      <div className="relative">
                        <input type="text" placeholder="0" className="w-full pl-3 pr-10 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-right font-display text-xl font-bold text-emerald-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-14" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-600">원</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button 
              className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                등록 완료
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
