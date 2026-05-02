import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { X, User, Shield, Briefcase, Camera, ChevronRight, ChevronLeft, Check, ClipboardList, Save, Star, Cloud, MapPin, Sparkles, AlertCircle, Ban, Calendar, Box, Activity, DollarSign, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  onSaveStaff?: (staffData: any) => void;
}

export default function RegistrationModalStaff({ isOpen, onClose, initialStep, onSaveStaff }: Props) {
  const [step, setStep] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);

  // === 직원 기본 정보 ===
  const [staffName, setStaffName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [hasAppAccess, setHasAppAccess] = useState(true);
  
  // === 구직 및 채용 정보 ===
  const [role, setRole] = useState('TRAINER');
  const [hireDate, setHireDate] = useState('');
  const [employeeType, setEmployeeType] = useState('REGULAR'); // 정규직, 프리랜서 등
  const [address, setAddress] = useState('');

  // === 역량 및 기타 ===
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [description, setDescription] = useState('');

  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 1);
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
      
      setHireDate(localISOTime);
      setTimeout(() => nameRef.current?.focus(), 100);
    } else {
      // 리셋
      setStep(1);
      setStaffName('');
      setPhone('');
      setGender('');
      setBirthDate('');
      setEmail('');
      setRole('TRAINER');
      setEmployeeType('REGULAR');
      setAddress('');
      setCertifications([]);
      setDescription('');
      setHasAppAccess(true);
      setIsPhoneVerified(false);
    }
  }, [isOpen, initialStep]);

  const handlePhoneCheck = () => {
    if (phone.length < 10) return;
    setIsCheckingPhone(true);
    setTimeout(() => {
      setIsCheckingPhone(false);
      setIsPhoneVerified(true);
    }, 600);
  };

  const handleAddCert = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && certInput.trim()) {
      e.preventDefault();
      if (!certifications.includes(certInput.trim())) {
        setCertifications([...certifications, certInput.trim()]);
      }
      setCertInput('');
    }
  };

  const removeCert = (certToRemove: string) => {
    setCertifications(certifications.filter(c => c !== certToRemove));
  };


  const nextStep = () => {
     if (step === 1) {
        if (!staffName || !phone) {
           return alert('필수 항목을 입력하세요.');
        }
     }
     setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex h-[85vh] max-h-[800px]"
      >
        {/* Left: Step Indicators */}
        <div className="w-[200px] bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Briefcase size={18} />
              </div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight">신규 직원 등록</h2>
            </div>
            
            <div className="space-y-6 relative">
              <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-slate-200" />

              {[
                { s: 1, icon: User, title: '기본 정보', desc: '이름, 연락처' },
                { s: 2, icon: Briefcase, title: '채용 정보', desc: '직급, 입사일' },
                { s: 3, icon: Shield, title: '권한/역량', desc: '자격, 앱 권한' }
              ].map(item => {
                const isActive = step === item.s;
                const isPassed = step > item.s;
                return (
                  <div key={item.s} className="relative flex gap-3 cursor-pointer group" onClick={() => setStep(item.s)}>
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${
                      isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 
                      isPassed ? 'bg-slate-800 text-white' : 
                      'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-indigo-300'
                    }`}>
                      {isPassed ? <Check size={12} /> : item.s}
                    </div>
                    <div className="mt-0.5">
                      <div className={`text-xs font-bold leading-none mb-1 transition-colors ${
                        isActive ? 'text-indigo-900' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}>{item.title}</div>
                      <div className={`text-[10px] transition-colors ${
                        isActive ? 'text-indigo-500 font-medium' : 'text-slate-400'
                      }`}>{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-slate-700">등록 팁</span>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed">
                근로계약서, 개인정보동의서 등의 서류는 등록 완료 후 직원 상세 페이지에서 파일로 첨부 관리할 수 있습니다.
             </p>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: 기본 정보 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-xl mx-auto flex flex-col gap-8"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">직원 기본 정보</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">인사 관리를 위한 필수 정보를 입력합니다.</p>
                    </div>
                  </div>

                  {/* Profile Image & Name/Phone */}
                  <div className="flex gap-6">
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden">
                           <Camera size={24} className="group-hover:scale-110 transition-transform" />
                           <span className="text-[10px] font-bold">프로필 등록</span>
                        </div>
                     </div>
                     <div className="flex-1 flex flex-col gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">성함 <span className="text-rose-500">*</span></label>
                           <input
                              type="text"
                              ref={nameRef}
                              value={staffName}
                              onChange={e => setStaffName(e.target.value)}
                              placeholder="실명을 입력하세요"
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all"
                           />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">연락처 <span className="text-rose-500">*</span></label>
                           <div className="flex gap-2">
                              <input
                                 type="tel"
                                 value={phone}
                                 onChange={e => {
                                    setPhone(e.target.value);
                                    setIsPhoneVerified(false);
                                 }}
                                 placeholder="- 없이 숫자만 입력"
                                 className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold tabular-nums transition-all"
                              />
                              <button 
                                 onClick={handlePhoneCheck}
                                 disabled={phone.length < 10 || isPhoneVerified || isCheckingPhone}
                                 className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-w-[80px] ${
                                    isPhoneVerified ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                    phone.length >= 10 ? 'bg-slate-800 text-white hover:bg-slate-900 border border-slate-800' :
                                    'bg-slate-100 text-slate-400 border border-slate-100'
                                 }`}
                              >
                                 {isCheckingPhone ? <Loader2 size={16} className="animate-spin mx-auto" /> : 
                                  isPhoneVerified ? '연락처 확인' : '연락처 확인'}
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">생년월일</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">성별</label>
                      <div className="flex p-1 bg-slate-100 rounded-lg shrink-0">
                        <button
                          onClick={() => setGender('M')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                            gender === 'M' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          남성
                        </button>
                        <button
                          onClick={() => setGender('F')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                            gender === 'F' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          여성
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">이메일</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="본사 및 급여 관련 안내를 위해 입력해주세요"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: 채용 정보 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-xl mx-auto flex flex-col gap-8"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">계약 및 소속 정보</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">직급과 채용 형태를 설정합니다.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                     <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">입사일</label>
                        <input
                           type="date"
                           value={hireDate}
                           onChange={e => setHireDate(e.target.value)}
                           className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all font-bold tabular-nums"
                        />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">직급 설정</label>
                        <select
                           value={role}
                           onChange={(e) => setRole(e.target.value)}
                           className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
                        >
                           <option value="TRAINER">트레이너 (강사)</option>
                           <option value="MANAGER">매니저 (운영)</option>
                           <option value="ADMIN">관리자 (총괄)</option>
                           <option value="FC">FC (영업/상담)</option>
                        </select>
                     </div>
                     
                     <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-2">고용 형태</label>
                        <div className="grid grid-cols-3 gap-2">
                           <button onClick={() => setEmployeeType('REGULAR')} className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${employeeType === 'REGULAR' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100 hover:bg-slate-50'}`}>
                              <span className={`text-[12px] font-bold ${employeeType === 'REGULAR' ? 'text-indigo-700' : 'text-slate-700'}`}>정규직</span>
                              <span className="text-[9px] text-slate-400">4대보험 가입</span>
                           </button>
                           <button onClick={() => setEmployeeType('CONTRACT')} className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${employeeType === 'CONTRACT' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100 hover:bg-slate-50'}`}>
                              <span className={`text-[12px] font-bold ${employeeType === 'CONTRACT' ? 'text-indigo-700' : 'text-slate-700'}`}>계약직</span>
                              <span className="text-[9px] text-slate-400">기간제 근로</span>
                           </button>
                           <button onClick={() => setEmployeeType('FREELANCE')} className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${employeeType === 'FREELANCE' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100 hover:bg-slate-50'}`}>
                              <span className={`text-[12px] font-bold ${employeeType === 'FREELANCE' ? 'text-indigo-700' : 'text-slate-700'}`}>프리랜서</span>
                              <span className="text-[9px] text-slate-400">3.3% 사업소득</span>
                           </button>
                        </div>
                     </div>

                     <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">거주지 주소</label>
                        <div className="relative">
                           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                           <input
                              type="text"
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                              placeholder="주소 검색을 통해 자택 주소를 입력합니다"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                           />
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: 역량 및 권한 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-xl mx-auto flex flex-col gap-8"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                       <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">역량 및 권한 설정</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">앱 접속 권한 및 주요 이력을 입력합니다.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                           <div className="flex items-center gap-1.5 mb-1">
                              <Lock size={14} className="text-indigo-600" />
                              <span className="text-sm font-bold text-slate-800">센터 관리 앱 접속 권한 부여</span>
                           </div>
                           <p className="text-[11px] text-slate-500">직원이 연락처로 로그인하여 일정 및 회원을 관리할 수 있습니다.</p>
                        </div>
                        <button 
                           onClick={() => setHasAppAccess(!hasAppAccess)}
                           className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${hasAppAccess ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                           <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${hasAppAccess ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>

                     <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">자격 및 수료 사항 등록</label>
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-wrap gap-2 text-sm text-slate-700 focus-within:bg-white focus-within:border-indigo-500 transition-all font-medium min-h-[100px] content-start">
                           {certifications.map(cert => (
                              <div key={cert} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                                 {cert}
                                 <button onClick={() => removeCert(cert)} className="text-slate-400 hover:text-slate-600">
                                    <X size={12} />
                                 </button>
                              </div>
                           ))}
                           <input
                              type="text"
                              value={certInput}
                              onChange={e => setCertInput(e.target.value)}
                              onKeyDown={handleAddCert}
                              placeholder={certifications.length === 0 ? "자격증명을 입력하고 Enter를 누르세요" : "추가 입력 후 Enter..."}
                              className="bg-transparent outline-none text-xs flex-1 min-w-[150px] font-bold"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">핵심 업무 및 프로필 소개</label>
                        <textarea
                           value={description}
                           onChange={e => setDescription(e.target.value)}
                           className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:bg-white focus:outline-none focus:border-indigo-500 transition-all custom-scrollbar"
                           placeholder="회원들에게 노출될 담당자 프로필 소개나 핵심 관리 업무를 기재해주세요."
                        />
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button 
                onClick={prevStep}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> 이전 단계
              </button>
            ) : (
              <div /> // spacing placeholder
            )}

            <div className="flex items-center gap-3">
              {step === 3 ? (
                 <button 
                   onClick={() => {
                     alert('신규 직원이 등록되었습니다.');
                     if (onSaveStaff) {
                       onSaveStaff({
                         id: Math.floor(Math.random() * 1000) + 10,
                         name: staffName || '신규 직원',
                         role: role || 'TRAINER',
                         phone: phone || '010-0000-0000',
                         email: email || '',
                         gender: gender || 'M',
                         birthDate: birthDate || '1990-01-01',
                         status: 'ACTIVE',
                         assignedMembers: 0,
                         revenue: 0,
                         workHours: 0,
                         joinDate: hireDate || new Date().toISOString().split('T')[0],
                         description: description || ''
                       });
                     }
                     onClose();
                   }}
                   className="px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl shadow-lg shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-colors"
                 >
                   <Check size={16} /> 직원 최종 등록
                 </button>
              ) : (
                <button 
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  다음 단계 <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
