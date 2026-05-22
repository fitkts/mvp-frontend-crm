import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Phone, Activity, Target, CreditCard, CalendarDays, MoreHorizontal, Dumbbell, User, UserCircle, Pencil, FileText, ChevronRight, ChevronDown, AlertCircle, Box, Trash2, SlidersHorizontal, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RegistrationModalP from '../components/members/RegistrationModalP';
import { Member } from '../store';
import { useMembers, useMember, useUpdateMember, useCreateMember, useDeleteMember } from '../api/queries/useMembers';
import { useStaffList } from '../api/queries/useStaff';
import { Loader2 } from 'lucide-react';

interface ColumnConfig {
  id: string;
  label: string;
  defaultWidth: number;
  minWidth: number;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { id: 'info', label: '회원 정보', defaultWidth: 220, minWidth: 150 },
  { id: 'phone', label: '연락처', defaultWidth: 140, minWidth: 100 },
  { id: 'regDate', label: '등록일', defaultWidth: 120, minWidth: 90 },
  { id: 'pass', label: '수강권', defaultWidth: 260, minWidth: 80 },
  { id: 'attendance', label: '출석률', defaultWidth: 130, minWidth: 80 },
  { id: 'status', label: '상태', defaultWidth: 100, minWidth: 80 },
];

const LOCAL_STORAGE_KEYS = {
  VISIBLE_COLUMNS: 'crm_members_visible_columns',
  COLUMN_WIDTHS: 'crm_members_column_widths',
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 정상 이용
        </span>
      );
    case 'STOP':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase">
          일시 정지
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">
          기간 만료
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 uppercase">
          {status}
        </span>
      );
  }
};

