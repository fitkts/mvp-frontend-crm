// 상품 데이터 통합 관리 전용 파일
export type ProductCategory = 'PT' | 'MEMBERSHIP' | 'PILATES' | 'LOCKER' | 'ETC';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  sessionCnt: number; // -1 for unlimited
  validDays: number;
  isActive: boolean;
  description: string;
  // Options for specific categories
  ptDuration?: string;
  ptLevel?: string;
  membershipAccess?: string[];
  lockerSection?: string;
  lockerSize?: string;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'PT 베이직 10회', category: 'PT', price: 500000, sessionCnt: 10, validDays: 90, isActive: true, description: '기본적인 체력 증진 및 자세 교정을 위한 1:1 PT', ptDuration: '50', ptLevel: 'Senior' },
  { id: 2, name: 'PT 프리미엄 20회', category: 'PT', price: 900000, sessionCnt: 20, validDays: 180, isActive: true, description: '체계적인 다이어트 및 근력 강화를 위한 프리미엄 코스', ptDuration: '50', ptLevel: 'Master' },
  { id: 3, name: '헬스 1개월권', category: 'MEMBERSHIP', price: 80000, sessionCnt: -1, validDays: 30, isActive: true, description: '센터의 모든 시설을 자유롭게 이용 가능한 1개월권', membershipAccess: ['Gym'] },
  { id: 4, name: '헬스 3개월권', category: 'MEMBERSHIP', price: 200000, sessionCnt: -1, validDays: 90, isActive: true, description: '가장 인기 있는 실속형 3개월 회원권', membershipAccess: ['Gym', 'Sauna'] },
  { id: 5, name: '그룹 필라테스 10회', category: 'PILATES', price: 250000, sessionCnt: 10, validDays: 60, isActive: true, description: '유연성 및 코어 강화를 위한 소그룹 필라테스' },
  { id: 6, name: '개인 사물함 3개월', category: 'LOCKER', price: 30000, sessionCnt: -1, validDays: 90, isActive: true, description: '운동 용품을 안전하게 보관할 수 있는 개인 전용 사물함', lockerSection: 'A', lockerSize: 'Standard' },
  { id: 7, name: '1일 체험권', category: 'ETC', price: 15000, sessionCnt: 1, validDays: 1, isActive: false, description: '센터 시설을 하루 동안 미리 체험해 볼 수 있는 이용권' },
];

export const CATEGORIES = [
  { id: 'PT', label: '1:1 PT' },
  { id: 'MEMBERSHIP', label: '회원권' },
  { id: 'PILATES', label: '필라테스' },
  { id: 'LOCKER', label: '사물함' },
  { id: 'ETC', label: '기타' },
] as const;
