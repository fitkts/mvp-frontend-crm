import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { staffKeys } from './queryKeys';
export type { Staff } from '../../lib/staffData';

const fetchStaff = async (filters?: any): Promise<{ data: Staff[], meta: any }> => {
  return await api.get('/staff', { params: filters });
};

const fetchStaffById = async (id: number): Promise<{ data: Staff }> => {
  return await api.get(`/staff/${id}`);
};

const createStaff = async (data: Partial<Staff>): Promise<{ data: Staff }> => {
  return await api.post('/staff', data);
};

const updateStaff = async ({ id, data }: { id: number; data: Partial<Staff> }): Promise<{ data: Staff }> => {
  return await api.put(`/staff/${id}`, data);
};

const deleteStaff = async (id: number): Promise<any> => {
  return await api.delete(`/staff/${id}`);
};

export const useStaffList = (filters?: any) => {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: () => fetchStaff(filters),
  });
};

export const useStaffDetail = (id: number) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => fetchStaffById(id),
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStaff,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
};
