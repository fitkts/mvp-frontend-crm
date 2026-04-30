import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, MapPin, Filter, Search, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 더미 데이터
const MOCK_EVENTS = [
  { id: 1, title: 'PT: 강민준', time: '09:00', duration: '50분', trainer: '이코치', type: 'PT', color: 'bg-emerald-500' },
  { id: 2, title: '그룹 필라테스', time: '10:00', duration: '50분', trainer: '김필라', type: 'GROUP', color: 'bg-purple-500' },
  { id: 3, title: 'PT: 박서연', time: '11:00', duration: '50분', trainer: '이코치', type: 'PT', color: 'bg-emerald-500' },
  { id: 4, title: '요가 클래스', time: '14:00', duration: '60분', trainer: '최요가', type: 'GROUP', color: 'bg-blue-500' },
  { id: 5, title: 'PT: 이도현', time: '16:00', duration: '50분', trainer: '박트레이너', type: 'PT', color: 'bg-emerald-500' },
  { id: 6, title: '바디펌프', time: '19:00', duration: '50분', trainer: '정코치', type: 'GROUP', color: 'bg-orange-500' },
];

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // 달력 계산 로직 (간소화)
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
      {/* 상단 툴바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <CalendarIcon className="text-emerald-600" size={32} />
            예약 일정
          </h1>
          
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-all ${
                  view === v ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {v === 'month' ? '월간' : v === 'week' ? '주간' : '일간'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToday} className="px-4 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all">
              오늘
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="text-xl font-display font-bold text-slate-900 min-w-[140px] text-center">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </div>
          <button className="neo-button flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
            <Plus size={20} />
            일정 등록
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 메인 캘린더 영역 */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {DAYS.map((day, i) => (
              <div key={day} className={`py-3 text-center text-[11px] font-bold uppercase tracking-widest ${
                i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="flex-1 grid grid-cols-7 overflow-y-auto">
            {calendarDays.map((date, i) => {
              const isToday = date?.toDateString() === new Date().toDateString();
              const isSelected = date?.toDateString() === selectedDate.toDateString();
              const isCurrentMonth = date?.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={i}
                  onClick={() => date && setSelectedDate(date)}
                  className={`min-h-[120px] p-2 border-r border-b border-slate-50 transition-all cursor-pointer group hover:bg-slate-50/50 ${
                    !isCurrentMonth ? 'bg-slate-50/30' : ''
                  } ${isSelected ? 'bg-emerald-50/30 ring-1 ring-inset ring-emerald-500/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      isToday ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 
                      isSelected ? 'text-emerald-600' : 
                      !isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {date ? date.getDate() : ''}
                    </span>
                    {date && i % 5 === 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    )}
                  </div>

                  {/* 날짜별 이벤트 요약 (간소화) */}
                  <div className="space-y-1">
                    {date && i % 3 === 0 && (
                      <div className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold truncate border border-emerald-200">
                        09:00 PT 강민준
                      </div>
                    )}
                    {date && i % 7 === 0 && (
                      <div className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold truncate border border-purple-200">
                        14:00 필라테스
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽 상세 일정 패널 */}
        <div className="w-80 flex flex-col gap-6 shrink-0">
          <div className="glass-card p-6 flex flex-col h-full">
            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-slate-900">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
              </h3>
              <p className="text-sm text-slate-500 font-medium">총 {MOCK_EVENTS.length}개의 일정이 있습니다.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {MOCK_EVENTS.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${event.color}`} />
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-xs font-bold">{event.time}</span>
                        <span className="text-[10px] font-medium opacity-60">({event.duration})</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreHorizontal size={14} className="text-slate-400" />
                      </button>
                    </div>

                    <div className="pl-2">
                      <h4 className="font-bold text-slate-900 mb-2">{event.title}</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <User size={12} className="text-emerald-500" />
                          {event.trainer}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <MapPin size={12} className="text-blue-500" />
                          A룸
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button className="mt-6 w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">
              일정 전체 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
