import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Moon, Save, ChevronRight, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SETTINGS_SECTIONS = [
  { id: 'general', label: '일반 설정', icon: SettingsIcon },
  { id: 'profile', label: '프로필 관리', icon: User },
  { id: 'notifications', label: '알림 설정', icon: Bell },
  { id: 'security', label: '보안 및 계정', icon: Shield },
  { id: 'billing', label: '결제 및 구독', icon: CreditCard },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      {/* 왼쪽: 설정 네비게이션 */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="glass-card p-4 space-y-1">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeSection === section.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <section.icon size={18} />
              {section.label}
              {activeSection === section.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </div>
      </div>

      {/* 오른쪽: 설정 상세 내용 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-8"
        >
          {activeSection === 'general' && (
            <>
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-display font-bold text-slate-900">일반 설정</h2>
                <p className="text-slate-500 font-medium mt-1">센터의 기본적인 운영 환경을 설정합니다.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">센터 이름</label>
                    <input 
                      type="text" 
                      defaultValue="AwareFit 강남점"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">대표 번호</label>
                    <input 
                      type="text" 
                      defaultValue="02-1234-5678"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">센터 주소</label>
                  <input 
                    type="text" 
                    defaultValue="서울특별시 강남구 테헤란로 123, 4층"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">시스템 환경</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-sm">
                        <Moon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">다크 모드</p>
                        <p className="text-xs text-slate-500 font-medium">시스템 테마에 맞춰 자동으로 전환됩니다.</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-sm">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">언어 설정</p>
                        <p className="text-xs text-slate-500 font-medium">기본 언어를 한국어로 설정합니다.</p>
                      </div>
                    </div>
                    <select className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer">
                      <option>한국어 (KO)</option>
                      <option>English (EN)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'profile' && (
            <>
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-display font-bold text-slate-900">프로필 관리</h2>
                <p className="text-slate-500 font-medium mt-1">개인 정보 및 프로필 이미지를 변경합니다.</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-100">
                      김
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 transition-all">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">김대표</h3>
                    <p className="text-sm text-slate-500 font-medium">ceo@awarefit.com</p>
                    <div className="flex gap-2 mt-3">
                      <button className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">사진 변경</button>
                      <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all">삭제</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">이름</label>
                    <input 
                      type="text" 
                      defaultValue="김대표"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">이메일</label>
                    <input 
                      type="email" 
                      defaultValue="ceo@awarefit.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 하단 저장 버튼 */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"
                  >
                    <Check size={16} />
                    성공적으로 저장되었습니다.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">취소</button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="neo-button flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                변경사항 저장
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
