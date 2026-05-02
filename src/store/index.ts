import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_STAFF, Staff } from '../lib/staffData';
import { MOCK_PRODUCTS, Product, ProductCategory } from '../lib/productData';

// ==========================================
// Types Derived From Prisma Schema
// ==========================================

export type StaffRole = 'ADMIN' | 'MANAGER' | 'TRAINER';
export type StaffStatus = 'ACTIVE' | 'INACTIVE';
export type MemberStatus = 'ACTIVE' | 'STOP' | 'EXPIRED';
export type PaymentStatus = 'COMPLETED' | 'UNPAID' | 'EXPIRED';
export type LockerStatus = 'AVAILABLE' | 'IN_USE' | 'EXPIRED' | 'MAINTENANCE';
export type LockerHistoryType = 'ASSIGN' | 'MAINTENANCE' | 'SYSTEM' | 'MEMO';
export type EventType = 'PT' | 'GROUP';
export type PayrollStatus = 'PENDING' | 'PAID';

export interface PaymentHistory {
  id: string;
  memberId?: number;
  date: string;
  product: string;
  sessions: number;
  basePrice: number;
  discountedPrice: number;
  method: string;
  installment: string;
  trainerId?: number;
  trainer?: string; // For backward compatibility with existing mock data
  locker?: string;
  status: PaymentStatus;
}

export interface Member {
  id: number;
  name: string;
  gender: string;
  phone: string;
  email?: string;
  status: MemberStatus;
  registrationDate: string;
  lastVisit?: string;
  goal?: string;
  attendance: number;
  totalPaid: number;
  recentPurchase?: string;
  remainingSessions: number;
  assignedTrainerId?: number;
  paymentHistories: PaymentHistory[];
}

export interface LockerHistoryItem {
  id: number;
  lockerId?: string;
  date: string;
  type: LockerHistoryType;
  desc: string;
}

export interface Locker {
  id: string;
  status: LockerStatus;
  memberId?: number;
  memberName?: string;
  startDate?: string;
  expireDate?: string;
  productId?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  memo?: string;
  history?: LockerHistoryItem[];
}

export interface Payroll {
  id: number;
  staffId?: number;
  name?: string; // using name temporarily instead of staffName for mock data compat
  role?: string;
  period?: string;
  baseSalary: number;
  incentive: number;
  total: number;
  status: PayrollStatus;
}

export interface Event {
  id: number;
  title: string;
  time: string;
  duration: string;
  trainerId?: number;
  trainer?: string; // using trainer string for mock data compat
  type: EventType | string;
  color: string;
}

// ==========================================
// Initial Mock Data
// ==========================================