export default function MembersPage() {
  const { data: membersResponse, isLoading, isError } = useMembers();
  const members: Member[] = membersResponse?.data || [];
  const updateMemberMutation = useUpdateMember();
  const createMemberMutation = useCreateMember();
  const deleteMemberMutation = useDeleteMember();
  const { data: staffResponse } = useStaffList();
  const staff = staffResponse?.data || [];
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Column Customization and Resizing States
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VISIBLE_COLUMNS);
      return saved ? JSON.parse(saved) : ALL_COLUMNS.map(c => c.id);
    } catch {
      return ALL_COLUMNS.map(c => c.id);
    }
  });

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.COLUMN_WIDTHS);
      if (saved) {
        return {
          ...ALL_COLUMNS.reduce((acc, c) => ({ ...acc, [c.id]: c.defaultWidth }), {}),
          ...JSON.parse(saved)
        };
      }
    } catch { }
    return ALL_COLUMNS.reduce((acc, c) => ({ ...acc, [c.id]: c.defaultWidth }), {});
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const customizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customizerRef.current && !customizerRef.current.contains(event.target as Node)) {
        setIsCustomizerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResizeStart = (colId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[colId] || 100;
    const minWidth = ALL_COLUMNS.find(c => c.id === colId)?.minWidth || 80;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      setColumnWidths(prev => ({
        ...prev,
        [colId]: newWidth
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      setColumnWidths(currentWidths => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.COLUMN_WIDTHS, JSON.stringify(currentWidths));
        return currentWidths;
      });
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const toggleColumn = (colId: string) => {
    setVisibleColumnIds(prev => {
      let next;
      if (prev.includes(colId)) {
        if (prev.length <= 1) return prev;
        next = prev.filter(id => id !== colId);
      } else {
        next = ALL_COLUMNS.map(c => c.id).filter(id => id === colId || prev.includes(id));
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.VISIBLE_COLUMNS, JSON.stringify(next));
      return next;
    });
  };

  const moveColumn = (colId: string, direction: 'left' | 'right') => {
    const index = visibleColumnIds.indexOf(colId);
    if (index === -1) return;
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= visibleColumnIds.length) return;

    const next = [...visibleColumnIds];
    const temp = next[index];
    next[index] = next[newIndex];
    next[newIndex] = temp;

    setVisibleColumnIds(next);
    localStorage.setItem(LOCAL_STORAGE_KEYS.VISIBLE_COLUMNS, JSON.stringify(next));
  };

  const resetColumns = () => {
    const defaultCols = ALL_COLUMNS.map(c => c.id);
    const defaultWidths = ALL_COLUMNS.reduce((acc, c) => ({ ...acc, [c.id]: c.defaultWidth }), {});
    setVisibleColumnIds(defaultCols);
    setColumnWidths(defaultWidths);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.VISIBLE_COLUMNS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.COLUMN_WIDTHS);
  };

  const totalWidth = visibleColumnIds.reduce((sum, colId) => sum + (columnWidths[colId] || 100), 0);

  const renderCell = (colId: string, member: Member, isFirst: boolean, isLast: boolean) => {
    const hasNoActivePass = !member.recentPurchase ||
      member.recentPurchase === '단순 상담/리드' ||
      member.recentPurchase === '신규 회원';

    const cellClass = `px-5 py-3.5 relative ${isLast ? '' : 'border-r border-slate-100'} overflow-hidden truncate`;

    switch (colId) {
      case 'info':
        return (
          <td key="info" className={cellClass}>
            {isFirst && selectedMemberId === member.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            )}
            <div className="flex items-center gap-3 w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${selectedMemberId === member.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white border border-slate-200/50'
                }`}>
                {member.name[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="font-bold text-slate-900 text-[13px] truncate">{member.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex gap-1 items-center truncate">
                  {member.gender} <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" /> <span className="truncate">담당: {staff.find(s => s.id === member.assignedTrainerId)?.name || '미정'}</span>
                </div>
              </div>
            </div>
          </td>
        );
      case 'phone':
        return (
          <td key="phone" className={`${cellClass} text-[13px] text-slate-600 font-medium whitespace-nowrap`}>
            {isFirst && selectedMemberId === member.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            )}
            {member.phone}
          </td>
        );
      case 'regDate':
        return (
          <td key="regDate" className={`${cellClass} text-[13px] text-slate-500 whitespace-nowrap`}>
            {isFirst && selectedMemberId === member.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            )}
            {member.registrationDate ? member.registrationDate.substring(0, 10).replace(/-/g, '.') : ''}
          </td>
        );
      case 'pass':
        return (
          <td key="pass" className={cellClass}>
            {isFirst && selectedMemberId === member.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            )}
            {hasNoActivePass ? (
              <div className="text-[11px] text-slate-400 font-medium">수강권 없음</div>
            ) : member.recentPurchase?.includes('회') ? (() => {
              const total = parseInt(member.recentPurchase.match(/(\d+)회/)?.[1] || '0', 10);
              const used = total - member.remainingSessions;
              const percent = total > 0 ? Math.round((used / total) * 100) : 0;
              return (
                <div className="flex flex-col gap-1 w-full min-w-0">
                  <div className="text-[11px] font-semibold text-slate-700 truncate" title={member.recentPurchase}>
                    {member.recentPurchase}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-700">{member.remainingSessions}<span className="text-slate-400 font-medium">/{total}회</span></span>
                      <span className="text-[9px] font-bold text-indigo-500">{percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="flex flex-col gap-1 w-full min-w-0">
                <div className="text-[11px] font-semibold text-slate-700 truncate" title={member.recentPurchase}>
                  {member.recentPurchase}
                </div>
                <div className="text-[9px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded w-max">
                  기간권
                </div>
              </div>
            )}
          </td>
        );
      case 'attendance':
        return (
          <td key="attendance" className={cellClass}>
            {isFirst && selectedMemberId === member.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            )}
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${member.attendance}%` }} />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{member.attendance}%</span>
            </div>
          </td>
        );
      case 'status':
        return (
          <td key="status" className={`${cellClass} text-center`}>
            {isFirst && selectedMemberId === member.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            )}
            <StatusBadge status={member.status} />
          </td>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);

  const { data: memberDetailResponse } = useMember(selectedMemberId || 0);
  const selectedMember = memberDetailResponse?.data || members.find(m => m.id === selectedMemberId);

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingTrainer, setIsEditingTrainer] = useState(false);

  // Registration Modal State (Using finalized P-Type)
  const [isModalPOpen, setIsModalPOpen] = useState(false);
  const [modalPMode, setModalPMode] = useState<{ step: number; member?: any }>({ step: 1 });

  const filteredMembers = members.filter(m =>
    m.name.includes(searchTerm) || m.phone.includes(searchTerm)
  );

  const handleTrainerChange = (newTrainerIdStr: string) => {
    const newTrainerId = parseInt(newTrainerIdStr);
    if (selectedMemberId) {
      updateMemberMutation.mutate({ id: selectedMemberId, data: { assignedTrainerId: newTrainerId } });
    }
    setIsEditingTrainer(false);
  };

  const getTrainerName = (trainerId: number | undefined) => {
    if (!trainerId) return '미배정';
    const trainer = staff.find(s => s.id === trainerId);
    if (trainer) return `${trainer.name} (${trainer.role === 'ADMIN' ? '수석' : '트레이너'})`;
    return '미배정';
  };

  return (
    <>
      <div className="flex items-start gap-5 h-[calc(100vh-140px)]">
        {/* 1. Left Table View - Full Height */}
        <div className="flex-1 min-w-0 flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              회원 목록 <span className="text-xs font-medium text-slate-400">({filteredMembers.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative group w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                <input
                  type="text"
                  placeholder="이름, 연락처 검색"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Column Settings Toggle Button */}
              <div className="relative" ref={customizerRef}>
                <button
                  onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95 shrink-0"
                  title="열 설정"
                >
                  <SlidersHorizontal size={14} className="text-slate-500" />
                  <span className="hidden sm:inline">열 설정</span>
                </button>

                <AnimatePresence>
                  {isCustomizerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <SlidersHorizontal size={12} className="text-emerald-500" />
                          테이블 열 관리
                        </h3>
                        <button
                          onClick={resetColumns}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                          title="초기화"
                        >
                          <RotateCcw size={10} />
                          기본설정
                        </button>
                      </div>

                      <div className="mt-3 flex flex-col gap-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {ALL_COLUMNS.map((col) => {
                          const isVisible = visibleColumnIds.includes(col.id);
                          const visibleIndex = visibleColumnIds.indexOf(col.id);

                          return (
                            <div
                              key={col.id}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${isVisible ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-50/20 border-slate-50 opacity-60'
                                }`}
                            >
                              <label className="flex items-center gap-2.5 cursor-pointer flex-1 select-none">
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  onChange={() => toggleColumn(col.id)}
                                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500/20 transition-all cursor-pointer"
                                />
                                <span className="text-[12px] font-bold text-slate-700">{col.label}</span>
                              </label>

                              {isVisible && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveColumn(col.id, 'left')}
                                    disabled={visibleIndex === 0}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                    title="왼쪽으로 이동"
                                  >
                                    <ArrowLeft size={12} />
                                  </button>
                                  <button
                                    onClick={() => moveColumn(col.id, 'right')}
                                    disabled={visibleIndex === visibleColumnIds.length - 1}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                    title="오른쪽으로 이동"
                                  >
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-start gap-1">
                        <AlertCircle size={10} className="shrink-0 text-slate-400 mt-0.5" />
                        <span>열의 구분선을 드래그하여 좌우폭을 조절할 수 있습니다.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Primary New Registration Button */}
              <button
                onClick={() => {
                  setModalPMode({ step: 1, member: null });
                  setIsModalPOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-black rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
              >
                <Plus size={16} />
                신규 등록
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="text-emerald-500 animate-spin" />
              <p className="text-slate-500 font-medium text-sm">회원 데이터를 불러오는 중...</p>
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <AlertCircle size={32} className="text-rose-500" />
              <p className="text-slate-500 font-medium text-sm">데이터를 불러오는데 실패했습니다.</p>
            </div>
          ) : (
            <>
              {/* Table List */}
              <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                <table className="text-left border-collapse relative table-fixed" style={{ width: totalWidth }}>
                  <colgroup>
                    {visibleColumnIds.map(colId => (
                      <col key={colId} style={{ width: columnWidths[colId] || 100 }} />
                    ))}
                  </colgroup>
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      {visibleColumnIds.map((colId, index) => {
                        const colConfig = ALL_COLUMNS.find(c => c.id === colId);
                        if (!colConfig) return null;
                        const isLast = index === visibleColumnIds.length - 1;
                        return (
                          <th
                            key={colId}
                            className={`px-5 py-3 text-[11px] font-bold text-slate-500 relative select-none group/th ${isLast ? '' : 'border-r border-slate-100'
                              } ${colId === 'status' ? 'text-center' : 'text-left'}`}
                          >
                            <span>{colConfig.label}</span>

                            {/* Resize Handle */}
                            {!isLast && (
                              <div
                                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-20 hover:bg-emerald-500/50 active:bg-emerald-600 transition-colors"
                                style={{ marginRight: '-3px' }}
                                onMouseDown={(e) => handleResizeStart(colId, e)}
                              />
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedMemberId(member.id)}
                        className={`group cursor-pointer transition-colors ${selectedMemberId === member.id
                          ? 'bg-emerald-50/40'
                          : 'hover:bg-slate-50/50'
                          }`}
                      >
                        {visibleColumnIds.map((colId, index) => {
                          const isFirst = index === 0;
                          const isLast = index === visibleColumnIds.length - 1;
                          return renderCell(colId, member, isFirst, isLast);
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* 2. Right Detail View - Minimalist & Data Heavy (Full height) */}
        <AnimatePresence mode="wait">
          {selectedMember ? (
            <motion.div
              key={selectedMember.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="w-[320px] h-full flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0 relative"
            >
              {/* Minimalist Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col gap-4 shrink-0 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-lg font-bold border border-slate-200">
                      {selectedMember.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedMember.name}</h2>
                        <StatusBadge status={selectedMember.status} />
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                        <span>{selectedMember.phone}</span>
                        <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                        <span>{selectedMember.gender}</span>
                        <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                        <span>{selectedMember.email}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setModalPMode({ step: 1, member: selectedMember });
                      setIsModalPOpen(true);
                    }}
                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1 group/edit"
                    title="정보 수정"
                  >
                    <Pencil size={18} className="group-hover/edit:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`${selectedMember.name} 회원을 삭제하시겠습니까?`)) {
                        deleteMemberMutation.mutate(selectedMember.id, {
                          onSuccess: () => {
                            alert('삭제되었습니다.');
                            setSelectedMemberId(null);
                          }
                        });
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 group/delete"
                    title="회원 삭제"
                  >
                    <Trash2 size={18} className="group-hover/delete:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-2 w-full mt-1">
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-colors">
                    <CalendarDays size={14} /> 일정 예약
                  </button>
                  <button
                    onClick={() => {
                      setModalPMode({ step: 2, member: selectedMember });
                      setIsModalPOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                  >
                    <CreditCard size={14} /> 상품 결제
                  </button>
                  <button className="px-2.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-colors tooltip" title="메모 기록">
                    <FileText size={14} />
                  </button>
                </div>
              </div>

              {/* Dense Tabs */}
              <div className="px-5 flex gap-3 overflow-x-auto no-scrollbar shrink-0 bg-white border-b border-slate-100">
                {[
                  { id: 'overview', label: '종합 개요' },
                  { id: 'payment', label: '수강권 내역' },
                  { id: 'schedule', label: '예약 및 출석' },
                  { id: 'body', label: '체형 분석' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area - Data Centric */}
              <div className="flex-1 overflow-y-auto bg-slate-50/30 p-5 custom-scrollbar">
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-5">
                    {/* Dense Data Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Item 1 */}
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><CreditCard size={14} className="text-slate-400" /> 활성 수강권</span>
                          {(!selectedMember.recentPurchase ||
                            (selectedMember.recentPurchase !== '단순 상담/리드' &&
                              selectedMember.recentPurchase !== '신규 회원')) && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{selectedMember.remainingSessions}회 남음</span>
                            )}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-slate-900">
                            {(!selectedMember.recentPurchase ||
                              selectedMember.recentPurchase === '단순 상담/리드' ||
                              selectedMember.recentPurchase === '신규 회원')
                              ? '등록된 수강권 없음'
                              : selectedMember.recentPurchase}
                          </div>
                          {(!selectedMember.recentPurchase ||
                            (selectedMember.recentPurchase !== '단순 상담/리드' &&
                              selectedMember.recentPurchase !== '신규 회원')) && (
                              <div className="text-[11px] text-slate-400 mt-1">
                                {selectedMember.recentPurchase?.includes('회') ? '회수권 이용 중' : '기간권 이용 중'}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Activity size={14} className="text-slate-400" /> 출석 및 방문</span>
                          <span className="text-[11px] font-bold text-emerald-600">{selectedMember.attendance}%</span>
                        </div>
                        <div>
                          <div className="flex w-full h-1.5 bg-slate-100 rounded-full mb-1.5 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedMember.attendance}%` }}></div>
                          </div>
                          <div className="text-[11px] text-slate-400">최근 방문: {selectedMember.lastVisit}</div>
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2"><UserCircle size={14} className="text-slate-400" /> 담당 트레이너</div>
                        <div className="mt-1 flex items-center justify-between min-h-[22px]">
                          {isEditingTrainer ? (
                            <select
                              className="text-[12px] bg-slate-50 border border-slate-200 rounded px-1 min-w-0 flex-1 mr-2 outline-none focus:border-emerald-500"
                              value={selectedMember.assignedTrainerId || ''}
                              onChange={(e) => handleTrainerChange(e.target.value)}
                              onBlur={() => setIsEditingTrainer(false)}
                              autoFocus
                            >
                              <option value="">미배정</option>
                              {staff.filter(s => s.role !== 'MANAGER').map(staffMember => (
                                <option key={staffMember.id} value={staffMember.id}>{staffMember.name} ({staffMember.role === 'ADMIN' ? '수석' : '트레이너'})</option>
                              ))}
                            </select>
                          ) : (
                            <>
                              <span className="text-[13px] font-bold text-slate-900 truncate">{getTrainerName(selectedMember.assignedTrainerId)}</span>
                              <button onClick={() => setIsEditingTrainer(true)} className="text-[10px] text-slate-400 underline hover:text-slate-600 shrink-0">변경</button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2"><CreditCard size={14} className="text-slate-400" /> 누적 결제</div>
                        <div className="text-[13px] font-bold text-slate-900 mt-1 flex items-center justify-between">
                          {(selectedMember.totalPaid / 10000).toLocaleString()}만원
                          <ChevronRight size={14} className="text-slate-300" />
                        </div>
                      </div>
                    </div>

                    {/* Goal & Memo Block */}
                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5"><Target size={14} className="text-slate-400" /> 회원 목표 및 특이사항</h3>
                        <button className="text-[10px] font-bold text-emerald-600 hover:underline">수정</button>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 mb-1">등록 목표</div>
                          <div className="text-[13px] text-slate-800 font-medium">{selectedMember.goal}</div>
                        </div>
                        <div className="w-full h-px bg-slate-50" />
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 mb-1">트레이너 메모 (최근)</div>
                          <div className="text-[12px] text-slate-600 leading-relaxed tabular-nums">
                            <div className="mb-1 text-[10px] text-slate-400">2026.04.14 15:30 기록됨</div>
                            최근 오른쪽 어깨 통증 호소. 푸시 계열 운동 시 가동범위 제한하여 진행할 것. 하체 컨디션은 좋음.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick recent history log list style */}
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-slate-900">최근 타임라인</h3>
                        <span className="text-[10px] font-medium text-slate-400 cursor-pointer">더보기</span>
                      </div>
                      <div className="p-0">
                        {/* List Item */}
                        <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <div className="mt-0.5 w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                            <CalendarDays size={12} className="text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-slate-900">PT 예약 확정</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">4월 18일 (목) 19:00 - 하체 집중</div>
                          </div>
                          <div className="text-[10px] text-slate-400">어제</div>
                        </div>
                        {/* List Item */}
                        <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <div className="mt-0.5 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                            <Activity size={12} className="text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-slate-900">출석 완료</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">입장 타각 확인</div>
                          </div>
                          <div className="text-[10px] text-slate-400">4.14</div>
                        </div>
                        {/* List Item */}
                        <div className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="mt-0.5 w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                            <CreditCard size={12} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-slate-900">결제 완료</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">개인락커 3개월 연장 (30,000원)</div>
                          </div>
                          <div className="text-[10px] text-slate-400">4.10</div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="flex-1 overflow-hidden flex flex-col uppercase tracking-tighter">
                    <div className="px-5 py-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                      <h3 className="text-[11px] font-black text-slate-900 tracking-wider">PAYMENT LOG <span className="text-indigo-600 ml-1">[{selectedMember.paymentHistories?.length || 0}]</span></h3>
                      <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                        CSV EXPORT <FileText size={12} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left table-fixed border-separate border-spacing-0">
                        <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                          <tr>
                            <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 border-b border-slate-100 bg-slate-50/30 w-[22%]">거래일시</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 border-b border-slate-100 bg-slate-50/30">상품명 / 상세</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 border-b border-slate-100 bg-slate-50/30 w-[20%] text-right pr-5">결제금액</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedMember.paymentHistories?.map((pay: any) => (
                            <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-5 py-4 align-top">
                                <div className="text-[10px] font-black text-slate-900">{pay.date ? pay.date.substring(0, 10).replace(/-/g, '.') : ''}</div>
                                <div className="text-[9px] font-bold text-slate-400 mt-0.5">{pay.trainerName || pay.trainer}</div>
                              </td>
                              <td className="px-3 py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[12px] font-black text-slate-800 break-all leading-tight">{pay.product}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black leading-none ${pay.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                      pay.status === 'UNPAID' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                                      }`}>
                                      {pay.status === 'COMPLETED' ? 'PAID' : pay.status === 'UNPAID' ? 'UNPAID' : 'EXP'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                    <span className="flex items-center gap-0.5"><CreditCard size={10} /> {pay.method}</span>
                                    <span className="w-0.5 h-0.5 bg-slate-200 rounded-full" />
                                    <span className="flex items-center gap-0.5"><Box size={10} /> {pay.locker === '미사용' ? 'NO-LOCKER' : pay.locker}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-right pr-5 align-top">
                                <div className="text-[13px] font-black text-slate-900 tabular-nums tracking-normal">
                                  {(pay.discountedPrice / 10000).toLocaleString()}
                                  <span className="text-[10px] font-bold ml-0.5 text-slate-400">만</span>
                                </div>
                                {pay.basePrice !== pay.discountedPrice && (
                                  <div className="text-[9px] text-slate-300 font-bold line-through tabular-nums leading-none mt-0.5">
                                    {(pay.basePrice / 10000).toLocaleString()}만
                                  </div>
                                )}
                                {pay.status === 'UNPAID' && (
                                  <div className="mt-2 text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.5 rounded inline-block">
                                    미수금: 60만
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {!selectedMember.paymentHistories?.length && (
                        <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                          <CreditCard size={40} className="mb-2" />
                          <p className="text-[11px] font-black">데이터가 존재하지 않습니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab !== 'overview' && activeTab !== 'payment' && (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
                    <MoreHorizontal size={32} className="mb-2 opacity-30" />
                    <p className="font-medium text-xs">상세 데이터 내역이 표시될 영역입니다</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="w-[320px] h-full flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 rounded-2xl shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <UserCircle size={32} />
              </div>
              <p className="text-slate-400 font-bold text-sm">목록에서 조회할 회원을 선택하세요.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Registration Modal (Finalized P-Type) */}
      <RegistrationModalP
        isOpen={isModalPOpen}
        onClose={() => setIsModalPOpen(false)}
        initialStep={modalPMode.step}
        member={modalPMode.member}
        onSaveMember={(memberData, isEdit) => {
          if (isEdit && modalPMode.member?.id) {
            updateMemberMutation.mutate({ id: modalPMode.member.id, data: memberData }, {
              onSuccess: () => {
                alert('성공적으로 수정되었습니다!');
                setIsModalPOpen(false);
              },
              onError: (err: any) => {
                alert(`수정 실패: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
              }
            });
          } else {
            createMemberMutation.mutate(memberData, {
              onSuccess: (res: any) => {
                alert('성공적으로 등록되었습니다!');
                setIsModalPOpen(false);
                if (res?.data?.id) {
                  setSelectedMemberId(res.data.id);
                }
              },
              onError: (err: any) => {
                alert(`등록 실패: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
              }
            });
          }
        }}
        onDeleteMember={(id) => {
          deleteMemberMutation.mutate(id, {
            onSuccess: () => {
              alert('삭제되었습니다.');
              setIsModalPOpen(false);
              if (selectedMemberId === id) setSelectedMemberId(null);
            }
          });
        }}
      />
    </>
  );
}
