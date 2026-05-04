import { LayoutDashboard, Users, Calendar, BarChart3, Settings, LogOut, Package, UserCog, Sparkles, Box } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: '대시보드', path: '/dashboard', icon: LayoutDashboard },
  { name: '회원 관리', path: '/members', icon: Users },
  { name: '예약 캘린더', path: '/schedule', icon: Calendar },
  { name: '상품 관리', path: '/products', icon: Package },
  { name: '사물함 관리', path: '/lockers', icon: Box },
  { name: '직원 관리', path: '/staff', icon: UserCog },
  { name: '통계/급여', path: '/payroll', icon: BarChart3 },
  { name: '설정', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-slate-100 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Sparkles size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">AwareFit</span>
      </div>
      
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">

        <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 transition-colors w-full group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
