// 직원관리 데이터 통합 관리 전용 파일
export const STAFF_ROLES = {
  ADMIN: '관리자',
  MANAGER: '매니저',
  TRAINER: '트레이너',
} as const;

export interface Staff {
  id: number;
  name: string;
  role: keyof typeof STAFF_ROLES;
  phone: string;
  email: string;
  gender: string;
  birthDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  assignedMembers: number;
  revenue: number;
  workHours: number;
  joinDate: string;
  description: string;
}

export const MOCK_STAFF: Staff[] = [
  { id: 1, name: '김대표', role: 'ADMIN', phone: '010-1111-2222', email: 'ceo@awarefit.com', gender: 'M', birthDate: '1985-06-15', status: 'ACTIVE', assignedMembers: 15, revenue: 12500000, workHours: 180, joinDate: '2024-01-01', description: '센터 총괄 관리 및 VIP 회원 담당' },
  { id: 2, name: '이코치', role: 'TRAINER', phone: '010-3333-4444', email: 'lee@awarefit.com', gender: 'F', birthDate: '1992-09-21', status: 'ACTIVE', assignedMembers: 32, revenue: 8400000, workHours: 142, joinDate: '2025-03-15', description: '오전/오후 PT 전담' },
  { id: 3, name: '박매니저', role: 'MANAGER', phone: '010-5555-6666', email: 'park@awarefit.com', gender: 'M', birthDate: '1990-11-05', status: 'ACTIVE', assignedMembers: 0, revenue: 3200000, workHours: 160, joinDate: '2025-08-20', description: '신규 회원 상담 및 데스크 총괄' },
  { id: 4, name: '최트레이너', role: 'TRAINER', phone: '010-7777-8888', email: 'choi@awarefit.com', gender: 'M', birthDate: '1995-02-14', status: 'INACTIVE', assignedMembers: 0, revenue: 0, workHours: 0, joinDate: '2025-10-10', description: '주말 파트타임 (현재 휴직)' },
];
