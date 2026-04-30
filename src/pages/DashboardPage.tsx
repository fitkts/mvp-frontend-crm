import { Users, CreditCard, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Clock, Target } from 'lucide-react';
import { motion } from 'motion/react';

const STATS = [
  { 
    label: '전체 회원', 
    value: '1,284', 
    change: '+12%', 
    isPositive: true, 
    icon: Users, 
    color: 'bg-emerald-50 text-emerald-600',
    description: '지난 달 대비 142명 증가'
  },
  { 
    label: '이번 달 매출', 
    value: '₩42.8M', 
    change: '+8.2%', 
    isPositive: true, 
    icon: CreditCard, 
    color: 'bg-blue-50 text-blue-600',
    description: '목표 매출의 85% 달성'
  },
  { 
    label: '오늘 예약', 
    value: '24', 
    change: '-2', 
    isPositive: false, 
    icon: Calendar, 
    color: 'bg-amber-50 text-amber-600',
    description: '오전 12건 / 오후 12건'
  },
  { 
    label: '평균 출석률', 
    value: '78%', 
    change: '+4%', 
    isPositive: true, 
    icon: Activity, 
    color: 'bg-rose-50 text-rose-600',
    description: '피크 타임: 19:00 - 21:00'
  },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: 'payment', user: '강민준', detail: 'PT 20회 결제 완료', time: '10분 전', amount: '+₩900,000' },
  { id: 2, type: 'registration', user: '김지은', detail: '신규 회원 등록', time: '45분 전' },
  { id: 3, type: 'visit', user: '이도현', detail: '센터 입장', time: '1시간 전' },
  { id: 4, type: 'booking', user: '박서연', detail: '내일 오후 2시 PT 예약', time: '2시간 전' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-900 mb-2"
          >
            Good Morning, <span className="text-emerald-600">김대표님</span>
          </motion.h1>
          <p className="text-slate-500 font-medium">오늘의 센터 현황과 주요 지표를 확인하세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-semibold text-slate-600 flex items-center gap-2">
            <Clock size={16} className="text-emerald-500" />
            2026년 4월 16일 (목)
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-[var(--radius-default)] group hover:ring-2 hover:ring-emerald-100 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                {stat.change}
                {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</h3>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-400 font-medium pt-1">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Placeholder / Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[var(--radius-default)] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" />
                  매출 추이
                </h2>
                <p className="text-sm text-slate-500">최근 7일간의 일별 매출 현황입니다.</p>
              </div>
              <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500">
                <option>최근 7일</option>
                <option>최근 30일</option>
              </select>
            </div>
            
            {/* Simple Visual Placeholder for Chart */}
            <div className="h-[300px] w-full flex items-end gap-4 px-4">
              {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-xl relative group"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₩{(height * 100000).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-6 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-[var(--radius-default)] flex items-center gap-6">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Target size={20} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase">월 목표 달성률</h4>
                <div className="text-2xl font-bold text-slate-900">85.4%</div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-[var(--radius-default)] flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={32} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase">신규 유입</h4>
                <div className="text-2xl font-bold text-slate-900">+42명</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Recent Activity */}
        <div className="space-y-6">
          <div className="glass-card rounded-[var(--radius-default)] p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-emerald-500" size={20} />
              최근 활동
            </h2>
            <div className="space-y-6">
              {RECENT_ACTIVITIES.map((activity, index) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex gap-4 relative"
                >
                  {index !== RECENT_ACTIVITIES.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-100" />
                  )}
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center z-10 ${
                    activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                    activity.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.type === 'payment' ? <CreditCard size={18} /> :
                     activity.type === 'registration' ? <Users size={18} /> :
                     <Activity size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900">{activity.user}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{activity.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.detail}</p>
                    {activity.amount && (
                      <div className="mt-2 text-sm font-extrabold text-emerald-600">{activity.amount}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
              전체 활동 보기
            </button>
          </div>

          <div className="bg-emerald-900 rounded-[var(--radius-default)] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">프리미엄 리포트</h3>
              <p className="text-emerald-100/70 text-sm mb-6 leading-relaxed">AI가 분석한 이번 달 회원 이탈 방지 전략 리포트가 도착했습니다.</p>
              <button className="neo-button px-6 py-3 bg-white text-emerald-900 font-bold rounded-xl text-sm">
                리포트 확인하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
