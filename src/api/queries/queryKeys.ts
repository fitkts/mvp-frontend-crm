// ==========================================
// React Query Key Factories
// ==========================================

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (filters?: object) => [...memberKeys.lists(), filters] as const,
  detail: (id: number) => [...memberKeys.all, 'detail', id] as const,
};

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters?: object) => [...staffKeys.lists(), filters] as const,
  detail: (id: number) => [...staffKeys.all, 'detail', id] as const,
};

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: object) => [...productKeys.lists(), filters] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

export const lockerKeys = {
  all: ['lockers'] as const,
  lists: () => [...lockerKeys.all, 'list'] as const,
  list: (filters?: object) => [...lockerKeys.lists(), filters] as const,
  detail: (id: string) => [...lockerKeys.all, 'detail', id] as const,
  history: (id: string) => [...lockerKeys.all, 'history', id] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: object) => [...paymentKeys.lists(), filters] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  byMember: (memberId: number) => [...paymentKeys.all, 'byMember', memberId] as const,
};

export const payrollKeys = {
  all: ['payrolls'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (filters?: object) => [...payrollKeys.lists(), filters] as const,
  detail: (id: number) => [...payrollKeys.all, 'detail', id] as const,
};

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: object) => [...eventKeys.lists(), filters] as const,
  detail: (id: number) => [...eventKeys.all, 'detail', id] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
};
