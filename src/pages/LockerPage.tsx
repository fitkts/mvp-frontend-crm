import { useState, FormEvent, useRef, useEffect, ChangeEvent } from 'react';
import { Box, Search, Filter, User, Calendar, Settings, CheckCircle2, AlertCircle, X, Save, Clock, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../lib/productData';

const MOCK_MEMBERS = [
  { id: 'm1', name: '강민준', phone: '010-1111-2222', recentPurchase: { productId: 6, expireDate: '2026-07-15' } },
  { id: 'm2', name: '박서연', phone: '010-3333-4444', recentPurchase: { productId: 6, expireDate: '2026-11-20' } },
  { id: 'm3', name: '이도현', phone: '010-5555-6666', recentPurchase: null },
  { id: 'm4', name: '김지우', phone: '010-7777-8888', recentPurchase: { productId: 6, expireDate: '2026-08-30' } },
];

interface LockerHistoryItem {
  id: number;
  date: string;
  type: 'ASSIGN' | 'MAINTENANCE' | 'SYSTEM' | 'MEMO';
  desc: string;
}

// 사물함 상태 타입
type LockerStatus = 'AVAILABLE' | 'IN_USE' | 'EXPIRED' | 'MAINTENANCE';

interface Locker {
  id: string;
  status: LockerStatus;
  memberName?: string;
  startDate?: string;
  expireDate?: string;
  productId?: number;
  paymentStatus?: 'PAID' | 'UNPAID';
  paymentMethod?: 'CARD' | 'TRANSFER' | 'CASH';
  memo?: string;
  history?: LockerHistoryItem[];
}

// 날짜 계산 헬퍼
function calculateExpireDate(startDate: string, addDays: number) {
  if (!startDate) return '';
  const d = new Date(startDate);
  d.setDate(d.getDate() + addDays);
  return d.toISOString().split('T')[0];
}

const todayString = new Date().toISOString().split('T')[0];

// 초기 10개의 사물함 데이터 (A구역)
const INITIAL_LOCKERS: Locker[] = Array.from({ length: 30 }, (_, i) => {
  const id = `A-${String(i + 1).padStart(2, '0')}`;
  if (i === 0) return { id, status: 'IN_USE', memberName: '강민준', startDate: '2026-04-15', expireDate: '2026-07-15', productId: 6, history: [{ id: 1, date: '2026-04-15', type: 'ASSIGN', desc: '[강민준] 배정 - 개인 사물함 3개월 (결제완료)' }] };
  if (i === 1) return { id, status: 'IN_USE', memberName: '박서연', startDate: '2026-02-20', expireDate: '2026-05-20', productId: 6, history: [{ id: 2, date: '2026-02-20', type: 'ASSIGN', desc: '[박서연] 배정 - 개인 사물함 3개월 (결제완료)' }] };
  if (i === 4) return { id, status: 'EXPIRED', memberName: '이도현', startDate: '2026-01-10', expireDate: '2026-04-10', productId: 6, history: [{ id: 3, date: '2026-04-10', type: 'SYSTEM', desc: '[이도현] 이용 기간 만료' }, { id: 4, date: '2026-01-10', type: 'ASSIGN', desc: '[이도현] 배정 - 개인 사물함 3개월 (결제완료)' }] };
  if (i === 9) return { id, status: 'MAINTENANCE', memo: '경첩 수리 필요', history: [{ id: 5, date: '2026-04-18', type: 'MAINTENANCE', desc: '경첩 고장으로 수리 접수' }] };
  return { id, status: 'AVAILABLE', history: [{ id: 7, date: '2025-01-01', type: 'SYSTEM', desc: '사물함 생성' }] };
});

const STATUS_CONFIG = {
  AVAILABLE: { label: '사용 가능', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'focus:ring-emerald-500/20' },
  IN_USE: { label: '사용 중', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'focus:ring-blue-500/20' },
  EXPIRED: { label: '기간 만료', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', ring: 'focus:ring-rose-500/20' },
  MAINTENANCE: { label: '수리 중', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', ring: 'focus:ring-slate-500/20' },
};

export default function LockerPage() {
  const [lockers, setLockers] = useState<Locker[]>(INITIAL_LOCKERS);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<LockerStatus | 'ALL'>('ALL');
  const [gridCols, setGridCols] = useState(5);
  const [gridRows, setGridRows] = useState(6);
  const [totalLockers, setTotalLockers] = useState(30);
  const [numberingDirection, setNumberingDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isZoneSettingModalOpen, setIsZoneSettingModalOpen] = useState(false);
  const [tempCols, setTempCols] = useState(5);
  const [tempRows, setTempRows] = useState(6);
  const [tempTotal, setTempTotal] = useState(30);
  const [tempDirection, setTempDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [currentPage, setCurrentPage] = useState(1);

  // 드로어(사이드 패널) 폼 상태
  const [formData, setFormData] = useState<Partial<Locker>>({});
  
  // 콤보박스 관련 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredMembers = MOCK_MEMBERS.filter(m => m.name.includes(searchKeyword));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMemberSelect = (member: typeof MOCK_MEMBERS[0]) => {
    setFormData(prev => ({ 
      ...prev, 
      memberName: member.name,
      productId: member.recentPurchase?.productId || prev.productId,
      expireDate: member.recentPurchase?.expireDate || prev.expireDate
    }));
    setSearchKeyword(member.name);
    setShowDropdown(false);
  };

  const filteredLockers = lockers.filter(locker => filter === 'ALL' || locker.status === filter);
  
  const itemsPerPage = gridCols * gridRows;
  const totalPages = Math.ceil(filteredLockers.length / itemsPerPage);
  const currentLockers = filteredLockers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: lockers.length,
    inUse: lockers.filter(l => l.status === 'IN_USE').length,
    available: lockers.filter(l => l.status === 'AVAILABLE').length,
    expired: lockers.filter(l => l.status === 'EXPIRED').length,
  };

  const handleLockerClick = (locker: Locker) => {
    setSelectedLocker(locker);
    // If no startDate assigned, set relative to today
    setFormData({ 
      ...locker, 
      startDate: locker.startDate || todayString 
    });
    setSearchKeyword(locker.memberName || '');
    setIsModalOpen(true);
  };

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newPid = Number(e.target.value);
    let newExpire = formData.expireDate;
    if (newPid && formData.startDate) {
      const p = MOCK_PRODUCTS.find(p => p.id === newPid);
      if (p && p.validDays) {
        newExpire = calculateExpireDate(formData.startDate, p.validDays);
      }
    }
    setFormData({ ...formData, productId: newPid, expireDate: newExpire || '' });
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    let newExpire = formData.expireDate;
    if (formData.productId) {
      const p = MOCK_PRODUCTS.find(p => p.id === formData.productId);
      if (p && p.validDays) {
        newExpire = calculateExpireDate(newStart, p.validDays);
      }
    }
    setFormData({ ...formData, startDate: newStart, expireDate: newExpire || '' });
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLocker) return;

    let newHistory = [...(formData.history || [])];

    if (formData.status === 'IN_USE' && formData.productId && selectedLocker.status !== 'IN_USE') {
      const p = MOCK_PRODUCTS.find(p => p.id === formData.productId);
      const isPaid = formData.paymentStatus === 'PAID' || !formData.paymentStatus;
      
      newHistory.unshift({
        id: Date.now(),
        date: todayString,
        type: 'ASSIGN',
        desc: `[${formData.memberName}] 배정 - ${p?.name} (${isPaid ? '결제완료' : '미수'})`
      });
    } else if (formData.status === 'MAINTENANCE' && selectedLocker.status !== 'MAINTENANCE') {
      newHistory.unshift({
        id: Date.now(),
        date: todayString,
        type: 'MAINTENANCE',
        desc: '점검 상태로 변경'
      });
    } else if (formData.status === 'AVAILABLE' && selectedLocker.status !== 'AVAILABLE') {
      newHistory.unshift({
        id: Date.now(),
        date: todayString,
        type: 'SYSTEM',
        desc: '사용 가능 상태로 변경 (초기화)'
      });
    }
    
    if (formData.memo !== selectedLocker.memo && formData.memo) {
      newHistory.unshift({
        id: Date.now() + 1,
        date: todayString,
        type: 'MEMO',
        desc: `메모: ${formData.memo}`
      });
    }

    const finalData = { ...formData, history: newHistory };

    setLockers(prev => prev.map(l => 
      l.id === selectedLocker.id ? { ...l, ...finalData } as Locker : l
    ));
    setIsModalOpen(false);
  };

  const openZoneSettingModal = () => {
    setTempCols(gridCols);
    setTempRows(gridRows);
    setTempTotal(totalLockers);
    setTempDirection(numberingDirection);
    setIsZoneSettingModalOpen(true);
  };

  const handleZoneSettingSave = (e: FormEvent) => {
    e.preventDefault();
    const totalNeeded = tempTotal;
    setGridCols(tempCols);
    setGridRows(tempRows);
    setTotalLockers(tempTotal);
    setNumberingDirection(tempDirection);
    
    setLockers(prev => {
        let current = [...prev];
        if (totalNeeded > current.length) {
            const newLockers = Array.from({length: totalNeeded - current.length}, (_, i) => {
                const idNum = current.length + i + 1;
                const id = `A-${String(idNum).padStart(2, '0')}`;
                return { id, status: 'AVAILABLE' as LockerStatus };
            });
            return [...current, ...newLockers];
        } else if (totalNeeded < current.length) {
            return current.slice(0, totalNeeded);
        }
        return current;
    });
    
    setIsZoneSettingModalOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 상단 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Box className="text-emerald-600" size={32} />
            사물함 관리
          </h1>
          <p className="text-slate-500 mt-1 font-medium">회원들의 개인 사물함을 배정하고 관리합니다.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['ALL', 'AVAILABLE', 'IN_USE', 'EXPIRED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'ALL' ? '전체' : STATUS_CONFIG[f as LockerStatus].label}
              </button>
            ))}
          </div>
          <button onClick={openZoneSettingModal} className="neo-button flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 shrink-0">
            <Settings size={20} />
            구역 설정
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '전체 사물함', value: stats.total, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: '사용 중', value: stats.inUse, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '사용 가능', value: stats.available, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '기간 만료', value: stats.expired, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <Box size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 사물함 그리드 */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            A 구역
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-slate-400">총 {filteredLockers.length}개</div>
          </div>
        </div>

        <div 
          className="grid gap-3 sm:gap-4 md:gap-6"
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: numberingDirection === 'vertical' ? `repeat(${gridRows}, minmax(0, 1fr))` : undefined,
            gridAutoFlow: numberingDirection === 'vertical' ? 'column' : 'row'
          }}
        >
          <AnimatePresence mode="popLayout">
            {currentLockers.map((locker, i) => {
              const config = STATUS_CONFIG[locker.status];
              return (
                <motion.div
                  layout
                  key={locker.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => handleLockerClick(locker)}
                  className={`aspect-square rounded-2xl border-2 p-4 flex flex-col relative cursor-pointer transition-all hover:shadow-lg group ${config.bg} ${config.border}`}
                >
                  {/* 사물함 통풍구 디자인 디테일 */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-20">
                    <div className="w-6 h-0.5 bg-slate-900 rounded-full" />
                    <div className="w-6 h-0.5 bg-slate-900 rounded-full" />
                    <div className="w-6 h-0.5 bg-slate-900 rounded-full" />
                  </div>

                  <div className="flex justify-between items-start mb-auto">
                    <span className={`text-xl md:text-2xl font-display font-black ${config.color}`}>
                      {locker.id}
                    </span>
                  </div>

                  {locker.status === 'IN_USE' && (
                    <div className="mt-auto space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                        <User size={14} className="text-blue-500" />
                        {locker.memberName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <Calendar size={12} />
                        ~{locker.expireDate}
                      </div>
                    </div>
                  )}

                  {locker.status === 'EXPIRED' && (
                    <div className="mt-auto space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                        <User size={14} className="text-rose-500" />
                        {locker.memberName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                        <AlertCircle size={12} />
                        만료됨 ({locker.expireDate})
                      </div>
                    </div>
                  )}

                  {locker.status === 'AVAILABLE' && (
                    <div className="mt-auto flex items-center justify-center p-2 md:h-10 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-center">배정</span>
                    </div>
                  )}

                  {locker.status === 'MAINTENANCE' && (
                    <div className="mt-auto flex items-center gap-1.5 text-sm font-bold text-slate-500">
                      <Settings size={14} />
                      수리 중
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-100 transition-all"
            >
              이전
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-100 transition-all"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 구역 설정 모달 */}
      <AnimatePresence>
        {isZoneSettingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoneSettingModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 bg-white w-full max-w-[400px] rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="text-emerald-600" size={20} />
                  구역 설정
                </h2>
                <button 
                  onClick={() => setIsZoneSettingModalOpen(false)}
                  className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleZoneSettingSave} className="flex flex-col">
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">총 사물함 개수</label>
                    <input 
                      type="number"
                      min={1}
                      max={1000}
                      value={tempTotal}
                      onChange={(e) => setTempTotal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">가로 배열 (열)</label>
                    <input 
                      type="number"
                      min={1}
                      max={20}
                      value={tempCols}
                      onChange={(e) => setTempCols(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">세로 배열 (행)</label>
                    <input 
                      type="number"
                      min={1}
                      max={20}
                      value={tempRows}
                      onChange={(e) => setTempRows(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">사번 부여 방향</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setTempDirection('horizontal')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                          tempDirection === 'horizontal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        가로 방향 (→)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempDirection('vertical')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                          tempDirection === 'vertical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        세로 방향 (↓)
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-800 flex gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>한 페이지에 최대 <strong>{tempCols * tempRows}</strong>개의 사물함이 표시됩니다.</p>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsZoneSettingModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    확인
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 사물함 커스텀/배정 모달 (Modal) */}
      <AnimatePresence>
        {isModalOpen && selectedLocker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 백그라운드 오버레이 (클릭 시 닫힘) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* 모달 본체 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 bg-white w-full max-w-[540px] max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-[32px]">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                    <Box className="text-emerald-600" size={20} />
                    사물함 {selectedLocker.id} 상세
                  </h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                  
                  {/* 상태 설정 영역 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      현재 상태
                    </h3>
                    <div className="space-y-2">
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as LockerStatus })}
                      >
                        <option value="AVAILABLE">사용 가능</option>
                        <option value="IN_USE">사용 중 (배정)</option>
                        <option value="EXPIRED">기간 만료</option>
                        <option value="MAINTENANCE">수리 중</option>
                      </select>
                    </div>

                    <AnimatePresence mode="wait">
                      {(formData.status === 'IN_USE' || formData.status === 'EXPIRED') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 overflow-visible"
                        >
                          <div className="space-y-2 pt-2 relative" ref={dropdownRef}>
                            <label className="text-sm font-bold text-slate-700 ml-1">배정 회원 (스마트 검색)</label>
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                required
                                type="text"
                                placeholder="회원 이름 검색..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                value={searchKeyword}
                                onChange={(e) => {
                                  setSearchKeyword(e.target.value);
                                  setFormData({ ...formData, memberName: e.target.value });
                                  setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                              />
                            </div>
                            
                            {/* 자동완성 드롭다운 메뉴 */}
                            <AnimatePresence>
                              {showDropdown && searchKeyword && filteredMembers.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col"
                                >
                                  {filteredMembers.map((member) => (
                                    <button
                                      key={member.id}
                                      type="button"
                                      onClick={() => handleMemberSelect(member)}
                                      className="flex flex-col text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                      <span className="font-bold text-slate-800">{member.name}</span>
                                      <span className="text-xs text-slate-500">{member.phone}</span>
                                      {member.recentPurchase && (
                                        <span className="text-xs font-medium text-emerald-600 mt-1">
                                          최근 결제 내역 확인됨 (자동 입력)
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">연동 상품</label>
                            <select
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
                              value={formData.productId || ''}
                              onChange={handleProductChange}
                            >
                              <option value="">상품 선택 안함</option>
                              {MOCK_PRODUCTS.filter(p => p.category === 'LOCKER').map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()}원)</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 ml-1">시작일</label>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  required
                                  type="date"
                                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
                                  value={formData.startDate || ''}
                                  onChange={handleStartDateChange}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 ml-1">만료일 (자동계산)</label>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  readOnly
                                  type="date"
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-500 cursor-not-allowed"
                                  value={formData.expireDate || ''}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 결제 연동 섹션 */}
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <CreditCard size={16} className="text-slate-400" />
                              상품 결제 연동
                            </h4>
                            {formData.productId ? (() => {
                              const p = MOCK_PRODUCTS.find(p => p.id === formData.productId);
                              return (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700">결제 대상 금액</span>
                                    <span className="text-lg font-black text-slate-900">{p?.price.toLocaleString()}원</span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">결제 상태</label>
                                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                      <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentStatus: 'PAID' })}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                          formData.paymentStatus === 'PAID' || !formData.paymentStatus ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                      >
                                        결제 완료
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentStatus: 'UNPAID' })}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                          formData.paymentStatus === 'UNPAID' ? 'bg-rose-50 text-rose-600 shadow-sm border border-rose-100' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                      >
                                        미수 취급
                                      </button>
                                    </div>
                                  </div>

                                  {(formData.paymentStatus === 'PAID' || !formData.paymentStatus) && (
                                    <div className="space-y-2 pt-2">
                                      <label className="text-sm font-bold text-slate-700 ml-1">결제 수단</label>
                                      <select
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
                                        value={formData.paymentMethod || 'CARD'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                      >
                                        <option value="CARD">신용카드</option>
                                        <option value="TRANSFER">계좌이체</option>
                                        <option value="CASH">현금</option>
                                      </select>
                                    </div>
                                  )}
                                  
                                  <div className="text-xs text-slate-400 mt-2 bg-white/50 p-2 rounded-lg text-center leading-relaxed font-medium">
                                    💡 저장 시 '회원 관리' 데이터의 결제 내역(PAYMENT LOG)으로 이관됩니다.
                                  </div>
                                </div>
                              );
                            })() : (
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500 font-medium text-center">
                                연동할 사물함 상품을 선택하면 결제 정보가 표시됩니다.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 메모 섹션 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <AlertCircle size={16} className="text-slate-400" />
                        사물함 메모
                      </h3>
                      <span className="text-xs font-medium text-slate-400">
                        {(formData.memo || '').length} / 100
                      </span>
                    </div>
                    <textarea
                      maxLength={100}
                      placeholder="고장 내역, 특이사항 등을 기록하세요. (최대 100자)"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700 resize-none h-24"
                      value={formData.memo || ''}
                      onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    />
                  </div>

                  <hr className="border-slate-100" />

                  {/* 타임라인 섹션 */}
                  <div className="space-y-6 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Clock size={18} className="text-slate-400" />
                      이력 현황
                    </h3>
                    
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      {(formData.history || []).map((item) => (
                        <div key={item.id} className="relative">
                          <div className={`absolute -left-6 w-[10px] h-[10px] rounded-full top-1.5 border-2 border-white ring-1 ring-slate-200 ${
                            item.type === 'ASSIGN' ? 'bg-blue-500' : 
                            item.type === 'MAINTENANCE' ? 'bg-amber-500' :
                            item.type === 'MEMO' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400">{item.date}</span>
                            <span className="text-sm font-medium text-slate-700 mt-0.5">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0 rounded-b-[32px]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