const INITIAL_MEMBERS: Member[] = [
  { 
    id: 1, name: '강민준', gender: '남', phone: '010-3001-0001', status: 'ACTIVE', registrationDate: '2025-11-01', lastVisit: '2026-04-14', email: 'minjun@example.com', goal: '체지방 감량', attendance: 85, totalPaid: 1500000, recentPurchase: 'PT 프리미엄 20회', remainingSessions: 12, assignedTrainerId: 1,
    paymentHistories: [
      { id: 'pay_1', date: '2026.04.01', product: 'PT 프리미엄 20회', sessions: 20, basePrice: 1500000, discountedPrice: 1500000, method: '카드', installment: '일시불', trainer: '윤지성', locker: 'A-03 (30일)', status: 'COMPLETED' }
    ]
  },
  { 
    id: 2, name: '김지은', gender: '여', phone: '010-4002-0002', status: 'STOP', registrationDate: '2026-01-15', lastVisit: '2026-04-10', email: 'jieun@example.com', goal: '근력 증가', attendance: 62, totalPaid: 500000, recentPurchase: 'PT 베이직 10회', remainingSessions: 4, assignedTrainerId: 2,
    paymentHistories: [
      { id: 'pay_2', date: '2026.03.15', product: 'PT 베이직 10회', sessions: 10, basePrice: 600000, discountedPrice: 500000, method: '이체', installment: '없음', trainer: '이코치', locker: '미사용', status: 'COMPLETED' }
    ]
  },
  { 
    id: 3, name: '이도현', gender: '남', phone: '010-5003-0003', status: 'EXPIRED', registrationDate: '2025-08-20', lastVisit: '2026-03-20', email: 'dohyun@example.com', goal: '체력 증진', attendance: 45, totalPaid: 200000, recentPurchase: '헬스 3개월권', remainingSessions: 0, assignedTrainerId: 3,
    paymentHistories: [
      { id: 'pay_3', date: '2025.08.20', product: '헬스 3개월권', sessions: 0, basePrice: 200000, discountedPrice: 200000, method: '카드', installment: '3개월', trainer: '데스크', locker: 'B-01 (90일)', status: 'EXPIRED' }
    ]
  },
  { 
    id: 4, name: '박서연', gender: '여', phone: '010-6004-0004', status: 'ACTIVE', registrationDate: '2026-03-01', lastVisit: '2026-04-15', email: 'seoyeon@example.com', goal: '자세 교정', attendance: 92, totalPaid: 250000, recentPurchase: '그룹 필라테스 10회', remainingSessions: 8, assignedTrainerId: 2,
    paymentHistories: [
      { id: 'pay_4', date: '2026.03.01', product: '그룹 필라테스 10회', sessions: 10, basePrice: 250000, discountedPrice: 250000, method: '카드', installment: '일시불', trainer: '이코치', locker: '미사용', status: 'COMPLETED' }
    ]
  },
  { 
    id: 5, name: '정우성', gender: '남', phone: '010-7005-0005', status: 'STOP', registrationDate: '2025-12-10', lastVisit: '2026-02-28', email: 'woosung@example.com', goal: '재활', attendance: 30, totalPaid: 900000, recentPurchase: 'PT 프리미엄 20회', remainingSessions: 15, assignedTrainerId: 1,
    paymentHistories: [
      { id: 'pay_5', date: '2025.12.10', product: 'PT 프리미엄 20회', sessions: 20, basePrice: 1500000, discountedPrice: 900000, method: '복합', installment: '-', trainer: '김대표', locker: 'B-02 (30일)', status: 'UNPAID' }
    ]
  },
];

const INITIAL_EVENTS: Event[] = [
  { id: 1, title: 'PT: 강민준', time: '09:00', duration: '50분', trainer: '이코치', type: 'PT', color: 'bg-emerald-500' },
  { id: 2, title: '그룹 필라테스', time: '10:00', duration: '50분', trainer: '김필라', type: 'GROUP', color: 'bg-purple-500' },
  { id: 3, title: 'PT: 박서연', time: '11:00', duration: '50분', trainer: '이코치', type: 'PT', color: 'bg-emerald-500' },
  { id: 4, title: '요가 클래스', time: '14:00', duration: '60분', trainer: '최요가', type: 'GROUP', color: 'bg-blue-500' },
  { id: 5, title: 'PT: 이도현', time: '16:00', duration: '50분', trainer: '박트레이너', type: 'PT', color: 'bg-emerald-500' },
  { id: 6, title: '바디펌프', time: '19:00', duration: '50분', trainer: '정코치', type: 'GROUP', color: 'bg-orange-500' },
];

const INITIAL_PAYROLLS: Payroll[] = [
  { id: 1, name: '김대표', role: 'ADMIN', baseSalary: 3000000, incentive: 1500000, total: 4500000, status: 'PAID' },
  { id: 2, name: '이코치', role: 'TRAINER', baseSalary: 2000000, incentive: 3200000, total: 5200000, status: 'PENDING' },
  { id: 3, name: '박매니저', role: 'MANAGER', baseSalary: 2500000, incentive: 800000, total: 3300000, status: 'PENDING' },
  { id: 4, name: '최트레이너', role: 'TRAINER', baseSalary: 1800000, incentive: 2400000, total: 4200000, status: 'PENDING' },
];

const INITIAL_LOCKERS: Locker[] = [
  { id: 'A-01', status: 'AVAILABLE' },
  { id: 'A-02', status: 'IN_USE', memberName: '강민준', startDate: '2026-04-01', expireDate: '2026-05-01', productId: 6, paymentStatus: 'PAID', paymentMethod: 'CARD' },
  { id: 'A-03', status: 'EXPIRED', memberName: '이도현', startDate: '2025-12-01', expireDate: '2026-03-01' },
];

