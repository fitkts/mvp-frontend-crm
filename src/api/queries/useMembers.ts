import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { memberKeys } from './queryKeys';
import { Member } from '../../store'; // Adjust import if Member type moves

// ----------------------------------------------------------------------
// Fetch API Functions
// ----------------------------------------------------------------------

const fetchMembers = async (filters?: any): Promise<{ data: Member[], meta: any }> => {
  return await api.get('/members', { params: filters });
};

const fetchMemberById = async (id: number): Promise<{ data: Member }> => {
  return await api.get(`/members/${id}`);
};

const createMember = async (data: Partial<Member>): Promise<{ data: Member }> => {
  return await api.post('/members', data);
};

const updateMember = async ({ id, data }: { id: number; data: Partial<Member> }): Promise<{ data: Member }> => {
  return await api.put(`/members/${id}`, data);
};

const deleteMember = async (id: number): Promise<any> => {
  return await api.delete(`/members/${id}`);
};

// ----------------------------------------------------------------------
// React Query Hooks
// ----------------------------------------------------------------------

export const useMembers = (filters?: any) => {
  return useQuery({
    queryKey: memberKeys.list(filters),
    queryFn: () => fetchMembers(filters),
  });
};

export const useMember = (id: number) => {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => fetchMemberById(id),
    enabled: !!id,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
};
