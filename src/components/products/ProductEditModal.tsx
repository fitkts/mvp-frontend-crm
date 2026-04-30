import { useState, FormEvent, useEffect } from 'react';
import { X, Package, Tag, CreditCard, Activity, Sparkles, Info, DollarSign, Clock, UserCheck, ShieldCheck, Map, Box, Dumbbell, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CATEGORIES } from '../../lib/productData';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (product: Product) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  PT: UserCheck,
  MEMBERSHIP: CreditCard,
  PILATES: Activity,
  LOCKER: Box,
  ETC: Tag,
};

export default function ProductEditModal({ isOpen, onClose, product, onUpdate, onDelete }: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdate(formData as Product);
    onClose();
  };

  const handleDelete = () => {
    // window.confirm은 특정 환경에서 작동하지 않을 수 있어 즉시 삭제로 변경하거나 로직 보완
    onDelete(product.id);
    onClose();
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
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Package size={24} />
              </div>
              상품 정보 수정
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">등록된 상품의 정보를 변경하거나 삭제할 수 있습니다.</p>
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 mb-2">
              <Tag size={18} className="text-blue-600" />
              <span className="text-sm font-bold uppercase tracking-wider">카테고리</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id as any })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      formData.category === cat.id
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.category === cat.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      {Icon && <Icon size={20} />}
                    </div>
                    <span className={`text-[11px] font-bold ${formData.category === cat.id ? 'text-blue-700' : 'text-slate-500'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Info size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">상세 정보</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">상품명</label>
              <input
                required
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">가격 (원)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-900"
                    value={formData.price ?? ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">원</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">상태</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${formData.isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    판매중
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!formData.isActive ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    판매중지
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700">제공 횟수</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.sessionCnt === -1}
                      onChange={(e) => setFormData({ ...formData, sessionCnt: e.target.checked ? -1 : 0 })}
                    />
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${formData.sessionCnt === -1 ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
                      {formData.sessionCnt === -1 && <Sparkles size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${formData.sessionCnt === -1 ? 'text-blue-600' : 'text-slate-400'}`}>무제한</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    disabled={formData.sessionCnt === -1}
                    required={formData.sessionCnt !== -1}
                    type="number"
                    placeholder={formData.sessionCnt === -1 ? "무제한" : "0"}
                    className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold ${formData.sessionCnt === -1 ? 'text-blue-600 bg-blue-50/50 border-blue-100' : 'text-slate-900'}`}
                    value={formData.sessionCnt === -1 ? '' : (formData.sessionCnt ?? '')}
                    onChange={(e) => setFormData({ ...formData, sessionCnt: Number(e.target.value) })}
                  />
                  {formData.sessionCnt !== -1 && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">회</span>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">유효 기간 (일)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-900"
                    value={formData.validDays ?? ''}
                    onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">일</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* 푸터 */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-rose-100 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition-all"
          >
            <Trash2 size={20} />
            삭제
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            수정 완료
          </button>
        </div>
      </motion.div>
    </div>
  );
}