// ==========================================
// Zustand Store Definition
// ==========================================

export interface AppState {
  staff: Staff[];
  members: Member[];
  products: Product[];
  lockers: Locker[];
  events: Event[];
  payrolls: Payroll[];

  // Actions
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: number, data: Partial<Staff>) => void;
  deleteStaff: (id: number) => void;

  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: number, data: Partial<Member>) => void;
  deleteMember: (id: number) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, data: Partial<Product>) => void;
  deleteProduct: (id: number) => void;

  addLocker: (locker: Locker) => void;
  updateLocker: (id: string, data: Partial<Locker>) => void;
  deleteLocker: (id: string) => void;
  setLockers: (lockers: Locker[]) => void;

  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: number, data: Partial<Event>) => void;
  deleteEvent: (id: number) => void;

  addPayroll: (payroll: Omit<Payroll, 'id'>) => void;
  updatePayroll: (id: number, data: Partial<Payroll>) => void;
  deletePayroll: (id: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      staff: MOCK_STAFF,
      members: INITIAL_MEMBERS,
      products: MOCK_PRODUCTS,
      lockers: INITIAL_LOCKERS,
      events: INITIAL_EVENTS,
      payrolls: INITIAL_PAYROLLS,

      addStaff: (staffData) =>
        set((state) => ({
          staff: [...state.staff, { ...staffData, id: Math.max(0, ...state.staff.map(s => s.id)) + 1 }]
        })),
      updateStaff: (id, data) =>
        set((state) => ({
          staff: state.staff.map(s => s.id === id ? { ...s, ...data } : s)
        })),
      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter(s => s.id !== id)
        })),

      addMember: (memberData) =>
        set((state) => ({
          members: [{ ...memberData, id: Math.max(0, ...state.members.map(m => m.id)) + 1 }, ...state.members]
        })),
      updateMember: (id, data) =>
        set((state) => ({
          members: state.members.map(m => m.id === id ? { ...m, ...data } : m)
        })),
      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter(m => m.id !== id)
        })),

      addProduct: (productData) =>
        set((state) => ({
          products: [...state.products, { ...productData, id: Math.max(0, ...state.products.map(p => p.id)) + 1 }]
        })),
      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter(p => p.id !== id)
        })),

      addLocker: (lockerData) =>
        set((state) => ({
          lockers: [...state.lockers, lockerData]
        })),
      updateLocker: (id, data) =>
        set((state) => ({
          lockers: state.lockers.map(l => l.id === id ? { ...l, ...data } : l)
        })),
      deleteLocker: (id) =>
        set((state) => ({
          lockers: state.lockers.filter(l => l.id !== id)
        })),
      setLockers: (lockers) =>
        set(() => ({ lockers })),

      addEvent: (eventData) =>
        set((state) => ({
          events: [...state.events, { ...eventData, id: Math.max(0, ...state.events.map(e => e.id)) + 1 }]
        })),
      updateEvent: (id, data) =>
        set((state) => ({
          events: state.events.map(e => e.id === id ? { ...e, ...data } : e)
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter(e => e.id !== id)
        })),

      addPayroll: (payrollData) =>
        set((state) => ({
          payrolls: [...state.payrolls, { ...payrollData, id: Math.max(0, ...state.payrolls.map(p => p.id)) + 1 }]
        })),
      updatePayroll: (id, data) =>
        set((state) => ({
          payrolls: state.payrolls.map(p => p.id === id ? { ...p, ...data } : p)
        })),
      deletePayroll: (id) =>
        set((state) => ({
          payrolls: state.payrolls.filter(p => p.id !== id)
        })),
    }),
    {
      name: 'awarefit-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
        staff: state.staff,
        members: state.members,
        products: state.products,
        lockers: state.lockers,
        events: state.events,
        payrolls: state.payrolls,
      }), // Save specific state items
    }
  )
);
