import { useState, FormEvent } from 'react';
import { X, Package, Tag, CreditCard, CalendarDays, Activity, Sparkles, Info, DollarSign, Clock, UserCheck, ShieldCheck, Map, Box, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
}

const CATEGORIES = [
  { id: 'PT', label: '1:1 PT', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'MEMBERSHIP', label: '회원권', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'PILATES', label: '필라테스', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'LOCKER', label: '사물함', icon: Box, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'ETC', label: '기타', icon: Tag, color: 'text-slate-600', bg: 'bg-slate-50' },
];

export default function ProductRegistrationModal({ isOpen, onClose, onAdd }: ProductRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'PT',
    price: '',
    sessionCnt: '',
    isUnlimited: false,
    validDays: '',
    description: '',
    isActive: true,
    // 커스텀 필드
    ptDuration: '50',
    ptLevel: 'Senior',
    membershipAccess: ['Gym'],
    lockerSection: 'A',
    lockerSize: 'Standard'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      price: Number(formData.price),
      sessionCnt: Number(formData.sessionCnt),
      validDays: Number(formData.validDays),
    });
    onClose();
    // Reset form
    setFormData({
      name: '',
      category: 'PT',
      price: '',
      sessionCnt: '',
      isUnlimited: false,
      validDays: '',
      description: '',
      isActive: true,
      ptDuration: '50',
      ptLevel: 'Senior',
      membershipAccess: ['Gym'],
      lockerSection: 'A',
      lockerSize: 'Standard'
    });
  };

  const toggleAccess = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      membershipAccess: prev.membershipAccess.includes(facility)
        ? prev.membershipAccess.filter(f => f !== facility)
        : [...prev.membershipAccess, facility]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-[540px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* 헤더 */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Package size={24} />
              </div>
              새 상품 등록
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">센터에서 판매할 새로운 수강권 또는 회원권을 설정합니다.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white hover:shadow-md rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* 카테고리 선택 (비주얼) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 mb-2">
              <Tag size={18} className="text-emerald-600" />
              <span className="text-sm font-bold uppercase tracking-wider">카테고리 선택</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    formData.category === cat.id
                      ? `border-emerald-500 ${cat.bg} shadow-md shadow-emerald-50`
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                    <cat.icon size={20} />
                  </div>
                  <span className={`text-[11px] font-bold ${formData.category === cat.id ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 기본 정보 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Info size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">기본 정보</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">상품명</label>
              <input
                required
                type="text"
                placeholder="예: PT 베이직 10회"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">상품 설명</label>
              <textarea
                rows={2}
                placeholder="상품에 대한 상세 설명을 입력하세요..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* 카테고리별 커스텀 필드 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={formData.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-6"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles size={18} className="text-emerald-600" />
                <span className="text-sm font-bold uppercase tracking-wider">커스텀 옵션</span>
              </div>

              {formData.category === 'PT' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                      <Clock size={12} /> 수업 시간 (분)
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                      value={formData.ptDuration}
                      onChange={(e) => setFormData({ ...formData, ptDuration: e.target.value })}
                    >
                      <option value="30">30분</option>
                      <option value="50">50분</option>
                      <option value="60">60분</option>
                      <option value="80">80분</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                      <ShieldCheck size={12} /> 트레이너 등급
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                      value={formData.ptLevel}
                      onChange={(e) => setFormData({ ...formData, ptLevel: e.target.value })}
                    >
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Master">Master</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.category === 'MEMBERSHIP' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                    <Map size={12} /> 이용 가능 시설
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Gym', 'Yoga', 'Pilates', 'Sauna', 'Lounge'].map((facility) => (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleAccess(facility)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          formData.membershipAccess.includes(facility)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                        }`}
                      >
                        {facility}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.category === 'LOCKER' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                      <Box size={12} /> 사물함 구역
                    </label>
                    <input
                      type="text"
                      placeholder="예: A구역"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                      value={formData.lockerSection}
                      onChange={(e) => setFormData({ ...formData, lockerSection: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                      <Dumbbell size={12} /> 사물함 크기
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                      value={formData.lockerSize}
                      onChange={(e) => setFormData({ ...formData, lockerSize: e.target.value })}
                    >
                      <option value="Small">Small</option>
                      <option value="Standard">Standard</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.category === 'PILATES' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                    <Activity size={12} /> 클래스 유형
                  </label>
                  <div className="flex gap-3">
                    {['1:1 개인', '2:1 듀엣', '6:1 그룹'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-purple-300 transition-all"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.category === 'ETC' && (
                <p className="text-xs text-slate-400 font-medium italic">기타 상품은 기본 정보만 설정합니다.</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 판매 및 조건 섹션 */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <DollarSign size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">판매 및 이용 조건</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">판매 가격 (원)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    placeholder="0"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">원</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700">제공 횟수</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.isUnlimited}
                      onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked, sessionCnt: e.target.checked ? '-1' : '' })}
                    />
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${formData.isUnlimited ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                      {formData.isUnlimited && <Sparkles size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${formData.isUnlimited ? 'text-emerald-600' : 'text-slate-400'}`}>무제한</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    disabled={formData.isUnlimited}
                    required={!formData.isUnlimited}
                    type="number"
                    placeholder={formData.isUnlimited ? "무제한" : "0"}
                    className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold ${formData.isUnlimited ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100' : 'text-slate-900'}`}
                    value={formData.isUnlimited ? '' : formData.sessionCnt}
                    onChange={(e) => setFormData({ ...formData, sessionCnt: e.target.value })}
                  />
                  {!formData.isUnlimited && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">회</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">유효 기간 (일)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    placeholder="90"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    value={formData.validDays}
                    onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">일</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">판매 상태</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    판매 중
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!formData.isActive ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    판매 중지
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* 푸터 */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-2 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <Package size={20} />
            상품 등록 완료
          </button>
        </div>
      </motion.div>
    </div>
  );
}
