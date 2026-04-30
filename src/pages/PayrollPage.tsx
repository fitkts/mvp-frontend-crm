import { useState } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, Download, ChevronRight, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// 더미 데이터
const MOCK_STATS = [
  { label: '총 매출', value: '42,500,000', change: '+12.5%', isPositive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '총 급여 지출', value: '18,200,000', change: '+5.2%', isPositive: false, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '순이익', value: '24,300,000', change: '+18.3%', isPositive: true, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '활성 회원', value: '156', change: '+4', isPositive: true, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const MOCK_CHART_DATA = [
  { name: '1월', revenue: 3200, payroll: 1500 },
  { name: '2월', revenue: 3800, payroll: 1600 },
  { name: '3월', revenue: 3500, payroll: 1550 },
  { name: '4월', revenue: 4250, payroll: 1820 },
];

const MOCK_PAYROLL_LIST = [
  { id: 1, name: '김대표', role: 'ADMIN', baseSalary: 3000000, incentive: 1500000, total: 4500000, status: 'PAID' },
  { id: 2, name: '이코치', role: 'TRAINER', baseSalary: 2000000, incentive: 3200000, total: 5200000, status: 'PENDING' },
  { id: 3, name: '박매니저', role: 'MANAGER', baseSalary: 2500000, incentive: 800000, total: 3300000, status: 'PENDING' },
  { id: 4, name: '최트레이너', role: 'TRAINER', baseSalary: 1800000, incentive: 2400000, total: 4200000, status: 'PENDING' },
];

export default function PayrollPage() {
  const [period, setPeriod] = useState('2026-04');

  return (
    <div className="space-y-8 pb-12">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <PieChartIcon className="text-emerald-600" size={32} />
            통계 및 급여 관리
          </h1>
          <p className="text-slate-500 mt-1 font-medium">센터의 재무 현황과 직원 급여를 정산합니다.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="month"
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-bold text-slate-700"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <button className="neo-button flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">
            <Download size={18} />
            보고서 다운로드
          </button>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-slate-900">{stat.value}</span>
              <span className="text-slate-400 text-sm font-bold">{stat.label.includes('회원') ? '명' : '원'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 매출 트렌드 차트 */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-display font-bold text-slate-900">매출 및 급여 추이</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-500">매출</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-500">급여</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="payroll" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPayroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 급여 정산 목록 */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-display font-bold text-slate-900 mb-6">직원별 급여 현황</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {MOCK_PAYROLL_LIST.map((staff) => (
              <div key={staff.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-900">{staff.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{staff.role}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider ${
                    staff.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {staff.status === 'PAID' ? '지급완료' : '정산대기'}
                  </span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 font-medium">기본급: {staff.baseSalary.toLocaleString()}원</div>
                    <div className="text-[10px] text-emerald-600 font-bold">인센티브: +{staff.incentive.toLocaleString()}원</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">최종 지급액</div>
                    <div className="text-lg font-display font-bold text-slate-900">{staff.total.toLocaleString()}원</div>
                  </div>
                </div>

                {staff.status === 'PENDING' && (
                  <button className="w-full mt-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                    급여 지급하기
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
            전체 급여 정산
          </button>
        </div>
      </div>
    </div>
  );
}
