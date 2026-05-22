import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Staff } from '../lib/staffData';
import { Product } from '../lib/productData';

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
// Zustand Store Definition
// ==========================================

export interface AppState {
  staff: Staff[];
  products: Product[];
  lockers: Locker[];
  events: Event[];
  payrolls: Payroll[];

  // Actions
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: number, data: Partial<Staff>) => void;
  deleteStaff: (id: number) => void;

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
      staff: [],
      products: [],
      lockers: [],
      events: [],
      payrolls: [],

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
        products: state.products,
        lockers: state.lockers,
        events: state.events,
        payrolls: state.payrolls,
      }), // Save specific state items
    }
  )
);
