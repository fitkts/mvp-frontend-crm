import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, HelpCircle, User, Package, Calendar, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const pageTitles: Record<string, string> = {
  '/dashboard': '대시보드',
  '/members': '회원 관리',
  '/lockers': '사물함 관리',
  '/schedule': '예약 캘린더',
  '/products': '상품 관리',
  '/staff': '직원 관리',
  '/payroll': '통계/급여',
  '/settings': '설정',
};

// Mock data for global search
const SEARCH_DATA = {
  members: [
    { id: 1, name: '강민준', phone: '010-3001-0001', type: 'member' },
    { id: 4, name: '박서연', phone: '010-6004-0004', type: 'member' },
    { id: 2, name: '김지은', phone: '010-4002-0002', type: 'member' },
  ],
  products: [
    { id: 1, name: 'PT 베이직 10회', price: '500,000원', type: 'product' },
    { id: 3, name: '헬스 1개월권', price: '80,000원', type: 'product' },
  ],
  schedules: [
    { id: 101, title: '윤지성 트레이너 수업', time: '오늘 14:00', type: 'schedule' },
  ]
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[location.pathname] || 'AwareFit CRM';

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredData = {
    members: SEARCH_DATA.members.filter(m => m.name.includes(searchQuery) || m.phone.includes(searchQuery)),
    products: SEARCH_DATA.products.filter(p => p.name.includes(searchQuery)),
    schedules: SEARCH_DATA.schedules.filter(s => s.title.includes(searchQuery)),
  };

  const hasResults = searchQuery.length > 0 && (filteredData.members.length > 0 || filteredData.products.length > 0 || filteredData.schedules.length > 0);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 fixed top-0 left-44 right-0 z-40">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h2>
        
        {/* Global Search Bar */}
        <div className="hidden md:block relative" ref={searchRef}>
          <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'w-80' : 'w-64'}`}>
            <Search 
              className={`absolute left-3.5 transition-colors duration-200 ${isSearchFocused ? 'text-emerald-500' : 'text-slate-400'}`} 
              size={16} 
            />
            <input 
              type="text" 
              placeholder="회원, 상품, 예약 바로가기..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchQuery) setShowResults(true);
              }}
              className="w-full pl-10 pr-10 py-2 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/50 transition-all font-medium"
            />
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-10 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}

            <div className="absolute right-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm pointer-events-none">
              <Command size={10} /> K
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchQuery.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full mt-2 w-[400px] bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-2 max-h-[480px] overflow-y-auto custom-scrollbar">
                  {hasResults ? (
                    <>
                      {filteredData.members.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">회원 검색 결과</div>
                          {filteredData.members.map(member => (
                            <button 
                              key={member.id}
                              onClick={() => {
                                navigate('/members');
                                setShowResults(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                {member.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{member.name}</div>
                                <div className="text-[11px] text-slate-500">{member.phone}</div>
                              </div>
                              <User size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredData.products.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">상품 목록</div>
                          {filteredData.products.map(product => (
                            <button 
                              key={product.id}
                              onClick={() => {
                                navigate('/products');
                                setShowResults(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Package size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                                <div className="text-[11px] text-slate-500">{product.price}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredData.schedules.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">오늘의 예약</div>
                          {filteredData.schedules.map(schedule => (
                            <button 
                              key={schedule.id}
                              onClick={() => {
                                navigate('/schedule');
                                setShowResults(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Calendar size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{schedule.title}</div>
                                <div className="text-[11px] text-slate-500">{schedule.time}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                      <Search size={32} className="mb-2 opacity-20" />
                      <p className="text-xs font-bold text-slate-400">검색 결과가 없습니다.</p>
                      <p className="text-[10px] mt-1 text-slate-300">정확한 이름이나 연락처를 입력해 보세요.</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-medium">위아래 키로 이동, 엔터로 선택</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer">상세 검색 열기</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
          <HelpCircle size={18} />
        </button>
        <div className="h-6 w-px bg-slate-100 mx-2"></div>
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-900 leading-none">김대표</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Super Admin</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100 text-sm">
            김
          </div>
        </div>
      </div>
    </header>
  );
}
